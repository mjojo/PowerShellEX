"use strict";
/**
 * PSScriptAnalyzer Integration Tool
 *
 * Analyzes PowerShell code for best practices and potential issues.
 * Uses a temp-file approach so there are no escaping / injection issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeScript = analyzeScript;
const powershell_1 = require("../utils/powershell");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
/**
 * Analyze PowerShell code using PSScriptAnalyzer.
 *
 * The script under analysis is written to a temporary file so we avoid all
 * quote-escaping / injection issues that come with embedding code in a
 * -ScriptDefinition string parameter.
 *
 * @param code        PowerShell source code to analyse
 * @param minSeverity Optional minimum severity filter ('Error' | 'Warning' | 'Information')
 */
async function analyzeScript(code, minSeverity) {
    // Write the script under analysis to a temp file (no escaping needed)
    const scriptFile = (0, path_1.join)((0, os_1.tmpdir)(), `psex_analyze_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);
    try {
        (0, fs_1.writeFileSync)(scriptFile, code, 'utf8');
        // Escape the path for PowerShell single-quote string
        const escapedPath = scriptFile.replace(/'/g, "''");
        // Build severity filter clause
        const severityClause = minSeverity
            ? `| Where-Object { $_.Severity.ToString() -eq '${minSeverity}' }`
            : '';
        // Select properties we care about, with lowercase keys for TypeScript
        const selectProps = [
            "@{N='ruleName';E={$_.RuleName}}",
            "@{N='severity';E={$_.Severity.ToString()}}",
            "@{N='message';E={$_.Message}}",
            "@{N='line';E={$_.Line}}",
            "@{N='column';E={$_.Column}}",
        ].join(',');
        const psScript = [
            'try {',
            `    $results = Invoke-ScriptAnalyzer -Path '${escapedPath}' ${severityClause}`,
            '    if ($null -eq $results) {',
            '        @()',
            '    } else {',
            `        $results | Select-Object ${selectProps}`,
            '    }',
            '} catch {',
            '    @{ Error = $_.Exception.Message }',
            '}',
        ].join('\n');
        const results = await (0, powershell_1.runPowerShellJson)(psScript);
        if (!results) {
            return {
                success: true,
                diagnostics: [],
                summary: { errors: 0, warnings: 0, information: 0 },
            };
        }
        if (!Array.isArray(results) && 'Error' in results) {
            return {
                success: false,
                diagnostics: [],
                summary: { errors: 0, warnings: 0, information: 0 },
                error: results.Error,
            };
        }
        const diagnostics = Array.isArray(results) ? results : [results];
        const summary = {
            errors: diagnostics.filter(d => d.severity === 'Error').length,
            warnings: diagnostics.filter(d => d.severity === 'Warning').length,
            information: diagnostics.filter(d => d.severity === 'Information').length,
        };
        return { success: true, diagnostics, summary };
    }
    catch (error) {
        return {
            success: false,
            diagnostics: [],
            summary: { errors: 0, warnings: 0, information: 0 },
            error: error instanceof Error ? error.message : String(error),
        };
    }
    finally {
        try {
            (0, fs_1.unlinkSync)(scriptFile);
        }
        catch { /* best-effort cleanup */ }
    }
}
//# sourceMappingURL=analyzeScript.js.map