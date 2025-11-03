# AI Assistant Onboarding Prompt for Financial TruPath Platform

## 🎯 Initial Context Setting

You are being onboarded to work on the Financial TruPath Unified Platform, a comprehensive financial assessment and education system. This is a Google Apps Script-based web application that helps users understand their financial psychology and create personalized financial plans through a series of assessment tools.

## 📋 Project Overview

### What This System Does
The Financial TruPath Platform is an 8-tool assessment suite that:
1. Evaluates users' financial situations and psychological drivers
2. Generates personalized reports and recommendations
3. Tracks progress through a course curriculum
4. Provides adaptive questioning based on previous responses
5. Creates PDF reports with customized financial guidance

### Technical Architecture
- **Frontend**: HTML5 with vanilla JavaScript, served via Google Apps Script
- **Backend**: Google Apps Script (V8 runtime)
- **Database**: Google Sheets (primary data store)
- **Deployment**: Google Cloud Platform via clasp CLI
- **Version**: V11.43b @ Deploy 192 (as of Nov 2024)

## 📚 CRITICAL: Document Reading Order

Read these documents in THIS EXACT ORDER for proper understanding:

### Phase 1: Project Foundation (Read First)
1. **CLAUDE.md** - Behavioral directives and development standards
2. **README.md** - Project overview and quick start
3. **v2-sheet-script/Documentation/TOOLS_INVENTORY.md** - Complete tool specifications and URLs
4. **v2-sheet-script/Documentation/V2-SHEET-SCRIPT-GUIDE.md** - File structure and system guide

### Phase 2: Architecture Understanding
5. **v2-sheet-script/Documentation/SCALABLE-ARCHITECTURE-PLAN.md** - System design patterns
6. **v2-sheet-script/Documentation/CROSS-TOOL-STRATEGY.md** - How tools communicate
7. **v2-sheet-script/Config.js** - Configuration and constants

### Phase 3: Implementation Details
8. **v2-sheet-script/Documentation/DEPLOYMENT-PROCESS.md** - How to deploy
9. **v2-sheet-script/Documentation/DEBUGGING-GUIDE.md** - Troubleshooting guide
10. **v2-sheet-script/Documentation/V11.43-PERFORMANCE-OPTIMIZATION-SUMMARY.md** - Recent optimizations

## 🔍 Code Exploration Order

After reading the documents, examine the code in this sequence:

### Layer 1: Entry Points
```javascript
1. v2-sheet-script/Code.js          // Main router - start here
2. v2-sheet-script/index.html        // User interface entry
3. v2-sheet-script/Authentication.js // How users log in
```

### Layer 2: Core Framework
```javascript
4. v2-sheet-script/ToolFramework.js  // Cross-tool intelligence
5. v2-sheet-script/DataService.js    // Google Sheets operations
6. v2-sheet-script/Session.js        // Session management
```

### Layer 3: UI Components
```javascript
7. v2-sheet-script/ToolWrapper.html  // Universal tool wrapper
8. v2-sheet-script/api-batch-service.html // API rate limiting
```

### Layer 4: Tool Implementations
```javascript
9. v2-sheet-script/Tool1_Orientation.js      // Tool 1 implementation
10. v2-sheet-script/Tool2_FinancialClarity.js // Tool 2 implementation
```

## 🗺️ Current Project State (November 2024)

### What's Working
- ✅ Tool 1 (Top Level Assessment) fully deployed and functional
- ✅ Authentication system with TEST001/TEST002 test users
- ✅ Google Sheets integration with real-time data persistence
- ✅ PDF report generation
- ✅ API rate limiting and error handling

### What's In Progress
- 🔄 Tool consolidation: Merging Tool1_Orientation + Tool2_FinancialClarity + Tool1_Enhanced into new Tool 2
- 🔄 Tool 1 being replaced with apps/Tool-1-Top-level-Assessment code
- 🔄 Migration from legacy DataHub to DataService

### Known Issues
- ⚠️ Google Sheets API quota limits (60 requests/minute)
- ⚠️ Archive folder has 200+ obsolete files needing cleanup
- ⚠️ Some tools (3-8) exist but need integration

## 🔑 Key Information

### Google Sheets Database
- **Main Spreadsheet ID**: `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`
- **Sheets**: Sessions, Responses, CrossToolInsights, Status
- **Test Users**: TEST001, TEST002 (use these for testing)

### Deployment Information
- **Script ID**: `1kF9XwKvCqLpZCpBE0qhzkywXF9enxJRvQqpW4NXxgjZwQtqHl8fEXXmO`
- **Current Deploy**: https://script.google.com/macros/s/AKfycbxKx-ihG5x3uqTe_W0Rt20HX-MIdwV6Y97LYWT6jOuJXJZvEHQIyCc4kzINl_vRJgUH/exec
- **Deploy Version**: 192

### Development Tools Available
- **clasp**: Google Apps Script CLI for deployment
- **node debug-sheets.js**: Monitor Google Sheets in real-time
- **npm run deploy**: Safe deployment script

## 💡 Important Context

### Design Philosophy
1. **KISS Principle**: Keep It Simple, Stupid - avoid over-engineering
2. **YAGNI**: You Aren't Gonna Need It - build only what's needed now
3. **Progressive Enhancement**: Tools adapt based on previous responses
4. **Data-First**: All user data persists to Google Sheets immediately

### Tool Patterns
The system supports 4 distinct tool patterns:
1. **Insights Assessment** (Tool 1): Multi-section forms with progress tracking
2. **Comprehensive Assessment** (Tool 2): Adaptive questioning
3. **Grounding Templates** (Tools 3,5,7): Psychological assessments
4. **Interactive Calculators** (Tools 4,6,8): Real-time calculations

### Critical Business Logic
- Each tool generates a personalized PDF report
- Tools share data via CrossToolInsights sheet
- Questions adapt based on previous tool responses
- All submissions tracked with unique session IDs
- Draft management allows users to save progress

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd /Users/Larry/code/Financial-TruPath-Unified-Platform

# Start monitoring Google Sheets (run first in every session)
node debug-sheets.js watch

# Check current deployment
clasp deployments

# Push changes to Google
cd v2-sheet-script
clasp push

# Deploy new version
clasp deploy --description "Your change description"
```

## 📝 Development Workflow

1. **Always start with**: `node debug-sheets.js watch` (monitors sheets)
2. **Test with**: TEST001 or TEST002 user IDs
3. **Check sheets**: Watch for data persistence
4. **Deploy carefully**: Use clasp push, then deploy
5. **Document changes**: Update relevant .md files

## ⚠️ Critical Warnings

1. **NEVER** modify Config.js spreadsheet IDs without backup
2. **ALWAYS** test with TEST users before production
3. **MONITOR** API quotas (60 requests/minute limit)
4. **CHECK** the sheets monitor for real-time feedback
5. **AVOID** creating new files unless absolutely necessary

## 🎯 Your First Task

1. Read CLAUDE.md to understand behavioral directives
2. Run `node debug-sheets.js watch` to start monitoring
3. Open the deployment URL and login with TEST001
4. Navigate through Tool 1 to understand the flow
5. Check the Google Sheets to see how data is stored
6. Review the code starting with Code.js

## 📞 Additional Resources

### Google Drive Folders
- Tool 1: https://docs.google.com/forms/d/1A_FjAQbk9fqqWrW7jKXeYl1xJX7EtwCERAjvKY9Xeys/edit
- Tool 2: https://drive.google.com/drive/u/0/folders/1ZGO8R2mAnDgMg6n4gY1Iyc3_-mk2Rwwk

### Key Scripts to Clone with clasp
- Tool 2: `1mBM0aQkljcoWbOh-0Zu84XJrJtItCRSEJwtXnDxkZVpKdvJO7viE5lDo`
- Tool 4: `1t9ZolLEffBEXiGc3c7ozA2aAJc9hA3awKFAP2620KHuHmVPERj_HdY0N`
- Tool 6: `1u76NxCIbrJ0suSF5TKcI1VFE6KfaLxhdhCZ183CKQ-s217AaYq5O5TwD`

### Memory/Context System
This project uses the Hey Daddy MCP tool for memory persistence. Key memories about decisions and patterns are stored with `store_daddy` and retrieved with `recall_daddy`.

---

## 🎬 Opening Statement for New AI

"You're working on the Financial TruPath Platform, a production Google Apps Script application at version 11.43b. The system has 8 financial assessment tools, with Tool 1 fully deployed and working. Your main focus is maintaining the existing system while consolidating Tools 1 and 2 according to the new architecture plan. Always start by checking recall_daddy for any stored context about recent decisions."

---

*This onboarding document provides everything needed to understand and work on the Financial TruPath Platform. Follow the reading order exactly for best comprehension.*