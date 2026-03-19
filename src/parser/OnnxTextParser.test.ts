import { describe, it } from "node:test";
import assert from "node:assert";
import { OnnxTextParser } from "./OnnxTextParser.js";

describe("OnnxTextParser", () => {
  const parser = new OnnxTextParser();

  it("should successfully parse a valid ONNX JSON", () => {
    const validJson = JSON.stringify({
      irVersion: 8,
      graph: {
        name: "test-graph",
        node: [],
        initializer: [],
        input: [],
        output: [],
      },
    });

    const model = parser.parse(validJson);
    assert.strictEqual(model.irVersion, 8);
    assert.strictEqual(model.graph.name, "test-graph");
  });

  it("should throw an error on invalid JSON", () => {
    assert.throws(
      () => parser.parse("invalid-json"),
      /Failed to parse ONNX text:/
    );
  });
  
  it("should throw an error if the JSON is not an object", () => {
    assert.throws(
      () => parser.parse('"string"'),
      /Invalid ONNX root/
    );
    assert.throws(
      () => parser.parse("null"),
      /Invalid ONNX root/
    );
  });

  it("should throw an error if irVersion is missing", () => {
    assert.throws(
      () => parser.parse(JSON.stringify({ graph: {} })),
      /Invalid ONNX model: missing or invalid irVersion/
    );
  });

  it("should throw an error if graph is missing", () => {
    assert.throws(
      () => parser.parse(JSON.stringify({ irVersion: 8 })),
      /Invalid ONNX model: missing graph object/
    );
  });
});
