/**
 * Menu System for Financial TruPath V2.0
 * Provides testing and administrative functions
 */

/**
 * Create custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 TruPath V2.0')
    // Testing Section
    .addItem('📋 Test Session Management', 'testSessionManagement')
    .addItem('🔑 Add Test Client IDs', 'addTestClientIds')
    .addItem('👤 Test Login (TEST001)', 'testLoginWithTest001')
    .addItem('📊 View Active Sessions', 'viewActiveSessions')
    .addSeparator()
    // Data Management
    .addItem('📁 Create All Data Sheets', 'createDataSheets')
    .addItem('🧹 Cleanup Expired Sessions', 'cleanupExpiredSessions')
    .addSeparator()
    // Navigation
    .addItem('🌐 Open Web App', 'openWebApp')
    .addItem('🔧 Open Admin Panel', 'openAdminPanel')
    .addSeparator()
    // Information
    .addItem('📊 Platform Status', 'testWebApp')
    .addItem('❓ About', 'showAbout')
    .addToUi();
}

/**
 * Add test client IDs to the roster for testing
 */
function addTestClientIds() {
  try {
    const sheet = getRosterSheet();
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Error', 'Cannot access roster sheet', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Check if test IDs already exist
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingIds = sheet.getRange(2, ROSTER.COLUMNS.CLIENT_ID, lastRow - 1, 1).getValues();
      for (let i = 0; i < existingIds.length; i++) {
        if (existingIds[i][0] && existingIds[i][0].toString().startsWith('TEST')) {
          SpreadsheetApp.getUi().alert('Info', 'Test Client IDs already exist in roster', SpreadsheetApp.getUi().ButtonSet.OK);
          return;
        }
      }
    }
    
    // Add test client IDs
    const testClients = [
      ['Test', 'User One', '', 'test1@example.com', 'TEST001', 'active'],
      ['Test', 'User Two', '', 'test2@example.com', 'TEST002', 'active'],
      ['Test', 'User Three', '', 'test3@example.com', 'TEST003', 'active']
    ];
    
    for (const client of testClients) {
      const row = [
        '', // Column A (empty)
        '', // Column B (empty)
        client[0], // Column C - First Name
        client[1], // Column D - Last Name
        client[2], // Column E - Phone (empty)
        client[3], // Column F - Email
        client[4], // Column G - Client ID
        client[5]  // Column H - Status
      ];
      
      // Add to sheet starting from column 1
      sheet.appendRow(row);
    }
    
    SpreadsheetApp.getUi().alert(
      'Success', 
      'Test Client IDs added:\n\n' +
      '• TEST001 - Test User One\n' +
      '• TEST002 - Test User Two\n' +
      '• TEST003 - Test User Three\n\n' +
      'You can now use these IDs to test the login system.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', 'Failed to add test IDs: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Test login with TEST001
 */
function testLoginWithTest001() {
  try {
    const result = authenticateAndCreateSession('TEST001');
    
    if (result.success) {
      const message = `✅ Login Successful!\n\n` +
        `Client ID: ${result.clientId}\n` +
        `Name: ${result.firstName} ${result.lastName}\n` +
        `Email: ${result.email}\n` +
        `Session ID: ${result.sessionId}\n` +
        `Expires: ${result.expiresAt}\n\n` +
        `Check the SESSIONS sheet to see the new session record!`;
      
      SpreadsheetApp.getUi().alert('Login Test Success', message, SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('Login Test Failed', result.error, SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * View active sessions
 */
function viewActiveSessions() {
  try {
    const sessions = getActiveSessions();
    
    if (sessions.length === 0) {
      SpreadsheetApp.getUi().alert('Active Sessions', 'No active sessions found', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    let message = `Found ${sessions.length} active session(s):\n\n`;
    
    sessions.forEach((session, index) => {
      const loginTime = new Date(session.loginTime);
      const lastActivity = new Date(session.lastActivity);
      message += `${index + 1}. ${session.clientId}\n`;
      message += `   Session: ${session.sessionId.substring(0, 8)}...\n`;
      message += `   Login: ${loginTime.toLocaleString()}\n`;
      message += `   Last Active: ${lastActivity.toLocaleString()}\n\n`;
    });
    
    SpreadsheetApp.getUi().alert('Active Sessions', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Open the web app in a new window
 */
function openWebApp() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Web App Not Deployed',
      'The web app has not been deployed yet.\n\n' +
      'To deploy:\n' +
      '1. Click Extensions → Apps Script\n' +
      '2. Click Deploy → New Deployment\n' +
      '3. Choose "Web app" as the type\n' +
      '4. Set execute as "Me"\n' +
      '5. Set access to "Anyone"\n' +
      '6. Click Deploy',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3>Web App URL</h3>
      <p>Click the link below to open the application:</p>
      <p><a href="${url}" target="_blank" style="color: #ad9168; font-size: 16px;">${url}</a></p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Test with Client IDs: TEST001, TEST002, or TEST003<br>
        (Run "Add Test Client IDs" first if you haven't already)
      </p>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(250),
    'Open Web Application'
  );
}

/**
 * Show about information
 */
function showAbout() {
  const message = `Financial TruPath V2.0\n\n` +
    `Version: ${CONFIG.VERSION}\n` +
    `Course Start: ${CONFIG.COURSE_START_DATE.toLocaleDateString()}\n` +
    `Current Week: ${getCurrentWeek()}\n\n` +
    `Components:\n` +
    `✅ Session Management\n` +
    `✅ Authentication System\n` +
    `✅ Tool 1: Orientation Assessment\n` +
    `✅ Dashboard Interface\n` +
    `✅ Google Sheets Integration\n\n` +
    `Database ID: ${CONFIG.MASTER_SHEET_ID}`;
  
  SpreadsheetApp.getUi().alert('About TruPath V2.0', message, SpreadsheetApp.getUi().ButtonSet.OK);
}