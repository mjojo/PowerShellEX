/**
 * Invoke-Cmdlet Tool
 *
 * Executes a single PowerShell cmdlet with structured named parameters.
 * Unlike execute_powershell (which runs arbitrary code), this tool accepts
 * a cmdlet name + parameter map, builds a safe invocation, and returns
 * structured JSON output — ideal for AI agents that need predictable results.
 */
export interface CmdletParameter {
    /** Parameter name (without the leading dash) */
    name: string;
    /** Parameter value — string, number, boolean, or array */
    value: string | number | boolean | string[];
}
export interface CmdletResult {
    success: boolean;
    /** Structured JSON output from the cmdlet */
    result: unknown;
    /** Raw string output when ConvertTo-Json fails */
    rawOutput?: string;
    error?: string;
}
/**
 * Execute a single PowerShell cmdlet with named parameters.
 *
 * @param cmdletName Name of the cmdlet (e.g. "Get-Process", "Set-Content")
 * @param parameters Key/value map of parameter names → values
 * @param workingDirectory Optional working directory
 */
export declare function invokeCmdlet(cmdletName: string, parameters?: Record<string, unknown>, workingDirectory?: string): Promise<CmdletResult>;
/**
 * Get the list of parameters for a cmdlet (for MCP tool discovery)
 */
export declare function getCmdletParameters(cmdletName: string): Promise<{
    name: string;
    type: string;
    mandatory: boolean;
    description: string;
}[]>;
