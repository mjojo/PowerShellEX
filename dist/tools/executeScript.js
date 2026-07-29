"use strict";
/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns structured results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePowerShell = executePowerShell;
const powershell_1 = require("../utils/powershell");
/**
 * Execute PowerShell code and return a structured result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Execution timeout in milliseconds (default 30 000)
 */
async function executePowerShell(code, workingDirectory, timeout = 30_000) {
    const startTime = Date.now();
    const result = await (0, powershell_1.runPowerShell)(code, workingDirectory, timeout);
    const executionTime = Date.now() - startTime;
    return {
        success: result.success,
        output: result.output || '(no output)',
        error: result.error || undefined,
        executionTime,
        exitCode: result.exitCode,
    };
}
//# sourceMappingURL=executeScript.js.map