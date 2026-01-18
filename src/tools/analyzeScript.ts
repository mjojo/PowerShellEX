/**
 * PSScriptAnalyzer Integration Tool
 * 
 * Analyzes PowerShell code for best practices and potential issues.
 */

import { runPowerShellJson } from '../utils/powershell';

export interface DiagnosticRecord {
    ruleName: string;
    severity: 'Error' | 'Warning' | 'Information';
    message: string;
    line: number;
    column: number;
    scriptName?: string;
    ruleId?: string;
}

export interface AnalysisResult {
    success: boolean;
    diagnostics: DiagnosticRecord[];
    summary: {
        errors: number;
        warnings: number;
        information: number;
    };
    error?: string;
}

/**
 * Analyze PowerShell code using PSScriptAnalyzer
 */
export async function analyzeScript(
    code: string,
    minSeverity?: string
): Promise<AnalysisResult> {
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
        const results = await runPowerShellJson<DiagnosticRecord[] | { Error: string }>(script);

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
    } catch (error) {
        return {
            success: false,
            diagnostics: [],
            summary: { errors: 0, warnings: 0, information: 0 },
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
