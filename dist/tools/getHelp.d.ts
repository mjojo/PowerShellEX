/**
 * Get-Help Integration Tool
 *
 * Retrieves PowerShell help documentation for cmdlets and topics.
 */
/**
 * Get help documentation for a PowerShell topic
 */
export declare function getHelp(topic: string, showExamples?: boolean, detailed?: boolean): Promise<string>;
/**
 * Get synopsis only for a cmdlet (quick help)
 */
export declare function getQuickHelp(cmdlet: string): Promise<string>;
