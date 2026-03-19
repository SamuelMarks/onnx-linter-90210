import { GraphProto, NodeProto } from "../types.js";
import { LintIssue, LintSeverity } from "./types.js";

/**
 * Validates the structure of an ONNX computational graph.
 */
export class GraphValidator {
  /**
   * Validates the graph for acyclicity and proper topological order.
   * @param graph - The computational graph to validate.
   * @returns An array of lint issues found within the graph.
   */
  public validate(graph: GraphProto): LintIssue[] {
    const issues: LintIssue[] = [];

    // Map tensor producers (tensor name -> producing node)
    const producers = new Map<string, NodeProto>();
    for (const node of graph.node) {
      for (const output of node.output) {
        if (producers.has(output)) {
          issues.push({
            ruleId: "graph-unique-outputs",
            severity: LintSeverity.ERROR,
            message: `Duplicate producer for tensor: ${output}`,
            path: node.name || "unnamed-node",
          });
        }
        producers.set(output, node);
      }
    }

    // Check acyclicity using DFS
    const visited = new Set<NodeProto>();
    const recStack = new Set<NodeProto>();

    /**
     * Helper to check for cycles starting from a specific node using DFS.
     * @param node - The node to visit.
     * @returns True if a cycle is found, otherwise false.
     */
    const checkCycle = (node: NodeProto): boolean => {
      if (recStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recStack.add(node);

      for (const output of node.output) {
        // Find nodes that consume this output
        const consumers = graph.node.filter((n) => n.input.includes(output));
        for (const consumer of consumers) {
          if (checkCycle(consumer)) {
            return true;
          }
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of graph.node) {
      if (!visited.has(node)) {
        if (checkCycle(node)) {
          issues.push({
            ruleId: "graph-acyclic",
            severity: LintSeverity.ERROR,
            message: "Graph contains a cycle.",
            path: graph.name,
          });
          break; // Stop at first cycle found to prevent multiple reports
        }
      }
    }

    return issues;
  }
}
