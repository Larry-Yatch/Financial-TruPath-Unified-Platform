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
  const diffTime = Math.abs(now - courseStart);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(diffDays / 7));
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
    .addItem('Test Web App', 'testWebApp')
    .addSeparator()
    .addItem('View Logs', 'viewLogs')
    .addToUi();
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