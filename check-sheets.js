#!/usr/bin/env node
/**
 * Quick check of all sheets in the spreadsheet
 * Run with: node check-sheets.js
 */

const sheets = require('./sheets');

async function checkAllSheets() {
  const SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';
  
  console.log('📋 Checking ALL sheets in Financial TruPath V2 Spreadsheet\n');
  
  // Known sheets we should have
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
  
  // Sheets that might be deletable
  const possiblyDelete = [
    'Sheet1',
    'CrossToolInsights',
    'SystemLogs'
  ];
  
  console.log('✅ Required Sheets (Should Keep):');
  for (const sheetName of requiredSheets) {
    try {
      const data = await sheets.fetch(SPREADSHEET_ID, `${sheetName}!A:A`);
      const rows = data.length;
      console.log(`   ${sheetName.padEnd(20)} ${rows} rows`);
    } catch (e) {
      console.log(`   ${sheetName.padEnd(20)} ❌ Not found`);
    }
  }
  
  console.log('\n🤔 Possibly Delete:');
  for (const sheetName of possiblyDelete) {
    try {
      const data = await sheets.fetch(SPREADSHEET_ID, `${sheetName}!A:Z`);
      const rows = data.length;
      const hasData = rows > 1;
      console.log(`   ${sheetName.padEnd(20)} ${rows} rows ${hasData ? '⚠️ HAS DATA' : '✅ Empty (safe to delete)'}`);
    } catch (e) {
      console.log(`   ${sheetName.padEnd(20)} ✅ Already deleted or doesn't exist`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('- Keep all required sheets listed above');
  console.log('- Delete Sheet1 if it exists and is empty');
  console.log('- Review CrossToolInsights and SystemLogs for any important data');
  console.log('\nTo delete sheets, run executeSheetAnalysis() in Apps Script');
}

// Run the check
checkAllSheets().catch(console.error);