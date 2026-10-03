import assert from "node:assert/strict";
import { readFileSync, writeFileSync, readdirSync, renameSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { digest, validateDocPackage } from "../scripts/validate-doc-package.ts";
import { finalizeDocPackage } from "../scripts/finalize-doc-package.ts";
import { fixture, manifest, saveManifest, receipts } from "./fixtures/documentation/fixture.ts";

function rewrite(root:string,path:string,value:unknown){writeFileSync(join(root,path),JSON.stringify(value,null,2)+'\n');}
test("incomplete input remains blocked until review questions resolve and matching human evidence follows",()=>{
 const f=fixture();try{
  const evidence=receipts(f.root);const before=readFileSync(join(f.root,'docs/project/manifest.json'));
  evidence.review.uncertainties=[{id:'Q-1',classification:'unresolved',scope:'core',material:true,resolved:false,disposition:'Human must decide authentication.'}] as any;
  rewrite(f.root,evidence.request.reviewReceipt,evidence.review);
  assert.equal(finalizeDocPackage(f.root,evidence.request).issues[0].code,'DOC_UNRESOLVED_MATERIAL_QUESTION');assert.deepEqual(readFileSync(join(f.root,'docs/project/manifest.json')),before);
  evidence.review.uncertainties=[];rewrite(f.root,evidence.request.reviewReceipt,evidence.review);evidence.approval.reviewSha256=digest(readFileSync(join(f.root,evidence.request.reviewReceipt)));rewrite(f.root,evidence.request.approvalReceipt,evidence.approval);
  const result=finalizeDocPackage(f.root,evidence.request);assert.equal(result.status,'APPROVED_VALID');assert.equal(result.published,true);assert.equal(validateDocPackage(f.root).planningAllowed,true);
  assert.ok(manifest(f.root).documents.filter(d=>d.role==='authoritative').every(d=>!!d.sha256));
 }finally{f.close();}
});
const cases:Array<[string,(root:string,e:ReturnType<typeof receipts>)=>void,string]>=[
 ['approval signal',(_r,e)=>e.approval.signal='DECLINED' as any,'DOC_APPROVAL_INVALID'],
 ['approval before review',(_r,e)=>e.approval.approvedAt='2026-10-03T09:00:00.000Z','DOC_APPROVAL_INVALID'],
 ['invalid timestamp',(_r,e)=>e.approval.approvedAt='yesterday','DOC_METADATA_INVALID'],
 ['stale approval fingerprint',(_r,e)=>e.approval.candidateFingerprint='0'.repeat(64),'DOC_APPROVAL_STALE'],
 ['changed review digest',(_r,e)=>e.approval.reviewSha256='0'.repeat(64),'DOC_APPROVAL_INVALID'],
 ['blocked review',(_r,e)=>e.review.verdict='BLOCKED' as any,'DOC_REVIEW_REQUIRED'],
 ['same prior approved version',(_r,e)=>e.review.priorApprovedVersion='1.0.0','DOC_VERSION_UNCHANGED'],
 ['changed authoritative candidate',(r,_e)=>writeFileSync(join(r,'docs/project/01-decisions.md'),'<a id="DEC-001"></a>\nChanged decision\n'),'DOC_APPROVAL_STALE'],
 ['changed derived candidate',(r,_e)=>writeFileSync(join(r,'docs/project/04-usage.md'),'Changed usage\n'),'DOC_APPROVAL_STALE'],
 ['changed entry guide',(r,_e)=>writeFileSync(join(r,'docs/project/README.md'),'Changed reading guide\n'),'DOC_APPROVAL_STALE'],
 ['changed candidate metadata',(r,_e)=>{const m=manifest(r);m.version='2';saveManifest(r,m);},'DOC_APPROVAL_STALE'],
];
for(const[name,change,code]of cases)test(`finalization denies ${name} without changing manifest`,()=>{
 const f=fixture();try{const e=receipts(f.root);change(f.root,e);rewrite(f.root,e.request.reviewReceipt,e.review);rewrite(f.root,e.request.approvalReceipt,e.approval);const before=readFileSync(join(f.root,'docs/project/manifest.json'));const r=finalizeDocPackage(f.root,e.request);assert.equal(r.issues[0].code,code);assert.deepEqual(readFileSync(join(f.root,'docs/project/manifest.json')),before);}finally{f.close();}
});
test("missing approval and out-of-package evidence deny; retained prior version can be reapproved only with a new version",()=>{
 const f=fixture();try{const e=receipts(f.root);unlinkSync(join(f.root,e.request.approvalReceipt));assert.equal(finalizeDocPackage(f.root,e.request).planningAllowed,false);
 e.request.approvalReceipt='README.md';assert.equal(finalizeDocPackage(f.root,e.request).issues[0].code,'DOC_APPROVAL_PATH_INVALID');
 const m=manifest(f.root);m.version='2.0.0';saveManifest(f.root,m);assert.equal(finalizeDocPackage(f.root,receipts(f.root,'1.0.0').request).status,'APPROVED_VALID');
 }finally{f.close();}
});
test("injected write/rename/read failures preserve the old manifest and clean only owned temporary files",()=>{
 for(const phase of ['write','rename','read']){const f=fixture();try{const e=receipts(f.root);const before=readFileSync(join(f.root,'docs/project/manifest.json'));
 const io={write:writeFileSync,rename:renameSync,remove:unlinkSync};
 if(phase==='write')io.write=(()=>{throw new Error('write failed');}) as any;
 if(phase==='rename')io.rename=(()=>{throw new Error('rename failed');}) as any;
 if(phase==='read')io.write=((...args:any[])=>{writeFileSync(args[0],args[1],args[2]);unlinkSync(join(f.root,e.request.reviewReceipt));}) as any;
 const r=finalizeDocPackage(f.root,e.request,io);assert.equal(r.planningAllowed,false);assert.deepEqual(readFileSync(join(f.root,'docs/project/manifest.json')),before);assert.equal(readdirSync(join(f.root,'docs/project')).some(p=>p.endsWith('.tmp')),false);
 }finally{f.close();}}
});
test("candidate/evidence changes before atomic publication deny, and real CLI success mutates only the manifest",()=>{
 const f=fixture();try{let e=receipts(f.root);const before=readFileSync(join(f.root,'docs/project/manifest.json'));const io={write:((...args:any[])=>{writeFileSync(args[0],args[1],args[2]);writeFileSync(join(f.root,'docs/project/04-usage.md'),'Concurrent edit\n');}) as any,rename:renameSync,remove:unlinkSync};
 assert.equal(finalizeDocPackage(f.root,e.request,io).issues[0].code,'DOC_APPROVAL_STALE');assert.deepEqual(readFileSync(join(f.root,'docs/project/manifest.json')),before);
 e=receipts(f.root);const documents=new Map(manifest(f.root).documents.map(d=>[d.path,readFileSync(join(f.root,'docs/project',d.path))]));
 const run=spawnSync(process.execPath,[resolve('.agents/scripts/finalize-doc-package.ts')],{cwd:f.root,input:JSON.stringify(e.request),encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(run.stdout).status,'APPROVED_VALID');
 for(const[path,bytes]of documents)assert.deepEqual(readFileSync(join(f.root,'docs/project',path)),bytes);
 }finally{f.close();}
});
