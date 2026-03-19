import { ModelProto } from '../types.js';
import { LintIssue } from '../validator/types.js';
import { LintSeverity } from '../validator/types.js';
import { HardwareConstraints } from '../validator/HardwareConstraints.js';
import { MemoryEstimator } from './MemoryEstimator.js';
import { QuantizationChecker } from './QuantizationChecker.js';
import { OpSupportChecker } from './OpSupportChecker.js';

/**
 * Facade class for hardware constraints validation.
 */
export class HardwareValidator {
  private memoryEstimator: MemoryEstimator;
  private quantizationChecker: QuantizationChecker;
  private opSupportChecker: OpSupportChecker;

  /**
   * Initializes the HardwareValidator.
   */
  constructor() {
    this.memoryEstimator = new MemoryEstimator();
    this.quantizationChecker = new QuantizationChecker();
    this.opSupportChecker = new OpSupportChecker();
  }

  /**
   * Validates a model against hardware constraints.
   * @param model - The ONNX model.
   * @param constraints - The hardware constraints.
   * @returns An array of lint issues.
   */
  public validate(model: ModelProto, constraints: HardwareConstraints): LintIssue[] {
    const issues: LintIssue[] = [];
    const graph = model.graph;

    if (constraints.maxMemoryBytes !== undefined) {
      const memory = this.memoryEstimator.estimate(graph);
      const totalMemory = memory.parameterMemory + memory.activationMemory;
      if (totalMemory > constraints.maxMemoryBytes) {
        issues.push({
          ruleId: 'hardware-memory-limit',
          severity: LintSeverity.ERROR,
          message: `Model requires ${totalMemory} bytes, which exceeds the maximum allowed ${constraints.maxMemoryBytes} bytes.`,
          path: 'model.graph',
        });
      }
    }

    if (constraints.requireQuantization) {
      issues.push(...this.quantizationChecker.check(graph));
    }

    if (constraints.supportedOps !== undefined) {
      issues.push(...this.opSupportChecker.check(graph, constraints.supportedOps));
    }

    return issues;
  }
}
