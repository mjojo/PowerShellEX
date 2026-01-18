"use strict";
/**
 * PowerShell Modules Resource Provider
 *
 * Provides information about installed PowerShell modules and their cmdlets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModules = listModules;
exports.getCmdlets = getCmdlets;
exports.importModule = importModule;
const powershell_1 = require("../utils/powershell");
/**
 * List installed PowerShell modules
 */
async function listModules(filter, listAvailable = false) {
    const filterParam = filter ? `-Name '${filter.replace(/'/g, "''")}'` : '';
    const availableParam = listAvailable ? '-ListAvailable' : '';
    const script = `
    Get-Module ${availableParam} ${filterParam} | 
    Select-Object -First 100 Name, @{N='version';E={$_.Version.ToString()}}, Description, ModuleType, Path |
    Sort-Object Name -Unique
  `;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result || [];
}
/**
 * Get cmdlets from a specific module
 */
async function getCmdlets(moduleName) {
    const escapedModule = moduleName.replace(/'/g, "''");
    const script = `
    Get-Command -Module '${escapedModule}' | 
    Select-Object -First 200 Name, ModuleName, @{N='commandType';E={$_.CommandType.ToString()}}
  `;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result || [];
}
/**
 * Import a module into the current session
 */
async function importModule(moduleName) {
    const escapedModule = moduleName.replace(/'/g, "''");
    const script = `
    try {
      Import-Module '${escapedModule}' -ErrorAction Stop
      $true
    } catch {
      $false
    }
  `;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result === true;
}
//# sourceMappingURL=modules.js.map