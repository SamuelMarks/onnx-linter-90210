# ONNX Linter 90210

ONNX Linter 90210 is a strict, zero-dependency, ultra-fast structural and hardware-constraint linter for ONNX models (represented in JSON). It confirms whether your ONNX file text content is:
a) Structurally valid ONNX (acyclic graph, valid connections, typing).
b) Capable of fitting within your specific hardware constraints (memory thresholds, quantization support, operator whitelists).

Built entirely in TypeScript with 100% doc coverage and 100% test coverage.

## Features

- **Structural Validation:** Checks for valid inputs, unique outputs, acyclicity, data types, and required node attributes.
- **Hardware Constraint Validation:** Ensure models meet rigorous requirements like `maxMemoryBytes`, `requireQuantization` (INT8/UINT8 only enforcement), and strict `supportedOps` whitelists.
- **Web IDE Demo:** Ships with an integrated Web IDE demonstrating the linter compiling to the browser via `esbuild`.
- **Zero Heavy Dependencies:** Uses lightweight Node.js native testing and git-hooks.

## Usage

### CLI

```bash
# Lint an ONNX model
node dist/bin/onnx-linter.js model.json

# Lint with hardware constraints
node dist/bin/onnx-linter.js model.json --constraints constraints.json

# Output JSON report
node dist/bin/onnx-linter.js model.json --json
```

**Constraints JSON format:**
```json
{
  "maxMemoryBytes": 1048576,
  "requireQuantization": true,
  "supportedOps": ["Conv", "Relu", "Add"]
}
```

### Web IDE

1. Run `npm run build:web` to build the browser bundle (`dist/browser.js`).
2. Open `linter-web-ide.html` in your browser.
3. Choose an example from the dropdown and click **Run Linter**.

## Development

- **Build CLI:** `npm run build`
- **Build Web:** `npm run build:web`
- **Test (100% Coverage):** `npm run test`
- **Lint:** `npm run lint`

## Pre-commit Hooks

Pre-commit hooks are configured using `simple-git-hooks` and run strict tests and linting before every commit.

```bash
npm run prepare
```
