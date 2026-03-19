import test from "node:test";
import assert from "node:assert";
import { NodeValidator } from "./NodeValidator.js";
import { GraphProto, DataType } from "../types.js";
import { LintSeverity } from "./types.js";

test("NodeValidator - valid graph", () => {
  const validator = new NodeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [{ name: "in1", type: {} }],
    output: [{ name: "out1", type: {} }],
    initializer: [{ name: "init1", dims: [1], dataType: DataType.FLOAT }],
    node: [
      {
        name: "node1",
        opType: "Add",
        input: ["in1", "init1"],
        output: ["out1"],
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 0);
});

test("NodeValidator - missing input", () => {
  const validator = new NodeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [],
    output: [],
    initializer: [],
    node: [
      {
        name: "node1",
        opType: "Relu",
        input: ["missing_in"],
        output: ["out1"],
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "node-input-missing");
  assert.strictEqual(issues[0]!.severity, LintSeverity.ERROR);
});

test("NodeValidator - duplicate output", () => {
  const validator = new NodeValidator();
  const graph: GraphProto = {
    name: "test-graph",
    input: [{ name: "in1", type: {} }],
    output: [],
    initializer: [],
    node: [
      {
        name: "node1",
        opType: "Relu",
        input: ["in1"],
        output: ["out1"],
      },
      {
        name: "node2",
        opType: "Sigmoid",
        input: ["in1"],
        output: ["out1"], // duplicate
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "node-unique-outputs");
});
