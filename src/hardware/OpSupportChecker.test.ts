import test from 'node:test';
import assert from 'node:assert';
import { OpSupportChecker } from './OpSupportChecker.js';
import { GraphProto } from '../types.js';

test('OpSupportChecker', async (t) => {
  const checker = new OpSupportChecker();

  await t.test('returns no issues when all ops are supported', () => {
    const graph: GraphProto = {
      name: 'test-graph',
      initializer: [],
      input: [],
      output: [],
      node: [
        { name: 'n1', opType: 'Conv', input: [], output: [] },
        { name: 'n2', opType: 'Relu', input: [], output: [] },
      ],
    };

    const issues = checker.check(graph, ['Conv', 'Relu', 'MaxPool']);
    assert.strictEqual(issues.length, 0);
  });

  await t.test('returns issues for unsupported ops', () => {
    const graph: GraphProto = {
      name: 'test-graph',
      initializer: [],
      input: [],
      output: [],
      node: [
        { name: 'n1', opType: 'Conv', input: [], output: [] },
        { name: 'n2', opType: 'UnsupportedOp', input: [], output: [] },
        { name: 'n3', opType: 'AnotherUnsupportedOp', input: [], output: [] },
      ],
    };

    const issues = checker.check(graph, ['Conv']);
    assert.strictEqual(issues.length, 2);
    assert.strictEqual(issues[0]!.ruleId, 'hardware-op-support');
    assert.match(issues[0]!.message, /Operator 'UnsupportedOp' is not supported/);
    assert.strictEqual(issues[0]!.path, 'node[n2]');
    assert.match(issues[1]!.message, /Operator 'AnotherUnsupportedOp' is not supported/);
    assert.strictEqual(issues[1]!.path, 'node[n3]');
  });
});
