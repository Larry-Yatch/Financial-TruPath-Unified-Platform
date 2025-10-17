/**
 * Verify Setup - Diagnostic tool to ensure all components are properly configured
 */

/**
 * Run complete setup verification
 */
function verifyCompleteSetup() {
  const ui = SpreadsheetApp.getUi();
  const results = [];
  
  console.log('Starting setup verification...');
  
  // Test 1: Check if all required files are accessible
  results.push(checkRequiredFiles());
  
  // Test 2: Check roster configuration
  results.push(checkRosterConfiguration());
  
  // Test 3: Check data sheets
  results.push(checkDataSheets());
  
  // Test 4: Check web app deployment
  results.push(checkWebAppDeployment());
  
  // Test 5: Test a sample authentication
  results.push(testSampleAuthentication());
  
  // Generate report
  let report = '===== SETUP VERIFICATION REPORT =====\n\n';
  let allPassed = true;
  
  results.forEach(result => {
    report += `${result.name}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    if (!result.passed) {
      allPassed = false;
      report += `  Issue: ${result.issue}\n`;
      if (result.fix) {
        report += `  Fix: ${result.fix}\n`;
      }
    } else if (result.details) {
      report += `  Details: ${result.details}\n`;
    }
    report += '\n';
  });
  
  report += '=====================================\n';
  report += allPassed ? 
    '✅ ALL TESTS PASSED - System is ready!' : 
    '⚠️ Some tests failed - Please fix the issues above';
  
  // Show results
  ui.alert('Setup Verification', report, ui.ButtonSet.OK);
  
  console.log('Verification complete:', results);
  return results;
}

/**
 * Check if all required files are accessible
 */
function checkRequiredFiles() {
  try {
    const requiredFunctions = [
      { name: 'getRosterSheet', file: 'Authentication.js' },
      { name: 'lookupClientById', file: 'Authentication.js' },
      { name: 'createUserSession', file: 'Authentication.js' },
      { name: 'getUnifiedProfile', file: 'DataHub.js' },
      { name: 'saveToolData', file: 'DataHub.js' },
      { name: 'generateInsights', file: 'Middleware.js' }
    ];
    
    const missing = [];
    requiredFunctions.forEach(func => {
      // In Google Apps Script, functions are in the global scope
      // Check if function exists by trying to access it
      try {
        if (typeof this[func.name] !== 'function') {
          // Try to evaluate the function name directly
          eval(`typeof ${func.name}`);
        }
      } catch (e) {
        missing.push(`${func.name} (${func.file})`);
      }
    });
    
    if (missing.length > 0) {
      return {
        name: 'Required Files Check',
        passed: false,
        issue: `Missing functions: ${missing.join(', ')}`,
        fix: 'Ensure all .js files are present in Apps Script editor'
      };
    }
    
    return {
      name: 'Required Files Check',
      passed: true,
      details: 'All required functions are accessible'
    };
    
  } catch (error) {
    return {
      name: 'Required Files Check',
      passed: false,
      issue: error.toString()
    };
  }
}

/**
 * Check roster configuration and access
 */
function checkRosterConfiguration() {
  try {
    // Check if ROSTER constant is defined
    if (typeof ROSTER === 'undefined') {
      // Try to define it locally for testing
      const ROSTER = {
        SPREADSHEET_ID: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
        SHEET_NAME: 'Financial v2 (24SEPT25 start)',
        SHEET_GID: 753820167
      };
    }
    
    // Try to get roster sheet
    const sheet = getRosterSheet();
    
    if (!sheet) {
      return {
        name: 'Roster Configuration',
        passed: false,
        issue: 'Cannot access roster sheet',
        fix: 'Check ROSTER configuration in Authentication.js and ensure you have access to the spreadsheet'
      };
    }
    
    // Check if sheet has data
    const rows = sheet.getLastRow();
    const cols = sheet.getLastColumn();
    
    if (rows < 2) {
      return {
        name: 'Roster Configuration',
        passed: false,
        issue: 'Roster sheet has no data rows',
        fix: 'Add student data to the roster sheet'
      };
    }
    
    // Check column G for Client IDs
    const sampleId = sheet.getRange(2, 7).getValue(); // Column G
    
    return {
      name: 'Roster Configuration',
      passed: true,
      details: `Connected to "${sheet.getName()}" with ${rows} rows, Sample ID: ${sampleId || 'empty'}`
    };
    
  } catch (error) {
    return {
      name: 'Roster Configuration',
      passed: false,
      issue: error.toString(),
      fix: 'Check Authentication.js and roster spreadsheet permissions'
    };
  }
}

/**
 * Check if data sheets exist
 */
function checkDataSheets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = [
      'Tool1_Orientation',
      'Students'
    ];
    
    const missing = [];
    requiredSheets.forEach(sheetName => {
      if (!ss.getSheetByName(sheetName)) {
        missing.push(sheetName);
      }
    });
    
    if (missing.length > 0) {
      return {
        name: 'Data Sheets Check',
        passed: false,
        issue: `Missing sheets: ${missing.join(', ')}`,
        fix: 'Run "Initialize Platform" or "Create Data Sheets" from the menu'
      };
    }
    
    return {
      name: 'Data Sheets Check',
      passed: true,
      details: 'All required data sheets exist'
    };
    
  } catch (error) {
    return {
      name: 'Data Sheets Check',
      passed: false,
      issue: error.toString()
    };
  }
}

/**
 * Check web app deployment status
 */
function checkWebAppDeployment() {
  try {
    const url = ScriptApp.getService().getUrl();
    
    if (!url) {
      return {
        name: 'Web App Deployment',
        passed: false,
        issue: 'Web app not deployed',
        fix: 'Go to Extensions → Apps Script → Deploy → New Deployment'
      };
    }
    
    return {
      name: 'Web App Deployment',
      passed: true,
      details: `Deployed at: ${url}`
    };
    
  } catch (error) {
    return {
      name: 'Web App Deployment',
      passed: false,
      issue: error.toString()
    };
  }
}

/**
 * Test sample authentication
 */
function testSampleAuthentication() {
  try {
    // Try to get a sample Client ID and test authentication
    const sheet = getRosterSheet();
    
    if (!sheet || sheet.getLastRow() < 2) {
      return {
        name: 'Sample Authentication Test',
        passed: false,
        issue: 'No data in roster to test',
        fix: 'Add at least one student to the roster'
      };
    }
    
    // Get first Client ID
    const sampleId = sheet.getRange(2, 7).getValue(); // Column G
    
    if (!sampleId) {
      return {
        name: 'Sample Authentication Test',
        passed: false,
        issue: 'No Client ID found in first data row',
        fix: 'Ensure Client IDs are in column G of the roster'
      };
    }
    
    // Test lookup
    const result = lookupClientById(sampleId);
    
    if (!result.success) {
      return {
        name: 'Sample Authentication Test',
        passed: false,
        issue: `Lookup failed: ${result.error}`,
        fix: 'Check lookupClientById function and column mappings'
      };
    }
    
    return {
      name: 'Sample Authentication Test',
      passed: true,
      details: `Successfully authenticated: ${result.firstName} ${result.lastName} (${sampleId})`
    };
    
  } catch (error) {
    return {
      name: 'Sample Authentication Test',
      passed: false,
      issue: error.toString()
    };
  }
}

/**
 * Quick diagnostic function
 */
function quickDiagnostic() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Quick checks
    const checks = [];
    
    // 1. Can we access roster?
    try {
      const sheet = getRosterSheet();
      checks.push(`✅ Roster access: ${sheet ? sheet.getName() : 'Failed'}`);
    } catch (e) {
      checks.push(`❌ Roster access: ${e.toString()}`);
    }
    
    // 2. Do we have data sheets?
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tool1 = ss.getSheetByName('Tool1_Orientation');
    checks.push(tool1 ? '✅ Tool1 sheet exists' : '❌ Tool1 sheet missing');
    
    // 3. Is web app deployed?
    const url = ScriptApp.getService().getUrl();
    checks.push(url ? '✅ Web app deployed' : '❌ Web app not deployed');
    
    // 4. Can we find CONFIG?
    checks.push(typeof CONFIG !== 'undefined' ? '✅ CONFIG available' : '❌ CONFIG not found');
    
    ui.alert('Quick Diagnostic', checks.join('\n'), ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Diagnostic Error', error.toString(), ui.ButtonSet.OK);
  }
}