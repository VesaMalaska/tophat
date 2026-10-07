// Disposable qualification only. This is not a production adapter or approval authority.
import { readFileSync, writeFileSync, appendFileSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { evaluateProtectedWrite } from './policy/enforce-strategy-lock.ts';
import { evaluateSvelteWrite } from './policy/enforce-svelte-runes.ts';
import { evaluateSwarmLock } from './policy/swarm-lock.ts';
import { strictJson } from './policy/validate-doc-package.ts';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const event = process.argv[2], evidence = process.argv[3];
const digest = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
const deny = (status: string, reason: string) => ({ decision: 'deny', status, reason });
const git = (args: string[]): string => {
  const r = spawnSync('git', ['--no-optional-locks', ...args], { cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 65536 });
  if (r.error || r.status !== 0 || !r.stdout.trim() || /[\r\n\0]/.test(r.stdout.trim())) throw Error('Cannot read disposable Git identity');
  return r.stdout.trim();
};
function fileState(path: string) {
  if (!existsSync(path)) { try { lstatSync(path); throw Error('Unsafe missing path'); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } return null; }
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Expected a regular disposable file');
  return { sha256: digest(readFileSync(path)), mode: stat.mode, ino: stat.ino, dev: stat.dev };
}
function state(target: string) {
  if (realpathSync(root) !== realpathSync(git(['rev-parse', '--show-toplevel']))) throw Error('Wrong disposable Git root');
  return { target: fileState(target), config: fileState(join(root, '.agents/tophat.config.json')),
    head: git(['rev-parse', 'HEAD']), branch: git(['symbolic-ref', 'HEAD']),
    commonDir: realpathSync(resolve(root, git(['rev-parse', '--git-common-dir']))),
    index: fileState(resolve(root, git(['rev-parse', '--git-path', 'index']))) };
}
function lockState() {
  const path = join(root, '.git/locks/tophat.lock');
  return existsSync(path) ? { present: true, contents: readFileSync(path, 'utf8') } : { present: false };
}

let raw = '', overflow = false;
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { if (!overflow) { raw += chunk; if (Buffer.byteLength(raw) > 1024 * 1024) { overflow = true; raw = ''; } } });
process.stdin.on('end', () => {
  let payload: any, output: any, checks: any, baseline: any, current: any, backend: any, before: any;
  let exitCode = 0, marked = false;
  try {
    if (process.argv.length !== 4 || !['pre-policy', 'pre-acquire', 'pre-trailing', 'post-release'].includes(event)) throw Error('Invalid qualification event');
    if (Number(process.versions.node.split('.')[0]) < 24 || overflow) throw Error('Invalid runtime or oversized input');
    if (!evidence || resolve(evidence) !== join(dirname(root), 'evidence') || realpathSync(evidence) !== evidence ||
        JSON.parse(readFileSync(join(dirname(root), 'tophat-sequence-marker.json'), 'utf8')).purpose !== 'tophat-hook-sequence-probe') throw Error('Not a marked disposable workspace');
    marked = true;
    payload = strictJson(raw);
    if (!payload || typeof payload.conversationId !== 'string' || !payload.conversationId || payload.conversationId.length > 256 ||
        !Number.isSafeInteger(payload.stepIdx) || !Array.isArray(payload.workspacePaths) || !payload.workspacePaths.includes(root) ||
        payload.toolCall?.name !== 'write_to_file' || typeof payload.toolCall.args?.CodeContent !== 'string' ||
        ![join(root, 'Strategy.md'), join(root, 'deny-sentinel.svelte')].includes(payload.toolCall.args?.TargetFile)) throw Error('Unsupported disposable file call');
    const target = payload.toolCall.args.TargetFile;
    // Snapshot lookup preserves argument order. It does not replace backend owner identity.
    const key = digest(JSON.stringify([payload.conversationId, payload.stepIdx, payload.toolCall]));
    const path = join(evidence, `state-${key}.json`);
    before = lockState();
    if (event === 'pre-policy' || event === 'pre-acquire') {
      checks = { protectedWrite: evaluateProtectedWrite(raw), framework: evaluateSvelteWrite(raw, root) };
      if (checks.protectedWrite.decision === 'deny') output = checks.protectedWrite;
      else if (checks.framework.decision === 'deny') output = checks.framework;
      else {
        current = state(target);
        if (event === 'pre-policy') {
          if (existsSync(path)) output = deny('PROBE_REPEAT_UNVERIFIED', 'Repeated pre-policy event requires inspection');
          else {
            writeFileSync(path, JSON.stringify({ call: payload.toolCall, state: current }), { flag: 'wx', mode: 0o600 });
            output = { decision: 'force_ask', status: 'PROBE_APPROVAL_REQUIRED', reason: 'First qualification prompt; no reservation has been acquired by this handler.' };
          }
        } else {
          baseline = JSON.parse(readFileSync(path, 'utf8'));
          if (JSON.stringify(baseline.call) !== JSON.stringify(payload.toolCall) || JSON.stringify(baseline.state) !== JSON.stringify(current))
            output = deny('PROBE_STATE_DRIFT', 'Target, configuration or Git identity changed while awaiting approval; no acquisition attempted.');
          else output = backend = evaluateSwarmLock('acquire', 'tophat', raw, root);
        }
      }
    } else if (event === 'pre-trailing') {
      output = { decision: 'force_ask', status: 'PROBE_TRAILING_APPROVAL', reason: 'Deliberate trailing qualification prompt. Reject to test whether an existing reservation is orphaned.' };
    } else {
      backend = evaluateSwarmLock('release', 'tophat', raw, root); output = {};
      if (backend.decision === 'deny') { exitCode = 1; process.stderr.write(`${backend.status}: ${backend.reason}\n`); }
    }
  } catch (error) {
    output = event === 'post-release' ? {} : deny('PROBE_INPUT_OR_STATE_INVALID', (error as Error).message);
    if (event === 'post-release') exitCode = 1;
  }
  if (marked) {
    const record = { event, at: new Date().toISOString(), cwd: process.cwd(), execPath: process.execPath, node: process.version,
      raw, payload, checks, baseline, current, backend, lockBefore: before, lockAfter: lockState(), output };
    appendFileSync(join(evidence, 'trace.jsonl'), JSON.stringify(record) + '\n', { mode: 0o600 });
  }
  process.stdout.write(JSON.stringify(output) + '\n'); process.exitCode = exitCode;
});
