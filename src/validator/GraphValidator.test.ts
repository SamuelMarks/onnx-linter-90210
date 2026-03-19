import { describe, it } from "node:test";
import assert from "node:assert";
import { GraphValidator } from "./GraphValidator.js";
import { GraphProto } from "../types.js";
import { LintSeverity } from "./types.js";

describe("GraphValidator", () => {
  const validator = new GraphValidator();

  it("should return no issues for a valid acyclic graph", () => {
    const validGraph: GraphProto = {
      name: "valid",
      node: [
        { name: "n1", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "n2", input: ["B"], output: ["C"], opType: "Relu" },
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(validGraph);
    assert.strictEqual(issues.length, 0);
  });

  it("should return no issues for a DAG with a diamond shape (hits already visited)", () => {
    const diamondGraph: GraphProto = {
      name: "diamond",
      node: [
        { name: "n1", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "n2", input: ["A"], output: ["C"], opType: "Relu" },
        { name: "n3", input: ["B", "C"], output: ["D"], opType: "Add" },
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(diamondGraph);
    assert.strictEqual(issues.length, 0);
  });

  it("should report an error for duplicate output producers", () => {
    const invalidGraph: GraphProto = {
      name: "duplicate_producer",
      node: [
        { name: "n1", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "n2", input: ["C"], output: ["B"], opType: "Sigmoid" }, // Duplicate output 'B'
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(invalidGraph);
    assert.strictEqual(issues.length, 1);
    assert.strictEqual(issues[0]!.ruleId, "graph-unique-outputs");
    assert.strictEqual(issues[0]!.severity, LintSeverity.ERROR);
    assert.strictEqual(issues[0]!.path, "n2");
  });

  it("should default path to unnamed-node if a duplicate producer node lacks a name", () => {
    const invalidGraph: GraphProto = {
      name: "duplicate_producer_unnamed",
      node: [
        { name: "n1", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "", input: ["C"], output: ["B"], opType: "Sigmoid" },
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(invalidGraph);
    assert.strictEqual(issues[0]!.path, "unnamed-node");
  });

  it("should report an error if the graph contains a cycle", () => {
    const cyclicGraph: GraphProto = {
      name: "cyclic_graph",
      node: [
        { name: "n1", input: ["C"], output: ["A"], opType: "Relu" },
        { name: "n2", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "n3", input: ["B"], output: ["C"], opType: "Relu" }, // Cycle: A->B->C->A
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(cyclicGraph);
    const cycleIssue = issues.find(i => i.ruleId === "graph-acyclic");
    assert.ok(cycleIssue);
    assert.strictEqual(cycleIssue?.severity, LintSeverity.ERROR);
  });

  it("should handle disjoint subgraphs correctly", () => {
    const disjointGraph: GraphProto = {
      name: "disjoint_graph",
      node: [
        { name: "n1", input: ["A"], output: ["B"], opType: "Relu" },
        { name: "n2", input: ["C"], output: ["D"], opType: "Relu" },
      ],
      input: [],
      output: [],
      initializer: [],
    };
    const issues = validator.validate(disjointGraph);
    assert.strictEqual(issues.length, 0);
  });
});
