import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, approve, receipts, manifest, saveManifest } from './fixtures/documentation/fixture.ts';
import { documentationReadiness, overlayDocumentation } from '../scripts/update-hud.ts';
import { startHudWatcher } from '../scripts/watch-hud.ts';
import { inspectDocPackage } from '../scripts/validate-doc-package.ts';

test('HUD distinguishes draft, reviewed awaiting approval, approved, and invalidated', () => {
  const f = fixture(); try {
    assert.equal(documentationReadiness(f.root).report.documentationState, 'DRAFT');
    assert.equal(documentationReadiness(f.root).reviewRequired, true);
    receipts(f.root);
    assert.equal(documentationReadiness(f.root).report.documentationState, 'AWAITING_HUMAN_APPROVAL');
    assert.equal(documentationReadiness(f.root).reviewRequired, false);
    approve(f.root);
    assert.equal(documentationReadiness(f.root).report.planningAllowed, true);
    writeFileSync(join(f.root, 'docs/project/02-product.md'), 'tampered');
    assert.equal(documentationReadiness(f.root).report.documentationState, 'INVALIDATED');
    assert.equal(documentationReadiness(f.root).report.planningAllowed, false);
  } finally { f.close(); }
});
test('HUD denies stale review, unconfigured host, and spoofed readiness while preserving unrelated blockers', () => {
  const f = fixture(); try {
    receipts(f.root);
    writeFileSync(join(f.root, 'docs/project/README.md'), 'changed candidate');
    assert.equal(documentationReadiness(f.root).reviewRequired, true);
    const content = overlayDocumentation('Other blocker: missing credentials\nNone. Workspace is clean and ready.\n\n📚 Documentation Authority\nState: APPROVED', f.root);
    assert.match(content, /missing credentials/); assert.match(content, /Planning allowed: no/);
    assert.doesNotMatch(content, /State: APPROVED|Workspace is clean and ready/);
    rmSync(join(f.root, '.agents/tophat.config.json'));
    assert.equal(documentationReadiness(f.root).report.status, 'DENIED');
  } finally { f.close(); }
});
test('draft inspection cannot bless an approved manifest missing integrity metadata', () => {
  const f = fixture(); try {
    approve(f.root); const m = manifest(f.root); delete m.documents[0].sha256; saveManifest(f.root, m);
    assert.equal(inspectDocPackage(f.root, 'draft').report.status, 'DENIED');
  } finally { f.close(); }
});
test('watcher survives mid-write and missing package; refreshes nested edits without writes', async () => {
  const f = fixture(); let stop = () => {}; try {
    approve(f.root); writeFileSync(join(f.root, 'HUD.md'), 'Private target\nOther blocker: network');
    const hudBytes = readFileSync(join(f.root, 'HUD.md')); const manifestPath = join(f.root, 'docs/project/manifest.json');
    const original = readFileSync(manifestPath); const frames: string[] = [];
    stop = startHudWatcher(f.root, content => frames.push(content), 10);
    assert.match(frames.at(-1)!, /Planning allowed: yes/);
    writeFileSync(manifestPath, '{');
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.match(frames.at(-1)!, /Planning allowed: no/);
    writeFileSync(manifestPath, original);
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.match(frames.at(-1)!, /Planning allowed: yes/);
    rmSync(join(f.root, 'docs'), { recursive: true });
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.match(frames.at(-1)!, /Planning allowed: no/);
    assert.deepEqual(readFileSync(join(f.root, 'HUD.md')), hudBytes);
    stop(); const count = frames.length;
    await new Promise(resolve => setTimeout(resolve, 30)); assert.equal(frames.length, count);
  } finally { stop(); f.close(); }
});
