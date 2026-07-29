"use strict";
/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns token-optimised results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePowerShell = executePowerShell;
const powershell_1 = require("../utils/powershell");
const tokenOptimizer_1 = require("../utils/tokenOptimizer");
/**
 * Execute PowerShell code and return a structured, token-optimised result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Execution timeout in milliseconds (default 30 000)
 * @param maxOutput        Max characters to return in output (default 4 000).
 *                         Set higher for long-running commands. ANSI codes are
 *                         stripped automatically before counting.
 */
async function executePowerShell(code, workingDirectory, timeout = 30_000, maxOutput = tokenOptimizer_1.DEFAULT_MAX_OUTPUT) {
    const startTime = Date.now();
    // Note: runPowerShell already strips ANSI from stdout/stderr
    const result = await (0, powershell_1.runPowerShell)(code, workingDirectory, timeout);
    const executionTime = Date.now() - startTime;
    return {
        success: result.success,
        output: (0, tokenOptimizer_1.truncateOutput)(result.output || '(no output)', maxOutput, 'stdout'),
        error: result.error?.trim() || undefined,
        executionTime,
        exitCode: result.exitCode,
    };
}
//# sourceMappingURL=executeScript.js.map