/**
 * Token Optimizer — PowerShell EX
 *
 * Utilities that reduce the number of tokens sent to / received from AI agents.
 *
 * Rule of thumb:
 *   Every byte of MCP output costs tokens.  Smaller = cheaper = faster.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ANSI / VT-100 escape codes
// ─────────────────────────────────────────────────────────────────────────────

/** Regex that matches all ANSI / VT escape sequences */
const ANSI_REGEX = /[\u001b\u009b](?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

/**
 * Remove ANSI escape codes from a string.
 * PowerShell always emits colour codes even with -NoProfile; they are
 * invisible to AI but waste tokens.
 */
export function stripAnsi(str: string): string {
    return str.replace(ANSI_REGEX, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Output truncation
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MAX_OUTPUT = 4_000;   // chars
export const DEFAULT_MAX_ERROR  = 1_000;   // chars

/**
 * Truncate a string to `maxChars` characters.
 * Appends a compact notice so the AI knows the output was cut.
 *
 * @param str      The string to truncate
 * @param maxChars Maximum number of characters to keep (default 4 000)
 * @param label    Short label for the notice (e.g. "stdout")
 */
export function truncateOutput(
    str: string,
    maxChars: number = DEFAULT_MAX_OUTPUT,
    label: string = 'output'
): string {
    if (str.length <= maxChars) { return str; }
    const kept = str.slice(0, maxChars);
    const dropped = str.length - maxChars;
    return `${kept}\n[${label} truncated: +${dropped} chars hidden. Pass maxOutput=${str.length} to see all]`;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON serialisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compact JSON serialisation (no whitespace).
 * Saves ~20-30 % tokens compared to JSON.stringify(obj, null, 2).
 */
export function compactJson(obj: unknown): string {
    return JSON.stringify(obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// Object field selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick only the specified top-level keys from an object (or array of objects).
 * If `props` is empty/undefined, returns the original value unchanged.
 */
export function selectProps<T extends Record<string, unknown>>(
    obj: T | T[],
    props: string[]
): Partial<T> | Partial<T>[] {
    if (!props || props.length === 0) { return obj as Partial<T> | Partial<T>[]; }

    const pick = (o: T): Partial<T> => {
        const result: Partial<T> = {};
        for (const key of props) {
            if (key in o) {
                (result as Record<string, unknown>)[key] = o[key];
            }
        }
        return result;
    };

    return Array.isArray(obj) ? obj.map(pick) : pick(obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// Result formatters
// ─────────────────────────────────────────────────────────────────────────────

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
export function formatResult(
    result: TokenAwareResult,
    maxOutput: number = DEFAULT_MAX_OUTPUT
): string {
    const cleaned: Record<string, unknown> = { ...result };

    if (typeof cleaned.output === 'string') {
        cleaned.output = truncateOutput(
            stripAnsi(cleaned.output),
            maxOutput,
            'stdout'
        );
    }

    if (typeof cleaned.error === 'string') {
        const stripped = stripAnsi(cleaned.error);
        // Only include error if non-empty after stripping
        if (stripped.trim().length > 0) {
            cleaned.error = truncateOutput(stripped, DEFAULT_MAX_ERROR, 'stderr');
        } else {
            delete cleaned.error;
        }
    }

    return compactJson(cleaned);
}

/**
 * Strip ANSI from every string value in a plain object (shallow).
 */
export function cleanObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj } as Record<string, unknown>;
    for (const key of Object.keys(result)) {
        if (typeof result[key] === 'string') {
            result[key] = stripAnsi(result[key] as string);
        }
    }
    return result as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple LRU cache for completions
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class TtlCache<K, V> {
    private store = new Map<K, CacheEntry<V>>();

    constructor(
        private readonly maxSize: number = 50,
        private readonly ttlMs: number = 5_000
    ) {}

    get(key: K): V | undefined {
        const entry = this.store.get(key);
        if (!entry) { return undefined; }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key: K, value: V): void {
        if (this.store.size >= this.maxSize) {
            // Evict oldest
            const firstKey = this.store.keys().next().value;
            if (firstKey !== undefined) { this.store.delete(firstKey); }
        }
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }

    clear(): void { this.store.clear(); }
}

/** Shared cache for get_completions results (TTL = 5 s) */
export const completionsCache = new TtlCache<string, unknown>(100, 5_000);
