import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain, digest } from './validate-doc-package.ts';
import { record, fields, string, sha, instant, relativeName, paths, fileState, fingerprint, strip, snapshot, cleanSnapshot, git, cli, stop, AttachmentError, type Ownership } from './inspect-workspace-attachment.ts';

export interface DetachmentPlan {
  schemaVersion:1; proposalId:string; before:ReturnType<typeof snapshot>; entries:Array<{path:string;sha256:string;mode:number}>;
  retained:ReturnType<typeof fileState>[]; hook:{remove:boolean;sha256:string|null}; exclusionBlock:string|null;
  createdAt:string; planFingerprint:string; blockers:string[];
}
function ownedRecord(input:unknown):{schemaVersion:1;proposalId:string;sourceCommit:string;entries:Ownership[];evidencePaths:string[]} {
  const o=record(input,'ownership record');fields(o,['schemaVersion','proposalId','sourceCommit','entries','evidencePaths'],[],'ownership record');
  if(o.schemaVersion!==1||!Array.isArray(o.entries))stop('DETACHMENT_OWNERSHIP_DENIED','Invalid ownership record');string(o.proposalId,'proposalId');
  for(const v of o.entries){const x=record(v,'ownership entry');fields(x,['path','classification','evidence','tracked','initialSha256'],[],'ownership entry');relativeName(x.path);string(x.evidence,'evidence');if(!['TOPHAT_OWNED_PRIVATE','HOST_OWNED','SHARED','UNKNOWN'].includes(x.classification)||typeof x.tracked!=='boolean')stop('DETACHMENT_OWNERSHIP_DENIED','Invalid owner');if(x.initialSha256!==null)sha(x.initialSha256,'initialSha256');}
  paths(o.entries.map((x:any)=>x.path),'ownership');paths(o.evidencePaths,'evidence paths');
  if(o.evidencePaths.some((x:string)=>!x.startsWith(`.agents/attachment/${o.proposalId}/`)))stop('DETACHMENT_OWNERSHIP_DENIED','Evidence path outside recorded attachment');return o as any;
}
export function inspectDetachment(root:string,input:unknown):Record<string,any> {
  try {
    const r=record(input,'detachment request');fields(r,['ownership','expectedBranch','removePaths','confirmedCurrentHashes','preservePaths','hook','exclusionBlock'],[],'detachment request');const o=ownedRecord(r.ownership);
    const removePaths=paths(r.removePaths,'removePaths'),preservePaths=paths(r.preservePaths,'preservePaths');if(!removePaths.length)stop('DETACHMENT_PLAN_EMPTY','No files selected');
    if(removePaths.some(p=>preservePaths.includes(p)))stop('DETACHMENT_OWNERSHIP_DENIED','Removal overlaps preservation paths');
    const current=record(r.confirmedCurrentHashes,'confirmedCurrentHashes');fields(current,removePaths,[],'confirmedCurrentHashes');
    const before=snapshot(root,[...new Set([...removePaths,...preservePaths])]);cleanSnapshot(before,string(r.expectedBranch,'expectedBranch'),[...removePaths,...preservePaths]);
    const entries=removePaths.map(path=>{
      if(!path.startsWith('.agents/')&&!['Context.md','Strategy.md','Roadmap.md','HUD.md','DECISIONS.md'].includes(path))stop('DETACHMENT_PRODUCT_PATH','Product files cannot be removed');
      const owner=o.entries.find(x=>x.path===path),evidence=o.evidencePaths.includes(path);
      if(!evidence&&(!owner||owner.classification!=='TOPHAT_OWNED_PRIVATE'))stop('DETACHMENT_OWNERSHIP_DENIED','Mixed/unknown paths require a new reviewed inventory');
      const f=fileState(root,path);if(f.sha256===null)stop('DETACHMENT_INPUT_MISSING','Selected file is missing');
      if(current[path]!==f.sha256)stop('DETACHMENT_OWNERSHIP_STALE','Human must confirm exact current bytes; installation hashes are insufficient');return {path,sha256:f.sha256,mode:f.mode!};
    });
    const h=record(r.hook,'hook');fields(h,['remove','confirmedSha256'],[],'hook');if(typeof h.remove!=='boolean')stop('DETACHMENT_INPUT_INVALID','Invalid hook selection');
    if(h.remove&&(before.hooksPath||!before.hook.sha256||h.confirmedSha256!==before.hook.sha256))stop('DETACHMENT_HOOK_DENIED','Mixed/redirected/changed hook requires manual integration');
    if(h.remove){const hook=readFileSync(resolve(root,git(root,['rev-parse','--git-path','hooks/pre-commit']).trim()),'utf8');const src=fileState(root,'.agents/git-hooks/pre-commit');if(!hook.includes('# TopHat 1.0 commit gate.')||src.sha256!==digest(hook))stop('DETACHMENT_HOOK_DENIED','Hook must match confirmed TopHat-only versioned source');}
    let exclusionBlock:string|null=null;if(r.exclusionBlock!==null){exclusionBlock=string(r.exclusionBlock,'exclusionBlock');const content=readFileSync(resolve(root,git(root,['rev-parse','--git-path','info/exclude']).trim()),'utf8');
      if(!exclusionBlock.startsWith(`\n# BEGIN TopHat attachment ${o.proposalId}\n`)||!exclusionBlock.endsWith(`# END TopHat attachment ${o.proposalId}\n`)||content.split(exclusionBlock).length!==2||!content.endsWith(exclusionBlock))stop('DETACHMENT_EXCLUSION_DENIED','Only one exact confirmed TopHat block can be removed');
      const excluded=exclusionBlock.split('\n').filter(x=>x.startsWith('/')).map(x=>relativeName(x.slice(1)));if(!excluded.length||excluded.some(p=>!removePaths.includes(p)))stop('DETACHMENT_EXCLUSION_DENIED','Exclusion removal must belong to selected private inventory');
    }
    const retained=[...new Map([...before.tracked,...preservePaths.map(p=>fileState(root,p))].filter(f=>!removePaths.includes(f.path)).map(f=>[f.path,f])).values()];
    const retainedUntracked=before.untracked.filter(f=>!removePaths.includes(f.path));
    for(const f of retainedUntracked)if(!retained.some(x=>x.path===f.path))retained.push(f);
    if(retained.some(f=>f.sha256===null))stop('DETACHMENT_PRESERVATION_MISSING','Required product preservation file is missing');
    const p:DetachmentPlan={schemaVersion:1,proposalId:o.proposalId,before,entries,retained,hook:{remove:h.remove,sha256:before.hook.sha256},exclusionBlock,createdAt:new Date().toISOString(),planFingerprint:'',blockers:[]};p.planFingerprint=fingerprint(strip(p,['planFingerprint','createdAt']));
    return {schemaVersion:1,status:'DETACHMENT_AWAITING_APPROVAL',plan:p,issues:[]};
  }catch(e){return {schemaVersion:1,status:'DENIED',issues:[`${e instanceof AttachmentError?e.code:'DETACHMENT_FAILED'}: ${e instanceof Error?e.message:'Inventory failed'}`]};}
}
export function verifyDetachment(root:string,input:unknown):Record<string,any> {
  try {
    const r=record(input,'verification');fields(r,['plan','approval'],[],'verification');const p=record(r.plan,'plan') as DetachmentPlan;
    fields(p,['schemaVersion','proposalId','before','entries','retained','hook','exclusionBlock','createdAt','planFingerprint','blockers'],[],'plan');
    if(p.schemaVersion!==1||p.planFingerprint!==fingerprint(strip(p,['planFingerprint','createdAt']))||p.blockers.length)stop('DETACHMENT_PLAN_STALE','Removal plan is invalid');
    const a=record(r.approval,'approval');fields(a,['planFingerprint','signal','human','approvedAt','evidenceLocator'],[],'approval');string(a.human,'human');string(a.evidenceLocator,'evidenceLocator');
    if(a.signal!=='APPROVED'||a.planFingerprint!==p.planFingerprint||instant(a.approvedAt,'approvedAt')<=instant(p.createdAt,'createdAt'))stop('DETACHMENT_APPROVAL_DENIED','Exact removal inventory needs human approval');
    const after=snapshot(root,p.retained.map(x=>x.path)),changed:string[]=[];
    if(after.commit!==p.before.commit||after.branch!==p.before.branch||after.history!==p.before.history||after.index!==p.before.index||after.operations.length)changed.push('Git history/index/branch');
    for(const e of p.entries)if(fileState(root,e.path).sha256!==null)changed.push(e.path);
    for(const f of p.retained)if(fingerprint(fileState(root,f.path))!==fingerprint(f))changed.push(f.path);
    if(fingerprint(after.globalExclude)!==fingerprint(p.before.globalExclude))changed.push('global exclusions');
    if(after.hooksPath!==p.before.hooksPath||after.hook.sha256!==(p.hook.remove?null:p.before.hook.sha256))changed.push('native hook');
    if(p.exclusionBlock){const content=readFileSync(resolve(root,git(root,['rev-parse','--git-path','info/exclude']).trim()),'utf8');const original=content+p.exclusionBlock;
      if(content.includes(p.exclusionBlock)||digest(original)!==p.before.exclude.sha256)changed.push('exclusion preservation');
    }else if(after.exclude.sha256!==p.before.exclude.sha256)changed.push('exclusion preservation');
    const remainingKnown=new Set(p.before.untracked.filter(x=>!p.entries.some(e=>e.path===x.path)).map(x=>x.path));if(after.untracked.some(x=>!remainingKnown.has(x.path)))changed.push('unexpected untracked file');
    return {schemaVersion:1,status:changed.length?'DENIED':'DETACHED_VERIFIED',planningAllowed:false,changedPaths:changed,retained:p.retained.map(x=>x.path),issues:changed.length?['Manual removal did not preserve the reviewed result']:[]};
  }catch(e){return {schemaVersion:1,status:'DENIED',issues:[e instanceof Error?e.message:'Verification failed']};}
}
if(isMain(import.meta.url))cli((root,input)=>{const r=record(input,'request');fields(r,['mode','request'],[],'request');if(r.mode==='plan')return inspectDetachment(root,r.request);if(r.mode==='verify')return verifyDetachment(root,r.request);stop('DETACHMENT_INPUT_INVALID','Unknown mode');});
