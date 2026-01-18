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

import { executePowerShell } from './tools/executeScript';
import { analyzeScript } from './tools/analyzeScript';
import { getCompletions } from './tools/getCompletion';
import { getHelp } from './tools/getHelp';
import { listModules } from './resources/modules';
import { getEnvironmentInfo } from './resources/environment';

const server = new Server(
    { name: 'powershell-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {} } }
);

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'execute_powershell',
            description: 'Execute PowerShell code and return output',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'PowerShell code to execute' },
                    workingDirectory: { type: 'string', description: 'Working directory' },
                },
                required: ['code'],
            },
        },
        {
            name: 'analyze_script',
            description: 'Analyze PowerShell code with PSScriptAnalyzer',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'PowerShell code to analyze' },
                },
                required: ['code'],
            },
        },
        {
            name: 'get_help',
            description: 'Get PowerShell help for a cmdlet',
            inputSchema: {
                type: 'object',
                properties: {
                    topic: { type: 'string', description: 'Cmdlet or topic name' },
                    examples: { type: 'boolean', description: 'Include examples' },
                },
                required: ['topic'],
            },
        },
        {
            name: 'list_modules',
            description: 'List installed PowerShell modules',
            inputSchema: {
                type: 'object',
                properties: {
                    filter: { type: 'string', description: 'Filter pattern' },
                },
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'execute_powershell': {
                const result = await executePowerShell(args?.code, args?.workingDirectory);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'analyze_script': {
                const result = await analyzeScript(args?.code);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_help': {
                const result = await getHelp(args?.topic, args?.examples, false);
                return { content: [{ type: 'text', text: result }] };
            }
            case 'list_modules': {
                const result = await listModules(args?.filter, true);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
        { uri: 'powershell://environment', name: 'PowerShell Environment', mimeType: 'application/json' },
    ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
    if (request.params.uri === 'powershell://environment') {
        const info = await getEnvironmentInfo();
        return { contents: [{ uri: request.params.uri, mimeType: 'application/json', text: JSON.stringify(info, null, 2) }] };
    }
    throw new Error(`Unknown resource: ${request.params.uri}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('PowerShell MCP Server running');
}

main().catch(console.error);
