# Tool Access Control System Implementation Guide

## Overview
This document outlines the implementation requirements for the Tool Access Control System in Financial TruPath V2.0. The system will use the `TOOL_ACCESS` spreadsheet tab to control which tools are available to which students, reflected in the dashboard tool cards.

## Current State Analysis

### ✅ What Already Exists
1. **TOOL_ACCESS Tab Structure** in spreadsheet `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`:
   ```
   | Client_ID | Tool_1 | Tool_2 | Tool_3 | Tool_4 | Tool_5 | Tool_6 | Tool_7 | Tool_8 | Override_All | Updated_By | Updated_At |
   ```

2. **Infrastructure Ready**:
   - `Config.js`: Defines `TOOL_ACCESS: 'TOOL_ACCESS'` sheet name
   - `sheets.js`: Provides Google Sheets API access
   - `debug-sheets.js`: Real-time monitoring and summary functions
   - Dashboard tool cards structure in `Code.js` (lines 750-771)

3. **Dashboard Tool Cards** (in `createSimpleDashboard()` function):
   - Currently hardcoded Tool 1 as "AVAILABLE"
   - Tool 2 as "COMING SOON" 
   - Infrastructure for `.locked` CSS class exists

### ❌ What's Missing
1. **Access Control Functions**: No functions to read/check TOOL_ACCESS tab
2. **Dynamic Card States**: Tool cards don't reflect actual access permissions
3. **Route Protection**: No middleware checking access before serving tools
4. **Admin Interface**: No way to manage tool access permissions

## Implementation Requirements

### Phase 1: Core Access Control Functions

#### 1.1 Create Access Control Service (`ToolAccessService.js`)
```javascript
/**
 * Tool Access Control Service
 * Manages reading and checking tool access permissions from TOOL_ACCESS sheet
 */

/**
 * Check if a client has access to a specific tool
 * @param {string} clientId - Client ID to check
 * @param {string} toolId - Tool ID (1-8)
 * @returns {Object} Access result with details
 */
function checkToolAccess(clientId, toolId) {
  // Implementation needed
}

/**
 * Get all tool access permissions for a client
 * @param {string} clientId - Client ID
 * @returns {Object} All tool permissions
 */
function getClientToolAccess(clientId) {
  // Implementation needed
}

/**
 * Set tool access for a client (admin function)
 * @param {string} clientId - Client ID
 * @param {string} toolId - Tool ID (1-8)
 * @param {boolean} hasAccess - Access permission
 * @param {string} updatedBy - Who made the change
 * @returns {Object} Update result
 */
function setToolAccess(clientId, toolId, hasAccess, updatedBy) {
  // Implementation needed
}
```

#### 1.2 Integration Points in Existing Files

**Code.js - Route Protection** (lines 59-74):
```javascript
// BEFORE serving any tool, check access:
if (!checkToolAccess(clientId, toolId).hasAccess) {
  return createAccessDeniedPage(toolId);
}
```

**Code.js - Dynamic Dashboard** (lines 750-771):
```javascript
// REPLACE hardcoded tool cards with dynamic generation:
const toolAccess = getClientToolAccess(clientId);
// Generate cards based on actual permissions
```

### Phase 2: Dashboard Integration

#### 2.1 Dynamic Tool Card Generation
**Modify `createSimpleDashboard()` function**:

1. **Replace static tool cards** with dynamic generation
2. **Card states based on TOOL_ACCESS**:
   - `AVAILABLE`: Green, clickable, "Start Now" button
   - `LOCKED`: Gray, disabled, "Not Available" button  
   - `COMPLETED`: Blue, clickable, "Review" button
   - `COMING_SOON`: Yellow, disabled, "Coming Soon" button

#### 2.2 Card State Logic
```javascript
function generateToolCard(toolInfo, accessInfo, completionInfo) {
  // Determine card state based on:
  // 1. TOOL_ACCESS permissions
  // 2. Tool completion status
  // 3. Sequential unlock requirements
  // 4. Override_All flag
}
```

### Phase 3: Data Management

#### 3.1 TOOL_ACCESS Tab Data Format
```
| Client_ID | Tool_1 | Tool_2 | Tool_3 | Tool_4 | Tool_5 | Tool_6 | Tool_7 | Tool_8 | Override_All | Updated_By | Updated_At |
|-----------|--------|--------|--------|--------|--------|--------|--------|--------|--------------|------------|------------|
| STU001    | TRUE   | TRUE   | FALSE  | FALSE  | FALSE  | FALSE  | FALSE  | FALSE  | FALSE        | admin      | 2024-10-29 |
| STU002    | TRUE   | FALSE  | FALSE  | FALSE  | FALSE  | FALSE  | FALSE  | FALSE  | FALSE        | admin      | 2024-10-29 |
```

#### 3.2 Default Access Rules
1. **New Students**: Only Tool 1 available by default
2. **Sequential Unlock**: Complete Tool N to unlock Tool N+1
3. **Override_All**: Admin can grant access to all tools
4. **Individual Control**: Admin can enable/disable specific tools

### Phase 4: Admin Interface

#### 4.1 Admin Panel Features
Create `AdminPanel.html` with:
- Student lookup by Client_ID
- Tool access grid (checkboxes for each tool)
- Bulk operations (unlock all, lock all)
- Access history/audit log

#### 4.2 Admin Functions
```javascript
function getStudentAccessSummary() {
  // Return grid view of all students and their tool access
}

function bulkUpdateToolAccess(clientIds, toolId, hasAccess) {
  // Bulk enable/disable tool for multiple students
}
```

## Implementation Steps

### Step 1: Create ToolAccessService.js
1. **File Location**: `v2-sheet-script/ToolAccessService.js`
2. **Core Functions**: `checkToolAccess()`, `getClientToolAccess()`, `setToolAccess()`
3. **Error Handling**: Graceful fallbacks if TOOL_ACCESS tab is empty
4. **Caching**: Cache access data to avoid repeated sheet reads

### Step 2: Modify Code.js Route Handler
1. **Add access checks** before serving tools (lines 59-74)
2. **Create access denied page** for unauthorized requests
3. **Update dashboard** to use dynamic tool cards

### Step 3: Update Dashboard Generation
1. **Replace hardcoded cards** with dynamic generation
2. **Implement card state logic**
3. **Add CSS classes** for different states
4. **Test with various access scenarios**

### Step 4: Create Admin Interface
1. **Add admin route** to Code.js
2. **Create AdminPanel.html**
3. **Add admin authentication**
4. **Test bulk operations**

### Step 5: Testing & Validation
1. **Test default access** (new students get Tool 1 only)
2. **Test sequential unlock** (complete Tool 1 → unlock Tool 2)
3. **Test override functionality**
4. **Test admin panel operations**

## Technical Specifications

### Function Signatures

```javascript
// Core access control
checkToolAccess(clientId, toolId) → {hasAccess: boolean, reason: string, source: string}
getClientToolAccess(clientId) → {tool1: boolean, tool2: boolean, ..., overrideAll: boolean}
setToolAccess(clientId, toolId, hasAccess, updatedBy) → {success: boolean, message: string}

// Dashboard integration
generateToolCards(clientId) → Array<ToolCard>
determineToolState(toolId, accessInfo, completionInfo) → 'available'|'locked'|'completed'|'coming_soon'

// Admin functions
getStudentAccessSummary() → Array<StudentAccess>
bulkUpdateToolAccess(clientIds, toolId, hasAccess) → {success: boolean, updated: number}
```

### Error Handling
1. **Sheet Access Errors**: Return default permissions (Tool 1 only)
2. **Invalid Client ID**: Log error, return no access
3. **Invalid Tool ID**: Return false
4. **Network Issues**: Cache last known state

### Performance Considerations
1. **Cache access data** for 5 minutes to reduce sheet reads
2. **Batch operations** when possible
3. **Monitor quota usage** with existing debug tools

## Security Notes
1. **Server-side validation**: All access checks must be server-side
2. **Admin authentication**: Secure admin panel access
3. **Audit logging**: Track all access changes
4. **Input validation**: Sanitize all inputs

## Testing Checklist
- [ ] New student gets Tool 1 access only
- [ ] Tool 2 unlocks after Tool 1 completion
- [ ] Override_All grants access to all tools
- [ ] Admin can enable/disable individual tools
- [ ] Dashboard cards reflect actual permissions
- [ ] Route protection blocks unauthorized access
- [ ] Error handling works gracefully
- [ ] Performance is acceptable with real data

## Deployment Notes
1. **Backup current system** before implementation
2. **Test thoroughly** with sample data
3. **Deploy incrementally** (functions first, then UI)
4. **Monitor real-time** with existing watcher system

---

**Priority**: High - This enables core platform functionality
**Complexity**: Medium - Requires coordination across multiple files
**Time Estimate**: 4-6 hours for full implementation
**Dependencies**: Existing spreadsheet structure, authentication system