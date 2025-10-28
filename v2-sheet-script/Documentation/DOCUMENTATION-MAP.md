# Documentation Map - Financial TruPath Unified Platform

## 📚 Active Documentation Structure

### 🏠 Root Directory (Project-Level)
| Document | Purpose | When to Use |
|----------|---------|-------------|
| **README.md** | Project overview & quick start | First time setup, understanding project |
| **CLAUDE.md** | AI development guidelines | Every development session (behavioral rules) |
| **HANDOFF.md** | Session continuity & status | Starting new session, checking URLs |
| **DEPLOYMENT_GUIDE.md** | Production deployment steps | Deploying to production |
| **PRE_DEVELOPMENT_CHECKLIST.md** | Setup verification | Before starting development |

### 📂 v2-sheet-script/Documentation/ (Active Development - V11.39+)
| Document | Purpose | When to Use | Status |
|----------|---------|-------------|---------|
| **TOOL1-ORIENTATION-COMPLETE-SPECIFICATION.md** | Complete Tool1 content specification | ✅ START HERE - Tool1 modifications | 🆕 Current |
| **COMPLETED-SUBMISSION-LOADING-ISSUE.md** | How submission loading was fixed | Understanding historical fix | ✅ Current |
| **Real-Time-Console-Monitoring.md** | Google Sheets monitoring setup | Debugging data persistence | ✅ Current |
| **SCALABLE-ARCHITECTURE-PLAN.md** | Hybrid 4-pattern architecture | Architecture reference | ✅ Current |
| **CROSS-TOOL-STRATEGY.md** | Cross-tool intelligence implementation | Understanding data flow | ✅ Current |
| **DEBUGGING-GUIDE.md** | Troubleshooting procedures | When things break | ✅ Current |

### 📦 archive/session-backups/ (Session Files)
| Document | Purpose | Archived Date |
|----------|---------|---------------|
| **index_v29.html** | Deployment 29 backup (working version) | Oct 28, 2025 |
| **ToolWrapper_v29.html** | Deployment 29 ToolWrapper backup | Oct 28, 2025 |
| **index_backup_20251027_103951.html** | Automatic backup | Oct 27, 2025 |

### 📦 📋 OUTDATED DOCUMENTS - NEED UPDATING ⚠️
| Document | Current Status | Issue | Action Needed |
|----------|---------------|-------|---------------|
| **SESSION-HANDOFF.md** | References V9-V10 issues | All issues RESOLVED in V11.39 | ⚠️ UPDATE |
| **NEXT-SESSION-PROMPT.md** | V11.21 deployment info | Now V11.39 with new features | ⚠️ UPDATE |
| **FOUNDATION-ROADMAP.md** | Foundation rebuild plan | Foundation IS BUILT and working | ⚠️ ARCHIVE |
| **V10-FINAL-COMPLETE.md** | V10 completion status | Now V11.39+ with major enhancements | ⚠️ ARCHIVE |

### 🤖 .claude/ (AI Configuration)
```
.claude/
├── agents/           # Specialist agent definitions
├── commands/         # Development command shortcuts
├── output-styles/    # Communication styles (daddy-whispers.md)
└── templates/        # Project templates (project-template.md)
```

## 🎯 Quick Reference Guide

### For Different Tasks:

**Starting Tool 1 Content Modification:**
1. Read `TOOL1-ORIENTATION-COMPLETE-SPECIFICATION.md` - Complete foundation
2. Review `CLAUDE.md` for behavioral rules  
3. Modify questions in `Tool1_Orientation.js`

**Debugging Issues:**
- `DEBUGGING-GUIDE.md` - Troubleshooting steps
- `Real-Time-Console-Monitoring.md` - Google Sheets monitoring

**Understanding Architecture:**
- `SCALABLE-ARCHITECTURE-PLAN.md` - System design
- `CROSS-TOOL-STRATEGY.md` - Tool integration
- `COMPLETED-SUBMISSION-LOADING-ISSUE.md` - Historical context

**Historical Context:**
- `archive/session-backups/` - Version backups
- Outdated docs marked for update/archive

## 📍 Current Status - V11.39 FOUNDATION COMPLETE ✅

**Primary Document:**
1. **TOOL1-ORIENTATION-COMPLETE-SPECIFICATION.md** - Ready for content modification

**Major Achievement (Oct 28, 2025):** 
- ✅ ALL V9-V10 issues resolved in V11 series
- ✅ Robust infrastructure built and working
- ✅ Ready for Tool 1 content customization

**What's Working:**
- ✅ Navigation system unified
- ✅ Load/Save/Draft system consistent  
- ✅ Help system with button descriptions
- ✅ Auto-navigation after draft loading
- ✅ Data persistence to Google Sheets

## ✅ Current System Status (V11.39)

| Component | Status | Location |
|----------|--------|----------|
| Infrastructure | ✅ Complete & Robust | All core files |
| Tool1 Questions | 📝 Ready for modification | Tool1_Orientation.js |
| Navigation | ✅ Working perfectly | ToolWrapper.html |
| Data Storage | ✅ Reliable | DataService.js |
| Documentation | ✅ Current | TOOL1-ORIENTATION-COMPLETE-SPECIFICATION.md |

---

**Last Updated:** October 28, 2025 - Post V11.39 epic session
**Next Session Focus:** Tool 1 content modification using complete specification
**Documentation Status:** FOUNDATION COMPLETE - Ready for content work

**Key Achievements This Epic Session:**
- Fixed deployment 29→30 breaking issues (Help button + navigation)
- Unified all Load Draft buttons to work consistently  
- Added auto-navigation after draft loading from landing page
- Enhanced Help system with comprehensive navigation guide
- Created complete Tool1 specification document
- Archived session backup files properly