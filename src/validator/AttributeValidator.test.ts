import test from "node:test";
import assert from "node:assert";
import { AttributeValidator } from "./AttributeValidator.js";
import { GraphProto } from "../types.js";
import { LintSeverity } from "./types.js";

test("AttributeValidator - all attributes present", () => {
  const reqMap = new Map<string, string[]>([["Conv", ["kernel_shape", "strides"]]]);
  const validator = new AttributeValidator(reqMap);

  const graph: GraphProto = {
    name: "test",
    input: [],
    output: [],
    initializer: [],
    node: [
      {
        name: "node1",
        opType: "Conv",
        input: ["in"],
        output: ["out"],
        attribute: [
          { name: "kernel_shape", type: "INTS" },
          { name: "strides", type: "INTS" },
        ],
      },
      {
        name: "node2",
        opType: "Relu", // No requirements
        input: ["out"],
        output: ["out2"],
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 0);
});

test("AttributeValidator - missing attribute", () => {
  const reqMap = new Map<string, string[]>([["Conv", ["kernel_shape", "strides"]]]);
  const validator = new AttributeValidator(reqMap);

  const graph: GraphProto = {
    name: "test",
    input: [],
    output: [],
    initializer: [],
    node: [
      {
        name: "node1",
        opType: "Conv",
        input: ["in"],
        output: ["out"],
        attribute: [
          { name: "kernel_shape", type: "INTS" },
        ],
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "missing-attribute");
  assert.strictEqual(issues[0]!.severity, LintSeverity.ERROR);
  assert.strictEqual(issues[0]!.path, "node1");
  assert.strictEqual(
    issues[0]!.message,
    "Node 'node1' of opType 'Conv' is missing required attribute 'strides'."
  );
});

test("AttributeValidator - missing all attributes (no attribute array)", () => {
  const reqMap = new Map<string, string[]>([["Conv", ["kernel_shape"]]]);
  const validator = new AttributeValidator(reqMap);

  const graph: GraphProto = {
    name: "test",
    input: [],
    output: [],
    initializer: [],
    node: [
      {
        name: "node1",
        opType: "Conv",
        input: ["in"],
        output: ["out"],
        // attribute undefined
      },
    ],
  };

  const issues = validator.validate(graph);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0]!.ruleId, "missing-attribute");
  assert.strictEqual(issues[0]!.path, "node1");
});
