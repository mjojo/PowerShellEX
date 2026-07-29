/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns token-optimised results.
 */
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
export declare function executePowerShell(code: string, workingDirectory?: string, timeout?: number, maxOutput?: number): Promise<ExecutionResult>;
