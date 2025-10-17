/**
 * Financial TruPath V2.0 - Main Entry Point
 * Routes requests to appropriate handlers based on URL parameters
 */

/**
 * Main router for web application
 * @param {Object} e - Event object with parameters
 * @returns {HtmlOutput} The appropriate HTML page
 */
function doGet(e) {
  try {
    // Get route from URL parameters
    const route = e.parameter.route || 'login';
    const toolId = e.parameter.tool;
    const clientId = e.parameter.client;
    const sessionId = e.parameter.session;
    
    // Route to appropriate handler
    switch(route) {
      case 'login':
        return handleLoginRoute();
        
      case 'dashboard':
        return handleDashboardRoute(clientId, sessionId);
        
      case 'tool':
        return handleToolRoute(toolId, clientId, sessionId);
        
      case 'report':
        return handleReportRoute(clientId, sessionId);
        
      case 'admin':
        return handleAdminRoute(e.parameter.key);
        
      default:
        // Default to login for unknown routes
        return handleLoginRoute();
    }
    
  } catch (error) {
    console.error('Router error:', error);
    return createErrorPage(error.toString());
  }
}

/**
 * Handle admin route (for testing/debugging)
 */
function handleAdminRoute(adminKey) {
  // Simple admin key check
  if (adminKey !== 'admin2024') { // Change this to a secure key
    return createErrorPage('Unauthorized');
  }
  
  // For now, show the test interface
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Financial TruPath V2.0 - Admin</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f7fa;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 10px 10px 0;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            border: none;
          }
          .btn:hover {
            background: #5a67d8;
          }
          .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔧 Admin Panel</h1>
          
          <div class="section">
            <h3>Test Functions</h3>
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).createDataSheets()">
              Create Data Sheets
            </button>
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).testDataSaving()">
              Test Data Saving
            </button>
            <button class="btn" onclick="testAuth()">
              Test Authentication
            </button>
          </div>
          
          <div class="section">
            <h3>Quick Links</h3>
            <a href="${ScriptApp.getService().getUrl()}" class="btn">Login Page</a>
            <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=TEST-001&session=test" class="btn">
              Test Dashboard
            </a>
          </div>
          
          <div id="result" class="section" style="display: none;">
            <h3>Result</h3>
            <pre id="resultContent"></pre>
          </div>
        </div>
        
        <script>
          function showResult(result) {
            document.getElementById('result').style.display = 'block';
            document.getElementById('resultContent').textContent = JSON.stringify(result, null, 2);
          }
          
          function testAuth() {
            const testId = prompt('Enter a test Client ID:');
            if (testId) {
              google.script.run
                .withSuccessHandler(showResult)
                .withFailureHandler(showResult)
                .lookupClientById(testId);
            }
          }
        </script>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include HTML files in templates
 * @param {string} filename - The file to include
 * @returns {string} The file content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
function generateSessionId() {
  return Utilities.getUuid();
}

/**
 * Get current course week
 * @returns {number} Current week number
 */
function getCurrentWeek() {
  const now = new Date();
  const courseStart = CONFIG.COURSE_START_DATE;
  
  // If course hasn't started yet, return week 0
  if (now < courseStart) {
    return 0;
  }
  
  // Calculate weeks since course start
  const diffTime = now - courseStart;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return weekNumber;
}

/**
 * Save user data to the master spreadsheet
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @param {Object} data - Data to save
 * @returns {Object} Success status
 */
function saveUserData(userId, toolId, data) {
  try {
    const result = DataHub.saveToolData(userId, toolId, data);
    
    // Log the save event
    logEvent('DATA_SAVED', {
      userId: userId,
      tool: toolId,
      timestamp: new Date()
    });
    
    return {
      success: true,
      message: 'Data saved successfully',
      insights: result.insights
    };
  } catch (error) {
    console.error('Error saving data:', error);
    logEvent('SAVE_ERROR', {
      userId: userId,
      tool: toolId,
      error: error.toString()
    });
    
    return {
      success: false,
      message: 'Failed to save data',
      error: error.toString()
    };
  }
}

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @returns {Object} User profile data
 */
function getUserProfile(userId) {
  try {
    return DataHub.getUnifiedProfile(userId);
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Log system events
 * @param {string} eventType - Type of event
 * @param {Object} details - Event details
 */
function logEvent(eventType, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
      // Add headers
      logsSheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Event Type', 'User ID', 'Tool', 'Details']
      ]);
    }
    
    logsSheet.appendRow([
      new Date(),
      eventType,
      details.userId || '',
      details.tool || '',
      JSON.stringify(details)
    ]);
  } catch (error) {
    console.error('Error logging event:', error);
  }
}

/**
 * Get available tools based on current week
 * @returns {Array} Available tools
 */
function getAvailableTools() {
  const currentWeek = getCurrentWeek();
  const tools = [
    {id: 'orientation', name: 'Orientation-Demographics', week: 1},
    {id: 'financial-clarity', name: 'Financial Clarity', week: 2},
    {id: 'control-fear', name: 'Control Fear Grounding', week: 3},
    // Add more tools as needed
  ];
  
  return tools.map(tool => ({
    ...tool,
    available: currentWeek >= tool.week,
    completed: false // This should check actual completion status
  }));
}

/**
 * Create menu in spreadsheet (for testing/admin)
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Financial TruPath V2.0')
    .addItem('Initialize Platform', 'initializePlatform')
    .addItem('Create Data Sheets', 'createDataSheets')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔐 Authentication')
      .addItem('Test Authentication System', 'runAllAuthTests')
      .addItem('Test Roster Connection', 'testRosterConnection')
      .addItem('Get Sample Client IDs', 'getSampleClientIds')
      .addItem('Test Session Management', 'testSessionCreation'))
    .addSubMenu(ui.createMenu('🧪 Testing')
      .addItem('Run All Tests', 'runAllTests')
      .addItem('Validate Before Deploy', 'validateBeforeDeployment')
      .addItem('Test Data Saving', 'testDataSaving')
      .addItem('Test Web App', 'testWebApp'))
    .addSubMenu(ui.createMenu('🔍 Debug')
      .addItem('System Health Check', 'showSystemHealth')
      .addItem('Check Common Issues', 'showCommonIssues')
      .addItem('Clear Test Data', 'clearTestData'))
    .addSeparator()
    .addItem('View Logs', 'viewLogs')
    .addItem('View Tool 1 Data', 'viewTool1Data')
    .addItem('Open Admin Panel', 'openAdminPanel')
    .addToUi();
}

/**
 * Import test authentication functions (make them available globally)
 * Note: In Google Apps Script, all .gs/.js files share the same global scope
 * but we need to ensure the functions are defined
 */

/**
 * Test authentication system - main test function
 */
function runAllAuthTests() {
  // Direct implementation - don't rely on external references
  return testAuthenticationSystem();
}

/**
 * Basic authentication system test
 */
function testAuthenticationSystem() {
  const results = {
    timestamp: new Date(),
    tests: {}
  };
  
  try {
    // Test 1: Check if roster sheet is accessible
    const sheet = getRosterSheet();
    results.tests.rosterAccess = {
      success: !!sheet,
      sheetName: sheet ? sheet.getName() : 'Not found'
    };
    
    // Test 2: Check column headers if sheet exists
    if (sheet && sheet.getLastRow() > 0) {
      const headers = sheet.getRange(1, 1, 1, Math.min(10, sheet.getLastColumn())).getValues()[0];
      results.tests.headers = headers;
    }
    
    // Test 3: Try to get a sample Client ID
    if (sheet && sheet.getLastRow() > 1) {
      const sampleId = sheet.getRange(2, ROSTER.COLUMNS.CLIENT_ID).getValue();
      results.tests.sampleId = sampleId || 'No Client ID found';
      
      // Test 4: Try lookup if we have a sample
      if (sampleId) {
        results.tests.lookupTest = lookupClientById(sampleId);
      }
    }
    
    // Show results
    const ui = SpreadsheetApp.getUi();
    let summary = 'Authentication Test Results:\n\n';
    summary += `✓ Roster Access: ${results.tests.rosterAccess.success ? 'Connected' : 'Failed'}\n`;
    summary += `✓ Sheet Name: ${results.tests.rosterAccess.sheetName}\n`;
    if (results.tests.headers) {
      summary += `✓ Headers Found: ${results.tests.headers.length} columns\n`;
    }
    if (results.tests.sampleId) {
      summary += `✓ Sample Client ID: ${results.tests.sampleId}\n`;
    }
    if (results.tests.lookupTest) {
      summary += `✓ Lookup Test: ${results.tests.lookupTest.success ? 'Success' : 'Failed'}\n`;
      if (results.tests.lookupTest.success) {
        summary += `  - Name: ${results.tests.lookupTest.firstName} ${results.tests.lookupTest.lastName}\n`;
      }
    }
    
    ui.alert('Authentication System Test', summary, ui.ButtonSet.OK);
    return results;
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    return { error: error.toString() };
  }
}

/**
 * Test roster connection specifically
 */
function testRosterConnection() {
  try {
    const sheet = getRosterSheet();
    if (sheet) {
      const info = {
        name: sheet.getName(),
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn(),
        id: sheet.getSheetId()
      };
      
      SpreadsheetApp.getUi().alert(
        'Roster Connection Test',
        `✅ Successfully connected to roster!\n\nSheet: ${info.name}\nRows: ${info.rows}\nColumns: ${info.columns}\nGID: ${info.id}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      
      return { success: true, info: info };
    } else {
      throw new Error('Could not access roster sheet');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Roster Connection Failed',
      `❌ ${error.toString()}\n\nCheck Authentication.js configuration`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return { success: false, error: error.toString() };
  }
}

/**
 * Get sample Client IDs from roster
 */
function getSampleClientIds() {
  try {
    const sheet = getRosterSheet();
    if (!sheet || sheet.getLastRow() < 2) {
      SpreadsheetApp.getUi().alert('No Data', 'No client data found in roster', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get first 5 Client IDs
    const numRows = Math.min(5, sheet.getLastRow() - 1);
    const data = sheet.getRange(2, ROSTER.COLUMNS.FIRST_NAME, numRows, 
      ROSTER.COLUMNS.CLIENT_ID - ROSTER.COLUMNS.FIRST_NAME + 1).getValues();
    
    let message = 'Sample Client IDs from Roster:\n\n';
    for (let i = 0; i < data.length; i++) {
      const firstName = data[i][0];
      const lastName = data[i][1];
      const clientId = data[i][ROSTER.COLUMNS.CLIENT_ID - ROSTER.COLUMNS.FIRST_NAME];
      if (clientId) {
        message += `${i + 1}. ${clientId} - ${firstName} ${lastName}\n`;
      }
    }
    
    SpreadsheetApp.getUi().alert('Sample Client IDs', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Test session creation
 */
function testSessionCreation() {
  try {
    const mockClient = {
      clientId: 'TEST-' + Math.floor(Math.random() * 1000),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    };
    
    const session = createUserSession(mockClient);
    const isValid = verifySession(session.sessionId, session.clientId);
    
    const message = `Session Creation Test:\n\n` +
      `Client ID: ${session.clientId}\n` +
      `Session ID: ${session.sessionId}\n` +
      `Created: ${session.loginTime}\n` +
      `Valid: ${isValid ? '✅ Yes' : '❌ No'}`;
    
    SpreadsheetApp.getUi().alert('Session Test', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Open Admin Panel in browser
 */
function openAdminPanel() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert('Web app not deployed yet. Please deploy first.');
    return;
  }
  
  const adminUrl = url + '?route=admin&key=admin2024';
  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3>Admin Panel URL</h3>
      <p>Click the link below to open the admin panel:</p>
      <p><a href="${adminUrl}" target="_blank" style="color: #667eea;">${adminUrl}</a></p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Note: You'll need the admin key to access this panel.<br>
        Current key: admin2024 (change this in production)
      </p>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(250),
    'Open Admin Panel'
  );
}

/**
 * Initialize the platform (first-time setup)
 */
function initializePlatform() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Step 1: Create data sheets
    createDataSheets();
    
    // Step 2: Test roster connection
    const rosterTest = testRosterConnection();
    if (!rosterTest.success) {
      ui.alert('⚠️ Warning', 'Could not connect to roster. Please check Authentication.js configuration.', ui.ButtonSet.OK);
    }
    
    // Step 3: Get deployment URL
    const url = ScriptApp.getService().getUrl();
    const message = url ? 
      `✅ Platform initialized successfully!\n\nWeb App URL: ${url}\n\nNext steps:\n1. Test authentication with real Client IDs\n2. Deploy to production when ready` :
      `✅ Platform initialized!\n\nNext steps:\n1. Deploy the web app (Extensions → Apps Script → Deploy)\n2. Test authentication\n3. Share URL with clients`;
    
    ui.alert('Platform Initialized', message, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ Error', 'Failed to initialize platform: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Create all necessary data sheets with headers
 */
function createDataSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Tool1_Orientation sheet with all headers
  let tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  if (!tool1Sheet) {
    tool1Sheet = ss.insertSheet(CONFIG.SHEETS.TOOL1_ORIENTATION);
  }
  
  // Set comprehensive headers for Tool 1 (25 fields + metadata)
  const tool1Headers = DataHub.getHeadersForTool('orientation');
  if (tool1Sheet.getLastColumn() < tool1Headers.length) {
    tool1Sheet.getRange(1, 1, 1, tool1Headers.length).setValues([tool1Headers]);
    tool1Sheet.getRange(1, 1, 1, tool1Headers.length).setFontWeight('bold');
    tool1Sheet.setFrozenRows(1);
  }
  
  // Create Students sheet
  let studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet(CONFIG.SHEETS.STUDENTS);
    const studentHeaders = ['User ID', 'Created Date', 'Last Active', 'Tools Completed', 'Email', 'Name'];
    studentsSheet.getRange(1, 1, 1, studentHeaders.length).setValues([studentHeaders]);
    studentsSheet.getRange(1, 1, 1, studentHeaders.length).setFontWeight('bold');
    studentsSheet.setFrozenRows(1);
  }
  
  // Create Insights sheet
  let insightsSheet = ss.getSheetByName(CONFIG.SHEETS.INSIGHTS);
  if (!insightsSheet) {
    insightsSheet = ss.insertSheet(CONFIG.SHEETS.INSIGHTS);
    const insightHeaders = ['Timestamp', 'User ID', 'Tool', 'Insight Type', 'Priority', 'Message', 'Recommendation'];
    insightsSheet.getRange(1, 1, 1, insightHeaders.length).setValues([insightHeaders]);
    insightsSheet.getRange(1, 1, 1, insightHeaders.length).setFontWeight('bold');
    insightsSheet.setFrozenRows(1);
  }
  
  SpreadsheetApp.getUi().alert('✅ Data sheets created successfully!');
}

/**
 * View Tool 1 data
 */
function viewTool1Data() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Tool 1 sheet not found. Run "Create Data Sheets" first.');
    return;
  }
  
  ss.setActiveSheet(sheet);
}

/**
 * View system logs
 */
function viewLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Logs sheet not found. It will be created when the first log entry is saved.');
    return;
  }
  
  ss.setActiveSheet(sheet);
}

/**
 * Generate PDF report for user
 * @param {Object} reportData - The report data from the assessment
 * @returns {Object} Base64 encoded PDF
 */
function generatePDFReport(reportData) {
  try {
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { margin: 0.5in; }
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      background: #1e1933;
      color: white;
      padding: 30px;
      margin: -20px -20px 30px -20px;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #AD9168;
    }
    .subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-top: 10px;
    }
    .profile-section {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 30px;
    }
    .profile-emoji {
      font-size: 60px;
      margin-bottom: 15px;
    }
    .profile-type {
      font-size: 28px;
      color: #AD9168;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .scores-container {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
    }
    .score-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      width: 45%;
    }
    .score-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .good { color: #22c55e; }
    .warning { color: #f59e0b; }
    .critical { color: #dc3545; }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h3 {
      color: #AD9168;
      border-bottom: 2px solid #AD9168;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .homework-item {
      background: #fff;
      border-left: 4px solid;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .priority-high {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    .priority-medium {
      border-left-color: #f59e0b;
      background: #fffef5;
    }
    .priority-low {
      border-left-color: #22c55e;
      background: #f5fff5;
    }
    ul {
      list-style: none;
      padding-left: 0;
    }
    li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    li:before {
      content: "☐";
      position: absolute;
      left: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FINANCIAL TRUPATH</div>
    <div class="subtitle">Comprehensive Assessment Report</div>
    <div style="margin-top: 10px; font-size: 14px;">Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="profile-section">
    <div class="profile-emoji">${reportData.profile.emoji || '🎯'}</div>
    <div class="profile-type">${reportData.profile.type}</div>
    <p style="font-size: 16px; margin: 10px 0;">${reportData.profile.message}</p>
    <p style="color: #666; font-style: italic;">${reportData.profile.focus}</p>
  </div>

  <div class="scores-container">
    <div class="score-box">
      <div class="score-label">Financial Health Score</div>
      <div class="score-value ${reportData.healthScore >= 70 ? 'good' : reportData.healthScore >= 40 ? 'warning' : 'critical'}">
        ${reportData.healthScore}
      </div>
      <div style="color: #999; font-size: 12px;">out of 100</div>
    </div>
    <div class="score-box">
      <div class="score-label">Mindset Score</div>
      <div class="score-value ${reportData.mindsetScore >= 3 ? 'good' : reportData.mindsetScore >= 0 ? 'warning' : 'critical'}">
        ${reportData.mindsetScore > 0 ? '+' : ''}${reportData.mindsetScore}
      </div>
      <div style="color: #999; font-size: 12px;">Range: -9 to +9</div>
    </div>
  </div>

  <div class="section">
    <h3>📊 Key Insights</h3>
    ${reportData.healthScore < 40 ? '<p>⚠️ <strong>Immediate attention needed:</strong> Your financial health score indicates areas requiring urgent focus.</p>' : ''}
    ${reportData.mindsetScore < 0 ? '<p>🧠 <strong>Mindset barriers detected:</strong> Your beliefs about money may be limiting your progress.</p>' : ''}
    ${reportData.mindsetScore >= 6 ? '<p>✨ <strong>Exceptional mindset:</strong> Your positive outlook is a powerful asset for financial growth.</p>' : ''}
    ${reportData.healthScore >= 70 ? '<p>💪 <strong>Strong foundation:</strong> You have a solid financial base to build upon.</p>' : ''}
  </div>

  <div class="section">
    <h3>📚 Your Personalized Homework</h3>
    
    ${reportData.healthScore < 40 || (reportData.data && reportData.data.totalDebt === 'over_100k') ? `
    <div class="homework-item priority-high">
      <h4 style="color: #dc3545; margin-top: 0;">🔴 Priority 1: Debt & Cash Flow Review (Critical)</h4>
      <ul>
        <li>List all debts with balances, interest rates, and minimum payments</li>
        <li>Calculate total monthly debt payments</li>
        <li>Identify highest interest rate debts</li>
        <li>Review last 3 months of bank statements</li>
      </ul>
    </div>
    ` : ''}
    
    ${reportData.healthScore < 60 || (reportData.data && reportData.data.emergencyFund === 'none') ? `
    <div class="homework-item priority-medium">
      <h4 style="color: #f59e0b; margin-top: 0;">🟡 Priority 2: Expense Tracking</h4>
      <ul>
        <li>Track all expenses for next 7 days</li>
        <li>Identify top 3 spending categories</li>
        <li>Find 3 expenses you could reduce</li>
        <li>Calculate true monthly living costs</li>
      </ul>
    </div>
    ` : ''}
    
    <div class="homework-item priority-low">
      <h4 style="color: #22c55e; margin-top: 0;">🟢 Priority 3: Income & Assets Review</h4>
      <ul>
        <li>Gather last 2 pay stubs</li>
        <li>List all income sources</li>
        <li>Check all account balances</li>
        <li>Review any investment accounts</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h3>🎯 Next Steps</h3>
    <ol>
      <li>Complete your personalized homework tasks above</li>
      <li>Take Tool 2: Financial Clarity Assessment (Week 2)</li>
      ${reportData.mindsetScore < 0 ? '<li>Prepare for Tool 3: Control Fear Grounding (Week 3)</li>' : ''}
      <li>Track your progress weekly using the platform</li>
      <li>Celebrate small wins along your journey</li>
    </ol>
  </div>

  <div class="footer">
    <p><strong>Financial TruPath V2.0</strong></p>
    <p>This report is confidential and for your personal use only</p>
    <p>© ${new Date().getFullYear()} Financial TruPath. All rights reserved.</p>
  </div>
</body>
</html>
    `;
    
    // Create a blob from the HTML
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    
    // Convert HTML to PDF
    const pdf = blob.getAs('application/pdf');
    
    // Convert to base64 for client-side download
    const base64 = Utilities.base64Encode(pdf.getBytes());
    const fileName = `FinancialTruPath_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Return base64 encoded PDF
    return {
      success: true,
      base64: base64,
      fileName: fileName,
      mimeType: 'application/pdf'
    };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function to verify setup
 */
function testWebApp() {
  const url = ScriptApp.getService().getUrl();
  const deploymentInstructions = !url ? `
    <div style="background-color: #FEF3C7; padding: 10px; border-radius: 5px; margin: 10px 0;">
      <strong>⚠️ Web App Not Yet Deployed</strong><br>
      To deploy:<br>
      1. Click Extensions → Apps Script<br>
      2. Click Deploy → New Deployment<br>
      3. Type: Web app<br>
      4. Execute as: Me<br>
      5. Who has access: Anyone (or restrict)<br>
      6. Click Deploy
    </div>
  ` : `<p>Web App URL: <a href="${url}" target="_blank">${url}</a></p>`;
  
  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Financial TruPath V2.0 - Platform Status</h2>
      ${deploymentInstructions}
      <div style="margin-top: 15px;">
        <p><strong>Master Sheet ID:</strong><br>${CONFIG.MASTER_SHEET_ID}</p>
        <p><strong>Current Course Week:</strong> ${getCurrentWeek()}</p>
        <p><strong>Platform Version:</strong> ${CONFIG.VERSION}</p>
        <p><strong>Script ID:</strong><br>1TIkkayrocz3TA2kuYJSsegU94xzrd2fJuY9Wf9eI_K83B0IKyPlpzeY9</p>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc;">
        <strong>✅ Platform Components:</strong><br>
        • DataHub: Ready<br>
        • Middleware: Ready<br>
        • Tool 1 (Orientation): Ready<br>
        • Web Interface: Ready
      </div>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(450).setHeight(400),
    'Platform Test'
  );
}

/**
 * Test data saving function
 */
function testDataSaving() {
  // Create test data that matches what the form would send
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    age: '35',
    maritalStatus: 'single',
    employmentStatus: 'employed_full',
    profession: 'Teacher',
    yearsEmployed: '5',
    annualIncome: '75000',
    otherIncome: '5000',
    retirementAccess: 'yes_401k',
    housingCost: '1500',
    monthlyExpenses: '3500',
    monthlySavings: '500',
    totalDebt: '10k_25k',
    emergencyFund: '1_3_months',
    investmentExperience: 'beginner',
    primaryGoal: 'retirement',
    financialSituation: '0',
    moneyRelationship: '1',
    scarcityAbundance: '0',
    goalConfidence: '1',
    retirementTarget: '65',
    biggestObstacle: 'debt'
  };
  
  try {
    const result = saveUserData('TEST-USER-001', 'orientation', testData);
    
    if (result.success) {
      SpreadsheetApp.getUi().alert('✅ Data saved successfully! Check the Tool1_Orientation sheet.');
    } else {
      SpreadsheetApp.getUi().alert('❌ Error saving data: ' + result.message);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
  }
}