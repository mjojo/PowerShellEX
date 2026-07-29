/**
 * PowerShell Execution Utility
 *
 * Provides a wrapper for spawning PowerShell processes and capturing output.
 */

import { spawn, execSync } from 'child_process';
import { platform } from 'os';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export interface PowerShellResult {
    success: boolean;
    output: string;
    error: string;
    exitCode: number | null;
}

/** Cached PS executable path */
let _psExecutable: string | null = null;

/**
 * Detect the best available PowerShell executable.
 * Prefers pwsh (PS 7+), falls back to powershell.exe on Windows.
 */
export function getPowerShellExecutable(): string {
    if (_psExecutable !== null) {
        return _psExecutable;
    }

    try {
        execSync('pwsh -NoProfile -NonInteractive -Command "$null"', {
            stdio: 'ignore',
            timeout: 5000,
        });
        _psExecutable = 'pwsh';
    } catch {
        // Fall back to Windows PowerShell 5.1
        if (platform() === 'win32') {
            _psExecutable = 'powershell';
        } else {
            // On non-Windows there is no fallback — keep pwsh
            _psExecutable = 'pwsh';
        }
    }

    return _psExecutable;
}

/** Reset cached executable (useful for tests / settings change) */
export function resetPowerShellExecutableCache(): void {
    _psExecutable = null;
}

/**
 * Execute PowerShell code and return the result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Timeout in milliseconds (default 30 000)
 */
export async function runPowerShell(
    code: string,
    workingDirectory?: string,
    timeout: number = 30_000
): Promise<PowerShellResult> {
    return new Promise((resolve) => {
        const executable = getPowerShellExecutable();

        const args = [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            code,
        ];

        const options: { cwd?: string } = {};
        if (workingDirectory) {
            options.cwd = workingDirectory;
        }

        const child = spawn(executable, args, options);

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

        child.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        child.on('close', (exitCode) => {
            if (timedOut) { return; }
            clearTimeout(timeoutId);
            resolve({
                success: exitCode === 0,
                output: stdout.trim(),
                error: stderr.trim(),
                exitCode,
            });
        });

        child.on('error', (error) => {
            if (timedOut) { return; }
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
export async function runPowerShellJson<T>(
    code: string,
    workingDirectory?: string,
    timeout: number = 30_000
): Promise<T | null> {
    // Write code to a temp file so we avoid -Command length limits
    // and double-pipe issues when the callee code already has pipelines.
    const tmpFile = join(tmpdir(), `psex_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);

    const wrappedCode = `
Set-StrictMode -Off
$ErrorActionPreference = 'Stop'
$__psex_result = & {
${code}
}
$__psex_result | ConvertTo-Json -Depth 10 -Compress
`;

    try {
        writeFileSync(tmpFile, wrappedCode, 'utf8');

        const executable = getPowerShellExecutable();
        const args = ['-NoProfile', '-NonInteractive', '-File', tmpFile];
        const options: { cwd?: string } = {};
        if (workingDirectory) { options.cwd = workingDirectory; }

        const result = await new Promise<PowerShellResult>((resolve) => {
            const child = spawn(executable, args, options);
            let stdout = '';
            let stderr = '';
            let timedOut = false;

            const timeoutId = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                resolve({ success: false, output: stdout, error: `Timed out after ${timeout}ms`, exitCode: null });
            }, timeout);

            child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
            child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

            child.on('close', (code) => {
                if (timedOut) { return; }
                clearTimeout(timeoutId);
                resolve({ success: code === 0, output: stdout.trim(), error: stderr.trim(), exitCode: code });
            });

            child.on('error', (err) => {
                if (timedOut) { return; }
                clearTimeout(timeoutId);
                resolve({ success: false, output: '', error: err.message, exitCode: null });
            });
        });

        if (!result.success || !result.output) {
            return null;
        }

        return JSON.parse(result.output) as T;
    } catch {
        return null;
    } finally {
        try { unlinkSync(tmpFile); } catch { /* best-effort cleanup */ }
    }
}
