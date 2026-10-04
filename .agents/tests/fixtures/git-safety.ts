import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, lstatSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { inspectGitState, type GitRequest, type Bytes } from '../../scripts/git-preflight.ts';
import { digest } from '../../scripts/validate-doc-package.ts';
export function git(root: string, args: string[]): string {
  const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});
  if(r.error||r.status!==0)throw Error(`Fixture git ${args[0]}: ${r.stderr}`); return r.stdout.trim();
}
export function fixture() {
  const root=mkdtempSync(join(tmpdir(),'tophat-git-safety-'));
  git(root,['init','-q','--initial-branch=development']);git(root,['config','user.name','Fixture']);git(root,['config','user.email','fixture@example.invalid']);
  writeFileSync(join(root,'product.txt'),'baseline\n');git(root,['add','--','product.txt']);git(root,['commit','-qm','baseline']);
  return {root,close:()=>rmSync(root,{recursive:true,force:true})};
}
export function request(root:string,operation:GitRequest['operation']='stage',extraPaths:string[]=[]):GitRequest {
  const s=inspectGitState(root,extraPaths);
  return {schemaVersion:1,operation,repositoryRoot:root,workflow:'synthetic-fixture',expectedBranch:s.branch,expectedHead:s.head,expectedIndexFingerprint:s.indexFingerprint,
    intended:['stage','commit','git-integration'].includes(operation)?s.files.map(f=>({path:f.path,before:f.head,after:f.current})):[],remote:null,target:null,conflict:null,integration:null};
}
export function metadata(root:string,kind:'hook'|'exclude'):Bytes|null {
  const full=resolve(root,git(root,['rev-parse','--git-path',kind==='hook'?'hooks/pre-commit':'info/exclude']));
  try {const st=lstatSync(full);return {sha256:digest(readFileSync(full)),mode:st.mode&0o111?'100755':'100644'};}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}
}
export function hookRequest(root:string,extraPaths:string[]=[]):GitRequest {
  const r=request(root,'git-integration',extraPaths);
  r.integration={kind:'hook',before:metadata(root,'hook'),after:{sha256:digest(readFileSync(join(root,'.agents/git-hooks/pre-commit'))),mode:'100755'},signal:'APPROVED',human:'Synthetic fixture',locator:'fixture:hook-approval'};
  return r;
}
