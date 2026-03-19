import { test } from "node:test";
import * as assert from "node:assert";
import { runCli } from "./onnx-linter.js";
import { writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

test("CLI - help", () => {
  let out = "";
  let exitCode = -1;
  runCli(
    ["--help"],
    (msg) => { out += msg; },
    () => {},
    (code) => { exitCode = code; }
  );
  assert.match(out, /Usage: onnx-linter/);
  assert.strictEqual(exitCode, 0);
});

test("CLI - missing file", () => {
  let err = "";
  let exitCode = -1;
  runCli(
    ["--json"],
    () => {},
    (msg) => { err += msg; },
    (code) => { exitCode = code; }
  );
  assert.match(err, /Missing ONNX JSON file path/);
  assert.strictEqual(exitCode, 1);
});

test("CLI - invalid constraints file", () => {
  const constraintsPath = resolve(process.cwd(), "invalid-constraints.json");
  writeFileSync(constraintsPath, "invalid-json");

  let err = "";
  let exitCode = -1;
  runCli(
    ["model.json", "--constraints", "invalid-constraints.json"],
    () => {},
    (msg) => { err += msg; },
    (code) => { exitCode = code; }
  );
  assert.match(err, /Error reading constraints file/);
  assert.strictEqual(exitCode, 1);
  unlinkSync(constraintsPath);
});

test("CLI - missing ONNX file on disk", () => {
  let err = "";
  let exitCode = -1;
  runCli(
    ["does-not-exist.json"],
    () => {},
    (msg) => { err += msg; },
    (code) => { exitCode = code; }
  );
  assert.match(err, /Error reading ONNX file/);
  assert.strictEqual(exitCode, 1);
});

test("CLI - valid run", () => {
  const modelPath = resolve(process.cwd(), "valid-model.json");
  const model = {
    irVersion: 8,
    graph: { name: "test", node: [], initializer: [], input: [], output: [] }
  };
  writeFileSync(modelPath, JSON.stringify(model));

  const constraintsPath = resolve(process.cwd(), "valid-constraints.json");
  writeFileSync(constraintsPath, JSON.stringify({ maxMemoryBytes: 1000 }));

  let out = "";
  let exitCode = -1;
  runCli(
    ["valid-model.json", "--constraints", "valid-constraints.json", "--json"],
    (msg) => { out += msg; },
    () => {},
    (code) => { exitCode = code; }
  );
  
  assert.strictEqual(exitCode, 0);
  assert.match(out, /"valid": true/);

  // cleanup
  unlinkSync(modelPath);
  unlinkSync(constraintsPath);
});

test("CLI - invalid run (text format)", () => {
  const modelPath = resolve(process.cwd(), "invalid-model.json");
  writeFileSync(modelPath, "invalid-json");

  let out = "";
  let exitCode = -1;
  runCli(
    ["invalid-model.json"],
    (msg) => { out += msg; },
    () => {},
    (code) => { exitCode = code; }
  );
  
  assert.strictEqual(exitCode, 1);
  assert.match(out, /parse-error/);

  unlinkSync(modelPath);
});
