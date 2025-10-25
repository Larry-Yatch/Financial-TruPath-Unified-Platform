# 🤖 Google Apps Script Agent System

Specialized agents that continuously monitor and fix your Google Apps Script code, preventing the issues that waste hours of debugging time.

## 🚀 Quick Start

```bash
# Start all agents (recommended)
./start-agents.sh master

# Quick health check
./start-agents.sh quick

# Auto-fix common issues
./start-agents.sh fix
```

## 🎯 The Agents

### 🏥 **Gas-Doctor** - GAS Issue Specialist
Finds and fixes Google Apps Script specific problems:
- **Iframe navigation issues** (window.location → window.top.location)
- **Unbalanced backticks** that break template literals
- **Duplicate declarations** causing syntax errors
- **Missing OAuth scopes** in manifest

```bash
node agents/gas-doctor.js           # Check once
node agents/gas-doctor.js --fix     # Auto-fix issues
node agents/gas-doctor.js watch     # Continuous monitoring
```

### 🚀 **Deploy-Guardian** - Deployment Safety
Prevents broken deployments:
- **Removes console.logs** automatically
- **Validates syntax** before deployment
- **Checks session validation** isn't disabled
- **Manages deployment versions** and archives old ones

```bash
node agents/deploy-guardian.js check           # Pre-deployment check
node agents/deploy-guardian.js deploy "v1.0"   # Safe deployment
node agents/deploy-guardian.js cleanup         # Archive old deployments
```

### 📊 **Sheets-Monitor** - Real-time Data Watcher
Monitors Google Sheets operations:
- **Tracks new sessions/responses** in real-time
- **Validates data integrity** between Code.js and Sheets
- **Alerts on failed writes** immediately
- **Monitors quota usage** (50k reads/writes per day)

```bash
node agents/sheets-monitor.js start           # Start monitoring
node agents/sheets-monitor.js start --verbose # Detailed monitoring
```

### 🔄 **Callback-Surgeon** - Async Handler Expert
Fixes callback and async issues:
- **Adds missing null checks** to prevent "Verifying..." loops
- **Ensures failure handlers exist** on all script.run calls
- **Detects infinite loading states**
- **Provides safe callback templates**

```bash
node agents/callback-surgeon.js analyze      # Check callbacks
node agents/callback-surgeon.js analyze --fix # Fix issues
node agents/callback-surgeon.js template     # Show safe template
```

### ⏱️ **Quota-Keeper** - Resource Guardian
Prevents quota exhaustion:
- **Tracks execution time** (6 min limit)
- **Monitors API calls** (20k URL Fetch/day)
- **Detects operations in loops** that waste quota
- **Suggests batch optimizations**

```bash
node agents/quota-keeper.js analyze  # Check quota usage
node agents/quota-keeper.js monitor  # Live monitoring
```

### 🤖 **Master-Agent** - Orchestrator
Runs all agents together with:
- **Live dashboard** showing all issues
- **Auto-fix capability** for common problems
- **File watching** for instant feedback
- **Comprehensive reporting**

```bash
node agents/master-agent.js start   # Start all agents
node agents/master-agent.js check   # One-time check
node agents/master-agent.js report  # Generate report
```

## 💡 Real-World Time Savings

Based on your debugging guide, these agents would save:

| Issue | Manual Debug Time | With Agents | Time Saved |
|-------|------------------|-------------|------------|
| Iframe navigation | 35 minutes | Instant | 35 min |
| Permission errors | 30 minutes | Instant | 30 min |
| Null callbacks | 15 minutes | Instant | 15 min |
| Syntax errors | 20 minutes | Instant | 20 min |
| **Total per session** | **100 minutes** | **< 1 minute** | **99 min** |

## 🎮 Interactive Commands

When Master Agent is running:
- Press **R** - Generate full report
- Press **F** - Attempt auto-fix
- Press **Ctrl+C** - Stop gracefully

## ⚙️ Configuration

Edit `agents-config.json` to customize:
```json
{
  "monitoring": {
    "interval": 30000,     // Check every 30 seconds
    "autoFix": false       // Set to true for automatic fixes
  },
  "agents": {
    "gasDoctor": { "enabled": true, "autoFix": false },
    "deployGuardian": { "enabled": true },
    "sheetsMonitor": { "enabled": true },
    "callbackSurgeon": { "enabled": true, "autoFix": false },
    "quotaKeeper": { "enabled": true }
  }
}
```

## 📋 Prerequisites

```bash
# Install required packages
npm install googleapis

# Ensure Google Sheets auth exists
ls ~/.google-sheets-auth/token.json
```

## 🔥 Common Workflows

### Before Deployment
```bash
./start-agents.sh deploy
# Checks syntax, console.logs, test functions, credentials
# Only deploys if all checks pass
```

### During Development
```bash
./start-agents.sh master
# Continuous monitoring with instant feedback
# Auto-fixes common issues as you code
```

### After Errors
```bash
./start-agents.sh fix
# Automatically fixes iframe issues, adds null checks,
# comments console.logs, fixes syntax
```

### Debug Session Issues
```bash
./start-agents.sh sheets --verbose
# See exactly when data saves to sheets
# Track failed writes in real-time
```

## 🚨 What Gets Auto-Fixed

With `autoFix: true` in config:
- ✅ `window.location` → `window.top.location`
- ✅ Missing null checks in callbacks
- ✅ Console.log statements commented out
- ✅ Missing failure handlers added
- ✅ Unbalanced quotes/backticks highlighted

## 📊 Output Examples

### Gas-Doctor Finding Issues:
```
🏥 Gas-Doctor starting diagnosis...

Found 3 issues:

🟠 HIGH (2):
  - Found 2 iframe navigation issues (use window.top.location instead)
    Lines: 287, 456
    🔧 Auto-fixable
  - Success handler #3: No null check for 'result'
    💡 Add: if (!result) { handleError("No response"); return; }

💡 Run with --fix flag to auto-fix some issues
```

### Master Agent Dashboard:
```
🤖 MASTER AGENT DASHBOARD
============================================================
Time: 2:45:32 PM | Uptime: 45m 23s
============================================================

📡 Active Monitors:
  ✅ GasDoctor
  ✅ SheetsMonitor
  ✅ CallbackSurgeon

⚠️ Current Issues:
  🔴 Critical: 1
  🟠 High: 3
  🟡 Medium: 5

  Top Priority Issues:
    [GasDoctor] Syntax error: Unexpected identifier
    [CallbackSurgeon] Missing withFailureHandler
    [QuotaKeeper] Sheet operations in loop - use batch

📊 Sheets Activity:
  Sessions: 142
  Responses: 1,247

⏱️ Last full check: 12s ago (145ms)
============================================================
Press Ctrl+C to stop | Press R for report | Press F to fix
```

## 🎯 Best Practices

1. **Always run before deployment:** `./start-agents.sh deploy`
2. **Keep Master Agent running during development** for instant feedback
3. **Enable autoFix for trusted issues** like iframe navigation
4. **Check quota usage weekly** to prevent surprises
5. **Archive old deployments monthly** with cleanup command

## 🐛 Troubleshooting

If agents don't start:
```bash
# Check Node.js is installed
node --version

# Install missing dependencies
npm install

# Check file permissions
ls -la agents/

# Make scripts executable
chmod +x agents/*.js
chmod +x start-agents.sh
```

---

Built to save you from the 35-minute iframe debugging sessions and other Google Apps Script gotchas! 🚀