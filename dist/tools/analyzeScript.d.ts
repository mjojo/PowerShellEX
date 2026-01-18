/**
 * PSScriptAnalyzer Integration Tool
 *
 * Analyzes PowerShell code for best practices and potential issues.
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
 * Analyze PowerShell code using PSScriptAnalyzer
 */
export declare function analyzeScript(code: string, minSeverity?: string): Promise<AnalysisResult>;
