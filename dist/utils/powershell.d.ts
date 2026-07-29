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
 * Detect the best available PowerShell executable.
 * Prefers pwsh (PS 7+), falls back to powershell.exe on Windows.
 */
export declare function getPowerShellExecutable(): string;
/** Reset cached executable (useful for tests / settings change) */
export declare function resetPowerShellExecutableCache(): void;
/**
 * Execute PowerShell code and return the result.
 *
 * @param code             PowerShell code to execute
 * @param workingDirectory Optional working directory
 * @param timeout          Timeout in milliseconds (default 30 000)
 */
export declare function runPowerShell(code: string, workingDirectory?: string, timeout?: number): Promise<PowerShellResult>;
/**
 * Execute PowerShell via a temporary script file to avoid -Command length limits
 * and pipeline conflicts when the code itself contains pipelines.
 *
 * The result must be JSON-serialisable; wrap the code so the last expression
 * is converted with ConvertTo-Json.
 */
export declare function runPowerShellJson<T>(code: string, workingDirectory?: string, timeout?: number): Promise<T | null>;
