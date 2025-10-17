/**
 * Test Authentication Module
 * Functions to test the authentication system
 */

/**
 * Test authentication with a sample Client ID
 */
function testClientIdLookup() {
  const testIds = [
    'TEST-001',  // Should fail - not in roster
    'FTV2-001',  // Replace with actual ID from roster
    'abc123'     // Test normalization
  ];
  
  const results = [];
  testIds.forEach(id => {
    try {
      const result = lookupClientById(id);
      results.push({
        input: id,
        result: result
      });
    } catch (error) {
      results.push({
        input: id,
        error: error.toString()
      });
    }
  });
  
  console.log('Client ID Lookup Test Results:', results);
  return results;
}

/**
 * Test name/email lookup
 */
function testNameLookup() {
  const testCases = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: ''
    },
    {
      firstName: '',
      lastName: 'Smith',
      email: 'smith@example.com'
    },
    {
      firstName: 'Jane',
      lastName: '',
      email: 'jane@example.com'
    }
  ];
  
  const results = [];
  testCases.forEach(test => {
    try {
      const result = lookupClientByDetails(test);
      results.push({
        input: test,
        result: result
      });
    } catch (error) {
      results.push({
        input: test,
        error: error.toString()
      });
    }
  });
  
  console.log('Name Lookup Test Results:', results);
  return results;
}

/**
 * Test session creation
 */
function testSessionCreation() {
  const mockClient = {
    success: true,
    clientId: 'TEST-123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    fullName: 'Test User'
  };
  
  const session = createUserSession(mockClient);
  console.log('Created Session:', session);
  
  // Test session verification
  const isValid = verifySession(session.sessionId, session.clientId);
  console.log('Session Valid:', isValid);
  
  return {
    session: session,
    isValid: isValid
  };
}

/**
 * Test roster connection
 */
function testRosterConnection() {
  try {
    const sheet = getRosterSheet();
    if (sheet) {
      const sheetInfo = {
        name: sheet.getName(),
        id: sheet.getSheetId(),
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn()
      };
      
      // Get headers to verify column mapping
      if (sheet.getLastRow() > 0) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        sheetInfo.headers = headers;
        
        // Verify expected columns
        sheetInfo.columnCheck = {
          firstName: headers[ROSTER.COLUMNS.FIRST_NAME - 1] || 'Column ' + ROSTER.COLUMNS.FIRST_NAME,
          lastName: headers[ROSTER.COLUMNS.LAST_NAME - 1] || 'Column ' + ROSTER.COLUMNS.LAST_NAME,
          email: headers[ROSTER.COLUMNS.EMAIL - 1] || 'Column ' + ROSTER.COLUMNS.EMAIL,
          clientId: headers[ROSTER.COLUMNS.CLIENT_ID - 1] || 'Column ' + ROSTER.COLUMNS.CLIENT_ID
        };
      }
      
      console.log('Roster Sheet Info:', sheetInfo);
      return {
        success: true,
        info: sheetInfo
      };
    } else {
      return {
        success: false,
        error: 'Could not access roster sheet'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get sample Client IDs from roster for testing
 */
function getSampleClientIds() {
  try {
    const sheet = getRosterSheet();
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'No data in roster' };
    }
    
    // Get first 5 Client IDs for testing
    const numRows = Math.min(5, sheet.getLastRow() - 1);
    const clientIds = sheet.getRange(2, ROSTER.COLUMNS.CLIENT_ID, numRows, 1).getValues();
    
    const samples = [];
    for (let i = 0; i < clientIds.length; i++) {
      if (clientIds[i][0]) {
        const firstName = sheet.getRange(2 + i, ROSTER.COLUMNS.FIRST_NAME).getValue();
        const lastName = sheet.getRange(2 + i, ROSTER.COLUMNS.LAST_NAME).getValue();
        samples.push({
          clientId: clientIds[i][0],
          name: `${firstName} ${lastName}`.trim(),
          normalized: normalizeId(clientIds[i][0])
        });
      }
    }
    
    console.log('Sample Client IDs:', samples);
    return {
      success: true,
      samples: samples
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Run all authentication tests
 */
function runAllAuthTests() {
  const results = {
    timestamp: new Date(),
    tests: {}
  };
  
  // Test 1: Roster Connection
  console.log('Testing roster connection...');
  results.tests.rosterConnection = testRosterConnection();
  
  // Test 2: Get Sample IDs
  console.log('Getting sample Client IDs...');
  results.tests.sampleIds = getSampleClientIds();
  
  // Test 3: Session Creation
  console.log('Testing session creation...');
  results.tests.sessionCreation = testSessionCreation();
  
  // Test 4: Client ID Lookup (if we have samples)
  if (results.tests.sampleIds.success && results.tests.sampleIds.samples.length > 0) {
    console.log('Testing Client ID lookup with real ID...');
    const realId = results.tests.sampleIds.samples[0].clientId;
    results.tests.realIdLookup = lookupClientById(realId);
  }
  
  console.log('All Auth Tests Complete:', results);
  
  // Show results in UI
  const ui = SpreadsheetApp.getUi();
  const summary = `
Authentication Test Results:
- Roster Connection: ${results.tests.rosterConnection.success ? '✅' : '❌'}
- Sample IDs Found: ${results.tests.sampleIds.success ? '✅ ' + results.tests.sampleIds.samples.length : '❌'}
- Session Creation: ${results.tests.sessionCreation.isValid ? '✅' : '❌'}
${results.tests.realIdLookup ? '- Real ID Lookup: ' + (results.tests.realIdLookup.success ? '✅' : '❌') : ''}
  `;
  
  ui.alert('Authentication Tests', summary, ui.ButtonSet.OK);
  return results;
}