import { createHash } from 'node:crypto';
import { closeSync, constants, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';
import { digest, strictJson, inspectDocPackage, canonical } from './validate-doc-package.ts';
import { inspectGitState, readGit } from './git-preflight.ts';
import { loadTophatConfig, TophatConfigError } from './load-tophat-config.ts';
import { classifyTask, fingerprint, validateStages, WorkflowError } from './classify-task.ts';
import { validateQAEvidence } from './validate-qa-evidence.ts';
import { validateDerivedDocs } from './validate-derived-docs.ts';

export const limits = { json: 4 * 1024 * 1024, artifacts: 512, file: 32 * 1024 * 1024, aggregate: 128 * 1024 * 1024 };
export const evidenceKinds = ['mechanism', 'configuration-fixture', 'command-execution', 'semantic-review', 'live-integration'] as const;
const groups = ['configuration', 'capability-isolation', 'validation', 'documentation-package', 'routing', 'qa', 'git', 'boundary-honesty', 'project-definition', 'attachment', 'documentation-lifecycle', 'role-boundaries', 'terminology', 'detachment', 'terminal-profile', 'terminal-routing-evidence', 'terminal-native-runtime', 'terminal-installation'];
const liveIds = [1, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 27, 28];
type Kind = typeof evidenceKinds[number];
export interface Criterion { id: number; requirement: string; tests: { path: string; name: string }[]; requiredKinds: Kind[]; hostIntegrationRequired: boolean }
export interface AcceptanceIndex { schemaVersion: 1; authority: string; groups: { id: string; path: string }[]; criteria: Criterion[] }
export interface Artifact { id: string; path: string; sha256: string; kind: Kind; provenance: 'observed' | 'synthetic' | 'configuration'; result: 'PASSED' | 'FAILED' | 'SKIPPED_NOT_APPLICABLE'; rationale: string }
export interface AcceptanceOptions { root: string; candidate: string; index: string; evidenceRoot: string; dossier: string; hostRoot: string; hostCandidate: string }
export interface AcceptanceResult { status: 'EVIDENCE_COMPLETE' | 'EVIDENCE_INCOMPLETE'; candidate: string | null; criterionResults: { id: number; status: string }[]; errors: { code: string; message: string }[] }
class Refusal extends Error { code: string; constructor(code: string, message: string) { super(message); this.code = code; } }
const fail = (code: string, message: string): never => { throw new Refusal(code, message); };
const invalid = (message: string): never => fail('ACCEPTANCE_RECORD_INVALID', message);
function object(v: unknown, keys: string[]): Record<string, any> {
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length !== keys.length || keys.some(k => !Object.hasOwn(v, k))) invalid('Missing or unknown record fields');
  return v as Record<string, any>;
}
function text(v: unknown): string { if (typeof v !== 'string' || !v.trim() || /[\x00-\x1f\x7f]/.test(v)) invalid('Expected nonempty safe text'); return v as string; }
function hash(v: unknown): string { const s = text(v); if (!/^[a-f0-9]{64}$/.test(s)) invalid('Expected SHA-256'); return s; }
function oid(v: unknown): string { const s = text(v); if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(s)) invalid('Expected complete Git object ID'); return s; }
function integer(v: unknown, min = 0): number { if (!Number.isSafeInteger(v) || (v as number) < min) invalid('Expected bounded integer'); return v as number; }
function array(v: unknown, max = 512): any[] { if (!Array.isArray(v) || v.length > max) invalid('Expected bounded array'); return v as any[]; }
function unique(v: string[]): void { if (new Set(v).size !== v.length) invalid('Duplicate identities'); }
function strings(v: unknown): string[] { const a = array(v).map(text); unique(a); return a; }
function time(v: unknown): number { const s = text(v); if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString() !== s) invalid('Expected canonical UTC timestamp'); return Date.parse(s); }
function equal(a: unknown, b: unknown, code = 'ACCEPTANCE_RECORD_INVALID'): void { if (canonical(a) !== canonical(b)) fail(code, 'Recorded identities or results differ'); }
function path(v: unknown): string {
  const s = text(v);
  if (s.split('/').some(p => /^\.env(?:\.|$)/i.test(p) || ['id_rsa', 'id_ed25519'].includes(p.toLowerCase()))) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Environment/credential files are excluded from the dossier');
  if (isAbsolute(s) || /^[A-Za-z]:/.test(s) || s.includes('\\') || s.split('/').some(p => !p || p === '.' || p === '..') || s.split('/').some(p => p.toLowerCase() === '.git')) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Expected canonical relative evidence path');
  return s;
}
function collisions(paths: string[]): void {
  const seen = new Map<string, string>();
  for (const p of paths) { const parts = path(p).split('/'); for (let n = 1; n <= parts.length; n++) {
    const name = parts.slice(0, n).join('/'), key = name.toLowerCase(), old = seen.get(key);
    if (old && old !== name) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Case-folded path collision'); seen.set(key, name);
  } }
}
function rootPath(p: string): string {
  if (!isAbsolute(p) || resolve(p) !== p) invalid('Roots must be explicit canonical absolute paths');
  let current = p;
  for (;;) { const st = lstatSync(current); if (st.isSymbolicLink()) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Symlink root/ancestor rejected'); const parent = resolve(current, '..'); if (parent === current) break; current = parent; }
  if (realpathSync(p) !== p || !lstatSync(p).isDirectory()) invalid('Expected real directory'); return p;
}
function safeFile(root: string, relative: string): string {
  let current = root;
  for (const part of path(relative).split('/')) { current = resolve(current, part); const s = lstatSync(current); if (s.isSymbolicLink()) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Symlink artifact rejected'); }
  if (!lstatSync(current).isFile()) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Artifact is not a regular file'); return current;
}
/** Fixed 64 KiB chunks; bounded counts are checked against actual bytes and stat. */
export function streamArtifact(file: string, maximum = limits.file, retain = false, consume?: (chunk: Buffer) => void): { sha256: string; bytes: number; content?: Buffer } {
  const fd = openSync(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const before = fstatSync(fd); if (!before.isFile()) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Nonregular artifact');
    if (before.size > maximum) fail('ACCEPTANCE_RESOURCE_LIMIT', 'Artifact exceeds byte limit');
    const h = createHash('sha256'), chunk = Buffer.alloc(65536), parts: Buffer[] = []; let bytes = 0;
    for (;;) { const n = readSync(fd, chunk, 0, chunk.length, null); if (!n) break; bytes += n; if (bytes > maximum) fail('ACCEPTANCE_RESOURCE_LIMIT', 'Artifact exceeds byte limit'); h.update(chunk.subarray(0, n)); consume?.(chunk.subarray(0, n)); if (retain) parts.push(Buffer.from(chunk.subarray(0, n))); }
    const after = fstatSync(fd);
    if (bytes !== before.size || after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Artifact changed during inspection');
    return { sha256: h.digest('hex'), bytes, ...(retain ? { content: Buffer.concat(parts) } : {}) };
  } finally { closeSync(fd); }
}
function jsonBytes(bytes: Buffer): unknown {
  const s = bytes.toString('utf8'); if (!Buffer.from(s).equals(bytes)) invalid('Non-UTF-8 JSON');
  try { return strictJson(s, 'acceptance record'); } catch { return invalid('Malformed JSON or duplicate keys'); }
}
function suiteCounts(file: string, sha256: string, required: boolean): Record<string, number> {
  const decoder = new StringDecoder('utf8'); const counts: Record<string, number> = {}; let pending = '', discard = false;
  const line = (s: string) => { const m = /^(?:#|ℹ) (tests|pass|fail|skipped) (\d+)\r?$/.exec(s); if (m) { if (Object.hasOwn(counts, m[1])) invalid('Ambiguous suite log summary'); counts[m[1]] = integer(Number(m[2])); } };
  const data = streamArtifact(file, limits.file, false, chunk => {
    // Summary lines are short UTF-8 lines. Keep only a bounded pending line.
    for (const piece of decoder.write(chunk).split(/(?<=\n)/)) {
      if (!discard) pending += piece;
      if (piece.endsWith('\n')) { if (!discard) line(pending.slice(0, -1)); pending = ''; discard = false; }
      else if (pending.length > 1024) { pending = ''; discard = true; }
    }
  });
  pending += decoder.end(); if (pending && !discard) line(pending); equal(data.sha256, sha256, 'ACCEPTANCE_ARTIFACT_INVALID');
  if (required && ['tests', 'pass', 'fail', 'skipped'].some(k => !Object.hasOwn(counts, k))) invalid('Suite log lacks complete result counts'); return counts;
}
function readJson(file: string): unknown { return jsonBytes(streamArtifact(file, limits.json, true).content!); }
function git(root: string, args: string[]): string { return readGit(root, args)!.toString('utf8').trim(); }
function blob(root: string, commit: string, p: string): string { path(p); return readGit(root, ['show', `${oid(commit)}:${p}`])!.toString('utf8'); }
export function checkedIndex(input: unknown, source: (path: string) => string): AcceptanceIndex {
  const v = object(input, ['schemaVersion', 'authority', 'groups', 'criteria']); if (v.schemaVersion !== 1) invalid('Unsupported index version'); text(v.authority);
  const gs = array(v.groups, groups.length); equal(gs.map(g => object(g, ['id', 'path']).id).sort(), [...groups].sort());
  for (const g of gs) { path(g.path); if (!g.path.startsWith('.agents/tests/') || !g.path.endsWith('.test.ts') || !source(g.path).includes('test(')) invalid('Unresolved test group'); }
  const criteria = array(v.criteria, 30); if (criteria.length !== 30) fail('ACCEPTANCE_CRITERION_MISSING', 'Exactly 30 criteria required');
  criteria.forEach((raw, n) => {
    const c = object(raw, ['id', 'requirement', 'tests', 'requiredKinds', 'hostIntegrationRequired']); if (c.id !== n + 1) fail('ACCEPTANCE_CRITERION_MISSING', 'Ordered unique IDs 1–30 required'); text(c.requirement);
    const kinds = strings(c.requiredKinds); if (!kinds.includes('mechanism') || kinds.some(k => !evidenceKinds.includes(k as Kind))) invalid('Unsupported/missing evidence kind');
    const expectedKinds: string[] = ['mechanism'];
    if ([1, 2, 3, 4, 5, 11].includes(c.id)) expectedKinds.push('configuration-fixture');
    if ([6, 7, 21, 25, 30].includes(c.id)) expectedKinds.push('command-execution');
    if ([3, 5, 15, 16, 20, 26, 27, 28, 29].includes(c.id)) expectedKinds.push('semantic-review');
    if (liveIds.includes(c.id)) expectedKinds.push('live-integration');
    equal([...kinds].sort(), expectedKinds.sort());
    if (typeof c.hostIntegrationRequired !== 'boolean' || c.hostIntegrationRequired !== liveIds.includes(c.id) || kinds.includes('live-integration') !== c.hostIntegrationRequired) invalid('Live obligations differ');
    const refs = array(c.tests, 32); if (!refs.length) invalid('Missing fixture references'); const identities: string[] = [];
    for (const raw of refs) { const ref = object(raw, ['path', 'name']); path(ref.path); text(ref.name); identities.push(`${ref.path}:${ref.name}`);
      if (!ref.path.startsWith('.agents/tests/') || !ref.path.endsWith('.test.ts')) invalid('Invalid test path');
      const src = source(ref.path), escaped = ref.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\btest\\(\\s*(["'])${escaped}\\1`).test(src)) invalid('Unresolved exact test name');
    } unique(identities);
  }); return v as AcceptanceIndex;
}
function identity(root: string, expectedCommit: string, value: unknown): void {
  const v = object(value, ['root', 'commit', 'tree', 'branch', 'remoteUrlSha256']); rootPath(root); oid(v.commit); oid(v.tree); text(v.branch); hash(v.remoteUrlSha256);
  const state = inspectGitState(root);
  equal([v.root, v.commit, v.tree, v.branch], [root, oid(expectedCommit), git(root, ['rev-parse', 'HEAD^{tree}']), state.branch], 'ACCEPTANCE_CANDIDATE_STALE');
  if (state.head !== expectedCommit || state.status || state.operations.length) fail('ACCEPTANCE_CANDIDATE_STALE', 'Expected clean attached candidate');
  equal(v.remoteUrlSha256, digest(git(root, ['config', '--get', 'remote.origin.url'])), 'ACCEPTANCE_CANDIDATE_STALE');
}
export function validateAcceptance(options: AcceptanceOptions): AcceptanceResult {
  const result: AcceptanceResult = { status: 'EVIDENCE_INCOMPLETE', candidate: options.candidate, criterionResults: [], errors: [] };
  try {
    oid(options.candidate); oid(options.hostCandidate); const root = rootPath(options.root), evidenceRoot = rootPath(options.evidenceRoot);
    if (!isAbsolute(options.index) || !isAbsolute(options.dossier)) invalid('Index and dossier paths must be explicit absolute paths');
    const indexFile = safeFile(root, path(options.index.slice(root.length + 1)));
    if (indexFile !== options.index || options.index !== resolve(root, '.agents/docs/acceptance-criteria.json')) invalid('Index must be the tracked candidate index');
    const indexData = streamArtifact(indexFile, limits.json, true);
    equal(indexData.sha256, digest(blob(root, options.candidate, '.agents/docs/acceptance-criteria.json')), 'ACCEPTANCE_CANDIDATE_STALE');
    const sources = new Map<string, string>();
    const index = checkedIndex(jsonBytes(indexData.content!), p => { if (!sources.has(p)) sources.set(p, blob(root, options.candidate, p)); return sources.get(p)!; });
    const dossierFile = safeFile(evidenceRoot, path(options.dossier.slice(evidenceRoot.length + 1))); if (dossierFile !== options.dossier) invalid('Dossier must lie inside evidence root');
    const v = object(readJson(dossierFile), ['schemaVersion', 'identity', 'indexSha256', 'runtime', 'attempts', 'currentAttempt', 'artifacts', 'criteria', 'hostProject', 'review', 'limitations']);
    if (v.schemaVersion !== 1) invalid('Unsupported dossier version'); equal(hash(v.indexSha256), indexData.sha256, 'ACCEPTANCE_CANDIDATE_STALE'); identity(root, options.candidate, v.identity);
    const runtime = object(v.runtime, ['node', 'pnpm', 'os']); if (!/^\d+\.\d+\.\d+$/.test(text(runtime.node)) || Number(runtime.node.split('.')[0]) < 24 || !/^\d+\.\d+\.\d+$/.test(text(runtime.pnpm))) invalid('Unsupported runtime'); text(runtime.os); strings(v.limitations);
    const artifacts = array(v.artifacts, limits.artifacts).map(raw => {
      const a = object(raw, ['id', 'path', 'sha256', 'kind', 'provenance', 'result', 'rationale']); text(a.id); path(a.path); hash(a.sha256); text(a.rationale);
      if (!evidenceKinds.includes(a.kind) || !['observed', 'synthetic', 'configuration'].includes(a.provenance) || !['PASSED', 'FAILED', 'SKIPPED_NOT_APPLICABLE'].includes(a.result)) invalid('Invalid artifact classification');
      if (['command-execution', 'semantic-review', 'live-integration'].includes(a.kind) && a.provenance !== 'observed') invalid('Required observed evidence cannot be synthetic/configuration'); return a as Artifact;
    }); unique(artifacts.map(a => a.id)); unique(artifacts.map(a => a.path)); collisions(artifacts.map(a => a.path));
    let total = 0;
    for (const a of artifacts) { const data = streamArtifact(safeFile(evidenceRoot, a.path)); total += data.bytes; if (total > limits.aggregate) fail('ACCEPTANCE_RESOURCE_LIMIT', 'Aggregate artifact limit exceeded'); equal(data.sha256, a.sha256, 'ACCEPTANCE_ARTIFACT_INVALID'); }
    const artifact = (id: unknown, kind?: Kind): Artifact => { const a = artifacts.find(a => a.id === text(id)); if (!a || kind && a.kind !== kind) fail('ACCEPTANCE_ARTIFACT_INVALID', 'Unresolved or incompatible artifact'); return a!; };
    const artifactJson = (id: unknown, kind?: Kind): any => { const a = artifact(id, kind); const file = safeFile(evidenceRoot, a.path), data = streamArtifact(file, limits.json, true); equal(data.sha256, a.sha256, 'ACCEPTANCE_ARTIFACT_INVALID'); return jsonBytes(data.content!); };
    const attempts = array(v.attempts, 256); if (!attempts.length) invalid('Missing attempts'); let previous = 0;
    const runIds: string[] = [];
    for (const [n, raw] of attempts.entries()) {
      const a = object(raw, ['sequence', 'runId', 'candidate', 'startedAt', 'completedAt', 'status', 'suite']); if (a.sequence !== n + 1) invalid('Attempt sequences must be contiguous'); runIds.push(text(a.runId)); oid(a.candidate);
      const start = time(a.startedAt), end = time(a.completedAt); if (start < previous || end < start) invalid('Attempt chronology differs'); previous = end;
      if (!['PASSED', 'FAILED', 'BLOCKED'].includes(a.status)) invalid('Invalid attempt status');
      const s = object(a.suite, ['command', 'exitStatus', 'passed', 'failed', 'skipped', 'artifactId', 'logArtifactId']); if (s.command !== 'pnpm test:tophat') invalid('Wrong suite command'); integer(s.passed); integer(s.failed); integer(s.skipped); if (s.exitStatus !== null) integer(s.exitStatus);
      artifact(s.artifactId, 'command-execution'); equal(artifactJson(s.artifactId, 'command-execution'), { command: s.command, exitStatus: s.exitStatus, passed: s.passed, failed: s.failed, skipped: s.skipped });
      const log = artifact(s.logArtifactId, 'command-execution'); const counts = suiteCounts(safeFile(evidenceRoot, log.path), log.sha256, a.status === 'PASSED');
      for (const [key, value] of [['pass', s.passed], ['fail', s.failed], ['skipped', s.skipped]] as const) equal(counts[key] ?? 0, value);
      if (a.status === 'PASSED') equal(counts.tests, s.passed + s.failed + s.skipped);
      const passing = s.exitStatus === 0 && s.passed > 0 && s.failed === 0 && s.skipped === 0;
      if ((a.status === 'PASSED') !== passing || (artifact(s.artifactId).result === 'PASSED') !== passing || (log.result === 'PASSED') !== passing) invalid('Suite/attempt verdict contradiction');
    } unique(runIds); const latest = attempts.at(-1)!;
    equal(v.currentAttempt, latest.runId, 'ACCEPTANCE_CANDIDATE_STALE'); equal(latest.candidate, options.candidate, 'ACCEPTANCE_CANDIDATE_STALE');
    if (latest.status !== 'PASSED') result.errors.push({ code: 'ACCEPTANCE_REQUIRED_RESULT_FAILED', message: 'Latest full suite has not passed' });
    const rows = array(v.criteria, 30); if (rows.length !== 30) fail('ACCEPTANCE_CRITERION_MISSING', 'Missing criterion results');
    rows.forEach((raw, n) => {
      const row = object(raw, ['id', 'status', 'rationale', 'evidenceIds']); if (row.id !== n + 1) fail('ACCEPTANCE_CRITERION_MISSING', 'Criterion IDs must be complete/ordered'); text(row.rationale);
      if (!['PASSED', 'FAILED', 'BLOCKED', 'PENDING'].includes(row.status)) invalid('Invalid criterion status'); const refs = strings(row.evidenceIds).map(id => artifact(id));
      if (row.status === 'PASSED') { for (const kind of index.criteria[n].requiredKinds) if (!refs.some(a => a.kind === kind && a.result === 'PASSED')) fail(kind === 'live-integration' ? 'ACCEPTANCE_LIVE_EVIDENCE_MISSING' : 'ACCEPTANCE_CRITERION_MISSING', `Criterion ${row.id} missing ${kind}`); }
      else result.errors.push({ code: 'ACCEPTANCE_REQUIRED_RESULT_FAILED', message: `Criterion ${row.id} is ${row.status}` }); result.criterionResults.push({ id: row.id, status: row.status });
    });
    const review = object(v.review, ['verdict', 'artifactId', 'locator', 'findings']); text(review.locator); strings(review.findings); if (!['APPROVED', 'CHANGES_REQUIRED', 'BLOCKED'].includes(review.verdict)) invalid('Invalid independent review');
    if (review.artifactId !== null) artifact(review.artifactId, 'semantic-review');
    if (review.verdict !== 'APPROVED' || review.findings.length || review.artifactId === null || artifact(review.artifactId).result !== 'PASSED') result.errors.push({ code: 'ACCEPTANCE_REQUIRED_RESULT_FAILED', message: 'Independent review unresolved' });
    else equal(artifactJson(review.artifactId, 'semantic-review'), { candidate: options.candidate, indexSha256: v.indexSha256, verdict: review.verdict, locator: review.locator, findings: review.findings }, 'ACCEPTANCE_CANDIDATE_STALE');
    if (v.hostProject === null) {
      if (rows.some(r => liveIds.includes(r.id) && r.status === 'PASSED')) fail('ACCEPTANCE_LIVE_EVIDENCE_MISSING', 'Live criteria cannot pass without host project');
      result.errors.push({ code: 'ACCEPTANCE_LIVE_EVIDENCE_MISSING', message: 'Approved host project integrated run is pending' });
    } else validateHostProject(options, v.hostProject, artifactJson);
    if (!result.errors.length) result.status = 'EVIDENCE_COMPLETE'; return result;
  } catch (e) {
    if (e instanceof Refusal) { result.errors.push({ code: e.code, message: e.message }); return result; }
    if (e instanceof WorkflowError || e instanceof TophatConfigError) { result.errors.push({ code: 'ACCEPTANCE_RECORD_INVALID', message: 'Existing host contract validator rejected the input' }); return result; }
    const code = (e as NodeJS.ErrnoException).code;
    if (['GIT_HEAD_DETACHED', 'GIT_ROOT_MISMATCH', 'GIT_INDEX_UNSUPPORTED', 'GIT_PATH_UNSUPPORTED', 'GIT_INPUT_INVALID', 'GIT_PATH_INVALID'].includes(code ?? '')) { result.errors.push({ code: 'ACCEPTANCE_CANDIDATE_STALE', message: 'Candidate Git state is unsupported or unsafe' }); return result; }
    if (['ENOENT', 'ENOTDIR', 'ELOOP', 'EACCES'].includes(code ?? '')) { result.errors.push({ code: 'ACCEPTANCE_ARTIFACT_INVALID', message: 'Required file/root is missing or unreadable' }); return result; }
    throw e;
  }
}
function validateHostProject(options: AcceptanceOptions, input: unknown, json: (id: unknown, kind?: Kind) => any): void {
  const b = object(input, ['identity', 'baselineCommit', 'scope', 'authorityFingerprint', 'configFingerprint', 'packageValidatedAt', 'planningStartedAt', 'roadmapSha256', 'initializationArtifactId', 'tasks', 'phaseArtifactId', 'completionArtifactId']);
  const root = rootPath(options.hostRoot); identity(root, options.hostCandidate, b.identity); oid(b.baselineCommit);
  equal(git(root, ['merge-base', b.baselineCommit, options.hostCandidate]), b.baselineCommit, 'ACCEPTANCE_CANDIDATE_STALE');
  const cfg = loadTophatConfig(root); // The validated host contract selects the workspace profile; no product/framework is hardcoded.
  equal(hash(b.configFingerprint), fingerprint(cfg), 'ACCEPTANCE_CANDIDATE_STALE'); const pkg = inspectDocPackage(root);
  if (!pkg.snapshot || !pkg.report.planningAllowed) fail('ACCEPTANCE_LIVE_EVIDENCE_MISSING', 'host project approved package invalid');
  equal(hash(b.authorityFingerprint), pkg.snapshot.authorityFingerprint, 'ACCEPTANCE_CANDIDATE_STALE');
  const scope = object(b.scope, ['packageId', 'activeScopes', 'completionDeclaration', 'approvalLocator']); text(scope.completionDeclaration); text(scope.approvalLocator);
  equal(scope.packageId, pkg.snapshot.manifest.packageId); equal(strings(scope.activeScopes).sort(), [...pkg.snapshot.manifest.scope.active].sort());
  if (time(b.packageValidatedAt) > time(b.planningStartedAt)) invalid('Planning preceded package validation');
  equal(hash(b.roadmapSha256), digest(blob(root, options.hostCandidate, 'Roadmap.md')), 'ACCEPTANCE_CANDIDATE_STALE');
  const init = object(json(b.initializationArtifactId, 'live-integration'), ['packageValidatedAt', 'planningStartedAt', 'authorityFingerprint', 'roadmapSha256']);
  equal(init, { packageValidatedAt: b.packageValidatedAt, planningStartedAt: b.planningStartedAt, authorityFingerprint: b.authorityFingerprint, roadmapSha256: b.roadmapSha256 });
  const taskIds: string[] = [], tasks = strings(b.tasks); if (!tasks.length) invalid('Representative tasks missing');
  for (const id of tasks) {
    const task = object(json(id, 'live-integration'), ['task', 'testedCommit', 'stages', 'qa']); oid(task.testedCommit);
    equal(git(root, ['merge-base', task.testedCommit, options.hostCandidate]), task.testedCommit, 'ACCEPTANCE_CANDIDATE_STALE');
    const route = classifyTask(root, task.task, task.testedCommit); taskIds.push(route.task.taskId); validateStages(task.stages, route, task.testedCommit);
    if (route.qaRequired) { if (!task.qa || !validateQAEvidence(root, task.qa, task.testedCommit).approvalAllowed) fail('ACCEPTANCE_LIVE_EVIDENCE_MISSING', 'Task QA missing/denied'); }
    else if (task.qa !== null) invalid('Unexpected task QA');
  } unique(taskIds);
  const phase = json(b.phaseArtifactId, 'live-integration'), completion = json(b.completionArtifactId, 'live-integration');
  if (phase?.receipt?.candidate?.identity?.mode !== 'phase' || validateDerivedDocs(root, phase).status !== 'DOCUMENTATION_ACCEPTED') fail('ACCEPTANCE_LIVE_EVIDENCE_MISSING', 'Development Phase acceptance missing');
  if (completion?.receipt?.candidate?.identity?.mode !== 'project-completion' || validateDerivedDocs(root, completion).status !== 'PROJECT_DOCUMENTATION_ACCEPTED') fail('ACCEPTANCE_LIVE_EVIDENCE_MISSING', 'Final project verification missing');
  if (completion.receipt.candidate.identity.candidateCommit !== options.hostCandidate || !taskIds.every(id => phase.receipt.candidate.membership.includes(id) && completion.receipt.candidate.membership.includes(id))) fail('ACCEPTANCE_CANDIDATE_STALE', 'Task/phase/final candidate membership differs');
}
export function acceptanceCLI(args: string[]): { result: AcceptanceResult; exitCode: number } {
  let candidate: string | null = null;
  try {
    const names = ['root', 'candidate', 'index', 'evidence-root', 'dossier', 'host-root', 'host-candidate']; const parsed: Record<string, string> = {};
    for (let i = 0; i < args.length; i += 2) { const flag = args[i]; if (!flag.startsWith('--') || !names.includes(flag.slice(2)) || parsed[flag.slice(2)] || !args[i + 1] || args[i + 1].startsWith('--')) invalid('Explicit nonduplicate CLI arguments required'); parsed[flag.slice(2)] = args[i + 1]; }
    if (Object.keys(parsed).length !== names.length) invalid('All seven CLI arguments required'); candidate = parsed.candidate;
    const result = validateAcceptance({ root: parsed.root, candidate: parsed.candidate, index: parsed.index, evidenceRoot: parsed['evidence-root'], dossier: parsed.dossier, hostRoot: parsed['host-root'], hostCandidate: parsed['host-candidate'] });
    return { result, exitCode: result.status === 'EVIDENCE_COMPLETE' ? 0 : 1 };
  } catch (e) { return { exitCode: 2, result: { status: 'EVIDENCE_INCOMPLETE', candidate, criterionResults: [], errors: [{ code: e instanceof Refusal ? e.code : 'ACCEPTANCE_INTERNAL_FAILURE', message: e instanceof Refusal ? e.message : 'Acceptance inspection could not complete' }] } }; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { result, exitCode } = acceptanceCLI(process.argv.slice(2)); process.stdout.write(JSON.stringify(result) + '\n'); process.exitCode = exitCode;
}
