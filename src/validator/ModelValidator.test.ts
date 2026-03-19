import { describe, it } from "node:test";
import assert from "node:assert";
import { ModelValidator } from "./ModelValidator.js";
import { ModelProto, DataType } from "../types.js";

describe("ModelValidator", () => {
  const validator = new ModelValidator();

  it("should return no issues for a valid model", () => {
    const validModel: ModelProto = {
      irVersion: 8,
      graph: {
        name: "test",
        input: [
          { name: "A", type: { tensorType: { elemType: DataType.FLOAT } } }
        ],
        output: [
          { name: "B", type: { tensorType: { elemType: DataType.FLOAT } } }
        ],
        initializer: [],
        node: [
          { name: "n1", input: ["A"], output: ["B"], opType: "Relu" }
        ]
      }
    };

    const issues = validator.validate(validModel);
    assert.strictEqual(issues.length, 0);
  });

  it("should return aggregated issues for an invalid model", () => {
    const invalidModel: ModelProto = {
      irVersion: 8,
      graph: {
        name: "test",
        input: [
          { name: "A", type: { tensorType: { elemType: DataType.FLOAT } } }
        ],
        output: [
          { name: "B", type: { tensorType: { elemType: DataType.UNDEFINED } } } // Invalid DataType
        ],
        initializer: [],
        node: [
          { name: "n1", input: ["MissingInput"], output: ["B"], opType: "Relu" }, // Invalid Node input
          { name: "n2", input: ["A"], output: ["B"], opType: "Relu" }, // Duplicate output producer (Graph)
        ]
      }
    };

    const issues = validator.validate(invalidModel);
    // Should catch datatype error, missing input, and duplicate producer (which also causes unique output issues in node and graph validators).
    assert.ok(issues.length >= 3);
  });
});
