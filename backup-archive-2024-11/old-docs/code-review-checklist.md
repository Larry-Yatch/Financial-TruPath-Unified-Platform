# Code Review Checklist for Google Apps Script

## Automated Review Process

Run these commands to perform comprehensive code review:

### 1. Security Audit
```bash
# Use locksmith agent to check for vulnerabilities
# Focuses on: credentials, XSS, injection, exposed data
```

### 2. Bug Detection
```bash
# Use bugsy agent to find runtime errors
# Focuses on: undefined variables, null references, syntax errors
```

### 3. Configuration Check
```bash
# Use murphy agent to validate setup
# Focuses on: dependencies, APIs, quotas, manifest
```

### 4. Full Validation
```bash
# Use validation agent for complete review
# Focuses on: all issues without philosophy
```

## Manual Review Points

### Google Apps Script Specific
- [ ] Check for quota limits (6 min execution time)
- [ ] Verify API call limits (URL Fetch, Gmail, etc.)
- [ ] Check for proper error handling in triggers
- [ ] Validate manifest file (appsscript.json)
- [ ] Review OAuth scopes requested

### Performance
- [ ] Look for unnecessary SpreadsheetApp calls in loops
- [ ] Check for batch operations instead of cell-by-cell
- [ ] Verify caching strategy for expensive operations
- [ ] Check for proper use of LockService for concurrent access

### Security
- [ ] No hardcoded credentials or API keys
- [ ] Input validation on all user inputs
- [ ] HTML sanitization for web app responses
- [ ] Session validation implemented
- [ ] CSRF protection for forms

### Code Quality
- [ ] No console.log statements in production
- [ ] Consistent error handling pattern
- [ ] No duplicate function definitions
- [ ] Clear separation of concerns
- [ ] Proper JSDoc comments for complex functions

### Testing
- [ ] Test functions separated from production code
- [ ] Edge cases handled (empty inputs, null values)
- [ ] Error scenarios properly tested
- [ ] Integration with Google Sheets tested

## Review Commands

### Quick Review (5 min)
```javascript
// Run validation agent with focus on critical issues only
```

### Thorough Review (15 min)
```javascript
// Run all specialized agents in sequence:
// 1. locksmith for security
// 2. bugsy for bugs
// 3. murphy for config
// 4. validation for completeness
```

### Pre-Deployment Review
```javascript
// 1. Remove all console.logs
// 2. Enable all security checks
// 3. Verify all TODOs completed
// 4. Run full test suite
// 5. Check quota usage
```

## Common Issues in Apps Script

1. **Quota Exhaustion**
   - Solution: Implement exponential backoff
   - Use batch operations
   - Cache frequently accessed data

2. **Timeout Errors**
   - Solution: Break long operations into chunks
   - Use time-based triggers for long processes
   - Implement progress tracking

3. **Concurrent Access**
   - Solution: Use LockService
   - Implement retry logic
   - Design for eventual consistency

4. **Authentication Issues**
   - Solution: Proper OAuth scope declaration
   - Session management with expiry
   - Clear error messages for auth failures