# PowerShell EX — Advanced PowerShell for Antigravity IDE

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PowerShell](https://img.shields.io/badge/PowerShell-7.0+-5391FE.svg?logo=powershell&logoColor=white)

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
| `execute_powershell` | Run PowerShell code with full stdout/stderr capture |
| `analyze_script` | Lint and analyze code with PSScriptAnalyzer |
| `get_completions` | IntelliSense via native TabExpansion2 |
| `get_help` | Get-Help integration for instant documentation |
| `invoke_cmdlet` | Execute single cmdlets with structured parameters |
| `list_modules` | Browse and search installed modules |

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
- **PowerShell** 7+ (pwsh) or Windows PowerShell 5.1
- **PSScriptAnalyzer** module (optional, for code analysis)

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

- [ ] Debugging support (breakpoints, stepping)
- [ ] Remote PowerShell sessions (SSH, WinRM)
- [ ] PowerShell notebook support
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
