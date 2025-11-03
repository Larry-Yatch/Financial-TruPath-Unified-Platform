# V2 Sheet Script - System File Guide

## 📁 Current Directory Structure (V11.43b)

```
v2-sheet-script/
├── Core Framework Files
├── Tool Implementations  
├── UI Components
├── Configuration
└── Documentation/
```

## 🎯 Core System Files

### Framework Layer (Essential Infrastructure)
| File | Purpose | Dependencies | Status |
|------|---------|--------------|--------|
| **Code.js** | Main router, authentication, session management | All files | ✅ Production |
| **DataService.js** | Google Sheets integration, data persistence | Config.js | ✅ Production |
| **ToolFramework.js** | Cross-tool intelligence, adaptive questioning | DataService.js | ✅ Production |
| **DataHub.js** | Centralized data operations, caching | DataService.js | ✅ Production |
| **Session.js** | User session management | DataService.js | ✅ Production |
| **Authentication.js** | Login/logout, user validation | Session.js | ✅ Production |

### UI Components
| File | Purpose | Dependencies | Status |
|------|---------|--------------|--------|
| **index.html** | Main application entry, routing | All JS files | ✅ Production |
| **ToolWrapper.html** | Unified tool framework UI | ToolFramework.js | ✅ Production |
| **api-batch-service.html** | API optimization, rate limiting | None | ✅ Production |
| **styles.html** | Global CSS styles | None | ✅ Production |
| **ui-utilities.html** | Shared UI components | None | ✅ Production |

### Tool Implementations
| File | Tool | Integration Status | Notes |
|------|------|-------------------|-------|
| **Tool1_Orientation.js** | Tool 1: Top-Level Assessment | ✅ Integrated | 25 questions, working |
| **Tool2_FinancialClarity.js** | Tool 2: Financial Clarity | 🔄 Pending | Logic exists, needs integration |
| **Tool1_Enhanced_SAVED.js** | Tool 1 Enhanced (32 fields) | 📦 Backup | Enhanced version for future |

### Configuration Files
| File | Purpose | When to Modify |
|------|---------|---------------|
| **Config.js** | System configuration, spreadsheet IDs | Environment changes |
| **appsscript.json** | Google Apps Script manifest | OAuth/scope changes |
| **.clasp.json** | Clasp deployment configuration | Project ID changes |

### Development Support
| File | Purpose | Usage |
|------|---------|-------|
| **Menu.js** | Google Sheets custom menu | Admin functions |
| **SimpleDashboard.js** | Basic dashboard view | Testing/debugging |

## 🔧 Key Integration Points

### Data Flow
```
User Input → index.html → ToolWrapper.html → Tool*.js
                ↓                ↓              ↓
           Authentication → ToolFramework → DataService → Google Sheets
```

### Google Sheets Integration
- **Spreadsheet ID**: `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`
- **Sheets**: Sessions, Responses, CrossToolInsights, Status
- **API Batching**: 2-second rate limiting via api-batch-service.html

### Tool Patterns
The ToolWrapper supports 4 distinct patterns:

1. **Pattern 1: Insights Assessment** (Tool 1)
   - Multi-section forms with progress tracking
   - Auto-save with draft management
   
2. **Pattern 2: Comprehensive Assessment** (Tool 2)
   - Adaptive questioning based on previous answers
   - Cross-tool intelligence integration
   
3. **Pattern 3: Grounding Templates** (Tools 3, 5, 7)
   - Psychological assessment patterns
   - Customized report generation
   
4. **Pattern 4: Interactive Calculators** (Tools 4, 6, 8)
   - Real-time calculations
   - Scenario comparison tools

## 📝 Development Guidelines

### Adding a New Tool
1. Create `Tool[N]_[Name].js` following existing pattern
2. Register in `ToolFramework.js` configuration
3. Update `ToolWrapper.html` with tool metadata
4. Test with TEST001/TEST002 users

### Modifying Existing Tools
1. Tool logic: Edit `Tool*_*.js` files
2. UI changes: Modify `ToolWrapper.html`
3. Data structure: Update `DataService.js`
4. Always test data persistence to sheets

### Deployment Process
```bash
cd v2-sheet-script
clasp push                    # Upload changes
clasp deploy --description "Version description"
clasp deployments            # Get URL
```

### Testing Checklist
- [ ] Login works with TEST001
- [ ] Tool loads without white screen
- [ ] Data saves to Google Sheets
- [ ] Progress tracking accurate
- [ ] Draft save/load functional
- [ ] No HTTP 429 errors
- [ ] Navigation smooth

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| White screen | Loading state issue | Check ToolWrapper loading indicators |
| Data not saving | API rate limit | Verify api-batch-service.html working |
| Tool not loading | Route issue | Check Code.js routing |
| Authentication fails | Session expired | Clear cache, re-login |
| 429 errors | Too many API calls | Increase rate limit delay |

## 📊 Performance Optimizations (V11.43b)

- **File Size**: 30% reduction via modular architecture
- **API Calls**: 90% fewer 429 errors with batching
- **Loading**: Smooth transitions with indicators
- **Caching**: 30-second cache for API responses
- **Architecture**: Separated CSS, dynamic loading

## 🔗 Related Documentation

- **DEPLOYMENT_GUIDE.md** - Detailed deployment process
- **DEBUGGING-GUIDE.md** - Troubleshooting procedures
- **SCALABLE-ARCHITECTURE-PLAN.md** - System design patterns
- **TOOLS_INVENTORY.md** - Complete tool specifications

---

*Last Updated: November 3, 2024 - V11.43b @ Deploy 192*