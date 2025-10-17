# Financial TruPath V2.0 - Architecture Plan

## Current Status
- ✅ Tool 1 (Orientation) - Complete with PDF reports
- ✅ Authentication system designed (based on Investment Tool pattern)
- 🔄 Project restructuring in progress

## Architecture Overview

### 1. File Structure (Clean & Scalable)
```
v2-sheet-script/
├── Core/
│   ├── Code.js              # Main entry, doGet, routing
│   ├── Config.js            # Configuration constants
│   ├── Authentication.js    # Client ID gate & roster lookup
│   └── DataHub.js          # Unified data management
│
├── Middleware/
│   ├── Middleware.js       # Cross-tool intelligence
│   ├── ReportGenerator.js  # PDF/HTML report generation
│   └── Analytics.js        # Progress tracking & metrics
│
├── Tools/
│   ├── Tool1_Orientation.js
│   ├── Tool2_FinancialClarity.js
│   ├── Tool3_ControlFear.js
│   ├── Tool4_FreedomFramework.js
│   ├── Tool5_FalseSelfView.js
│   ├── Tool6_RetirementBlueprint.js
│   ├── Tool7_IssuesShowingLove.js
│   └── Tool8_InvestmentTool.js
│
├── UI/
│   ├── index.html          # Main UI template
│   ├── login.html          # Authentication UI
│   └── components/         # Reusable UI components
│
└── Utils/
    ├── TestSuite.js        # Testing framework
    ├── Debug.js            # Debug utilities
    └── Migration.js        # Data migration tools

```

### 2. Data Flow Architecture

```
User Entry → Authentication Gate → Tool Selection → Data Collection → Processing → Storage → Reporting
     ↓              ↓                    ↓              ↓              ↓           ↓
  Login UI    Roster Check        Tool Router    Form Handler    DataHub    Google Sheets
                                                       ↓
                                                  Middleware
                                                  (Insights)
```

### 3. Authentication Strategy (Phase 1 - Google Sheets)

**Based on Investment Tool Pattern:**
- Client ID required for access
- Validates against roster spreadsheet
- Session stored client-side
- Each tool submission includes Client ID

**Roster Spreadsheet Structure:**
```
| First Name | Last Name | Email | Phone | Client_ID | Enrolled | Status |
```

### 4. Data Storage Strategy

**Phase 1: Google Sheets (Current)**
- One sheet per tool
- Client ID as primary key
- Timestamp for versioning
- Calculated scores stored

**Phase 2: Supabase (Future)**
- PostgreSQL tables
- Real-time subscriptions
- Better querying capabilities
- Maintains same API interface

### 5. Tool Development Process

**Weekly Release Cycle:**
- Week 1: Tool 1 (Orientation) ✅
- Week 2: Tool 2 (Financial Clarity)
- Week 3: Tool 3 (Control Fear)
- Week 4: Tool 4 (Freedom Framework)
- Week 5: Tool 5 (False Self View)
- Week 6: Tool 6 (Retirement Blueprint)
- Week 7: Tool 7 (Issues Showing Love)
- Week 8: Tool 8 (Investment Tool Integration)

**Each Tool Module Contains:**
```javascript
const Tool[N]_[Name] = {
  getFormConfig(),        // Form structure
  validateInput(),        // Input validation
  processSubmission(),    // Process & save
  getExistingData(),     // Load previous data
  calculateScores(),     // Tool-specific scoring
  generateReport()       // Tool-specific report
}
```

### 6. Middleware Intelligence Layer

**Cross-Tool Features:**
- Pattern recognition across tools
- Risk scoring
- Progress tracking
- Personalized recommendations
- Next tool suggestions
- Unified insights

### 7. User Management System

**Session Management:**
```javascript
{
  sessionId: UUID,
  clientId: normalized_id,
  firstName: string,
  lastName: string,
  email: string,
  loginTime: timestamp,
  lastActivity: timestamp,
  completedTools: [],
  currentTool: string
}
```

**Progress Tracking:**
- Tools completed
- Partially completed forms
- Last activity
- Overall profile strength
- Recommended next actions

### 8. Deployment Strategy

**Google Apps Script Web App:**
- Single deployment URL
- Versioned deployments
- Test deployments for staging
- Production deployment for clients

**Environment Management:**
```javascript
const ENV = {
  mode: 'development', // or 'production'
  roster: {
    dev: 'test_roster_sheet_id',
    prod: 'production_roster_sheet_id'
  },
  features: {
    debugMode: true,
    testAccounts: true
  }
}
```

### 9. Testing Strategy

**Three-Layer Testing:**
1. **Unit Tests**: Individual functions
2. **Integration Tests**: Tool workflows
3. **System Tests**: End-to-end scenarios

**Test Data:**
- TEST- prefix for test Client IDs
- Separate test roster sheet
- Automated cleanup functions

### 10. Migration Plan

**From Monolithic to Modular:**
1. ✅ Extract Tool 1 logic to separate file
2. ✅ Create Authentication module
3. ⏳ Move report generation to dedicated module
4. ⏳ Refactor index.html to use components
5. ⏳ Create tool router in Code.js
6. ⏳ Implement progress dashboard

## Implementation Timeline

### Phase 1: Foundation (Week 1) - CURRENT
- [x] Create Authentication.js
- [x] Create Tool1_Orientation.js
- [x] Document architecture plan
- [ ] Refactor Code.js as router
- [ ] Create ReportGenerator.js
- [ ] Update index.html to use modules

### Phase 2: User Management (Week 2)
- [ ] Implement login UI
- [ ] Create session management
- [ ] Add progress tracking
- [ ] Build user dashboard
- [ ] Test authentication flow

### Phase 3: Tool 2 Implementation (Week 3)
- [ ] Create Tool2_FinancialClarity.js
- [ ] Implement form UI
- [ ] Add scoring logic
- [ ] Integrate with Middleware
- [ ] Generate combined insights

### Phase 4: Testing & Refinement (Week 4)
- [ ] Complete test coverage
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Client testing

## Success Metrics

1. **Code Maintainability**
   - Each tool < 500 lines
   - Clear separation of concerns
   - Consistent patterns

2. **Performance**
   - Form load < 2 seconds
   - Save operation < 3 seconds
   - Report generation < 5 seconds

3. **User Experience**
   - Single sign-on for all tools
   - Progress persistence
   - Clear navigation
   - Mobile responsive

4. **Data Integrity**
   - No data loss
   - Proper validation
   - Audit trail
   - Backup strategy

## Next Immediate Steps

1. **Complete Project Restructuring**
   - Move existing code to new structure
   - Create missing modules
   - Update imports/references

2. **Implement Authentication Flow**
   - Add login UI
   - Connect to roster
   - Test with real Client IDs

3. **Create Tool Router**
   - URL-based tool selection
   - Progress-based recommendations
   - Navigation between tools

4. **Build Progress Dashboard**
   - Show completed tools
   - Display insights
   - Recommend next steps
   - Download all reports

## Questions Resolved

1. **Database**: Google Sheets now, Supabase later ✅
2. **Authentication**: Use Investment Tool pattern ✅  
3. **Release Schedule**: One tool per week ✅
4. **Multi-device**: No real-time sync needed, session-based ✅

## Technical Decisions

1. **No Framework**: Pure Google Apps Script + vanilla JS
2. **PDF Generation**: Server-side using Utilities.newBlob()
3. **Data Format**: JSON-like objects in Sheets
4. **Security**: Client ID validation + roster check
5. **Versioning**: Git for code, timestamps for data