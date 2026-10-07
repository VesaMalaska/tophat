import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
function fixture(trailing = false) {
  const setup = spawnSync(process.execPath, [resolve('.agents/tests/antigravity-hook-sequence-probe.mjs'), ...(trailing ? ['--trailing'] : [])], { encoding: 'utf8' });
  assert.equal(setup.status, 0, setup.stderr); const f = JSON.parse(setup.stdout);
  const input = (target = 'Strategy.md', content = '# Approved synthetic strategy\n', stepIdx = 1) => JSON.stringify({ conversationId: 'synthetic-sequence', stepIdx, workspacePaths: [f.workspace], toolCall: { name: 'write_to_file', args: { TargetFile: join(f.workspace, target), CodeContent: content, Overwrite: true } } });
  const run = (event: string, raw = input()) => {
    const r = spawnSync(process.execPath, ['./scripts/sequence-probe.ts', event, f.evidence], { cwd: join(f.workspace, '.agents'), input: raw, encoding: 'utf8', timeout: 15000 });
    assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
  };
  const trace = () => readFileSync(join(f.evidence, 'trace.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
  return { ...f, input, run, trace, close: () => rmSync(f.base, { recursive: true, force: true }) };
}
test('qualification repeats unchanged policies before the unchanged backend and pairs original owner payload', () => {
  const f = fixture();
  try {
    assert.equal(f.run('pre-policy').decision, 'force_ask'); assert.equal(existsSync(f.lock), false);
    assert.equal(f.run('pre-acquire').status, 'LOCK_ACQUIRED');
    const p = JSON.parse(f.input());
    const owner = createHash('sha256').update(JSON.stringify([p.conversationId, p.toolCall.name, p.toolCall.args])).digest('hex');
    assert.equal(JSON.parse(readFileSync(f.lock, 'utf8')).owner, owner);
    writeFileSync(join(f.workspace, 'Strategy.md'), p.toolCall.args.CodeContent);
    assert.deepEqual(f.run('post-release'), {}); assert.equal(existsSync(f.lock), false);
    const events = f.trace(); assert.deepEqual(events[0].checks, events[1].checks); assert.equal(events[0].checks.protectedWrite.decision, 'ask');
    assert.equal(events[1].checks.framework.decision, 'allow'); assert.equal(events[1].backend.status, 'LOCK_ACQUIRED');
    for (const item of f.inventory) assert.equal(createHash('sha256').update(readFileSync(join(f.workspace, item.path))).digest('hex'), item.sha256);
    for (const file of ['enforce-strategy-lock.ts', 'enforce-svelte-runes.ts', 'swarm-lock.ts', 'load-tophat-config.ts', 'validate-doc-package.ts'])
      assert.deepEqual(readFileSync(join(f.workspace, '.agents/scripts/policy', file)), readFileSync(resolve('.agents/scripts', file)));
  } finally { f.close(); }
});
for (const drift of ['target', 'branch', 'config', 'valid-config', 'index']) test(`acquisition rejects ${drift} drift before any backend call`, () => {
  const f = fixture();
  try {
    assert.equal(f.run('pre-policy').decision, 'force_ask');
    if (drift === 'target') writeFileSync(join(f.workspace, 'Strategy.md'), '# Changed during approval\n');
    if (drift === 'branch') assert.equal(spawnSync('git', ['switch', '-c', 'probe-drift'], { cwd: f.workspace }).status, 0);
    if (drift === 'config') writeFileSync(join(f.workspace, '.agents/tophat.config.json'), '{}');
    if (drift === 'valid-config') {
      const path = join(f.workspace, '.agents/tophat.config.json'), config = JSON.parse(readFileSync(path, 'utf8'));
      config.routingMatrix['/synthetic'] = 'fixture-model'; writeFileSync(path, JSON.stringify(config));
    }
    if (drift === 'index') {
      writeFileSync(join(f.workspace, 'index-drift.txt'), 'synthetic drift');
      assert.equal(spawnSync('git', ['add', 'index-drift.txt'], { cwd: f.workspace }).status, 0);
    }
    const result = f.run('pre-acquire'); assert.equal(result.decision, 'deny');
    assert.equal(result.status, drift === 'config' ? 'TOPHAT_CONFIG_INVALID' : 'PROBE_STATE_DRIFT');
    assert.equal(existsSync(f.lock), false); assert.equal(f.trace().at(-1).backend, undefined); assert.ok(f.trace().at(-1).checks);
  } finally { f.close(); }
});
test('policy denial and missing first-handler state cannot acquire a reservation', () => {
  const f = fixture();
  try {
    assert.equal(f.run('pre-policy', f.input('deny-sentinel.svelte', 'export let value;')).status, 'SVELTE_5_CONSTRAINT_VIOLATION');
    assert.equal(f.run('pre-acquire', f.input('Strategy.md', 'fixture', 2)).decision, 'deny');
    assert.equal(existsSync(f.lock), false);
  } finally { f.close(); }
});
test('trailing force_ask preserves a real reservation when no post event occurs; no cleanup is manufactured', () => {
  const f = fixture(true);
  try {
    const hooks = JSON.parse(readFileSync(join(f.workspace, '.agents/hooks.json'), 'utf8'))['tophat-sequence-diagnostic'];
    assert.equal(hooks.PreToolUse[0].hooks.length, 3);
    assert.equal(f.run('pre-policy').decision, 'force_ask');
    assert.equal(f.run('pre-acquire').status, 'LOCK_ACQUIRED'); const held = readFileSync(f.lock, 'utf8');
    assert.equal(f.run('pre-trailing').decision, 'force_ask');
    assert.equal(readFileSync(f.lock, 'utf8'), held); assert.equal(f.trace().at(-1).lockAfter.present, true);
    assert.equal(f.trace().some(r => r.event === 'post-release'), false);
  } finally { f.close(); }
});
