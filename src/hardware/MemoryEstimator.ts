import { GraphProto, DataType, ValueInfoProto } from '../types.js';

/**
 * Gets the size in bytes of a DataType.
 * @param dataType - The DataType to get the size for.
 * @returns The size in bytes.
 */
function getDataTypeSize(dataType: DataType): number {
  switch (dataType) {
    case DataType.FLOAT: return 4;
    case DataType.UINT8: return 1;
    case DataType.INT8: return 1;
    case DataType.UINT16: return 2;
    case DataType.INT16: return 2;
    case DataType.INT32: return 4;
    case DataType.INT64: return 8;
    case DataType.BOOL: return 1;
    case DataType.FLOAT16: return 2;
    case DataType.DOUBLE: return 8;
    case DataType.UINT32: return 4;
    case DataType.UINT64: return 8;
    case DataType.COMPLEX64: return 8;
    case DataType.COMPLEX128: return 16;
    case DataType.BFLOAT16: return 2;
    default: return 0;
  }
}

/**
 * Estimates memory requirements for a computational graph.
 */
export class MemoryEstimator {
  /**
   * Estimates memory for parameters and activations.
   * @param graph - The ONNX graph.
   * @returns An object with parameterMemory and activationMemory in bytes.
   */
  public estimate(graph: GraphProto): { parameterMemory: number; activationMemory: number } {
    let parameterMemory = 0;
    let activationMemory = 0;

    for (const init of graph.initializer) {
      const size = getDataTypeSize(init.dataType);
      let numElements = 1;
      for (const dim of init.dims) {
        numElements *= dim;
      }
      parameterMemory += size * numElements;
    }

    /**
     *
     * @param valueInfos
     */
    /**
     * Calculates memory required for a list of ValueInfoProto objects.
     * @param valueInfos - List of input or output value infos.
     * @returns The calculated memory in bytes.
     */
    const calculateValueInfoMemory = (valueInfos: ValueInfoProto[]): number => {
      let memory = 0;
      for (const vi of valueInfos) {
        if (vi.type.tensorType?.shape) {
          const size = getDataTypeSize(vi.type.tensorType.elemType);
          let numElements = 1;
          for (const dim of vi.type.tensorType.shape.dim) {
            numElements *= dim.dimValue ?? 1;
          }
          memory += size * numElements;
        }
      }
      return memory;
    };

    activationMemory += calculateValueInfoMemory(graph.input);
    activationMemory += calculateValueInfoMemory(graph.output);

    return { parameterMemory, activationMemory };
  }
}
