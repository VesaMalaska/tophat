// Creates fresh, disposable qualification repositories; never changes an installed host.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
if (args.length > 1 || (args.length && !['--trailing', '--policy-only'].includes(args[0]))) throw Error('Use optional --trailing or --policy-only; each invocation creates a fresh disposable repository');
if (Number(process.versions.node.split('.')[0]) < 24) throw Error('Node >=24 is required');
const trailing = args[0] === '--trailing', policyOnly = args[0] === '--policy-only', source = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const base = mkdtempSync(join(tmpdir(), 'tophat-sequence-probe-'));
const workspace = join(base, 'workspace'), evidence = join(base, 'evidence'), scripts = join(workspace, '.agents/scripts');
mkdirSync(join(scripts, 'policy'), { recursive: true }); mkdirSync(evidence); mkdirSync(join(base, 'empty-git-hooks'));
writeFileSync(join(base, 'tophat-sequence-marker.json'), JSON.stringify({ purpose: 'tophat-hook-sequence-probe' }) + '\n');
copyFileSync(join(source, '.agents/tests/fixtures/antigravity-sequence/runtime.ts'), join(scripts, 'sequence-probe.ts'));
const files = ['enforce-strategy-lock.ts', 'enforce-svelte-runes.ts', 'swarm-lock.ts', 'load-tophat-config.ts', 'validate-doc-package.ts'];
for (const file of files) copyFileSync(join(source, '.agents/scripts', file), join(scripts, 'policy', file));
writeFileSync(join(workspace, 'package.json'), '{"type":"module","private":true,"scripts":{"test":"node --version"}}\n');
writeFileSync(join(workspace, 'Strategy.md'), '# Synthetic Strategy\n');
const config = { schemaVersion: 1, workspace: { kind: 'web', framework: 'svelte' }, documentation: { package: 'docs/product', manifest: 'docs/product/manifest.json', derivedTargets: [] },
  validation: { scripts: { unit: 'test' }, commitGate: ['unit'], developmentPhaseGate: [], projectCompletionGate: [] }, routingMatrix: {} };
writeFileSync(join(workspace, '.agents/tophat.config.json'), JSON.stringify(config, null, 2) + '\n');
const quote = s => "'" + s.replaceAll("'", "'\\''") + "'";
const handler = event => ({ type: 'command', command: `node ./scripts/sequence-probe.ts ${event} ${quote(evidence)}`, timeout: 30 });
const hooks = { 'tophat-sequence-diagnostic': { enabled: true,
  PreToolUse: [{ matcher: '^write_to_file$', hooks: [handler('pre-policy'), ...(!policyOnly ? [handler('pre-acquire')] : []), ...(trailing ? [handler('pre-trailing')] : [])] }],
  ...(!policyOnly ? { PostToolUse: [{ matcher: '^write_to_file$', hooks: [handler('post-release')] }] } : {}) } };
writeFileSync(join(workspace, '.agents/hooks.json'), JSON.stringify(hooks, null, 2) + '\n');
const git = argv => {
  const r = spawnSync('git', argv, { cwd: workspace, encoding: 'utf8', timeout: 15000, maxBuffer: 65536 });
  if (r.error || r.status !== 0) throw Error(`Disposable Git setup failed: ${r.stderr}`);
  return r.stdout.trim();
};
// These per-command settings apply only to this synthetic setup, never to a consumer repository.
git(['-c', `init.templateDir=${join(base, 'empty-git-hooks')}`, 'init', '-b', 'probe-baseline']);
git(['add', '.']);
git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', '-c', `core.hooksPath=${join(base, 'empty-git-hooks')}`, 'commit', '-m', 'Synthetic qualification baseline']);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inventory = ['.agents/hooks.json', '.agents/tophat.config.json', '.agents/scripts/sequence-probe.ts', ...files.map(f => `.agents/scripts/policy/${f}`)]
  .map(path => ({ path, sha256: digest(readFileSync(join(workspace, path))) }));
for (const item of inventory) writeFileSync(join(evidence, `${item.sha256}-${item.path.split('/').at(-1)}`), readFileSync(join(workspace, item.path)));
let sourceCommit = null;
const sourceGit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8', timeout: 10000 });
if (sourceGit.status === 0) sourceCommit = sourceGit.stdout.trim();
const setup = { base, workspace, evidence, trailing, policyOnly, sourceCommit, baselineCommit: git(['rev-parse', 'HEAD']), inventory,
  lock: join(workspace, '.git/locks/tophat.lock'), envFile: join(base, 'evidence.env') };
writeFileSync(setup.envFile, `export probe_base=${quote(base)}\nexport probe_workspace=${quote(workspace)}\nexport probe_evidence=${quote(evidence)}\n`, { mode: 0o600 });
writeFileSync(join(evidence, 'setup.json'), JSON.stringify(setup, null, 2) + '\n', { mode: 0o600 });
console.log(JSON.stringify(setup, null, 2));
