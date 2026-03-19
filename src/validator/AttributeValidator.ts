import { GraphProto } from "../types.js";
import { LintIssue, LintSeverity } from "./types.js";

/**
 * Validates that required attributes are present on nodes.
 */
export class AttributeValidator {
  /**
   * The required attributes map where key is opType and value is array of attribute names.
   */
  private readonly requiredAttributes: Map<string, string[]>;

  /**
   * Constructs the AttributeValidator.
   * @param requiredAttributes - A map of opType to an array of required attribute names.
   */
  public constructor(requiredAttributes: Map<string, string[]>) {
    this.requiredAttributes = requiredAttributes;
  }

  /**
   * Validates attributes in the graph.
   * @param graph - The graph to validate.
   * @returns An array of lint issues.
   */
  public validate(graph: GraphProto): LintIssue[] {
    const issues: LintIssue[] = [];

    for (const node of graph.node) {
      const required = this.requiredAttributes.get(node.opType);
      if (required !== undefined) {
        const presentAttributes = new Set(node.attribute?.map((attr) => attr.name) ?? []);
        for (const req of required) {
          if (!presentAttributes.has(req)) {
            issues.push({
              ruleId: "missing-attribute",
              severity: LintSeverity.ERROR,
              message: `Node '${node.name}' of opType '${node.opType}' is missing required attribute '${req}'.`,
              path: node.name,
            });
          }
        }
      }
    }

    return issues;
  }
}
