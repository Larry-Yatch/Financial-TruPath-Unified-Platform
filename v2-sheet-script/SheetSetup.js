/**
 * Sheet Setup and Configuration for Financial TruPath V2.0
 * Creates and configures all required sheets with proper headers and formatting
 */

/**
 * Main function to setup all required sheets
 */
function setupAllSheets() {
  console.log('Starting sheet setup for Financial TruPath V2...');
  
  // Use the specific spreadsheet ID
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  
  // Check existing sheets
  const existingSheets = ss.getSheets().map(sheet => sheet.getName());
  console.log('Existing sheets:', existingSheets);
  
  // Sheet configurations
  const sheetConfigs = {
    'SESSIONS': {
      headers: ['Session_Token', 'Client_ID', 'Created_At', 'Expires_At', 'Last_Activity', 'IP_Address'],
      columnWidths: [200, 150, 120, 120, 120, 150]
    },
    'RESPONSES': {
      headers: ['Response_ID', 'Client_ID', 'Tool_ID', 'Version', 'Status', 'Data', 'Created_At', 'Updated_At'],
      columnWidths: [150, 150, 100, 80, 100, 300, 120, 120]
    },
    'TOOL_STATUS': {
      headers: [
        'Client_ID', 
        'Tool_1_Status', 'Tool_1_Date', 'Tool_1_Version',
        'Tool_2_Status', 'Tool_2_Date', 'Tool_2_Version',
        'Tool_3_Status', 'Tool_3_Date', 'Tool_3_Version',
        'Tool_4_Status', 'Tool_4_Date', 'Tool_4_Version',
        'Tool_5_Status', 'Tool_5_Date', 'Tool_5_Version',
        'Tool_6_Status', 'Tool_6_Date', 'Tool_6_Version',
        'Tool_7_Status', 'Tool_7_Date', 'Tool_7_Version',
        'Tool_8_Status', 'Tool_8_Date', 'Tool_8_Version',
        'Last_Updated'
      ],
      columnWidths: [
        150, 
        100, 100, 80, 100, 100, 80, 100, 100, 80, 100, 100, 80,
        100, 100, 80, 100, 100, 80, 100, 100, 80, 100, 100, 80,
        120
      ]
    },
    'TOOL_ACCESS': {
      headers: ['Client_ID', 'Tool_1', 'Tool_2', 'Tool_3', 'Tool_4', 'Tool_5', 'Tool_6', 'Tool_7', 'Tool_8', 'Override_All', 'Updated_By', 'Updated_At'],
      columnWidths: [150, 80, 80, 80, 80, 80, 80, 80, 80, 100, 150, 120]
    },
    'ACTIVITY_LOG': {
      headers: ['Log_ID', 'Timestamp', 'Client_ID', 'Action', 'Tool_ID', 'Details', 'IP_Address', 'Session_Token'],
      columnWidths: [100, 120, 150, 120, 100, 300, 150, 200]
    },
    'ADMINS': {
      headers: ['Admin_Email', 'Admin_Name', 'Role', 'Active', 'Added_Date', 'Added_By'],
      columnWidths: [200, 150, 100, 80, 120, 150]
    },
    'CONFIG': {
      headers: ['Setting_Key', 'Setting_Value', 'Description', 'Updated_At', 'Updated_By'],
      columnWidths: [200, 250, 300, 120, 150]
    }
  };
  
  const results = {
    created: [],
    existing: [],
    errors: []
  };
  
  // Process each sheet
  for (const [sheetName, config] of Object.entries(sheetConfigs)) {
    try {
      const result = createAndConfigureSheet(ss, sheetName, config.headers, config.columnWidths);
      if (result.created) {
        results.created.push(sheetName);
      } else {
        results.existing.push(sheetName);
      }
    } catch (error) {
      console.error(`Error creating sheet ${sheetName}:`, error);
      results.errors.push({sheet: sheetName, error: error.toString()});
    }
  }
  
  // Log results
  console.log('Sheet setup completed!');
  console.log('Created sheets:', results.created);
  console.log('Existing sheets:', results.existing);
  if (results.errors.length > 0) {
    console.log('Errors:', results.errors);
  }
  
  return results;
}

/**
 * Create and configure a single sheet
 */
function createAndConfigureSheet(spreadsheet, sheetName, headers, columnWidths) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  let wasCreated = false;
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    wasCreated = true;
    console.log(`Created sheet: ${sheetName}`);
  } else {
    console.log(`Sheet already exists: ${sheetName}`);
  }
  
  // Only configure if newly created or if headers don't exist
  const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = existingHeaders.some(cell => cell !== '');
  
  if (wasCreated || !hasHeaders) {
    // Set headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    
    // Format headers
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('white');
    headerRange.setHorizontalAlignment('center');
    
    // Set column widths
    for (let i = 0; i < columnWidths.length; i++) {
      sheet.setColumnWidth(i + 1, columnWidths[i]);
    }
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
    console.log(`Configured headers and formatting for: ${sheetName}`);
  }
  
  return { created: wasCreated };
}

/**
 * Simple function to run from Apps Script editor
 * Run this to create all sheets
 */
function runSheetSetup() {
  console.log('=== Starting Sheet Setup ===');
  
  try {
    const result = setupAllSheets();
    console.log('✅ Setup completed successfully!');
    console.log('Created sheets:', result.created.join(', ') || 'None (all existed)');
    
    // Verify all sheets exist
    const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
    const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
    const allSheets = ss.getSheets().map(s => s.getName());
    console.log('All sheets in spreadsheet:', allSheets.join(', '));
    
    return 'Success';
  } catch (error) {
    console.error('❌ Setup failed:', error.toString());
    return 'Failed: ' + error.toString();
  }
}

/**
 * Check what sheets currently exist
 */
function checkExistingSheets() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  console.log('Current sheets in spreadsheet:');
  sheets.forEach((sheet, index) => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    console.log(`${index + 1}. ${name} (${lastRow} rows, ${lastCol} columns)`);
  });
  
  return sheets.map(sheet => ({
    name: sheet.getName(),
    rows: sheet.getLastRow(),
    columns: sheet.getLastColumn()
  }));
}

/**
 * Verify sheet setup is complete
 */
function verifySheetSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = ['SESSIONS', 'RESPONSES', 'TOOL_STATUS', 'TOOL_ACCESS', 'ACTIVITY_LOG', 'ADMINS', 'CONFIG'];
  
  const verification = {
    allSheetsExist: true,
    missingSheets: [],
    sheetStatus: {}
  };
  
  for (const sheetName of requiredSheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const hasHeaders = sheet.getLastRow() >= 1 && sheet.getLastColumn() >= 1;
      verification.sheetStatus[sheetName] = {
        exists: true,
        hasHeaders: hasHeaders,
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn()
      };
    } else {
      verification.allSheetsExist = false;
      verification.missingSheets.push(sheetName);
      verification.sheetStatus[sheetName] = { exists: false };
    }
  }
  
  console.log('Verification results:', verification);
  return verification;
}