/**
 * PowerShell Execution Utility
 * 
 * Provides a wrapper for spawning PowerShell processes and capturing output.
 */

import { spawn } from 'child_process';
import { platform } from 'os';

export interface PowerShellResult {
    success: boolean;
    output: string;
    error: string;
    exitCode: number | null;
}

/**
 * Get the PowerShell executable name based on the platform
 */
function getPowerShellExecutable(): string {
    // Prefer PowerShell 7+ (pwsh) if available, fall back to Windows PowerShell
    return platform() === 'win32' ? 'pwsh' : 'pwsh';
}

/**
 * Execute PowerShell code and return the result
 */
export async function runPowerShell(
    code: string,
    workingDirectory?: string,
    timeout: number = 30000
): Promise<PowerShellResult> {
    return new Promise((resolve) => {
        const executable = getPowerShellExecutable();

        const args = [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            code,
        ];

        const options: { cwd?: string; timeout?: number } = {};
        if (workingDirectory) {
            options.cwd = workingDirectory;
        }

        const process = spawn(executable, args, options);

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
export async function runPowerShellJson<T>(
    code: string,
    workingDirectory?: string
): Promise<T | null> {
    const wrappedCode = `${code} | ConvertTo-Json -Depth 10 -Compress`;
    const result = await runPowerShell(wrappedCode, workingDirectory);

    if (!result.success || !result.output) {
        return null;
    }

    try {
        return JSON.parse(result.output) as T;
    } catch {
        return null;
    }
}
