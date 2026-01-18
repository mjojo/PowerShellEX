/**
 * PowerShell Modules Resource Provider
 *
 * Provides information about installed PowerShell modules and their cmdlets.
 */
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
export declare function listModules(filter?: string, listAvailable?: boolean): Promise<ModuleInfo[]>;
/**
 * Get cmdlets from a specific module
 */
export declare function getCmdlets(moduleName: string): Promise<CmdletInfo[]>;
/**
 * Import a module into the current session
 */
export declare function importModule(moduleName: string): Promise<boolean>;
