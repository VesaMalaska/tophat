import { mkdirSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fixture as docFixture, approve } from '../documentation/fixture.ts';
import { digest } from '../../../scripts/validate-doc-package.ts';
import { discover as inspect, fingerprint, fileState, installationInfrastructure, type Proposal, type Ownership } from '../../../scripts/inspect-workspace-attachment.ts';
import { assessAttachment } from '../../../scripts/assess-attachment-baseline.ts';
import { validateAttachment, verifyAttached, exclusionBlock } from '../../../scripts/validate-workspace-attachment.ts';
import { hookRequest } from '../git-safety.ts';
import { installGitHook } from '../../../scripts/install-git-hook.ts';
const vault=resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
export function command(root:string,args:string[]):string {const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.stderr);return r.stdout.trim();}
export function host(script='node -e "console.log(\'unit passed\')"', mode:'tracked/shared'|'local/private'='tracked/shared') {
  const f=docFixture();approve(f.root);const root=f.root;
  const candidate=JSON.parse(readFileSync(join(root,'.agents/tophat.config.json'),'utf8'));candidate.routingMatrix=JSON.parse(readFileSync(join(vault,'.agents/tophat.config.json'),'utf8')).routingMatrix;rmSync(join(root,'.agents/tophat.config.json'));
  writeFileSync(join(root,'package.json'),JSON.stringify({name:'attachment-fixture',version:'1.0.0',packageManager:'pnpm@11.25.0',devDependencies:{typescript:'5.9.3'},scripts:{'test:unit':script}},null,2)+'\n');
  writeFileSync(join(root,'pnpm-lock.yaml'),'lockfileVersion: 9.0\n');writeFileSync(join(root,'.gitignore'),'coverage/\n');writeFileSync(join(root,'product.ts'),'export const health = () => "ok";\n');
  command(root,['init','--initial-branch=development']);command(root,['config','user.name','Fixture']);command(root,['config','user.email','fixture@example.invalid']);command(root,['add','.']);command(root,['commit','-m','Existing product baseline']);
  const hook=readFileSync(join(vault,'.agents/git-hooks/pre-commit'),'utf8');
  const docs=JSON.parse(readFileSync(join(root,'docs/project/manifest.json'),'utf8'));
  const boundary={scopeIds:['core'],developmentPhaseId:'phase-1',sprintChunkId:'chunk-1'};
  const context={packageId:docs.packageId,packageVersion:docs.version,authorityFingerprint:docs.approvedAuthorityFingerprint,...boundary};
  const content:Record<string,string>={'.agents/tophat.config.json':JSON.stringify(candidate,null,2)+'\n','Context.md':'# Private Context\nApproved scope: core\n','Strategy.md':'# Private Strategy\nApproved health service\n','HUD.md':'# Private HUD\nAttachment awaiting verification\n',
    'Roadmap.md':`# Private Roadmap\n\n### [ACTIVE_SPRINT_CHUNK]\n\n\`\`\`json\n${JSON.stringify({authorityContext:context},null,2)}\n\`\`\`\n\n### [UPCOMING_CHUNKS]\n`,
    '.agents/git-hooks/pre-commit':hook,'.agents/scripts/run-validation.ts':readFileSync(join(vault,'.agents/scripts/run-validation.ts'),'utf8'),'.agents/scripts/load-tophat-config.ts':readFileSync(join(vault,'.agents/scripts/load-tophat-config.ts'),'utf8')};
  for(const path of installationInfrastructure())content[path]=readFileSync(join(vault,path),'utf8');
  const ownership=Object.keys(content).map(path=>({path,classification:'TOPHAT_OWNED_PRIVATE',evidence:'Human-confirmed exact private fixture inventory',tracked:false,initialSha256:null}));
  const writePlan=Object.entries(content).map(([path,content])=>({path,operation:'create',priorSha256:null,content,sha256:digest(content)}));
  const input={proposalId:'fixture-1',sourceCommit:'28d6b2eb039762a772975aaa151f6ded305fda62',candidateConfig:candidate,inputPaths:[],outputPaths:['coverage'],timeoutMs:10000,maxBufferBytes:65536,prerequisites:[],sideEffects:['Coverage output is disposable; scripts are not sandboxed'],
    installation:{mode,exclusions:mode==='local/private'?Object.keys(content):[],hookDisposition:'install',hookContent:hook},ownership,writePlan,developmentBoundary:boundary,blockers:[],humanDecisions:[]};
  const proposal=()=>{const r=inspect(root,input);if(!r.proposal||r.issues.length)throw Error(JSON.stringify(r));return r.proposal;};
  return {...f,input,proposal};
}
export function authorization(p:Proposal){return {schemaVersion:1,proposalId:p.proposalId,proposalFingerprint:p.proposalFingerprint,hostSnapshotFingerprint:p.hostSnapshotFingerprint,scripts:p.baseline.scripts.map(({category,script})=>({category,script})),human:'Synthetic fixture human',authorizedAt:new Date(Math.max(Date.now(),Date.parse(p.createdAt))+1).toISOString(),evidenceLocator:'fixture-transcript:baseline-authorization'};}
export function assessed(root:string,p:Proposal){const a=authorization(p); // allow test timestamps to settle before recording real assessment time
  a.authorizedAt=p.createdAt;const r=assessAttachment(root,{proposal:p,authorization:a});return {authorization:a,assessment:r};}
export function approval(p:Proposal,r:Record<string,any>){return {schemaVersion:1,proposalId:p.proposalId,proposalFingerprint:p.proposalFingerprint,assessmentFingerprint:r.assessmentFingerprint,hostSnapshotFingerprint:p.hostSnapshotFingerprint,authorityFingerprint:p.documentation.authorityFingerprint,candidateFingerprint:p.documentation.candidateFingerprint,installationMode:p.installation.mode,signal:'APPROVED',human:'Synthetic fixture human',approvedAt:new Date(Date.parse(r.completedAt)+1).toISOString(),evidenceLocator:'fixture-transcript:attachment-approval'};}
export function apply(root:string,request:Record<string,any>){const ready=validateAttachment(root,request);if(ready.status!=='ATTACHMENT_READY_TO_APPLY')throw Error(JSON.stringify(ready));const p=request.proposal as Proposal;
  for(const w of p.writePlan){mkdirSync(dirname(join(root,w.path)),{recursive:true});writeFileSync(join(root,w.path),w.content);}
  for(const [key,value] of Object.entries(ready.evidence)){const path=`.agents/attachment/${p.proposalId}/${key}.json`;mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),JSON.stringify(value,null,2)+'\n');}
  if(p.installation.exclusions.length)writeFileSync(join(root,'.git/info/exclude'),readFileSync(join(root,'.git/info/exclude'),'utf8')+exclusionBlock(p));
  const hook=installGitHook(root,hookRequest(root,[...p.writePlan.map(w=>w.path),...p.evidencePaths.slice(0,-1)]));if(hook.status==='DENIED')throw Error(JSON.stringify(hook));
  const result=verifyAttached(root,request);writeFileSync(join(root,p.evidencePaths.at(-1)!),JSON.stringify(result,null,2)+'\n');return result;
}
export function detachInput(root:string,p:Proposal){const entries=[...p.ownership,...p.evidencePaths.map(path=>({path,classification:'TOPHAT_OWNED_PRIVATE' as const,evidence:'Generated private attachment evidence',tracked:false,initialSha256:fileState(root,path).sha256}))];
  const removePaths=entries.map(x=>x.path);return {ownership:{schemaVersion:1,proposalId:p.proposalId,sourceCommit:p.sourceCommit,entries,evidencePaths:p.evidencePaths},expectedBranch:'development',removePaths,confirmedCurrentHashes:Object.fromEntries(removePaths.map(x=>[x,fileState(root,x).sha256])),preservePaths:['package.json','pnpm-lock.yaml','product.ts','README.md','docs/project/manifest.json'],hook:{remove:true,confirmedSha256:digest(p.installation.hookContent)},exclusionBlock:p.installation.exclusions.length?exclusionBlock(p):null};
}
