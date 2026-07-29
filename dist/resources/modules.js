"use strict";
/**
 * PowerShell Modules Resource Provider
 *
 * Returns compact module info — Path excluded by default to save tokens.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModules = listModules;
exports.getCmdlets = getCmdlets;
exports.importModule = importModule;
const powershell_1 = require("../utils/powershell");
/**
 * List installed PowerShell modules.
 *
 * @param filter        Wildcard name filter (optional)
 * @param listAvailable Include modules not yet imported
 * @param includePath   Include module file path (adds tokens; off by default)
 */
async function listModules(filter, listAvailable = false, includePath = false) {
    const filterParam = filter ? `-Name '${filter.replace(/'/g, "''")}'` : '';
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
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result || [];
}
/**
 * Get cmdlets from a specific module (compact: name + commandType only).
 */
async function getCmdlets(moduleName) {
    const escapedModule = moduleName.replace(/'/g, "''");
    const script = `
Get-Command -Module '${escapedModule}' |
Select-Object -First 200 `
        + `@{N='name';E={$_.Name}},`
        + `@{N='moduleName';E={$_.ModuleName}},`
        + `@{N='commandType';E={$_.CommandType.ToString()}}`;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result || [];
}
/**
 * Import a module into the current session.
 */
async function importModule(moduleName) {
    const escapedModule = moduleName.replace(/'/g, "''");
    const script = `
try {
    Import-Module '${escapedModule}' -ErrorAction Stop
    $true
} catch {
    $false
}`;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result === true;
}
//# sourceMappingURL=modules.js.map