import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Linter } from "../Linter.js";
import { ReportFormatter } from "../reporter/ReportFormatter.js";
import { HardwareConstraints } from "../validator/HardwareConstraints.js";

/**
 * Runs the ONNX CLI linter.
 * @param args - The command line arguments (e.g. process.argv.slice(2)).
 * @param stdout - The output stream function.
 * @param stderr - The error stream function.
 * @param exit - The exit function.
 */
export function runCli(
  args: string[],
  stdout: (msg: string) => void,
  stderr: (msg: string) => void,
  exit: (code: number) => void
): void {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    stdout("Usage: onnx-linter <file.json> [--constraints <constraints.json>] [--json]");
    exit(0);
    return;
  }

  const fileArg = args.find((a) => !a.startsWith("-"));
  if (!fileArg) {
    stderr("Error: Missing ONNX JSON file path.");
    exit(1);
    return;
  }

  const constraintsIdx = args.indexOf("--constraints");
  let constraints: HardwareConstraints | undefined;

  if (constraintsIdx !== -1 && args[constraintsIdx + 1]) {
    try {
      const p = resolve(process.cwd(), args[constraintsIdx + 1]!);
      constraints = JSON.parse(readFileSync(p, "utf-8")) as HardwareConstraints;
    } catch (e) {
      stderr(`Error reading constraints file: ${String(e)}`);
      exit(1);
      return;
    }
  }

  const asJson = args.includes("--json");

  let content: string;
  try {
    content = readFileSync(resolve(process.cwd(), fileArg), "utf-8");
  } catch (e) {
    stderr(`Error reading ONNX file: ${String(e)}`);
    exit(1);
    return;
  }

  const linter = new Linter();
  const report = linter.lint(content, constraints);

  const formatter = new ReportFormatter();
  if (asJson) {
    stdout(formatter.formatJson(report));
  } else {
    stdout(formatter.formatText(report));
  }

  exit(report.valid ? 0 : 1);
}
