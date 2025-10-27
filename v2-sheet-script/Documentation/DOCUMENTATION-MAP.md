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

### 📂 v2-sheet-script/Documentation/ (Active Development)
| Document | Purpose | When to Use | Status |
|----------|---------|-------------|---------|
| **SESSION-HANDOFF.md** | V9.7 status, 8 critical issues, next steps | ✅ START HERE - Current state |
| **FOUNDATION-ROADMAP.md** | Complete rebuild plan, 8-tool architecture | Strategic plan & implementation |
| **V9-DEPLOYMENT-STATUS.md** | Current deployment URLs & version history | Testing & deployment info |
| **SCALABLE-ARCHITECTURE-PLAN.md** | Hybrid 4-pattern architecture | Architecture reference |
| **CROSS-TOOL-STRATEGY.md** | Cross-tool intelligence implementation | Understanding data flow |
| **DEBUGGING-GUIDE.md** | Troubleshooting procedures | When things break |

### 📦 archive/old-docs/ (Historical Reference)
| Document | Purpose | Archived Date |
|----------|---------|---------------|
| **PROJECT-README-V7.md** | V7.1 project state | Oct 25, 2025 |
| **TOOL1-STATUS-CHECKPOINT-V7.5.md** | V7.5 baseline | Oct 25, 2025 |
| **TOOLS_INVENTORY.md** | Complete catalog of all 8 tools | Previously |
| **ARCHITECTURE_PLAN.md** | Original system architecture | Previously |
| **V2_IMPLEMENTATION_PLAN.md** | V2 migration strategy | Previously |

### 📦 archive/session-docs/ (Session Archives)
| Document | Purpose | Archived Date |
|----------|---------|---------------|
| **NEXT-SESSION-PROMPT-OLD.md** | Outdated Week 1 Day 1 prompt | Oct 25, 2025 |
| Other session docs | Previous session handoffs | Various |

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

**Starting Development Session:**
1. Read `HANDOFF.md` for current status
2. Check `SESSION-COMPLETE.md` for today's tasks
3. Review `CLAUDE.md` for behavioral rules

**Debugging Issues:**
- `DEBUGGING-GUIDE.md` - Troubleshooting steps
- `QUICK-FIX.md` - Common fixes

**Understanding Architecture:**
- `DEVELOPMENT_GUIDE.md` - System design
- `CROSS-TOOL-STRATEGY.md` - Tool integration
- `PLANNING_DECISIONS.md` - Why decisions were made

**Building New Features:**
- `IMPLEMENTATION_ROADMAP.md` - Timeline
- `CURRENT_STATE.md` - What's already built

**Historical Context:**
- `old-docs/` folder - All archived documentation

## 📍 Current Focus - Foundation Rebuild

**Primary Documents:**
1. **SESSION-HANDOFF.md** - V9.7 status with 8 critical issues
2. **FOUNDATION-ROADMAP.md** - Complete rebuild plan

**Strategic Decision (Oct 25, 2025):** 
- Stop patching V9.x series
- Build clean foundation first
- Then rebuild Tool 1 using foundation

**Key Issues to Fix:**
- Cloud draft saving broken (creates empty versions)
- Duplicate progress systems (ToolWrapper vs native)
- Dashboard navigation white screens
- Form data collection not working

## ✅ Documentation Health Check (Post-Cleanup)

| Category | Status | Location |
|----------|--------|----------|
| Active Development | ✅ Consolidated | v2-sheet-script/ |
| Historical Archive | ✅ Organized | v2-sheet-script/archive/ |
| Reference Material | ✅ Clean | old-docs/ (TOOLS_INVENTORY.md) |
| AI Configuration | ✅ Structured | .claude/ |
| Project Management | ✅ Current | Root directory |

---

**Last Updated:** October 25, 2025 - Documentation cleanup & V9.7 updates
**Next Session Focus:** Build clean foundation with test form
**Documentation Status:** Updated & Reorganized

**Key Changes This Session:**
- Archived 3 outdated documents (PROJECT-README, TOOL1-STATUS, NEXT-SESSION-PROMPT)
- Created V9-DEPLOYMENT-STATUS.md with current issues
- Updated SESSION-HANDOFF.md to V9.7 with 8 critical issues
- Created FOUNDATION-ROADMAP.md with rebuild plan