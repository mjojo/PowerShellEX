/**
 * PowerShell Environment Resource Provider
 *
 * Provides information about the current PowerShell environment.
 */
export interface EnvironmentInfo {
    psVersion: string;
    psEdition: string;
    os: string;
    platform: string;
    architecture: string;
    clrVersion?: string;
    executionPolicy: string;
    currentUser: string;
    currentDirectory: string;
}
/**
 * Get current PowerShell environment information
 */
export declare function getEnvironmentInfo(): Promise<EnvironmentInfo>;
/**
 * Get PowerShell version info
 */
export declare function getPSVersion(): Promise<string>;
