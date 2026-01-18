#!/usr/bin/env node
"use strict";
/**
 * PowerShell MCP Server for Antigravity
 * Enables AI agent to execute PowerShell commands automatically
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const executeScript_1 = require("./tools/executeScript");
const analyzeScript_1 = require("./tools/analyzeScript");
const getHelp_1 = require("./tools/getHelp");
const modules_1 = require("./resources/modules");
const environment_1 = require("./resources/environment");
const server = new index_js_1.Server({ name: 'powershell-mcp-server', version: '1.0.0' }, { capabilities: { tools: {}, resources: {} } });
// Tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'execute_powershell': {
                const result = await (0, executeScript_1.executePowerShell)(args?.code, args?.workingDirectory);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'analyze_script': {
                const result = await (0, analyzeScript_1.analyzeScript)(args?.code);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_help': {
                const result = await (0, getHelp_1.getHelp)(args?.topic, args?.examples, false);
                return { content: [{ type: 'text', text: result }] };
            }
            case 'list_modules': {
                const result = await (0, modules_1.listModules)(args?.filter, true);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
});
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
    resources: [
        { uri: 'powershell://environment', name: 'PowerShell Environment', mimeType: 'application/json' },
    ],
}));
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'powershell://environment') {
        const info = await (0, environment_1.getEnvironmentInfo)();
        return { contents: [{ uri: request.params.uri, mimeType: 'application/json', text: JSON.stringify(info, null, 2) }] };
    }
    throw new Error(`Unknown resource: ${request.params.uri}`);
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('PowerShell MCP Server running');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map