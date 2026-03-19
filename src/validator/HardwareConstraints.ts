/**
 * Represents the constraints imposed by target hardware.
 */
export interface HardwareConstraints {
  /**
   * The maximum memory in bytes allowed for the model.
   */
  maxMemoryBytes?: number;
  /**
   * Whether the model requires quantization.
   */
  requireQuantization?: boolean;
  /**
   * The list of supported operator types.
   */
  supportedOps?: string[];
}
