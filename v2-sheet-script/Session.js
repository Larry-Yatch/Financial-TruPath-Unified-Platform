/**
 * Session Management Module for Financial TruPath V2.0
 * Handles session creation, validation, and expiration
 * Sessions are stored in the SESSIONS sheet in Google Sheets
 */

/**
 * Get the SESSIONS sheet from the configured spreadsheet
 * @returns {Sheet} The SESSIONS sheet
 */
function getSessionsSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    let sheet = ss.getSheetByName('SESSIONS');
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      sheet = ss.insertSheet('SESSIONS');
      // Set headers to match existing structure
      const headers = ['Session_Token', 'Client_ID', 'Created_At', 'Expires_At', 'Last_Activity', 'IP_Address'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing SESSIONS sheet:', error);
    throw new Error('Unable to access sessions database');
  }
}

/**
 * Create a new session for authenticated user
 * @param {string} clientId - The validated client ID
 * @returns {Object} Session object with token and details
 */
function createSession(clientId) {
  try {
    const sessionId = Utilities.getUuid();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
    
    // Get the SESSIONS sheet
    const sheet = getSessionsSheet();
    
    // Check for existing active session
    const existingSession = findActiveSession(clientId);
    if (existingSession) {
      // Update last activity of existing session
      updateSessionActivity(existingSession.sessionId);
      // Ensure success flag is present
      existingSession.success = true;
      return existingSession;
    }
    
    // Create new session record (matching sheet columns)
    const sessionData = [
      sessionId,        // Session_Token
      clientId,         // Client_ID
      now,             // Created_At
      expiresAt,       // Expires_At
      now,             // Last_Activity
      'active'         // IP_Address (using for status)
    ];
    
    // Append to sheet
    sheet.appendRow(sessionData);
    
    // Log session creation
    console.log(`Session created for ${clientId}: ${sessionId}`);
    
    return {
      success: true,
      sessionId: sessionId,
      clientId: clientId,
      loginTime: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    };
    
  } catch (error) {
    console.error('Error creating session:', error);
    return {
      success: false,
      error: 'Failed to create session'
    };
  }
}

/**
 * Validate a session token
 * @param {string} sessionId - The session token to validate
 * @returns {Object} Validation result with session details
 */
function validateSession(sessionId) {
  try {
    if (!sessionId) {
      return {
        valid: false,
        error: 'No session token provided'
      };
    }
    
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const storedSessionId = row[0];  // Session_Token
      const clientId = row[1];          // Client_ID
      const expiresAt = new Date(row[3]); // Expires_At (column 4)
      const status = row[5];             // IP_Address (column 6, using for status)
      
      if (storedSessionId === sessionId) {
        // Check if session is active
        if (status !== 'active') {
          return {
            valid: false,
            error: 'Session is not active'
          };
        }
        
        // Check if session has expired
        const now = new Date();
        if (now > expiresAt) {
          // Mark session as expired
          sheet.getRange(i + 1, 6).setValue('expired');
          return {
            valid: false,
            error: 'Session has expired'
          };
        }
        
        // Update last activity
        sheet.getRange(i + 1, 4).setValue(new Date());
        
        return {
          valid: true,
          sessionId: sessionId,
          clientId: clientId,
          expiresAt: expiresAt.toISOString()
        };
      }
    }
    
    return {
      valid: false,
      error: 'Session not found'
    };
    
  } catch (error) {
    console.error('Error validating session:', error);
    return {
      valid: false,
      error: 'Session validation failed'
    };
  }
}

/**
 * Find active session for a client
 * @param {string} clientId - The client ID to search for
 * @returns {Object|null} Active session or null
 */
function findActiveSession(clientId) {
  try {
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const sessionId = row[0];           // Session_Token
      const storedClientId = row[1];      // Client_ID
      const expiresAt = new Date(row[3]); // Expires_At
      const status = row[5];             // IP_Address (using for status)
      
      if (storedClientId === clientId && status === 'active' && now < expiresAt) {
        return {
          success: true,  // Add success flag
          sessionId: sessionId,
          clientId: clientId,
          loginTime: row[2],
          expiresAt: expiresAt.toISOString(),
          status: 'active'
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error finding active session:', error);
    return null;
  }
}

/**
 * Update session last activity timestamp
 * @param {string} sessionId - The session ID to update
 */
function updateSessionActivity(sessionId) {
  try {
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sessionId) {
        sheet.getRange(i + 1, 4).setValue(new Date());
        break;
      }
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Expire a session (logout)
 * @param {string} sessionId - The session ID to expire
 * @returns {Object} Result of expiration
 */
function expireSession(sessionId) {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'No session token provided'
      };
    }
    
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sessionId) {
        // Mark as expired
        sheet.getRange(i + 1, 6).setValue('expired');
        sheet.getRange(i + 1, 4).setValue(new Date()); // Update last activity
        
        console.log(`Session expired: ${sessionId}`);
        
        return {
          success: true,
          message: 'Session expired successfully'
        };
      }
    }
    
    return {
      success: false,
      error: 'Session not found'
    };
    
  } catch (error) {
    console.error('Error expiring session:', error);
    return {
      success: false,
      error: 'Failed to expire session'
    };
  }
}

/**
 * Clean up expired sessions (maintenance function)
 */
function cleanupExpiredSessions() {
  try {
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    let expiredCount = 0;
    
    // Work backwards to avoid index issues when updating
    for (let i = data.length - 1; i > 0; i--) {
      const expiresAt = new Date(data[i][4]);
      const status = data[i][5];
      
      if (status === 'active' && now > expiresAt) {
        sheet.getRange(i + 1, 6).setValue('expired');
        expiredCount++;
      }
    }
    
    console.log(`Cleanup: ${expiredCount} sessions expired`);
    return {
      success: true,
      expiredCount: expiredCount
    };
    
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get all active sessions (admin function)
 * @returns {Array} Array of active sessions
 */
function getActiveSessions() {
  try {
    const sheet = getSessionsSheet();
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    const activeSessions = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const expiresAt = new Date(row[4]);
      const status = row[5];
      
      if (status === 'active' && now < expiresAt) {
        activeSessions.push({
          sessionId: row[0],
          clientId: row[1],
          loginTime: row[2],
          lastActivity: row[3],
          expiresAt: row[4]
        });
      }
    }
    
    return activeSessions;
    
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return [];
  }
}

/**
 * Test session management functions
 */
function testSessionManagement() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Test creating a session
    const testClientId = 'TEST001';
    const session = createSession(testClientId);
    
    if (!session.success) {
      ui.alert('Session Test Failed', 'Failed to create session: ' + session.error, ui.ButtonSet.OK);
      return;
    }
    
    // Test validating the session
    const validation = validateSession(session.sessionId);
    
    // Test finding active session
    const activeSession = findActiveSession(testClientId);
    
    // Display results
    const message = `Session Management Test Results:
    
✅ Session Created:
- Session ID: ${session.sessionId}
- Client ID: ${session.clientId}
- Expires: ${session.expiresAt}

✅ Session Validated:
- Valid: ${validation.valid}
- Client ID: ${validation.clientId || 'N/A'}

✅ Active Session Found:
- Found: ${activeSession ? 'Yes' : 'No'}
- Session ID: ${activeSession ? activeSession.sessionId : 'N/A'}

Check the SESSIONS sheet for the new record!`;
    
    ui.alert('Session Test Success', message, ui.ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}