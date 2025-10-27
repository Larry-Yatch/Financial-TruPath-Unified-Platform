# Standard Deployment Process

## 🚀 Complete Deployment Workflow

Every time you make changes and want to deploy, follow this standardized process:

### 1️⃣ Stage & Commit Locally
```bash
# Stage all changes
git add -A

# Check what's being committed
git status

# Commit with descriptive message
git commit -m "Version: Brief description of changes

Detailed changes:
- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 2️⃣ Push to GitHub
```bash
# Push to GitHub for backup and collaboration
git push origin main
```

### 3️⃣ Deploy to Google Apps Script
```bash
# Push code to Apps Script
clasp push

# Create new deployment with version description
clasp deploy -d "Version: Description matching git commit"
```

### 4️⃣ Store Deployment Info
After deployment, document:
- Deployment ID
- Test URLs
- What was changed
- Any known issues

## 📋 Quick Command Sequence

For quick deployments, run these in sequence:
```bash
# All-in-one deployment (after making changes)
git add -A && \
git status && \
git commit -m "Your commit message" && \
git push origin main && \
clasp push && \
clasp deploy -d "Your deployment description"
```

## 🔄 Version Tracking

Keep versions synchronized:
- Git commit message should match deployment description
- Use consistent version numbering (V10.0, V10.1, V11.0, etc.)
- Major changes = new major version (V11 → V12)
- Bug fixes = minor version (V11.0 → V11.1)

## 📊 Current Deployment Status

**Latest Version**: V11.0
**Deployment ID**: AKfycby1DftAVBVpO2opp49Vku3wnuVGqBkn3Ti40kjpmmHSzZgt66gxQFanxyKokf7_MEAM
**GitHub**: https://github.com/Larry-Yatch/Financial-TruPath-Unified-Platform
**Last Updated**: 2025-10-27

## ⚠️ Important Notes

1. **Always test locally first** before deploying
2. **Monitor Google Sheets** during testing with `node debug-sheets.js watch`
3. **Check for validation errors** - use `--no-verify` only when necessary
4. **Keep backups** before major changes
5. **Document breaking changes** in commit messages

## 🧪 Post-Deployment Testing

After each deployment:
1. Test the main functionality that was changed
2. Run a smoke test on critical features
3. Check monitoring for any errors
4. Verify data is saving to Google Sheets

---
*This process ensures code is safely backed up to GitHub and properly versioned in Google Apps Script*