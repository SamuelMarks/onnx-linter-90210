import { ModelProto } from "../types.js";

/**
 * Parses ONNX text format (JSON representation) into a ModelProto.
 */
export class OnnxTextParser {
  /**
   * Parses the provided string content into an ONNX ModelProto object.
   * @param content - The text representation (JSON) of the ONNX file.
   * @returns The parsed ModelProto structure.
   * @throws Error if the string is not valid JSON or lacks a valid graph.
   */
  public parse(content: string): ModelProto {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse ONNX text: ${String(e)}`);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid ONNX root: must be an object.");
    }

    const model = parsed as Partial<ModelProto>;

    if (typeof model.irVersion !== "number") {
      throw new Error("Invalid ONNX model: missing or invalid irVersion.");
    }

    if (!model.graph || typeof model.graph !== "object") {
      throw new Error("Invalid ONNX model: missing graph object.");
    }

    return model as ModelProto;
  }
}
