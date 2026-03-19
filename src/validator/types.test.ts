import { describe, it } from "node:test";
import assert from "node:assert";
import { LintSeverity } from "./types.js";

describe("LintSeverity Enum", () => {
  it("should parse values correctly", () => {
    assert.strictEqual(LintSeverity.WARNING, "WARNING");
    assert.strictEqual(LintSeverity.ERROR, "ERROR");
  });
});
