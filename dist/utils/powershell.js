"use strict";
/**
 * PowerShell Execution Utility
 *
 * Provides a wrapper for spawning PowerShell processes and capturing output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPowerShellExecutable = getPowerShellExecutable;
exports.resetPowerShellExecutableCache = resetPowerShellExecutableCache;
exports.runPowerShell = runPowerShell;
exports.runPowerShellJson = runPowerShellJson;
const child_process_1 = require("child_process");
const os_1 = require("os");
const fs_1 = require("fs");
const os_2 = require("os");
const path_1 = require("path");
/** Cached PS executable path */
let _psExecutable = null;
/**
 * Detect the best available PowerShell executable.
 * Prefers pwsh (PS 7+), falls back to powershell.exe on Windows.
 */
function getPowerShellExecutable() {
    if (_psExecutable !== null) {
        return _psExecutable;
    }
    try {
        (0, child_process_1.execSync)('pwsh -NoProfile -NonInteractive -Command "$null"', {
            stdio: 'ignore',
            timeout: 5000,
        });
        _psExecutable = 'pwsh';
    }
    catch {
        // Fall back to Windows PowerShell 5.1
        if ((0, os_1.platform)() === 'win32') {
            _psExecutable = 'powershell';
        }
        else {
            // On non-Windows there is no fallback — keep pwsh
            _psExecutable = 'pwsh';
        }
    }
    return _psExecutable;
}
/** Reset cached executable (useful for tests / settings change) */
function resetPowerShellExecutableCache() {
    _psExecutable = null;
}
/**
 * Execute PowerShell code and return the result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Timeout in milliseconds (default 30 000)
 */
async function runPowerShell(code, workingDirectory, timeout = 30_000) {
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
        const child = (0, child_process_1.spawn)(executable, args, options);
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
            resolve({
                success: false,
                output: stdout,
                error: `Execution timed out after ${timeout}ms`,
                exitCode: null,
            });
        }, timeout);
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        child.on('close', (exitCode) => {
            if (timedOut) {
                return;
            }
            clearTimeout(timeoutId);
            resolve({
                success: exitCode === 0,
                output: stdout.trim(),
                error: stderr.trim(),
                exitCode,
            });
        });
        child.on('error', (error) => {
            if (timedOut) {
                return;
            }
            clearTimeout(timeoutId);
            resolve({
                success: false,
                output: '',
                error: `Failed to spawn PowerShell ("${executable}"): ${error.message}`,
                exitCode: null,
            });
        });
    });
}
/**
 * Execute PowerShell via a temporary script file to avoid -Command length limits
 * and pipeline conflicts when the code itself contains pipelines.
 *
 * The result must be JSON-serialisable; wrap the code so the last expression
 * is converted with ConvertTo-Json.
 */
async function runPowerShellJson(code, workingDirectory, timeout = 30_000) {
    // Write code to a temp file so we avoid -Command length limits
    // and double-pipe issues when the callee code already has pipelines.
    const tmpFile = (0, path_1.join)((0, os_2.tmpdir)(), `psex_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);
    const wrappedCode = `
Set-StrictMode -Off
$ErrorActionPreference = 'Stop'
$__psex_result = & {
${code}
}
$__psex_result | ConvertTo-Json -Depth 10 -Compress
`;
    try {
        (0, fs_1.writeFileSync)(tmpFile, wrappedCode, 'utf8');
        const executable = getPowerShellExecutable();
        const args = ['-NoProfile', '-NonInteractive', '-File', tmpFile];
        const options = {};
        if (workingDirectory) {
            options.cwd = workingDirectory;
        }
        const result = await new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(executable, args, options);
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            const timeoutId = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                resolve({ success: false, output: stdout, error: `Timed out after ${timeout}ms`, exitCode: null });
            }, timeout);
            child.stdout.on('data', (d) => { stdout += d.toString(); });
            child.stderr.on('data', (d) => { stderr += d.toString(); });
            child.on('close', (code) => {
                if (timedOut) {
                    return;
                }
                clearTimeout(timeoutId);
                resolve({ success: code === 0, output: stdout.trim(), error: stderr.trim(), exitCode: code });
            });
            child.on('error', (err) => {
                if (timedOut) {
                    return;
                }
                clearTimeout(timeoutId);
                resolve({ success: false, output: '', error: err.message, exitCode: null });
            });
        });
        if (!result.success || !result.output) {
            return null;
        }
        return JSON.parse(result.output);
    }
    catch {
        return null;
    }
    finally {
        try {
            (0, fs_1.unlinkSync)(tmpFile);
        }
        catch { /* best-effort cleanup */ }
    }
}
//# sourceMappingURL=powershell.js.map