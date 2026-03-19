/**
 * Represents the severity level of a linting issue.
 */
export enum LintSeverity {
  WARNING = "WARNING",
  ERROR = "ERROR",
}

/**
 * Represents a linting issue found in the ONNX model.
 */
export interface LintIssue {
  /**
   * The rule that generated this issue.
   */
  ruleId: string;
  /**
   * The severity of the issue.
   */
  severity: LintSeverity;
  /**
   * The descriptive message explaining the issue.
   */
  message: string;
  /**
   * The path to the element causing the issue (e.g., node name, graph name).
   */
  path?: string;
}
