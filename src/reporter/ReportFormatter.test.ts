import { test } from 'node:test';
import * as assert from 'node:assert';
import { ReportFormatter } from './ReportFormatter.js';
import { LintReport } from './types.js';
import { LintSeverity } from '../validator/types.js';

test('ReportFormatter - formatText - no issues', () => {
  const formatter = new ReportFormatter();
  const report: LintReport = {
    valid: true,
    issues: [],
    memoryEstimate: { parameterMemory: 100, activationMemory: 200 },
  };

  const text = formatter.formatText(report);
  assert.match(text, /Status: PASS/);
  assert.match(text, /No issues found\./);
  assert.match(text, /Parameters: 100 bytes/);
  assert.match(text, /Activations: 200 bytes/);
});

test('ReportFormatter - formatText - with issues', () => {
  const formatter = new ReportFormatter();
  const report: LintReport = {
    valid: false,
    issues: [
      {
        ruleId: 'test-rule',
        severity: LintSeverity.ERROR,
        message: 'A test issue',
        path: 'test/path',
      },
      {
        ruleId: 'test-warning',
        severity: LintSeverity.WARNING,
        message: 'A test warning',
      },
    ],
    memoryEstimate: { parameterMemory: 1024, activationMemory: 2048 },
  };

  const text = formatter.formatText(report);
  assert.match(text, /Status: FAIL/);
  assert.match(text, /\[ERROR\] test-rule: A test issue \(Path: test\/path\)/);
  assert.match(text, /\[WARNING\] test-warning: A test warning \(Path: Unknown\)/);
  assert.match(text, /Parameters: 1024 bytes/);
  assert.match(text, /Activations: 2048 bytes/);
});

test('ReportFormatter - formatJson', () => {
  const formatter = new ReportFormatter();
  const report: LintReport = {
    valid: true,
    issues: [],
    memoryEstimate: { parameterMemory: 100, activationMemory: 200 },
  };

  const jsonStr = formatter.formatJson(report);
  const parsed = JSON.parse(jsonStr) as LintReport;
  assert.strictEqual(parsed.valid, true);
  assert.deepStrictEqual(parsed.issues, []);
  assert.strictEqual(parsed.memoryEstimate.parameterMemory, 100);
});
