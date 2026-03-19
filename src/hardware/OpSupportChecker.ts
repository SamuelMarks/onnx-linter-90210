import { GraphProto } from '../types.js';
import { LintIssue } from '../validator/types.js';
import { LintSeverity } from '../validator/types.js';

/**
 * Checks if all operators used in the graph are supported.
 */
export class OpSupportChecker {
  /**
   * Checks the graph for operator support.
   * @param graph - The ONNX graph.
   * @param supportedOps - A list of supported operator types.
   * @returns An array of lint issues.
   */
  public check(graph: GraphProto, supportedOps: string[]): LintIssue[] {
    const issues: LintIssue[] = [];
    const supported = new Set(supportedOps);

    for (const node of graph.node) {
      if (!supported.has(node.opType)) {
        issues.push({
          ruleId: 'hardware-op-support',
          severity: LintSeverity.ERROR,
          message: `Operator '${node.opType}' is not supported by the target hardware.`,
          path: `node[${node.name}]`,
        });
      }
    }

    return issues;
  }
}
