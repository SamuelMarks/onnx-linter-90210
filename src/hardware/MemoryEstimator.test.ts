import test from 'node:test';
import assert from 'node:assert';
import { MemoryEstimator } from './MemoryEstimator.js';
import { DataType, GraphProto } from '../types.js';

test('MemoryEstimator', async (t) => {
  const estimator = new MemoryEstimator();

  await t.test('estimates memory correctly for FLOAT and INT8 types', () => {
    const graph: GraphProto = {
      name: 'test-graph',
      node: [],
      initializer: [
        {
          name: 'param1',
          dataType: DataType.FLOAT,
          dims: [2, 3], // 6 * 4 = 24 bytes
        },
        {
          name: 'param2',
          dataType: DataType.INT8,
          dims: [10], // 10 * 1 = 10 bytes
        },
        {
          name: 'param3',
          dataType: DataType.STRING, // 0 bytes
          dims: [5],
        }
      ],
      input: [
        {
          name: 'in1',
          type: {
            tensorType: {
              elemType: DataType.FLOAT16, // 2 bytes
              shape: {
                dim: [{ dimValue: 4 }, { dimValue: 4 }] // 16 * 2 = 32 bytes
              }
            }
          }
        },
        {
          name: 'in2',
          type: {
            tensorType: {
              elemType: DataType.DOUBLE, // 8 bytes
              shape: {
                dim: [{ dimValue: 2 }, { dimParam: 'batch' }] // dimParam treated as 1 -> 2 * 8 = 16 bytes
              }
            }
          }
        }
      ],
      output: [
        {
          name: 'out1',
          type: {
            tensorType: {
              elemType: DataType.UINT8, // 1 byte
              shape: {
                dim: [{ dimValue: 10 }] // 10 * 1 = 10 bytes
              }
            }
          }
        },
        {
          name: 'out2',
          type: {
            tensorType: {
              elemType: DataType.UINT8 // no shape
            }
          }
        }
      ]
    };

    const result = estimator.estimate(graph);

    // parameterMemory: 24 (FLOAT) + 10 (INT8) + 0 = 34
    assert.strictEqual(result.parameterMemory, 34);

    // activationMemory: 32 (in1) + 16 (in2) + 10 (out1) + 0 (out2 has no shape) = 58
    assert.strictEqual(result.activationMemory, 58);
  });

  await t.test('handles different data types correctly', () => {
    const dataTypesToTest = [
      { dataType: DataType.FLOAT, expectedBytes: 4 },
      { dataType: DataType.UINT8, expectedBytes: 1 },
      { dataType: DataType.INT8, expectedBytes: 1 },
      { dataType: DataType.UINT16, expectedBytes: 2 },
      { dataType: DataType.INT16, expectedBytes: 2 },
      { dataType: DataType.INT32, expectedBytes: 4 },
      { dataType: DataType.INT64, expectedBytes: 8 },
      { dataType: DataType.BOOL, expectedBytes: 1 },
      { dataType: DataType.FLOAT16, expectedBytes: 2 },
      { dataType: DataType.DOUBLE, expectedBytes: 8 },
      { dataType: DataType.UINT32, expectedBytes: 4 },
      { dataType: DataType.UINT64, expectedBytes: 8 },
      { dataType: DataType.COMPLEX64, expectedBytes: 8 },
      { dataType: DataType.COMPLEX128, expectedBytes: 16 },
      { dataType: DataType.BFLOAT16, expectedBytes: 2 },
      { dataType: DataType.UNDEFINED, expectedBytes: 0 },
    ];

    for (const testCase of dataTypesToTest) {
      const graph: GraphProto = {
        name: 'test-graph',
        node: [],
        initializer: [
          {
            name: 'param1',
            dataType: testCase.dataType,
            dims: [1],
          }
        ],
        input: [],
        output: [],
      };

      const result = estimator.estimate(graph);
      assert.strictEqual(result.parameterMemory, testCase.expectedBytes, `Failed for ${DataType[testCase.dataType]}`);
    }
  });
});
