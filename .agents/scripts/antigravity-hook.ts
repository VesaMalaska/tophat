import { lstatSync, realpathSync, existsSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateSwarmLock } from './swarm-lock.ts';
import { evaluateProtectedWrite } from './enforce-strategy-lock.ts';
import { evaluateSvelteWrite } from './enforce-svelte-runes.ts';
import { strictJson } from './validate-doc-package.ts';

export const hookModes = ['pre-write', 'post-write', 'pre-command', 'post-command'] as const;
export const maxHookInputBytes = 1024 * 1024;
type HookMode = typeof hookModes[number];
type Decision = { decision: 'allow' | 'deny' | 'ask' | 'force_ask'; status: string; reason: string };
export type HookResult = { output: Decision | Record<string, never>; exitCode: 0 | 1; diagnostic?: string };
type Payload = { toolCall: { name: string; args: Record<string, unknown> }; workspacePaths?: unknown };
const writeTools = ['write_to_file', 'replace_file_content', 'multi_replace_file_content'];
const readTools = ['view_file', 'list_dir', 'find_by_name', 'grep_search'];
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const deny = (status: string, reason: string): Decision => ({ decision: 'deny', status, reason });
const allow = (status: string, reason: string): Decision => ({ decision: 'allow', status, reason });

function transport(mode: string, decision: Decision): HookResult {
  if (mode.startsWith('post-')) return {
    output: {}, exitCode: decision.decision === 'deny' ? 1 : 0,
    ...(decision.decision === 'deny' ? { diagnostic: `${decision.status}: ${decision.reason}` } : {}),
  };
  return { output: decision, exitCode: 0 };
}
function inputPayload(input: string): Payload {
  if (Buffer.byteLength(input, 'utf8') > maxHookInputBytes) throw Error('Hook input exceeds the 1 MiB limit');
  const payload = strictJson(input, 'hook input');
  if (!record(payload) || !record(payload.toolCall) || typeof payload.toolCall.name !== 'string' || !record(payload.toolCall.args))
    throw Error('Expected toolCall.name and toolCall.args');
  return payload as unknown as Payload;
}
function within(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}
function absolutePath(value: unknown): string {
  if (typeof value !== 'string' || !isAbsolute(value) || /[\x00-\x1f\x7f\\]/.test(value) || value.split(sep).includes('..'))
    throw Error('Expected an absolute path without traversal or control characters');
  return resolve(value);
}
/** Installation identity comes from the adapter module, never mount order or command cwd. */
function hostRoot(moduleUrl: string, mounts: unknown): string {
  const script = fileURLToPath(moduleUrl), scripts = dirname(script), agents = dirname(scripts), root = dirname(agents);
  if (basename(script) !== 'antigravity-hook.ts' || basename(scripts) !== 'scripts' || basename(agents) !== '.agents' ||
      !lstatSync(script).isFile() || [script, scripts, agents, root].some(path => lstatSync(path).isSymbolicLink()) || realpathSync(script) !== script)
    throw Error('Adapter must be installed as a regular file in the selected host');
  if (!Array.isArray(mounts) || !mounts.length || mounts.length > 32) throw Error('Expected bounded workspacePaths');
  const mounted = mounts.map(path => { const value = absolutePath(path); if (!lstatSync(value).isDirectory()) throw Error('Invalid workspace path'); return realpathSync(value); });
  if (!mounted.some(mount => within(mount, root))) throw Error('Installed host is not contained in a mounted workspace');
  return root;
}
function hostPath(root: string, value: unknown, directory = false): string {
  const path = absolutePath(value);
  if (!within(root, path) || (!directory && path === root)) throw Error('Target must belong to the installed host');
  let current = root;
  for (const part of relative(root, path).split(sep).filter(Boolean)) {
    current = join(current, part);
    if (!existsSync(current)) {
      // lstat still catches dangling symlinks, which existsSync follows.
      try { lstatSync(current); throw Error('Unsafe target path'); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      continue;
    }
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw Error('Symlink target paths are unsupported');
    if (stat.isDirectory() && existsSync(join(current, '.agents/scripts/antigravity-hook.ts')))
      throw Error('Nested installed hosts require a separate selected adapter');
  }
  if (directory && !lstatSync(path).isDirectory()) throw Error('Command Cwd must be an existing host directory');
  return path;
}
/** This is a closed recognizer, not a shell parser or a general command-safety policy. */
function words(command: string): string[] | undefined {
  if (/[\x00-\x1f\x7f;&|<>`$\\]/.test(command)) return undefined;
  const result: string[] = []; let word = '', quote = '', started = false;
  for (const char of command) {
    if (quote) { if (char === quote) quote = ''; else word += char; started = true; }
    else if (char === "'" || char === '"') { quote = char; started = true; }
    else if (char === ' ') { if (started) { result.push(word); word = ''; started = false; } }
    else { word += char; started = true; }
  }
  if (quote) return undefined;
  if (started) result.push(word);
  return result;
}
function exploration(argv: string[]): boolean {
  return (argv[0] === 'ls' && argv.slice(1).every(value => /^-[alh]+$/.test(value) || ['.', '..'].includes(value))) ||
    (argv[0] === 'pwd' && (argv.length === 1 || (argv.length === 2 && ['-L', '-P'].includes(argv[1])))) ||
    (argv.length === 2 && ['node', 'pnpm', 'git'].includes(argv[0]) && ['--version', '-v'].includes(argv[1]));
}
function validator(argv: string[], root: string, cwd: string): boolean {
  if (argv[0] !== 'node' || argv.length < 2) return false;
  const path = resolve(cwd, argv[1]);
  if (path === join(root, '.agents/scripts/validate-doc-package.ts') && argv.length === 3) {
    try { const request = strictJson(argv[2]); return record(request) && Object.keys(request).every(key => key === 'mode') && (request.mode === undefined || ['draft', 'approved'].includes(request.mode as string)); }
    catch { return false; }
  }
  if (path !== join(root, '.agents/scripts/validate-command-catalog.ts') || ![4, 6].includes(argv.length)) return false;
  const flags = new Set<string>();
  for (let i = 2; i < argv.length; i += 2) {
    if (!['--root', '--host-root'].includes(argv[i]) || flags.has(argv[i]) || !argv[i + 1] || argv[i + 1].startsWith('--')) return false;
    flags.add(argv[i]);
  }
  return flags.has('--root');
}

/** Evaluators receive the original bytes. Lock ownership and lifecycle semantics are unchanged. */
export function evaluateAntigravityHook(mode: string, input: string, moduleUrl = import.meta.url, nodeVersion = process.versions.node): HookResult {
  if (!hookModes.includes(mode as HookMode)) return transport(mode, deny('HOOK_MODE_INVALID', 'Use one configured hook event mode'));
  if (!/^\d+\./.test(nodeVersion) || Number(nodeVersion.split('.')[0]) < 24)
    return transport(mode, deny('NODE_VERSION_UNSUPPORTED', 'TopHat hooks require Node.js >=24'));
  let payload: Payload;
  try { payload = inputPayload(input); }
  catch (error) { return transport(mode, deny('HOOK_INPUT_INVALID', (error as Error).message)); }
  const { name, args } = payload.toolCall;
  if (readTools.includes(name)) return transport(mode, allow('SKIPPED_NOT_APPLICABLE', 'Exploration tool is outside the write and macro hook scope'));
  if (mode.endsWith('-command')) {
    if (name !== 'run_command' || typeof args.CommandLine !== 'string' || typeof args.Cwd !== 'string')
      return transport(mode, deny('HOOK_INPUT_INVALID', 'Expected run_command with CommandLine and Cwd'));
    const argv = words(args.CommandLine);
    if (argv && exploration(argv)) return transport(mode, allow('SKIPPED_NOT_APPLICABLE', 'Closed exploration command does not acquire a macro lock'));
    try {
      const root = hostRoot(moduleUrl, payload.workspacePaths), cwd = hostPath(root, args.Cwd, true);
      if (argv && validator(argv, root, cwd)) {
        hostPath(root, resolve(cwd, argv[1]));
        return transport(mode, allow('SKIPPED_NOT_APPLICABLE', 'Known read-only TopHat validator does not acquire a macro lock'));
      }
    } catch (error) { return transport(mode, deny('HOOK_ROOT_INVALID', (error as Error).message)); }
    // No documented positive macro discriminator has been observed. Do not invent one or silently disable this gate.
    return transport(mode, deny('MACRO_APPLICABILITY_UNVERIFIED', 'Macro identity transport is unverified; this candidate is not ready for command-hook cutover'));
  }
  if (!writeTools.includes(name)) return transport(mode, deny('HOOK_INPUT_INVALID', 'Expected a supported write tool'));
  let root: string;
  try {
    root = hostRoot(moduleUrl, payload.workspacePaths);
    hostPath(root, args.TargetFile);
    if (mode === 'pre-write') hostPath(root, join(root, '.agents/tophat.config.json'));
  } catch (error) { return transport(mode, deny('HOOK_ROOT_INVALID', (error as Error).message)); }
  if (mode === 'post-write') return transport(mode, evaluateSwarmLock('release', 'tophat', input, root));
  const protectedWrite = evaluateProtectedWrite(input);
  if (protectedWrite.decision !== 'allow') return transport(mode, protectedWrite);
  const framework = evaluateSvelteWrite(input, root);
  if (framework.decision !== 'allow') return transport(mode, framework);
  const lock = evaluateSwarmLock('acquire', 'tophat', input, root);
  if (lock.status === 'LOCK_ACQUIRE_FAILED') return transport(mode, { ...lock, reason: `${lock.reason}. An initialized host Git worktree is required; the adapter does not initialize Git.` });
  return transport(mode, lock);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] ?? ''; let input = '', finished = false;
  const finish = (result: HookResult): void => {
    if (finished) return; finished = true;
    if (result.diagnostic) process.stderr.write(`${result.diagnostic}\n`);
    process.stdout.write(`${JSON.stringify(result.output)}\n`); process.exitCode = result.exitCode;
  };
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    if (finished) return; input += chunk;
    if (Buffer.byteLength(input, 'utf8') > maxHookInputBytes) {
      finish(transport(mode, deny('HOOK_INPUT_INVALID', 'Hook input exceeds the 1 MiB limit'))); input = ''; process.stdin.resume();
    }
  });
  process.stdin.on('end', () => {
    if (finished) return;
    if (process.argv.length !== 3) { finish(transport(mode, deny('HOOK_MODE_INVALID', 'Use exactly one configured hook event mode'))); return; }
    try { finish(evaluateAntigravityHook(mode, input)); }
    catch { finish(transport(mode, deny('HOOK_INTERNAL_ERROR', 'Hook adapter could not complete'))); }
  });
  process.stdin.on('error', () => finish(transport(mode, deny('HOOK_INPUT_INVALID', 'Cannot read hook input'))));
}
