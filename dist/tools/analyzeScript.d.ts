/**
 * PSScriptAnalyzer Integration Tool
 *
 * Analyzes PowerShell code for best practices and potential issues.
 * Uses a temp-file approach so there are no escaping / injection issues.
 */
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
 * Analyze PowerShell code using PSScriptAnalyzer.
 *
 * The script under analysis is written to a temporary file so we avoid all
 * quote-escaping / injection issues that come with embedding code in a
 * -ScriptDefinition string parameter.
 *
 * @param code        PowerShell source code to analyse
 * @param minSeverity Optional minimum severity filter ('Error' | 'Warning' | 'Information')
 */
export declare function analyzeScript(code: string, minSeverity?: string): Promise<AnalysisResult>;
