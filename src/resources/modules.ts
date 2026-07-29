/**
 * PowerShell Modules Resource Provider
 *
 * Returns compact module info — Path excluded by default to save tokens.
 */

import { runPowerShellJson } from '../utils/powershell';

export interface ModuleInfo {
    name: string;
    version: string;
    description?: string;
    moduleType?: string;
    path?: string;        // only when includePath=true
}

export interface CmdletInfo {
    name: string;
    moduleName: string;
    commandType: string;
}

/**
 * List installed PowerShell modules.
 *
 * @param filter        Wildcard name filter (optional)
 * @param listAvailable Include modules not yet imported
 * @param includePath   Include module file path (adds tokens; off by default)
 */
export async function listModules(
    filter?: string,
    listAvailable: boolean = false,
    includePath: boolean = false
): Promise<ModuleInfo[]> {
    const filterParam    = filter ? `-Name '${filter.replace(/'/g, "''")}'` : '';
    const availableParam = listAvailable ? '-ListAvailable' : '';

    // Conditionally include Path to keep output compact
    const pathProp = includePath
        ? ", @{N='path';E={$_.Path}}"
        : '';

    const script = `
Get-Module ${availableParam} ${filterParam} |
Select-Object -First 200 `
        + `@{N='name';E={$_.Name}},`
        + `@{N='version';E={$_.Version.ToString()}},`
        + `@{N='description';E={if($_.Description){$_.Description.Substring(0,[Math]::Min(120,$_.Description.Length))}else{''}}},`
        + `@{N='moduleType';E={$_.ModuleType.ToString()}}${pathProp} |`
        + `Sort-Object name -Unique`;

    const result = await runPowerShellJson<ModuleInfo[]>(script);
    return result || [];
}

/**
 * Get cmdlets from a specific module (compact: name + commandType only).
 */
export async function getCmdlets(moduleName: string): Promise<CmdletInfo[]> {
    const escapedModule = moduleName.replace(/'/g, "''");

    const script = `
Get-Command -Module '${escapedModule}' |
Select-Object -First 200 `
        + `@{N='name';E={$_.Name}},`
        + `@{N='moduleName';E={$_.ModuleName}},`
        + `@{N='commandType';E={$_.CommandType.ToString()}}`;

    const result = await runPowerShellJson<CmdletInfo[]>(script);
    return result || [];
}

/**
 * Import a module into the current session.
 */
export async function importModule(moduleName: string): Promise<boolean> {
    const escapedModule = moduleName.replace(/'/g, "''");

    const script = `
try {
    Import-Module '${escapedModule}' -ErrorAction Stop
    $true
} catch {
    $false
}`;

    const result = await runPowerShellJson<boolean>(script);
    return result === true;
}
