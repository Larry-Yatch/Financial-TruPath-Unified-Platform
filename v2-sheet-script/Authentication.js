/**
 * Authentication Module for Financial TruPath V2.0
 * Based on Investment Tool pattern - Client ID gate with roster validation
 */

// ====== ROSTER CONFIGURATION ======
const ROSTER = {
  SPREADSHEET_ID: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo', // Same roster as investment tool
  SHEET_NAME: 'Financial v2',  // New tab for V2 platform
  SHEET_GID: null,  // Will be set when sheet is created
  COLUMNS: {
    FIRST_NAME: 2,  // B
    LAST_NAME: 3,   // C
    EMAIL: 4,       // D
    PHONE: 5,       // E
    CLIENT_ID: 6,   // F
    ENROLLED_DATE: 7, // G
    STATUS: 8       // H - Active/Inactive
  }
};

/**
 * Normalize IDs for flexible matching
 * Strips spaces, hyphens, underscores, dots, slashes, zero-width chars
 */
function normalizeId(id) {
  return String(id || '')
    .toUpperCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width characters
    .replace(/[\s\-_./\\]/g, '')           // spaces, special chars
    .trim();
}

/**
 * Get roster sheet by GID first, then by name
 */
function getRosterSheet() {
  try {
    const ss = SpreadsheetApp.openById(ROSTER.SPREADSHEET_ID);
    
    // Try by GID if set
    if (ROSTER.SHEET_GID) {
      const byGid = ss.getSheets().find(sh => sh.getSheetId() === ROSTER.SHEET_GID);
      if (byGid) return byGid;
    }
    
    // Fallback to name
    const byName = ss.getSheetByName(ROSTER.SHEET_NAME);
    return byName || null;
  } catch (error) {
    console.error('Error accessing roster sheet:', error);
    return null;
  }
}

/**
 * Lookup student by Client ID
 * @param {string} clientId - The client ID to lookup
 * @returns {Object} Result with student info or error
 */
function lookupClientById(clientId) {
  try {
    const input = (clientId || '').toString().trim();
    if (!input) {
      return { success: false, error: 'Please enter your Client ID' };
    }
    
    const idNorm = normalizeId(input);
    const sheet = getRosterSheet();
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Unable to access roster. Please contact support.' 
      };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: 'Roster is empty' };
    }
    
    // Get all Client IDs for comparison
    const numRows = lastRow - 1;
    const idCells = sheet.getRange(2, ROSTER.COLUMNS.CLIENT_ID, numRows, 1).getDisplayValues();
    
    // Search for matching ID
    for (let i = 0; i < idCells.length; i++) {
      const candidate = normalizeId(idCells[i][0]);
      if (candidate && candidate === idNorm) {
        const row = 2 + i;
        
        // Check if account is active
        const status = sheet.getRange(row, ROSTER.COLUMNS.STATUS).getValue();
        if (status && status.toLowerCase() === 'inactive') {
          return { 
            success: false, 
            error: 'Your account is inactive. Please contact support.' 
          };
        }
        
        // Get student details
        const firstName = String(sheet.getRange(row, ROSTER.COLUMNS.FIRST_NAME).getValue() || '').trim();
        const lastName = String(sheet.getRange(row, ROSTER.COLUMNS.LAST_NAME).getValue() || '').trim();
        const email = String(sheet.getRange(row, ROSTER.COLUMNS.EMAIL).getValue() || '').trim();
        
        return {
          success: true,
          clientId: idNorm,
          firstName: firstName,
          lastName: lastName,
          email: email,
          fullName: `${firstName} ${lastName}`
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Client ID not found. Please check your ID and try again.' 
    };
    
  } catch (error) {
    console.error('Lookup error:', error);
    return { 
      success: false, 
      error: 'An error occurred during verification. Please try again.' 
    };
  }
}

/**
 * Lookup student by name/email (requires 2 out of 3 fields)
 * @param {Object} params - Object with firstName, lastName, email
 * @returns {Object} Result with student info or error
 */
function lookupClientByDetails(params) {
  try {
    const firstName = (params.firstName || '').toString().trim().toLowerCase();
    const lastName = (params.lastName || '').toString().trim().toLowerCase();
    const email = (params.email || '').toString().trim().toLowerCase();
    
    // Count provided fields
    let providedCount = 0;
    if (firstName) providedCount++;
    if (lastName) providedCount++;
    if (email) providedCount++;
    
    if (providedCount < 2) {
      return { 
        success: false, 
        error: 'Please provide at least 2 fields (first name, last name, and/or email)' 
      };
    }
    
    const sheet = getRosterSheet();
    if (!sheet) {
      return { 
        success: false, 
        error: 'Unable to access roster. Please contact support.' 
      };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: 'Roster is empty' };
    }
    
    // Get all relevant data
    const numRows = lastRow - 1;
    const data = sheet.getRange(2, ROSTER.COLUMNS.FIRST_NAME, numRows, 
      ROSTER.COLUMNS.STATUS - ROSTER.COLUMNS.FIRST_NAME + 1).getValues();
    
    const matches = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowFirst = String(row[0] || '').trim().toLowerCase();
      const rowLast = String(row[1] || '').trim().toLowerCase();
      const rowEmail = String(row[2] || '').trim().toLowerCase();
      const rowClientId = String(row[4] || '').trim(); // Column F (index 4)
      const rowStatus = String(row[6] || '').trim(); // Column H (index 6)
      
      // Skip inactive accounts
      if (rowStatus.toLowerCase() === 'inactive') continue;
      
      let matchCount = 0;
      let matchTypes = [];
      
      if (firstName && rowFirst === firstName) {
        matchCount++;
        matchTypes.push('First Name');
      }
      if (lastName && rowLast === lastName) {
        matchCount++;
        matchTypes.push('Last Name');
      }
      if (email && rowEmail === email) {
        matchCount++;
        matchTypes.push('Email');
      }
      
      // Require at least 2 matches
      if (matchCount >= 2 && rowClientId) {
        matches.push({
          clientId: normalizeId(rowClientId),
          firstName: String(row[0] || '').trim(),
          lastName: String(row[1] || '').trim(),
          email: String(row[2] || '').trim(),
          fullName: `${row[0]} ${row[1]}`.trim(),
          matchedOn: matchTypes.join(' & ')
        });
      }
    }
    
    if (matches.length === 0) {
      return { 
        success: false, 
        error: 'No matching records found. Please check your information.' 
      };
    }
    
    if (matches.length === 1) {
      return {
        success: true,
        ...matches[0]
      };
    }
    
    // Multiple matches
    return {
      success: false,
      error: `Found ${matches.length} possible matches. Please use your Client ID instead.`,
      matches: matches
    };
    
  } catch (error) {
    console.error('Lookup error:', error);
    return { 
      success: false, 
      error: 'An error occurred during verification. Please try again.' 
    };
  }
}

/**
 * Create or update user session
 * @param {Object} clientInfo - Validated client information
 * @returns {Object} Session data
 */
function createUserSession(clientInfo) {
  const sessionId = Utilities.getUuid();
  const session = {
    sessionId: sessionId,
    clientId: clientInfo.clientId,
    firstName: clientInfo.firstName,
    lastName: clientInfo.lastName,
    email: clientInfo.email,
    loginTime: new Date(),
    lastActivity: new Date()
  };
  
  // In production, you might want to store this in Properties Service
  // For now, we'll just return it to be stored client-side
  return session;
}

/**
 * Verify existing session
 * @param {string} sessionId - Session ID to verify
 * @param {string} clientId - Client ID to verify
 * @returns {boolean} Whether session is valid
 */
function verifySession(sessionId, clientId) {
  // Simple verification for now
  // In production, check against stored sessions
  return sessionId && clientId && normalizeId(clientId).length > 0;
}