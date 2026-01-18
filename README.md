# PowerShell MCP Server for Antigravity

🚀 **Next-generation PowerShell integration for Antigravity IDE**

This MCP (Model Context Protocol) server enables Antigravity's AI agents to write, execute, debug, and analyze PowerShell scripts autonomously.

## Features

| Tool | Description |
|------|-------------|
| `execute_powershell` | Run PowerShell code with full output capture |
| `analyze_script` | Lint code with PSScriptAnalyzer |
| `get_completions` | IntelliSense completions via TabExpansion2 |
| `get_help` | Get-Help integration for documentation |
| `invoke_cmdlet` | Execute single cmdlets with parameters |
| `list_modules` | Browse installed modules |

## Installation

```bash
npm install
npm run build
```

## Usage with Antigravity

Add to your Antigravity MCP settings:

```json
{
  "mcpServers": {
    "powershell": {
      "command": "node",
      "args": ["d:/Projects/PowerShellEX/dist/index.js"]
    }
  }
}
```

## Requirements

- Node.js 18+
- PowerShell 7+ (pwsh) or Windows PowerShell 5.1
- PSScriptAnalyzer module (for code analysis)

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
npm test       # Run tests
```

## License

MIT
