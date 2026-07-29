/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns token-optimised results.
 */

import { runPowerShell, type PowerShellResult } from '../utils/powershell';
import { truncateOutput, DEFAULT_MAX_OUTPUT } from '../utils/tokenOptimizer';

export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTime?: number;
    exitCode: number | null;
}

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
export async function executePowerShell(
    code: string,
    workingDirectory?: string,
    timeout: number = 30_000,
    maxOutput: number = DEFAULT_MAX_OUTPUT
): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Note: runPowerShell already strips ANSI from stdout/stderr
    const result: PowerShellResult = await runPowerShell(code, workingDirectory, timeout);

    const executionTime = Date.now() - startTime;

    return {
        success:       result.success,
        output:        truncateOutput(result.output || '(no output)', maxOutput, 'stdout'),
        error:         result.error?.trim() || undefined,
        executionTime,
        exitCode:      result.exitCode,
    };
}
