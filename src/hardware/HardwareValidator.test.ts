import test from 'node:test';
import assert from 'node:assert';
import { HardwareValidator } from './HardwareValidator.js';
import { ModelProto, DataType } from '../types.js';

test('HardwareValidator', async (t) => {
  const validator = new HardwareValidator();

  /**
   *
   * @param overrides
   */
  /**
   * Creates a mock ModelProto for testing.
   * @param overrides - Optional properties to override in the GraphProto.
   * @returns The mock ModelProto.
   */
  const createModel = (overrides?: Partial<ModelProto['graph']>): ModelProto => ({
    irVersion: 8,
    graph: {
      name: 'test-graph',
      initializer: [],
      input: [],
      output: [],
      node: [],
      ...overrides,
    },
  });

  await t.test('returns no issues when no constraints are provided', () => {
    const model = createModel();
    const issues = validator.validate(model, {});
    assert.strictEqual(issues.length, 0);
  });

  await t.test('checks maxMemoryBytes constraint', () => {
    const model = createModel({
      initializer: [
        { name: 'w', dataType: DataType.FLOAT, dims: [1000] } // 4000 bytes
      ]
    });

    const issuesPass = validator.validate(model, { maxMemoryBytes: 5000 });
    assert.strictEqual(issuesPass.length, 0);

    const issuesFail = validator.validate(model, { maxMemoryBytes: 3000 });
    assert.strictEqual(issuesFail.length, 1);
    assert.strictEqual(issuesFail[0]!.ruleId, 'hardware-memory-limit');
    assert.match(issuesFail[0]!.message, /Model requires 4000 bytes, which exceeds the maximum allowed 3000 bytes/);
  });

  await t.test('checks requireQuantization constraint', () => {
    const model = createModel({
      initializer: [
        { name: 'w', dataType: DataType.FLOAT, dims: [10] }
      ]
    });

    const issuesPass = validator.validate(model, { requireQuantization: false });
    assert.strictEqual(issuesPass.length, 0);

    const issuesFail = validator.validate(model, { requireQuantization: true });
    assert.strictEqual(issuesFail.length, 1);
    assert.strictEqual(issuesFail[0]!.ruleId, 'hardware-quantization');
  });

  await t.test('checks supportedOps constraint', () => {
    const model = createModel({
      node: [
        { name: 'n1', opType: 'Conv', input: [], output: [] }
      ]
    });

    const issuesPass = validator.validate(model, { supportedOps: ['Conv', 'Relu'] });
    assert.strictEqual(issuesPass.length, 0);

    const issuesFail = validator.validate(model, { supportedOps: ['Relu'] });
    assert.strictEqual(issuesFail.length, 1);
    assert.strictEqual(issuesFail[0]!.ruleId, 'hardware-op-support');
  });

  await t.test('orchestrates all constraints together', () => {
    const model = createModel({
      initializer: [
        { name: 'w', dataType: DataType.FLOAT, dims: [1000] } // 4000 bytes
      ],
      node: [
        { name: 'n1', opType: 'Conv', input: [], output: [] }
      ]
    });

    const issues = validator.validate(model, {
      maxMemoryBytes: 3000,
      requireQuantization: true,
      supportedOps: ['Relu']
    });

    assert.strictEqual(issues.length, 3);
    const rules = issues.map(i => i.ruleId);
    assert.ok(rules.includes('hardware-memory-limit'));
    assert.ok(rules.includes('hardware-quantization'));
    assert.ok(rules.includes('hardware-op-support'));
  });
});
