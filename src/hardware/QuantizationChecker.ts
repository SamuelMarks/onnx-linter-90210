import { GraphProto, DataType, ValueInfoProto } from '../types.js';
import { LintIssue } from '../validator/types.js';
import { LintSeverity } from '../validator/types.js';

/**
 * Checks if a graph complies with quantization constraints.
 */
export class QuantizationChecker {
  /**
   * Checks the graph for quantization compliance.
   * @param graph - The ONNX graph.
   * @returns An array of lint issues.
   */
  public check(graph: GraphProto): LintIssue[] {
    const issues: LintIssue[] = [];

    /**
     * Helper to check a specific datatype.
     * @param dataType - The type to check.
     * @param name - The name of the tensor.
     * @param typeDesc - The descriptive type of the tensor.
     */
    const checkDataType = (dataType: DataType, name: string, typeDesc: string): void => {
      if (dataType !== DataType.INT8 && dataType !== DataType.UINT8) {
        issues.push({
          ruleId: 'hardware-quantization',
          severity: LintSeverity.ERROR,
          message: `${typeDesc} '${name}' is not quantized (type is ${DataType[dataType] || dataType}).`,
          path: `${typeDesc.toLowerCase()}[${name}]`,
        });
      }
    };

    for (const init of graph.initializer) {
      checkDataType(init.dataType, init.name, 'Initializer');
    }

    /**
     * Helper to check a ValueInfo object.
     * @param vi - The value info object.
     * @param typeDesc - The descriptive type.
     */
    const checkValueInfo = (vi: ValueInfoProto, typeDesc: string): void => {
      const elemType = vi.type?.tensorType?.elemType;
      if (elemType !== undefined) {
        checkDataType(elemType, vi.name, typeDesc);
      }
    };

    for (const input of graph.input) {
      checkValueInfo(input, 'Input');
    }

    for (const output of graph.output) {
      checkValueInfo(output, 'Output');
    }

    for (const node of graph.node) {
      if (node.attribute) {
        for (const attr of node.attribute) {
          if (attr.type === 'FLOAT') {
            issues.push({
              ruleId: 'hardware-quantization',
              severity: LintSeverity.ERROR,
              message: `Node '${node.name}' uses a FLOAT attribute '${attr.name}'.`,
              path: `node[${node.name}].attribute[${attr.name}]`,
            });
          }
        }
      }
    }

    return issues;
  }
}
