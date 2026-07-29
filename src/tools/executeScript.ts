/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns structured results.
 */

import { runPowerShell, type PowerShellResult } from '../utils/powershell';

export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTime?: number;
    exitCode: number | null;
}

/**
 * Execute PowerShell code and return a structured result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Execution timeout in milliseconds (default 30 000)
 */
export async function executePowerShell(
    code: string,
    workingDirectory?: string,
    timeout: number = 30_000
): Promise<ExecutionResult> {
    const startTime = Date.now();

    const result: PowerShellResult = await runPowerShell(code, workingDirectory, timeout);

    const executionTime = Date.now() - startTime;

    return {
        success:       result.success,
        output:        result.output || '(no output)',
        error:         result.error  || undefined,
        executionTime,
        exitCode:      result.exitCode,
    };
}
