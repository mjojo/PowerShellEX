"use strict";
/**
 * Invoke-Cmdlet Tool
 *
 * Executes a single PowerShell cmdlet with structured named parameters.
 * Token-optimised: depth=2, first=50, selectProperties to pick only needed fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeCmdlet = invokeCmdlet;
exports.getCmdletParameters = getCmdletParameters;
const powershell_1 = require("../utils/powershell");
// ─────────────────────────────────────────────────────────────────────────────
// Parameter builder
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Build a safe PowerShell parameter string from a key/value map.
 */
function buildParamString(params) {
    return Object.entries(params)
        .map(([key, value]) => {
        if (value === true) {
            return `-${key}`;
        }
        if (value === false) {
            return `-${key}:$false`;
        }
        if (typeof value === 'number') {
            return `-${key} ${value}`;
        }
        if (Array.isArray(value)) {
            const escaped = value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',');
            return `-${key} @(${escaped})`;
        }
        const escaped = String(value).replace(/'/g, "''");
        return `-${key} '${escaped}'`;
    })
        .join(' ');
}
// ─────────────────────────────────────────────────────────────────────────────
// Smart default properties per common cmdlets (avoids 911 KB responses)
// ─────────────────────────────────────────────────────────────────────────────
const SMART_DEFAULTS = {
    'Get-Process': ['Id', 'ProcessName', 'CPU', 'WorkingSet64', 'Responding'],
    'Get-Service': ['Name', 'DisplayName', 'Status', 'StartType'],
    'Get-Item': ['Name', 'FullName', 'Length', 'LastWriteTime', 'Attributes'],
    'Get-ChildItem': ['Name', 'FullName', 'Length', 'LastWriteTime', 'Attributes'],
    'Get-Module': ['Name', 'Version', 'ModuleType', 'ExportedCommands'],
    'Get-Command': ['Name', 'CommandType', 'ModuleName', 'Version'],
    'Get-EventLog': ['TimeGenerated', 'EntryType', 'Source', 'EventID', 'Message'],
    'Get-NetAdapter': ['Name', 'Status', 'LinkSpeed', 'MacAddress'],
    'Get-Disk': ['Number', 'FriendlyName', 'OperationalStatus', 'Size'],
    'Get-Volume': ['DriveLetter', 'FileSystemLabel', 'FileSystem', 'Size', 'SizeRemaining'],
};
/**
 * Build a Select-Object clause, or empty string if no selection needed.
 */
function buildSelectClause(cmdletName, selectProperties) {
    // Explicit selection always wins
    if (selectProperties && selectProperties.length > 0) {
        const props = selectProperties.map(p => `'${p.replace(/'/g, "''")}'`).join(',');
        return `| Select-Object ${props}`;
    }
    // Smart default for known cmdlets
    const baseName = cmdletName.split(' ')[0]; // strip any aliases
    const defaults = SMART_DEFAULTS[baseName];
    if (defaults) {
        const props = defaults.map(p => `'${p}'`).join(',');
        return `| Select-Object ${props}`;
    }
    return '';
}
// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────
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
async function invokeCmdlet(cmdletName, parameters = {}, workingDirectory, selectProperties, depth = 2, first = 50) {
    // Input validation — cmdlet name must be a safe identifier
    if (!/^[\w-]+$/.test(cmdletName)) {
        return {
            success: false,
            result: null,
            error: `Invalid cmdlet name: "${cmdletName}". Only alphanumeric chars and hyphens allowed.`,
        };
    }
    const paramString = buildParamString(parameters);
    const selectClause = buildSelectClause(cmdletName, selectProperties);
    const firstClause = `| Select-Object -First ${first}`;
    const cmdline = `${cmdletName}${paramString ? ' ' + paramString : ''}`;
    const script = [
        `$__result = ${cmdline}`,
        `$__count  = if ($__result -is [System.Collections.IEnumerable] -and $__result -isnot [string]) { @($__result).Count } else { 1 }`,
        `@{`,
        `    result = $__result ${selectClause} ${firstClause}`,
        `    count  = $__count`,
        `}`,
    ].join('\n');
    try {
        const data = await (0, powershell_1.runPowerShellJson)(script, workingDirectory, 30_000, depth);
        if (!data) {
            return { success: true, result: null, count: 0 };
        }
        return {
            success: true,
            result: data.result,
            count: data.count,
        };
    }
    catch (error) {
        return {
            success: false,
            result: null,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// getCmdletParameters helper
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get the list of parameters for a cmdlet (compact, AI-friendly).
 */
async function getCmdletParameters(cmdletName) {
    if (!/^[\w-]+$/.test(cmdletName)) {
        return [];
    }
    const selectProps = [
        "@{N='name';E={$_.Name}}",
        "@{N='type';E={$_.ParameterType.Name}}",
        "@{N='mandatory';E={($_.Attributes | Where-Object { $_ -is [System.Management.Automation.ParameterAttribute] } | Select-Object -First 1).Mandatory -eq $true}}",
    ].join(',');
    const script = [
        'try {',
        `    $cmd = Get-Command '${cmdletName}' -ErrorAction Stop`,
        `    $cmd.Parameters.Values | Select-Object ${selectProps}`,
        '} catch {',
        '    @()',
        '}',
    ].join('\n');
    const result = await (0, powershell_1.runPowerShellJson)(script, undefined, 15_000, 2);
    return result ?? [];
}
//# sourceMappingURL=invokeCmdlet.js.map