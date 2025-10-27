# Next Session Prompt - V11 Tool1 Integration

## =� SESSION START COMMANDS

```bash
# 1. Navigate to project
cd /Users/Larry/code/Financial-TruPath-Unified-Platform/v2-sheet-script

# 2. Start monitoring (CRITICAL - do this first)
cd .. && node debug-sheets.js watch

# 3. Check recent memories
recall_daddy "V10 TestTool pattern"
recall_daddy "V10.7 FINAL CLEAN"
```

## =� MISSION: Apply V10 Pattern to Tool1

### Starting Context
- **V10 Foundation Complete**: TestTool working perfectly with all features
- **Current Deployment**: V10.8 
- **Monitoring Status**: 16 Sessions, 5 Responses confirmed
- **Clean Codebase**: No debug logs, organized archives

### Primary Objective for V11
**Apply the proven V10 TestTool pattern to Tool1 (index.html)** - the sophisticated 25-question financial assessment that's already built but needs integration.

## <� V11 DAY 1 SPECIFIC TASKS

### Hour 1: Analysis & Planning
1. **Review Tool1 current state** in `index.html`
   - Lines 362-1320: Sophisticated form already exists
   - Has Financial Health Score calculation
   - Has 6 user profile types
   - Currently commented sections need review
2. **Compare with TestTool pattern** 
   - How TestTool uses FormData API
   - How draft versioning works
   - How submission works

### Hour 2: Create Tool1 Backup
1. **Copy index.html to Tool1_Original_Backup.html**
2. **Document current Tool1 features** that must be preserved:
   - Financial Health Score (0-100)
   - Mindset Score (-9 to +9)
   - User profile determination
   - PDF report generation capability
3. **Identify conflicts** with ToolWrapper

### Hour 3: Implement V10 Pattern
1. **Add standardized form structure**:
   ```html
   <form id="tool-form" data-tool-id="tool1">
   ```
2. **Integrate ToolWrapper functions**:
   - Draft saving with versions
   - Progress tracking
   - Submit functionality
3. **Test incrementally** (like we did with TestTool)

### Hour 4: Test & Debug
1. **Test form display** - no console errors
2. **Test draft save** - verify versions work
3. **Test submission** - check monitoring for response
4. **Test score calculations** still work

## = KEY PATTERNS TO APPLY

### From TestTool Success:
```javascript
// 1. Global userId consistency
const userId = '<?= userId ?>';

// 2. FormData collection
const formData = ToolWrapper.collectToolData('pattern1');

// 3. Draft versioning
loadDraftWithVersions() with modal selector

// 4. Clean submission
google.script.run.saveUserData(userId, 'tool1', formData);
```

### Critical Fixes from V10:
1. **No duplicate functions** - check for conflicts
2. **UserId consistency** - same variable throughout
3. **Simplified returns** - Google Apps Script serialization
4. **Error handling** - wrap helper functions

## =� SUCCESS CRITERIA FOR V11 DAY 1

- [ ] Tool1 form displays without errors
- [ ] All 25 questions render properly
- [ ] Draft save creates versions in PropertiesService
- [ ] Version selector modal works
- [ ] Form submission saves to Google Sheets
- [ ] Financial Health Score still calculates
- [ ] Monitoring shows new responses

## =� POTENTIAL CHALLENGES

### Known Issues to Address:
1. **Template evaluation errors** - Tool1 was commented due to these
2. **Field name mismatches** - Between form and backend
3. **Score calculation integration** - Must preserve existing logic
4. **ToolWrapper conflicts** - Tool1 has its own progress bar

### Solution Strategy:
- Start with minimal changes - small steps that we can test
- no big code "leaps"
- Test after each change
- Keep original logic where possible
- Use TestTool as reference

## = KEY FILES FOR V11

| File | Purpose | Action |
|------|---------|--------|
| `index.html` | Tool1 sophisticated form | Integrate V10 pattern |
| `TestTool.html` | Working pattern reference | Copy successful patterns |
| `ToolWrapper.html` | Framework functions | Already working |
| `Tool1_Orientation.js` | Backend logic | May need field updates |

## =� LESSONS FROM V10 TO APPLY

1. **Test incrementally** - Each small change isolated
2. **Check monitoring constantly** - Real feedback
3. **Commit frequently** - Track progress
4. **Debug immediately** - Don't accumulate issues
5. **Simplify returns** - Google Apps Script limitations

## <� END OF session 1 GOAL

**Tool1 working with V10 pattern:**
- User opens Tool1 � Sees 25 questions � Can save drafts � Version selector works � Submit saves to Sheets � Scores calculate

This proves the V10 pattern scales to complex tools.

## =� REMEMBER

- We already have a working pattern (TestTool)
- Tool1 is already built (just needs integration)
- The hard debugging was done in V10
- This should be mostly applying proven patterns

---

**Start with:** "a planning discussion about how we can get tool1 working and then have the flexibility to adjust the questions. logic, and outputs as they are not perfect are a great starting point for getting a version 1 of Tool1 working.

*Ready for V11 Implementation - October 28, 2025*