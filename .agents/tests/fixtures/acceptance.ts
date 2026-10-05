import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixture, record, receipt, request, completionDimensions, git } from './derived-docs.ts';
import { digest, inspectDocPackage } from '../../scripts/validate-doc-package.ts';
import { fingerprint } from '../../scripts/classify-task.ts';
import { loadTophatConfig } from '../../scripts/load-tophat-config.ts';
import type { AcceptanceOptions, Artifact } from '../../scripts/validate-acceptance-evidence.ts';
const vault = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export function acceptanceFixture(full = false, workspace = { kind: 'web', framework: 'sveltekit' }) {
  const root = mkdtempSync(join(tmpdir(), 'tophat-acceptance-')), evidenceRoot = mkdtempSync(join(tmpdir(), 'tophat-dossier-'));
  const index = JSON.parse(readFileSync(join(vault, '.agents/docs/acceptance-criteria.json'), 'utf8'));
  const paths = [...new Set(['.agents/docs/acceptance-criteria.json', ...index.groups.map((g: any) => g.path), ...index.criteria.flatMap((c: any) => c.tests.map((r: any) => r.path))])];
  for (const p of paths as string[]) { mkdirSync(dirname(join(root, p)), { recursive: true }); cpSync(join(vault, p), join(root, p)); }
  git(root, ['init', '-b', 'acceptance']); git(root, ['config', 'user.name', 'Fixture']); git(root, ['config', 'user.email', 'fixture@example.invalid']); git(root, ['remote', 'add', 'origin', 'https://example.invalid/tophat']);
  git(root, ['--literal-pathspecs', 'add', '--', ...paths]); git(root, ['commit', '-m', 'Synthetic acceptance candidate']);
  const candidate = git(root, ['rev-parse', 'HEAD']); const artifacts: Artifact[] = [];
  const add = (id: string, content: unknown, kind: Artifact['kind'], provenance: Artifact['provenance'] = 'observed') => {
    const bytes = typeof content === 'string' ? content : JSON.stringify(content); const path = `${id}.json`; writeFileSync(join(evidenceRoot, path), bytes);
    artifacts.push({ id, path, sha256: digest(bytes), kind, provenance, result: 'PASSED', rationale: 'Synthetic unit-test record; no real person or host project acceptance is asserted' }); return id;
  };
  const identity = (r: string) => ({ root: r, commit: git(r, ['rev-parse', 'HEAD']), tree: git(r, ['rev-parse', 'HEAD^{tree}']), branch: git(r, ['branch', '--show-current']), remoteUrlSha256: digest(git(r, ['config', '--get', 'remote.origin.url'])) });
  add('mechanism', 'Synthetic mechanism observation', 'mechanism', 'synthetic'); add('configuration', 'Synthetic configuration fixture', 'configuration-fixture', 'configuration'); add('review', { candidate, indexSha256: digest(readFileSync(join(root, '.agents/docs/acceptance-criteria.json'))), verdict: 'APPROVED', locator: 'fixture:review', findings: [] }, 'semantic-review'); add('live', 'Synthetic stand-in for a live artifact, for parser testing only', 'live-integration');
  const suite = { command: 'pnpm test:tophat', exitStatus: 0, passed: 1, failed: 0, skipped: 0 }; add('suite', suite, 'command-execution'); add('suite-log', '# tests 1\n# pass 1\n# fail 0\n# skipped 0\n', 'command-execution');
  let hostProjectFixture: ReturnType<typeof fixture> | null = null;
  let hostProject: any = null;
  if (full) {
    hostProjectFixture = fixture(); git(hostProjectFixture.root, ['remote', 'add', 'origin', 'https://example.invalid/host-project']);
    const cfg = JSON.parse(readFileSync(join(hostProjectFixture.root, '.agents/tophat.config.json'), 'utf8')); cfg.workspace = workspace; writeFileSync(join(hostProjectFixture.root, '.agents/tophat.config.json'), JSON.stringify(cfg));
    git(hostProjectFixture.root, ['--literal-pathspecs', 'add', '--', '.agents/tophat.config.json']); if (git(hostProjectFixture.root, ['status', '--porcelain'])) git(hostProjectFixture.root, ['commit', '-m', 'Synthetic host contract declaration']);
    const phase = receipt(record(hostProjectFixture, false)), c = record(hostProjectFixture, false);
    c.identity.mode = 'project-completion'; c.identity.id = 'project-final'; c.identity.phaseId = null; c.phases = [phase]; c.completion = completionDimensions.map(dimension => ({ dimension, result: 'PASSED', rationale: 'Synthetic final-scope review' })); c.baselineValidation = hostProjectFixture.check({ gate: 'projectCompletionGate' }); c.finalValidation = hostProjectFixture.check({ gate: 'projectCompletionGate' });
    const pkg = inspectDocPackage(hostProjectFixture.root).snapshot!; const authorityFingerprint = pkg.authorityFingerprint, roadmapSha256 = digest(readFileSync(join(hostProjectFixture.root, 'Roadmap.md')));
    const packageValidatedAt = '2026-10-03T18:00:00.000Z', planningStartedAt = '2026-10-03T18:00:01.000Z';
    hostProject = { identity: identity(hostProjectFixture.root), baselineCommit: phase.candidate.identity.baselineCommit,
      scope: { packageId: pkg.manifest.packageId, activeScopes: pkg.manifest.scope.active, completionDeclaration: 'Synthetic approved scope', approvalLocator: 'fixture:scope' }, authorityFingerprint, configFingerprint: fingerprint(loadTophatConfig(hostProjectFixture.root)), packageValidatedAt, planningStartedAt, roadmapSha256,
      initializationArtifactId: add('initialization', { packageValidatedAt, planningStartedAt, authorityFingerprint, roadmapSha256 }, 'live-integration'),
      tasks: [add('task', { task: hostProjectFixture.task, testedCommit: phase.candidate.tasks[0].testedCommit, stages: phase.candidate.tasks[0].stages, qa: null }, 'live-integration')],
      phaseArtifactId: add('phase', request(phase), 'live-integration'), completionArtifactId: add('completion', request(receipt(c)), 'live-integration') };
  }
  const dossier: any = { schemaVersion: 1, identity: identity(root), indexSha256: digest(readFileSync(join(root, '.agents/docs/acceptance-criteria.json'))), runtime: { node: process.versions.node, pnpm: '11.25.0', os: process.platform },
    attempts: [{ sequence: 1, runId: 'run-1', candidate, startedAt: '2026-10-05T05:00:00.000Z', completedAt: '2026-10-05T05:00:01.000Z', status: 'PASSED', suite: { ...suite, artifactId: 'suite', logArtifactId: 'suite-log' } }], currentAttempt: 'run-1', artifacts,
    criteria: index.criteria.map((c: any) => ({ id: c.id, status: !full && c.hostIntegrationRequired ? 'PENDING' : 'PASSED', rationale: 'Synthetic criterion record', evidenceIds: ['mechanism', 'configuration', 'review', 'suite', 'live'] })), hostProject,
    review: { verdict: 'APPROVED', artifactId: 'review', locator: 'fixture:review', findings: [] }, limitations: ['Entire dossier is a synthetic test fixture, not live release evidence'] };
  const options: AcceptanceOptions = { root, candidate, index: join(root, '.agents/docs/acceptance-criteria.json'), evidenceRoot, dossier: join(evidenceRoot, 'dossier.json'), hostRoot: hostProjectFixture?.root ?? join(evidenceRoot, 'missing-host'), hostCandidate: hostProject?.identity.commit ?? '0'.repeat(40) };
  const save = () => writeFileSync(options.dossier, JSON.stringify(dossier)); save();
  const changeArtifact = (id: string, fn: (v: any) => void) => { const a = artifacts.find(a => a.id === id)!; const p = join(evidenceRoot, a.path); const v = JSON.parse(readFileSync(p, 'utf8')); fn(v); const bytes = JSON.stringify(v); writeFileSync(p, bytes); a.sha256 = digest(bytes); };
  return { options, dossier, index, artifacts, add, save, changeArtifact, hostProjectFixture, close: () => { hostProjectFixture?.close(); rmSync(root, { recursive: true, force: true }); rmSync(evidenceRoot, { recursive: true, force: true }); } };
}
