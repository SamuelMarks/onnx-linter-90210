/**
 * Represents the data type of a tensor.
 */
export enum DataType {
  UNDEFINED = 0,
  FLOAT = 1,
  UINT8 = 2,
  INT8 = 3,
  UINT16 = 4,
  INT16 = 5,
  INT32 = 6,
  INT64 = 7,
  STRING = 8,
  BOOL = 9,
  FLOAT16 = 10,
  DOUBLE = 11,
  UINT32 = 12,
  UINT64 = 13,
  COMPLEX64 = 14,
  COMPLEX128 = 15,
  BFLOAT16 = 16,
}

/**
 * Represents an attribute attached to a node.
 */
export interface AttributeProto {
  /**
   * The name of the attribute.
   */
  name: string;
  /**
   * The type of the attribute.
   */
  type: string;
  /**
   * The float value if type is FLOAT.
   */
  f?: number;
  /**
   * The integer value if type is INT.
   */
  i?: number;
  /**
   * The string value if type is STRING.
   */
  s?: string;
}

/**
 * Represents a tensor value.
 */
export interface TensorProto {
  /**
   * The dimensions of the tensor.
   */
  dims: number[];
  /**
   * The data type of the tensor.
   */
  dataType: DataType;
  /**
   * The name of the tensor.
   */
  name: string;
  /**
   * Raw data of the tensor.
   */
  rawData?: Uint8Array;
}

/**
 * Represents input or output value information.
 */
export interface ValueInfoProto {
  /**
   * The name of the value.
   */
  name: string;
  /**
   * Information about the type.
   */
  type: {
    tensorType?: {
      elemType: DataType;
      shape?: {
        dim: { dimValue?: number; dimParam?: string }[];
      };
    };
  };
}

/**
 * Represents an operation node in the computational graph.
 */
export interface NodeProto {
  /**
   * List of input names.
   */
  input: string[];
  /**
   * List of output names.
   */
  output: string[];
  /**
   * The name of the node.
   */
  name: string;
  /**
   * The operator type.
   */
  opType: string;
  /**
   * The domain of the operator.
   */
  domain?: string;
  /**
   * List of attributes for the node.
   */
  attribute?: AttributeProto[];
}

/**
 * Represents the computational graph.
 */
export interface GraphProto {
  /**
   * Nodes comprising the graph.
   */
  node: NodeProto[];
  /**
   * The name of the graph.
   */
  name: string;
  /**
   * Initializers (constant tensors) in the graph.
   */
  initializer: TensorProto[];
  /**
   * Inputs to the graph.
   */
  input: ValueInfoProto[];
  /**
   * Outputs from the graph.
   */
  output: ValueInfoProto[];
}

/**
 * Represents the top-level ONNX model.
 */
export interface ModelProto {
  /**
   * The IR version of the model.
   */
  irVersion: number;
  /**
   * The producer name of the model.
   */
  producerName?: string;
  /**
   * The producer version of the model.
   */
  producerVersion?: string;
  /**
   * The domain of the model.
   */
  domain?: string;
  /**
   * The model version.
   */
  modelVersion?: number;
  /**
   * A docstring describing the model.
   */
  docString?: string;
  /**
   * The graph defining the model computation.
   */
  graph: GraphProto;
}
