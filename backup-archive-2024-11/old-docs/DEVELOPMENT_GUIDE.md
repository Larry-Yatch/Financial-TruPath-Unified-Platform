# Financial TruPath V2 - Master Development Guide

## 📋 Project Overview

**Project:** Financial TruPath V2 - Unified Assessment Platform
**Timeline:** 2 weeks to deploy Tools 1 & 2
**Students:** 30-40 beta students
**Max Concurrent Users:** 10
**Classes:** Wednesday evenings
**Maintenance Window:** Thursday-Tuesday

## 🎯 Core Requirements

### Functional Requirements
- 8 integrated financial assessment tools
- Data flows between tools (any tool can pull from previous tools)
- Session-based authentication with Client ID validation
- PDF report generation for each tool
- Version control (3 versions per tool per student)
- Admin dashboard for instructor oversight
- Email reports to students on-demand

### Technical Constraints
- Google Apps Script platform
- Google Sheets for data storage (migrate to database in V3)
- Must handle tool dependencies gracefully
- Students may skip tools (backfill required data)
- 20-45 minute completion time per tool
- No alternate data collection method (must not fail)

## 🏗️ Architecture Decisions

### 1. Session Management
**Decision:** Sheet-based session tokens
```
SESSIONS Table:
| Session_Token | Client_ID | Created_At | Expires_At | Last_Activity |
```
- Generate UUID on login
- 4-hour expiration
- Pass via URL: ?session=abc123
- Validate on every request

### 2. Data Storage
**Decision:** Single RESPONSES table with JSON
```
| Response_ID | Client_ID | Tool_ID | Version | Status | Data (JSON) | Timestamp |
```
- One table for all tools (easier migration to database)
- JSON for flexible schema per tool
- Keep 3 versions maximum
- Status: draft/submitted/archived

### 3. Tool Architecture
**Decision:** Plugin-based architecture with evolutionary dependencies
- Each tool is self-contained
- Dependencies discovered and documented as we build
- Graceful fallback for missing data
- Backfill questions when required data missing

### 4. Code Organization
```
v2-sheet-script/
├── Code.gs                 # Thin router only
├── Config.gs              # Configuration
├── Core/
│   ├── Auth.gs           # Authentication
│   ├── Session.gs        # Session management
│   ├── DataService.gs    # Data operations
│   └── Router.gs         # Route handling
├── Services/
│   ├── Report.gs         # PDF generation
│   └── Email.gs          # Email service
├── Tools/
│   ├── Tool1_Orientation.gs
│   ├── Tool2_FinancialClarity.gs
│   └── [Tools 3-8 added later]
├── Admin/
│   └── Dashboard.gs      # Admin features
└── UI/
    ├── login.html
    ├── dashboard.html
    └── admin.html
```

## 💾 Data Flow Architecture

### Flexible Data Mesh
```javascript
// Any tool can pull from any previous tool
Tool4 can access:
- Tool1.answers.age
- Tool1.calculations.riskScore
- Tool2.answers.monthlyBudget
- Tool2.calculations.savingsCapacity
- Tool3.calculations.fearScore
```

### Backfill Strategy
When data is missing:
1. Check what's required
2. Inject missing questions at start of form
3. Save backfilled data to original tools
4. Continue with current tool

### Dependency Documentation (Living Document)
```
DEPENDENCIES (discovered as we build):
Tool1 → Provides: [TBD as we build]
Tool2 → Needs: [TBD], Provides: [TBD]
Tool3 → [To be determined]
```

## 🔐 Security & Admin

### Admin Features
- View all student progress
- Email any report version to student
- Lock/unlock tools per student
- Manual data entry for failed submissions
- Full audit trail

### Admin Access
Controlled by ADMINS sheet:
```
| Admin_Email | Admin_Name | Role | Active |
```

### Lock/Unlock Matrix
```
| Client_ID | Tool_1 | Tool_2 | ... | Tool_8 | Override_All |
| TEST001   | OPEN   | LOCKED | ... | LOCKED | false        |
```

## 🚨 Error Recovery

### Three-Layer Protection
1. **Auto-save** every 60 seconds to localStorage
2. **Validation** before submit
3. **Retry mechanism** with exponential backoff

### Failed Submission Recovery
```javascript
if (saveFailed) {
  // Option 1: Save to localStorage
  // Option 2: Generate recovery code
  // Option 3: Queue for admin manual entry
}
```

## 📊 Database Schema

### Google Sheets Structure
```
Spreadsheet: Financial_TruPath_V2_Data

Sheets (Tabs):
1. STUDENTS - Roster copy
2. SESSIONS - Active sessions
3. RESPONSES - All tool responses
4. TOOL_STATUS - Progress tracking
5. TOOL_ACCESS - Lock/unlock controls
6. ACTIVITY_LOG - Audit trail
7. ADMINS - Admin users
8. CONFIG - System settings
```

## 🚀 Implementation Roadmap

### Week 1: Foundation + Tools 1 & 2

#### Day 1-2: Infrastructure
- [ ] Create Google Sheets structure
- [ ] Implement session management
- [ ] Fix login → dashboard routing
- [ ] Build DataService (flexible for unknown dependencies)

#### Day 3-4: Tool 1
- [ ] Build Tool1_Orientation.gs
- [ ] Implement JSON storage
- [ ] Test end-to-end flow
- [ ] Document what data it provides

#### Day 5-6: Tool 2
- [ ] Build Tool2_FinancialClarity.gs
- [ ] Discover Tool 1 dependencies
- [ ] Implement data pulling from Tool 1
- [ ] Test with/without Tool 1 data

#### Day 7: Integration Testing
- [ ] Test both tools together
- [ ] Verify data persistence
- [ ] Document discovered dependencies

### Week 2: Polish & Deploy

#### Day 8-9: Admin Dashboard
- [ ] Basic admin UI
- [ ] Student progress grid
- [ ] Email report feature
- [ ] Lock/unlock controls

#### Day 10-11: Error Handling & Recovery
- [ ] Auto-save implementation
- [ ] Retry mechanisms
- [ ] Recovery procedures
- [ ] Failed submission queue

#### Day 12: User Testing
- [ ] Test with 10 real users
- [ ] Fix critical bugs only
- [ ] Document known issues

#### Day 13: Production Deployment
- [ ] Deploy to production URL
- [ ] Final verification
- [ ] Admin training
- [ ] Backup procedures

#### Day 14: Buffer
- [ ] Emergency fixes
- [ ] Monitor first users

## ⚠️ Critical Success Factors

1. **Session tokens in EVERY request** - No exceptions
2. **Tool isolation** - Each tool must work standalone
3. **Graceful degradation** - Missing data can't break tools
4. **Data versioning** - Never lose student work
5. **Admin override** - Admin can fix anything manually
6. **Test early with real IDs** - Don't wait until deployment

## 🔄 Deployment Process

### Environments
- **Development:** Script editor test deployment
- **Staging:** Separate deployment for testing
- **Production:** Live URL for students

### Update Protocol
1. Deploy updates Thursday-Tuesday only
2. Code freeze Wednesday afternoon
3. Monitor only during Wednesday classes
4. Test all changes Tuesday before class

## 📝 Testing Checklist

### For Each Tool
- [ ] Standalone functionality
- [ ] With complete previous data
- [ ] With missing previous data
- [ ] Backfill questions appear correctly
- [ ] Data saves to correct locations
- [ ] PDF generates
- [ ] Version control works
- [ ] Session maintains throughout

### System Tests
- [ ] Login with valid Client ID
- [ ] Login with invalid Client ID
- [ ] Session expiration
- [ ] Concurrent user access
- [ ] Admin functions
- [ ] Email report delivery

## 🚫 What We're NOT Building (Yet)

- Email notifications from system
- Advanced analytics
- Real-time collaboration
- Mobile optimization (basic only)
- Batch operations
- API endpoints
- Automated testing
- Complex PDF formatting

## 📞 Emergency Procedures

### If System Fails
1. Check SESSIONS sheet for corruption
2. Verify RESPONSES sheet accessible
3. Check Google Apps Script quotas
4. Enable recovery mode (manual data entry)
5. Collect responses via backup method
6. Admin manual entry post-class

### Rollback Process
1. Keep previous version deployment URL
2. Switch back if critical failure
3. Preserve all data (never delete)
4. Communicate with students immediately

## 🎓 Next Session Tasks

### Session 1: Infrastructure
1. Create Google Sheets structure
2. Build session management
3. Fix routing issues
4. Start Tool 1

### Session 2: Tool Completion
1. Complete Tool 1
2. Build Tool 2
3. Implement dependencies
4. Test integration

### Session 3: Admin & Deploy
1. Build admin dashboard
2. Add error recovery
3. User testing
4. Deploy to production

---

**Last Updated:** October 2024
**Next Review:** After Tool 2 completion
**Contact:** [Your contact info]