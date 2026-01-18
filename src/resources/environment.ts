/**
 * PowerShell Environment Resource Provider
 * 
 * Provides information about the current PowerShell environment.
 */

import { runPowerShellJson } from '../utils/powershell';

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
export async function getEnvironmentInfo(): Promise<EnvironmentInfo> {
    const script = `
    @{
      psVersion = $PSVersionTable.PSVersion.ToString()
      psEdition = $PSVersionTable.PSEdition
      os = if ($IsWindows) { 'Windows' } elseif ($IsLinux) { 'Linux' } elseif ($IsMacOS) { 'macOS' } else { $env:OS }
      platform = $PSVersionTable.Platform
      architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
      clrVersion = $PSVersionTable.CLRVersion.ToString()
      executionPolicy = (Get-ExecutionPolicy).ToString()
      currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
      currentDirectory = (Get-Location).Path
    }
  `;

    const result = await runPowerShellJson<EnvironmentInfo>(script);

    return result || {
        psVersion: 'Unknown',
        psEdition: 'Unknown',
        os: 'Unknown',
        platform: 'Unknown',
        architecture: 'Unknown',
        executionPolicy: 'Unknown',
        currentUser: 'Unknown',
        currentDirectory: 'Unknown',
    };
}

/**
 * Get PowerShell version info
 */
export async function getPSVersion(): Promise<string> {
    const script = `$PSVersionTable.PSVersion.ToString()`;
    const result = await runPowerShellJson<string>(script);
    return result || 'Unknown';
}
