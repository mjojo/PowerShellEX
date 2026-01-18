"use strict";
/**
 * PowerShell EX - VS Code Extension
 *
 * Advanced PowerShell language support for VS Code / Antigravity
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const analyzeScript_1 = require("./tools/analyzeScript");
const getCompletion_1 = require("./tools/getCompletion");
const getHelp_1 = require("./tools/getHelp");
let outputChannel;
let diagnosticCollection;
let terminal;
function activate(context) {
    console.log('PowerShell EX is now active!');
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('PowerShell EX');
    // Create diagnostic collection for script analysis
    diagnosticCollection = vscode.languages.createDiagnosticCollection('powershell');
    context.subscriptions.push(diagnosticCollection);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('powershell-ex.runSelection', runSelection), vscode.commands.registerCommand('powershell-ex.runFile', runFile), vscode.commands.registerCommand('powershell-ex.showHelp', showHelp), vscode.commands.registerCommand('powershell-ex.analyzeScript', analyzeCurrentScript), vscode.commands.registerCommand('powershell-ex.toggleISEMode', toggleISEMode));
    // Register completion provider
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'powershell' }, new PowerShellCompletionProvider(), '.', '-', '$', ':'));
    // Register hover provider
    context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'powershell' }, new PowerShellHoverProvider()));
    // Analyze on save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'powershell') {
            const config = vscode.workspace.getConfiguration('powershell-ex');
            if (config.get('analysisOnSave')) {
                analyzeDocument(document);
            }
        }
    }));
}
function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════
async function runSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    const text = selection.isEmpty
        ? editor.document.lineAt(selection.active.line).text
        : editor.document.getText(selection);
    await runInTerminal(text);
}
async function runFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const filePath = editor.document.fileName;
    await runInTerminal(`& '${filePath}'`);
}
async function runInTerminal(code) {
    if (!terminal || terminal.exitStatus !== undefined) {
        const config = vscode.workspace.getConfiguration('powershell-ex');
        const psPath = config.get('powerShellPath') || 'pwsh';
        terminal = vscode.window.createTerminal({
            name: 'PowerShell EX',
            shellPath: psPath
        });
    }
    terminal.show();
    terminal.sendText(code);
}
async function showHelp() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
    if (!wordRange)
        return;
    const word = editor.document.getText(wordRange);
    const help = await (0, getHelp_1.getHelp)(word, true, false);
    outputChannel.clear();
    outputChannel.appendLine(`Help for: ${word}`);
    outputChannel.appendLine('═'.repeat(50));
    outputChannel.appendLine(help);
    outputChannel.show();
}
async function analyzeCurrentScript() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    await analyzeDocument(editor.document);
    vscode.window.showInformationMessage('Script analysis complete');
}
async function analyzeDocument(document) {
    const text = document.getText();
    const result = await (0, analyzeScript_1.analyzeScript)(text);
    const diagnostics = [];
    for (const diag of result.diagnostics) {
        const line = Math.max(0, (diag.line || 1) - 1);
        const range = new vscode.Range(line, 0, line, 1000);
        const severity = diag.severity === 'Error'
            ? vscode.DiagnosticSeverity.Error
            : diag.severity === 'Warning'
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Information;
        const diagnostic = new vscode.Diagnostic(range, diag.message, severity);
        diagnostic.source = 'PSScriptAnalyzer';
        diagnostic.code = diag.ruleName;
        diagnostics.push(diagnostic);
    }
    diagnosticCollection.set(document.uri, diagnostics);
}
async function toggleISEMode() {
    const config = vscode.workspace.getConfiguration();
    const currentTheme = config.get('workbench.colorTheme');
    if (currentTheme?.includes('ISE')) {
        await config.update('workbench.colorTheme', 'PowerShell Dark', vscode.ConfigurationTarget.Global);
    }
    else {
        await config.update('workbench.colorTheme', 'PowerShell ISE', vscode.ConfigurationTarget.Global);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════
class PowerShellCompletionProvider {
    async provideCompletionItems(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const result = await (0, getCompletion_1.getCompletions)(text, offset);
        return result.completions.map(item => {
            const completion = new vscode.CompletionItem(item.text);
            completion.detail = item.toolTip;
            completion.kind = this.mapCompletionType(item.type);
            return completion;
        });
    }
    mapCompletionType(type) {
        switch (type) {
            case 'Command': return vscode.CompletionItemKind.Function;
            case 'Variable': return vscode.CompletionItemKind.Variable;
            case 'ParameterName': return vscode.CompletionItemKind.Property;
            case 'Type': return vscode.CompletionItemKind.Class;
            case 'Namespace': return vscode.CompletionItemKind.Module;
            case 'Property': return vscode.CompletionItemKind.Property;
            case 'Method': return vscode.CompletionItemKind.Method;
            default: return vscode.CompletionItemKind.Text;
        }
    }
}
class PowerShellHoverProvider {
    async provideHover(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return null;
        const word = document.getText(wordRange);
        // Check if it looks like a cmdlet (Verb-Noun pattern)
        if (!/^[A-Z][a-z]+-[A-Z][a-z]+/.test(word)) {
            return null;
        }
        const help = await (0, getHelp_1.getHelp)(word, false, false);
        if (help && !help.includes('No help found')) {
            return new vscode.Hover(new vscode.MarkdownString(`**${word}**\n\n${help.substring(0, 500)}...`));
        }
        return null;
    }
}
//# sourceMappingURL=extension.js.map