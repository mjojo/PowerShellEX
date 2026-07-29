#!/usr/bin/env node
/**
 * PowerShell MCP Server for Antigravity
 * Enables AI agent to execute PowerShell commands automatically
 *
 * @author (mjojo)
 * @license MIT
 * @copyright 2024-2026 Vitaly Golik
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { executePowerShell }  from './tools/executeScript';
import { analyzeScript }      from './tools/analyzeScript';
import { getCompletions }     from './tools/getCompletion';
import { getHelp }            from './tools/getHelp';
import { invokeCmdlet }       from './tools/invokeCmdlet';
import { listModules }        from './resources/modules';
import { getEnvironmentInfo } from './resources/environment';

const server = new Server(
    { name: 'powershell-mcp-server', version: '1.1.1' },
    { capabilities: { tools: {}, resources: {} } }
);

// ─────────────────────────────────────────────────────────────────────────────
// TOOLS — List
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'execute_powershell',
            description: 'Execute arbitrary PowerShell code and return stdout/stderr/exitCode',
            inputSchema: {
                type: 'object',
                properties: {
                    code:             { type: 'string',  description: 'PowerShell code to execute' },
                    workingDirectory: { type: 'string',  description: 'Working directory (optional)' },
                    timeout:          { type: 'number',  description: 'Timeout in milliseconds (default 30000)' },
                },
                required: ['code'],
            },
        },
        {
            name: 'analyze_script',
            description: 'Analyze PowerShell code with PSScriptAnalyzer and return diagnostics',
            inputSchema: {
                type: 'object',
                properties: {
                    code:        { type: 'string', description: 'PowerShell code to analyze' },
                    minSeverity: { type: 'string', description: 'Minimum severity: Error | Warning | Information', enum: ['Error', 'Warning', 'Information'] },
                },
                required: ['code'],
            },
        },
        {
            name: 'get_completions',
            description: 'Get IntelliSense completions at a cursor position using native TabExpansion2',
            inputSchema: {
                type: 'object',
                properties: {
                    code:           { type: 'string', description: 'PowerShell code context' },
                    cursorPosition: { type: 'number', description: 'Cursor offset (character index)' },
                },
                required: ['code', 'cursorPosition'],
            },
        },
        {
            name: 'get_help',
            description: 'Get PowerShell help documentation for a cmdlet or topic',
            inputSchema: {
                type: 'object',
                properties: {
                    topic:    { type: 'string',  description: 'Cmdlet or topic name' },
                    examples: { type: 'boolean', description: 'Include usage examples' },
                    detailed: { type: 'boolean', description: 'Show detailed help' },
                },
                required: ['topic'],
            },
        },
        {
            name: 'invoke_cmdlet',
            description: 'Execute a single PowerShell cmdlet with structured named parameters and return JSON result',
            inputSchema: {
                type: 'object',
                properties: {
                    cmdlet: {
                        type: 'string',
                        description: 'Cmdlet name (e.g. "Get-Process", "Set-Content")',
                    },
                    parameters: {
                        type: 'object',
                        description: 'Key/value map of parameter names to values',
                        additionalProperties: true,
                    },
                    workingDirectory: { type: 'string', description: 'Working directory (optional)' },
                },
                required: ['cmdlet'],
            },
        },
        {
            name: 'list_modules',
            description: 'List installed PowerShell modules, optionally filtered by name pattern',
            inputSchema: {
                type: 'object',
                properties: {
                    filter:        { type: 'string',  description: 'Name filter pattern (wildcard)' },
                    listAvailable: { type: 'boolean', description: 'Include modules not yet imported' },
                },
            },
        },
    ],
}));

// ─────────────────────────────────────────────────────────────────────────────
// TOOLS — Call
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {

            case 'execute_powershell': {
                const result = await executePowerShell(
                    args?.code,
                    args?.workingDirectory,
                    args?.timeout
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }

            case 'analyze_script': {
                const result = await analyzeScript(args?.code, args?.minSeverity);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }

            case 'get_completions': {
                const result = await getCompletions(args?.code, args?.cursorPosition);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }

            case 'get_help': {
                const result = await getHelp(args?.topic, args?.examples ?? false, args?.detailed ?? false);
                return { content: [{ type: 'text', text: result }] };
            }

            case 'invoke_cmdlet': {
                const result = await invokeCmdlet(
                    args?.cmdlet,
                    args?.parameters ?? {},
                    args?.workingDirectory
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }

            case 'list_modules': {
                const result = await listModules(args?.filter, args?.listAvailable ?? true);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: any) {
        return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES — List
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
        {
            uri:      'powershell://environment',
            name:     'PowerShell Environment',
            mimeType: 'application/json',
            description: 'Current PowerShell version, edition, OS, execution policy, etc.',
        },
        {
            uri:      'powershell://modules',
            name:     'Installed Modules',
            mimeType: 'application/json',
            description: 'List of all available PowerShell modules with versions',
        },
    ],
}));

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES — Read
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
    const uri: string = request.params.uri;

    if (uri === 'powershell://environment') {
        const info = await getEnvironmentInfo();
        return {
            contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(info, null, 2),
            }],
        };
    }

    if (uri === 'powershell://modules') {
        const modules = await listModules(undefined, true);
        return {
            contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(modules, null, 2),
            }],
        };
    }

    throw new Error(`Unknown resource: ${uri}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('PowerShell MCP Server v1.1.1 running');
}

main().catch(console.error);
