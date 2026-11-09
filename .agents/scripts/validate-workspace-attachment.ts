import { readFileSync } from 'node:fs';
import { authorizationFor, assessmentFor } from './assess-attachment-baseline.ts';
import { inspectDocPackage, isMain, digest, strictJson, canonical } from './validate-doc-package.ts';
import { type Proposal, record, fields, string, instant, fingerprint, validateProposal, freshProposal, configFor, collectOutput, fileState, checkedPath, git, snapshot, strip, cli, stop, AttachmentError } from './inspect-workspace-attachment.ts';

export function approvalFor(p:Proposal,r:Record<string,any>,input:unknown):Record<string,any> {
  const a=record(input,'approval');fields(a,['schemaVersion','proposalId','proposalFingerprint','assessmentFingerprint','hostSnapshotFingerprint','authorityFingerprint','candidateFingerprint','installationMode','signal','human','approvedAt','evidenceLocator'],[],'approval');
  if(a.schemaVersion!==1||a.proposalId!==p.proposalId||a.proposalFingerprint!==p.proposalFingerprint||a.assessmentFingerprint!==r.assessmentFingerprint||a.hostSnapshotFingerprint!==p.hostSnapshotFingerprint||
    a.authorityFingerprint!==p.documentation.authorityFingerprint||a.candidateFingerprint!==p.documentation.candidateFingerprint||a.installationMode!==p.installation.mode||a.signal!=='APPROVED')stop('ATTACHMENT_APPROVAL_DENIED','Explicit approval must bind the exact assessed proposal');
  string(a.human,'human');string(a.evidenceLocator,'evidenceLocator');if(instant(a.approvedAt,'approvedAt')<=instant(r.completedAt,'completedAt'))stop('ATTACHMENT_APPROVAL_DENIED','Approval must follow assessment');return a;
}
export function checkStateProposals(p:Proposal):void {
  const roadmap=p.writePlan.find(x=>x.path==='Roadmap.md')!.content;
  const sections=[...roadmap.matchAll(/^#{1,6}[^\n]*\[ACTIVE_SPRINT_CHUNK\][^\n]*\n([\s\S]*?)(?=^#{1,6} |$(?![\s\S]))/gm)];
  if(sections.length!==1)stop('ATTACHMENT_STATE_INVALID','Exactly one active chunk is required');
  const blocks=[...sections[0][1].matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)].map(x=>strictJson(x[1],'authorityContext'));
  const candidates=blocks.filter((b:any)=>b&&typeof b==='object'&&b.authorityContext);
  const expected={authorityContext:{packageId:p.documentation.packageId,packageVersion:p.documentation.packageVersion,authorityFingerprint:p.documentation.authorityFingerprint,...p.developmentBoundary}};
  if(candidates.length!==1||canonical(candidates[0])!==canonical(expected))stop('ATTACHMENT_STATE_INVALID','Private chunk provenance must match approved scope and package');
}
export function validateAttachment(root:string,input:unknown):Record<string,any> {
  try {
    const req=record(input,'readiness request');fields(req,['proposal','authorization','assessment','approval'],[],'readiness request');
    const p=validateProposal(req.proposal),a=authorizationFor(p,req.authorization),r=assessmentFor(p,a,req.assessment),approval=approvalFor(p,r,req.approval);
    freshProposal(root,p);checkStateProposals(p);
    if(fingerprint(collectOutput(root,p.baseline.outputPaths))!==fingerprint(r.artifacts.after))stop('ATTACHMENT_ARTIFACT_STALE','Baseline output inventory changed');
    const host=p.facts.snapshot;
    if(host.hooksPath)stop('ATTACHMENT_HOOK_CONFLICT','Configured hooksPath needs a separately reviewed host integration outside this installer');
    const hookHash=digest(p.installation.hookContent);
    if(!p.installation.hookContent.includes('# TopHat 1.0 commit gate.')||p.installation.hookDisposition==='manual-integration'||(host.hook.sha256!==null&&host.hook.sha256!==hookHash))stop('ATTACHMENT_HOOK_CONFLICT','Mixed or existing hook requires a separate integration decision');
    const evidence={proposal:p,authorization:a,assessment:r,approval,ownership:{schemaVersion:1,proposalId:p.proposalId,sourceCommit:p.sourceCommit,entries:p.ownership,evidencePaths:p.evidencePaths}};
    return {schemaVersion:1,status:'ATTACHMENT_READY_TO_APPLY',planningAllowed:false,proposalFingerprint:p.proposalFingerprint,assessmentFingerprint:r.assessmentFingerprint,
      permittedWrites:p.writePlan.map(({path,operation,priorSha256,sha256})=>({path,operation,priorSha256,sha256})),evidencePaths:p.evidencePaths,evidence,
      hook:{disposition:p.installation.hookDisposition,sha256:hookHash},exclusions:p.installation.exclusions,issues:[]};
  }catch(e){return {schemaVersion:1,status:'DENIED',planningAllowed:false,issues:[`${e instanceof AttachmentError?e.code:'ATTACHMENT_CHECK_FAILED'}: ${e instanceof Error?e.message:'Check failed'}`]};}
}
// Verification is read-only and never attempts rollback or repair of partial application.
export function verifyAttached(root:string,input:unknown):Record<string,any> {
  try {
    const req=record(input,'completion request');fields(req,['proposal','authorization','assessment','approval'],[],'completion request');const p=validateProposal(req.proposal),a=authorizationFor(p,req.authorization),r=assessmentFor(p,a,req.assessment),approval=approvalFor(p,r,req.approval);checkStateProposals(p);
    const changed:string[]=[];for(const w of p.writePlan)if(fileState(root,w.path).sha256!==w.sha256)changed.push(w.path);
    const docs=inspectDocPackage(root);if(!docs.report.planningAllowed||docs.report.authorityFingerprint!==p.documentation.authorityFingerprint||docs.report.candidateFingerprint!==p.documentation.candidateFingerprint)changed.push('documentation');
    const installed=JSON.parse(readFileSync(checkedPath(root,'.agents/tophat.config.json'),'utf8'));if(canonical(installed)!==canonical(p.candidateConfig))changed.push('config');
    const after=snapshot(root,p.inputPaths,p.baseline.outputPaths),before=p.facts.snapshot;
    if(after.commit!==before.commit||after.branch!==before.branch||after.history!==before.history||after.index!==before.index||after.operations.length)changed.push('Git history/index/branch');
    const writable=new Set([...p.writePlan.map(x=>x.path),...p.evidencePaths]);for(const f of before.tracked)if(!writable.has(f.path)&&fingerprint(fileState(root,f.path))!==fingerprint(f))changed.push(f.path);
    for(const f of before.inputs)if(!writable.has(f.path)&&fingerprint(fileState(root,f.path))!==fingerprint(f))changed.push(f.path);
    const evidenceFiles=p.evidencePaths.slice(0,5),expected={proposal:p,assessment:r,authorization:a,approval,ownership:{schemaVersion:1,proposalId:p.proposalId,sourceCommit:p.sourceCommit,entries:p.ownership,evidencePaths:p.evidencePaths}};
    for(const path of evidenceFiles){const key=path.split('/').at(-1)!.replace('.json','') as keyof typeof expected; if(canonical(strictJson(readFileSync(checkedPath(root,path),'utf8'),'evidence'))!==canonical(expected[key]))changed.push(path);}
    const known=new Set([...before.untracked.map(x=>x.path),...p.writePlan.map(x=>x.path),...p.evidencePaths]);if(after.untracked.some(x=>!known.has(x.path)))changed.push('unexpected untracked file');
    if(fingerprint(after.globalExclude)!==fingerprint(before.globalExclude))changed.push('global exclusions');
    if(after.hooksPath!==before.hooksPath||after.hook.sha256!==digest(p.installation.hookContent)||!after.hook.executable)changed.push('native hook');
    const excludePath=git(root,['rev-parse','--git-path','info/exclude']).trim();let current='';try{current=readFileSync(resolveGit(root,excludePath),'utf8');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    // Exact original bytes plus one deterministic appended block. No global ignore rewrite is accepted.
    if(p.installation.mode==='local/private'&&p.installation.exclusions.length){const block=exclusionBlock(p);if(!current.endsWith(block)||(before.exclude.sha256===null?current.slice(0,-block.length)!=='':digest(current.slice(0,-block.length))!==before.exclude.sha256))changed.push('exclusion append');}
    else if(after.exclude.sha256!==before.exclude.sha256)changed.push('unexpected exclusion change');
    if(fingerprint(collectOutput(root,p.baseline.outputPaths))!==fingerprint(r.artifacts.after))changed.push('baseline outputs');
    if(changed.length)return {schemaVersion:1,status:'ATTACHMENT_INVALIDATED',planningAllowed:false,changedPaths:[...new Set(changed)],issues:['Manual application or preservation checks failed; inspect actual partial state']};
    return {schemaVersion:1,status:'ATTACHED',planningAllowed:true,proposalFingerprint:p.proposalFingerprint,assessmentFingerprint:r.assessmentFingerprint,baselineCommit:r.testedCommit,installationMode:p.installation.mode,verifiedAt:new Date().toISOString(),issues:[]};
  }catch(e){return {schemaVersion:1,status:'ATTACHMENT_INVALIDATED',planningAllowed:false,issues:[e instanceof Error?e.message:'Incomplete application']};}
}
import { resolve } from 'node:path';
function resolveGit(root:string,path:string):string{return resolve(root,path);}
export function exclusionBlock(p:Proposal):string{return `\n# BEGIN TopHat attachment ${p.proposalId}\n${p.installation.exclusions.map(x=>'/'+x).join('\n')}\n# END TopHat attachment ${p.proposalId}\n`;}
if(isMain(import.meta.url))cli((root,input)=>{const r=record(input,'request');fields(r,['mode','proposal','authorization','assessment','approval'],[],'request');const {mode,...rest}=r;if(mode==='ready')return validateAttachment(root,rest);if(mode==='verify')return verifyAttached(root,rest);stop('ATTACHMENT_INPUT_INVALID','mode must be ready or verify');});

/** Completion evidence is historical. Normal approved product/private-state evolution is not a failed attachment. */
export function attachmentReadiness(root:string):{state:string;issues:string[]} {
  try {
    const dirs=readdirSync(checkedPath(root,'.agents/attachment'),{withFileTypes:true}).filter(x=>x.isDirectory());
    if(dirs.length!==1)return {state:'ATTACHMENT_INVALIDATED',issues:['Select one current attachment evidence directory; retain earlier evidence outside the active directory']};
    const base=`.agents/attachment/${dirs[0].name}`,load=(name:string)=>strictJson(readFileSync(checkedPath(root,`${base}/${name}.json`),'utf8'),name);
    const p=validateProposal(load('proposal')),a=authorizationFor(p,load('authorization')),r=assessmentFor(p,a,load('assessment'));approvalFor(p,r,load('approval'));
    const completion=record(load('completion'),'completion');fields(completion,['schemaVersion','status','planningAllowed','proposalFingerprint','assessmentFingerprint','baselineCommit','installationMode','verifiedAt','issues'],[],'completion');
    instant(completion.verifiedAt,'verifiedAt');
    if(completion.schemaVersion!==1||!Array.isArray(completion.issues)||completion.issues.length||completion.installationMode!==p.installation.mode||completion.status!=='ATTACHED'||completion.planningAllowed!==true||completion.proposalFingerprint!==p.proposalFingerprint||completion.assessmentFingerprint!==r.assessmentFingerprint||completion.baselineCommit!==r.testedCommit)stop('ATTACHMENT_COMPLETION_INVALID','Completion evidence differs from assessed proposal');
    const config=JSON.parse(readFileSync(checkedPath(root,'.agents/tophat.config.json'),'utf8'));
    if(canonical(config)!==canonical(p.candidateConfig))stop('ATTACHMENT_CONFIG_CHANGED','Current attachment config differs; reassess the setup');
    if(!inspectDocPackage(root).report.planningAllowed)stop('ATTACHMENT_DOCUMENTATION_BLOCKED','Current documentation denies planning');
    return {state:'ATTACHED',issues:[]};
  }catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT'){
      try{lstatSync(checkedPath(root,'.agents/attachment'));return {state:'ATTACHMENT_INVALIDATED',issues:['Attachment evidence is incomplete']};}catch{return {state:'NOT_RECORDED',issues:[]};}
    }return {state:'ATTACHMENT_INVALIDATED',issues:[e instanceof Error?e.message:'Attachment evidence cannot be validated']};}
}
import { readdirSync, lstatSync } from 'node:fs';
