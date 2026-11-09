import { expect, test } from 'vitest';
import { label } from './coverage-subject.js';
test('positive label is the deliberately bounded covered journey', () => expect(label(1)).toBe('positive'));
