import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");
test("every task creation/amendment route requires the same classifier", () => {
  for (const name of ["generate-sprint-tasks", "generate-smoke-test", "triage-bug", "remediate-blocker"]) {
    const s = read(`.agents/workflows/${name}.md`); assert.match(s, /classify-task\.ts/); assert.match(s, /ROUTING_VALID/); assert.match(s, /taskClassification/);
  }
});
test("mid and senior cannot select standard review or topology bypass", () => {
  for (const tier of ["mid", "senior"]) {
    const s = read(`.agents/workflows/implement-${tier}.md`); assert.match(s, /\/review-critical/); assert.doesNotMatch(s, /\/review-standard|Standard Review Only|based on Topology/);
  }
  assert.doesNotMatch(read("Context.md"), /Review Topology|Standard Review Only/);
});
test("PM instructions grant no HUD/shell exception and publication has no state commit chain", () => {
  const pm = read(".agents/workflows/sprint-briefing.md"), rule = read(".agents/rules/agent-pm.md");
  assert.doesNotMatch(pm, /Authorized Execution|npx tsx|node .*scripts|run_command tool/); assert.match(pm, /no shell command/);
  assert.doesNotMatch(rule, /Scope Boundaries \(Enforced\)/); assert.match(rule, /No Execution Exception/);
  const pub = read(".agents/workflows/publish-pr.md"); assert.match(pub, /PUBLICATION_READY/); assert.doesNotMatch(pub, /git add Context|git commit|--base main|execute the logic of/);
});
test("developer and review roles share the semantic clean-code contract", () => {
  for (const name of ["agent-junior-dev", "agent-mid-dev", "agent-senior-dev", "agent-review-standard", "agent-review-critical", "agent-security-auditor"]) {
    const s = read(`.agents/rules/${name}.md`); assert.match(s, /meaningful names/); assert.match(s, /behavioral tests/); assert.match(s, /change locality/); assert.match(s, /No universal/);
  }
  const cases = read(".agents/tests/fixtures/routing/clean-code-cases.md");
  for (const label of ["Focused behavior", "Speculative abstraction", "Unrelated cleanup", "Duplicated rule", "Justified local refactor"]) assert.ok(cases.includes(label));
  assert.match(cases, /not an executable code-quality oracle/);
});
