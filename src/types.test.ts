import { describe, it } from "node:test";
import assert from "node:assert";
import { DataType } from "./types.js";

describe("DataType Enum", () => {
  it("should have UNDEFINED mapped to 0", () => {
    assert.strictEqual(DataType.UNDEFINED, 0);
  });

  it("should have FLOAT mapped to 1", () => {
    assert.strictEqual(DataType.FLOAT, 1);
  });

  it("should parse values correctly", () => {
    assert.strictEqual(DataType[DataType.INT8], "INT8");
  });
});
