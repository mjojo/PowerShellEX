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
}

/**
 * Execute PowerShell code
 */
export async function executePowerShell(
    code: string,
    workingDirectory?: string
): Promise<ExecutionResult> {
    const startTime = Date.now();

    const result = await runPowerShell(code, workingDirectory);

    const executionTime = Date.now() - startTime;

    return {
        success: result.success,
        output: result.output || '(no output)',
        error: result.error || undefined,
        executionTime,
    };
}
