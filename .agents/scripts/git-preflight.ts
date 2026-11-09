import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, digest, strictJson } from './validate-doc-package.ts';

export type Operation = 'fetch' | 'switch' | 'create-branch' | 'stage' | 'commit' | 'push' | 'publish-pr' | 'resolve-conflict' | 'git-integration';
export interface Bytes { sha256: string; mode: '100644' | '100755' }
export interface IntendedFile { path: string; before: Bytes | null; after: Bytes | null }
export interface IndexEntry { path: string; mode: string; oid: string; stage: number }
export interface RemoteIdentity { name: string; fetchUrlSha256: string; pushUrlSha256: string; destinationBranch: string }
export interface GitState {
  rootIdentity: string; objectFormat: string; branch: string; head: string;
  index: IndexEntry[]; indexFingerprint: string; status: string; changes: string[];
  files: Array<{ path: string; head: Bytes | null; current: Bytes | null; index: Bytes | null }>;
  operations: string[]; mergeHeads: string[]; fingerprint: string;
}
export interface ConflictAuthorization {
  signal: 'APPROVED'; human: string; locator: string; baseline: GitState;
}
export interface Integration {
  kind: 'hook' | 'exclude'; before: Bytes | null; after: Bytes | null;
  signal: 'APPROVED'; human: string; locator: string;
}
export interface GitRequest {
  schemaVersion: 1; operation: Operation; repositoryRoot: string; workflow: string;
  expectedBranch: string; expectedHead: string; expectedIndexFingerprint: string | null;
  intended: IntendedFile[]; remote: RemoteIdentity | null;
  target: { branch: string; commit: string } | null;
  conflict: ConflictAuthorization | null; integration: Integration | null;
}
export interface GitReport {
  schemaVersion: 1; decision: 'ALLOW' | 'DENY'; status: 'GIT_PREFLIGHT_READY' | 'GIT_PREFLIGHT_DENIED';
  code: string; issues: Array<{ code: string; message: string }>;
  identity: { root: string; branch: string; head: string } | null;
  state: GitState | null; requestFingerprint: string | null; stateFingerprint: string | null;
}
export type GitReader = (root: string, args: string[], optional?: boolean) => Buffer | null;
class GitSafetyError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}
const fail = (code: string, message: string): never => { throw new GitSafetyError(code, message); };
const fp = (v: unknown): string => digest(canonical(v));
const same = (a: unknown, b: unknown): boolean => canonical(a) === canonical(b);
const hash = (v: unknown): string => {
  if (typeof v !== 'string' || !/^[a-f0-9]{64}$/.test(v)) fail('GIT_INPUT_INVALID', 'Expected SHA-256 digest');
  return v as string;
};
function text(v: unknown): string {
  if (typeof v !== 'string' || !v.trim() || /[\x00-\x1f\x7f]/.test(v)) fail('GIT_INPUT_INVALID', 'Expected nonempty safe string');
  return v as string;
}
function closed(v: unknown, keys: string[]): Record<string, any> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail('GIT_INPUT_INVALID', 'Expected object');
  const o = v as Record<string, any>;
  if (Object.keys(o).length !== keys.length || keys.some(k => !Object.hasOwn(o, k))) fail('GIT_INPUT_INVALID', 'Missing or unknown fields');
  return o;
}
function bytes(v: unknown): Bytes | null {
  if (v === null) return null;
  const o = closed(v, ['sha256', 'mode']); hash(o.sha256);
  if (!['100644', '100755'].includes(o.mode)) fail('GIT_INPUT_INVALID', 'Invalid file mode');
  return o as Bytes;
}
export function safeGitPath(v: unknown): string {
  const p = text(v);
  if (isAbsolute(p) || /^[A-Za-z]:/.test(p) || p.includes('\\') || p.split('/').some(x => !x || x === '.' || x === '..') || p.toLowerCase() === '.git' || p.toLowerCase().startsWith('.git/')) fail('GIT_PATH_INVALID', 'Use exact canonical relative POSIX file paths');
  return p;
}
function collide(paths: string[]): void {
  const seen = new Map<string, string>();
  for (const p of paths) {
    const parts = safeGitPath(p).split('/');
    for (let i = 1; i <= parts.length; i++) {
      const name = parts.slice(0, i).join('/'), key = name.toLowerCase(), old = seen.get(key);
      if (old && old !== name) fail('GIT_PATH_COLLISION', 'Case-folded paths collide');
      seen.set(key, name);
    }
  }
}
export const readGit: GitReader = (root, args, optional = false) => {
  const r = spawnSync('git', ['--no-optional-locks', ...args], {
    cwd: root, timeout: 10000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1' },
  });
  if (r.error || r.signal) fail(r.error?.code === 'ETIMEDOUT' ? 'GIT_INSPECTION_TIMEOUT' : r.error?.code === 'ENOBUFS' ? 'GIT_INSPECTION_LIMIT' : 'GIT_INSPECTION_FAILED', `Git ${args[0]} could not be inspected`);
  if (optional && r.status === 1) return null;
  if (r.status !== 0) fail('GIT_INSPECTION_FAILED', `Git ${args[0]} inspection failed`);
  return r.stdout;
};
function utf8(b: Buffer): string {
  const s = b.toString('utf8');
  if (!Buffer.from(s).equals(b)) fail('GIT_PATH_INVALID', 'Non-UTF-8 Git output is unsupported');
  return s;
}
const output = (read: GitReader, root: string, args: string[]): string => utf8(read(root, args)!);
const nul = (s: string): string[] => s.split('\0').filter(Boolean);
function oid(v: unknown, format: string): string {
  if (typeof v !== 'string' || !new RegExp(`^[a-f0-9]{${format === 'sha256' ? 64 : 40}}$`).test(v)) fail('GIT_INPUT_INVALID', 'Object ID differs from repository format');
  return v as string;
}
function ref(read: GitReader, root: string, branch: unknown): string {
  const s = text(branch);
  // Validate the full ref without interpreting @{-1}, flags or a revision expression.
  if (s.startsWith('-') || s === 'HEAD' || s.startsWith('refs/')) fail('GIT_INPUT_INVALID', 'Expected exact short branch name');
  read(root, ['check-ref-format', `refs/heads/${s}`]); return s;
}
function regular(full: string): Bytes | null {
  try {
    const st = lstatSync(full);
    if (!st.isFile() || st.isSymbolicLink()) fail('GIT_PATH_UNSUPPORTED', 'Mutation path is not a regular file');
    if (st.size > 32 * 1024 * 1024) fail('GIT_INSPECTION_LIMIT', 'File exceeds 32 MiB');
    return { sha256: digest(readFileSync(full)), mode: st.mode & 0o111 ? '100755' : '100644' };
  } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null; throw e; }
}
function hostFile(root: string, p: string): Bytes | null {
  safeGitPath(p); let current = root;
  for (const part of p.split('/')) {
    current = resolve(current, part);
    try { if (lstatSync(current).isSymbolicLink()) fail('GIT_PATH_UNSUPPORTED', 'Symlink mutation path denied'); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  return regular(current);
}
function blob(read: GitReader, root: string, entry: IndexEntry | undefined): Bytes | null {
  if (!entry) return null;
  if (!['100644', '100755'].includes(entry.mode)) fail('GIT_PATH_UNSUPPORTED', 'Symlink/submodule mutation is unsupported');
  const b = read(root, ['cat-file', 'blob', entry.oid])!;
  if (b.length > 32 * 1024 * 1024) fail('GIT_INSPECTION_LIMIT', 'Git blob exceeds file bound');
  return { sha256: digest(b), mode: entry.mode as Bytes['mode'] };
}
function checkedState(v: unknown): GitState {
  const s = closed(v, ['rootIdentity','objectFormat','branch','head','index','indexFingerprint','status','changes','files','operations','mergeHeads','fingerprint']);
  hash(s.rootIdentity); hash(s.indexFingerprint); hash(s.fingerprint);
  if (!['sha1','sha256'].includes(s.objectFormat)) fail('GIT_INPUT_INVALID', 'Unsupported object format');
  text(s.branch); oid(s.head,s.objectFormat);
  if (typeof s.status !== 'string' || !Array.isArray(s.index) || !Array.isArray(s.changes) || !Array.isArray(s.files) || !Array.isArray(s.operations) || !Array.isArray(s.mergeHeads)) fail('GIT_INPUT_INVALID', 'Invalid state inventory');
  for (const e of s.index) {
    closed(e,['path','mode','oid','stage']); safeGitPath(e.path); oid(e.oid,s.objectFormat);
    if (!['100644','100755','120000','160000'].includes(e.mode) || !Number.isInteger(e.stage) || e.stage < 0 || e.stage > 3) fail('GIT_INPUT_INVALID','Invalid index entry');
  }
  for (const p of s.changes) safeGitPath(p);
  for (const f of s.files) { closed(f,['path','head','current','index']); safeGitPath(f.path); bytes(f.head); bytes(f.current); bytes(f.index); }
  for (const op of s.operations) if (!['MERGE_HEAD','rebase-merge','rebase-apply','CHERRY_PICK_HEAD','REVERT_HEAD','sequencer'].includes(op)) fail('GIT_INPUT_INVALID','Invalid operation marker');
  for (const h of s.mergeHeads) oid(h,s.objectFormat);
  const { fingerprint, ...body } = s;
  if (fp(body) !== fingerprint || fp(s.index) !== s.indexFingerprint) fail('GIT_SNAPSHOT_STALE','State fingerprint does not match');
  return s as GitState;
}
/** Pure observation. No network, command execution from input, or state write. */
export function inspectGitState(rootInput: string, extraPaths: string[] = [], read: GitReader = readGit): GitState {
  if (!isAbsolute(rootInput)) fail('GIT_ROOT_MISMATCH','Root must be absolute');
  const root = realpathSync(rootInput);
  if (output(read,root,['rev-parse','--is-bare-repository']).trim() !== 'false' || realpathSync(output(read,root,['rev-parse','--show-toplevel']).trim()) !== root) fail('GIT_ROOT_MISMATCH','Select the worktree root');
  const branchBuffer = read(root,['symbolic-ref','--quiet','--short','HEAD'],true);
  if (!branchBuffer) fail('GIT_HEAD_DETACHED','Attached HEAD required');
  const branch = utf8(branchBuffer).trim();
  const format = output(read,root,['rev-parse','--show-object-format']).trim();
  if (!['sha1','sha256'].includes(format)) fail('GIT_INPUT_INVALID','Unsupported object format');
  const head = oid(output(read,root,['rev-parse','--verify','HEAD']).trim(),format);
  const hiddenFlags = nul(output(read,root,['ls-files','-v','-z']));
  if (hiddenFlags.some(line=>line[0]==='S' || line[0]===line[0]?.toLowerCase())) fail('GIT_INDEX_UNSUPPORTED','Skip-worktree or assume-unchanged flags can hide drift');
  const index = nul(output(read,root,['ls-files','--stage','-z'])).map(line => {
    const m = /^(\d{6}) ([a-f0-9]+) ([0-3])\t([\s\S]+)$/.exec(line);
    if (!m) fail('GIT_INSPECTION_FAILED','Malformed index output');
    return { mode:m![1], oid:oid(m![2],format), stage:Number(m![3]), path:safeGitPath(m![4]) };
  });
  if (index.length > 16384) fail('GIT_INSPECTION_LIMIT','Index inventory exceeds bound');
  // --ignore-submodules=none defeats repository configuration hiding submodule drift.
  const tracked = nul(output(read,root,['diff','--no-ext-diff','--no-textconv','--ignore-submodules=none','--no-renames','--name-only','-z','HEAD','--']));
  const staged = nul(output(read,root,['diff','--cached','--no-ext-diff','--no-textconv','--ignore-submodules=none','--no-renames','--name-only','-z','HEAD','--']));
  const untracked = nul(output(read,root,['ls-files','--others','--exclude-standard','-z']));
  const changes = [...new Set([...tracked,...staged,...untracked])].sort();
  const names = [...new Set([...index.map(e=>e.path),...changes,...extraPaths])]; collide(names);
  if (names.length > 16384) fail('GIT_INSPECTION_LIMIT','File inventory exceeds bound');
  let total = 0;
  for (const p of names) {
    try { total += lstatSync(resolve(root,p)).size; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  if (total > 128 * 1024 * 1024) fail('GIT_INSPECTION_LIMIT','File inventory exceeds 128 MiB');
  const files = [...new Set([...changes,...extraPaths])].sort().map(path => {
    const tree = nul(output(read,root,['ls-tree','-z','HEAD','--',path]));
    const m = tree.length === 1 ? /^(\d{6}) blob ([a-f0-9]+)\t([\s\S]+)$/.exec(tree[0]) : null;
    if (tree.length && !m) fail('GIT_PATH_UNSUPPORTED','Non-file HEAD mutation path');
    return { path, head:blob(read,root,m ? {mode:m[1],oid:oid(m[2],format),stage:0,path} : undefined), current:hostFile(root,path), index:blob(read,root,index.find(e=>e.path===path&&e.stage===0)) };
  });
  const operations: string[] = [];
  for (const p of ['MERGE_HEAD','rebase-merge','rebase-apply','CHERRY_PICK_HEAD','REVERT_HEAD','sequencer']) {
    const full = resolve(root,output(read,root,['rev-parse','--git-path',p]).trim());
    try { lstatSync(full); operations.push(p); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  const mergeHeads = operations.includes('MERGE_HEAD') ? readFileSync(resolve(root,output(read,root,['rev-parse','--git-path','MERGE_HEAD']).trim()),'utf8').trim().split('\n').map(h=>oid(h,format)) : [];
  const body = {rootIdentity:digest(root),objectFormat:format,branch,head,index,indexFingerprint:fp(index),status:output(read,root,['status','--porcelain=v1','-z','--untracked-files=all','--ignore-submodules=none']),changes,files,operations,mergeHeads};
  return {...body,fingerprint:fp(body)};
}
function checkedRequest(v: unknown): GitRequest {
  const r = closed(v,['schemaVersion','operation','repositoryRoot','workflow','expectedBranch','expectedHead','expectedIndexFingerprint','intended','remote','target','conflict','integration']);
  if (r.schemaVersion !== 1 || !['fetch','switch','create-branch','stage','commit','push','publish-pr','resolve-conflict','git-integration'].includes(r.operation)) fail('GIT_INPUT_INVALID','Invalid operation');
  text(r.repositoryRoot); if(!isAbsolute(r.repositoryRoot))fail('GIT_ROOT_MISMATCH','Root must be absolute'); text(r.workflow); text(r.expectedBranch); text(r.expectedHead);
  if (r.expectedIndexFingerprint !== null) hash(r.expectedIndexFingerprint);
  if (!Array.isArray(r.intended) || r.intended.length > 16384) fail('GIT_INPUT_INVALID','Invalid intended file inventory');
  const paths = r.intended.map((f:any)=>{closed(f,['path','before','after']); safeGitPath(f.path); bytes(f.before); bytes(f.after); return f.path;});
  if (new Set(paths).size !== paths.length) fail('GIT_INPUT_INVALID','Duplicate intended path'); collide(paths);
  if (r.remote !== null) { closed(r.remote,['name','fetchUrlSha256','pushUrlSha256','destinationBranch']); text(r.remote.name); hash(r.remote.fetchUrlSha256); hash(r.remote.pushUrlSha256); text(r.remote.destinationBranch); }
  if (r.target !== null) { closed(r.target,['branch','commit']); text(r.target.branch); text(r.target.commit); }
  if (r.conflict !== null) { closed(r.conflict,['signal','human','locator','baseline']); if(r.conflict.signal!=='APPROVED')fail('GIT_AUTHORIZATION_REQUIRED','Conflict requires explicit approval');text(r.conflict.human);text(r.conflict.locator);checkedState(r.conflict.baseline); }
  if (r.integration !== null) { closed(r.integration,['kind','before','after','signal','human','locator']); if(!['hook','exclude'].includes(r.integration.kind)||r.integration.signal!=='APPROVED')fail('GIT_AUTHORIZATION_REQUIRED','Integration requires exact approval'); bytes(r.integration.before); bytes(r.integration.after);text(r.integration.human);text(r.integration.locator); }
  if ((r.operation==='git-integration') !== (r.integration!==null)) fail('GIT_INPUT_INVALID','Integration profile mismatch');
  if (!['stage','commit','resolve-conflict'].includes(r.operation) && r.conflict!==null) fail('GIT_INPUT_INVALID','Unexpected conflict exception');
  if ((['switch','create-branch','fetch'].includes(r.operation)) !== (r.target!==null)) fail('GIT_INPUT_INVALID','Target profile mismatch');
  if ((['fetch','push','publish-pr'].includes(r.operation)) !== (r.remote!==null)) fail('GIT_INPUT_INVALID','Remote profile mismatch');
  if (!['stage','commit','git-integration'].includes(r.operation) && r.intended.length) fail('GIT_INPUT_INVALID','This operation requires clean state');
  if (['stage','commit'].includes(r.operation) && (!r.intended.length||r.expectedIndexFingerprint===null)) fail('GIT_INPUT_INVALID','Exact paths and index fingerprint required');
  return r as GitRequest;
}
function validateConflict(s: GitState, c: ConflictAuthorization, mode: 'initial' | 'stage' | 'commit'): Set<string> {
  const b = c.baseline;
  if (b.rootIdentity!==s.rootIdentity || b.branch!==s.branch || b.head!==s.head || !same(b.operations,['MERGE_HEAD']) || b.mergeHeads.length!==1 || !same(b.mergeHeads,s.mergeHeads) || !same(s.operations,['MERGE_HEAD'])) fail('GIT_CONFLICT_MISMATCH','Only the nominated active merge is permitted');
  const conflicts = new Set(b.index.filter(e=>e.stage!==0).map(e=>e.path));
  if (!conflicts.size) fail('GIT_CONFLICT_MISMATCH','Baseline has no unresolved merge');
  for (const f of b.files.filter(f=>!conflicts.has(f.path))) {
    if (same(f.head,f.index) || !same(f.current,f.index)) fail('GIT_CONFLICT_MISMATCH','Baseline contains unrelated or unstaged nonconflict changes');
  }
  if (mode==='initial') { if (b.fingerprint!==s.fingerprint) fail('GIT_SNAPSHOT_STALE','Conflict state changed'); }
  else {
    if (mode==='commit' && s.index.some(e=>e.stage!==0)) fail('GIT_CONFLICT_UNRESOLVED','Unmerged entries remain');
    if (mode==='stage' && !same(b.index.filter(e=>conflicts.has(e.path)),s.index.filter(e=>conflicts.has(e.path)))) fail('GIT_CONFLICT_MISMATCH','Conflict index differs before staging');
    if (!same(b.index.filter(e=>!conflicts.has(e.path)),s.index.filter(e=>!conflicts.has(e.path)))) fail('GIT_CONFLICT_MISMATCH','Nonconflict merge index changed');
    if (!same(b.files.filter(f=>!conflicts.has(f.path)),s.files.filter(f=>!conflicts.has(f.path)))) fail('GIT_CONFLICT_MISMATCH','Nonconflict merge files changed');
  }
  return conflicts;
}
/** Read-only fail-closed preflight. The injected reader is a test adapter, never a CLI option. */
export function gitPreflight(input: unknown, read: GitReader = readGit): GitReport {
  const report: GitReport = {schemaVersion:1,decision:'DENY',status:'GIT_PREFLIGHT_DENIED',code:'GIT_INPUT_INVALID',issues:[],identity:null,state:null,requestFingerprint:null,stateFingerprint:null};
  try {
    const r = checkedRequest(input), root = realpathSync(r.repositoryRoot);
    report.requestFingerprint=fp(r);
    const s = inspectGitState(root,r.intended.map(f=>f.path),read); report.state=s;report.stateFingerprint=s.fingerprint;report.identity={root,branch:s.branch,head:s.head};
    ref(read,root,r.expectedBranch); oid(r.expectedHead,s.objectFormat);
    if (s.branch!==r.expectedBranch) fail('GIT_BRANCH_MISMATCH','Expected branch differs');
    if (s.head!==r.expectedHead) fail('GIT_HEAD_MISMATCH','Expected HEAD differs');
    if (r.expectedIndexFingerprint!==null && r.expectedIndexFingerprint!==s.indexFingerprint) fail('GIT_INDEX_STALE','Index differs from the reviewed state');
    if (r.conflict) validateConflict(s,r.conflict,r.operation==='commit'?'commit':r.operation==='stage'?'stage':'initial');
    else if (s.operations.length || s.index.some(e=>e.stage!==0)) fail('GIT_OPERATION_ACTIVE','Conflicts or active Git operation require a specific human decision');
    if (r.operation==='resolve-conflict') {
      if (!r.conflict) fail('GIT_AUTHORIZATION_REQUIRED','Conflict resolution requires nominated merge evidence');
    } else if (['stage','commit','git-integration'].includes(r.operation)) {
      const expected = r.intended.map(f=>f.path).sort();
      if (!same(s.changes.filter(p=>!r.intended.some(f=>f.path===p)),[])) fail('GIT_UNEXPECTED_CHANGE','Changes outside intended paths');
      if (r.operation!=='git-integration' && !same(s.changes,expected)) fail('GIT_INTENDED_MISMATCH','Complete changed-path inventory differs');
      for (const f of r.intended) {
        const actual=s.files.find(x=>x.path===f.path)!;
        if (!same(actual.head,f.before)||!same(actual.current,f.after)) fail('GIT_BYTES_STALE','Intended bytes/mode differ');
        const entries=s.index.filter(e=>e.path===f.path);
        if (entries.some(e=>e.stage!==0) && !(r.operation==='stage' && r.conflict)) fail('GIT_CONFLICT_UNRESOLVED','Cannot stage unresolved paths through ordinary profile');
        if (r.operation==='git-integration' && !same(actual.index,actual.head)) fail('GIT_INDEX_STALE','Integration must preserve the original index');
        if (r.operation==='commit' && !same(actual.index,f.after)) fail('GIT_INDEX_STALE','Staged bytes differ from final worktree');
        if (r.operation==='stage' && !entries.some(e=>e.stage!==0) && !same(actual.index,f.before) && !same(actual.index,f.after)) fail('GIT_INDEX_STALE','Partial or unexplained staged bytes');
        if (r.operation!=='git-integration' && !(r.operation==='stage' && r.conflict && entries.some(e=>e.stage!==0)) && same(f.before,f.after)) fail('GIT_INTENDED_MISMATCH','Unchanged intended path');
      }
    } else if (s.changes.length) fail('GIT_DIRTY_STATE','Operation requires clean worktree/index/untracked state');
    if (r.target) {
      ref(read,root,r.target.branch); oid(r.target.commit,s.objectFormat);
      if (r.operation!=='fetch') {
        const exists=read(root,['show-ref','--verify','--quiet',`refs/heads/${r.target.branch}`],true);
        const existing=exists===null?null:read(root,['rev-parse','--verify',`refs/heads/${r.target.branch}`]);
        if (r.operation==='create-branch' && existing) fail('GIT_BRANCH_EXISTS','Branch already exists; no overwrite');
        if (r.operation==='switch' && (!existing || utf8(existing).trim()!==r.target.commit)) fail('GIT_TARGET_MISMATCH','Resume branch missing or moved');
        if (output(read,root,['cat-file','-t',r.target.commit]).trim()!=='commit') fail('GIT_TARGET_MISMATCH','Target must be a commit');
      }
    }
    if (r.remote) {
      const remote=r.remote;
      if (remote.name.startsWith('-') || !/^[A-Za-z0-9_.-]+$/.test(remote.name)) fail('GIT_REMOTE_MISMATCH','Invalid exact remote name');
      ref(read,root,remote.destinationBranch);
      const fetchUrls=output(read,root,['remote','get-url','--all',remote.name]).trim().split('\n');
      const pushUrls=output(read,root,['remote','get-url','--push','--all',remote.name]).trim().split('\n');
      if (fetchUrls.length!==1||pushUrls.length!==1||digest(fetchUrls[0])!==remote.fetchUrlSha256||digest(pushUrls[0])!==remote.pushUrlSha256) fail('GIT_REMOTE_MISMATCH','Remote configuration differs or is ambiguous');
      if (r.operation==='fetch' && remote.destinationBranch!==r.target!.branch) fail('GIT_TARGET_MISMATCH','Fetch branch differs from nominated base');
      if (r.operation==='push' && remote.destinationBranch!==s.branch) fail('GIT_TARGET_MISMATCH','Push destination differs from exact feature branch');
    }
    if (r.integration) {
      const i=r.integration;
      // Respect existing installer/ownership refusals: preflight does not authorize a shared hook override.
      const custom=read(root,['config','--get','core.hooksPath'],true);
      if (i.kind==='hook' && custom!==null) fail('GIT_HOOKS_PATH_CONFIGURED','Existing hooksPath requires manual integration');
      const destination=resolve(root,output(read,root,['rev-parse','--git-path',i.kind==='hook'?'hooks/pre-commit':'info/exclude']).trim());
      if (!same(regular(destination),i.before)) fail('GIT_INTEGRATION_STALE','Git metadata differs from approved prior digest');
      let current=resolve(destination,'..');
      for (;;) { if (lstatSync(current).isSymbolicLink()) fail('GIT_PATH_UNSUPPORTED','Git metadata parent symlink denied');const parent=resolve(current,'..');if(parent===current)break;current=parent; }
    }
    report.decision='ALLOW';report.status='GIT_PREFLIGHT_READY';report.code='GIT_PREFLIGHT_READY';
  } catch (e) {
    report.code=e instanceof GitSafetyError?e.code:'GIT_INSPECTION_FAILED';
    // Filesystem/process error messages may contain remote secrets; do not reflect arbitrary stderr.
    report.issues=[{code:report.code,message:e instanceof GitSafetyError?e.message:'Git state could not be inspected completely'}];
  }
  return report;
}

/** Postcondition helpers inspect supplied observed identities; orchestration owns mutation and custody. */
export function verifyBranchResult(state: GitState, branch: string, commit: string): void {
  checkedState(state);
  if(state.branch!==branch||state.head!==commit||state.changes.length||state.operations.length)fail('GIT_POSTCONDITION_FAILED','Branch result differs');
}
export function verifyRemoteResult(observed: string | null, expected: string): void {
  if (observed===null)fail('POSTCONDITION_UNVERIFIED','Remote ref unavailable');
  if(observed!==expected)fail('GIT_POSTCONDITION_FAILED','Remote ref differs');
}
export function verifyCommitResult(root: string, before: GitState, intended: IntendedFile[], read: GitReader = readGit): GitState {
  checkedState(before);
  const after=inspectGitState(root,[],read);
  if(after.branch!==before.branch||after.head===before.head||after.changes.length||after.operations.length)fail('GIT_POSTCONDITION_FAILED','Commit did not produce clean expected branch');
  const parents=output(read,root,['rev-list','--parents','-n','1',after.head]).trim().split(' ').slice(1);
  if(!same(parents,[before.head,...before.mergeHeads]))fail('GIT_POSTCONDITION_FAILED','Commit parents differ');
  const changed=nul(output(read,root,['diff','--no-ext-diff','--no-textconv','--no-renames','--name-only','-z',before.head,after.head,'--'])).sort();
  if(!same(changed,intended.map(f=>f.path).sort()))fail('GIT_POSTCONDITION_FAILED','Committed paths differ');
  const inspected=inspectGitState(root,intended.map(f=>f.path),read);
  for(const f of intended)if(!same(inspected.files.find(x=>x.path===f.path)!.head,f.after))fail('GIT_POSTCONDITION_FAILED','Committed bytes/modes differ');
  return after;
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const b=readFileSync(0);if(b.length>1024*1024)fail('GIT_INPUT_LIMIT','Request exceeds 1 MiB');
    const r=gitPreflight(strictJson(b.toString('utf8')));console.log(JSON.stringify(r));if(r.decision==='DENY')process.exitCode=1;
  } catch { console.log(JSON.stringify({schemaVersion:1,decision:'DENY',status:'GIT_PREFLIGHT_DENIED',code:'GIT_INPUT_INVALID',issues:[{code:'GIT_INPUT_INVALID',message:'Invalid bounded JSON request'}],identity:null,state:null,requestFingerprint:null,stateFingerprint:null}));process.exitCode=1; }
}
