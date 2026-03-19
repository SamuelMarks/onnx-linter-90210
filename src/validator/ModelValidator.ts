import { ModelProto } from "../types.js";
import { LintIssue } from "./types.js";
import { GraphValidator } from "./GraphValidator.js";
import { NodeValidator } from "./NodeValidator.js";
import { DataTypeValidator } from "./DataTypeValidator.js";
import { AttributeValidator } from "./AttributeValidator.js";

/**
 * Orchestrates structural validation of the entire ONNX model.
 */
export class ModelValidator {
  private readonly graphValidator = new GraphValidator();
  private readonly nodeValidator = new NodeValidator();
  private readonly dataTypeValidator = new DataTypeValidator();
  private readonly attributeValidator = new AttributeValidator(
    new Map([
      ["Conv", ["kernel_shape"]],
      ["MaxPool", ["kernel_shape"]],
    ])
  );

  /**
   * Validates the structure, nodes, datatypes, and attributes of the model.
   * @param model - The top-level ModelProto representation.
   * @returns An array of all linting issues found.
   */
  public validate(model: ModelProto): LintIssue[] {
    const issues: LintIssue[] = [];

    issues.push(...this.graphValidator.validate(model.graph));
    issues.push(...this.nodeValidator.validate(model.graph));
    issues.push(...this.dataTypeValidator.validate(model.graph));
    issues.push(...this.attributeValidator.validate(model.graph));

    return issues;
  }
}
