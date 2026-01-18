/**
 * IntelliSense Completions Tool
 * 
 * Provides code completions using PowerShell's TabExpansion2.
 */

import { runPowerShellJson } from '../utils/powershell';

export interface CompletionItem {
    text: string;
    type: string;
    toolTip?: string;
    listItemText?: string;
}

export interface CompletionResult {
    success: boolean;
    completions: CompletionItem[];
    replacementIndex: number;
    replacementLength: number;
    error?: string;
}

/**
 * Get IntelliSense completions at the specified cursor position
 */
export async function getCompletions(
    code: string,
    cursorPosition: number
): Promise<CompletionResult> {
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
        const result = await runPowerShellJson<{
            Completions: CompletionItem[];
            ReplacementIndex: number;
            ReplacementLength: number;
        } | { Error: string }>(script);

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
    } catch (error) {
        return {
            success: false,
            completions: [],
            replacementIndex: cursorPosition,
            replacementLength: 0,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
