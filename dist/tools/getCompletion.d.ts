/**
 * IntelliSense Completions Tool
 *
 * Provides code completions using PowerShell's TabExpansion2.
 */
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
export declare function getCompletions(code: string, cursorPosition: number): Promise<CompletionResult>;
