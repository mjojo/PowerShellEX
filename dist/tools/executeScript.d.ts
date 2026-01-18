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
}
/**
 * Execute PowerShell code
 */
export declare function executePowerShell(code: string, workingDirectory?: string): Promise<ExecutionResult>;
