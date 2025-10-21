/**
 * Test Script for Sheet Setup - Financial TruPath V2.0
 * Use this to test and verify the sheet configuration
 */

/**
 * Test the complete sheet setup process
 */
function testCompleteSetup() {
  console.log('=== Testing Complete Sheet Setup ===');
  
  try {
    // Step 1: Check existing sheets
    console.log('\n1. Checking existing sheets...');
    const existing = checkExistingSheets();
    
    // Step 2: Run sheet setup
    console.log('\n2. Running sheet setup...');
    const setupResults = setupAllSheets();
    
    // Step 3: Verify setup
    console.log('\n3. Verifying setup...');
    const verification = verifySheetSetup();
    
    // Step 4: Summary
    console.log('\n=== SETUP SUMMARY ===');
    console.log('Created sheets:', setupResults.created);
    console.log('Existing sheets:', setupResults.existing);
    console.log('All required sheets exist:', verification.allSheetsExist);
    
    if (setupResults.errors.length > 0) {
      console.log('Errors encountered:', setupResults.errors);
    }
    
    return {
      success: verification.allSheetsExist && setupResults.errors.length === 0,
      setupResults,
      verification
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test individual sheet creation
 */
function testSingleSheet(sheetName) {
  console.log(`=== Testing Single Sheet: ${sheetName} ===`);
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if sheet exists before
    const existsBefore = ss.getSheetByName(sheetName) !== null;
    console.log(`Sheet exists before: ${existsBefore}`);
    
    // Run setup for all sheets (it will handle existing ones)
    setupAllSheets();
    
    // Check if sheet exists after
    const existsAfter = ss.getSheetByName(sheetName) !== null;
    console.log(`Sheet exists after: ${existsAfter}`);
    
    if (existsAfter) {
      const sheet = ss.getSheetByName(sheetName);
      console.log(`Sheet has ${sheet.getLastRow()} rows and ${sheet.getLastColumn()} columns`);
      
      // Check headers
      if (sheet.getLastRow() >= 1) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        console.log('Headers:', headers);
      }
    }
    
    return { success: existsAfter };
    
  } catch (error) {
    console.error(`Test failed for ${sheetName}:`, error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Check the spreadsheet URL and connection
 */
function testSpreadsheetConnection() {
  console.log('=== Testing Spreadsheet Connection ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const url = ss.getUrl();
    const id = ss.getId();
    const name = ss.getName();
    
    console.log(`Spreadsheet Name: ${name}`);
    console.log(`Spreadsheet ID: ${id}`);
    console.log(`Spreadsheet URL: ${url}`);
    console.log(`Expected ID: ${CONFIG.MASTER_SHEET_ID}`);
    console.log(`ID Match: ${id === CONFIG.MASTER_SHEET_ID}`);
    
    return {
      success: id === CONFIG.MASTER_SHEET_ID,
      spreadsheetInfo: { name, id, url }
    };
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🧪 RUNNING ALL SHEET SETUP TESTS 🧪');
  console.log('=====================================');
  
  const results = {
    connection: testSpreadsheetConnection(),
    setup: testCompleteSetup()
  };
  
  console.log('\n📊 FINAL TEST RESULTS 📊');
  console.log('========================');
  console.log(`Connection Test: ${results.connection.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Setup Test: ${results.setup.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.connection.success && results.setup.success;
  console.log(`\nOverall: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
  
  return results;
}

/**
 * Quick verification function - use this to check status anytime
 */
function quickCheck() {
  console.log('🔍 QUICK SHEET CHECK');
  console.log('===================');
  
  const verification = verifySheetSetup();
  const requiredSheets = ['SESSIONS', 'RESPONSES', 'TOOL_STATUS', 'TOOL_ACCESS', 'ACTIVITY_LOG', 'ADMINS', 'CONFIG'];
  
  console.log('Required Sheets Status:');
  requiredSheets.forEach(sheetName => {
    const status = verification.sheetStatus[sheetName];
    if (status?.exists) {
      console.log(`✅ ${sheetName} - ${status.rows} rows, ${status.columns} columns`);
    } else {
      console.log(`❌ ${sheetName} - Missing`);
    }
  });
  
  console.log(`\nSummary: ${verification.allSheetsExist ? '✅ All sheets configured' : '⚠️ Setup incomplete'}`);
  
  return verification;
}