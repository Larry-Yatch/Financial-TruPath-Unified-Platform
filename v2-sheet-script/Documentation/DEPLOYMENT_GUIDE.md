# Deployment Guide - Financial TruPath Unified Platform

## 🚀 Quick Deployment Command

For experienced users who know the system is ready:
```bash
# All-in-one deployment (after testing)
git add -A && \
git commit -m "V11.44 - Your description" && \
git push origin main && \
cd v2-sheet-script && \
clasp push && \
clasp deploy --description "V11.44 - Your description"
```

## ✋ GOLDEN RULES

1. **NEVER deploy immediately after writing code**
2. **ALWAYS test with TEST001/TEST002 users first**
3. **ALWAYS run monitoring during deployment**
4. **NEVER skip the verification stage**

## 📋 Complete Deployment Pipeline

### Stage 1: PRE-DEPLOYMENT CHECKS

```bash
# Start monitoring (REQUIRED)
node debug-sheets.js watch

# Verify sheets connection
node check-sheets.js

# Check for syntax errors
cd v2-sheet-script
clasp push --dry-run

# Review changes
git status
git diff
```

### Stage 2: LOCAL TESTING

1. **Run local verification:**
```bash
# Test critical paths
- Login with TEST001
- Navigate to Tool 1
- Fill and save form
- Check monitor for saves
- Verify in Google Sheets
```

2. **Check for common issues:**
- [ ] No console.log statements left
- [ ] No debugger statements
- [ ] No hardcoded test data
- [ ] No commented-out production code
- [ ] All API calls use batching service

### Stage 3: VERSION CONTROL

```bash
# Stage changes
git add -A

# Review what's being committed
git status

# Commit with descriptive message
git commit -m "V11.44 - Brief description

Changes:
- Feature/fix 1
- Feature/fix 2
- Feature/fix 3

Testing: Verified with TEST001
Deploy: @193"

# Push to GitHub
git push origin main
```

### Stage 4: DEPLOYMENT

```bash
# Navigate to script directory
cd v2-sheet-script

# Push to Google Apps Script
clasp push

# Create new versioned deployment
clasp deploy --description "V11.44 - Same as git commit"

# Get deployment info
clasp deployments
```

### Stage 5: POST-DEPLOYMENT VERIFICATION

```bash
# 1. Get new deployment URL
clasp deployments

# 2. Test in production
- Open deployment URL in Chrome (incognito)
- Login with TEST001
- Test changed functionality
- Verify data persistence
- Check for white screens
- Monitor for 429 errors

# 3. Check monitoring
- Watch debug-sheets.js output
- Verify no errors in console
- Confirm data in sheets
```

## 🔄 Version Numbering Convention

| Change Type | Version Change | Example |
|-------------|---------------|---------|
| Major feature/breaking change | V11 → V12 | New tool integration |
| Feature addition | V11.43 → V11.44 | Add new functionality |
| Bug fix | V11.43b → V11.43c | Fix specific issue |
| Emergency hotfix | Append letter | V11.43b-hotfix |

## 🚨 Rollback Procedures

If deployment causes issues:

### Quick Rollback
```bash
# List all deployments
clasp deployments

# Find previous working deployment ID and version
# Redeploy previous version
clasp redeploy [deployment-id] [version-number]

# Example:
clasp redeploy AKfycby1DftAVBVpO2... 191
```

### Git Rollback
```bash
# View recent commits
git log --oneline -10

# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard [commit-hash]

# Force push if needed (careful!)
git push origin main --force
```

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All code changes tested locally
- [ ] Monitoring running (`debug-sheets.js watch`)
- [ ] No console.log or debugger statements
- [ ] Test with TEST001 successful
- [ ] Data saves to Google Sheets verified
- [ ] No white screen issues
- [ ] No HTTP 429 errors

### During Deployment
- [ ] Git commit message descriptive
- [ ] Version number incremented correctly
- [ ] clasp push successful
- [ ] clasp deploy with matching description
- [ ] Deployment ID noted

### Post-Deployment
- [ ] Production URL tested
- [ ] Critical paths verified
- [ ] Monitoring shows no errors
- [ ] Google Sheets data correct
- [ ] Performance acceptable
- [ ] Update HANDOFF.md if needed

## 🔧 Troubleshooting Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| clasp push fails | Authentication | Run `clasp login` |
| Deploy creates wrong version | Cached files | Clear `.claspignore` cache |
| White screen after deploy | Loading state | Check ToolWrapper.html |
| 429 errors increase | API batching broken | Verify api-batch-service.html |
| Data not saving | Permission issue | Check OAuth scopes in appsscript.json |
| Wrong project deployed | Multiple .clasp.json | Verify correct project ID |

## 🗂️ Deployment Maintenance

### Weekly Tasks
- Review and test current deployment
- Check for accumulating errors in sheets
- Verify monitoring tools working

### Monthly Tasks
```bash
# Archive old deployments (keeps latest 3)
clasp deployments

# Document in HANDOFF.md:
- Current deployment ID
- Current version number  
- Any known issues
- Recent changes
```

## 📝 Deployment Documentation

After each deployment, update:

1. **HANDOFF.md** - Current deployment info
2. **Git commit** - Detailed change notes
3. **Deployment description** - Version and summary

## 🎯 Current Deployment Info

**Version:** V11.43b  
**Deployment:** @192  
**Last Deploy:** November 2, 2024  
**Status:** Production Ready  
**Test URL:** Contact administrator  
**Spreadsheet:** `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`

## 🔐 Security Reminders

- Never commit credentials or API keys
- Always use environment variables for sensitive data
- Verify OAuth scopes are minimal necessary
- Test with limited-permission TEST accounts
- Never expose internal URLs in public commits

---

*Last Updated: November 3, 2024 - Unified deployment guide combining pipeline and process*