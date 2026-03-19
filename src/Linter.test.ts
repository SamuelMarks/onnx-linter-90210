import { test } from 'node:test';
import * as assert from 'node:assert';
import { Linter } from './Linter.js';
import { HardwareConstraints } from './validator/HardwareConstraints.js';
import { LintSeverity } from './validator/types.js';
import { OnnxTextParser } from './parser/OnnxTextParser.js';

test('Linter - lint success', () => {
  const linter = new Linter();
  const validModel = {
    irVersion: 8,
    graph: {
      name: 'test_graph',
      node: [],
      initializer: [],
      input: [],
      output: [],
    },
  };

  const report = linter.lint(JSON.stringify(validModel));
  assert.strictEqual(report.valid, true);
  assert.strictEqual(report.issues.length, 0);
  assert.strictEqual(report.memoryEstimate.parameterMemory, 0);
  assert.strictEqual(report.memoryEstimate.activationMemory, 0);
});

test('Linter - lint with constraints', () => {
  const linter = new Linter();
  const validModel = {
    irVersion: 8,
    graph: {
      name: 'test_graph',
      node: [],
      initializer: [],
      input: [],
      output: [],
    },
  };

  const constraints: HardwareConstraints = {
    maxMemoryBytes: 1000,
  };

  const report = linter.lint(JSON.stringify(validModel), constraints);
  assert.strictEqual(report.valid, true);
  assert.strictEqual(report.issues.length, 0);
});

test('Linter - lint failure - parse error', () => {
  const linter = new Linter();
  const report = linter.lint('invalid json');
  
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.issues.length, 1);
  assert.strictEqual(report.issues[0]!.ruleId, 'parse-error');
  assert.strictEqual(report.issues[0]!.severity, LintSeverity.ERROR);
  assert.strictEqual(report.issues[0]!.path, 'root');
  assert.strictEqual(report.memoryEstimate.parameterMemory, 0);
  assert.strictEqual(report.memoryEstimate.activationMemory, 0);
});

test('Linter - lint failure - model validation error', () => {
  const linter = new Linter();
  const invalidModel = {
    irVersion: 8,
    graph: {
      name: 'test_graph',
      node: [
        { name: 'n1', input: ['missing_input'], output: ['out'], opType: 'Relu' }
      ],
      initializer: [],
      input: [],
      output: [],
    },
  };

  const report = linter.lint(JSON.stringify(invalidModel));
  assert.strictEqual(report.valid, false);
  assert.ok(report.issues.some((i) => i.ruleId === 'node-input-missing'));
});

test('Linter - parse string thrown (for branch coverage)', () => {
  const linter = new Linter();
  const linterUnknown = linter as unknown as { parser: OnnxTextParser };
  const originalParser = linterUnknown.parser;
  
  linterUnknown.parser = {
    /**
     * Mocks the parse method to throw a string.
     */
    parse(): never {
      throw 'string error';
    }
  } as unknown as OnnxTextParser;
  
  const report = linter.lint('{}');
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.issues[0]!.message, 'string error');
  
  // restore
  linterUnknown.parser = originalParser;
});
