"use strict";
/**
 * Get-Help Integration Tool
 *
 * Retrieves PowerShell help documentation for cmdlets and topics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelp = getHelp;
exports.getQuickHelp = getQuickHelp;
const powershell_1 = require("../utils/powershell");
/**
 * Get help documentation for a PowerShell topic
 */
async function getHelp(topic, showExamples = false, detailed = false) {
    let helpParam = '';
    if (showExamples) {
        helpParam = '-Examples';
    }
    else if (detailed) {
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
    const result = await (0, powershell_1.runPowerShell)(script);
    if (!result.success && result.error) {
        return `Error getting help: ${result.error}`;
    }
    return result.output || `No help found for '${topic}'`;
}
/**
 * Get synopsis only for a cmdlet (quick help)
 */
async function getQuickHelp(cmdlet) {
    const escapedCmdlet = cmdlet.replace(/'/g, "''");
    const script = `
    try {
      $help = Get-Help '${escapedCmdlet}' -ErrorAction Stop
      "$($help.Name): $($help.Synopsis)"
    } catch {
      "No help available for '${escapedCmdlet}'"
    }
  `;
    const result = await (0, powershell_1.runPowerShell)(script);
    return result.output || `No help available for '${cmdlet}'`;
}
//# sourceMappingURL=getHelp.js.map