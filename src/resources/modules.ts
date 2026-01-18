/**
 * PowerShell Modules Resource Provider
 * 
 * Provides information about installed PowerShell modules and their cmdlets.
 */

import { runPowerShellJson } from '../utils/powershell';

export interface ModuleInfo {
    name: string;
    version: string;
    description?: string;
    moduleType?: string;
    path?: string;
}

export interface CmdletInfo {
    name: string;
    moduleName: string;
    commandType: string;
}

/**
 * List installed PowerShell modules
 */
export async function listModules(
    filter?: string,
    listAvailable: boolean = false
): Promise<ModuleInfo[]> {
    const filterParam = filter ? `-Name '${filter.replace(/'/g, "''")}'` : '';
    const availableParam = listAvailable ? '-ListAvailable' : '';

    const script = `
    Get-Module ${availableParam} ${filterParam} | 
    Select-Object -First 100 Name, @{N='version';E={$_.Version.ToString()}}, Description, ModuleType, Path |
    Sort-Object Name -Unique
  `;

    const result = await runPowerShellJson<ModuleInfo[]>(script);
    return result || [];
}

/**
 * Get cmdlets from a specific module
 */
export async function getCmdlets(moduleName: string): Promise<CmdletInfo[]> {
    const escapedModule = moduleName.replace(/'/g, "''");

    const script = `
    Get-Command -Module '${escapedModule}' | 
    Select-Object -First 200 Name, ModuleName, @{N='commandType';E={$_.CommandType.ToString()}}
  `;

    const result = await runPowerShellJson<CmdletInfo[]>(script);
    return result || [];
}

/**
 * Import a module into the current session
 */
export async function importModule(moduleName: string): Promise<boolean> {
    const escapedModule = moduleName.replace(/'/g, "''");

    const script = `
    try {
      Import-Module '${escapedModule}' -ErrorAction Stop
      $true
    } catch {
      $false
    }
  `;

    const result = await runPowerShellJson<boolean>(script);
    return result === true;
}
