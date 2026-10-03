import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync, mkdirSync, symlinkSync, linkSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { inspectDocPackage, validateDocPackage, strictJson, sourceBlocks, digest, canonical, canonicalSchemaPath } from "../scripts/validate-doc-package.ts";
import { fixture, manifest, saveManifest, approve } from "./fixtures/documentation/fixture.ts";

const cases: Array<[string, (m: ReturnType<typeof manifest>) => void, string]> = [
  ["unknown metadata", m => (m as any).unexpected = true, "DOC_METADATA_INVALID"],
  ["schema version", m => (m as any).schemaVersion = 2, "DOC_METADATA_INVALID"],
  ["invalid approval status", m => (m as any).approvalStatus = "automatic", "DOC_METADATA_INVALID"],
  ["invalid document role", m => (m.documents[0] as any).role = "private", "DOC_METADATA_INVALID"],
  ["invalid document status", m => (m.documents[0] as any).status = "draft", "DOC_METADATA_INVALID"],
  ["duplicate document ID", m => m.documents[1].id = m.documents[0].id, "DOC_DUPLICATE_ID"],
  ["duplicate document path", m => m.documents[1].path = m.documents[0].path, "DOC_DUPLICATE_PATH"],
  ["missing dependency", m => m.documents[1].dependsOn = ["absent"], "DOC_DEPENDENCY_INVALID"],
  ["self cycle", m => m.documents[0].dependsOn = [m.documents[0].id], "DOC_DEPENDENCY_CYCLE"],
  ["multi-document cycle", m => m.documents[0].dependsOn = ["product"], "DOC_DEPENDENCY_CYCLE"],
  ["invalid reading order", m => m.readingOrder.reverse(), "DOC_READING_ORDER_INVALID"],
  ["missing active reading entry", m => m.readingOrder.pop(), "DOC_READING_ORDER_INVALID"],
  ["duplicate reading entry", m => m.readingOrder.push(m.readingOrder[0]), "DOC_DUPLICATE_ID"],
  ["inactive prerequisite", m => m.documents[0].status = "inactive", "DOC_DEPENDENCY_INVALID"],
  ["authority conflict", m => m.documents[2].authority.push("requirements"), "DOC_AUTHORITY_CONFLICT"],
  ["derived authority", m => m.documents[3].authority = ["requirements"], "DOC_AUTHORITY_CONFLICT"],
  ["invalid source responsibility", m => m.documents[1].items[0].authority = "absent", "DOC_AUTHORITY_CONFLICT"],
  ["undeclared document scope", m => m.documents[0].scope = ["absent"], "DOC_SCOPE_INVALID"],
  ["overlapping scopes", m => m.scope.inactive = ["core"], "DOC_SCOPE_INVALID"],
  ["undeclared item scope", m => m.documents[1].items[0].scope = "absent", "DOC_SCOPE_INVALID"],
  ["duplicate local ID", m => m.documents[1].items[1].id = m.documents[1].items[0].id, "DOC_DUPLICATE_ID"],
  ["unresolved criterion", m => m.documents[1].items[0].acceptanceCriteria = ["product#absent"], "DOC_TRACE_INVALID"],
  ["wrong criterion kind", m => m.documents[1].items[0].acceptanceCriteria = ["contracts#CON-001"], "DOC_TRACE_INVALID"],
  ["orphan criterion", m => { m.documents[1].items[1].scope = "future"; m.documents[1].scope.push("future"); }, "DOC_TRACE_INVALID"],
  ["invalid decision state", m => (m.documents[0].items[0] as any).decisionState = "approved", "DOC_METADATA_INVALID"],
  ["superseded without successor", m => m.documents[0].items[0].decisionState = "superseded", "DOC_METADATA_INVALID"],
  ["supersession cycle", m => { m.documents[0].items[0].decisionState = "superseded"; m.documents[0].items[0].supersededBy = "decisions#DEC-001"; }, "DOC_DECISION_CYCLE"],
];
for (const [name, change, code] of cases) test(`package denies ${name}`, () => {
  const f = fixture(); try { const m = manifest(f.root); change(m); saveManifest(f.root, m); assert.equal(validateDocPackage(f.root, "draft").issues[0]?.code, code); } finally { f.close(); }
});

test("draft success never permits planning; approved package has exact authoritative hashes", () => {
  const f = fixture(); try {
    assert.equal(validateDocPackage(f.root, "draft").status, "DRAFT_VALID");
    assert.equal(validateDocPackage(f.root, "draft").planningAllowed, false);
    assert.equal(validateDocPackage(f.root).planningAllowed, false);
    approve(f.root); const result = inspectDocPackage(f.root); assert.equal(result.report.status, "APPROVED_VALID");
    for (const d of manifest(f.root).documents.filter(d => d.role === "authoritative"))
      assert.equal(d.sha256, digest(readFileSync(join(f.root, "docs/project", d.path))));
  } finally { f.close(); }
});
test("changed authority bytes report expected/calculated hashes without any repair", () => {
  const f = fixture(); try {
    approve(f.root); const before = readFileSync(join(f.root, "docs/project/manifest.json"));
    writeFileSync(join(f.root, "docs/project/02-product.md"), readFileSync(join(f.root, "docs/project/02-product.md"), "utf8").replace(/\n/g, "\r\n"));
    const r = validateDocPackage(f.root); assert.equal(r.documentationState, "INVALIDATED"); assert.equal(r.issues[0].code, "DOC_HASH_MISMATCH");
    assert.match(r.issues[0].expected!, /^[a-f0-9]{64}$/); assert.match(r.issues[0].calculated!, /^[a-f0-9]{64}$/);
    assert.notEqual(r.issues[0].expected, r.issues[0].calculated); assert.deepEqual(readFileSync(join(f.root, "docs/project/manifest.json")), before);
  } finally { f.close(); }
});
test("authority metadata edits invalidate approval; derived byte edits preserve authority", () => {
  const f = fixture(); try {
    approve(f.root); const initial = validateDocPackage(f.root);
    writeFileSync(join(f.root, "docs/project/04-usage.md"), "# Updated usage\n");
    const derived = validateDocPackage(f.root); assert.equal(derived.status, "APPROVED_VALID"); assert.equal(derived.authorityFingerprint, initial.authorityFingerprint);
    assert.notEqual(derived.candidateFingerprint, initial.candidateFingerprint);
    const m = manifest(f.root); m.version = "2.0.0"; saveManifest(f.root, m);
    assert.equal(validateDocPackage(f.root).issues[0].code, "DOC_AUTHORITY_FINGERPRINT_MISMATCH");
  } finally { f.close(); }
});
test("missing/invalid authority hashes and proposed active decisions block approved mode", () => {
  const f = fixture(); try {
    approve(f.root); const m = manifest(f.root); delete m.documents[0].sha256; saveManifest(f.root, m);
    assert.equal(validateDocPackage(f.root).issues[0].code, "DOC_HASH_MISSING");
    m.documents[0].sha256 = "bad"; saveManifest(f.root, m); assert.equal(validateDocPackage(f.root).issues[0].code, "DOC_METADATA_INVALID");
    delete m.documents[0].sha256; m.approvalStatus = "draft"; m.documents[0].items[0].decisionState = "proposed"; saveManifest(f.root,m);
    assert.equal(validateDocPackage(f.root,"draft").status,"DRAFT_VALID");
  } finally { f.close(); }
});
test("inactive retained authoritative bytes are also hashed", () => {
  const f = fixture(); try {
    const m = manifest(f.root); m.documents.push({ id: "history", path: "05-history.md", version: "1", status: "inactive", role: "authoritative", authority: ["old-contract"], dependsOn: [], scope: ["future"], items: [] });
    writeFileSync(join(f.root,"docs/project/05-history.md"),"# Historical specification\n"); saveManifest(f.root,m); approve(f.root);
    writeFileSync(join(f.root,"docs/project/05-history.md"),"Changed history\n"); assert.equal(validateDocPackage(f.root).issues[0].code,"DOC_HASH_MISMATCH");
  } finally { f.close(); }
});
for (const path of ["../escape.md", "/tmp/escape.md", "C:/escape.md", "C:\\escape.md", "docs\\escape.md", "//server/share.md", "nested//file.md", "a/./b.md", "a/../b.md"]) test(`unsafe declared path denies: ${path}`, () => {
  const f = fixture(); try { const m=manifest(f.root); m.documents[0].path=path; saveManifest(f.root,m); assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_PATH_INVALID"); }finally{f.close();}
});
test("missing files, directory instead of file, and package outside docs deny", () => {
  const f=fixture();try {
    rmSync(join(f.root,"docs/project/01-decisions.md"));assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_FILE_UNAVAILABLE");
    mkdirSync(join(f.root,"docs/project/01-decisions.md"));assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_FILE_UNAVAILABLE");
    const c=JSON.parse(readFileSync(join(f.root,".agents/tophat.config.json"),"utf8"));c.documentation.package="other";writeFileSync(join(f.root,".agents/tophat.config.json"),JSON.stringify(c));
    assert.equal(validateDocPackage(f.root).issues[0].code,"DOC_PATH_INVALID");
  }finally{f.close();}
});
test("symlink files/components, hard-link aliases, case collisions and private copies deny", () => {
  for (const kind of ["symlink", "component", "hardlink", "case", "private"]) {
    const f=fixture();try {
      const m=manifest(f.root), base=join(f.root,"docs/project");
      if(kind==="symlink"){rmSync(join(base,"01-decisions.md"));symlinkSync(join(f.root,"README.md"),join(base,"01-decisions.md"));}
      if(kind==="component"){symlinkSync(base,join(base,"linked"));m.documents[0].path="linked/01-decisions.md";}
      if(kind==="hardlink"){rmSync(join(base,"03-contracts.md"));linkSync(join(base,"01-decisions.md"),join(base,"03-contracts.md"));}
      if(kind==="case"){writeFileSync(join(base,"01-DECISIONS.md"),"# Collision\n");m.documents[2].path="01-DECISIONS.md";}
      if(kind==="private"){writeFileSync(join(base,"Roadmap.md"),"# Copied private roadmap\n");m.documents[0].path="Roadmap.md";}
      saveManifest(f.root,m);assert.equal(validateDocPackage(f.root,"draft").issues[0].code,kind==="hardlink"||kind==="case"?"DOC_DUPLICATE_PATH":kind==="private"?"DOC_PRIVATE_PATH":"DOC_PATH_INVALID",kind);
    }finally{f.close();}
  }
});
test("schema cannot be weakened; malformed JSON and duplicate keys deny", () => {
  const f=fixture();try {
    const schema=join(f.root,"docs/project/manifest.schema.json");writeFileSync(schema,'{}');assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_SCHEMA_INVALID");
    writeFileSync(schema,readFileSync(canonicalSchemaPath));
    writeFileSync(join(f.root,"docs/project/manifest.json"),'{"schemaVersion":1,"schemaVersion":1}');assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_JSON_DUPLICATE_KEY");
    writeFileSync(join(f.root,"docs/project/manifest.json"),'{');assert.equal(validateDocPackage(f.root,"draft").issues[0].code,"DOC_JSON_INVALID");
    assert.throws(()=>strictJson('{"a":{"x":1,"x":2}}',"test"),/repeats/);
    assert.deepEqual(strictJson('{"a":"quoted \\\" key","b":[true,null,1]}',"test"),{a:'quoted " key',b:[true,null,1]});
  }finally{f.close();}
});
test("canonical schema and closed parser agree on required shapes and independent constraints", () => {
  const schema=JSON.parse(readFileSync(canonicalSchemaPath,"utf8"));assert.equal(schema.additionalProperties,false);
  assert.deepEqual(schema.properties.documents.items.required,["id","path","version","status","role","authority","dependsOn","scope","items"]);
  assert.deepEqual(schema.properties.approvalStatus.enum,["draft","awaiting-human-approval","approved"]);
  assert.equal(schema.properties.documents.items.properties.items.items.additionalProperties,false);
  assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2}));
});
test("anchor whitespace is tolerated; fenced examples, empty/duplicate/missing anchors deny", () => {
  const item={id:"REQ-1",kind:"contract" as const,authority:"contracts",scope:"core"};
  assert.equal(sourceBlocks('  <a  id = "REQ-1" > </a> \nExact text\n',[item],"doc").get("REQ-1"),"Exact text\n");
  for(const s of ['```html\n<a id="REQ-1"></a>\nexample\n```\n','~~~html\n<a id="REQ-1"></a>\nexample\n~~~\n','<a id="REQ-1"></a>\n','<a id="REQ-1"></a>\ntext\n<a id="REQ-1"></a>\ntext'])assert.throws(()=>sourceBlocks(s,[item],"doc"));
  assert.throws(()=>sourceBlocks('<a id="UNDECLARED"></a>\ntext\n',[item],"doc"));
});
test("one combined authority document is valid without copying a large product document set",()=>{
  const f=fixture();try{
    const m=manifest(f.root);const combined={...m.documents[1],id:"combined",path:"01-combined.md",dependsOn:[],authority:["requirements","acceptance-criteria","decisions","public-contracts"],items:m.documents.slice(0,3).flatMap(d=>d.items)};
    combined.items[1].acceptanceCriteria=["combined#AC-001"];
    writeFileSync(join(f.root,"docs/project/01-combined.md"),m.documents.slice(0,3).map(d=>readFileSync(join(f.root,"docs/project",d.path),"utf8")).join("\n"));
    m.documents=[combined];m.readingOrder=["combined"];saveManifest(f.root,m);approve(f.root);assert.equal(validateDocPackage(f.root).planningAllowed,true);
  }finally{f.close();}
});
test("package CLI runs real read-only checks and rejects malformed requests",()=>{
  const f=fixture();try{
    const script=resolve('.agents/scripts/validate-doc-package.ts');const before=readFileSync(join(f.root,"docs/project/manifest.json"));
    const run=(input:string)=>spawnSync(process.execPath,[script],{cwd:f.root,input,encoding:"utf8"});
    const draft=run('{"mode":"draft"}');assert.equal(draft.status,0);assert.equal(JSON.parse(draft.stdout).planningAllowed,false);
    for(const bad of ['','{','{"mode":"other"}','{"unexpected":true}']){const r=run(bad);assert.equal(r.status,1);assert.equal(JSON.parse(r.stdout).status,"DENIED");}
    assert.deepEqual(readFileSync(join(f.root,"docs/project/manifest.json")),before);
    assert.equal(validateDocPackage(process.cwd()).issues[0].code,"TOPHAT_CONFIG_INVALID");
  }finally{f.close();}
});
