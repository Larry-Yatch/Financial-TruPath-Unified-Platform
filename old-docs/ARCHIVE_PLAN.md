# V2.0 Archive Plan

## Files to Archive (Move to `legacy/` folder)

### 1. Migration & Download Scripts (No longer needed)
- [ ] `copy-local-code.sh` - Already copied all local code
- [ ] `download-scripts.sh` - Old download script
- [ ] `download-all-scripts.sh` - Completed downloading all scripts
- [ ] `authenticate-clasp.sh` - One-time authentication helper

### 2. Old Documentation (Superseded by V2.0 plans)
- [ ] `MIGRATION_PLAN.md` - Original migration plan (completed)
- [ ] `PROJECT_STATUS.md` - Old status (V2.0 has new approach)
- [ ] `PROJECT_DOWNLOAD_SUMMARY.md` - Downloads complete

### 3. Test Files
- [ ] `sheets.js` - Google Sheets test file (keeping googleapis in package.json)

### 4. Local Tool Copies (Keep for reference but archive)
All `*-local/` folders contain duplicate code from original locations:
- [ ] `apps/control-fear-grounding-local/`
- [ ] `apps/investment-tool-local/`
- [ ] `apps/issues-showing-love-local/`
- [ ] `apps/retirement-blueprint-local/`
- [ ] `apps/false-self-external-validation/external-validation-local/`
- [ ] `apps/investment-tool-redirect/`

## Files to KEEP in Main Directory

### Essential Documentation
- ✅ `README.md` - Updated for V2.0
- ✅ `V2_IMPLEMENTATION_PLAN.md` - Current development plan
- ✅ `INTEGRATION_STRATEGIES.md` - Core architecture design
- ✅ `PROJECT_SETUP_CHECKLIST.md` - Active setup guide
- ✅ `TOOLS_INVENTORY.md` - Complete tool reference

### Project Configuration
- ✅ `.gitignore`
- ✅ `package.json` & `package-lock.json`
- ✅ `node_modules/` (needed for googleapis)

### Claude/Daddy Integration
- ✅ `.claude/` - Claude configurations
- ✅ `.daddy/` - Task management
- ✅ `CLAUDE.md` - Claude instructions
- ✅ `daddy_project.md` - Project management

### Downloaded Scripts (Keep as reference)
- ✅ `apps/[tool-name]/scripts/` folders - All 9 downloaded Google Apps Scripts

### Shared Resources
- ✅ `shared/` - Shared libraries and components

### Future V2.0 Structure
- ✅ `unified-app/` - Reserved for unified platform
- ✅ `deployment/` - Deployment configurations
- ✅ `docs/` - Documentation folder

## Recommended Folder Structure After Cleanup

```
Financial-TruPath-Unified-Platform/
├── .claude/                  # Claude configs (KEEP)
├── .daddy/                   # Task management (KEEP)
├── .git/                     # Git repository (KEEP)
├── apps/                     # Reference scripts (KEEP SCRIPTS ONLY)
│   ├── orientation-demographics/scripts/
│   ├── financial-clarity/scripts/
│   ├── control-fear-grounding/scripts/
│   ├── external-validation/scripts/
│   ├── false-self-view/scripts/
│   ├── financial-freedom-framework/scripts/
│   ├── investment-tool/scripts/
│   ├── issues-showing-love/scripts/
│   └── retirement-blueprint/scripts/
├── docs/                     # Documentation (KEEP)
├── legacy/                   # Archived files (CREATE)
│   ├── migration-scripts/
│   ├── old-docs/
│   ├── local-tools/
│   └── test-files/
├── shared/                   # Shared resources (KEEP)
├── unified-app/             # V2.0 platform (KEEP)
├── v2-platform/             # NEW V2.0 CODE (CREATE)
│   ├── core/
│   ├── tools/
│   ├── webapp/
│   └── shared/
├── .gitignore               # (KEEP)
├── CLAUDE.md                # (KEEP)
├── INTEGRATION_STRATEGIES.md # (KEEP)
├── package.json             # (KEEP)
├── PROJECT_SETUP_CHECKLIST.md # (KEEP)
├── README.md                # (KEEP)
├── TOOLS_INVENTORY.md       # (KEEP)
└── V2_IMPLEMENTATION_PLAN.md # (KEEP)
```

## Archive Commands

```bash
# Create legacy folder structure
mkdir -p legacy/migration-scripts
mkdir -p legacy/old-docs
mkdir -p legacy/local-tools
mkdir -p legacy/test-files

# Move migration scripts
mv copy-local-code.sh legacy/migration-scripts/
mv download-scripts.sh legacy/migration-scripts/
mv download-all-scripts.sh legacy/migration-scripts/
mv authenticate-clasp.sh legacy/migration-scripts/

# Move old documentation
mv MIGRATION_PLAN.md legacy/old-docs/
mv PROJECT_STATUS.md legacy/old-docs/
mv PROJECT_DOWNLOAD_SUMMARY.md legacy/old-docs/

# Move test files
mv sheets.js legacy/test-files/

# Move local tool copies
mv apps/*-local legacy/local-tools/
mv apps/investment-tool-redirect legacy/local-tools/
mv apps/false-self-external-validation/external-validation-local legacy/local-tools/

# Create V2 platform structure
mkdir -p v2-platform/core
mkdir -p v2-platform/tools
mkdir -p v2-platform/webapp
mkdir -p v2-platform/shared
```

## Benefits of This Cleanup

1. **Cleaner Working Directory** - Only active V2.0 files visible
2. **Preserved History** - All work archived, not deleted
3. **Clear Structure** - Obvious what's current vs legacy
4. **Faster Navigation** - Less clutter to sort through
5. **Ready for V2.0** - Clean slate for new development

## Next Steps After Archive

1. Execute archive commands
2. Update .gitignore to exclude legacy/local-tools (large files)
3. Commit clean structure
4. Begin V2.0 development in v2-platform/
5. Reference apps/*/scripts/ for original implementations

Ready to execute this archive plan?