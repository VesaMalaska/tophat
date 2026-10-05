import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(p:string)=>readFileSync(p,'utf8');
test('advisory state and audit instructions cannot authorize role writes or tickets',()=>{
 const strategy=read('.agents/workflows/strategy-sync.md'),audit=read('.agents/workflows/refactor-audit.md'),context=read('.agents/rules/workspace-context.md');
 assert.match(strategy,/unchanged source inputs and unchanged approved proposal/);assert.match(strategy,/inspect-role-session\.ts/);assert.doesNotMatch(strategy,/inject it directly|aggressively prune|You own/);
 assert.match(audit,/no Git mutation/);assert.match(audit,/not ticket-creation authorization/);assert.doesNotMatch(audit,/Task Proposal|create the issues|ls -R/);
 assert.doesNotMatch(context,/workflow-context-sync/);assert.match(context,/before final review\/security\/QA sealing/);
});
test('technical guidance names compiled rune modules and host-owned validation',()=>{
 assert.match(read('.agents/skills/svelte5-runes-architecture/SKILL.md'),/\.svelte\.ts/);
 assert.doesNotMatch(read('.agents/skills/svelte5-kit-architecture/SKILL.md'),/via `export let data/);
 const vitest=read('.agents/skills/vitest-tdd/SKILL.md');assert.doesNotMatch(vitest,/npx vitest|pnpm run unit/);assert.match(vitest,/validation\.scripts\.unit/);assert.match(vitest,/not arbitrary filename/);
 assert.doesNotMatch(read('.agents/skills/playwright-qa-flows-web/SKILL.md'),/waitForLoadState/);
});
test('conditional host choices preserve explicit safety conflict and bounded-context rules',()=>{
 for(const name of ['sqlite-high-performance','supabase-multitenant-data','owasp-top-10','tailwind-semantic-ui','tailwind-desktop-ui','playwright-qa-flows-desktop']){
  const s=read(`.agents/skills/${name}/SKILL.md`);assert.match(s,/approved host/);assert.match(s,/halt for human resolution/);assert.match(s,/authorized task extracts/);
 }
 assert.doesNotMatch(read('.agents/skills/owasp-top-10/SKILL.md'),/restrict.*to the `auth.uid\(\)`/);
 assert.doesNotMatch(read('.agents/skills/playwright-qa-flows-desktop/SKILL.md'),/This is an offline application|must use this exact bootstrapping/);
});
test('all execution and independent review checklists require meaningful bidirectional trace',()=>{
 for(const name of ['agent-junior-dev','agent-mid-dev','agent-senior-dev','agent-review-standard','agent-review-critical','agent-security-auditor','agent-qa']){
  const s=read(`.agents/rules/${name}.md`);assert.match(s,/actual stable criterion IDs/);assert.match(s,/every changed behavior/);assert.match(s,/vacuous tests/);assert.match(s,/visual\/manual/);
 }
});
