/**
 * PowerShell Execution Utility
 *
 * Provides a wrapper for spawning PowerShell processes and capturing output.
 */
export interface PowerShellResult {
    success: boolean;
    output: string;
    error: string;
    exitCode: number | null;
}
/**
 * Execute PowerShell code and return the result
 */
export declare function runPowerShell(code: string, workingDirectory?: string, timeout?: number): Promise<PowerShellResult>;
/**
 * Execute PowerShell and return JSON output
 */
export declare function runPowerShellJson<T>(code: string, workingDirectory?: string): Promise<T | null>;
