# Synthetic criterion trace cases for independent semantic review

These are bounded review scenarios, not executed product tests or live acceptance. Judge each supplied trace from the requirement, changed behavior and test/procedure relevance. Do not infer approval from a source citation or the claimed green result. Applicable visual/manual evidence may be appropriate. Preserve missing/failed evidence and identify unexplained scope. No universal AC namespace is imposed.

## Case A

Approved task source `access#reject-anonymous`: an anonymous caller must receive AccessDenied before any storage lookup. The only changed behavior is the authorized read function.

```js
export function readRecord(session, storage) {
  if (!session) throw new Error('AccessDenied');
  return storage.read(session.recordId);
}
```

Supplied test calls `readRecord(null, storageSpy)`, asserts AccessDenied and asserts zero storage calls; a second test passes a permitted session and asserts the correct row lookup. Claimed trace: source → guard in readRecord → the two tests. Review the semantic relevance rather than certify execution from this description.

## Case B

Approved task source `access#reject-anonymous`: an anonymous caller must receive AccessDenied before any storage lookup. Claimed implementation and test both cite that source.

```js
export function readRecord(session, storage) {
  return storage.read(session?.recordId);
}
```

Supplied test imports readRecord and asserts `typeof readRecord === 'function'`. The report states GREEN and associates the test with `access#reject-anonymous`.

## Case C

Approved task source `upload#retry-once`: retry a failed transient upload at most once. Approved scope is the upload boundary only.

```diff
 export function upload(client, payload) {
-  return client.send(payload);
+  return client.send(payload).catch(() => client.send(payload));
 }
-export const defaultLocale = 'en';
+export const defaultLocale = 'fr';
```

Supplied test asserts a successful first upload calls send once. Report cites `upload#retry-once` for the entire diff and claims green. No other criterion authorizes localization changes. No failure/second-failure test or manual procedure is supplied.

## Case D

Approved task source `layout#no-horizontal-overflow`: a static summary card at declared widths 320px and 1280px must not create horizontal document overflow. Changed behavior is only the card width/wrapping policy. No application logic changes.

The task selects visual/responsive QA. The supplied plan records screenshots at both controlled widths, browser/build identity, document scrollWidth/clientWidth comparison and readable content inspection. Evidence is pending; no screenshots or measured results have yet been provided. The report recommends visual/manual evidence instead of a new universal unit-test gate. Assess the proposed method and the current verdict separately.
