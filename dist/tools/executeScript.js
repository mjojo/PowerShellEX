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
 * Execute PowerShell code
 */
async function executePowerShell(code, workingDirectory) {
    const startTime = Date.now();
    const result = await (0, powershell_1.runPowerShell)(code, workingDirectory);
    const executionTime = Date.now() - startTime;
    return {
        success: result.success,
        output: result.output || '(no output)',
        error: result.error || undefined,
        executionTime,
    };
}
//# sourceMappingURL=executeScript.js.map