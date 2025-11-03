/**
 * Sheet Analyzer for Financial TruPath V2.0
 * Analyzes all sheets in the spreadsheet to identify which ones to keep/delete
 */

/**
 * Main function to analyze all sheets in the spreadsheet
 */
function analyzeAllSheets() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  
  console.log('=== Starting Complete Sheet Analysis ===');
  console.log(`Spreadsheet ID: ${V2_SPREADSHEET_ID}`);
  
  // Get all sheets
  const allSheets = ss.getSheets();
  console.log(`Total sheets found: ${allSheets.length}`);
  
  // Required sheets based on our system design
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
  
  const analysis = {
    totalSheets: allSheets.length,
    requiredSheets: requiredSheets,
    sheetDetails: [],
    recommendations: {
      keep: [],
      delete: [],
      investigate: []
    }
  };
  
  // Analyze each sheet
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    const sheetInfo = analyzeIndividualSheet(sheet, requiredSheets);
    analysis.sheetDetails.push(sheetInfo);
    
    // Categorize recommendations
    if (sheetInfo.isRequired) {
      analysis.recommendations.keep.push(sheetInfo.name);
    } else if (sheetInfo.isEmpty && !sheetInfo.hasUsefulHeaders) {
      analysis.recommendations.delete.push(sheetInfo.name);
    } else if (sheetInfo.hasData || sheetInfo.hasUsefulHeaders) {
      analysis.recommendations.investigate.push(sheetInfo.name);
    } else {
      analysis.recommendations.delete.push(sheetInfo.name);
    }
  }
  
  // Generate report
  generateAnalysisReport(analysis);
  
  return analysis;
}

/**
 * Analyze individual sheet
 */
function analyzeIndividualSheet(sheet, requiredSheets) {
  const name = sheet.getName();
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  const sheetId = sheet.getSheetId();
  
  const info = {
    name: name,
    sheetId: sheetId,
    rows: lastRow,
    columns: lastColumn,
    isEmpty: lastRow <= 1 && lastColumn <= 1,
    hasHeaders: false,
    hasData: false,
    hasUsefulHeaders: false,
    isRequired: requiredSheets.includes(name),
    headers: [],
    sampleData: [],
    dataRowCount: Math.max(0, lastRow - 1),
    recommendation: '',
    notes: []
  };
  
  try {
    // Check for headers (first row)
    if (lastRow >= 1 && lastColumn >= 1) {
      const headerRange = sheet.getRange(1, 1, 1, Math.min(lastColumn, 20)); // Limit to 20 columns
      const headers = headerRange.getValues()[0];
      info.headers = headers.filter(cell => cell !== '');
      info.hasHeaders = info.headers.length > 0;
      
      // Check if headers are useful (not just default sheet names)
      info.hasUsefulHeaders = info.headers.some(header => 
        header && typeof header === 'string' && 
        !header.match(/^(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)\d*$/) &&
        header.length > 1
      );
    }
    
    // Check for data (beyond headers)
    if (lastRow > 1) {
      info.hasData = true;
      
      // Get sample data (first 3 rows after headers, first 10 columns)
      const sampleRows = Math.min(3, lastRow - 1);
      const sampleColumns = Math.min(10, lastColumn);
      if (sampleRows > 0 && sampleColumns > 0) {
        const sampleRange = sheet.getRange(2, 1, sampleRows, sampleColumns);
        info.sampleData = sampleRange.getValues();
      }
    }
    
    // Determine recommendation
    if (info.isRequired) {
      info.recommendation = 'KEEP - Required system sheet';
    } else if (info.isEmpty || (!info.hasData && !info.hasUsefulHeaders)) {
      info.recommendation = 'DELETE - Empty or no useful content';
    } else if (info.hasData && info.hasUsefulHeaders) {
      info.recommendation = 'INVESTIGATE - Has data, review content';
    } else if (info.hasUsefulHeaders && !info.hasData) {
      info.recommendation = 'DELETE - Headers only, no data';
    } else {
      info.recommendation = 'DELETE - No useful content';
    }
    
    // Add specific notes
    if (name === 'Sheet1' || name === 'Sheet2' || name === 'Sheet3') {
      info.notes.push('Default sheet name - likely unnecessary');
    }
    
    if (name.includes('Copy') || name.includes('copy')) {
      info.notes.push('Appears to be a copy - check if original exists');
    }
    
    if (name.toLowerCase().includes('test') || name.toLowerCase().includes('temp')) {
      info.notes.push('Test/temporary sheet - likely safe to delete');
    }
    
    if (info.hasData && !info.isRequired) {
      info.notes.push(`Contains ${info.dataRowCount} rows of data - review before deleting`);
    }
    
  } catch (error) {
    console.error(`Error analyzing sheet ${name}:`, error);
    info.notes.push(`Error during analysis: ${error.toString()}`);
    info.recommendation = 'INVESTIGATE - Analysis error occurred';
  }
  
  return info;
}

/**
 * Generate comprehensive analysis report
 */
function generateAnalysisReport(analysis) {
  console.log('\n=== SPREADSHEET ANALYSIS REPORT ===');
  console.log(`Total Sheets: ${analysis.totalSheets}`);
  console.log(`Required Sheets: ${analysis.requiredSheets.length}`);
  
  console.log('\n--- SHEET-BY-SHEET ANALYSIS ---');
  analysis.sheetDetails.forEach((sheet, index) => {
    console.log(`\n${index + 1}. ${sheet.name} (ID: ${sheet.sheetId})`);
    console.log(`   Size: ${sheet.rows} rows × ${sheet.columns} columns`);
    console.log(`   Data rows: ${sheet.dataRowCount}`);
    console.log(`   Headers: ${sheet.hasUsefulHeaders ? 'Yes' : 'No'} (${sheet.headers.length} found)`);
    console.log(`   Required: ${sheet.isRequired ? 'Yes' : 'No'}`);
    console.log(`   Recommendation: ${sheet.recommendation}`);
    
    if (sheet.headers.length > 0) {
      console.log(`   Headers: ${sheet.headers.slice(0, 5).join(', ')}${sheet.headers.length > 5 ? '...' : ''}`);
    }
    
    if (sheet.notes.length > 0) {
      console.log(`   Notes: ${sheet.notes.join('; ')}`);
    }
  });
  
  console.log('\n--- RECOMMENDATIONS SUMMARY ---');
  console.log(`\n✅ KEEP (${analysis.recommendations.keep.length} sheets):`);
  analysis.recommendations.keep.forEach(name => console.log(`   • ${name}`));
  
  console.log(`\n🔍 INVESTIGATE (${analysis.recommendations.investigate.length} sheets):`);
  analysis.recommendations.investigate.forEach(name => {
    const sheet = analysis.sheetDetails.find(s => s.name === name);
    console.log(`   • ${name} - ${sheet.dataRowCount} data rows`);
  });
  
  console.log(`\n❌ DELETE (${analysis.recommendations.delete.length} sheets):`);
  analysis.recommendations.delete.forEach(name => {
    const sheet = analysis.sheetDetails.find(s => s.name === name);
    console.log(`   • ${name} - ${sheet.recommendation}`);
  });
  
  console.log('\n=== END ANALYSIS ===\n');
}

/**
 * Get detailed sheet information in table format
 */
function getSheetSummaryTable() {
  const analysis = analyzeAllSheets();
  
  const table = [
    ['Sheet Name', 'Rows', 'Cols', 'Data Rows', 'Has Headers', 'Required', 'Recommendation']
  ];
  
  analysis.sheetDetails.forEach(sheet => {
    table.push([
      sheet.name,
      sheet.rows,
      sheet.columns,
      sheet.dataRowCount,
      sheet.hasUsefulHeaders ? 'Yes' : 'No',
      sheet.isRequired ? 'Yes' : 'No',
      sheet.recommendation.split(' - ')[0]  // Just the action part
    ]);
  });
  
  return table;
}

/**
 * Helper function to check specific sheets for data
 */
function checkSpecificSheets() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  
  const sheetsToCheck = ['Students', 'Tool1_Orientation', 'CrossToolInsights', 'SystemLogs'];
  
  console.log('=== CHECKING SPECIFIC SHEETS ===');
  
  sheetsToCheck.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      console.log(`\n${sheetName}:`);
      console.log(`  Rows: ${sheet.getLastRow()}`);
      console.log(`  Columns: ${sheet.getLastColumn()}`);
      
      if (sheet.getLastRow() >= 1 && sheet.getLastColumn() >= 1) {
        const headers = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 10)).getValues()[0];
        console.log(`  Headers: ${headers.join(', ')}`);
      }
      
      if (sheet.getLastRow() > 1) {
        console.log(`  Has data: Yes (${sheet.getLastRow() - 1} rows)`);
      } else {
        console.log(`  Has data: No`);
      }
    } else {
      console.log(`\n${sheetName}: NOT FOUND`);
    }
  });
}

/**
 * Quick function to list all sheet names
 */
function listAllSheetNames() {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  console.log('All sheet names:');
  sheets.forEach((sheet, index) => {
    console.log(`${index + 1}. ${sheet.getName()}`);
  });
  
  return sheets.map(sheet => sheet.getName());
}

/**
 * Function to safely delete multiple sheets
 */
function deleteSheets(sheetNames) {
  const V2_SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  const ss = SpreadsheetApp.openById(V2_SPREADSHEET_ID);
  
  const results = {
    deleted: [],
    errors: [],
    notFound: []
  };
  
  console.log(`Attempting to delete ${sheetNames.length} sheets...`);
  
  sheetNames.forEach(sheetName => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        ss.deleteSheet(sheet);
        results.deleted.push(sheetName);
        console.log(`✅ Deleted: ${sheetName}`);
      } else {
        results.notFound.push(sheetName);
        console.log(`⚠️ Not found: ${sheetName}`);
      }
    } catch (error) {
      results.errors.push({sheet: sheetName, error: error.toString()});
      console.error(`❌ Error deleting ${sheetName}:`, error);
    }
  });
  
  console.log('\nDeletion Summary:');
  console.log(`Deleted: ${results.deleted.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Not Found: ${results.notFound.length}`);
  
  return results;
}

/**
 * Run a quick analysis and show in Apps Script UI
 */
function runQuickAnalysis() {
  try {
    const analysis = analyzeAllSheets();
    
    let message = `SPREADSHEET ANALYSIS REPORT\n\n`;
    message += `Total Sheets: ${analysis.totalSheets}\n\n`;
    
    message += `✅ KEEP (${analysis.recommendations.keep.length}):\n`;
    analysis.recommendations.keep.forEach(name => message += `• ${name}\n`);
    
    message += `\n🔍 INVESTIGATE (${analysis.recommendations.investigate.length}):\n`;
    analysis.recommendations.investigate.forEach(name => {
      const sheet = analysis.sheetDetails.find(s => s.name === name);
      message += `• ${name} (${sheet.dataRowCount} data rows)\n`;
    });
    
    message += `\n❌ DELETE (${analysis.recommendations.delete.length}):\n`;
    analysis.recommendations.delete.forEach(name => message += `• ${name}\n`);
    
    SpreadsheetApp.getUi().alert('Sheet Analysis Complete', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    return analysis;
  } catch (error) {
    SpreadsheetApp.getUi().alert('Analysis Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
}