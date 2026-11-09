import { catalog, readCommand } from './fixtures/commands.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, approve } from './fixtures/documentation/fixture.ts';
import { validateDocPackage } from '../scripts/validate-doc-package.ts';
const read = (name: string) => readCommand(name);
test('all scoped planning workflows declare fresh approved package validation before side effects', () => {
  for (const name of ['workspace-init', 'architecture-pivot', 'roadmap-sync', 'generate-sprint-tasks', 'generate-smoke-test', 'triage-bug', 'remediate-blocker']) {
    const s = read(name); assert.match(s, /validate-doc-package\.ts/); assert.match(s, /APPROVED_VALID/); assert.match(s, /Halt|halt|STOP/);
  }
  for (const name of ['generate-sprint-tasks', 'generate-smoke-test', 'triage-bug', 'remediate-blocker']) {
    assert.match(read(name), /validate-task-authority\.ts/); assert.match(read(name), /extract/);
  }
});
test('definition instructions separate drafter, read-only reviewer, and explicit human finalization', () => {
  assert.match(read('project-define'), /Stop at DRAFT/);
  assert.match(read('project-definition-review'), /reviewer outputs evidence but writes nothing/);
  assert.match(read('project-definition-finalize'), /STOP for the human's explicit APPROVED/);
  assert.match(read('project-definition-finalize'), /do not fabricate consent/);
  assert.equal(catalog.commands.find(c=>c.name==='generate-readme')!.state,'retired');
});
test('an explicitly invoked planning gate refuses draft without planning side effects', () => {
  const f = fixture(); try {
    const before = readdirSync(f.root); let writes = 0;
    // Test an obedient caller; this does not establish physical interception of agents.
    const plan = () => { if (validateDocPackage(f.root).planningAllowed) writes++; };
    plan(); assert.equal(writes, 0); assert.deepEqual(readdirSync(f.root), before);
    approve(f.root); plan(); assert.equal(writes, 1);
  } finally { f.close(); }
});
test('public package remains independently readable after removing private orchestration', () => {
  const f = fixture(); try {
    rmSync(join(f.root, '.agents'), { recursive: true });
    const guide = readFileSync(join(f.root, 'docs/project/README.md'), 'utf8');
    for (const [, target] of guide.matchAll(/\]\(([^)]+\.md)\)/g)) assert.ok(readFileSync(join(f.root, 'docs/project', target), 'utf8').length);
    for (const file of readdirSync(join(f.root, 'docs/project')).filter(x => x.endsWith('.md'))) {
      assert.doesNotMatch(readFileSync(join(f.root, 'docs/project', file), 'utf8'), /Linear|routingMatrix|tophat\.config|\.agents\//);
    }
  } finally { f.close(); }
});
