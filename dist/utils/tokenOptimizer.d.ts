/**
 * Token Optimizer — PowerShell EX
 *
 * Utilities that reduce the number of tokens sent to / received from AI agents.
 *
 * Rule of thumb:
 *   Every byte of MCP output costs tokens.  Smaller = cheaper = faster.
 */
/**
 * Remove ANSI escape codes from a string.
 * PowerShell always emits colour codes even with -NoProfile; they are
 * invisible to AI but waste tokens.
 */
export declare function stripAnsi(str: string): string;
export declare const DEFAULT_MAX_OUTPUT = 4000;
export declare const DEFAULT_MAX_ERROR = 1000;
/**
 * Truncate a string to `maxChars` characters.
 * Appends a compact notice so the AI knows the output was cut.
 *
 * @param str      The string to truncate
 * @param maxChars Maximum number of characters to keep (default 4 000)
 * @param label    Short label for the notice (e.g. "stdout")
 */
export declare function truncateOutput(str: string, maxChars?: number, label?: string): string;
/**
 * Compact JSON serialisation (no whitespace).
 * Saves ~20-30 % tokens compared to JSON.stringify(obj, null, 2).
 */
export declare function compactJson(obj: unknown): string;
/**
 * Pick only the specified top-level keys from an object (or array of objects).
 * If `props` is empty/undefined, returns the original value unchanged.
 */
export declare function selectProps<T extends Record<string, unknown>>(obj: T | T[], props: string[]): Partial<T> | Partial<T>[];
export interface TokenAwareResult {
    success: boolean;
    output?: string;
    error?: string;
    [key: string]: unknown;
}
/**
 * Apply all token-saving transforms to a result object before serialising:
 * 1. Strip ANSI from all string values
 * 2. Truncate `output` field
 * 3. Truncate `error` field (shorter budget)
 * 4. Return compact JSON string
 */
export declare function formatResult(result: TokenAwareResult, maxOutput?: number): string;
/**
 * Strip ANSI from every string value in a plain object (shallow).
 */
export declare function cleanObject<T extends Record<string, unknown>>(obj: T): T;
export declare class TtlCache<K, V> {
    private readonly maxSize;
    private readonly ttlMs;
    private store;
    constructor(maxSize?: number, ttlMs?: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    clear(): void;
}
/** Shared cache for get_completions results (TTL = 5 s) */
export declare const completionsCache: TtlCache<string, unknown>;
