import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {host,assessed,approval,apply,detachInput,command} from './fixtures/attachment/fixture.ts';
import {discover} from '../scripts/inspect-workspace-attachment.ts';
import {inspectDetachment,verifyDetachment} from '../scripts/inspect-tophat-detachment.ts';
import {digest} from '../scripts/validate-doc-package.ts';
import {loadTophatConfig} from '../scripts/load-tophat-config.ts';
import {validateCommandCatalog} from '../scripts/validate-command-catalog.ts';
test('terminal CLI and TUI attachment preserves custom routing and exact detachment preserves product history',()=>{
 for(const mode of ['cli','tui']){
  const f=host(undefined,'local/private');try {
   f.input.candidateConfig.workspace={kind:'terminal',framework:'none',mode};
   f.input.candidateConfig.routingMatrix['/implement-mid']='Host-selected model';
   const cfg=f.input.writePlan[0];cfg.content=JSON.stringify(f.input.candidateConfig);cfg.sha256=digest(cfg.content);
   const p=f.proposal(),e=assessed(f.root,p),req={proposal:p,...e,approval:approval(p,e.assessment)};
   const before=command(f.root,['rev-parse','HEAD']),product=readFileSync(join(f.root,'product.ts'));
   assert.equal(apply(f.root,req).status,'ATTACHED');assert.equal(loadTophatConfig(f.root).workspace.mode,mode);
   assert.equal(validateCommandCatalog(process.cwd(),f.root).status,'CATALOG_VALID');
   assert.equal(loadTophatConfig(f.root).routingMatrix['/implement-mid'],'Host-selected model');
   mkdirSync(join(f.root,'.agents/skills/host-custom'),{recursive:true});writeFileSync(join(f.root,'.agents/skills/host-custom/SKILL.md'),'host-owned guidance');
   const input=detachInput(f.root,p);input.ownership.entries.push({path:'.agents/skills/host-custom/SKILL.md',classification:'HOST_OWNED' as any,evidence:'Fixture host confirmation',tracked:false,initialSha256:digest('host-owned guidance')});input.preservePaths.push('.agents/skills/host-custom/SKILL.md');
   const result=inspectDetachment(f.root,input);assert.equal(result.status,'DETACHMENT_AWAITING_APPROVAL',JSON.stringify(result));
   const plan=result.plan,exclude=readFileSync(join(f.root,'.git/info/exclude'),'utf8');
   for(const entry of plan.entries)unlinkSync(join(f.root,entry.path));unlinkSync(join(f.root,'.git/hooks/pre-commit'));writeFileSync(join(f.root,'.git/info/exclude'),exclude.slice(0,-plan.exclusionBlock.length));
   const a={planFingerprint:plan.planFingerprint,signal:'APPROVED',human:'Synthetic fixture human',approvedAt:new Date(Date.parse(plan.createdAt)+1).toISOString(),evidenceLocator:'fixture:terminal-detachment'};
   assert.equal(verifyDetachment(f.root,{plan,approval:a}).status,'DETACHED_VERIFIED');assert.equal(command(f.root,['rev-parse','HEAD']),before);assert.deepEqual(readFileSync(join(f.root,'product.ts')),product);assert.equal(readFileSync(join(f.root,'.agents/skills/host-custom/SKILL.md'),'utf8'),'host-owned guidance');
  }finally{f.close();}
 }
});
test('terminal attachment rejects incomplete packaging closure and absent mode',()=>{
 const f=host();try{
  f.input.candidateConfig.workspace={kind:'terminal',framework:'none',mode:'tui'};
  const cfg=f.input.writePlan[0];cfg.content=JSON.stringify(f.input.candidateConfig);cfg.sha256=digest(cfg.content);
  for(const missing of ['.agents/skills/terminal-qa-flows/SKILL.md','.agents/docs/terminal-host-support.md','.agents/scripts/validate-terminal-environment.ts']){const input=structuredClone(f.input);input.writePlan=input.writePlan.filter(w=>w.path!==missing);assert.equal(discover(f.root,input).status,'DENIED',missing);}
  delete f.input.candidateConfig.workspace.mode;cfg.content=JSON.stringify(f.input.candidateConfig);cfg.sha256=digest(cfg.content);assert.equal(discover(f.root,f.input).status,'DENIED');
 }finally{f.close();}
});
