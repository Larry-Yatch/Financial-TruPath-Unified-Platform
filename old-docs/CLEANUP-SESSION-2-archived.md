# Session 2 Cleanup Checklist

## ✅ Files to Archive (Not Delete)

Move these to an `archive` folder - they're not used but might contain useful code:

```bash
mkdir -p v2-sheet-script/archive
cd v2-sheet-script

# Move unused files
mv LoginEnhanced.html archive/  # We use inline HTML now
mv Router.js archive/           # Routing is in Code.js
mv Middleware.js archive/        # Not actively used
mv RunAnalysis.js archive/       # Old analysis tool
mv SheetAnalyzer.js archive/     # One-time analysis done
mv CleanupSheets.js archive/     # Cleanup already done
```

## 📁 Active Files (Keep These)

### Core System (10 files)
- **Code.js** - Main router and entry point
- **Authentication.js** - Login system with dual methods
- **Session.js** - Session management
- **SimpleDashboard.js** - Dashboard UI
- **Config.js** - System configuration
- **DataHub.js** - Data operations (needs work)
- **Menu.js** - Spreadsheet menu
- **SheetSetup.js** - Sheet structure setup
- **FixStudentsSheet.js** - Student sheet fixer
- **FixPermissions.js** - Permission utilities

### Tool Files (2 files)
- **Tool1_Orientation.js** - Tool 1 backend
- **index.html** - Tool 1 UI

### Configuration (1 file)
- **appsscript.json** - Apps Script manifest

## 🗄️ Google Apps Script Deployments

### Keep Active
- **V5.9** (Latest) - `AKfycbxlFTiwMh8z63ZuodVLZPW6ABTSwKzxzSyzoPOwdlovjkWKEX2qYBfzRYrbC8cK5Oel`

### Can Archive (but don't delete)
- V5.0 through V5.8 - All superseded by V5.9

To archive old deployments:
1. Go to: https://script.google.com/home/projects/1TIkkayrocz3TA2kuYJSsegU94xzrd2fJuY9Wf9eI_K83B0IKyPlpzeY9/deployments
2. Click on old deployments
3. Click "Archive" (don't delete - keeps history)

## 📊 Google Sheets Cleanup

### Sheets to Keep
- SESSIONS - Active sessions
- RESPONSES - For tool responses (future)
- TOOL_STATUS - Tool completion tracking
- TOOL_ACCESS - Access control
- ACTIVITY_LOG - User activity
- ADMINS - Admin users
- CONFIG - System config
- Students - User roster (fixed)
- Tool1_Orientation - Tool 1 data

### Sheets to Review
Check if these have any data worth keeping:
- CrossToolInsights - Might have old insights
- SystemLogs - Old logs (can probably clear)

## 🔧 Final Cleanup Commands

```bash
# 1. Archive unused files
cd /Users/Larry/code/Financial-TruPath-Unified-Platform/v2-sheet-script
mkdir -p archive
mv LoginEnhanced.html Router.js Middleware.js RunAnalysis.js SheetAnalyzer.js CleanupSheets.js archive/

# 2. Update clasp to ignore archive
echo "archive/**" >> .claspignore

# 3. Push clean version
clasp push

# 4. Create final deployment
clasp deploy --description "V6.0 Production Ready - Clean"

# 5. Commit everything
git add -A
git commit -m "Archive unused files and prepare for production"
```

## ✅ Documentation Updates Needed

1. **HANDOFF.md** - Update with V5.9 deployment info ✅ (Will do)
2. **DEBUGGING-GUIDE.md** - Current and complete ✅
3. **QUICK-FIX.md** - Current with V5.9 ✅
4. **README.md** - Needs creation for deployment instructions

## 🚀 Ready for Next Session

After cleanup, you'll have:
- 13 active files (down from 19)
- 1 active deployment (V5.9 or V6.0)
- Clean sheet structure
- Updated documentation
- No test artifacts

---
*Last updated: October 21, 2024*
*Ready for DataService development in next session*