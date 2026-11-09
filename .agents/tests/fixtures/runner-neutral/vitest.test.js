import { expect, test } from "vitest";
import { sum } from "./sum.js";
test("sum handles two positive values and a negative value", () => {
  expect(sum(2, 3)).toBe(5);
  expect(sum(-1, 1)).toBe(0);
});
