import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, rmSync, chmodSync, symlinkSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { gitPreflight, inspectGitState, readGit, verifyBranchResult, verifyCommitResult, verifyRemoteResult, type GitRequest, type GitReader } from '../scripts/git-preflight.ts';
import { installGitHook } from '../scripts/install-git-hook.ts';
import { digest } from '../scripts/validate-doc-package.ts';
import { fixture, git, request, metadata } from './fixtures/git-safety.ts';
function run(fn:(root:string)=>void) {const f=fixture();try{fn(f.root);}finally{f.close();}}
function allow(r:GitRequest) {const v=gitPreflight(r);assert.equal(v.decision,'ALLOW',JSON.stringify(v.issues));return v;}
function deny(r:any,code?:string) {const v=gitPreflight(r);assert.equal(v.decision,'DENY');if(code)assert.equal(v.code,code);return v;}
function change(root:string,text='modified\n') {writeFileSync(join(root,'product.txt'),text);}
function remote(root:string) {
  const bare=join(root,'../remote-'+Date.now()+Math.random());git(root,['init','-q','--bare',bare]);git(root,['remote','add','origin',bare]);
  return {name:'origin',fetchUrlSha256:digest(bare),pushUrlSha256:digest(bare),destinationBranch:'development'};
}
function merge(root:string) {
  git(root,['checkout','-qb','incoming']);change(root,'incoming\n');writeFileSync(join(root,'incoming.txt'),'clean incoming\n');git(root,['add','--','product.txt','incoming.txt']);git(root,['commit','-qm','incoming']);
  git(root,['checkout','development']);change(root,'feature\n');git(root,['add','--','product.txt']);git(root,['commit','-qm','feature']);
  assert.notEqual(spawnSync('git',['merge','incoming'],{cwd:root}).status,0);
  const baseline=inspectGitState(root);
  return {signal:'APPROVED' as const,human:'Synthetic fixture',locator:'fixture:resolve',baseline};
}
test('clean branch creation and explicit resume verify resulting branch identity',()=>run(root=>{
  const r=request(root,'create-branch');r.target={branch:'feature/task',commit:r.expectedHead};allow(r);
  git(root,['checkout','-qb',r.target.branch,r.target.commit]);verifyBranchResult(inspectGitState(root),'feature/task',r.target.commit);
  const resume=request(root,'switch');resume.target={branch:'development',commit:r.expectedHead};allow(resume);
  git(root,['checkout','development']);verifyBranchResult(inspectGitState(root),'development',r.expectedHead);
}));
test('existing branch never becomes branch creation after failure',()=>run(root=>{const r=request(root,'create-branch');r.target={branch:'development',commit:r.expectedHead};deny(r,'GIT_BRANCH_EXISTS');assert.equal(git(root,['branch','--list']).trim(),'* development');}));
test('missing or moved resume branch denies rather than creating',()=>run(root=>{const r=request(root,'switch');r.target={branch:'feature/missing',commit:r.expectedHead};deny(r,'GIT_TARGET_MISMATCH');}));
test('exact stage and commit accept only intended bytes, then verify parents and entire commit delta',()=>run(root=>{
  change(root);const r=request(root);allow(r);git(root,['--literal-pathspecs','add','--','product.txt']);const c=request(root,'commit');allow(c);const before=inspectGitState(root);git(root,['commit','-qm','bounded']);verifyCommitResult(root,before,c.intended);
}));
test('partially staged content and index drift deny',()=>run(root=>{change(root,'first\n');git(root,['add','--','product.txt']);change(root,'second\n');deny(request(root),'GIT_INDEX_STALE');const r=request(root,'commit');r.expectedIndexFingerprint='0'.repeat(64);deny(r,'GIT_INDEX_STALE');}));
test('unrelated staged and untracked changes cannot be included by an old plan',()=>run(root=>{change(root);const r=request(root);writeFileSync(join(root,'surprise.txt'),'secret\n');deny(r,'GIT_UNEXPECTED_CHANGE');git(root,['add','--','surprise.txt']);deny(r,'GIT_INDEX_STALE');}));
test('staged-only change with reverted worktree remains dirty',()=>run(root=>{change(root);git(root,['add','--','product.txt']);change(root,'baseline\n');const r=request(root,'push');r.remote=remote(root);deny(r,'GIT_DIRTY_STATE');}));
test('wrong branch, wrong HEAD and subdirectory deny',()=>run(root=>{const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};r.expectedBranch='other';deny(r,'GIT_BRANCH_MISMATCH');r.expectedBranch='development';r.expectedHead='0'.repeat(40);deny(r,'GIT_HEAD_MISMATCH');mkdirSync(join(root,'sub'));r.repositoryRoot=join(root,'sub');deny(r,'GIT_ROOT_MISMATCH');}));
test('detached and unborn HEAD deny visibly',()=>run(root=>{const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};git(root,['checkout','--detach']);deny(r,'GIT_HEAD_DETACHED');git(root,['checkout','--orphan','unborn']);deny(r);}));
test('bare repository is not a mutation worktree',()=>run(root=>{const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};const b=join(root,'../bare-'+Math.random());git(root,['init','-q','--bare',b]);try{r.repositoryRoot=b;deny(r,'GIT_ROOT_MISMATCH');}finally{rmSync(b,{recursive:true,force:true});}}));
test('linked worktree uses its own HEAD and operation metadata',()=>run(root=>{
  const linked=join(root,'../linked-'+Math.random());git(root,['worktree','add','-qb','feature/linked',linked]);try{const r=request(linked,'switch');r.target={branch:'feature/linked',commit:r.expectedHead};allow(r);writeFileSync(resolve(linked,git(linked,['rev-parse','--git-path','CHERRY_PICK_HEAD'])),r.expectedHead+'\n');deny(r,'GIT_OPERATION_ACTIVE');}finally{git(root,['worktree','remove','--force',linked]);}
}));
test('fetch and nonforce push use declared exact remote identities and observed ref',()=>run(root=>{
  const identity=remote(root);const push=request(root,'push');push.remote=identity;allow(push);git(root,['push','origin','HEAD:refs/heads/development']);verifyRemoteResult(git(root,['ls-remote','origin','refs/heads/development']).split(/\s/)[0],push.expectedHead);
  const fetch=request(root,'fetch');fetch.remote=identity;fetch.target={branch:'development',commit:fetch.expectedHead};allow(fetch);git(root,['fetch','origin','refs/heads/development:refs/remotes/origin/development']);assert.equal(git(root,['rev-parse','refs/remotes/origin/development']),fetch.target.commit);
  rmSync(git(root,['remote','get-url','origin']),{recursive:true,force:true});
}));
test('remote configuration changes and ambiguous push URLs deny without exposing secrets',()=>run(root=>{const r=request(root,'push');r.remote=remote(root);git(root,['remote','set-url','origin','https://user:secret@example.invalid/repo']);const v=deny(r,'GIT_REMOTE_MISMATCH');assert.ok(!JSON.stringify(v).includes('secret'));git(root,['remote','set-url','origin','/missing']);git(root,['remote','set-url','--add','--push','origin','/one']);git(root,['remote','set-url','--add','--push','origin','/two']);deny(r,'GIT_REMOTE_MISMATCH');}));
test('missing remote and differing push destination deny',()=>run(root=>{const r=request(root,'push');r.remote={name:'missing',fetchUrlSha256:'0'.repeat(64),pushUrlSha256:'0'.repeat(64),destinationBranch:'development'};deny(r,'GIT_INSPECTION_FAILED');r.remote=remote(root);r.remote.destinationBranch='other';deny(r,'GIT_TARGET_MISMATCH');}));
test('actual non-fast-forward rejection preserves local HEAD without force retry',()=>run(root=>{
  const identity=remote(root);git(root,['push','origin','HEAD:refs/heads/development']);const baseline=git(root,['rev-parse','HEAD']);change(root,'one\n');git(root,['add','--','product.txt']);git(root,['commit','-qm','remote advance']);git(root,['push','origin','HEAD:refs/heads/development']);git(root,['checkout','-qb','old',baseline]);change(root,'two\n');git(root,['add','--','product.txt']);git(root,['commit','-qm','diverge']);const head=git(root,['rev-parse','HEAD']);assert.notEqual(spawnSync('git',['push','origin','HEAD:refs/heads/development'],{cwd:root}).status,0);assert.equal(git(root,['rev-parse','HEAD']),head);rmSync(git(root,['remote','get-url','origin']),{recursive:true,force:true});
}));
test('literal pathspec names are staged as exact files; Windows and traversal forms deny',()=>run(root=>{
  const name=':(glob)special name.txt';writeFileSync(join(root,name),'safe\n');const r=request(root);allow(r);git(root,['--literal-pathspecs','add','--',name]);allow(request(root,'commit'));
  for(const path of ['../escape','C:/escape','C:\\escape','.git/config','docs\\a.txt','line\nname']){const bad=structuredClone(r);bad.intended[0].path=path;deny(bad,path==='line\nname'?'GIT_INPUT_INVALID':'GIT_PATH_INVALID');}
}));
test('case-fold collisions and symlink mutation paths deny',()=>run(root=>{writeFileSync(join(root,'Readme.md'),'one');writeFileSync(join(root,'README.md'),'two');assert.throws(()=>request(root),/collide/);rmSync(join(root,'Readme.md'));rmSync(join(root,'README.md'));symlinkSync('product.txt',join(root,'link'));assert.throws(()=>request(root),/Symlink/);}));
test('submodule drift is denied even with ignore=all',()=>run(root=>{
  const sub=fixture();try{git(root,['-c','protocol.file.allow=always','submodule','add',sub.root,'module']);git(root,['commit','-qam','submodule']);git(root,['config','submodule.module.ignore','all']);writeFileSync(join(root,'module/product.txt'),'dirty\n');const r:GitRequest={...request(sub.root,'switch'),repositoryRoot:root,expectedBranch:'development',expectedHead:git(root,['rev-parse','HEAD']),target:{branch:'development',commit:git(root,['rev-parse','HEAD'])}};deny(r,'GIT_PATH_UNSUPPORTED');}finally{sub.close();}
}));
test('binary bytes, executable mode, create/delete and rename endpoints are exact',()=>run(root=>{
  rmSync(join(root,'product.txt'));writeFileSync(join(root,'renamed.bin'),Buffer.from([0,1,255,5]));chmodSync(join(root,'renamed.bin'),0o755);const r=request(root);assert.deepEqual(r.intended.map(f=>f.path),['product.txt','renamed.bin']);allow(r);git(root,['add','--','product.txt','renamed.bin']);const c=request(root,'commit');allow(c);const before=inspectGitState(root);git(root,['commit','-qm','rename']);verifyCommitResult(root,before,c.intended);
}));
test('ordinary profile denies merge conflict; nominated exception binds all index entries',()=>run(root=>{
  const c=merge(root);const r=request(root,'resolve-conflict');deny(r,'GIT_OPERATION_ACTIVE');r.conflict=c;allow(r);r.conflict=structuredClone(c);r.conflict.baseline.fingerprint='0'.repeat(64);deny(r,'GIT_SNAPSHOT_STALE');
}));
test('authorized conflict edits preserve incoming staged files and commit both parents',()=>run(root=>{
  const c=merge(root);change(root,'both contracts\n');const stage=request(root);stage.conflict=c;allow(stage);git(root,['add','--','product.txt']);const commit=request(root,'commit');commit.conflict=c;allow(commit);const before=inspectGitState(root);git(root,['commit','-qm','explicit resolution']);verifyCommitResult(root,before,commit.intended);assert.equal(readFileSync(join(root,'incoming.txt'),'utf8'),'clean incoming\n');
}));
test('conflict exception rejects unrelated incoming modifications and unknown conflicts',()=>run(root=>{const c=merge(root);change(root,'resolved\n');writeFileSync(join(root,'incoming.txt'),'smuggled');const r=request(root);r.conflict=c;deny(r,'GIT_CONFLICT_MISMATCH');}));
test('unresolved conflict cannot be committed and altered merge parent denies',()=>run(root=>{const c=merge(root);const r=request(root,'commit');r.conflict=c;deny(r,'GIT_CONFLICT_UNRESOLVED');writeFileSync(join(root,'.git/MERGE_HEAD'),'0'.repeat(40)+'\n');const resolveRequest=request(root,'resolve-conflict');resolveRequest.conflict=c;deny(resolveRequest,'GIT_CONFLICT_MISMATCH');}));
test('every other active operation marker denies normal profiles',()=>run(root=>{for(const name of ['rebase-merge','rebase-apply','CHERRY_PICK_HEAD','REVERT_HEAD','sequencer']){const p=join(root,'.git',name);writeFileSync(p,'marker');const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};deny(r,'GIT_OPERATION_ACTIVE');rmSync(p);}}));
test('Git integration binds prior hook/exclude bytes and exact approved changes',()=>run(root=>{const r=request(root,'git-integration');r.integration={kind:'exclude',before:metadata(root,'exclude'),after:{sha256:digest('appended'),mode:'100644'},signal:'APPROVED',human:'Fixture',locator:'fixture:exclude'};allow(r);writeFileSync(join(root,'.git/info/exclude'),'other rules');deny(r,'GIT_INTEGRATION_STALE');}));
test('nominated ignored inputs are fingerprinted without broadly scanning ignored trees',()=>run(root=>{writeFileSync(join(root,'.gitignore'),'private/\n');git(root,['add','--','.gitignore']);git(root,['commit','-qm','ignore']);mkdirSync(join(root,'private'));writeFileSync(join(root,'private/input'),'approved');const r=request(root,'git-integration',['private/input']);r.integration={kind:'exclude',before:metadata(root,'exclude'),after:metadata(root,'exclude'),signal:'APPROVED',human:'Fixture',locator:'fixture:input'};allow(r);writeFileSync(join(root,'private/input'),'drift');deny(r,'GIT_BYTES_STALE');}));
test('closed input rejects unknown fields, profile mismatches and missing explicit approval',()=>run(root=>{const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};deny({...r,allowDirty:true},'GIT_INPUT_INVALID');deny({...r,target:null},'GIT_INPUT_INVALID');const i=request(root,'git-integration');i.integration={kind:'hook',before:null,after:null,signal:'NO' as any,human:'Fixture',locator:'fixture:no'};deny(i,'GIT_AUTHORIZATION_REQUIRED');}));
test('preflight and denied CLI leave HEAD/index/working files unchanged; duplicate JSON denies',()=>run(root=>{
  const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};const before=inspectGitState(root);const first=allow(r);assert.equal(allow(r).stateFingerprint,first.stateFingerprint);assert.deepEqual(inspectGitState(root),before);
  const script=resolve('.agents/scripts/git-preflight.ts');const cli=spawnSync(process.execPath,[script],{input:JSON.stringify(r),encoding:'utf8'});assert.equal(cli.status,0,cli.stderr);const duplicate=spawnSync(process.execPath,[script],{input:JSON.stringify(r).replace('"schemaVersion":1','"schemaVersion":1,"schemaVersion":1'),encoding:'utf8'});assert.notEqual(duplicate.status,0);assert.equal(JSON.parse(duplicate.stdout).decision,'DENY');assert.deepEqual(inspectGitState(root),before);
}));
test('inspection failure and bounded timeout/output signals deny, with no mutation adapter',()=>run(root=>{
  const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};for(const message of ['spawn failure','timeout','output limit']){const calls:string[][]=[];const reader:GitReader=(root,args)=>{calls.push(args);throw Error(message);};denyWith(reader);assert.equal(calls.length,1);function denyWith(reader:GitReader){assert.equal(gitPreflight(r,reader).decision,'DENY');}}
  assert.equal(inspectGitState(root).head,r.expectedHead);
}));
test('stale byte, mode, branch and HEAD plans deny before another action',()=>run(root=>{change(root);const r=request(root);change(root,'later');deny(r,'GIT_BYTES_STALE');change(root);chmodSync(join(root,'product.txt'),0o755);deny(r,'GIT_BYTES_STALE');chmodSync(join(root,'product.txt'),0o644);git(root,['checkout','-qb','other']);deny(r,'GIT_BRANCH_MISMATCH');}));
test('postconditions reject wrong branch, remote identity, parents and complete committed delta',()=>run(root=>{
  const s=inspectGitState(root);assert.throws(()=>verifyBranchResult(s,'wrong',s.head));assert.throws(()=>verifyRemoteResult(null,s.head),/unavailable/);assert.throws(()=>verifyRemoteResult('wrong',s.head),/differs/);change(root);const r=request(root);git(root,['add','--','product.txt']);writeFileSync(join(root,'extra'),'extra');git(root,['add','--','extra']);git(root,['commit','-qm','smuggled']);assert.throws(()=>verifyCommitResult(root,s,r.intended),/paths differ/);
}));
test('failed real fetch, checkout and commit commands preserve actual state without fallback',()=>run(root=>{
  const head=git(root,['rev-parse','HEAD']);for(const args of [['fetch','/nonexistent-remote'],['checkout','missing-branch'],['-c','user.name=','commit','--allow-empty','-m','invalid identity']]){assert.notEqual(spawnSync('git',args,{cwd:root}).status,0);assert.equal(git(root,['rev-parse','HEAD']),head);}assert.equal(git(root,['branch','--list']).trim(),'* development');
}));
test('SHA-256 repositories validate their own object format',()=>{
  const root=mkdtempSync(join(tmpdir(),'tophat-sha256-'));try{git(root,['init','-q','--object-format=sha256','--initial-branch=development']);git(root,['config','user.name','Fixture']);git(root,['config','user.email','fixture@example.invalid']);writeFileSync(join(root,'a'),'a');git(root,['add','--','a']);git(root,['commit','-qm','baseline']);const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};assert.equal(r.expectedHead.length,64);allow(r);r.expectedHead='0'.repeat(40);deny(r,'GIT_INPUT_INVALID');}finally{rmSync(root,{recursive:true,force:true});}
});
test('skip-worktree, assume-unchanged and intent-to-add cannot hide dirty state',()=>run(root=>{
  const r=request(root,'switch');r.target={branch:'development',commit:r.expectedHead};
  for(const flag of ['--skip-worktree','--assume-unchanged']){git(root,['update-index',flag,'product.txt']);change(root,'hidden');deny(r,'GIT_INDEX_UNSUPPORTED');git(root,['update-index',flag==='--skip-worktree'?'--no-skip-worktree':'--no-assume-unchanged','product.txt']);change(root,'baseline\n');}
  writeFileSync(join(root,'new'),'new');git(root,['add','-N','--','new']);deny(r);
}));
test('required file and input limits deny without mutating a large file',()=>run(root=>{
  writeFileSync(join(root,'large.bin'),Buffer.alloc(33*1024*1024));const r:GitRequest={schemaVersion:1,operation:'switch',repositoryRoot:root,workflow:'fixture',expectedBranch:'development',expectedHead:git(root,['rev-parse','HEAD']),expectedIndexFingerprint:null,intended:[],remote:null,target:{branch:'development',commit:git(root,['rev-parse','HEAD'])},conflict:null,integration:null};deny(r,'GIT_INSPECTION_LIMIT');
  const cli=spawnSync(process.execPath,[resolve('.agents/scripts/git-preflight.ts')],{input:' '.repeat(1024*1024+1),encoding:'utf8'});assert.notEqual(cli.status,0);assert.equal(readFileSync(join(root,'large.bin')).length,33*1024*1024);
}));
test('real subprocess timeout and output cap are enforced by the read-only Git reader',()=>run(root=>{
  const bin=mkdtempSync(join(tmpdir(),'tophat-fake-git-')), oldPath=process.env.PATH;
  try{
    const executable=join(bin,'git');writeFileSync(executable,`#!${process.execPath}\nif(process.argv.includes('hang'))setTimeout(()=>{},20000);else process.stdout.write(Buffer.alloc(20*1024*1024));\n`);chmodSync(executable,0o755);process.env.PATH=bin+':'+oldPath;
    assert.throws(()=>readGit(root,['hang']),e=>(e as any).code==='GIT_INSPECTION_TIMEOUT');
    assert.throws(()=>readGit(root,['output']),e=>(e as any).code==='GIT_INSPECTION_LIMIT');
  }finally{process.env.PATH=oldPath;rmSync(bin,{recursive:true,force:true});}
}));
test('untracked unrelated work in an approved merge baseline still denies resolution',()=>run(root=>{
  merge(root);writeFileSync(join(root,'unrelated'),'unrelated');const r=request(root,'resolve-conflict');r.conflict={signal:'APPROVED',human:'Fixture',locator:'fixture:bad-baseline',baseline:inspectGitState(root)};deny(r,'GIT_CONFLICT_MISMATCH');
}));
test('explicit merge reconciliation may choose unchanged feature bytes while retaining incoming delta',()=>run(root=>{
  const c=merge(root);change(root,'feature\n');const stage=request(root);stage.conflict=c;allow(stage);git(root,['add','--','product.txt']);const commit=request(root,'commit');commit.conflict=c;assert.deepEqual(commit.intended.map(f=>f.path),['incoming.txt']);allow(commit);const before=inspectGitState(root);git(root,['commit','-qm','retain feature contract']);verifyCommitResult(root,before,commit.intended);
}));
