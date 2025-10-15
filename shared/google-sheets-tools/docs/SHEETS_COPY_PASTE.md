# 📋 Copy-Paste Google Sheets Setup

## For Any New Project - Just Copy These Commands:

### Option 1: One-Line Setup (Fastest)
```bash
npm install googleapis && curl -sL https://raw.githubusercontent.com/Larry-Yatch/investment-tool/main/sheets.js > sheets.js
```

### Option 2: Manual Copy (If no internet)
```bash
# Install package
npm install googleapis

# Copy the file
cp ~/code/Control_Fear_Investment_Tool/mcp-exploration/sheets.js .

# Test it
node -e "require('./sheets').test()"
```

## That's It! You're Done! 

## Usage in Your Code:

### Simple Examples
```javascript
const sheets = require('./sheets');

// Get your Investment Tool scenarios
const scenarios = await sheets.scenarios();
console.log(`Found ${scenarios.length} scenarios`);

// Get roster data  
const roster = await sheets.roster();

// Get any Google Sheet by ID
const data = await sheets.fetch('your-sheet-id-here');

// Get as raw arrays (not objects)
const rawData = await sheets.fetch('scenarios', 'A1:D10');

// Save to local file for debugging
await sheets.saveLocal('scenarios', 'my-data.json');
```

### In VS Code with Me (Claude):
When you need me to check your sheets, just run:
```javascript
// I can read this file after you run:
require('./sheets').saveLocal('scenarios');
```

## Adding More Sheets:

Edit the `SHEETS` object in sheets.js:
```javascript
const SHEETS = {
  scenarios: '1_c4JB4VG4q-...',  // existing
  roster: '104pHxIgsG...',       // existing
  
  // Add your new sheets:
  myNewProject: 'sheet-id-here',
  budgetTracker: 'another-sheet-id',
};
```

Then use them:
```javascript
const data = await sheets.fetch('myNewProject');
// or even simpler:
const data = await sheets.fetch('budgetTracker');
```

## What This Gives You:

✅ **Zero Setup** - Token already exists globally  
✅ **One File** - Just sheets.js  
✅ **One Dependency** - Just googleapis  
✅ **Works Anywhere** - Any project, any folder  
✅ **Auto-finds Token** - Searches multiple locations  
✅ **Pre-configured** - Your sheets already added  
✅ **Error Handling** - Clear messages if something fails  

## Troubleshooting:

**"No token found"**
- Run authentication once in mcp-exploration project

**"Permission denied"**  
- Make sure sheet is shared properly
- Check APIs are enabled in Google Cloud

**"Cannot find module googleapis"**
- Run: `npm install googleapis`

## The Magic:

Once set up in ANY project, I (Claude) can help you with:
- Debugging data issues
- Analyzing calculations  
- Checking data integrity
- Comparing versions
- Finding patterns

Just tell me: "Check my sheets" and run the saveLocal command!