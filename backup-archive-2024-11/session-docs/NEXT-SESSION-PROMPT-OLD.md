# Next Session Startup Prompt

## 🚀 SESSION START COMMANDS

```bash
# 1. Navigate to project
cd /Users/Larry/code/Financial-TruPath-Unified-Platform/v2-sheet-script

# 2. Start monitoring (CRITICAL - do this first)
cd .. && node debug-sheets.js watch

# 3. Check recent memories
recall_daddy "Tool1 sophisticated"
```

## 📋 MISSION: Week 1 Day 1 - Debug Tool 1 Sophisticated Assessment

### Primary Objective
**Debug and activate the existing sophisticated 25-question Tool 1 assessment** that was discovered in Session 3. This tool already has Financial Health Score generation, user profiling, and PDF reports - it just needs template debugging.

### CRITICAL DISCOVERY FROM SESSION 3
We found that Tool 1 is NOT a simple form - it's a **sophisticated 1,321-line assessment** in `index.html` with:
- ✅ 25 comprehensive questions across 5 sections
- ✅ Real-time Financial Health Score (0-100) + Mindset Score (-9 to +9)  
- ✅ 6 different user profile types with personalized insights
- ✅ PDF report generation + personalized homework for Tool 2
- ❌ Commented out due to template evaluation issues in Google Apps Script

## 📚 REQUIRED READING (in order)

### 1. Session Handoff
```bash
cat SESSION-3-HANDOFF.md
cat SCALABLE-ARCHITECTURE-PLAN.md
```

### 2. Current Backend Status
```bash
# Review what's ready to connect:
head -50 ToolFramework.js
head -30 DataService.js
```

### 3. The Sophisticated Tool 1
```bash
# This is the goldmine - 1,321 lines of assessment:
head -100 index.html
```

## 🎯 WEEK 1 DAY 1 SPECIFIC TASKS

### Hour 1: Diagnosis
1. **Examine the complex Tool 1** in `index.html` (lines 362-1320)
2. **Understand why it was commented out** (template evaluation issues)
3. **Check Code.js routing** to see current state vs commented sections

### Hour 2: Uncomment & Test
1. **Uncomment the sophisticated Tool 1** in `Code.js` 
2. **Test initial load** - does the form appear?
3. **Check browser console** for JavaScript errors
4. **Test form submission** - does data flow work?

### Hour 3: Debug Template Issues
1. **Fix field name mismatches** between frontend and backend
2. **Debug Google Apps Script template evaluation** 
3. **Verify data saves to Google Sheets** via monitoring

### Hour 4: ToolFramework Integration  
1. **Connect `saveUserData()` call** to `ToolFramework.completeToolSubmission()`
2. **Test insight generation** for Tool 2 preparation
3. **Verify Financial Health Score calculation**

## 🎯 SUCCESS CRITERIA FOR DAY 1

- [ ] Sophisticated Tool 1 form loads without errors
- [ ] All 25 questions display properly (no template evaluation issues)
- [ ] Form submission saves data to Google Sheets  
- [ ] Real-time monitoring shows new session + response
- [ ] Financial Health Score generates correctly
- [ ] Basic ToolFramework connection established

## 🚨 IMPORTANT CONTEXT

### What We Know Works:
- ✅ **V7.1 deployment active**: `https://script.google.com/macros/s/AKfycbzi5QerNc7hekeZ8cWOccFj6RBAvcJckDYvqZ3v6CW5rl-UC7_VtEncTEFrLhDlTBLJ/exec`
- ✅ **Simple test form works**: Login → Dashboard → Tool1 (1 field) → DataService → Sheets
- ✅ **Real-time monitoring operational**: Currently 29 sessions, 5 responses
- ✅ **Backend ready**: ToolFramework.js (726 lines) + DataService.js working

### The Challenge:
- ❌ **Complex Tool 1 commented out** due to template evaluation issues
- ❌ **Need to debug** Google Apps Script template variable handling
- ❌ **Field name mismatches** between sophisticated form and backend

### Why This Matters:
Instead of building Tool 1 from scratch (would take days), we can debug the existing sophisticated assessment (should take hours) and have a professional-grade tool with insights ready immediately.

## 💡 DEBUGGING STRATEGY

### If Template Evaluation Fails:
1. **Check variable injection**: Ensure `<?!= userId ?>` style variables work
2. **Simplify template variables**: Remove complex template logic if needed  
3. **Test step by step**: Start with basic form, add complexity gradually

### If Form Won't Load:
1. **Check browser console**: Look for JavaScript errors
2. **Verify HTML structure**: Ensure no syntax issues
3. **Test in simple HTML first**: Outside of Google Apps Script

### If Data Won't Save:
1. **Check field names**: Frontend form names vs backend expectations
2. **Monitor real-time**: Watch debug-sheets.js for save attempts
3. **Test with simple data**: Minimal test object first

## 🔗 KEY FILES FOR TODAY

| File | Purpose | Focus Area |
|------|---------|------------|
| `index.html` | Sophisticated Tool 1 assessment | Lines 362-1320 (the goldmine) |
| `Code.js` | Router with commented sections | Uncomment complex Tool 1 route |
| `ToolFramework.js` | Cross-tool intelligence | Line integration points |
| `DataService.js` | Data saving | Verify compatibility with Tool 1 |

## 📊 MONITORING COMMANDS

```bash
# Check real-time saves (keep running in background)
node debug-sheets.js watch

# Quick status check  
node debug-sheets.js summary

# If things break
node check-sheets.js
```

## 🎯 END OF DAY 1 GOAL

**Tool 1 sophisticated assessment working end-to-end:**
User opens form → completes 25 questions → Financial Health Score generates → data saves → ToolFramework captures insights for Tool 2

This sets up Tool 2 adaptive questioning for Day 2-3 of Week 1.

---

**Remember**: We're debugging existing sophisticated code, not building from scratch. The hard work is already done - we just need to make it work again!

*Ready for Week 1 Day 1 Implementation*