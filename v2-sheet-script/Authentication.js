/**
 * Authentication Module for Financial TruPath V2.0
 * Based on Investment Tool pattern - Client ID gate with roster validation
 * Refactored for improved error handling and code consolidation
 */

// ====== ROSTER CONFIGURATION ======
const ROSTER = {
  SPREADSHEET_ID: '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24', // Using local Students sheet
  SHEET_NAME: 'Students',  // Local sheet with test users
  SHEET_GID: null,  // Not needed for local sheet
  COLUMNS: {
    FIRST_NAME: 3,  // C - First Name
    LAST_NAME: 4,   // D - Last Name
    PHONE: 5,       // E - Phone (if present)
    EMAIL: 6,       // F - Email
    CLIENT_ID: 7,   // G - Student IDs
    STATUS: 8       // H - Status (if present)
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
 * Get roster sheet with improved error handling
 */
function getRosterSheet() {
  return DataOperations.withSheet(
    ROSTER.SHEET_NAME,
    (sheet) => sheet,
    'get roster sheet'
  );
}

/**
 * Lookup student by Client ID with improved data operations
 * @param {string} clientId - The client ID to lookup
 * @returns {Object} Result with student info or error
 */
function lookupClientById(clientId) {
  // Input validation
  const validation = _validateClientInput(clientId);
  if (!validation.success) {
    return validation;
  }
  
  const idNorm = normalizeId(validation.input);
  
  // Load roster data
  const rosterData = DataOperations.loadFromSheet(
    ROSTER.SHEET_NAME,
    null,
    'lookup client by ID'
  );
  
  if (!rosterData.success) {
    return {
      success: false,
      error: 'Unable to access roster. Please contact support.'
    };
  }
  
  if (rosterData.data.length === 0) {
    return { success: false, error: 'Roster is empty' };
  }
  
  // Search for matching client
  const matchResult = _findClientInRoster(rosterData, idNorm, 'id');
  if (matchResult) {
    return matchResult;
  }
  
  return {
    success: false,
    error: 'Client ID not found. Please check your ID and try again.'
  };
}

/**
 * Lookup student by name/email with improved validation
 * @param {Object} params - Object with firstName, lastName, email
 * @returns {Object} Result with student info or error
 */
function lookupClientByDetails(params) {
  // Validate detail parameters
  const validation = _validateDetailParams(params);
  if (!validation.success) {
    return validation;
  }
  
  // Load roster data
  const rosterData = DataOperations.loadFromSheet(
    ROSTER.SHEET_NAME,
    null,
    'lookup client by details'
  );
  
  if (!rosterData.success) {
    return {
      success: false,
      error: 'Unable to access roster. Please contact support.'
    };
  }
  
  if (rosterData.data.length === 0) {
    return { success: false, error: 'Roster is empty' };
  }
  
  // Find matches based on provided details
  const matches = _findDetailMatches(rosterData, validation.details);
  
  return _processDetailMatches(matches);
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

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    lookupClientById,
    lookupClientByDetails,
    createUserSession,
    verifySession
  };
}

// ===== HELPER FUNCTIONS =====

/**
 * Validate client ID input
 * @private
 */
function _validateClientInput(clientId) {
  const input = (clientId || '').toString().trim();
  if (!input) {
    return { success: false, error: 'Please enter your Client ID' };
  }
  return { success: true, input };
}

/**
 * Validate detail lookup parameters
 * @private
 */
function _validateDetailParams(params) {
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
  
  return {
    success: true,
    details: { firstName, lastName, email }
  };
}

/**
 * Find client in roster data
 * @private
 */
function _findClientInRoster(rosterData, searchValue, searchType) {
  const headers = rosterData.headers;
  const clientIdCol = headers.indexOf('Client_ID') >= 0 ? headers.indexOf('Client_ID') : ROSTER.COLUMNS.CLIENT_ID - 1;
  const statusCol = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : ROSTER.COLUMNS.STATUS - 1;
  const firstNameCol = headers.indexOf('First_Name') >= 0 ? headers.indexOf('First_Name') : ROSTER.COLUMNS.FIRST_NAME - 1;
  const lastNameCol = headers.indexOf('Last_Name') >= 0 ? headers.indexOf('Last_Name') : ROSTER.COLUMNS.LAST_NAME - 1;
  const emailCol = headers.indexOf('Email') >= 0 ? headers.indexOf('Email') : ROSTER.COLUMNS.EMAIL - 1;
  
  for (const row of rosterData.data) {
    if (searchType === 'id') {
      const candidate = normalizeId(row[clientIdCol] || '');
      if (candidate && candidate === searchValue) {
        return _createClientResult(row, headers);
      }
    }
  }
  
  return null;
}

/**
 * Create standardized client result
 * @private
 */
function _createClientResult(row, headers) {
  const firstNameCol = headers.indexOf('First_Name') >= 0 ? headers.indexOf('First_Name') : ROSTER.COLUMNS.FIRST_NAME - 1;
  const lastNameCol = headers.indexOf('Last_Name') >= 0 ? headers.indexOf('Last_Name') : ROSTER.COLUMNS.LAST_NAME - 1;
  const emailCol = headers.indexOf('Email') >= 0 ? headers.indexOf('Email') : ROSTER.COLUMNS.EMAIL - 1;
  const clientIdCol = headers.indexOf('Client_ID') >= 0 ? headers.indexOf('Client_ID') : ROSTER.COLUMNS.CLIENT_ID - 1;
  const statusCol = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : ROSTER.COLUMNS.STATUS - 1;
  
  // Check if account is active
  const status = String(row[statusCol] || '').trim();
  if (status && status.toLowerCase() === 'inactive') {
    return {
      success: false,
      error: 'Your account is inactive. Please contact support.'
    };
  }
  
  const firstName = String(row[firstNameCol] || '').trim();
  const lastName = String(row[lastNameCol] || '').trim();
  const email = String(row[emailCol] || '').trim();
  const clientId = normalizeId(row[clientIdCol] || '');
  
  // Check if returning student (has completed any tools)
  let hasCompletedTools = false;
  try {
    if (typeof DataHub !== 'undefined') {
      const profile = DataHub.getUnifiedProfile(clientId);
      if (profile && profile.metadata && profile.metadata.completedTools) {
        hasCompletedTools = profile.metadata.completedTools.length > 0;
      }
    }
  } catch (e) {
    console.log('Could not check tool completion status:', e);
  }
  
  return {
    success: true,
    clientId: clientId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    fullName: `${firstName} ${lastName}`,
    hasCompletedTools: hasCompletedTools
  };
}

/**
 * Find matches based on detail criteria
 * @private
 */
function _findDetailMatches(rosterData, details) {
  const { firstName, lastName, email } = details;
  const headers = rosterData.headers;
  const matches = [];
  
  const firstNameCol = headers.indexOf('First_Name') >= 0 ? headers.indexOf('First_Name') : ROSTER.COLUMNS.FIRST_NAME - 1;
  const lastNameCol = headers.indexOf('Last_Name') >= 0 ? headers.indexOf('Last_Name') : ROSTER.COLUMNS.LAST_NAME - 1;
  const emailCol = headers.indexOf('Email') >= 0 ? headers.indexOf('Email') : ROSTER.COLUMNS.EMAIL - 1;
  const clientIdCol = headers.indexOf('Client_ID') >= 0 ? headers.indexOf('Client_ID') : ROSTER.COLUMNS.CLIENT_ID - 1;
  const statusCol = headers.indexOf('Status') >= 0 ? headers.indexOf('Status') : ROSTER.COLUMNS.STATUS - 1;
  
  for (const row of rosterData.data) {
    const rowStatus = String(row[statusCol] || '').trim();
    if (rowStatus.toLowerCase() === 'inactive') continue;
    
    const rowFirst = String(row[firstNameCol] || '').trim().toLowerCase();
    const rowLast = String(row[lastNameCol] || '').trim().toLowerCase();
    const rowEmail = String(row[emailCol] || '').trim().toLowerCase();
    const rowClientId = String(row[clientIdCol] || '').trim();
    
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
        firstName: String(row[firstNameCol] || '').trim(),
        lastName: String(row[lastNameCol] || '').trim(),
        email: String(row[emailCol] || '').trim(),
        fullName: `${row[firstNameCol]} ${row[lastNameCol]}`.trim(),
        matchedOn: matchTypes.join(' & ')
      });
    }
  }
  
  return matches;
}

/**
 * Process detail matches and return appropriate response
 * @private
 */
function _processDetailMatches(matches) {
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
}