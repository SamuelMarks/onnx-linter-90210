import { LintReport } from './types.js';

/**
 * Formats LintReports into different output formats.
 */
export class ReportFormatter {
  /**
   * Formats the report as a human-readable text string.
   * @param report - The LintReport to format.
   * @returns The formatted text.
   */
  public formatText(report: LintReport): string {
    let output = `Linting Report\n`;
    output += `==============\n`;
    output += `Status: ${report.valid ? 'PASS' : 'FAIL'}\n\n`;

    output += `Issues:\n`;
    if (report.issues.length === 0) {
      output += `  No issues found.\n`;
    } else {
      for (const issue of report.issues) {
        output += `  [${issue.severity}] ${issue.ruleId}: ${issue.message} (Path: ${issue.path ?? 'Unknown'})\n`;
      }
    }

    output += `\nMemory Estimates:\n`;
    output += `  Parameters: ${report.memoryEstimate.parameterMemory} bytes\n`;
    output += `  Activations: ${report.memoryEstimate.activationMemory} bytes\n`;

    return output;
  }

  /**
   * Formats the report as a JSON string.
   * @param report - The LintReport to format.
   * @returns The formatted JSON string.
   */
  public formatJson(report: LintReport): string {
    return JSON.stringify(report, null, 2);
  }
}
