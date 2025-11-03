/**
 * Session Management Module for Financial TruPath V2.0
 * Handles session creation, validation, and expiration
 * Sessions are stored in the SESSIONS sheet in Google Sheets
 * Refactored for improved error handling and data operations
 */

/**
 * Get the SESSIONS sheet with improved error handling
 * @returns {Object} Result with sheet or error
 */
function getSessionsSheet() {
  const headers = ['Session_Token', 'Client_ID', 'Created_At', 'Expires_At', 'Last_Activity', 'IP_Address'];
  
  return DataOperations.withSheet('SESSIONS', (sheet) => {
    // Ensure headers exist
    const headerResult = DataOperations.getOrCreateHeaders(sheet, headers);
    if (!headerResult.success) {
      throw new Error(headerResult.error);
    }
    return sheet;
  }, 'get sessions sheet');
}

/**
 * Create a new session for authenticated user with improved data operations
 * @param {string} clientId - The validated client ID
 * @returns {Object} Session object with token and details
 */
function createSession(clientId) {
  try {
    // Check for existing active session first
    const existingSession = findActiveSession(clientId);
    if (existingSession && existingSession.success) {
      updateSessionActivity(existingSession.sessionId);
      return existingSession;
    }
    
    // Create new session
    const sessionData = _prepareNewSessionData(clientId);
    const headers = ['Session_Token', 'Client_ID', 'Created_At', 'Expires_At', 'Last_Activity', 'IP_Address'];
    
    const result = DataOperations.saveToSheet(
      'SESSIONS',
      sessionData,
      headers,
      'create session'
    );
    
    if (!result.success) {
      return DataOperations.createError('create session', result.error);
    }
    
    console.log(`Session created for ${clientId}: ${sessionData.Session_Token}`);
    
    return DataOperations.createSuccess('create session', {
      sessionId: sessionData.Session_Token,
      clientId: clientId,
      loginTime: sessionData.Created_At,
      expiresAt: sessionData.Expires_At,
      status: 'active'
    });
    
  } catch (error) {
    console.error('Error creating session:', error);
    return DataOperations.createError('create session', error);
  }
}

/**
 * Validate a session token with improved data operations
 * @param {string} sessionId - The session token to validate
 * @returns {Object} Validation result with session details
 */
function validateSession(sessionId) {
  if (!sessionId) {
    return {
      valid: false,
      error: 'No session token provided'
    };
  }
  
  try {
    const result = DataOperations.findRecord(
      'SESSIONS',
      { Session_Token: sessionId },
      false
    );
    
    if (!result.success || !result.record) {
      return {
        valid: false,
        error: 'Session not found'
      };
    }
    
    const session = result.record;
    
    // Check if session is active
    if (session.IP_Address !== 'active') {
      return {
        valid: false,
        error: 'Session is not active'
      };
    }
    
    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.Expires_At);
    
    if (now > expiresAt) {
      // Mark session as expired
      DataOperations.updateRecord(
        'SESSIONS',
        { Session_Token: sessionId },
        { IP_Address: 'expired' }
      );
      
      return {
        valid: false,
        error: 'Session has expired'
      };
    }
    
    // Update last activity
    DataOperations.updateRecord(
      'SESSIONS',
      { Session_Token: sessionId },
      { Last_Activity: new Date().toISOString() }
    );
    
    return {
      valid: true,
      sessionId: sessionId,
      clientId: session.Client_ID,
      expiresAt: expiresAt.toISOString()
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
 * Find active session for a client with improved data operations
 * @param {string} clientId - The client ID to search for
 * @returns {Object|null} Active session or null
 */
function findActiveSession(clientId) {
  try {
    const sessionsData = DataOperations.loadFromSheet('SESSIONS', null, 'find active session');
    
    if (!sessionsData.success || sessionsData.data.length === 0) {
      return null;
    }
    
    const now = new Date();
    const headers = sessionsData.headers;
    
    // Find indices for our columns
    const sessionTokenCol = headers.indexOf('Session_Token');
    const clientIdCol = headers.indexOf('Client_ID');
    const createdAtCol = headers.indexOf('Created_At');
    const expiresAtCol = headers.indexOf('Expires_At');
    const statusCol = headers.indexOf('IP_Address'); // Using this for status
    
    // Search for active session
    for (const row of sessionsData.data) {
      const storedClientId = row[clientIdCol];
      const status = row[statusCol];
      const expiresAt = new Date(row[expiresAtCol]);
      
      if (storedClientId === clientId && status === 'active' && now < expiresAt) {
        return {
          success: true,
          sessionId: row[sessionTokenCol],
          clientId: clientId,
          loginTime: row[createdAtCol],
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
    const validation = validateSession(session.data.sessionId);
    
    // Test finding active session
    const activeSession = findActiveSession(testClientId);
    
    // Display results
    const message = `Session Management Test Results:
    
✅ Session Created:
- Session ID: ${session.data.sessionId}
- Client ID: ${session.data.clientId}
- Expires: ${session.data.expiresAt}

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

// ===== HELPER FUNCTIONS =====

/**
 * Prepare new session data
 * @private
 */
function _prepareNewSessionData(clientId) {
  const sessionId = Utilities.getUuid();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(); // 24 hours
  
  return {
    Session_Token: sessionId,
    Client_ID: clientId,
    Created_At: now,
    Expires_At: expiresAt,
    Last_Activity: now,
    IP_Address: 'active' // Using this field for status
  };
}