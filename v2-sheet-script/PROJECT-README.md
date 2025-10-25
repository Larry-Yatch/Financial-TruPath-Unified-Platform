# Financial TruPath V2.0 - Unified Platform

## 🎯 Project Overview
An intelligent, adaptive financial assessment platform with 8 interconnected tools that learn from each other to provide personalized financial guidance.

## 🚀 Current Status (October 23, 2024)

### Major Discovery
- **Tool 1 Already Built**: 1,321-line sophisticated assessment with Financial Health Score + insights
- **Architecture Decided**: Hybrid 4-pattern approach for optimal user experience
- **Week 1 Focus**: Debug existing Tool 1 rather than rebuild from scratch

### Working Deployment
- **V7.1 URL**: [Live Application](https://script.google.com/macros/s/AKfycbzi5QerNc7hekeZ8cWOccFj6RBAvcJckDYvqZ3v6CW5rl-UC7_VtEncTEFrLhDlTBLJ/exec)
- **Status**: Backend complete, sophisticated Tool 1 ready to debug
- **Data Flow**: ✅ Login → Dashboard → Tool1 (simple test) → DataService → Sheets
- **NOTE**: Sophisticated Tool 1 commented out due to template issues - ready to activate

### Key Components
- **DataService.js**: Complete data management layer ✅ WORKING
- **ToolFramework.js**: Cross-tool middleware (726 lines) ⚠️ EXISTS BUT NOT CONNECTED
- **Tool2_FinancialClarity.js**: Adaptive assessment logic ⚠️ EXISTS BUT NOT ACCESSIBLE
- **Simple Test Form**: Basic name input form ✅ WORKING
- **Session Management**: 24-hour sessions ✅ WORKING
- **Google Sheets Integration**: RESPONSES, TOOL_STATUS, SESSIONS sheets ✅ WORKING
- **Monitor**: Real-time data tracking ✅ WORKING (29 sessions, 5 responses)

## 📁 Project Structure

```
Financial-TruPath-Unified-Platform/
├── v2-sheet-script/        # Active development (Google Apps Script)
│   ├── DataService.js      # ✅ Data management
│   ├── Code.js            # ✅ Router
│   ├── Session.js         # ✅ Session management
│   ├── SimpleDashboard.js # ✅ Dashboard UI
│   ├── Tool1_Orientation.js # ⚠️ Framework logic exists, form is simple test
│   ├── Tool2_FinancialClarity.js # ⚠️ Logic exists, not accessible via UI
│   ├── ToolFramework.js   # ⚠️ 726 lines exist, not connected
│   ├── index.html         # ⚠️ Complex template commented out
│   └── archive/           # Old versions
│
├── apps/                  # Legacy tools (reference)
│   ├── orientation-demographics/
│   ├── financial-clarity/
│   ├── control-fear-*/
│   └── [5 other tools]
│
├── .claude/              # AI assistant configuration
└── node_modules/         # Dependencies (googleapis)
```

## 🔑 Key Resources

### Google Sheets Database
- **ID**: `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`
- **Sheets**: SESSIONS, RESPONSES, TOOL_STATUS, CrossToolInsights

### Test Credentials
- Client IDs: `TEST001`, `TEST002`

### Monitoring
```bash
cd /Users/Larry/code/Financial-TruPath-Unified-Platform
node debug-sheets.js watch
```

## 📚 Documentation

### Active Guides
- [`SESSION-3-HANDOFF.md`](./SESSION-3-HANDOFF.md) - Latest session handoff
- [`DEVELOPMENT_GUIDE.md`](./archive/old-docs/DEVELOPMENT_GUIDE.md) - Architecture overview
- [`DEBUGGING-GUIDE.md`](./DEBUGGING-GUIDE.md) - Troubleshooting reference
- [`CROSS-TOOL-STRATEGY.md`](./CROSS-TOOL-STRATEGY.md) - Middleware strategy

### Archived
- `archive/session-docs/` - Previous session handoffs
- `archive/old-docs/` - Initial planning documents

## 🎯 Next Development Phase

### Priority 1: ToolFramework.js
Build reusable framework with:
- Form components (demographics, scales, inputs)
- Middleware hooks for cross-tool intelligence
- Unified scoring engine
- Tool adapter pattern

### Priority 2: Tool1 Rebuild
- Fix field mismatches
- Implement with framework
- Generate insights for Tool2

### Priority 3: Cross-Tool Intelligence
- Tool2 adapts based on Tool1 insights
- Implement middleware pattern
- Prove adaptive questioning

## 🔧 Quick Start

```bash
# 1. Navigate to project
cd /Users/Larry/code/Financial-TruPath-Unified-Platform/v2-sheet-script

# 2. Start monitoring
cd .. && node debug-sheets.js watch

# 3. Check current deployment
open https://script.google.com/macros/s/AKfycbxjzb0pD2VaHE6AsnEPNNc4F9Pk9NUXGSctXgzoJk6ztZc9aICAwHjgf6hjZdaSlMTv/exec

# 4. Deploy changes
clasp push
clasp deploy --description "Your description"
```

## 💡 Key Insights

1. **Middleware is the differentiator** - Tools adapt based on previous insights
2. **Framework approach** - Build once, reuse 8 times
3. **Legacy patterns work** - Reuse proven scoring/normalization logic
4. **Debug environment first** - iframe issues, not code bugs

## 📞 Support

- **GitHub Issues**: Report bugs in the repo
- **Documentation**: See archived docs for historical context
- **Monitoring**: Always run debug-sheets.js during development

---

*Last Updated: October 22, 2024 - Session 3 Complete*