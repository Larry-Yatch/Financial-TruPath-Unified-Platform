/**
 * Financial TruPath V2.0 - Main Entry Point
 * This is the main code file for the web application
 */

/**
 * Serves the web application
 * @param {Object} e - Event object
 * @returns {HtmlOutput} The HTML page
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  
  // Pass configuration to the frontend
  template.config = CONFIG;
  template.userId = e.parameter.uid || generateUserId();
  template.currentWeek = getCurrentWeek();
  
  return template.evaluate()
    .setTitle('Financial TruPath V2.0')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
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
 * Generate a unique user ID
 * @returns {string} Unique user ID
 */
function generateUserId() {
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
    .addToUi();
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