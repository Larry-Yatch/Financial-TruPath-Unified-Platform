# 🔧 Debugging Guide - Financial TruPath V2

## 🚨 Common Issues & Solutions (Learned the Hard Way)

### 1. "You need access" Error
**Symptom:** Google Drive "You need access" page after login  
**NOT the problem:** Your code  
**Real problem:** Deployment permissions  
**Solution:**
```bash
# Create fresh deployment with new permissions
clasp deploy --description "Fresh Deploy"
```
**Time saved:** 30 minutes of code debugging

### 2. Template Literal Syntax Errors
**Symptom:** "Unexpected identifier 'html'" at random line  
**Real problem:** Unclosed or escaped backtick somewhere earlier  
**Debug approach:**
```bash
# Check if all backticks are balanced
node -e "const fs = require('fs'); const code = fs.readFileSync('Code.js', 'utf8'); const matches = code.match(/\`/g); console.log('Backticks:', matches.length, 'Is even?', matches.length % 2 === 0);"

# Validate syntax
node -c Code.js
```
**Gotcha:** One escaped backtick (\`) breaks EVERYTHING after it

### 3. "Cannot read properties of null" in Callbacks
**Symptom:** Infinite loop, "Verifying..." forever  
**Real problem:** google.script.run returning null  
**Prevention:**
```javascript
// ALWAYS do this in callbacks:
.withSuccessHandler(function(result) {
  if (!result) {
    showAlert('No response from server', 'error');
    return;
  }
  if (result.success) { /* continue */ }
})
```

### 4. Multiple Const Declarations
**Symptom:** Syntax error on deployment  
**Real problem:** Same variable name in different parts of file  
**Quick check:**
```bash
# Find all const declarations with same name
grep -n "const.*html" Code.js
```
**Fix:** Rename to unique names (loginHtml, dashboardHtml, etc.)

### 5. Iframe Navigation Issues (35-Minute Lesson!)
**Symptom:** Dashboard navigation shows blank page, but direct URL works  
**Console clue:** "dropping postMessage.. deserialize threw error"  
**Real problem:** Google Apps Script HTML runs in sandboxed iframe  
**Wrong approach:** Spent 35 min fixing code that wasn't broken  
**Quick fix:**
```javascript
// WRONG - stays in iframe:
window.location.href = toolUrl;

// RIGHT - breaks out of iframe:
window.top.location.href = toolUrl;
```
**Time saved:** 35 minutes and 6 unnecessary deployments!  
**Lesson:** When something works one way but not another, debug the DIFFERENCE, not the shared code

## 📊 Real-Time Monitoring

### Always Start With Monitoring
```bash
# Run this FIRST in every session (background):
node debug-sheets.js watch

# Check what's actually happening in sheets:
node debug-sheets.js summary
node debug-sheets.js sessions
```

### Browser Console is Gold
Press F12 and check:
- Network tab (403 errors = permissions)
- Console tab (null reference = missing checks)
- Check the actual error, not the symptom

## 🚀 Deployment Checklist

### Before Deploying:
```bash
# 1. Validate syntax
node -c Code.js

# 2. Push to Apps Script
clasp push

# 3. Create NEW deployment (don't update old ones)
clasp deploy --description "V[X.X] Description"
```

### Current Working Deployment:
```
URL: https://script.google.com/macros/s/AKfycbzJ02GAvhdpOFS4ZBQig_xfnsSLkwacBrzwFRiGBvhWcYH2uIiVqyYVJ3WWEBFcsxuO/exec
Test ID: TEST001
Version: V5.1
```

## 🎯 Quick Fixes That Actually Work

| Problem | Don't Do | Do Instead |
|---------|----------|------------|
| 403 Error | Debug code for hours | Create new deployment |
| Syntax Error | Hunt line by line | Check for unclosed strings/backticks |
| Null Error | Add more error handling | Check if function exists first |
| Login Loop | Rewrite authentication | Add null checks to callbacks |
| Blank Page | Check permissions | Look at browser console |

## 🧠 Decision Tree

```
Error occurs
├── Check browser console first
├── Is it 403/permissions? → New deployment
├── Is it syntax error? → Check backticks/quotes
├── Is it null reference? → Add null checks
├── Works one way but not another? → Debug the DIFFERENCE
├── See "postMessage" errors? → Iframe issue (use window.top)
├── Still broken? → Check monitoring (debug-sheets.js)
└── Really stuck? → Direct test URL with params
```

## 🔥 Emergency URLs

```bash
# Direct dashboard (bypass login):
https://[DEPLOYMENT_ID]/exec?route=dashboard&client=TEST001&session=test

# Admin panel:
https://[DEPLOYMENT_ID]/exec?route=admin&key=admin2024

# Force fresh login:
https://[DEPLOYMENT_ID]/exec?route=login
```

## 💾 Saved Patterns

### Pattern 1: Safe Callback Handler
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (!result) {
      handleError('No response from server');
      return;
    }
    if (!result.success) {
      handleError(result.error || 'Unknown error');
      return;
    }
    // Safe to use result here
  })
  .withFailureHandler(function(error) {
    console.error('Server error:', error);
    handleError('Server error: ' + error);
  })
  .yourFunction(params);
```

### Pattern 2: Debug Without Breaking
```javascript
// Add these temporarily for debugging:
console.log('DEBUG: About to call function');
console.log('DEBUG: Parameters:', params);
console.log('DEBUG: Result received:', result);
```

## 📝 Lessons Learned Log

1. **2024-10-21:** Escaped backtick broke entire file - always check syntax first
2. **2024-10-21:** Deployment permissions are separate from code - new deployment = fresh start
3. **2024-10-21:** Null checks prevent infinite loops - never trust callbacks to return data
4. **2024-10-21:** Browser console reveals true errors - "Verifying..." usually means check console
5. **2024-10-22:** Iframe navigation wasted 35 minutes - when direct URL works but navigation doesn't, it's window.top.location issue
6. **2024-10-22:** "postMessage" errors = iframe communication failure, not code bug

## 📋 Code Review Checklist

### Google Apps Script Specific Reviews
- [ ] Check for quota limits (6 min execution time)
- [ ] Verify API call limits (URL Fetch, Gmail, etc.)
- [ ] Check for proper error handling in triggers
- [ ] Validate manifest file (appsscript.json)
- [ ] Review OAuth scopes requested

### Performance Review
- [ ] Look for unnecessary SpreadsheetApp calls in loops
- [ ] Check for batch operations instead of cell-by-cell
- [ ] Verify caching strategy for expensive operations
- [ ] Check for proper use of LockService for concurrent access

### Security Review
- [ ] No hardcoded credentials or API keys
- [ ] Input validation on all user inputs
- [ ] HTML sanitization for web app responses
- [ ] Session validation implemented
- [ ] CSRF protection for forms

### Code Quality Review
- [ ] No console.log statements in production
- [ ] Consistent error handling pattern
- [ ] No duplicate function definitions
- [ ] Clear separation of concerns
- [ ] Proper comments for complex functions

### Pre-Deployment Review
```javascript
// 1. Remove all console.logs
// 2. Enable all security checks
// 3. Verify all TODOs completed
// 4. Check quota usage
// 5. Test with TEST001/TEST002
```

## 🔴 Common Google Apps Script Issues

### Quota Exhaustion
**Solution:** Implement exponential backoff, use batch operations, cache frequently accessed data

### Timeout Errors (6 min limit)
**Solution:** Break long operations into chunks, use time-based triggers for long processes

### Concurrent Access Issues
**Solution:** Use LockService, implement retry logic, design for eventual consistency

### Authentication Problems
**Solution:** Proper OAuth scope declaration, session management with expiry, clear error messages

## 🚦 Status Indicators

- ✅ **Current Version:** V11.43b @ Deploy 192
- ✅ **Production Status:** All systems operational
- ✅ **Tool 1:** Fully integrated and working
- ✅ **Sessions:** Creating and saving successfully
- ✅ **Google Sheets:** Data persisting correctly

---
*Last updated: November 3, 2024 - Added code review checklist*
*Remember: It's usually simpler than you think!*