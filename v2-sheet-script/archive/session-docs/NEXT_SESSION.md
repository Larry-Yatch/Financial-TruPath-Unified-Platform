# Next Session Quick Start Guide

## 🎯 SESSION 1 OBJECTIVES
**Date:** [Next Session]
**Goal:** Build foundation - Sessions, Routing, DataService
**Time:** 5-6 hours

---

## 🚨 FIRST THING: START MONITORING
```bash
# Run this IMMEDIATELY at session start:
node debug-sheets.js watch
# (Use run_in_background: true)
# This shows real-time changes to sheets
```

## ✅ Pre-Session Checklist
- [ ] **START SHEETS WATCHER** (node debug-sheets.js watch)
- [ ] Review DEVELOPMENT_GUIDE.md
- [ ] Review current broken state in Tomorrow.md
- [ ] Have test Client IDs ready (TEST001, TEST002, TEST003)
- [ ] Google Apps Script project open
- [ ] Backup current code

---

## 📋 Task Order (DO IN SEQUENCE)

### Task 1: Create Database (30 min)
```javascript
// 1. Create new Google Spreadsheet: "Financial_TruPath_V2_Data"
// 2. Add these sheets (tabs):
STUDENTS      // Copy roster data here
SESSIONS      // For session tokens
RESPONSES     // All tool data (JSON)
TOOL_STATUS   // Progress tracking
TOOL_ACCESS   // Lock/unlock
ACTIVITY_LOG  // Audit trail
ADMINS        // Admin users
CONFIG        // System settings

// 3. Add headers:
SESSIONS: Session_Token | Client_ID | Created_At | Expires_At | Last_Activity
RESPONSES: Response_ID | Client_ID | Tool_ID | Version | Status | Data | Timestamp
TOOL_STATUS: Client_ID | Tool_1_Status | Tool_1_Date | Tool_2_Status | Tool_2_Date ...
```

### Task 2: Build Session Management (90 min)
Create `Core/Session.gs`:
```javascript
// Key functions needed:
function createSession(clientId) {
  // Generate UUID token
  // Save to SESSIONS sheet
  // Return token
}

function validateSession(token) {
  // Look up token in SESSIONS
  // Check if expired
  // Update last activity
  // Return session data or null
}

function expireSession(token) {
  // Mark session as expired
}

// Test immediately:
// - Create a session
// - Validate it works
// - Check expiry
```

### Task 3: Fix Routing (60 min)
Fix `Code.gs`:
```javascript
function doGet(e) {
  // CRITICAL: This is currently broken
  const session = e.parameter.session;
  const route = e.parameter.route || 'login';
  
  // If no session and not login page, redirect to login
  if (!session && route !== 'login') {
    return showLogin();
  }
  
  // Validate session for protected routes
  if (session && route !== 'login') {
    const validSession = validateSession(session);
    if (!validSession) {
      return showLogin('Session expired');
    }
  }
  
  // Route to appropriate page
  switch(route) {
    case 'login':
      return showLogin();
    case 'dashboard':
      return showDashboard(session);
    case 'tool1':
      return showTool1(session);
    case 'tool2':
      return showTool2(session);
    default:
      return showLogin();
  }
}
```

### Task 4: Create DataService (90 min)
Create `Core/DataService.gs`:
```javascript
// Essential functions:
function saveToolResponse(clientId, toolId, data) {
  // Save to RESPONSES sheet as JSON
  // Handle versioning
}

function getToolResponse(clientId, toolId, version = 'latest') {
  // Fetch from RESPONSES
  // Parse JSON
  // Return data
}

function getDataFromTool(clientId, sourceToolId, fieldPath) {
  // Get specific field from previous tool
  // Handle missing data gracefully
}
```

### Task 5: Test Full Flow (60 min)
```javascript
// Test sequence:
1. Load login page
2. Enter Client ID (TEST001)
3. Get session token
4. Navigate to dashboard with session
5. Navigate to Tool 1 with session
6. Verify session validates on each page
7. Test session expiry
```

---

## 🔥 Current Issues to Fix

### Issue 1: Login → Dashboard Broken
**Current:** After login, dashboard doesn't load
**Fix:** Implement session token passing
**Test:** Login should redirect to dashboard?session=TOKEN

### Issue 2: No Session Management
**Current:** Using URL params for Client ID (insecure)
**Fix:** Replace with session tokens
**Test:** Session should persist across pages

### Issue 3: Mixed HTML Structure
**Current:** Inline HTML in Code.gs + separate templates
**Fix:** Move all to templates (later - not priority)
**Test:** All pages render correctly

---

## 💾 Code Snippets to Use

### UUID Generator
```javascript
function generateUUID() {
  return Utilities.getUuid();
}
```

### Get Sheet by Name
```javascript
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  return ss.getSheetByName(sheetName);
}
```

### Save JSON to Sheet
```javascript
function saveJSON(sheet, data) {
  const json = JSON.stringify(data);
  const row = [
    generateUUID(),
    data.clientId,
    data.toolId,
    1, // version
    'submitted',
    json,
    new Date()
  ];
  sheet.appendRow(row);
}
```

### Parse JSON from Sheet
```javascript
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return null;
  }
}
```

---

## 🧪 Test Data

### Test Client IDs
```
TEST001 - Full data
TEST002 - Partial data  
TEST003 - No data
ADMIN001 - Admin user
```

### Test Session Tokens
```
Generate fresh for each test
Don't hardcode tokens
```

---

## ⚠️ Watch Out For

1. **Don't break existing Tool 1** - It mostly works
2. **Session validation on EVERY page** - No exceptions
3. **Handle missing sessions gracefully** - Redirect to login
4. **Test with real Client IDs early** - Don't wait
5. **Keep changes minimal** - Focus on core issues

---

## 📊 Success Metrics for Session 1

### Must Achieve:
- [ ] Sessions creating and validating
- [ ] Can navigate: Login → Dashboard → Tool
- [ ] Data saves to RESPONSES sheet
- [ ] Session expires after 4 hours

### Nice to Have:
- [ ] Clean error messages
- [ ] Session refresh on activity
- [ ] Basic logging

### Can Skip:
- [ ] UI improvements
- [ ] Advanced features
- [ ] Complete error handling

---

## 🔄 If Things Go Wrong

### Session Creation Fails
- Check SESSIONS sheet exists
- Verify write permissions
- Check UUID generation

### Routing Still Broken
- Add console.log debugging
- Check parameter passing
- Verify function names

### Data Not Saving
- Check sheet permissions
- Verify JSON format
- Test with simple data first

---

## 📝 End of Session Checklist

Before ending Session 1:
- [ ] Commit all changes
- [ ] Test full login flow
- [ ] Document what works/doesn't
- [ ] Update Tomorrow.md with status
- [ ] Plan Session 2 tasks

---

## 🚀 Next Steps (Session 2)

If Session 1 successful:
1. Build Tool 1 completely
2. Build Tool 2 with dependencies
3. Test integration

If Session 1 incomplete:
1. Continue infrastructure
2. Must have sessions working
3. Defer tools if needed

---

**Remember:** Focus on getting sessions and routing working. Everything else depends on this foundation.

**Daddy says:** Test the session creation first before building anything else - if sessions don't work, nothing works