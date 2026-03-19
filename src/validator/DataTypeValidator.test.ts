import test from "node:test";
import assert from "node:assert";
import { DataTypeValidator } from "./DataTypeValidator.js";
import { GraphProto, DataType } from "../types.js";
import { LintSeverity } from "./types.js";

test("DataTypeValidator - all valid", () => {
  const validator = new DataTypeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [
      {
        name: "in1",
        type: { tensorType: { elemType: DataType.FLOAT } },
      },
    ],
    output: [
      {
        name: "out1",
        type: { tensorType: { elemType: DataType.INT32 } },
      },
    ],
    initializer: [
      {
        name: "init1",
        dims: [1],
        dataType: DataType.FLOAT,
      },
    ],
    node: [],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 0);
});

test("DataTypeValidator - invalid initializer", () => {
  const validator = new DataTypeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [],
    output: [],
    initializer: [
      {
        name: "init1",
        dims: [1],
        dataType: DataType.UNDEFINED,
      },
    ],
    node: [],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "valid-data-type");
  assert.strictEqual(issues[0]!.severity, LintSeverity.ERROR);
  assert.strictEqual(issues[0]!.path, "init1");
});

test("DataTypeValidator - invalid input", () => {
  const validator = new DataTypeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [
      {
        name: "in1",
        type: { tensorType: { elemType: DataType.UNDEFINED } },
      },
    ],
    output: [],
    initializer: [],
    node: [],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "valid-data-type");
  assert.strictEqual(issues[0]!.path, "in1");
});

test("DataTypeValidator - invalid output", () => {
  const validator = new DataTypeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [],
    output: [
      {
        name: "out1",
        type: { tensorType: { elemType: DataType.UNDEFINED } },
      },
    ],
    initializer: [],
    node: [],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "valid-data-type");
  assert.strictEqual(issues[0]!.path, "out1");
});

test("DataTypeValidator - missing tensorType", () => {
  const validator = new DataTypeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [
      {
        name: "in1",
        type: { },
      },
    ],
    output: [
      {
        name: "out1",
        type: { },
      },
    ],
    initializer: [],
    node: [],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 0); // Not undefined, just missing.
});
