import assert from 'node:assert/strict';
import test from 'node:test';
import { label } from './coverage-subject.js';
test('positive label is the deliberately bounded covered journey', () => assert.equal(label(1), 'positive'));
