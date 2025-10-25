# Proposed Google Apps Script Specialized Agents

## Based on Debugging Guide Pain Points

### 🏥 1. Gas-Doctor Agent
**Purpose:** Diagnose and fix Google Apps Script specific issues
**Triggers:** Before deployment, after errors
**Key Features:**
```javascript
// Automatic fixes for:
- window.location → window.top.location (iframe issues)
- Missing null checks in callbacks
- Duplicate const/let/var declarations
- Unclosed template literals
- Permission scope mismatches

// Detection capabilities:
- "postMessage" errors → iframe communication issues
- 403 errors → deployment permission problems  
- Infinite loops → missing error handlers
```

### 📊 2. Sheets-Monitor Agent  
**Purpose:** Real-time Google Sheets monitoring and validation
**Triggers:** During development, after data operations
**Key Features:**
```javascript
// Monitors:
- New sessions/responses in real-time
- Failed write operations
- Data integrity between Code.js and Sheets
- Sheet quota usage (50,000 cell reads/day)

// Alerts on:
- Data not saving to sheets
- Mismatched column mappings
- Quota approaching limits
```

### 🚀 3. Deploy-Guardian Agent
**Purpose:** Safe deployment management
**Triggers:** Before clasp push/deploy
**Key Features:**
```javascript
// Pre-deployment checks:
- Syntax validation (node -c)
- Remove all console.logs
- Verify test functions removed
- Check OAuth scopes match code
- Validate appsscript.json

// Deployment assistance:
- Generate versioned deployment commands
- Create test URLs with parameters
- Track rollback points
- Document deployment history
```

### 🔄 4. Callback-Surgeon Agent
**Purpose:** Fix async handling issues
**Triggers:** After "Verifying..." hangs, null errors
**Key Features:**
```javascript
// Scans and fixes:
google.script.run
  .withSuccessHandler(function(result) {
    // ✅ Adds: if (!result) return;
    // ✅ Adds: if (!result.success) handleError();
  })
  .withFailureHandler(/* ✅ Ensures this exists */)
  .functionName(params);

// Prevents:
- Infinite loading states
- Null reference crashes  
- Unhandled promise rejections
```

### ⏱️ 5. Quota-Keeper Agent
**Purpose:** Prevent quota exhaustion
**Triggers:** Periodically during execution
**Key Features:**
```javascript
// Tracks:
- Script runtime (6 min max)
- URL Fetch calls (20,000/day)
- Email quota (100/day)
- Trigger total runtime (6 hours/day)

// Optimizations:
- Suggests batch operations
- Implements exponential backoff
- Caches expensive operations
- Breaks long processes into chunks
```

## How These Agents Would Work Together

### Development Flow:
```bash
1. Start coding
   → Sheets-Monitor runs in background
   
2. Hit an error
   → Gas-Doctor diagnoses and suggests fix
   
3. Ready to deploy
   → Deploy-Guardian validates everything
   → Creates safe deployment with test URLs
   
4. Users report issues  
   → Callback-Surgeon checks async handlers
   → Quota-Keeper verifies resource usage
```

### Example Usage:

```javascript
// When you see "Verifying..." forever:
Task: "Fix infinite loading state in login flow"
Agent: callback-surgeon
Result: "Added 3 null checks, fixed 2 missing error handlers"

// Before deployment:
Task: "Prepare code for production deployment"  
Agent: deploy-guardian
Result: "Removed 5 console.logs, fixed syntax, generated test URLs"

// During development:
Task: "Monitor if sessions are saving to sheets"
Agent: sheets-monitor  
Result: "✅ 12 sessions saved, ⚠️ 1 failed (quota exceeded)"
```

## Implementation Priority

1. **Gas-Doctor** - Saves most debugging time (35 min iframe issue!)
2. **Deploy-Guardian** - Prevents broken deployments
3. **Callback-Surgeon** - Fixes most common runtime errors
4. **Sheets-Monitor** - Essential for data validation
5. **Quota-Keeper** - Nice to have for scaling

## Real Impact Examples

Based on your debugging guide lessons:

| Issue | Time Wasted | Agent Solution | Time Saved |
|-------|------------|----------------|------------|
| Iframe navigation | 35 minutes | Gas-Doctor auto-fixes | 34 minutes |
| Permission errors | 30 minutes | Deploy-Guardian validates | 29 minutes |
| Null callbacks | 15 minutes | Callback-Surgeon adds checks | 14 minutes |
| Escaped backtick | 20 minutes | Gas-Doctor finds instantly | 19 minutes |

**Total potential time saved per session: ~90 minutes**