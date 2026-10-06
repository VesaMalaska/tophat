import assert from 'node:assert/strict';
import test from 'node:test';
import {writeFileSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {host,git,evidence,refreshIndex} from './fixtures/routing/fixture.ts';
import {classifyTask} from '../scripts/classify-task.ts';
import {validateQAEvidence,publicationReadiness,checkedReport} from '../scripts/validate-qa-evidence.ts';
import {checkedTerminalEnvironment,verifyTerminalEnvironment,terminalViewportReason} from '../scripts/validate-terminal-environment.ts';
import {loadTophatConfig} from '../scripts/load-tophat-config.ts';
test('TUI layout, interaction and privileged process work follow highest applicable tier',()=>{
 const f=host('terminal','none');try {
  assert.equal(classifyTask(f.root,f.task).devTier,'mid');
  f.task.workKinds=['static-ui'];f.task.userEffects=['visual'];f.task.guidance.taskTopics=['terminal-presentation'];
  const junior=classifyTask(f.root,f.task);assert.equal(junior.devTier,'junior');assert.deepEqual(junior.qaMethods,['visual','responsive']);
  f.task.workKinds=['terminal-logic','process'];f.task.userEffects=['terminal-flow'];f.task.guidance.taskTopics=['terminal-flow'];assert.equal(classifyTask(f.root,f.task).devTier,'senior');
  f.task.workKinds=['terminal-logic'];f.task.userEffects=['no-user-facing-change'];f.task.guidance.taskTopics=[];f.task.noUserFacingReason='Pretend no user impact';assert.throws(()=>classifyTask(f.root,f.task));
 } finally {f.close();}
});
test('CLI keeps noninteractive flow; rejects interactive logic and presentation classification',()=>{
 const f=host('terminal','none',undefined,'cli');try {
  const r=classifyTask(f.root,f.task);assert.equal(r.devTier,'senior');assert.deepEqual(r.qaMethods,['e2e-terminal','exploratory']);
  f.task.workKinds=['terminal-logic'];assert.throws(()=>classifyTask(f.root,f.task));
  f.task.workKinds=['static-ui'];f.task.userEffects=['visual'];f.task.guidance.taskTopics=['terminal-presentation'];assert.throws(()=>classifyTask(f.root,f.task));
 } finally {f.close();}
});
for(const mode of ['cli','tui'] as const)test(`${mode} complete synthetic terminal evidence passes QA and publication; metadata and candidate tampering deny`,()=>{
 const f=host('terminal','none',undefined,mode);try {
  const e=evidence(f);assert.equal(validateQAEvidence(f.root,e.request).approvalAllowed,true);assert.equal(publicationReadiness(f.root,e.publish).status,'PUBLICATION_READY');
  const original=structuredClone(e.report);
  const mutations=[(r:any)=>r.environment.viewports=['80x24 cells'],(r:any)=>r.environment.terminal.mode=mode==='cli'?'tui':'cli',(r:any)=>r.environment.terminal.terminalIdentity='unknown',(r:any)=>r.environment.terminal.sizes=[{rows:0,columns:80}],(r:any)=>delete r.environment.terminal,(r:any)=>r.methodResults.pop(),(r:any)=>r.artifacts[0].sha256='0'.repeat(64),(r:any)=>r.reviewer.independentOf=[]];
  for(const mutate of mutations){Object.assign(e.report,structuredClone(original));mutate(e.report);refreshIndex(e);assert.equal(validateQAEvidence(f.root,e.request).status,'DENIED');}
  Object.assign(e.report,structuredClone(original));refreshIndex(e);
  git(f.root,['commit','--allow-empty','-m','Later candidate']);assert.equal(publicationReadiness(f.root,e.publish).status,'DENIED');
 }finally{f.close();}
});
test('terminal identity, dimensions and closed conditional objects reject malformed and cross-host data',()=>{
 const env:any={workspaceKind:'terminal',framework:'none',available:true,viewports:[],viewportsReason:terminalViewportReason,terminal:{mode:'tui',terminalIdentity:'Controlled PTY harness v1',term:{value:'xterm',reason:null},locale:{value:'C.UTF-8',reason:null},runtimeInvocation:'node fixture.ts',nativeDependencies:'util-linux script',ttyMode:'pty',sizes:[{rows:24,columns:80}],sizeReason:null,captureLimitations:'No native glyph rendering certification'}};
 const original=structuredClone(env);
 for(const identity of ['ab',' UNKNOWN ','N/A','yes','none','tbd','x'.repeat(257),'<terminal-name>','valid\nname']){env.terminal.terminalIdentity=identity;assert.throws(()=>checkedTerminalEnvironment(env));}
 Object.assign(env,structuredClone(original));checkedTerminalEnvironment(env);
 for(const mutate of [(x:any)=>x.terminal.extra=true,(x:any)=>x.terminal.sizes.push({rows:24,columns:80}),(x:any)=>x.terminal.sizes[0].rows=1.5,(x:any)=>x.terminal.term.reason='Conflicting',(x:any)=>x.terminal.sizes=Array.from({length:33},(_,i)=>({rows:i+1,columns:80}))]) {Object.assign(env,structuredClone(original));mutate(env);assert.throws(()=>checkedTerminalEnvironment(env));}
 for(const kind of ['web','backend','desktop'])for(const value of [original.terminal,null])assert.throws(()=>checkedTerminalEnvironment({workspaceKind:kind,terminal:value}));
 const f=host();try {assert.throws(()=>verifyTerminalEnvironment(original,loadTophatConfig(f.root),['e2e-terminal']));const e=evidence(f);e.report.environment.terminal=original.terminal;assert.throws(()=>checkedReport(e.report));}finally{f.close();}
});

test('TUI presentation evidence requires observed cells, TTY and artifacts without inventing a flow',()=>{
 const f=host('terminal','none');try {
  f.task.workKinds=['static-ui'];f.task.userEffects=['visual'];f.task.guidance={requestedSkills:['terminal-qa-flows'],taskTopics:['terminal-presentation'],frameworkInstructions:[]};
  const r=classifyTask(f.root,f.task);assert.deepEqual(r.qaMethods,['visual','responsive']);assert.equal(r.devTier,'junior');
  const e=evidence(f);assert.equal(validateQAEvidence(f.root,e.request).approvalAllowed,true);
  const original=structuredClone(e.report);
  for(const mutate of [(v:any)=>{v.environment.terminal.sizes=[];v.environment.terminal.sizeReason='Not observed';},(v:any)=>v.environment.terminal.ttyMode='non-tty',(v:any)=>v.methodResults[0].artifactIds=[]]){Object.assign(e.report,structuredClone(original));mutate(e.report);refreshIndex(e);assert.equal(validateQAEvidence(f.root,e.request).status,'DENIED');}
 }finally{f.close();}
});
test('terminal internal work keeps explicit QA non-applicability and privileged mixed work stays senior',()=>{
 const f=host('terminal','none',undefined,'cli');try{
  f.task.workKinds=['internal'];f.task.userEffects=['no-user-facing-change'];f.task.noUserFacingReason='Internal helper with no observable interface change';f.task.guidance.taskTopics=[];f.task.acceptanceChecks[0].qaApplicable=false;f.task.acceptanceChecks[0].applicabilityReason='Declared unit validation';
  const r=classifyTask(f.root,f.task);assert.equal(r.devTier,'senior');assert.equal(r.securityRequired,true);assert.equal(r.qaRequired,false);assert.deepEqual(r.qaMethods,[]);
 }finally{f.close();}
 const t=host('terminal','none');try{for(const work of ['filesystem','auth','cross-layer','process']){t.task.workKinds=['terminal-logic',work] as any;assert.equal(classifyTask(t.root,t.task).devTier,'senior');}}finally{t.close();}
});
