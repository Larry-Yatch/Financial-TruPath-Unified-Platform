/**
 * Sheet Cleanup Script for Financial TruPath V2
 * Deletes unnecessary sheets and organizes the spreadsheet
 */

/**
 * Main cleanup function - run this to clean the spreadsheet
 */
function cleanupSpreadsheet() {
  console.log('🧹 Starting spreadsheet cleanup...');
  
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  
  // Sheets to DELETE
  const sheetsToDelete = [
    'Sheet1',           // Default empty sheet
    'CrossToolInsights', // Empty, not needed yet
    'SystemLogs'        // Old error logs, moving to ACTIVITY_LOG
  ];
  
  // Sheets that MUST exist (our core system)
  const requiredSheets = [
    'SESSIONS',
    'RESPONSES',
    'TOOL_STATUS',
    'TOOL_ACCESS',
    'ACTIVITY_LOG',
    'ADMINS',
    'CONFIG',
    'Students',
    'Tool1_Orientation'
  ];
  
  // Get all current sheets
  const allSheets = ss.getSheets();
  const sheetNames = allSheets.map(sheet => sheet.getName());
  
  console.log('Current sheets:', sheetNames.join(', '));
  
  // Delete unnecessary sheets
  let deletedCount = 0;
  sheetsToDelete.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      // Check if sheet has important data
      const lastRow = sheet.getLastRow();
      if (sheetName === 'SystemLogs' && lastRow > 1) {
        console.log(`⚠️ ${sheetName} has ${lastRow} rows of old error logs - deleting anyway (we have ACTIVITY_LOG now)`);
      }
      
      ss.deleteSheet(sheet);
      console.log(`✅ Deleted: ${sheetName}`);
      deletedCount++;
    } else {
      console.log(`⏭️ ${sheetName} not found (already deleted?)`);
    }
  });
  
  // Verify all required sheets exist
  console.log('\n📋 Verifying required sheets:');
  let missingSheets = [];
  requiredSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const rows = sheet.getLastRow();
      console.log(`✅ ${sheetName}: ${rows} rows`);
    } else {
      console.log(`❌ ${sheetName}: MISSING!`);
      missingSheets.push(sheetName);
    }
  });
  
  // Summary
  console.log('\n📊 Cleanup Summary:');
  console.log(`- Deleted ${deletedCount} unnecessary sheets`);
  console.log(`- Verified ${requiredSheets.length} required sheets`);
  if (missingSheets.length > 0) {
    console.log(`- ⚠️ Missing sheets: ${missingSheets.join(', ')}`);
    console.log('  Run setupAllSheets() to create missing sheets');
  }
  
  // Final sheet count
  const finalSheets = ss.getSheets();
  console.log(`- Total sheets now: ${finalSheets.length}`);
  console.log('\n✨ Cleanup complete!');
  
  return {
    deleted: deletedCount,
    missing: missingSheets,
    totalSheets: finalSheets.length
  };
}

/**
 * Quick function to just list all sheets
 */
function listAllSheets() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  console.log('📋 All sheets in spreadsheet:');
  sheets.forEach((sheet, index) => {
    const name = sheet.getName();
    const rows = sheet.getLastRow();
    const cols = sheet.getLastColumn();
    console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(20)} [${rows} rows × ${cols} cols]`);
  });
  
  return sheets.map(s => s.getName());
}