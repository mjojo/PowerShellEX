/**
 * IntelliSense Completions Tool
 *
 * Provides code completions using PowerShell's TabExpansion2.
 * TTL cache (5 s) prevents redundant process spawns for the same context.
 */

import { runPowerShellJson } from '../utils/powershell';
import { completionsCache }  from '../utils/tokenOptimizer';

export interface CompletionItem {
    text: string;
    type: string;
    toolTip?: string;
}

export interface CompletionResult {
    success: boolean;
    completions: CompletionItem[];
    replacementIndex: number;
    replacementLength: number;
    cached?: boolean;
    error?: string;
}

/**
 * Get IntelliSense completions at the specified cursor position.
 * Results are cached for 5 seconds per (code, cursor) pair.
 *
 * @param code           PowerShell code context
 * @param cursorPosition Character offset of the cursor
 * @param maxResults     Maximum number of completions to return (default 30)
 */
export async function getCompletions(
    code: string,
    cursorPosition: number,
    maxResults: number = 30
): Promise<CompletionResult> {

    // Cache key: code + cursor
    const cacheKey = `${cursorPosition}:${code}`;
    const cached = completionsCache.get(cacheKey) as CompletionResult | undefined;
    if (cached) {
        return { ...cached, cached: true };
    }

    const escapedCode = code.replace(/'/g, "''");

    // Compact property selection — drop listItemText (redundant with text)
    const selectProps = [
        "@{N='text';E={$_.CompletionText}}",
        "@{N='type';E={$_.ResultType.ToString()}}",
        "@{N='toolTip';E={if($_.ToolTip.Length -gt 80){$_.ToolTip.Substring(0,80)+'...'}else{$_.ToolTip}}}",
    ].join(',');

    const script = [
        `$code   = '${escapedCode}'`,
        `$cursor = ${cursorPosition}`,
        'try {',
        '    $result = [System.Management.Automation.CommandCompletion]::CompleteInput($code, $cursor, $null)',
        '    @{',
        `        Completions      = $result.CompletionMatches | Select-Object -First ${maxResults} ${selectProps}`,
        '        ReplacementIndex = $result.ReplacementIndex',
        '        ReplacementLength = $result.ReplacementLength',
        '    }',
        '} catch {',
        '    @{ Error = $_.Exception.Message }',
        '}',
    ].join('\n');

    try {
        const result = await runPowerShellJson<{
            Completions: CompletionItem[];
            ReplacementIndex: number;
            ReplacementLength: number;
        } | { Error: string }>(script, undefined, 10_000, 2);

        if (!result) {
            return { success: true, completions: [], replacementIndex: cursorPosition, replacementLength: 0 };
        }

        if ('Error' in result) {
            return { success: false, completions: [], replacementIndex: cursorPosition, replacementLength: 0, error: result.Error };
        }

        const out: CompletionResult = {
            success:          true,
            completions:      result.Completions || [],
            replacementIndex: result.ReplacementIndex,
            replacementLength: result.ReplacementLength,
        };

        completionsCache.set(cacheKey, out);
        return out;

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
