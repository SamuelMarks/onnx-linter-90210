import { OnnxTextParser } from './parser/OnnxTextParser.js';
import { ModelValidator } from './validator/ModelValidator.js';
import { HardwareValidator } from './hardware/HardwareValidator.js';
import { MemoryEstimator } from './hardware/MemoryEstimator.js';
import { HardwareConstraints } from './validator/HardwareConstraints.js';
import { LintReport } from './reporter/types.js';
import { LintIssue, LintSeverity } from './validator/types.js';
import { ModelProto } from './types.js';

/**
 * The main entry point for linting ONNX models.
 */
export class Linter {
  private parser: OnnxTextParser;
  private modelValidator: ModelValidator;
  private hardwareValidator: HardwareValidator;
  private memoryEstimator: MemoryEstimator;

  /**
   * Initializes the Linter and its dependencies.
   */
  constructor() {
    this.parser = new OnnxTextParser();
    this.modelValidator = new ModelValidator();
    this.hardwareValidator = new HardwareValidator();
    this.memoryEstimator = new MemoryEstimator();
  }

  /**
   * Lints the provided ONNX model text representation.
   * @param onnxText - The ONNX model text (JSON).
   * @param constraints - Hardware constraints for the model.
   * @returns The final linting report.
   */
  public lint(onnxText: string, constraints?: HardwareConstraints): LintReport {
    let model: ModelProto;
    const issues: LintIssue[] = [];
    let memoryEstimate = { parameterMemory: 0, activationMemory: 0 };

    try {
      model = this.parser.parse(onnxText);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push({
        ruleId: 'parse-error',
        severity: LintSeverity.ERROR,
        message,
        path: 'root',
      });
      return {
        valid: false,
        issues,
        memoryEstimate,
      };
    }

    issues.push(...this.modelValidator.validate(model));

    if (constraints) {
      issues.push(...this.hardwareValidator.validate(model, constraints));
    }

    memoryEstimate = this.memoryEstimator.estimate(model.graph);

    const hasErrors = issues.some((issue) => issue.severity === LintSeverity.ERROR);

    return {
      valid: !hasErrors,
      issues,
      memoryEstimate,
    };
  }
}
