import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadCommandCatalog, catalogResources, validateCommandCatalog } from '../scripts/validate-command-catalog.ts';
const source=process.cwd(),script=resolve('.agents/scripts/validate-command-catalog.ts');
const fixture=()=>{const root=mkdtempSync(join(tmpdir(),'tophat-catalog-'));cpSync(join(source,'.agents'),join(root,'.agents'),{recursive:true,filter:p=>!p.split('/').some(x=>['node_modules','tests'].includes(x))});return{root,close:()=>rmSync(root,{recursive:true,force:true})};};
function rewrite(root:string,mutate:(c:any)=>void){const path=join(root,'.agents/docs/command-catalog.json'),c=JSON.parse(readFileSync(path,'utf8'));mutate(c);writeFileSync(path,JSON.stringify(c));}
test('closed command catalog inventories 30 active, one retired and 17 guidance skills',()=>{
 const c=loadCommandCatalog(source);assert.equal(c.commands.filter(x=>x.state==='active').length,30);assert.equal(c.guidanceSkills.length,17);assert.equal(c.commands.find(x=>x.state==='retired')!.name,'generate-readme');
 const before=spawnSync('git',['status','--porcelain'],{encoding:'utf8'}).stdout;
 assert.equal(validateCommandCatalog(source).status,'CATALOG_VALID');assert.ok(catalogResources(source).includes('.agents/scripts/classify-task.ts'));
 assert.equal(spawnSync('git',['status','--porcelain'],{encoding:'utf8'}).stdout,before);
});
for(const kind of ['unknown-root','unknown-actor','duplicate-command','unknown-name','retired-active','wrong-model','unsafe-resource','missing-resource','missing-role','guidance-collision','missing-input-field','duplicate-resource'])test(`catalog rejects ${kind}`,()=>{
 const f=fixture();try{rewrite(f.root,c=>{
  if(kind==='unknown-root')c.runtime={};if(kind==='unknown-actor')c.commands[0].actors.permissions='all';if(kind==='duplicate-command')c.commands[0]=c.commands[1];if(kind==='unknown-name')c.commands[0].name='invented';
  const active=c.commands.find((x:any)=>x.state==='active');if(kind==='retired-active')c.commands.find((x:any)=>x.state==='retired').state='active';if(kind==='wrong-model')active.modelKey='/other';if(kind==='unsafe-resource')active.mandatoryResources.push('../outside');if(kind==='missing-resource')active.mandatoryResources.push('.agents/docs/missing.md');if(kind==='missing-role')active.roleRules.push('.agents/rules/missing.md');if(kind==='guidance-collision')c.guidanceSkills[0].name=active.name;if(kind==='missing-input-field')delete active.inputContract.required;if(kind==='duplicate-resource')active.mandatoryResources.push(active.mandatoryResources[0]);
 });assert.equal(validateCommandCatalog(f.root).status,'CATALOG_INVALID');}finally{f.close();}
});
test('source closure rejects missing transitive module and symlink escape',()=>{
 for(const symlink of [false,true]){const f=fixture();try{const path=join(f.root,'.agents/scripts/load-tophat-config.ts');rmSync(path);if(symlink)symlinkSync(resolve('.agents/scripts/load-tophat-config.ts'),path);assert.equal(validateCommandCatalog(f.root).status,'CATALOG_INVALID');}finally{f.close();}}
});
test('host validation preserves model overrides/custom keys and rejects missing mappings or partial install',()=>{
 const f=fixture();try{
  const matrix=JSON.parse(readFileSync('.agents/tophat.config.json','utf8')).routingMatrix;matrix['/implement-mid']='Host chosen model';matrix['/custom']='Custom';
  const config={schemaVersion:1,workspace:{kind:'backend',framework:'none'},documentation:{package:'docs/project',manifest:'manifest.json',derivedTargets:[]},validation:{scripts:{unit:'check:behavior'},commitGate:['unit'],developmentPhaseGate:['unit'],projectCompletionGate:['unit']},routingMatrix:matrix};
  mkdirSync(join(f.root,'.agents/workflows'),{recursive:true});writeFileSync(join(f.root,'.agents/workflows/custom-host.md'),'Host-owned custom workflow');
  mkdirSync(join(f.root,'.agents/skills/custom-host'),{recursive:true});writeFileSync(join(f.root,'.agents/skills/custom-host/SKILL.md'),'Host-owned custom skill');
  const path=join(f.root,'.agents/tophat.config.json');writeFileSync(path,JSON.stringify(config));assert.equal(validateCommandCatalog(source,f.root).status,'CATALOG_VALID');assert.equal(JSON.parse(readFileSync(path,'utf8')).routingMatrix['/custom'],'Custom');
  writeFileSync(join(f.root,'.agents/workflows/implement-mid.md'),'collision');assert.equal(validateCommandCatalog(source,f.root).status,'CATALOG_INVALID');rmSync(join(f.root,'.agents/workflows/implement-mid.md'));
  delete config.routingMatrix['/implement-mid'];writeFileSync(path,JSON.stringify(config));assert.equal(validateCommandCatalog(source,f.root).status,'CATALOG_INVALID');config.routingMatrix['/implement-mid']='Host chosen model';writeFileSync(path,JSON.stringify(config));
  rmSync(join(f.root,'.agents/skills/implement-mid/SKILL.md'));assert.equal(validateCommandCatalog(source,f.root).status,'CATALOG_INVALID');
 }finally{f.close();}
});
test('catalog CLI requires explicit roots and rejects duplicate, missing or unknown flags',()=>{
 for(const args of [[],['--root'],['--root',source,'--root',source],['--host-root',source],['--root',source,'--invented','x']]){const r=spawnSync(process.execPath,[script,...args],{encoding:'utf8'});assert.equal(r.status,2);assert.equal(JSON.parse(r.stdout).status,'CATALOG_INVOCATION_INVALID');}
 const r=spawnSync(process.execPath,[script,'--root',source],{cwd:tmpdir(),encoding:'utf8'});assert.equal(r.status,0,r.stdout);
 const host=spawnSync(process.execPath,[script,'--root',source,'--host-root',source],{encoding:'utf8'});assert.equal(host.status,1);assert.match(host.stdout,/CATALOG_INVALID/);
});

for(const kind of ['wrong-name-with-body-spoof','missing-close','unterminated-quote','duplicate-name','extra-field','boolean','null','number','comment'])test(`skill metadata rejects ${kind}`,()=>{
 const f=fixture();try{const path=join(f.root,'.agents/skills/implement-mid/SKILL.md');let body=readFileSync(path,'utf8');
 if(kind==='wrong-name-with-body-spoof')body=body.replace('name: implement-mid','name: wrong')+'\nname: implement-mid\n';
 if(kind==='missing-close')body=body.replace('\n---\n\n','\n\n');if(kind==='unterminated-quote')body=body.replace(/^description: .+$/m,'description: "unfinished');if(kind==='duplicate-name')body=body.replace('name: implement-mid','name: implement-mid\nname: implement-mid');if(kind==='extra-field')body=body.replace('name: implement-mid','name: implement-mid\npermissions: all');
 if(['boolean','null','number','comment'].includes(kind))body=body.replace(/^description: .+$/m,'description: '+({boolean:'true',null:'null',number:'42',comment:'# comment'} as any)[kind]);
 writeFileSync(path,body);assert.equal(validateCommandCatalog(f.root).status,'CATALOG_INVALID');}finally{f.close();}
});
