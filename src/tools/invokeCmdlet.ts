/**
 * Invoke-Cmdlet Tool
 *
 * Executes a single PowerShell cmdlet with structured named parameters.
 * Unlike execute_powershell (which runs arbitrary code), this tool accepts
 * a cmdlet name + parameter map, builds a safe invocation, and returns
 * structured JSON output — ideal for AI agents that need predictable results.
 */

import { runPowerShellJson } from '../utils/powershell';

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
 * Build a safe PowerShell parameter string from a key/value map.
 * Escapes string values to prevent injection.
 */
function buildParamString(params: Record<string, unknown>): string {
    return Object.entries(params)
        .map(([key, value]) => {
            if (value === true)  { return `-${key}`; }
            if (value === false) { return `-${key}:$false`; }
            if (typeof value === 'number') { return `-${key} ${value}`; }
            if (Array.isArray(value)) {
                const escaped = value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',');
                return `-${key} @(${escaped})`;
            }
            // String — single-quote escaped
            const escaped = String(value).replace(/'/g, "''");
            return `-${key} '${escaped}'`;
        })
        .join(' ');
}

/**
 * Execute a single PowerShell cmdlet with named parameters.
 *
 * @param cmdletName Name of the cmdlet (e.g. "Get-Process", "Set-Content")
 * @param parameters Key/value map of parameter names → values
 * @param workingDirectory Optional working directory
 */
export async function invokeCmdlet(
    cmdletName: string,
    parameters: Record<string, unknown> = {},
    workingDirectory?: string
): Promise<CmdletResult> {
    // Basic validation — cmdlet name must match Verb-Noun or be a simple identifier
    if (!/^[\w-]+$/.test(cmdletName)) {
        return {
            success: false,
            result: null,
            error: `Invalid cmdlet name: "${cmdletName}". Only alphanumeric characters and hyphens are allowed.`,
        };
    }

    const paramString = buildParamString(parameters);
    const cmdline = `${cmdletName}${paramString ? ' ' + paramString : ''}`;

    const script = `
$__cmd_result = ${cmdline}
$__cmd_result
`;

    try {
        const result = await runPowerShellJson<unknown>(script, workingDirectory);

        return {
            success: true,
            result: result ?? null,
        };
    } catch (error) {
        return {
            success: false,
            result: null,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Get the list of parameters for a cmdlet (for MCP tool discovery)
 */
export async function getCmdletParameters(cmdletName: string): Promise<{
    name: string;
    type: string;
    mandatory: boolean;
    description: string;
}[]> {
    if (!/^[\w-]+$/.test(cmdletName)) {
        return [];
    }

    const selectProps = [
        "@{N='name';E={$_.Name}}",
        "@{N='type';E={$_.ParameterType.Name}}",
        "@{N='mandatory';E={($_.Attributes | Where-Object { $_ -is [System.Management.Automation.ParameterAttribute] } | Select-Object -First 1).Mandatory -eq $true}}",
        "@{N='description';E={$help = Get-Help '" + cmdletName + "' -Parameter $_.Name -ErrorAction SilentlyContinue; if ($help) { $help.Description.Text } else { '' }}}",
    ].join(',');

    const script = [
        'try {',
        `    $cmd = Get-Command '${cmdletName}' -ErrorAction Stop`,
        `    $cmd.Parameters.Values | Select-Object ${selectProps}`,
        '} catch {',
        '    @()',
        '}',
    ].join('\n');

    const result = await runPowerShellJson<{ name: string; type: string; mandatory: boolean; description: string }[]>(script);
    return result ?? [];
}
