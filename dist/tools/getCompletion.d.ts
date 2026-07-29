/**
 * IntelliSense Completions Tool
 *
 * Provides code completions using PowerShell's TabExpansion2.
 * TTL cache (5 s) prevents redundant process spawns for the same context.
 */
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
export declare function getCompletions(code: string, cursorPosition: number, maxResults?: number): Promise<CompletionResult>;
