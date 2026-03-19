import { GraphProto } from "../types.js";
import { LintIssue, LintSeverity } from "./types.js";

/**
 * Validates nodes within a computational graph.
 */
export class NodeValidator {
  /**
   * Validates that all node inputs exist and outputs are uniquely named.
   * @param graph - The graph to validate.
   * @returns An array of lint issues.
   */
  public validate(graph: GraphProto): LintIssue[] {
    const issues: LintIssue[] = [];
    const availableInputs = new Set<string>();

    for (const input of graph.input) {
      availableInputs.add(input.name);
    }

    for (const init of graph.initializer) {
      availableInputs.add(init.name);
    }

    const seenOutputs = new Set<string>();
    for (const node of graph.node) {
      for (const output of node.output) {
        if (seenOutputs.has(output)) {
          issues.push({
            ruleId: "node-unique-outputs",
            severity: LintSeverity.ERROR,
            message: `Output '${output}' is not uniquely named.`,
            path: node.name,
          });
        }
        seenOutputs.add(output);
        availableInputs.add(output);
      }
    }

    for (const node of graph.node) {
      for (const input of node.input) {
        if (!availableInputs.has(input)) {
          issues.push({
            ruleId: "node-input-missing",
            severity: LintSeverity.ERROR,
            message: `Input '${input}' is missing from the graph.`,
            path: node.name,
          });
        }
      }
    }

    return issues;
  }
}
