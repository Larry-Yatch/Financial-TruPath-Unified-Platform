# Financial TruPath Unified Platform V2.0

## 🚨 Current Status (October 25, 2025)
**Version:** V9.7 Deployed  
**Phase:** Foundation Rebuild Decision  
**Issue:** 8 critical bugs found - architectural conflict between ToolWrapper and Tool 1  
**Decision:** Stop patching, rebuild clean foundation first

## 📍 Quick Links
- **Live Deployment:** [V9.7 Test URL](https://script.google.com/macros/s/AKfycbyqrSzYPra9tqpbEMi27p-bmhEFhSdi5leEOpYq1UdtFVl5dgcB7b6AS4V9nXO14Y2P/exec)
- **Current Issues:** See `Documentation/SESSION-HANDOFF.md`
- **Rebuild Plan:** See `Documentation/FOUNDATION-ROADMAP.md`
- **Deployment History:** See `Documentation/V9-DEPLOYMENT-STATUS.md`

## 📁 Project Structure

```
Financial-TruPath-Unified-Platform/
├── v2-sheet-script/        # ✅ MAIN: Active development
│   ├── Documentation/      # 📚 All current documentation
│   │   ├── SESSION-HANDOFF.md    # START HERE - Current state
│   │   ├── FOUNDATION-ROADMAP.md # Rebuild plan
│   │   └── V9-DEPLOYMENT-STATUS.md # Deploy history
│   ├── index.html         # Tool 1 (25 questions, competing with ToolWrapper)
│   ├── ToolWrapper.html   # Framework (conflicts with index.html)
│   ├── ToolFramework.js   # Cross-tool intelligence (726 lines)
│   ├── DataService.js     # Google Sheets integration
│   ├── Code.js            # Router & authentication
│   └── archive/           # Old versions & docs
│
├── apps/                  # Legacy tools (Tool-1 through Tool-8.5)
├── .claude/              # AI configuration
└── node_modules/         # Dependencies
```

## 🔴 Critical Issues (V9.7)

1. **Cloud draft saving broken** - Saves empty versions with 0% progress
2. **Duplicate progress systems** - ToolWrapper vs native Tool 1
3. **Dashboard navigation** - White screen on return
4. **Form data collection** - collectToolData() not finding fields

See full list of 8 issues in `Documentation/SESSION-HANDOFF.md`

## 🚀 Quick Start

### Prerequisites
```bash
# 1. Install dependencies
npm install googleapis

# 2. Setup clasp for deployment
npm install -g @google/clasp
clasp login
```

### Development Workflow
```bash
# 1. Navigate to project
cd v2-sheet-script

# 2. Start monitoring (REQUIRED - runs in background)
cd .. && node debug-sheets.js watch

# 3. Make changes and deploy
clasp push
clasp deploy --description "Your change description"
```

### Testing
- **Test Users:** TEST001, TEST002
- **Monitor:** Check `debug-sheets.js watch` output for real-time activity
- **Database:** Google Sheets ID: `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`

## 📊 System Architecture

### Current Problem
Two competing systems trying to manage the same functionality:
- **ToolWrapper** - New framework for all 8 tools
- **index.html** - Original Tool 1 with 25 questions

These conflict at every level causing the 8 critical issues.

### Solution: Foundation Rebuild
1. Build clean foundation with standardized form structure
2. Test with simple form first
3. Rebuild Tool 1 using foundation
4. Scale to all 8 tools

## 🎯 8-Tool System Overview

| Tool | Name | Pattern | Status |
|------|------|---------|--------|
| 1 | Orientation/Demographics | Insights Assessment | ⚠️ Broken |
| 2 | Financial Clarity | Comprehensive Assessment | 📝 Logic ready |
| 3 | False Self/External Validation | Grounding Template | 📝 Planned |
| 4 | Financial Freedom Framework | Interactive Calculator | 📝 Planned |
| 5 | Issues Showing Love | Grounding Template | 📝 Planned |
| 6 | Retirement Blueprint | Interactive Calculator | 📝 Planned |
| 7 | Control Fear | Grounding Template | 📝 Planned |
| 8 | Investment Tool | Interactive Calculator | 📝 Planned |

## 📈 Monitoring

```bash
# Real-time Google Sheets monitoring
node debug-sheets.js watch

# Check current state
node debug-sheets.js summary

# View sessions
node debug-sheets.js sessions

# View responses
node debug-sheets.js responses
```

## 📚 Documentation

**Start Here:**
1. `Documentation/SESSION-HANDOFF.md` - Current V9.7 status & issues
2. `Documentation/FOUNDATION-ROADMAP.md` - Complete rebuild plan
3. `Documentation/DOCUMENTATION-MAP.md` - All docs overview

**Reference:**
- `Documentation/DEBUGGING-GUIDE.md` - Troubleshooting
- `Documentation/CROSS-TOOL-STRATEGY.md` - Tool integration
- `Documentation/SCALABLE-ARCHITECTURE-PLAN.md` - 4-pattern approach

## 🔄 Next Steps

1. **Immediate:** Build test form with standardized structure
2. **Fix:** Core ToolWrapper functions (collectToolData, saveDraft, etc.)
3. **Test:** Verify all persistence works
4. **Rebuild:** Tool 1 using clean foundation
5. **Scale:** Implement remaining 7 tools

## 🤝 Contributing

See `CLAUDE.md` for AI development guidelines and behavioral rules.

## 📞 Support

- **Issues:** Check `Documentation/DEBUGGING-GUIDE.md` first
- **Monitor:** Always run `debug-sheets.js watch` during development
- **Test Users:** Use TEST001 or TEST002 for testing

---

*Last Updated: October 25, 2025 - V9.7 with foundation rebuild decision*