"use strict";
/**
 * IntelliSense Completions Tool
 *
 * Provides code completions using PowerShell's TabExpansion2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletions = getCompletions;
const powershell_1 = require("../utils/powershell");
/**
 * Get IntelliSense completions at the specified cursor position
 */
async function getCompletions(code, cursorPosition) {
    const escapedCode = code.replace(/'/g, "''");
    const script = `
    $code = '${escapedCode}'
    $cursor = ${cursorPosition}
    try {
      $result = [System.Management.Automation.CommandCompletion]::CompleteInput($code, $cursor, $null)
      @{
        Completions = $result.CompletionMatches | Select-Object -First 50 @{N='text';E={$_.CompletionText}}, @{N='type';E={$_.ResultType.ToString()}}, @{N='toolTip';E={$_.ToolTip}}, @{N='listItemText';E={$_.ListItemText}}
        ReplacementIndex = $result.ReplacementIndex
        ReplacementLength = $result.ReplacementLength
      }
    } catch {
      @{ Error = $_.Exception.Message }
    }
  `;
    try {
        const result = await (0, powershell_1.runPowerShellJson)(script);
        if (!result) {
            return {
                success: true,
                completions: [],
                replacementIndex: cursorPosition,
                replacementLength: 0,
            };
        }
        if ('Error' in result) {
            return {
                success: false,
                completions: [],
                replacementIndex: cursorPosition,
                replacementLength: 0,
                error: result.Error,
            };
        }
        return {
            success: true,
            completions: result.Completions || [],
            replacementIndex: result.ReplacementIndex,
            replacementLength: result.ReplacementLength,
        };
    }
    catch (error) {
        return {
            success: false,
            completions: [],
            replacementIndex: cursorPosition,
            replacementLength: 0,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
//# sourceMappingURL=getCompletion.js.map