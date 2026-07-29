#!/usr/bin/env node
"use strict";
/**
 * PowerShell MCP Server for Antigravity — v1.2.0
 * Token-optimised: compact JSON, ANSI-free output, truncated responses.
 *
 * @author (mjojo)
 * @license MIT
 * @copyright 2024-2026 Vitaly Golik
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const executeScript_1 = require("./tools/executeScript");
const analyzeScript_1 = require("./tools/analyzeScript");
const getCompletion_1 = require("./tools/getCompletion");
const getHelp_1 = require("./tools/getHelp");
const invokeCmdlet_1 = require("./tools/invokeCmdlet");
const modules_1 = require("./resources/modules");
const environment_1 = require("./resources/environment");
const tokenOptimizer_1 = require("./utils/tokenOptimizer");
const server = new index_js_1.Server({ name: 'powershell-mcp-server', version: '1.2.0' }, { capabilities: { tools: {}, resources: {} } });
// ─────────────────────────────────────────────────────────────────────────────
// TOOLS — List  (short descriptions = fewer input tokens per call)
// ─────────────────────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'execute_powershell',
            description: 'Run PowerShell code. Returns stdout/stderr/exitCode. ANSI stripped. Output capped at maxOutput chars.',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'PS code to run' },
                    workingDirectory: { type: 'string', description: 'Working dir (optional)' },
                    timeout: { type: 'number', description: 'Timeout ms (default 30000)' },
                    maxOutput: { type: 'number', description: `Max output chars (default ${tokenOptimizer_1.DEFAULT_MAX_OUTPUT}). Increase for large outputs.` },
                },
                required: ['code'],
            },
        },
        {
            name: 'analyze_script',
            description: 'Lint PowerShell code with PSScriptAnalyzer. Returns diagnostics array.',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'PS code to analyze' },
                    minSeverity: { type: 'string', description: 'Error|Warning|Information', enum: ['Error', 'Warning', 'Information'] },
                },
                required: ['code'],
            },
        },
        {
            name: 'get_completions',
            description: 'TabExpansion2 completions at cursor. Cached 5 s. Returns up to maxResults items.',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'PS code context' },
                    cursorPosition: { type: 'number', description: 'Cursor char offset' },
                    maxResults: { type: 'number', description: 'Max completions to return (default 30)' },
                },
                required: ['code', 'cursorPosition'],
            },
        },
        {
            name: 'get_help',
            description: 'Get-Help for a cmdlet or topic.',
            inputSchema: {
                type: 'object',
                properties: {
                    topic: { type: 'string', description: 'Cmdlet or topic name' },
                    examples: { type: 'boolean', description: 'Include examples' },
                    detailed: { type: 'boolean', description: 'Detailed help' },
                },
                required: ['topic'],
            },
        },
        {
            name: 'invoke_cmdlet',
            description: 'Run a cmdlet with typed params. Token-safe: depth=2, first=50, smart field selection. Use selectProperties to limit output further.',
            inputSchema: {
                type: 'object',
                properties: {
                    cmdlet: { type: 'string', description: 'Cmdlet name (e.g. Get-Process)' },
                    parameters: { type: 'object', description: 'Parameter name→value map', additionalProperties: true },
                    workingDirectory: { type: 'string', description: 'Working dir (optional)' },
                    selectProperties: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Return only these properties. Omit for smart defaults.',
                    },
                    depth: { type: 'number', description: 'JSON depth (default 2). Higher = more tokens.' },
                    first: { type: 'number', description: 'Limit to first N results (default 50).' },
                },
                required: ['cmdlet'],
            },
        },
        {
            name: 'list_modules',
            description: 'List PS modules (name, version, description). Path excluded by default.',
            inputSchema: {
                type: 'object',
                properties: {
                    filter: { type: 'string', description: 'Wildcard name filter' },
                    listAvailable: { type: 'boolean', description: 'Include unimported modules (default true)' },
                    includePath: { type: 'boolean', description: 'Include file path (more tokens)' },
                },
            },
        },
    ],
}));
// ─────────────────────────────────────────────────────────────────────────────
// TOOLS — Call  (all responses use compactJson)
// ─────────────────────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'execute_powershell': {
                const result = await (0, executeScript_1.executePowerShell)(args?.code, args?.workingDirectory, args?.timeout, args?.maxOutput);
                return { content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)(result) }] };
            }
            case 'analyze_script': {
                const result = await (0, analyzeScript_1.analyzeScript)(args?.code, args?.minSeverity);
                return { content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)(result) }] };
            }
            case 'get_completions': {
                const result = await (0, getCompletion_1.getCompletions)(args?.code, args?.cursorPosition, args?.maxResults);
                return { content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)(result) }] };
            }
            case 'get_help': {
                // Help is plain text — truncate to 3000 chars (enough for synopsis + syntax)
                const result = await (0, getHelp_1.getHelp)(args?.topic, args?.examples ?? false, args?.detailed ?? false);
                const truncated = result.length > 3000
                    ? result.slice(0, 3000) + '\n[...truncated. Use detailed=true or examples=true for specific sections]'
                    : result;
                return { content: [{ type: 'text', text: truncated }] };
            }
            case 'invoke_cmdlet': {
                const result = await (0, invokeCmdlet_1.invokeCmdlet)(args?.cmdlet, args?.parameters ?? {}, args?.workingDirectory, args?.selectProperties, args?.depth, args?.first);
                return { content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)(result) }] };
            }
            case 'list_modules': {
                const result = await (0, modules_1.listModules)(args?.filter, args?.listAvailable ?? true, args?.includePath ?? false);
                return { content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)(result) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: (0, tokenOptimizer_1.compactJson)({ error: error.message }) }],
            isError: true,
        };
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
    resources: [
        { uri: 'powershell://environment', name: 'PS Environment', mimeType: 'application/json' },
        { uri: 'powershell://modules', name: 'Installed Modules', mimeType: 'application/json' },
    ],
}));
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === 'powershell://environment') {
        const info = await (0, environment_1.getEnvironmentInfo)();
        return { contents: [{ uri, mimeType: 'application/json', text: (0, tokenOptimizer_1.compactJson)(info) }] };
    }
    if (uri === 'powershell://modules') {
        const modules = await (0, modules_1.listModules)(undefined, true, false);
        return { contents: [{ uri, mimeType: 'application/json', text: (0, tokenOptimizer_1.compactJson)(modules) }] };
    }
    throw new Error(`Unknown resource: ${uri}`);
});
// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('PowerShell MCP Server v1.2.0 — token-optimised');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map