"use strict";
/**
 * PowerShell Environment Resource Provider
 *
 * Provides information about the current PowerShell environment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentInfo = getEnvironmentInfo;
exports.getPSVersion = getPSVersion;
const powershell_1 = require("../utils/powershell");
/**
 * Get current PowerShell environment information
 */
async function getEnvironmentInfo() {
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
    const result = await (0, powershell_1.runPowerShellJson)(script);
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
async function getPSVersion() {
    const script = `$PSVersionTable.PSVersion.ToString()`;
    const result = await (0, powershell_1.runPowerShellJson)(script);
    return result || 'Unknown';
}
//# sourceMappingURL=environment.js.map