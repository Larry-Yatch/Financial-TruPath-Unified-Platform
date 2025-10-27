# 🚦 Staged Deployment Pipeline

Stop deploying broken code! Follow this systematic process:

## ✋ THE GOLDEN RULE
**NEVER deploy immediately after writing code**

## 📋 The 5-Stage Pipeline

### Stage 1: WRITE
```bash
# Write your code changes
# Save the file
```

### Stage 2: REVIEW (Automated)
```bash
# Run ALL checks before even thinking about deployment
./start-agents.sh quick

# Or run individually:
node agents/gas-doctor.js          # Check for GAS issues
node agents/callback-surgeon.js    # Check async handlers
node agents/quota-keeper.js        # Check resource usage
```

### Stage 3: FIX
```bash
# Auto-fix what can be fixed
./start-agents.sh fix

# Manual fix what can't be auto-fixed
# Re-run Stage 2 until clean
```

### Stage 4: VERIFY
```bash
# Pre-deployment validation
node agents/deploy-guardian.js check

# Only proceed if you see:
# "✅ READY TO DEPLOY"
```

### Stage 5: DEPLOY
```bash
# NOW you can deploy
node agents/deploy-guardian.js deploy "Description of changes"
```

## 🔴 STOP POINTS

**DO NOT PROCEED if you see:**
- 🔴 CRITICAL issues
- ❌ Syntax errors
- ❌ Missing dependencies
- ⚠️ Security warnings

## 💡 Quick Commands

### Before ANY deployment:
```bash
# One command to check everything
npm run pre-deploy

# This runs:
# 1. Syntax check
# 2. Gas-Doctor analysis
# 3. Callback-Surgeon check
# 4. Deploy-Guardian validation
# Shows: READY or BLOCKED
```

### The "Safe Deploy" Command:
```bash
# This ONLY deploys if all checks pass
npm run safe-deploy "v1.0 Fixed login"
```

## 📝 Manual Checklist (When Working with Claude)

When I write code for you, BEFORE deploying:

1. **Ask me to review:**
   ```
   "Run the validation agent on the code you just wrote"
   ```

2. **Check locally:**
   ```bash
   node agents/gas-doctor.js
   ```

3. **Test critical paths:**
   - Login flow works?
   - Data saves to sheets?
   - No console.logs left?

4. **Stage deployment:**
   ```bash
   # First: Test deployment
   clasp push
   # Test in browser with test URL
   
   # Then: Production deployment
   clasp deploy --description "Tested: [what you tested]"
   ```

## 🚨 Emergency Rollback

If something breaks after deployment:
```bash
# List deployments
clasp deployments

# Revert to previous version
clasp redeploy [deployment-id] [version-number]
```

## 🎯 The New Workflow

### ❌ OLD WAY (Problem):
```
Write → Deploy → Discover Errors → Fix in Production → Stress
```

### ✅ NEW WAY (Solution):
```
Write → Review → Fix → Verify → Test → Deploy → Success
```

## 🤖 Automation Setup

Add to package.json:
```json
{
  "scripts": {
    "check": "node agents/gas-doctor.js && node agents/callback-surgeon.js analyze",
    "pre-deploy": "npm run check && node agents/deploy-guardian.js check",
    "safe-deploy": "npm run pre-deploy && node agents/deploy-guardian.js deploy",
    "fix": "./start-agents.sh fix"
  }
}
```

Then you just run:
```bash
npm run pre-deploy  # Check if ready
npm run fix         # Fix issues
npm run safe-deploy "version description"  # Deploy safely
```

## 🔒 Enforcement Rules

1. **Deploy-Guardian creates `.deployment-blocked` file when critical issues exist**
2. **Deployment script checks for this file and refuses to deploy**
3. **Only removes block when all issues resolved**

## 📊 Success Metrics

Following this pipeline should result in:
- 0 syntax errors in production
- 0 console.logs in production  
- 0 "undefined is not a function" errors
- 0 iframe navigation issues
- 100% tested before deployment

---

Remember: **Every minute spent in review saves 10 minutes of debugging**