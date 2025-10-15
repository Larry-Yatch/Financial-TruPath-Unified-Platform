/**
 * Configuration file for Financial TruPath V2.0 Platform
 * Connected to Master Sheet: 18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24
 */

const CONFIG = {
  // Master Data Spreadsheet
  MASTER_SHEET_ID: '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24',
  
  // Platform Version
  VERSION: '2.0.0',
  
  // Course Settings
  COURSE_START_DATE: new Date('2024-10-14'), // Course started this week
  
  // Sheet Names
  SHEETS: {
    STUDENTS: 'Students',
    TOOL1_ORIENTATION: 'Tool1_Orientation',
    TOOL2_FINANCIAL_CLARITY: 'Tool2_FinancialClarity',
    INSIGHTS: 'CrossToolInsights',
    LOGS: 'SystemLogs'
  }
};

/**
 * Initialize the platform
 */
function initializePlatform() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheets if they don't exist
  createSheetIfNotExists(CONFIG.SHEETS.STUDENTS);
  createSheetIfNotExists(CONFIG.SHEETS.TOOL1_ORIENTATION);
  createSheetIfNotExists(CONFIG.SHEETS.INSIGHTS);
  createSheetIfNotExists(CONFIG.SHEETS.LOGS);
  
  console.log('Platform initialized successfully');
}

/**
 * Create sheet if it doesn't exist
 */
function createSheetIfNotExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName);
    console.log(`Created sheet: ${sheetName}`);
  }
}