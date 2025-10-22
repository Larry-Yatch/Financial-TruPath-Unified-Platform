# Financial TruPath V2 - Implementation Roadmap

## 🎯 Mission Critical Path
**Goal:** Deploy Tools 1 & 2 in 2 weeks with 30-40 beta students

---

## 📅 Day-by-Day Implementation Plan

### 🚀 SESSION 1: Foundation (Days 1-2)
**Goal:** Fix core infrastructure issues

#### Day 1 Morning: Database Setup (2 hours)
```javascript
// 1. Create Master Spreadsheet
Financial_TruPath_V2_Data
├── STUDENTS (copy from roster)
├── SESSIONS (for tokens)
├── RESPONSES (main data)
├── TOOL_STATUS (progress tracking)
├── TOOL_ACCESS (lock/unlock)
├── ACTIVITY_LOG (audit)
├── ADMINS (admin list)
└── CONFIG (settings)

// 2. Set permissions
// 3. Test basic read/write
```

#### Day 1 Afternoon: Session Management (3 hours)
```javascript
// Core/Session.gs
- createSession(clientId)
- validateSession(token)
- expireSession(token)
- refreshActivity(token)

// Test:
- Login creates session
- Token validates
- Expiry works
- Multiple sessions blocked
```

#### Day 2 Morning: Fix Routing (2 hours)
```javascript
// Fix Code.gs routing
doGet(e) {
  session = validateSession(e.parameter.session)
  route = e.parameter.route
  
  switch(route) {
    case 'login': return showLogin()
    case 'dashboard': return showDashboard(session)
    case 'tool1': return showTool1(session)
    case 'tool2': return showTool2(session)
  }
}

// Test login → dashboard → tool navigation
```

#### Day 2 Afternoon: DataService Foundation (3 hours)
```javascript
// Core/DataService.gs
- saveToolResponse(clientId, toolId, data)
- getToolResponse(clientId, toolId, version)
- getLatestResponse(clientId, toolId)
- getDataFromTool(clientId, toolId, fieldPath)
- tryGetPreviousData(clientId, currentToolId)
```

**End of Session 1 Checkpoint:**
- [ ] Sheets created and accessible
- [ ] Sessions working
- [ ] Routing fixed
- [ ] DataService ready
- [ ] Can navigate: login → dashboard → tool

---

### 🛠️ SESSION 2: Tool Development (Days 3-6)

#### Day 3: Tool 1 Rebuild (Full Day)
```javascript
// Morning: Structure
Tools/Tool1_Orientation.gs
- Define questions/fields
- Create form rendering
- Add validation

// Afternoon: Integration
- Connect to DataService
- Save to RESPONSES
- Test data persistence
- Generate basic PDF
```

#### Day 4: Tool 1 Polish (Half Day)
```javascript
// Morning only:
- Fix any issues
- Test with 5 different IDs
- Verify PDF generation
- Document what data it provides

// Document in DEPENDENCIES.md:
Tool1 Provides:
- answers.firstName
- answers.lastName
- answers.age
- answers.income
- calculations.riskScore
```

#### Day 5: Tool 2 Build (Full Day)
```javascript
// Morning: Standalone build
Tools/Tool2_FinancialClarity.gs
- Create form
- Add Tool 2 specific questions

// Afternoon: Add dependencies
- Identify useful Tool 1 data
- Implement data pulling
- Add backfill for missing Tool 1
- Test both paths
```

#### Day 6: Integration Testing (Full Day)
```javascript
// Test scenarios:
1. Complete Tool 1 → Tool 2 (normal path)
2. Skip Tool 1 → Tool 2 (backfill path)
3. Partial Tool 1 → Tool 2
4. Version control (edit responses)
5. PDF generation both tools
6. Session expiry/renewal
```

**End of Session 2 Checkpoint:**
- [ ] Tool 1 fully functional
- [ ] Tool 2 fully functional
- [ ] Dependencies documented
- [ ] Backfill working
- [ ] PDFs generating
- [ ] Data persisting

---

### 👨‍💼 SESSION 3: Admin & Polish (Days 7-11)

#### Day 7: Dashboard Fix
```javascript
// Fix existing dashboard
- Show Tool 1 & 2 correctly
- Display completion status
- Update progress tracking
- Test with real data
```

#### Day 8-9: Admin Dashboard
```javascript
// Admin/Dashboard.gs
Day 8 Morning: Basic Structure
- Admin authentication
- Student list view
- Progress grid

Day 8 Afternoon: Core Features
- View any student's responses
- Navigate to specific tools
- See version history

Day 9 Morning: Email Feature
- Select report version
- Preview PDF
- Send to student
- Track sent emails

Day 9 Afternoon: Lock/Unlock
- Tool access matrix
- Toggle locks
- Save to TOOL_ACCESS
- Test restrictions
```

#### Day 10: Error Recovery
```javascript
// Morning: Auto-save
- localStorage implementation
- 60-second timer
- Restore on page load

// Afternoon: Failure handling
- Retry mechanism
- Recovery codes
- Admin queue for failures
- Manual entry interface
```

#### Day 11: Critical Bug Fixes
```javascript
// Fix only showstoppers:
- Data loss issues
- Login failures  
- PDF generation errors
- Navigation breaks

// Document known issues for later
```

**End of Session 3 Checkpoint:**
- [ ] Dashboard working
- [ ] Admin can view all data
- [ ] Email reports working
- [ ] Lock/unlock functional
- [ ] Error recovery in place
- [ ] Critical bugs fixed

---

### 🧪 SESSION 4: Testing & Deployment (Days 12-14)

#### Day 12: User Testing
```
Morning: Internal Testing
- Team members test full flow
- Document issues
- Fix critical only

Afternoon: Beta User Testing
- 10 real students
- Monitor for issues
- Gather feedback
- Fix showstoppers only
```

#### Day 13: Production Deployment
```
Morning: Final Preparations
- Backup everything
- Document rollback process
- Prepare admin guide
- Set up monitoring

Afternoon: Deploy
- Deploy to production URL
- Test with real Client IDs
- Verify all functions
- Train admins
```

#### Day 14: Buffer & Launch Support
```
- Monitor early users
- Fix emergency issues
- Document lessons learned
- Plan Tool 3
```

---

## 📋 Session-by-Session Checklist

### Next Session (Session 1):
**Primary Goals:**
1. Create Google Sheets structure
2. Implement session management
3. Fix login → dashboard routing
4. Build DataService foundation

**Must Complete:**
```bash
☐ Create Financial_TruPath_V2_Data spreadsheet
☐ Add all 8 sheets (tabs)
☐ Build Session.gs
☐ Fix Code.gs routing
☐ Test navigation flow
☐ Create DataService.gs
```

**Success Criteria:**
- Can login with Client ID
- Session token generated
- Navigate to dashboard
- Session validates on each page

### Session 2:
**Primary Goals:**
1. Complete Tool 1
2. Complete Tool 2
3. Document dependencies
4. Test integration

**Must Complete:**
```bash
☐ Tool1_Orientation.gs
☐ Tool 1 form in UI
☐ Tool 1 PDF generation
☐ Tool2_FinancialClarity.gs
☐ Tool 2 form in UI
☐ Dependency implementation
☐ Backfill questions
☐ Integration tests
```

### Session 3:
**Primary Goals:**
1. Admin dashboard
2. Email reports
3. Error recovery
4. Polish

**Must Complete:**
```bash
☐ Admin login
☐ Student progress view
☐ Email report feature
☐ Lock/unlock matrix
☐ Auto-save
☐ Recovery procedures
```

### Session 4:
**Primary Goals:**
1. User testing
2. Bug fixes
3. Production deployment
4. Launch support

---

## 🔧 Technical Tasks Breakdown

### Infrastructure Tasks
- [x] Planning complete
- [ ] Create spreadsheet structure
- [ ] Session management system
- [ ] Fix routing architecture
- [ ] DataService implementation
- [ ] Error handling framework

### Tool Development Tasks
- [ ] Tool 1 questions/form
- [ ] Tool 1 calculations
- [ ] Tool 1 PDF template
- [ ] Tool 2 questions/form
- [ ] Tool 2 calculations
- [ ] Tool 2 PDF template
- [ ] Dependency mapping
- [ ] Backfill system

### Admin Features Tasks
- [ ] Admin authentication
- [ ] Progress dashboard
- [ ] Email report system
- [ ] Lock/unlock controls
- [ ] Manual data entry
- [ ] Audit logging

### Testing Tasks
- [ ] Unit tests (if time)
- [ ] Integration tests
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Security review
- [ ] Rollback testing

---

## 🚨 Risk Management

### High Risk Items (Address First)
1. **Session management** - Everything depends on this
2. **Data persistence** - Cannot lose student work
3. **Tool 1 data flow** - Other tools need this

### Medium Risk Items
1. PDF generation timeouts
2. Concurrent user issues
3. Browser compatibility

### Low Risk Items
1. UI polish
2. Advanced features
3. Nice-to-have improvements

---

## 📊 Progress Tracking

### Week 1 Milestones
- [ ] Day 1-2: Infrastructure complete
- [ ] Day 3-4: Tool 1 complete
- [ ] Day 5-6: Tool 2 complete
- [ ] Day 7: Integration verified

### Week 2 Milestones
- [ ] Day 8-9: Admin dashboard complete
- [ ] Day 10-11: Error recovery & fixes
- [ ] Day 12: User testing complete
- [ ] Day 13: Deployed to production
- [ ] Day 14: Launch successful

---

## 🎯 Definition of Done

### Tool is "Done" When:
- Form renders correctly
- Data saves to RESPONSES
- PDF generates
- Version control works
- Can edit previous responses
- Backfill handles missing data
- Admin can view/email reports

### System is "Ready" When:
- 10 concurrent users tested
- No data loss in testing
- Admin functions work
- Error recovery tested
- Rollback plan documented
- Admins trained

---

## 📝 Quick Reference

### Priority Order:
1. Fix what's broken (routing, sessions)
2. Get Tool 1 working completely
3. Get Tool 2 working with Tool 1 data
4. Add admin capabilities
5. Add error recovery
6. Test with real users
7. Deploy

### Daily Standup Questions:
- What's blocking progress?
- What's the next critical task?
- Any scope creep to cut?
- Are we on track for deadline?

### When Stuck:
1. Check DEVELOPMENT_GUIDE.md
2. Review PLANNING_DECISIONS.md
3. Simplify the approach
4. Document and defer to V3
5. Ask: "What's the minimum that works?"

---

**Document Status:** Active roadmap
**Timeline:** 14 days from start
**Last Updated:** October 2024
**Critical Date:** 2 weeks from today