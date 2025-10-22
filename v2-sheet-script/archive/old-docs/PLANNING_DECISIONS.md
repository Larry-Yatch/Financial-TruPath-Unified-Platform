# Financial TruPath V2 - Planning Decisions Log

## 📋 Executive Summary

This document captures all major planning decisions made during the architecture design phase for Financial TruPath V2. These decisions were made considering a 2-week deployment timeline for Tools 1 & 2, with 30-40 beta students.

## 🔑 Key Decisions

### 1. Session Management
**Decision:** Sheet-based session tokens
**Alternative Considered:** URL parameters
**Rationale:** 
- Security (tokens can't be guessed)
- Clean URLs without exposing Client IDs
- Ability to expire sessions
- Track active users

### 2. Data Storage Architecture
**Decision:** Single RESPONSES table with JSON storage
**Alternative Considered:** Separate table per tool with column storage
**Rationale:**
- Easier migration to PostgreSQL later
- Flexible schema (each tool can have different fields)
- Simple backup (one table)
- Would need 200+ columns otherwise

### 3. Tool Dependencies
**Decision:** Evolutionary discovery with flexible architecture
**Alternative Considered:** Pre-define all dependencies upfront
**Rationale:**
- Original tools weren't designed for data sharing
- Don't know all dependencies yet
- Can discover natural connections as we build
- Avoids analysis paralysis

### 4. Backfill Strategy
**Decision:** Inject missing questions at form start
**Alternative Considered:** Block access until previous tools complete
**Rationale:**
- Students may miss classes/tools
- Better user experience
- Ensures data completeness
- Maintains tool progression flexibility

### 5. Version Control
**Decision:** Keep 3 versions maximum per tool per student
**Alternative Considered:** Unlimited versions or single version
**Rationale:**
- Balance between history and storage
- Allows error recovery
- Prevents unlimited growth
- Sufficient for audit needs

### 6. Admin Features Priority
**Decision:** Email reports on-demand, lock/unlock matrix
**Deferred:** Data export for analysis, batch operations
**Rationale:**
- Email reports critical for student communication
- Lock/unlock needed for managing access
- Export can wait for V3
- Focus on MVP for 2-week deadline

### 7. PDF Generation
**Decision:** Generate immediately on submission
**Alternative Considered:** Queue for async generation
**Rationale:**
- 10 concurrent users max (no scale issues)
- Instant gratification for students
- Simpler implementation
- Can upgrade in V3 if needed

### 8. Mobile Support
**Decision:** Basic responsive design only
**Alternative Considered:** Full mobile optimization
**Rationale:**
- Time constraints (2 weeks)
- Most students use computers
- Can enhance in V3
- Focus on core functionality

### 9. Error Recovery
**Decision:** 3-layer protection (auto-save, validation, retry)
**Alternative Considered:** Simple save with error message
**Rationale:**
- No alternate data collection method
- Critical that submissions don't fail
- Multiple fallback options
- Admin can manually recover if needed

### 10. Code Organization
**Decision:** Plugin architecture with isolated tools
**Alternative Considered:** Monolithic application
**Rationale:**
- Adding tools won't break existing ones
- Clear separation of concerns
- Easier testing
- Multiple developers can work in parallel

## 🎯 Scope Decisions

### In Scope for V2 Beta
✅ Tools 1 & 2 fully functional
✅ Basic admin dashboard
✅ Session management
✅ Data persistence with versions
✅ PDF generation
✅ Email reports (admin triggered)
✅ Lock/unlock controls
✅ Error recovery
✅ Basic responsive design

### Out of Scope (Deferred to V3)
❌ Tools 3-8 (added weekly during course)
❌ Automated email notifications
❌ Advanced analytics
❌ Data export features
❌ Mobile app optimization
❌ Real-time collaboration
❌ Automated testing
❌ Complex PDF layouts
❌ Batch operations

## 🔄 Data Flow Decisions

### Tool Communication
- Any tool can pull from ANY previous tool
- Both raw answers AND calculated results available
- Dependencies discovered as we build
- Graceful handling of missing data

### Data Structure
```javascript
// Flexible structure supporting unknown dependencies
{
  response_id: "R001",
  client_id: "TEST001",
  tool_id: 1,
  version: 1,
  data: {
    answers: {}, // Raw user input
    calculations: {}, // Processed results
  },
  dependencies_used: {} // Track what was pulled
}
```

## 📅 Timeline Decisions

### Week 1 Focus
- Infrastructure (sessions, routing)
- Tool 1 complete
- Tool 2 complete
- Basic integration

### Week 2 Focus
- Admin dashboard
- Error handling
- User testing
- Production deployment

### Maintenance Windows
- Classes: Wednesday evenings
- Updates: Thursday-Tuesday
- Code freeze: Wednesday afternoon
- Emergency fixes: Between weekly classes

## 🚨 Risk Mitigation Decisions

### Primary Risks Identified
1. **Data loss** → Version control, auto-save, backups
2. **Session failures** → Sheet-based tokens, 4-hour expiry
3. **Concurrent users** → Tested for 10 users, queuing unnecessary
4. **Missing dependencies** → Backfill questions, graceful degradation
5. **Deployment failures** → Rollback plan, Wednesday freeze

### Backup Strategies
- Local storage auto-save
- Recovery codes for failed submissions
- Admin manual data entry
- Previous version deployment URL

## 💡 Technology Decisions

### Platform
- **Google Apps Script** (current constraint)
- **Google Sheets** for data (migrate V3)
- **No external databases** (yet)
- **No frameworks** (vanilla JS)

### Why Not Supabase/Firebase Now?
- 2-week timeline too tight
- Keep complexity low for beta
- Prove concept first
- Migration path clear for V3

## 📊 Performance Targets

### Agreed Metrics
- Page load: < 2 seconds
- Form save: < 3 seconds  
- PDF generation: < 10 seconds
- Concurrent users: 10
- Data reliability: 99.9%
- Zero data loss incidents

## 🔐 Security Decisions

### Authentication
- Client ID validation against roster
- No passwords (ID only)
- Session tokens expire
- Admin list in separate sheet

### Data Protection
- No sensitive data in URLs
- Input sanitization
- Admin actions logged
- Backup all data daily

## 📝 Documentation Decisions

### What to Document
- Tool dependencies (as discovered)
- Admin procedures
- Emergency contacts
- Known issues
- Deployment process

### Documentation Format
- Markdown files in repo
- Living documents (update as build)
- Quick reference guides for admins

## ✅ Final Go/No-Go Criteria

### Must Have for Launch
1. Students can login
2. Tool 1 saves and generates PDF
3. Tool 2 saves and generates PDF
4. Dashboard shows both tools
5. Admin can view progress
6. Session management works
7. Data persists between sessions

### Can Ship Without
- Perfect UI
- All edge cases handled
- Advanced features
- Complete documentation
- Automated tests

## 🎯 Success Metrics

### Beta Success Defined As
- 30 students can complete Tools 1 & 2
- No data loss incidents
- < 5% need support
- PDFs generate for all
- Admin can manage students
- Ready for Tool 3 by Week 3

---

## Decision Log Updates

| Date | Decision | Made By | Rationale |
|------|----------|---------|-----------|
| Oct 2024 | Sheet-based sessions | Planning Session | Security over simplicity |
| Oct 2024 | JSON storage | Planning Session | Flexibility for unknown schemas |
| Oct 2024 | Evolutionary dependencies | Planning Session | Don't know all connections yet |
| Oct 2024 | 3 versions max | Planning Session | Balance history vs storage |

---

**Document Status:** Living document - update as decisions are made
**Last Updated:** October 2024
**Next Review:** After Tool 2 deployment