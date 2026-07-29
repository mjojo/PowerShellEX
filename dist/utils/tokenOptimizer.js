"use strict";
/**
 * Token Optimizer — PowerShell EX
 *
 * Utilities that reduce the number of tokens sent to / received from AI agents.
 *
 * Rule of thumb:
 *   Every byte of MCP output costs tokens.  Smaller = cheaper = faster.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.completionsCache = exports.TtlCache = exports.DEFAULT_MAX_ERROR = exports.DEFAULT_MAX_OUTPUT = void 0;
exports.stripAnsi = stripAnsi;
exports.truncateOutput = truncateOutput;
exports.compactJson = compactJson;
exports.selectProps = selectProps;
exports.formatResult = formatResult;
exports.cleanObject = cleanObject;
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
function stripAnsi(str) {
    return str.replace(ANSI_REGEX, '');
}
// ─────────────────────────────────────────────────────────────────────────────
// Output truncation
// ─────────────────────────────────────────────────────────────────────────────
exports.DEFAULT_MAX_OUTPUT = 4_000; // chars
exports.DEFAULT_MAX_ERROR = 1_000; // chars
/**
 * Truncate a string to `maxChars` characters.
 * Appends a compact notice so the AI knows the output was cut.
 *
 * @param str      The string to truncate
 * @param maxChars Maximum number of characters to keep (default 4 000)
 * @param label    Short label for the notice (e.g. "stdout")
 */
function truncateOutput(str, maxChars = exports.DEFAULT_MAX_OUTPUT, label = 'output') {
    if (str.length <= maxChars) {
        return str;
    }
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
function compactJson(obj) {
    return JSON.stringify(obj);
}
// ─────────────────────────────────────────────────────────────────────────────
// Object field selection
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Pick only the specified top-level keys from an object (or array of objects).
 * If `props` is empty/undefined, returns the original value unchanged.
 */
function selectProps(obj, props) {
    if (!props || props.length === 0) {
        return obj;
    }
    const pick = (o) => {
        const result = {};
        for (const key of props) {
            if (key in o) {
                result[key] = o[key];
            }
        }
        return result;
    };
    return Array.isArray(obj) ? obj.map(pick) : pick(obj);
}
/**
 * Apply all token-saving transforms to a result object before serialising:
 * 1. Strip ANSI from all string values
 * 2. Truncate `output` field
 * 3. Truncate `error` field (shorter budget)
 * 4. Return compact JSON string
 */
function formatResult(result, maxOutput = exports.DEFAULT_MAX_OUTPUT) {
    const cleaned = { ...result };
    if (typeof cleaned.output === 'string') {
        cleaned.output = truncateOutput(stripAnsi(cleaned.output), maxOutput, 'stdout');
    }
    if (typeof cleaned.error === 'string') {
        const stripped = stripAnsi(cleaned.error);
        // Only include error if non-empty after stripping
        if (stripped.trim().length > 0) {
            cleaned.error = truncateOutput(stripped, exports.DEFAULT_MAX_ERROR, 'stderr');
        }
        else {
            delete cleaned.error;
        }
    }
    return compactJson(cleaned);
}
/**
 * Strip ANSI from every string value in a plain object (shallow).
 */
function cleanObject(obj) {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
        if (typeof result[key] === 'string') {
            result[key] = stripAnsi(result[key]);
        }
    }
    return result;
}
class TtlCache {
    maxSize;
    ttlMs;
    store = new Map();
    constructor(maxSize = 50, ttlMs = 5_000) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value) {
        if (this.store.size >= this.maxSize) {
            // Evict oldest
            const firstKey = this.store.keys().next().value;
            if (firstKey !== undefined) {
                this.store.delete(firstKey);
            }
        }
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }
    clear() { this.store.clear(); }
}
exports.TtlCache = TtlCache;
/** Shared cache for get_completions results (TTL = 5 s) */
exports.completionsCache = new TtlCache(100, 5_000);
//# sourceMappingURL=tokenOptimizer.js.map