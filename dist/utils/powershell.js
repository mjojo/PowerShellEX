"use strict";
/**
 * PowerShell Execution Utility
 *
 * Provides a wrapper for spawning PowerShell processes and capturing output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPowerShell = runPowerShell;
exports.runPowerShellJson = runPowerShellJson;
const child_process_1 = require("child_process");
const os_1 = require("os");
/**
 * Get the PowerShell executable name based on the platform
 */
function getPowerShellExecutable() {
    // Prefer PowerShell 7+ (pwsh) if available, fall back to Windows PowerShell
    return (0, os_1.platform)() === 'win32' ? 'pwsh' : 'pwsh';
}
/**
 * Execute PowerShell code and return the result
 */
async function runPowerShell(code, workingDirectory, timeout = 30000) {
    return new Promise((resolve) => {
        const executable = getPowerShellExecutable();
        const args = [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            code,
        ];
        const options = {};
        if (workingDirectory) {
            options.cwd = workingDirectory;
        }
        const process = (0, child_process_1.spawn)(executable, args, options);
        let stdout = '';
        let stderr = '';
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        const timeoutId = setTimeout(() => {
            process.kill('SIGTERM');
            resolve({
                success: false,
                output: stdout,
                error: 'Execution timed out',
                exitCode: null,
            });
        }, timeout);
        process.on('close', (exitCode) => {
            clearTimeout(timeoutId);
            resolve({
                success: exitCode === 0,
                output: stdout.trim(),
                error: stderr.trim(),
                exitCode,
            });
        });
        process.on('error', (error) => {
            clearTimeout(timeoutId);
            resolve({
                success: false,
                output: '',
                error: `Failed to spawn PowerShell: ${error.message}`,
                exitCode: null,
            });
        });
    });
}
/**
 * Execute PowerShell and return JSON output
 */
async function runPowerShellJson(code, workingDirectory) {
    const wrappedCode = `${code} | ConvertTo-Json -Depth 10 -Compress`;
    const result = await runPowerShell(wrappedCode, workingDirectory);
    if (!result.success || !result.output) {
        return null;
    }
    try {
        return JSON.parse(result.output);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=powershell.js.map