import { runValidation } from './run-validation.ts';
import { isMain } from './validate-doc-package.ts';
import { type Proposal, record, fields, string, instant, fingerprint, strip, validateProposal, freshProposal, configFor, snapshot, cleanSnapshot, collectOutput, stop, cli, AttachmentError } from './inspect-workspace-attachment.ts';

export interface Authorization {
  schemaVersion: 1; proposalId: string; proposalFingerprint: string; hostSnapshotFingerprint: string;
  scripts: Array<{category:string;script:string}>; human: string; authorizedAt: string; evidenceLocator: string;
}
export function authorizationFor(p:Proposal,value:unknown):Authorization {
  const a=record(value,'authorization');fields(a,['schemaVersion','proposalId','proposalFingerprint','hostSnapshotFingerprint','scripts','human','authorizedAt','evidenceLocator'],[],'authorization');
  if(a.schemaVersion!==1||a.proposalId!==p.proposalId||a.proposalFingerprint!==p.proposalFingerprint||a.hostSnapshotFingerprint!==p.hostSnapshotFingerprint||
    fingerprint(a.scripts)!==fingerprint(p.baseline.scripts.map(({category,script})=>({category,script}))))stop('BASELINE_AUTHORIZATION_DENIED','Authorization must bind the exact proposal, snapshot and ordered scripts');
  string(a.human,'human');string(a.evidenceLocator,'evidenceLocator');if(instant(a.authorizedAt,'authorizedAt')<instant(p.createdAt,'proposal createdAt'))stop('BASELINE_AUTHORIZATION_DENIED','Authorization must follow the proposal');return a as Authorization;
}
export function assessAttachment(root:string,input:unknown):Record<string,any> {
  try {
    const request=record(input,'assessment request');fields(request,['proposal','authorization'],[],'assessment request');const p=validateProposal(request.proposal),a=authorizationFor(p,request.authorization);
    freshProposal(root,p);const config=configFor(p),before=snapshot(root,p.inputPaths,p.baseline.outputPaths);cleanSnapshot(before,p.facts.snapshot.branch!,p.inputPaths);
    const beforeOutputs=collectOutput(root,p.baseline.outputPaths);
    const runner=runValidation({gate:'commitGate',additionalCategories:p.baseline.categories.filter(c=>!config.validation.commitGate.includes(c))},root,'pnpm',{candidateConfig:config,timeoutMs:p.baseline.timeoutMs,maxBufferBytes:p.baseline.maxBufferBytes});
    const issues:string[]=[];
    if(runner.decision!=='allow'||runner.status!=='PASSED')issues.push(runner.code==='SCRIPT_SPAWN_FAILED'?'COMMAND_UNAVAILABLE':runner.code);
    let after:ReturnType<typeof snapshot>|null=null,afterOutputs:ReturnType<typeof collectOutput>|null=null;
    try { after=snapshot(root,p.inputPaths,p.baseline.outputPaths); if(fingerprint(after)!==fingerprint(before)) {
      if(after.commit!==before.commit||after.branch!==before.branch||after.history!==before.history||after.index!==before.index||after.operations.length)issues.push('GIT_STATE_CHANGED');
      if(fingerprint(after.tracked)!==fingerprint(before.tracked)||after.trackedDiff!==before.trackedDiff||fingerprint(after.inputs)!==fingerprint(before.inputs))issues.push('TRACKED_STATE_CHANGED');
      if(fingerprint(after.untracked)!==fingerprint(before.untracked))issues.push('UNEXPECTED_ARTIFACT');
      if(after.hooksPath!==before.hooksPath||fingerprint(after.hook)!==fingerprint(before.hook)||fingerprint(after.exclude)!==fingerprint(before.exclude)||fingerprint(after.globalExclude)!==fingerprint(before.globalExclude))issues.push('GIT_INTEGRATION_CHANGED');
      if(!issues.length)issues.push('GIT_STATE_CHANGED');
    }}catch{issues.push('EVIDENCE_INCOMPLETE');}
    try {afterOutputs=collectOutput(root,p.baseline.outputPaths);}catch{issues.push('EVIDENCE_INCOMPLETE');}
    const results=p.baseline.categories.map(category=>{
      const r=runner.results.find(r=>r.category===category);return r??{category,script:config.validation.scripts[category],status:'NOT_RUN',exitStatus:null};
    });
    const unselected=Object.keys(config.validation.scripts).filter(c=>!p.baseline.categories.includes(c as any)).map(category=>({category,script:config.validation.scripts[category as keyof typeof config.validation.scripts],status:'NOT_SELECTED'}));
    const result={schemaVersion:1,proposalId:p.proposalId,proposalFingerprint:p.proposalFingerprint,authorizationSha256:fingerprint(a),hostSnapshotFingerprint:p.hostSnapshotFingerprint,
      testedCommit:before.commit,runtime:p.facts.runtime,preSnapshot:before,postSnapshot:after,runner,results,unselected,artifacts:{before:beforeOutputs,after:afterOutputs},issues:[...new Set(issues)],
      status:issues.length?'BASELINE_REQUIRES_DECISION':'ATTACHMENT_AWAITING_APPROVAL',completedAt:new Date().toISOString(),assessmentFingerprint:''};
    result.assessmentFingerprint=fingerprint(strip(result,['assessmentFingerprint']));return result;
  }catch(e){return {schemaVersion:1,status:'DENIED',issues:[`${e instanceof AttachmentError?e.code:'ASSESSMENT_FAILED'}: ${e instanceof Error?e.message:'Assessment failed'}`]};}
}
export function assessmentFor(p:Proposal,a:Authorization,value:unknown):Record<string,any> {
  const r=record(value,'assessment');fields(r,['schemaVersion','proposalId','proposalFingerprint','authorizationSha256','hostSnapshotFingerprint','testedCommit','runtime','preSnapshot','postSnapshot','runner','results','unselected','artifacts','issues','status','completedAt','assessmentFingerprint'],[],'assessment');
  if(r.schemaVersion!==1||r.proposalId!==p.proposalId||r.proposalFingerprint!==p.proposalFingerprint||r.authorizationSha256!==fingerprint(a)||r.hostSnapshotFingerprint!==p.hostSnapshotFingerprint||
    r.testedCommit!==p.facts.snapshot.commit||r.assessmentFingerprint!==fingerprint(strip(r,['assessmentFingerprint'])))stop('ATTACHMENT_ASSESSMENT_STALE','Assessment binding differs');
  if(r.status!=='ATTACHMENT_AWAITING_APPROVAL'||!Array.isArray(r.issues)||r.issues.length||r.runner.status!=='PASSED'||r.runner.decision!=='allow'||
    fingerprint(r.preSnapshot)!==p.hostSnapshotFingerprint||fingerprint(r.postSnapshot)!==p.hostSnapshotFingerprint)stop('ATTACHMENT_BASELINE_UNRESOLVED','A complete unchanged passing assessment is required');
  if(!Array.isArray(r.results)||fingerprint(r.results.map((x:any)=>({category:x.category,script:x.script})))!==fingerprint(a.scripts)||r.results.some((x:any)=>x.status!=='PASSED'||x.exitStatus!==0))stop('ATTACHMENT_BASELINE_UNRESOLVED','All authorized categories must pass');
  if(instant(r.completedAt,'completedAt')<instant(a.authorizedAt,'authorizedAt'))stop('ATTACHMENT_EVIDENCE_INVALID','Assessment precedes command authorization');return r;
}
if(isMain(import.meta.url))cli(assessAttachment);
