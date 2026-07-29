/**
 * Invoke-Cmdlet Tool
 *
 * Executes a single PowerShell cmdlet with structured named parameters.
 * Token-optimised: depth=2, first=50, selectProperties to pick only needed fields.
 */
export interface CmdletResult {
    success: boolean;
    result: unknown;
    count?: number;
    error?: string;
}
/**
 * Execute a single PowerShell cmdlet with named parameters.
 *
 * @param cmdletName       Cmdlet name (e.g. "Get-Process")
 * @param parameters       Key/value map of parameter names → values
 * @param workingDirectory Optional working directory
 * @param selectProperties Return only these properties (saves tokens). If omitted,
 *                         smart defaults apply for common cmdlets.
 * @param depth            JSON serialisation depth (default 2). Increase only when
 *                         you need nested objects — higher values = more tokens.
 * @param first            Limit result to first N items (default 50).
 */
export declare function invokeCmdlet(cmdletName: string, parameters?: Record<string, unknown>, workingDirectory?: string, selectProperties?: string[], depth?: number, first?: number): Promise<CmdletResult>;
/**
 * Get the list of parameters for a cmdlet (compact, AI-friendly).
 */
export declare function getCmdletParameters(cmdletName: string): Promise<{
    name: string;
    type: string;
    mandatory: boolean;
}[]>;
