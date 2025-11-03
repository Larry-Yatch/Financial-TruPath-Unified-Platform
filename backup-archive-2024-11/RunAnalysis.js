/**
 * Simple runner to execute sheet analysis from Apps Script
 */

function executeSheetAnalysis() {
  console.log('=== EXECUTING COMPLETE SHEET ANALYSIS ===');
  
  try {
    // Run the comprehensive analysis
    const analysis = analyzeAllSheets();
    
    // Also run specific checks
    console.log('\n=== CHECKING SPECIFIC KNOWN SHEETS ===');
    checkSpecificSheets();
    
    // List all sheet names for reference
    console.log('\n=== ALL SHEET NAMES ===');
    const allNames = listAllSheetNames();
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log('Check the Apps Script logs above for detailed analysis.');
    console.log('Summary in UI dialog will appear next...');
    
    // Show summary in UI
    runQuickAnalysis();
    
    return {
      success: true,
      totalSheets: analysis.totalSheets,
      recommendations: analysis.recommendations,
      allSheetNames: allNames
    };
    
  } catch (error) {
    console.error('Analysis failed:', error);
    SpreadsheetApp.getUi().alert('Analysis Failed', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: false, error: error.toString() };
  }
}

/**
 * Quick function to just list sheets with basic info
 */
function quickSheetInventory() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  console.log(`=== QUICK INVENTORY (${sheets.length} sheets) ===`);
  
  const inventory = [];
  sheets.forEach((sheet, index) => {
    const info = {
      index: index + 1,
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn(),
      hasData: sheet.getLastRow() > 1
    };
    inventory.push(info);
    console.log(`${info.index}. ${info.name} - ${info.rows}x${info.columns} ${info.hasData ? '(HAS DATA)' : '(EMPTY/HEADERS ONLY)'}`);
  });
  
  return inventory;
}