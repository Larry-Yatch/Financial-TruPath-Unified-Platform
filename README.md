# Financial TruPath Unified Platform V2.0

## 🎯 Current Status
**Working Version:** Login → Tool 1 (Orientation Assessment)

## 📁 Project Structure

```
Financial-TruPath-Unified-Platform/
├── v2-sheet-script/        # ✅ MAIN: Google Apps Script code
│   ├── Code.js            # Main router and page generation
│   ├── index.html         # Tool 1: Orientation Assessment
│   ├── DataHub.js         # Data management layer
│   ├── Authentication.js  # Student roster authentication
│   ├── Config.js          # Configuration settings
│   └── ...                # Other supporting files
│
├── apps/                  # Standalone tools
│   └── investment-tool/   # Tool 8: Investment calculator
│
├── .daddy/               # Validation system configuration
├── .claude/              # Claude AI configuration
└── old-docs/            # Archived planning documents
```

## 🚀 Quick Start

### Prerequisites
1. Google Apps Script project connected
2. Google Sheets with student roster
3. Node.js and clasp installed

### Deployment
```bash
# Push code to Google Apps Script
cd v2-sheet-script
clasp push

# Open in browser
# Go to script.google.com and find your project
# Deploy → Test deployments → Copy URL
```

## 📊 Google Sheets Structure

The system uses these sheets:
- **Student Roster** - Authentication (Column G: Student IDs)
- **Tool1_Orientation** - Assessment data storage
- **Students** - Master tracking

## 🔧 Current Features

✅ **Working:**
- Student authentication via roster
- Tool 1: Orientation Assessment (25 fields)
- Data persistence to Google Sheets
- PDF report generation
- Financial health scoring

🚧 **Next Steps:**
1. Fix login page branding
2. Add simple dashboard
3. Implement return student detection
4. Add remaining 7 tools

## 📝 Development Notes

### Adding New Features
1. Always test in small increments
2. Use the Test Deployment URL
3. Check browser console for errors
4. Commit working versions frequently

### Common Issues
- **Blank pages:** Usually deployment URL mismatch
- **404 errors:** Wrong deployment ID in URLs
- **Authentication fails:** Check roster sheet structure

## 🔗 Important URLs

- Script ID: `1TIkkayrocz3TA2kuYJSsegU94xzrd2fJuY9Wf9eI_K83B0IKyPlpzeY9`
- Test deployment: Get from script.google.com → Deploy → Test deployments

## 📞 Support

For issues or questions about this codebase, check:
1. Browser console for JavaScript errors
2. Google Apps Script logs
3. Roster data structure

---
*Last Updated: October 2024*
*Status: Working baseline - Tool 1 complete*