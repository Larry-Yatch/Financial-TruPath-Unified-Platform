/**
 * Fix Students Sheet - Set up proper structure for authentication
 * This will make the backup login method work with our local sheet
 */

/**
 * Fix the Students sheet to have proper structure
 */
function fixStudentsSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    let sheet = ss.getSheetByName('Students');
    
    if (!sheet) {
      sheet = ss.insertSheet('Students');
    }
    
    // Clear existing content
    sheet.clear();
    
    // Set up proper headers matching Authentication.js expectations
    // Columns A-B are reserved/empty
    // Columns C-H contain the actual data
    const headers = [
      '', // Column A - Reserved
      '', // Column B - Reserved  
      'First Name', // Column C
      'Last Name',  // Column D
      'Phone',      // Column E
      'Email',      // Column F
      'Client ID',  // Column G
      'Status'      // Column H
    ];
    
    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Add test users for development
    const testUsers = [
      ['', '', 'Test', 'User One', '', 'test1@example.com', 'TEST001', 'active'],
      ['', '', 'Test', 'User Two', '', 'test2@example.com', 'TEST002', 'active'],
      ['', '', 'Test', 'User Three', '', 'test3@example.com', 'TEST003', 'active']
    ];
    
    // Add test users
    if (testUsers.length > 0) {
      sheet.getRange(2, 1, testUsers.length, headers.length).setValues(testUsers);
    }
    
    // Format the sheet
    sheet.autoResizeColumns(3, 6); // Auto-resize columns C through H
    
    // Add data validation for status column
    const statusRange = sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1);
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['active', 'inactive'], true)
      .build();
    statusRange.setDataValidation(statusRule);
    
    // Log success
    console.log('Students sheet fixed successfully');
    console.log(`Added ${testUsers.length} test users`);
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      '✅ Students Sheet Fixed',
      `The Students sheet has been properly configured with:\n` +
      `• Correct column structure (C-H for data)\n` +
      `• ${testUsers.length} test users (TEST001-003)\n` +
      `• Status validation\n\n` +
      `The backup login method will now work!`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return {
      success: true,
      message: 'Students sheet fixed',
      testUsersAdded: testUsers.length
    };
    
  } catch (error) {
    console.error('Error fixing Students sheet:', error);
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'Failed to fix Students sheet: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update Authentication.js to use local Students sheet
 * This makes the backup login look at our sheet instead of external roster
 */
function updateAuthenticationToUseLocalSheet() {
  try {
    // This function documents what needs to be changed in Authentication.js
    const changes = `
To make backup login work with local Students sheet, update Authentication.js:

Change line 8 from:
  SPREADSHEET_ID: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
  
To:
  SPREADSHEET_ID: '${CONFIG.MASTER_SHEET_ID}',

And change line 9 from:
  SHEET_NAME: 'Financial v2 (24SEPT25 start)',
  
To:
  SHEET_NAME: 'Students',
`;
    
    console.log(changes);
    
    return {
      success: true,
      changes: changes
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test the backup login after fixing
 */
function testBackupLogin() {
  try {
    // Test with TEST001's details
    const result = lookupClientByDetails({
      firstName: 'Test',
      lastName: 'User One',
      email: 'test1@example.com'
    });
    
    if (result.success) {
      SpreadsheetApp.getUi().alert(
        '✅ Backup Login Working',
        `Successfully found user:\n` +
        `Client ID: ${result.clientId}\n` +
        `Name: ${result.fullName}\n` +
        `Email: ${result.email}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '❌ Backup Login Failed',
        `Error: ${result.error}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    
    return result;
    
  } catch (error) {
    console.error('Test error:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Add this function to the menu
 */
function addFixStudentsToMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Fix Students')
    .addItem('1️⃣ Fix Students Sheet Structure', 'fixStudentsSheet')
    .addItem('2️⃣ Show Authentication Changes Needed', 'showAuthChanges')
    .addItem('3️⃣ Test Backup Login', 'testBackupLogin')
    .addSeparator()
    .addItem('📋 View Current Students', 'viewStudents')
    .addToUi();
}

/**
 * Show what changes are needed in Authentication.js
 */
function showAuthChanges() {
  const changes = updateAuthenticationToUseLocalSheet();
  SpreadsheetApp.getUi().alert(
    '📝 Authentication.js Changes Needed',
    changes.changes,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * View current students in the sheet
 */
function viewStudents() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('Students');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('No Students sheet found');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    let message = 'Current Students:\n\n';
    
    // Skip header row
    for (let i = 1; i < data.length && i < 10; i++) {
      const row = data[i];
      if (row[6]) { // If Client ID exists
        message += `${row[6]}: ${row[2]} ${row[3]} (${row[5]})\n`;
      }
    }
    
    if (data.length > 10) {
      message += `\n... and ${data.length - 10} more`;
    }
    
    SpreadsheetApp.getUi().alert('Students Sheet', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}