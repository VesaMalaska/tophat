import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { evaluateAntigravityHook, maxHookInputBytes } from '../scripts/antigravity-hook.ts';

function fixture(git = true, framework = false) {
  const root = mkdtempSync(join(tmpdir(), 'tophat adapter '));
  cpSync(resolve('.agents/scripts'), join(root, '.agents/scripts'), { recursive: true });
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  const config = { schemaVersion: 1, workspace: framework ? { kind: 'web', framework: 'svelte' } : { kind: 'terminal', framework: 'none', mode: 'tui' },
    documentation: { package: 'docs/product', manifest: 'docs/product/manifest.json', derivedTargets: [] },
    validation: { scripts: { unit: 'test' }, commitGate: ['unit'], developmentPhaseGate: [], projectCompletionGate: [] }, routingMatrix: {} };
  writeFileSync(join(root, '.agents/tophat.config.json'), JSON.stringify(config));
  if (git) assert.equal(spawnSync('git', ['init', '-b', 'fixture'], { cwd: root }).status, 0);
  const script = join(root, '.agents/scripts/antigravity-hook.ts'), url = pathToFileURL(script).href;
  const payload = (name: string, args: object, extras: object = {}) => JSON.stringify({ conversationId: 'fixture-session', stepIdx: 1, workspacePaths: [root], toolCall: { name, args }, ...extras });
  const write = (name = 'notes.txt', content = 'fixture') => payload('write_to_file', { TargetFile: join(root, name), CodeContent: content });
  const command = (CommandLine: string, Cwd = root, extras: object = {}) => payload('run_command', { CommandLine, Cwd }, extras);
  const evaluate = (mode: string, input: string) => evaluateAntigravityHook(mode, input, url);
  const cli = (mode: string, input: string, cwd = join(root, '.agents'), more: string[] = []) => spawnSync(process.execPath, ['./scripts/antigravity-hook.ts', mode, ...more], { cwd, input, encoding: 'utf8', timeout: 15000 });
  return { root, url, script, payload, write, command, evaluate, cli, lock: join(root, '.git/locks/tophat.lock'), close: () => rmSync(root, { recursive: true, force: true }) };
}
const status = (result: ReturnType<typeof evaluateAntigravityHook>) => (result.output as { status?: string }).status;

test('direct Node launch from customization cwd uses installed root and original owner bytes', () => {
  const f = fixture();
  try {
    const input = f.write(), r = f.cli('pre-write', input);
    assert.equal(r.status, 0, r.stderr); assert.equal(JSON.parse(r.stdout).status, 'LOCK_ACQUIRED');
    const p = JSON.parse(input), owner = createHash('sha256').update(JSON.stringify([p.conversationId, p.toolCall.name, p.toolCall.args])).digest('hex');
    assert.equal(JSON.parse(readFileSync(f.lock, 'utf8')).owner, owner);
    const post = f.cli('post-write', input); assert.equal(post.status, 0, post.stderr); assert.deepEqual(JSON.parse(post.stdout), {}); assert.equal(existsSync(f.lock), false);
    assert.equal(existsSync(join(f.root, '.agents/.agents')), false);
  } finally { f.close(); }
});

test('exploration bypasses config and Git before initialization', () => {
  const f = fixture(false);
  try {
    rmSync(join(f.root, '.agents/tophat.config.json'));
    for (const command of ['ls', 'ls -la', 'ls .', 'pwd', 'node --version', 'pnpm -v', 'git --version']) {
      assert.equal(status(f.evaluate('pre-command', f.command(command, '/unselected/directory'))), 'SKIPPED_NOT_APPLICABLE');
      assert.deepEqual(f.evaluate('post-command', f.command(command)).output, {});
    }
    for (const name of ['view_file', 'list_dir', 'find_by_name', 'grep_search'])
      assert.equal(status(f.evaluate('pre-write', f.payload(name, {}, { workspacePaths: [] }))), 'SKIPPED_NOT_APPLICABLE');
    assert.equal(existsSync(join(f.root, '.git')), false);
  } finally { f.close(); }
});

test('known validator routing works before Git without executing policy or validator scripts', () => {
  const f = fixture(false);
  try {
    rmSync(join(f.root, '.agents/tophat.config.json'));
    for (const command of ["node .agents/scripts/validate-doc-package.ts '{\"mode\":\"draft\"}'", "node .agents/scripts/validate-doc-package.ts '{\"mode\":\"approved\"}'", 'node .agents/scripts/validate-command-catalog.ts --root . --host-root .'])
      assert.equal(status(f.evaluate('pre-command', f.command(command))), 'SKIPPED_NOT_APPLICABLE');
    assert.equal(existsSync(join(f.root, '.git')), false);
  } finally { f.close(); }
});

for (const command of ['ls; touch file', 'ls > notes.txt', 'ls | cat', 'pwd && true', 'ls $(touch file)', 'ls\npwd', 'node -e "process.exit(0)"', 'pnpm run docs:draft', 'echo /workspace-init', 'node .agents/scripts/validate-doc-package.ts invalid'])
  test(`unknown command cannot silently bypass macro gate: ${JSON.stringify(command)}`, () => {
    const f = fixture(false);
    try { assert.equal(status(f.evaluate('pre-command', f.command(command))), 'MACRO_APPLICABILITY_UNVERIFIED'); assert.equal(existsSync(join(f.root, '.git')), false); }
    finally { f.close(); }
  });

test('invented macro metadata is not an applicability discriminator', () => {
  const f = fixture();
  try {
    const r = f.evaluate('pre-command', f.command('echo fixture', f.root, { workflow: '/workspace-init', ANTIGRAVITY_CMD: '/architecture-pivot' }));
    assert.equal(status(r), 'MACRO_APPLICABILITY_UNVERIFIED'); assert.equal(existsSync(join(f.root, '.git/locks')), false);
    const post = f.evaluate('post-command', f.command('echo fixture')); assert.deepEqual(post.output, {}); assert.equal(post.exitCode, 1); assert.match(post.diagnostic!, /MACRO_APPLICABILITY_UNVERIFIED/);
  } finally { f.close(); }
});

test('protected denial and ask return before config loading or lock acquisition', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.root, '.agents/tophat.config.json'), 'invalid');
    assert.equal(status(f.evaluate('pre-write', f.write('Context.md', 'missing marker'))), 'ACTIVE_CHUNK_MISSING');
    const asked = f.evaluate('pre-write', f.write('Strategy.md')); assert.equal((asked.output as any).decision, 'ask');
    assert.equal(existsSync(join(f.root, '.git/locks')), false);
    const post = f.evaluate('post-write', f.write('Strategy.md')); assert.equal(post.exitCode, 1); assert.deepEqual(post.output, {}); assert.match(post.diagnostic!, /LOCK_RELEASE_FAILED/);
  } finally { f.close(); }
});

test('Svelte policy denies before locking; terminal profile keeps existing non-applicability', () => {
  const f = fixture(true, true), terminal = fixture();
  try {
    assert.equal(status(f.evaluate('pre-write', f.write('component.svelte', 'export let value;'))), 'SVELTE_5_CONSTRAINT_VIOLATION');
    assert.equal(existsSync(join(f.root, '.git/locks')), false);
    assert.equal(status(terminal.evaluate('pre-write', terminal.write('component.svelte', 'export let value;'))), 'LOCK_ACQUIRED');
    assert.equal(terminal.evaluate('post-write', terminal.write('component.svelte', 'export let value;')).exitCode, 0);
  } finally { f.close(); terminal.close(); }
});

test('allowed write before Git preserves backend denial and gives a prerequisite explanation', () => {
  const f = fixture(false);
  try { const r = f.evaluate('pre-write', f.write()); assert.equal(status(r), 'LOCK_ACQUIRE_FAILED'); assert.match((r.output as any).reason, /initialized host Git worktree/); assert.equal(existsSync(join(f.root, '.git')), false); }
  finally { f.close(); }
});

test('invalid config returns its existing denial without acquiring a lock', () => {
  const f = fixture();
  try { writeFileSync(join(f.root, '.agents/tophat.config.json'), '{}'); assert.equal(status(f.evaluate('pre-write', f.write())), 'TOPHAT_CONFIG_INVALID'); assert.equal(existsSync(f.lock), false); }
  finally { f.close(); }
});

test('mount order and parent mounting cannot change selected installation root', () => {
  const f = fixture(), other = fixture();
  try {
    const call = JSON.parse(f.write()); call.workspacePaths = [other.root, f.root];
    assert.equal(status(f.evaluate('pre-write', JSON.stringify(call))), 'LOCK_ACQUIRED'); assert.equal(existsSync(other.lock), false);
    assert.equal(f.evaluate('post-write', JSON.stringify(call)).exitCode, 0);
    call.workspacePaths = [tmpdir()]; assert.equal(status(f.evaluate('pre-write', JSON.stringify(call))), 'LOCK_ACQUIRED');
    assert.equal(f.evaluate('post-write', JSON.stringify(call)).exitCode, 0);
    call.workspacePaths = [other.root]; assert.equal(status(f.evaluate('pre-write', JSON.stringify(call))), 'HOOK_ROOT_INVALID');
  } finally { f.close(); other.close(); }
});

test('cross-host targets, symlink targets, config redirects and traversal deny before locks', () => {
  const f = fixture(), other = fixture();
  try {
    const targets = [join(other.root, 'notes.txt'), f.root + '/../outside.txt'];
    symlinkSync(other.root, join(f.root, 'redirect')); targets.push(join(f.root, 'redirect/notes.txt'));
    symlinkSync(join(other.root, 'missing'), join(f.root, 'dangling')); targets.push(join(f.root, 'dangling/notes.txt'));
    for (const TargetFile of targets) assert.equal(status(f.evaluate('pre-write', f.payload('write_to_file', { TargetFile, CodeContent: 'fixture' }))), 'HOOK_ROOT_INVALID');
    rmSync(join(f.root, '.agents/tophat.config.json')); symlinkSync(join(other.root, '.agents/tophat.config.json'), join(f.root, '.agents/tophat.config.json'));
    assert.equal(status(f.evaluate('pre-write', f.write())), 'HOOK_ROOT_INVALID'); assert.equal(existsSync(f.lock), false);
  } finally { f.close(); other.close(); }
});

test('nested installed hosts are not governed by the parent adapter', () => {
  const f = fixture();
  try { mkdirSync(join(f.root, 'nested/.agents/scripts'), { recursive: true }); writeFileSync(join(f.root, 'nested/.agents/scripts/antigravity-hook.ts'), 'fixture');
    assert.equal(status(f.evaluate('pre-write', f.payload('write_to_file', { TargetFile: join(f.root, 'nested/notes.txt'), CodeContent: 'fixture' }))), 'HOOK_ROOT_INVALID'); assert.equal(existsSync(f.lock), false);
  } finally { f.close(); }
});

test('validator commands accept nested cwd and quoted installation paths with spaces', () => {
  const f = fixture(false);
  try { mkdirSync(join(f.root, 'nested')); const command = `node '${join(f.root, '.agents/scripts/validate-doc-package.ts')}' '{"mode":"draft"}'`;
    assert.equal(status(f.evaluate('pre-command', f.command(command, join(f.root, 'nested')))), 'SKIPPED_NOT_APPLICABLE');
  } finally { f.close(); }
});

test('post release keeps unchanged owner comparison and preserves a mismatched reservation', () => {
  const f = fixture();
  try {
    const input = f.write(); assert.equal(status(f.evaluate('pre-write', input)), 'LOCK_ACQUIRED');
    const before = readFileSync(f.lock, 'utf8'), p = JSON.parse(input); p.toolCall.args = { CodeContent: 'fixture', TargetFile: join(f.root, 'notes.txt') };
    const r = f.evaluate('post-write', JSON.stringify(p)); assert.deepEqual(r.output, {}); assert.equal(r.exitCode, 1); assert.match(r.diagnostic!, /LOCK_OWNER_MISMATCH/); assert.equal(readFileSync(f.lock, 'utf8'), before);
    const failedTool = JSON.parse(input); failedTool.error = 'fixture tool error'; assert.equal(f.evaluate('post-write', JSON.stringify(failedTool)).exitCode, 0); assert.equal(existsSync(f.lock), false);
  } finally { f.close(); }
});

test('malformed pre/post payloads and lower Node versions fail with event-specific output', () => {
  const f = fixture(false);
  try {
    for (const input of ['', '{}', '[]', '{"toolCall":{},"toolCall":{}}', '{"toolCall":{"name":"write_to_file","args":[]}}']) {
      assert.equal(status(f.evaluate('pre-write', input)), 'HOOK_INPUT_INVALID'); const r = f.evaluate('post-write', input); assert.deepEqual(r.output, {}); assert.equal(r.exitCode, 1);
    }
    assert.equal(status(evaluateAntigravityHook('pre-write', f.write(), f.url, '22.0.0')), 'NODE_VERSION_UNSUPPORTED');
    assert.equal(status(f.evaluate('unknown', f.write())), 'HOOK_MODE_INVALID');
    assert.equal(existsSync(join(f.root, '.git')), false);
  } finally { f.close(); }
});

test('CLI bounds stdin and prints exactly one JSON response for input and argument errors', () => {
  const f = fixture(false);
  try {
    for (const [mode, input, extra] of [['pre-write', 'x'.repeat(maxHookInputBytes + 100), []], ['pre-write', f.write(), ['unexpected']]] as const) {
      const r = f.cli(mode, input, join(f.root, '.agents'), [...extra]); assert.equal(r.stdout.trim().split('\n').length, 1); assert.equal(JSON.parse(r.stdout).decision, 'deny');
    }
    const r = f.cli('post-write', ''); assert.equal(r.status, 1); assert.deepEqual(JSON.parse(r.stdout), {}); assert.match(r.stderr, /HOOK_INPUT_INVALID/);
  } finally { f.close(); }
});

test('disposable live probe captures actual transport and keeps configuration history', () => {
  const generator = resolve('.agents/tests/antigravity-hook-probe.mjs');
  const generated = spawnSync(process.execPath, [generator], { encoding: 'utf8' });
  assert.equal(generated.status, 0, generated.stderr); const f = JSON.parse(generated.stdout);
  try {
    const script = join(f.workspace, '.agents/scripts/probe.cjs');
    for (const [event, target, decision] of [['pre', 'allow.txt', 'allow'], ['pre', 'deny-sentinel.txt', 'deny'], ['pre', 'force-ask-sentinel.txt', 'force_ask'], ['post', 'allow.txt', undefined]] as const) {
      const input = JSON.stringify({ conversationId: 'fixture', stepIdx: 1, workspacePaths: [f.workspace], toolCall: { name: 'write_to_file', args: { TargetFile: join(f.workspace, target), CodeContent: 'fixture' } } });
      const r = spawnSync(process.execPath, [script, event, f.evidence], { cwd: join(f.workspace, '.agents'), input, encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr); const output = JSON.parse(r.stdout);
      if (decision) assert.equal(output.decision, decision); else assert.deepEqual(output, {});
    }
    const trace = readFileSync(join(f.evidence, 'trace.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
    assert.equal(trace.length, 4); assert.equal(trace[0].cwd, join(f.workspace, '.agents')); assert.equal(trace[0].execPath, process.execPath); assert.equal(trace[0].node, process.version);
    const relative = spawnSync(process.execPath, [generator, '--base', f.base, '--relative'], { encoding: 'utf8' }); assert.equal(relative.status, 0, relative.stderr);
    const next = JSON.parse(relative.stdout); assert.notEqual(next.hooksSha256, f.hooksSha256); assert.ok(existsSync(join(f.evidence, `hooks-${f.hooksSha256}.json`))); assert.ok(existsSync(join(f.evidence, `hooks-${next.hooksSha256}.json`)));
    const foreign = spawnSync(process.execPath, [generator, '--base', tmpdir()], { encoding: 'utf8' }); assert.notEqual(foreign.status, 0);
  } finally { rmSync(f.base, { recursive: true, force: true }); }
});
