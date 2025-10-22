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

### 📂 v2-sheet-script/ (Active Development)
| Document | Purpose | When to Use |
|----------|---------|-------------|
| **CURRENT_STATE.md** | Implementation status | Check what's built, what's pending |
| **DEVELOPMENT_GUIDE.md** | Master architecture reference | Understanding system design |
| **DEBUGGING-GUIDE.md** | Troubleshooting procedures | When things break |
| **PLANNING_DECISIONS.md** | Design decisions record | Understanding why choices were made |
| **IMPLEMENTATION_ROADMAP.md** | 14-day development timeline | Planning next steps |
| **CROSS-TOOL-STRATEGY.md** | Tool integration architecture | Building DataService & InsightEngine |
| **QUICK-FIX.md** | Emergency reference card | Quick fixes for common issues |
| **SESSION-COMPLETE.md** | Tomorrow's starting point | Start of Session 3 |

### 📦 old-docs/ (Historical Reference)
| Document | Purpose |
|----------|---------|
| **TOOLS_INVENTORY.md** | Complete catalog of all 8 tools |
| **ARCHITECTURE_PLAN.md** | Original system architecture |
| **V2_IMPLEMENTATION_PLAN.md** | V2 migration strategy |
| Other archived docs | Historical context |

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

## 📍 Current Focus (Session 3)

**Primary Document:** `SESSION-COMPLETE.md`
- Contains complete instructions for building DataService.js
- Clear roadmap for cross-tool data flow
- Success metrics for session completion

**Supporting Documents:**
- `CROSS-TOOL-STRATEGY.md` - Architecture for data flow
- `DEVELOPMENT_GUIDE.md` - Technical implementation details

## ✅ Documentation Health Check

| Category | Status | Location |
|----------|--------|----------|
| Active Development | ✅ Clean | v2-sheet-script/ |
| Historical Archive | ✅ Organized | old-docs/ |
| AI Configuration | ✅ Structured | .claude/ |
| Project Management | ✅ Current | Root directory |
| Emergency Procedures | ✅ Accessible | QUICK-FIX.md |

---

**Last Updated:** Session 2 Complete
**Next Session Focus:** Build DataService.js
**Documentation Status:** Clean & Organized