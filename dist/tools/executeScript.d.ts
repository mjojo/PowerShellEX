/**
 * Execute PowerShell Script Tool
 *
 * Executes PowerShell code and returns structured results.
 */
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
export declare function executePowerShell(code: string, workingDirectory?: string, timeout?: number): Promise<ExecutionResult>;
