import { GraphProto, DataType } from "../types.js";
import { LintIssue, LintSeverity } from "./types.js";

/**
 * Validates data types of tensors in the graph.
 */
export class DataTypeValidator {
  /**
   * Validates that no tensor has an UNDEFINED data type.
   * @param graph - The graph to validate.
   * @returns An array of lint issues.
   */
  public validate(graph: GraphProto): LintIssue[] {
    const issues: LintIssue[] = [];

    // Check initializers
    for (const init of graph.initializer) {
      if (init.dataType === DataType.UNDEFINED) {
        issues.push({
          ruleId: "valid-data-type",
          severity: LintSeverity.ERROR,
          message: `Initializer '${init.name}' has UNDEFINED data type.`,
          path: init.name,
        });
      }
    }

    // Check inputs
    for (const input of graph.input) {
      const elemType = input.type.tensorType?.elemType;
      if (elemType === DataType.UNDEFINED) {
        issues.push({
          ruleId: "valid-data-type",
          severity: LintSeverity.ERROR,
          message: `Input '${input.name}' has UNDEFINED data type.`,
          path: input.name,
        });
      }
    }

    // Check outputs
    for (const output of graph.output) {
      const elemType = output.type.tensorType?.elemType;
      if (elemType === DataType.UNDEFINED) {
        issues.push({
          ruleId: "valid-data-type",
          severity: LintSeverity.ERROR,
          message: `Output '${output.name}' has UNDEFINED data type.`,
          path: output.name,
        });
      }
    }

    return issues;
  }
}
