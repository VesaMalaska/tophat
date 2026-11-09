import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { validateTaskAuthority } from "../scripts/validate-task-authority.ts";
import { fixture, approve, task } from "./fixtures/documentation/fixture.ts";

test("task mechanically traces all four source kinds and exact extracts",()=>{
 const f=fixture();try{approve(f.root);const t=task(f.root);assert.equal(validateTaskAuthority(f.root,t).status,"AUTHORITY_VALID");
 for(const e of t.extracts)e.content=e.content.replace(/\n/g,"\r\n");assert.equal(validateTaskAuthority(f.root,t).status,"AUTHORITY_VALID");
 const r=spawnSync(process.execPath,[resolve('.agents/scripts/validate-task-authority.ts')],{cwd:f.root,input:JSON.stringify(t),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 }finally{f.close();}
});
const changes:Array<[string,(t:ReturnType<typeof task>)=>void,string]>=[
 ['stale fingerprint',t=>t.authorityFingerprint='0'.repeat(64),'TASK_AUTHORITY_STALE'],
 ['wrong package version',t=>t.packageVersion='2','TASK_AUTHORITY_STALE'],
 ['wrong chunk',t=>t.sprintChunkId='other','TASK_CHUNK_INVALID'],
 ['inactive task scope',t=>t.scopeIds=['future'],'TASK_SCOPE_INVALID'],
 ['missing requirements',t=>t.references.requirements=[],'DOC_METADATA_INVALID'],
 ['wrong source kind',t=>t.references.requirements=['contracts#CON-001'],'TASK_REFERENCE_INVALID'],
 ['unresolved reference',t=>t.references.requirements=['product#missing'],'TASK_REFERENCE_INVALID'],
 ['duplicate references',t=>t.references.requirements.push(t.references.requirements[0]),'DOC_DUPLICATE_ID'],
 ['altered source extract',t=>t.extracts[0].content='Paraphrased acceptance','TASK_EXTRACT_INVALID'],
 ['missing extract',t=>t.extracts.pop(),'TASK_EXTRACT_INVALID'],
 ['duplicate extract',t=>t.extracts.push(t.extracts[0]),'TASK_EXTRACT_INVALID'],
 ['missing optional reason',t=>{t.references.contracts=[];t.extracts=t.extracts.filter(e=>!e.reference.startsWith('contracts#'));},'DOC_METADATA_INVALID'],
];
for(const [name,change,code]of changes)test(`task denies ${name}`,()=>{const f=fixture();try{approve(f.root);const t=task(f.root);change(t);assert.equal(validateTaskAuthority(f.root,t).issues[0].code,code);}finally{f.close();}});
test("explicit not-applicable reason is valid without silently inventing contracts",()=>{const f=fixture();try{approve(f.root);const t=task(f.root);t.references.contracts=[];(t.notApplicable as any).contracts='This task validates the requirement text only; the API contract is handled separately.';t.extracts=t.extracts.filter(e=>!e.reference.startsWith('contracts#'));assert.equal(validateTaskAuthority(f.root,t).status,'AUTHORITY_VALID');}finally{f.close();}});
test("missing or duplicated chunk context and stale authority cannot publish tasks",()=>{const f=fixture();try{approve(f.root);const t=task(f.root);const roadmap=join(f.root,'Roadmap.md');writeFileSync(roadmap,readFileSync(roadmap,'utf8')+'\n[ACTIVE_SPRINT_CHUNK]\n');assert.equal(validateTaskAuthority(f.root,t).issues[0].code,'TASK_CHUNK_INVALID');task(f.root);writeFileSync(join(f.root,'docs/project/02-product.md'),'Changed source');assert.equal(validateTaskAuthority(f.root,t).status,'DENIED');}finally{f.close();}});
