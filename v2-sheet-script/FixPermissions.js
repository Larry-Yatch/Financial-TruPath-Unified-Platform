/**
 * Fix Permissions for Google Sheets Access
 * Run this function in the Apps Script editor to grant permissions
 */

/**
 * Test and grant permissions for spreadsheet access
 * Run this function manually in Apps Script editor
 */
function grantSpreadsheetPermissions() {
  try {
    // Try to access the master spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    
    // Try to read sheets
    const sheets = ss.getSheets();
    
    // Try to access SESSIONS sheet
    const sessionsSheet = ss.getSheetByName('SESSIONS');
    
    // If we get here, permissions are OK
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Permissions Granted!',
      `Successfully accessed spreadsheet!\n\n` +
      `Spreadsheet Name: ${ss.getName()}\n` +
      `Number of Sheets: ${sheets.length}\n` +
      `SESSIONS Sheet: ${sessionsSheet ? 'Found' : 'Not Found'}\n\n` +
      `You should now be able to use the web app.`,
      ui.ButtonSet.OK
    );
    
    return {
      success: true,
      spreadsheetName: ss.getName(),
      sheetsCount: sheets.length,
      sessionsSheet: sessionsSheet ? true : false
    };
    
  } catch (error) {
    // This will trigger the authorization prompt
    SpreadsheetApp.getUi().alert(
      'Permission Error',
      `Error: ${error.toString()}\n\n` +
      `This function needs permission to access Google Sheets.\n` +
      `Please authorize when prompted.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    throw error; // This will trigger auth prompt
  }
}

/**
 * Alternative: Create error page with instructions
 */
function createErrorPage(errorMessage) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruPath Financial - Access Required</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap');
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .error-container {
      background: rgba(20, 15, 35, 0.9);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    h1 {
      color: #ad9168;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .error-details {
      background: rgba(255, 59, 48, 0.1);
      border: 1px solid rgba(255, 59, 48, 0.2);
      border-radius: 10px;
      padding: 15px;
      margin: 20px 0;
    }
    .error-text {
      color: #ff3b30;
      font-size: 14px;
      word-break: break-word;
    }
    .instructions {
      background: rgba(173, 145, 104, 0.1);
      border: 1px solid rgba(173, 145, 104, 0.3);
      border-radius: 10px;
      padding: 20px;
      margin-top: 20px;
      text-align: left;
    }
    .instructions h3 {
      color: #ad9168;
      margin-bottom: 15px;
    }
    .instructions ol {
      color: #94a3b8;
      margin-left: 20px;
    }
    .instructions li {
      margin-bottom: 10px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #ad9168;
      color: #1e192b;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
      transition: all 0.3s;
    }
    .btn:hover {
      background: #c4a877;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>📋 Permission Required</h1>
    
    <p>The application needs access to the Google Sheets database to function.</p>
    
    <div class="error-details">
      <div class="error-text">${errorMessage || 'Unable to access spreadsheet'}</div>
    </div>
    
    <div class="instructions">
      <h3>How to Fix This:</h3>
      <ol>
        <li>Open the Google Sheets spreadsheet</li>
        <li>Click the "Share" button (top right)</li>
        <li>Change to "Anyone with the link" → "Viewer"</li>
        <li>Or run "Grant Permissions" from the TruPath menu</li>
        <li>Refresh this page and try again</li>
      </ol>
    </div>
    
    <p style="margin-top: 20px; font-size: 12px; color: #666;">
      Spreadsheet ID: 18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24
    </p>
    
    <a href="${ScriptApp.getService().getUrl()}" class="btn">Try Again</a>
  </div>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}