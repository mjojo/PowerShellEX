/**
 * Get-Help Integration Tool
 * 
 * Retrieves PowerShell help documentation for cmdlets and topics.
 */

import { runPowerShell } from '../utils/powershell';

/**
 * Get help documentation for a PowerShell topic
 */
export async function getHelp(
    topic: string,
    showExamples: boolean = false,
    detailed: boolean = false
): Promise<string> {
    let helpParam = '';

    if (showExamples) {
        helpParam = '-Examples';
    } else if (detailed) {
        helpParam = '-Detailed';
    }

    const escapedTopic = topic.replace(/'/g, "''");

    const script = `
    try {
      Get-Help '${escapedTopic}' ${helpParam} | Out-String -Width 120
    } catch {
      "No help found for '${escapedTopic}'. Error: $($_.Exception.Message)"
    }
  `;

    const result = await runPowerShell(script);

    if (!result.success && result.error) {
        return `Error getting help: ${result.error}`;
    }

    return result.output || `No help found for '${topic}'`;
}

/**
 * Get synopsis only for a cmdlet (quick help)
 */
export async function getQuickHelp(cmdlet: string): Promise<string> {
    const escapedCmdlet = cmdlet.replace(/'/g, "''");

    const script = `
    try {
      $help = Get-Help '${escapedCmdlet}' -ErrorAction Stop
      "$($help.Name): $($help.Synopsis)"
    } catch {
      "No help available for '${escapedCmdlet}'"
    }
  `;

    const result = await runPowerShell(script);
    return result.output || `No help available for '${cmdlet}'`;
}
