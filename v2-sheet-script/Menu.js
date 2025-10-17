/**
 * Working Menu - Fixed version without problematic characters
 */

/**
 * Create the main menu
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Financial TruPath V2.0')
      .addItem('Initialize Platform', 'initializePlatform')
      .addItem('Verify Complete Setup', 'verifyCompleteSetup')
      .addItem('Quick Diagnostic', 'quickDiagnostic')
      .addSeparator()
      .addItem('Create Data Sheets', 'createDataSheets')
      .addSeparator()
      .addSubMenu(ui.createMenu('Authentication')
        .addItem('Test Authentication System', 'runAllAuthTests')
        .addItem('Test Roster Connection', 'testRosterConnection')
        .addItem('Get Sample Client IDs', 'getSampleClientIds')
        .addItem('Test Session Management', 'testSessionCreation'))
      .addSubMenu(ui.createMenu('Testing')
        .addItem('Run All Tests', 'runAllTests')
        .addItem('Validate Before Deploy', 'validateBeforeDeployment')
        .addItem('Test Data Saving', 'testDataSaving')
        .addItem('Test Web App', 'testWebApp'))
      .addSubMenu(ui.createMenu('Debug')
        .addItem('System Health Check', 'showSystemHealth')
        .addItem('Check Common Issues', 'showCommonIssues')
        .addItem('Clear Test Data', 'clearTestData'))
      .addSeparator()
      .addItem('View Logs', 'viewLogs')
      .addItem('View Tool 1 Data', 'viewTool1Data')
      .addItem('Open Admin Panel', 'openAdminPanel')
      .addToUi();
  } catch (error) {
    console.error('Menu creation error:', error);
    // Fallback to simple menu
    try {
      const ui = SpreadsheetApp.getUi();
      ui.createMenu('FT V2 - Basic')
        .addItem('Quick Diagnostic', 'quickDiagnostic')
        .addItem('Test Auth', 'runAllAuthTests')
        .addToUi();
    } catch (e) {
      console.error('Even simple menu failed:', e);
    }
  }
}