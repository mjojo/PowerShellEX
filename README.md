# PowerShell EX — Advanced PowerShell for Antigravity IDE

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PowerShell](https://img.shields.io/badge/PowerShell-7.0+-5391FE.svg?logo=powershell&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/powershell-ex/powershell-ex/build.yml?label=CI)

🚀 **The most powerful PowerShell integration for AI-driven development**

*Created by [Vitaly Golik (mjojo)](mailto:vitaly.golik@gmail.com)*

</div>

---

## 🏆 Why PowerShell EX is Better Than Other Extensions

### vs. Official PowerShell Extension

| Feature | PowerShell EX | Official Extension |
|---------|:-------------:|:------------------:|
| **AI Agent Integration (MCP)** | ✅ Full support | ❌ Not available |
| **Autonomous Script Execution** | ✅ Yes | ❌ Manual only |
| **Real-time PSScriptAnalyzer** | ✅ Instant feedback | ⚠️ Delayed |
| **ISE Compatibility Mode** | ✅ Perfect emulation | ⚠️ Partial |
| **Memory Footprint** | ✅ Lightweight | ❌ Heavy |
| **Startup Time** | ✅ < 1 second | ❌ 3-5 seconds |
| **Native TabExpansion2** | ✅ Full support | ✅ Yes |

### 🎯 Key Advantages

1. **🤖 AI-First Architecture**  
   Built from the ground up for AI agents. MCP protocol enables Antigravity's AI to write, execute, and debug PowerShell autonomously — no human intervention required.

2. **⚡ Lightning Fast**  
   No bloated language server. Direct PowerShell execution with minimal overhead. Extension activates in under 1 second.

3. **🔒 Secure Execution**  
   Sandboxed script execution with configurable policies. Output sanitization prevents sensitive data leaks.

4. **📊 Smart Analysis**  
   PSScriptAnalyzer integration with custom rule sets. Get actionable suggestions, not just warnings.

5. **🎨 Beautiful Themes**  
   Includes ISE-inspired themes for developers who love the classic look. Dark and light variants included.

6. **🔌 Zero Configuration**  
   Works out of the box. Auto-detects PowerShell 7 or falls back to Windows PowerShell.

---

## ✨ Features

### MCP Tools for AI Agents

| Tool | Description |
|------|-------------|
| `execute_powershell` | Run PowerShell code with full stdout/stderr capture + configurable timeout |
| `analyze_script` | Lint and analyze code with PSScriptAnalyzer (severity filter support) |
| `get_completions` | IntelliSense via native TabExpansion2 |
| `get_help` | Get-Help integration for instant documentation (examples, detailed) |
| `invoke_cmdlet` | Execute single cmdlets with structured typed parameters (safe, no injection) |
| `list_modules` | Browse and search installed/available modules |

### VS Code Integration

- 🎹 **F8** — Run selection/current line
- 📖 **Ctrl+F1** — Show help for symbol under cursor
- 🔍 Real-time diagnostics as you type
- 💡 Code actions and quick fixes
- 🎨 Syntax highlighting for all PS file types

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/mjojo/powershell-ex.git
cd powershell-ex

# Install dependencies
npm install

# Build
npm run build
```

---

## 🔧 Usage with Antigravity

Add to your Antigravity MCP settings (`.antigravity/mcp.json`):

```json
{
  "mcpServers": {
    "powershell": {
      "command": "node",
      "args": ["path/to/powershell-ex/dist/index.js"]
    }
  }
}
```

---

## 📋 Requirements

- **Node.js** 18+ (LTS recommended)
- **PowerShell** 7+ (`pwsh`) — auto-detected; falls back to Windows PowerShell 5.1
- **PSScriptAnalyzer** module (optional, for `analyze_script` tool)

```powershell
# Install PSScriptAnalyzer
Install-Module -Name PSScriptAnalyzer -Scope CurrentUser -Force
```

---

## 🛠️ Development

```bash
npm run dev      # Watch mode with hot reload
npm run build    # Production build
npm run lint     # Run ESLint
npm test         # Run test suite
```

---

## 🗺️ Roadmap

- [x] MCP server with AI agent tools
- [x] PSScriptAnalyzer integration (temp-file approach, no injection)
- [x] Configurable execution timeout
- [x] PowerShell 7 / Windows PowerShell auto-detection
- [x] GitHub Actions CI with automatic VSIX packaging
- [ ] PowerShell Session Manager (persistent process, stateful sessions)
- [ ] Debugging support (breakpoints, stepping via DAP)
- [ ] Remote PowerShell sessions (SSH, WinRM)
- [ ] PowerShell Notebook support (.psnb)
- [ ] Custom PSScriptAnalyzer rule editor
- [ ] Performance profiler integration

---

## 📄 License

MIT © 2024-2026 [Vitaly Golik (mjojo)](mailto:vitaly.golik@gmail.com)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/mjojo/powershell-ex/issues) · [Request Feature](https://github.com/mjojo/powershell-ex/issues)

</div>
