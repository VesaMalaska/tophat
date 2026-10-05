import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkedIndex, validateAcceptance, acceptanceCLI, streamArtifact, limits } from '../scripts/validate-acceptance-evidence.ts';
import { acceptanceFixture } from './fixtures/acceptance.ts';
const check = (f: ReturnType<typeof acceptanceFixture>) => { f.save(); return validateAcceptance(f.options); };
const code = (f: ReturnType<typeof acceptanceFixture>) => check(f).errors.at(-1)?.code;
function run(fn: (f: ReturnType<typeof acceptanceFixture>) => void, full = false) { const f = acceptanceFixture(full); try { fn(f); } finally { f.close(); } }
test('criterion index resolves exactly 30 approved IDs and all 14 test groups', () => {
  const root = resolve('.'); const index = JSON.parse(readFileSync(join(root, '.agents/docs/acceptance-criteria.json'), 'utf8'));
  assert.equal(checkedIndex(index, p => readFileSync(join(root, p), 'utf8')).criteria.length, 30);
  for (const mutate of [(v: any) => v.criteria.pop(), (v: any) => v.criteria[1].id = 1, (v: any) => v.criteria[0].tests[0].name = 'nonexistent test', (v: any) => v.groups.pop(), (v: any) => v.criteria[11].bunnyHopRequired = false, (v: any) => v.extra = true]) { const v = structuredClone(index); mutate(v); assert.throws(() => checkedIndex(v, p => readFileSync(join(root, p), 'utf8'))); }
});
test('missing live BunnyHop leaves aggregate acceptance pending without mutating hosts', () => run(f => {
  const before = spawnSync('git', ['status', '--porcelain'], { cwd: f.options.root, encoding: 'utf8' }).stdout;
  const result = check(f); assert.equal(result.status, 'EVIDENCE_INCOMPLETE'); assert.ok(result.errors.some(e => e.code === 'ACCEPTANCE_LIVE_EVIDENCE_MISSING')); assert.equal(result.criterionResults.length, 30);
  assert.equal(spawnSync('git', ['status', '--porcelain'], { cwd: f.options.root, encoding: 'utf8' }).stdout, before);
}));
test('fully consistent synthetic dossier invokes real lifecycle validators; it does not authenticate live execution', () => run(f => {
  const result = check(f); assert.equal(result.status, 'EVIDENCE_COMPLETE', JSON.stringify(result));
}, true));
test('claimed live pass without integrated BunnyHop is denied', () => run(f => { f.dossier.criteria[11].status = 'PASSED'; assert.equal(code(f), 'ACCEPTANCE_LIVE_EVIDENCE_MISSING'); }));
test('malformed, duplicate-key, unknown-field and oversized dossier JSON deny', () => run(f => {
  for (const bytes of ['{', '{"schemaVersion":1,"schemaVersion":1}', JSON.stringify({ ...f.dossier, extra: true }), ' '.repeat(limits.json + 1)]) { writeFileSync(f.options.dossier, bytes); assert.equal(validateAcceptance(f.options).status, 'EVIDENCE_INCOMPLETE'); }
}));
test('missing, duplicate, foreign, and inapplicable criterion results deny', () => run(f => {
  for (const mutate of [(v: any) => v.criteria.pop(), (v: any) => v.criteria[1].id = 1, (v: any) => v.criteria[0].status = 'NOT_APPLICABLE', (v: any) => v.criteria[0].evidenceIds = ['missing'], (v: any) => v.criteria[0].evidenceIds = ['configuration']]) { const original = structuredClone(f.dossier); mutate(f.dossier); assert.equal(check(f).status, 'EVIDENCE_INCOMPLETE'); Object.assign(f.dossier, original); }
}));
test('exact candidate, index digest, branch, remote and dirty states cannot drift', () => run(f => {
  for (const field of ['commit', 'tree', 'remoteUrlSha256']) { const old = f.dossier.identity[field]; f.dossier.identity[field] = '0'.repeat(old.length); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE'); f.dossier.identity[field] = old; }
  f.dossier.indexSha256 = '0'.repeat(64); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE');
  f.dossier.indexSha256 = f.artifacts[0].sha256; assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE');
}));
test('untracked and tracked changes invalidate the clean candidate', () => run(f => {
  writeFileSync(join(f.options.root, 'surprise.txt'), 'unclassified'); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE'); rmSync(join(f.options.root, 'surprise.txt'));
  writeFileSync(f.options.index, '{}'); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE');
}));
test('latest failed attempt supersedes earlier green without allowing currentAttempt fallback', () => run(f => {
  const a = structuredClone(f.dossier.attempts[0]); a.sequence = 2; a.runId = 'run-2'; a.startedAt = '2026-10-05T05:01:00.000Z'; a.completedAt = '2026-10-05T05:01:01.000Z'; a.status = 'FAILED'; a.suite = { command: 'pnpm test:tophat', exitStatus: 1, passed: 0, failed: 1, skipped: 0, artifactId: 'failed-suite', logArtifactId: 'failed-log' };
  f.add('failed-suite', { command: a.suite.command, exitStatus: 1, passed: 0, failed: 1, skipped: 0 }, 'command-execution'); f.artifacts.at(-1)!.result = 'FAILED'; f.add('failed-log', '# tests 1\n# pass 0\n# fail 1\n# skipped 0\n', 'command-execution'); f.artifacts.at(-1)!.result = 'FAILED'; f.dossier.attempts.push(a);
  assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE'); f.dossier.currentAttempt = 'run-2'; assert.ok(check(f).errors.some(e => e.code === 'ACCEPTANCE_REQUIRED_RESULT_FAILED'));
}));
test('attempt chronology, counts, run IDs and report bytes must agree', () => run(f => {
  for (const mutate of [(v: any) => v.attempts[0].sequence = 2, (v: any) => v.attempts[0].completedAt = v.attempts[0].startedAt.replace('05:00:00', '04:00:00'), (v: any) => v.attempts[0].suite.failed = 1, (v: any) => v.attempts[0].suite.passed = -1, (v: any) => v.attempts[0].suite.command = 'invented']) { const old = structuredClone(f.dossier); mutate(f.dossier); assert.equal(check(f).status, 'EVIDENCE_INCOMPLETE'); Object.assign(f.dossier, old); }
}));
test('synthetic or configuration artifacts cannot be mislabeled as observed command or live evidence', () => run(f => {
  for (const kind of ['command-execution', 'live-integration', 'semantic-review']) { const a = f.artifacts.find(a => a.kind === kind)!; a.provenance = 'synthetic'; assert.equal(code(f), 'ACCEPTANCE_RECORD_INVALID'); a.provenance = 'observed'; }
}));
test('artifact digest, absence, symlink, traversal and case-folded parent collisions deny', () => run(f => {
  const a = f.artifacts[0], old = { ...a };
  for (const path of ['../outside', 'C:/outside', 'a\\b', '/absolute', 'a/../b', '.git/config']) { a.path = path; assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID'); } Object.assign(a, old);
  a.sha256 = '0'.repeat(64); assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID'); Object.assign(a, old);
  rmSync(join(f.options.evidenceRoot, a.path)); assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID'); symlinkSync(f.options.index, join(f.options.evidenceRoot, a.path)); assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID');
}));
test('artifact case-fold and duplicate inventories fail before reading paths', () => run(f => {
  f.artifacts[1].path = f.artifacts[0].path.toUpperCase(); assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID');
  f.artifacts[1].path = f.artifacts[0].path; assert.equal(code(f), 'ACCEPTANCE_RECORD_INVALID');
}));
test('streamed file and aggregate resource limits deny without retaining large artifact buffers', () => run(f => {
  const p = join(f.options.evidenceRoot, f.artifacts[0].path); truncateSync(p, limits.file + 1); assert.equal(code(f), 'ACCEPTANCE_RESOURCE_LIMIT');
  const fd = openSync(p, 'w'); closeSync(fd); truncateSync(p, limits.file); const sha = streamArtifact(p).sha256; f.artifacts[0].sha256 = sha;
  for (let n = 0; n < 4; n++) { const id = `large-${n}`; f.add(id, '', 'mechanism', 'synthetic'); const a = f.artifacts.at(-1)!; truncateSync(join(f.options.evidenceRoot, a.path), limits.file); a.sha256 = sha; }
  assert.equal(code(f), 'ACCEPTANCE_RESOURCE_LIMIT');
}));
test('artifact entry and attempt limits deny malformed oversized inventories', () => run(f => {
  f.dossier.artifacts = Array(513).fill(f.artifacts[0]); assert.equal(code(f), 'ACCEPTANCE_RECORD_INVALID');
}));
test('unresolved independent review and optional artifacts cannot satisfy mandatory criteria', () => run(f => {
  f.dossier.review.verdict = 'CHANGES_REQUIRED'; f.dossier.review.findings = ['Unresolved criterion']; assert.ok(check(f).errors.some(e => e.code === 'ACCEPTANCE_REQUIRED_RESULT_FAILED'));
  f.artifacts[0].result = 'SKIPPED_NOT_APPLICABLE'; assert.equal(code(f), 'ACCEPTANCE_CRITERION_MISSING');
}));
test('BunnyHop final scope, initialization order, config and final project receipt are checked', () => run(f => {
  for (const mutate of [(v: any) => v.bunnyHop.configFingerprint = '0'.repeat(64), (v: any) => v.bunnyHop.authorityFingerprint = '0'.repeat(64), (v: any) => v.bunnyHop.scope.activeScopes = ['fabricated'], (v: any) => v.bunnyHop.planningStartedAt = '2026-10-03T17:00:00.000Z', (v: any) => v.bunnyHop.completionArtifactId = v.bunnyHop.phaseArtifactId]) { const old = structuredClone(f.dossier); mutate(f.dossier); assert.equal(check(f).status, 'EVIDENCE_INCOMPLETE'); Object.assign(f.dossier, old); }
}, true));
test('BunnyHop stale task and missing phase cannot be replaced by immediate synchronization', () => run(f => {
  f.changeArtifact('phase', v => v.receipt.candidate.identity.mode = 'immediate'); assert.equal(code(f), 'ACCEPTANCE_LIVE_EVIDENCE_MISSING');
}, true));
test('CLI requires all explicit nonduplicate arguments and maps internal failures to exit 2', () => {
  assert.equal(acceptanceCLI([]).exitCode, 2); assert.equal(acceptanceCLI(['--root', '/tmp', '--root', '/tmp']).exitCode, 2);
  const script = resolve('.agents/scripts/validate-acceptance-evidence.ts'); const p = spawnSync(process.execPath, [script], { encoding: 'utf8' }); assert.equal(p.status, 2); assert.equal(JSON.parse(p.stdout).status, 'EVIDENCE_INCOMPLETE');
});
test('CLI gives exit 0 only for complete consistent evidence and exit 1 for missing live prerequisites', () => {
  const args = (f: ReturnType<typeof acceptanceFixture>) => ['--root', f.options.root, '--candidate', f.options.candidate, '--index', f.options.index, '--evidence-root', f.options.evidenceRoot, '--dossier', f.options.dossier, '--bunnyhop-root', f.options.bunnyHopRoot, '--bunnyhop-candidate', f.options.bunnyHopCandidate];
  run(f => assert.equal(acceptanceCLI(args(f)).exitCode, 1));
  run(f => { assert.equal(acceptanceCLI(args(f)).exitCode, 0); const old = process.env.PATH; try { process.env.PATH = ''; assert.equal(acceptanceCLI(args(f)).exitCode, 2); } finally { process.env.PATH = old; } }, true);
});
test('canonical credential files are excluded and index policy cannot be weakened', () => run(f => {
  f.artifacts[0].path = '.env.production'; assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID');
  const v = structuredClone(f.index); v.criteria[29].requiredKinds = ['mechanism']; assert.throws(() => checkedIndex(v, p => readFileSync(join(f.options.root, p), 'utf8')));
}));
test('report/log count mismatch and stale independent review bytes deny', () => run(f => {
  const log = f.artifacts.find(a => a.id === 'suite-log')!; writeFileSync(join(f.options.evidenceRoot, log.path), '# tests 2\n# pass 2\n# fail 0\n# skipped 0\n');
  assert.equal(code(f), 'ACCEPTANCE_ARTIFACT_INVALID');
  writeFileSync(join(f.options.evidenceRoot, log.path), '# tests 1\n# pass 1\n# fail 0\n# skipped 0\n');
  f.changeArtifact('review', v => v.candidate = '0'.repeat(40)); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE');
}));
test('aborted attempts preserve raw failure logs and cannot supersede a required passing run', () => run(f => {
  const a = f.dossier.attempts[0]; a.status = 'BLOCKED'; a.suite = { command: 'pnpm test:tophat', exitStatus: null, passed: 0, failed: 0, skipped: 0, artifactId: 'aborted-summary', logArtifactId: 'aborted-log' };
  f.add('aborted-summary', { command: a.suite.command, exitStatus: null, passed: 0, failed: 0, skipped: 0 }, 'command-execution'); f.artifacts.at(-1)!.result = 'FAILED';
  f.add('aborted-log', 'Process timed out before a result summary', 'command-execution'); f.artifacts.at(-1)!.result = 'FAILED';
  assert.ok(check(f).errors.some(e => e.code === 'ACCEPTANCE_REQUIRED_RESULT_FAILED'));
}));
test('detached candidates deny as unsafe records without treating them as successful inspection', () => run(f => {
  const p = spawnSync('git', ['switch', '--detach', f.options.candidate], { cwd: f.options.root }); assert.equal(p.status, 0); assert.equal(code(f), 'ACCEPTANCE_CANDIDATE_STALE');
}));
