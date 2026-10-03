import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { host } from "./fixtures/routing/fixture.ts";
import { classifyTask, nextStage, inputJson } from "../scripts/classify-task.ts";

test("fixed junior/mid/senior routes and mixed highest tier", () => {
  const f = host(); try {
    const t = f.task; t.workKinds = ["static-ui"]; t.userEffects = ["visual"]; t.guidance.taskTopics = [];
    const junior = classifyTask(f.root, t); assert.equal(junior.reviewTier, "standard"); assert.equal(junior.securityRequired, false); assert.deepEqual(junior.qaMethods, ["visual", "responsive"]);
    assert.equal(nextStage(junior, "implementation", "APPROVED"), "review-standard");
    t.workKinds = ["client-logic"]; const mid = classifyTask(f.root, t); assert.equal(mid.devTier, "mid"); assert.equal(mid.reviewTier, "critical"); assert.equal(nextStage(mid, "review-critical", "APPROVED"), "security");
    for (const kind of ["auth", "database", "api", "filesystem", "internal", "cross-layer"]) { t.workKinds = ["static-ui", kind]; const r = classifyTask(f.root, t); assert.equal(r.devTier, "senior"); assert.equal(r.securityRequired, true); }
    assert.equal(nextStage(mid, "qa", "CHANGES_REQUIRED"), "remediation"); assert.equal(nextStage(mid, "qa", "BLOCKED"), "human-decision");
    assert.throws(() => nextStage(mid, "review-standard", "APPROVED"), /Wrong stage/);
  } finally { f.close(); }
});
test("backend internal work skips UI QA with an explicit reason", () => {
  const f = host("backend", "none"); try { const r = classifyTask(f.root, f.task); assert.equal(r.devTier, "senior"); assert.deepEqual(r.qaMethods, []); assert.equal(r.qaRequired, false); } finally { f.close(); }
});
test("combined methods, accessibility-only, and Next.js flow profiles", () => {
  const f = host("web", "nextjs"); try {
    f.task.userEffects = ["web-flow", "visual", "accessibility", "human-design"];
    assert.deepEqual(classifyTask(f.root, f.task).qaMethods, ["e2e-web", "exploratory", "visual", "responsive", "accessibility", "human-design"]);
    f.task.userEffects = ["accessibility"]; f.task.guidance.taskTopics = []; assert.deepEqual(classifyTask(f.root, f.task).qaMethods, ["accessibility"]);
    f.task.workKinds = ["api"]; f.task.guidance = { requestedSkills: ["nextjs-architecture"], taskTopics: ["route-handler"], frameworkInstructions: ["nextjs"] };
    assert.equal(classifyTask(f.root, f.task).devTier, "senior");
  } finally { f.close(); }
});
test("Electron profiles preserve process/renderer compatibility", () => {
  for (const framework of ["svelte", "react", "none"]) { const f = host("desktop", framework); try {
    f.task.workKinds = ["electron-ipc"]; assert.deepEqual(classifyTask(f.root, f.task).qaMethods, ["e2e-desktop", "exploratory"]);
    f.task.userEffects.push("visual"); if (framework === "none") assert.throws(() => classifyTask(f.root, f.task), /unavailable workspace/); else assert.equal(classifyTask(f.root, f.task).qaMethods.includes("visual"), true);
  } finally { f.close(); } }
});
test("contradictory/unknown/missing classification and stale source fail closed", () => {
  const f = host(); try {
    const t = f.task, r = classifyTask(f.root, t); t.declaredRouting = { devTier: "junior", reviewTier: "standard", securityRequired: false, qaRequired: false, qaMethods: [], requiredStages: ["implementation", "review-standard"] };
    assert.throws(() => classifyTask(f.root, t), /Displayed routing/); delete t.declaredRouting;
    for (const change of [(v: any) => v.surprise = true, (v: any) => delete v.authority, (v: any) => v.workKinds.push("made-up"), (v: any) => v.workKinds.push("client-logic"), (v: any) => v.userEffects.push("no-user-facing-change"), (v: any) => v.acceptanceChecks[0].sourceCriterion = "other#AC-1", (v: any) => v.authority.authorityFingerprint = "0".repeat(64)]) {
      const copy = structuredClone(t); change(copy); assert.throws(() => classifyTask(f.root, copy));
    }
    assert.throws(() => inputJson('{"schemaVersion":1,"schemaVersion":1}'));
    writeFileSync(join(f.root, "Context.md"), "Review Topology: Standard Review Only"); assert.throws(() => classifyTask(f.root, t), /legacy routing bypass/);
    assert.ok(r.taskFingerprint);
  } finally { f.close(); }
});
test("backend browser methods and contradictory server/flow guidance deny", () => {
  const f = host("backend", "none"); try { f.task.userEffects = ["web-flow"]; f.task.noUserFacingReason = null; f.task.guidance.taskTopics = ["browser-flow"]; assert.throws(() => classifyTask(f.root, f.task), /unavailable workspace/); } finally { f.close(); }
  const w = host(); try { w.task.guidance.taskTopics = ["backend"]; assert.throws(() => classifyTask(w.root, w.task), /Server guidance/); } finally { w.close(); }
});
test("transport line endings and reordered trait sets preserve task fingerprint", () => {
  const f = host(); try {
    f.task.workKinds = ["client-logic", "api"]; f.task.userEffects = ["web-flow", "accessibility"];
    const original = classifyTask(f.root, f.task).taskFingerprint;
    f.task.workKinds.reverse(); f.task.userEffects.reverse(); f.task.authority.extracts.forEach(e => e.content = e.content.replace(/\n/g, "\r\n"));
    assert.equal(classifyTask(f.root, f.task).taskFingerprint, original);
  } finally { f.close(); }
});
