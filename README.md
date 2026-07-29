# PowerShell EX — Advanced PowerShell for VS Code & Antigravity IDE

<div align="center">

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PowerShell](https://img.shields.io/badge/PowerShell-7.0+-5391FE.svg?logo=powershell&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/mjojo/PowerShellEX/build.yml?label=CI)

🚀 **The most powerful PowerShell integration for VS Code and AI-driven development**

*Created by [Vitaly Golik (mjojo)](mailto:vitaly.golik@gmail.com)*

</div>

---

## 🏆 Why PowerShell EX is Better Than Other Extensions

### vs. Official PowerShell Extension

| Feature | PowerShell EX | Official Extension |
|---------|:-------------:|:------------------:|
| **AI Agent Integration (MCP)** | ✅ Full support | ❌ Not available |
| **Token-Optimised Output** | ✅ 85–99% savings | ❌ Not applicable |
| **Autonomous Script Execution** | ✅ Yes | ❌ Manual only |
| **Real-time PSScriptAnalyzer** | ✅ Instant feedback | ⚠️ Delayed |
| **ISE Compatibility Mode** | ✅ Perfect emulation | ⚠️ Partial |
| **Memory Footprint** | ✅ Lightweight | ❌ Heavy |
| **Startup Time** | ✅ < 1 second | ❌ 3-5 seconds |
| **Native TabExpansion2** | ✅ Full support + cache | ✅ Yes |

### 🎯 Key Advantages

1. **💰 Token-Optimised for AI Agents**  
   Every byte returned to an AI costs money. PowerShell EX aggressively minimises output:
   - ANSI escape codes stripped automatically (invisible to AI, waste tokens)
   - `invoke_cmdlet` returns only meaningful fields — `Get-Process` goes from **911 KB → ~300 bytes** (−99.9%)
   - Compact JSON serialisation (no pretty-print whitespace)
   - Output capped at configurable `maxOutput` chars (default 4 000)
   - Completions cached for 5 s — no redundant process spawns

2. **🤖 AI-First Architecture**  
   Built from the ground up for AI agents. MCP protocol enables Antigravity's AI to write, execute, and debug PowerShell autonomously — no human intervention required.

3. **⚡ Lightning Fast**  
   No bloated language server. Direct PowerShell execution with minimal overhead. Extension activates in under 1 second.

4. **🔒 Secure Execution**  
   Scripts are written to temp files — no shell injection possible. Input validation on all cmdlet names.

5. **📊 Smart Analysis**  
   PSScriptAnalyzer integration via temp-file approach. Get actionable suggestions, not just warnings.

6. **🎨 Beautiful Themes**  
   ISE-inspired themes for developers who love the classic look. Dark and light variants included.

7. **🔌 Zero Configuration**  
   Works out of the box. Auto-detects PowerShell 7 or falls back to Windows PowerShell 5.1.

---

## ✨ Features

### MCP Tools for AI Agents

| Tool | Description | Key Params |
|------|-------------|-----------|
| `execute_powershell` | Run PS code. ANSI stripped, output capped. | `maxOutput`, `timeout` |
| `analyze_script` | Lint with PSScriptAnalyzer. | `minSeverity` |
| `get_completions` | TabExpansion2 completions. TTL-cached 5 s. | `maxResults` |
| `get_help` | Get-Help for any cmdlet/topic. | `examples`, `detailed` |
| `invoke_cmdlet` | Safe cmdlet execution. depth=2, smart fields. | `selectProperties`, `depth`, `first` |
| `list_modules` | Browse installed modules. Path excluded by default. | `filter`, `includePath` |

### MCP Resources

| Resource | Description |
|----------|-------------|
| `powershell://environment` | PS version, OS, execution policy, current user |
| `powershell://modules` | Full list of available modules |

### Token Savings — Benchmarks

| Operation | Before v1.2.0 | After v1.2.0 | Savings |
|-----------|:-------------:|:------------:|:-------:|
| `invoke_cmdlet Get-Process` | 911 KB | ~300 bytes | **−99.9%** |
| `list_modules` (66 modules) | 19 KB | ~3 KB | **−84%** |
| ANSI codes in any output | +30% overhead | 0 | **−100%** |
| `ListTools` descriptions | ~2 KB | ~700 bytes | **−65%** |

### VS Code Integration

- 🎹 **F8** — Run selection / current line in PS terminal
- 📖 **Ctrl+F1** — Show help for symbol under cursor
- 🔍 Real-time diagnostics via PSScriptAnalyzer (on save)
- 💡 Hover docs for cmdlets (`Get-ADUser`, `Set-AzVM`, etc.)
- 🎨 Syntax highlighting for `.ps1`, `.psm1`, `.psd1`, `.pssc`, `.psrc`

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/mjojo/PowerShellEX.git
cd PowerShellEX

# Install dependencies
npm install

# Build
npm run build
```

Or install the pre-built VSIX directly:

```bash
code --install-extension powershell-ex-1.2.0.vsix
```

---

## 🔧 Usage

### In VS Code
PowerShell EX works out-of-the-box as a standard VS Code extension:
- **Execute Code:** Select code and press `F8` to run it in the terminal.
- **Get Help:** Place cursor on a cmdlet and press `Ctrl+F1` for instant documentation.
- **Diagnostics:** PSScriptAnalyzer provides real-time feedback on file save.
- **Hover Docs:** Hover over cmdlets for syntax and synopsis.

### In Antigravity (AI Agents)
Add to your Antigravity MCP settings (`.gemini/antigravity-ide/mcp_config.json`):

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

### Example — AI Agent calls

```jsonc
// Minimal — AI gets clean output, no ANSI noise
{ "tool": "execute_powershell", "code": "Get-Date" }

// Invoke cmdlet — returns only Name, Id, CPU (not 911 KB)
{ "tool": "invoke_cmdlet", "cmdlet": "Get-Process",
  "parameters": { "Name": "pwsh" } }

// Completions — cached, fast, compact
{ "tool": "get_completions", "code": "Get-", "cursorPosition": 4 }

// Increase output cap for large scripts
{ "tool": "execute_powershell", "code": "...", "maxOutput": 20000 }
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
npm run build    # Production build (TypeScript → dist/)
npm run watch    # Watch mode with hot reload
npm run lint     # ESLint
npm run package  # Build + package → .vsix
```

---

## 🗺️ Roadmap

- [x] MCP server with 6 AI agent tools
- [x] PSScriptAnalyzer integration (temp-file, injection-safe)
- [x] Token optimization — ANSI strip, compact JSON, output cap, TTL cache
- [x] Configurable execution timeout
- [x] Smart field selection in `invoke_cmdlet` (depth=2, selectProperties)
- [x] PowerShell 7 / Windows PowerShell auto-detection + fallback
- [x] GitHub Actions CI with automatic VSIX packaging
- [ ] PowerShell Session Manager (persistent process, stateful sessions)
- [ ] Debugging support (breakpoints, stepping via DAP)
- [ ] Remote PowerShell sessions (SSH, WinRM)
- [ ] PowerShell Notebook support (.psnb)
- [ ] Performance profiler integration

---

## 📄 License

MIT © 2024-2026 [Vitaly Golik (mjojo)](mailto:vitaly.golik@gmail.com)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/mjojo/PowerShellEX/issues) · [Request Feature](https://github.com/mjojo/PowerShellEX/issues)

</div>
