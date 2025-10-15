# 🛠️ Google Sheets Tools

A collection of tools and utilities for integrating Google Sheets with your projects, including MCP server explorations and production-ready Google Sheets access.

## 📁 Project Structure

```
google-sheets-tools/
├── production-ready/        # Ready-to-use tools
│   └── sheets.js           # Universal Google Sheets access
├── mcp-exploration/        # MCP server experiments (for reference)
├── docs/                   # Documentation
│   └── SHEETS_COPY_PASTE.md
└── examples/               # Usage examples
```

## 🚀 Quick Start

### For Any Project - Google Sheets Access

```bash
# Copy the sheets.js file to your project
cp ~/code/google-sheets-tools/production-ready/sheets.js your-project/

# Install dependency
cd your-project
npm install googleapis

# Test it
node -e "require('./sheets').test()"
```

## 📊 What's Included

### Production Ready Tools

#### `sheets.js` - Universal Google Sheets Access
- **What it does**: Provides simple access to any Google Sheet
- **Authentication**: Uses token from `~/.google-sheets-auth/`
- **Pre-configured**: Investment Tool sheets already set up
- **Usage**:
```javascript
const sheets = require('./sheets');
const data = await sheets.fetch('sheet-id', 'A:Z');
```

### MCP Exploration (Reference Only)

The `mcp-exploration/` folder contains experiments with Model Context Protocol servers:
- MCP server implementations
- Google Drive MCP setup attempts
- Authentication scripts
- **Note**: MCP servers work with Claude Desktop, not VS Code

## 🔑 Authentication

Authentication is already set up globally. The token is stored at:
- Primary: `~/.google-sheets-auth/token.json`
- Backup: `~/.config/claude-mcp-global/token.json`

You authenticated once, and now it works everywhere!

## 📝 Common Use Cases

### 1. Access Investment Tool Data
```javascript
const sheets = require('./sheets');

// Get scenarios
const scenarios = await sheets.fetch('scenarios', 'Scenarios!A:Z');

// Get roster  
const roster = await sheets.fetch('roster', 'Financial v1!A:F');
```

### 2. Access Any Google Sheet
```javascript
const sheets = require('./sheets');
const data = await sheets.fetch('your-sheet-id-here', 'Sheet1!A:Z');
```

### 3. Save Data for Debugging with Claude
```javascript
// Save to JSON for Claude to analyze
await sheets.saveLocal('scenarios', 'debug.json');
```

## 🔧 Adding New Sheets

Edit the `SHEETS` object in `sheets.js`:

```javascript
const SHEETS = {
  scenarios: '1_c4JB4VG4q-...',  // Existing
  roster: '104pHxIgsG...',       // Existing
  
  // Add your sheets:
  myNewSheet: 'sheet-id-here',
};
```

## 📚 Documentation

- **[SHEETS_COPY_PASTE.md](docs/SHEETS_COPY_PASTE.md)** - Quick copy-paste instructions
- **[MCP Exploration README](mcp-exploration/README.md)** - MCP server experiments

## 🎯 Key Files Reference

| File | Purpose | Use Case |
|------|---------|----------|
| `production-ready/sheets.js` | Google Sheets API wrapper | Copy to any project |
| `mcp-exploration/token.json` | Auth token | Already backed up globally |
| `mcp-exploration/auth.js` | Authentication setup | Run once, done forever |

## 💡 Tips

1. **One-time setup**: You've already authenticated - token works everywhere
2. **Simple integration**: Just copy `sheets.js` and install `googleapis`
3. **MCP Note**: MCP servers are for Claude Desktop, not VS Code
4. **Global token**: Located at `~/.google-sheets-auth/token.json`

## 🚫 What NOT to Do

- Don't re-run authentication (already done)
- Don't commit tokens to git
- Don't use MCP servers in VS Code (use Claude Desktop)
- Don't modify the global token

## 📈 Projects Using These Tools

- **Investment Dial Tool** - Financial planning application
- (Add your projects here as you use these tools)

## 🛟 Troubleshooting

**"No token found"**
- Token should be at `~/.google-sheets-auth/token.json`
- If missing, run auth.js in mcp-exploration

**"Permission denied"**
- Make sure sheet is shared properly
- Check Google Cloud APIs are enabled

**"Cannot find googleapis"**
- Run: `npm install googleapis`

## 📄 License

Personal tools - use freely in your own projects.

---

*Last Updated: October 2024*