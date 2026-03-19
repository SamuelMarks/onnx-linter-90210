import { describe, it } from 'node:test';
import assert from 'node:assert';
import { QuantizationChecker } from './QuantizationChecker.js';
import { GraphProto, DataType } from '../types.js';

describe('QuantizationChecker', () => {
  const checker = new QuantizationChecker();

  it('returns no issues when all tensors are INT8/UINT8 and nodes have no float attributes', () => {
    const graph: GraphProto = {
      name: 'valid',
      node: [{ name: 'n1', input: ['a'], output: ['b'], opType: 'Conv', attribute: [{ name: 'int_attr', type: 'INT', i: 1 }] }],
      initializer: [{ name: 'w', dataType: DataType.INT8, dims: [1] }],
      input: [{ name: 'a', type: { tensorType: { elemType: DataType.UINT8 } } }],
      output: [{ name: 'b', type: { tensorType: { elemType: DataType.INT8 } } }],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 0);
  });

  it('returns issues for non-quantized initializers', () => {
    const graph: GraphProto = {
      name: 'invalid_init',
      node: [],
      initializer: [{ name: 'w', dataType: DataType.FLOAT, dims: [1] }],
      input: [],
      output: [],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 1);
    assert.match(issues[0]!.message, /is not quantized/);
  });

  it('handles unknown data type fallback correctly', () => {
    const graph: GraphProto = {
      name: 'invalid_init_unknown_type',
      node: [],
      initializer: [{ name: 'w', dataType: 999 as DataType, dims: [1] }],
      input: [],
      output: [],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 1);
    assert.match(issues[0]!.message, /999/);
  });

  it('returns issues for non-quantized inputs and outputs', () => {
    const graph: GraphProto = {
      name: 'invalid_io',
      node: [],
      initializer: [],
      input: [{ name: 'a', type: { tensorType: { elemType: DataType.FLOAT } } }],
      output: [{ name: 'b', type: { tensorType: { elemType: DataType.FLOAT } } }],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 2);
  });

  it('ignores inputs/outputs without elemType', () => {
    const graph: GraphProto = {
      name: 'no_elem_type',
      node: [],
      initializer: [],
      input: [{ name: 'a', type: {} }],
      output: [{ name: 'b', type: {} }],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 0);
  });

  it('returns issues for nodes with FLOAT attributes', () => {
    const graph: GraphProto = {
      name: 'invalid_node',
      node: [{ name: 'n1', input: [], output: [], opType: 'Conv', attribute: [{ name: 'f_attr', type: 'FLOAT', f: 1.0 }] }],
      initializer: [],
      input: [],
      output: [],
    };
    const issues = checker.check(graph);
    assert.strictEqual(issues.length, 1);
    assert.match(issues[0]!.message, /FLOAT attribute/);
  });
});
