"use strict";
/**
 * PSScriptAnalyzer Integration Tool
 *
 * Analyzes PowerShell code for best practices and potential issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeScript = analyzeScript;
const powershell_1 = require("../utils/powershell");
/**
 * Analyze PowerShell code using PSScriptAnalyzer
 */
async function analyzeScript(code, minSeverity) {
    // Escape the code for embedding in PowerShell
    const escapedCode = code
        .replace(/'/g, "''")
        .replace(/`/g, '``');
    const severityFilter = minSeverity
        ? `| Where-Object { $_.Severity -ge '${minSeverity}' }`
        : '';
    const script = `
    $code = '${escapedCode}'
    try {
      $results = Invoke-ScriptAnalyzer -ScriptDefinition $code ${severityFilter}
      $results | Select-Object RuleName, Severity, Message, Line, Column
    } catch {
      @{ Error = $_.Exception.Message }
    }
  `;
    try {
        const results = await (0, powershell_1.runPowerShellJson)(script);
        if (!results) {
            return {
                success: true,
                diagnostics: [],
                summary: { errors: 0, warnings: 0, information: 0 },
            };
        }
        if ('Error' in results) {
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
        return {
            success: true,
            diagnostics,
            summary,
        };
    }
    catch (error) {
        return {
            success: false,
            diagnostics: [],
            summary: { errors: 0, warnings: 0, information: 0 },
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
//# sourceMappingURL=analyzeScript.js.map