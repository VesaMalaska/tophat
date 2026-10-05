import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseTophatConfig } from '../scripts/load-tophat-config.ts';
import { runValidation } from '../scripts/run-validation.ts';
const source = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/runner-neutral');
function git(root: string, args: string[]): void { const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); }
function host(vitest: boolean) {
  const root = mkdtempSync(join(tmpdir(), 'tophat-actual-coverage-'));
  cpSync(source, root, { recursive: true, filter: p => !p.split('/').some(x => ['node_modules', 'coverage'].includes(x)) });
  if (vitest) { assert.ok(existsSync(join(source, 'node_modules/vitest')), 'Run pnpm --dir .agents/tests/fixtures/runner-neutral install --frozen-lockfile before the suite'); symlinkSync(join(source, 'node_modules'), join(root, 'node_modules'), 'dir'); }
  writeFileSync(join(root, '.gitignore'), 'node_modules/\ncoverage/\n');
  git(root, ['init', '-b', 'acceptance']); git(root, ['config', 'user.name', 'Fixture']); git(root, ['config', 'user.email', 'fixture@example.invalid']);
  const files = ['.gitignore', 'package.json', 'pnpm-lock.yaml', 'sum.js', 'node.test.js', 'vitest.test.js', 'coverage-subject.js', 'coverage.node.test.js', 'coverage.vitest.test.js', 'README.md'];
  git(root, ['--literal-pathspecs', 'add', '--', ...files]); git(root, ['commit', '-m', 'Synthetic runner host']);
  const run = (category: 'unit' | 'coverage', script: string) => {
    const config = parseTophatConfig(JSON.stringify({ schemaVersion: 1, workspace: { kind: 'backend', framework: 'none' }, documentation: { package: 'docs/project', manifest: 'manifest.json', derivedTargets: [] }, validation: { scripts: { [category]: script }, commitGate: [category], developmentPhaseGate: [category], projectCompletionGate: [category] }, routingMatrix: {} }));
    return runValidation({ gate: 'commitGate' }, root, 'pnpm', { candidateConfig: config, timeoutMs: 10000, maxBufferBytes: 65536, disableAutomaticSetup: true });
  };
  return { root, run, close: () => rmSync(root, { recursive: true, force: true }) };
}
test('actual Node coverage enforces host-owned passing and failing thresholds through pnpm', () => {
  const f = host(false); try {
    const passed = f.run('coverage', 'coverage:node:pass'), failed = f.run('coverage', 'coverage:node:fail');
    assert.equal(passed.status, 'PASSED', JSON.stringify(passed)); assert.match(passed.results[0].stdout!, /coverage-subject\.js/);
    assert.equal(failed.status, 'FAILED', JSON.stringify(failed)); assert.notEqual(failed.results[0].exitStatus, 0); assert.match(failed.results[0].stdout! + failed.results[0].stderr!, /does not meet threshold/);
  } finally { f.close(); }
});
test('actual Vitest V8 coverage enforces different host policies through the same pnpm runner', () => {
  const f = host(true); try {
    const passed = f.run('coverage', 'coverage:vitest:pass'), failed = f.run('coverage', 'coverage:vitest:fail');
    assert.equal(passed.status, 'PASSED', JSON.stringify(passed)); assert.match(passed.results[0].stdout!, /Coverage report from v8/);
    assert.equal(failed.status, 'FAILED', JSON.stringify(failed)); assert.notEqual(failed.results[0].exitStatus, 0); assert.match(failed.results[0].stdout! + failed.results[0].stderr!, /does not meet global threshold/);
  } finally { f.close(); }
});
test('both actual runners reproduce red then green without changing the shared executor', () => {
  const f = host(true); try {
    for (const script of ['unit:node', 'unit:vitest']) {
      writeFileSync(join(f.root, 'sum.js'), 'export function sum(a, b) { return a - b; }\n');
      assert.equal(f.run('unit', script).status, 'FAILED');
      writeFileSync(join(f.root, 'sum.js'), 'export function sum(a, b) { return a + b; }\n');
      assert.equal(f.run('unit', script).status, 'PASSED');
    }
  } finally { f.close(); }
});
