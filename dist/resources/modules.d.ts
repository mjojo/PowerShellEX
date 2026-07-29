/**
 * PowerShell Modules Resource Provider
 *
 * Returns compact module info — Path excluded by default to save tokens.
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
 * List installed PowerShell modules.
 *
 * @param filter        Wildcard name filter (optional)
 * @param listAvailable Include modules not yet imported
 * @param includePath   Include module file path (adds tokens; off by default)
 */
export declare function listModules(filter?: string, listAvailable?: boolean, includePath?: boolean): Promise<ModuleInfo[]>;
/**
 * Get cmdlets from a specific module (compact: name + commandType only).
 */
export declare function getCmdlets(moduleName: string): Promise<CmdletInfo[]>;
/**
 * Import a module into the current session.
 */
export declare function importModule(moduleName: string): Promise<boolean>;
