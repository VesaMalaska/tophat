import assert from "node:assert/strict";
import test from "node:test";
import { sum } from "./sum.js";
test("sum handles two positive values and a negative value", () => {
  assert.equal(sum(2, 3), 5);
  assert.equal(sum(-1, 1), 0);
});
