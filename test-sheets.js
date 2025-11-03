#!/usr/bin/env node
/**
 * Test script to verify Google Sheets access from VSCode
 * Run with: node test-sheets.js
 */

const sheets = require('./sheets');

// Test individual sheet headers
async function testSheetHeaders() {
  const testSheets = ['SESSIONS', 'RESPONSES', 'TOOL_STATUS'];
  
  for (const sheetName of testSheets) {
    console.log(`📋 Checking ${sheetName} sheet...`);
    const data = await sheets.fetch(sheets.SPREADSHEET_IDS.V2_MAIN, `${sheetName}!A1:Z1`);
    const headers = data[0] || [];
    console.log('Headers:', headers.slice(0, 5)); // Show first 5
  }
}

// Test student data specifically
async function testStudentData() {
  console.log('📋 Checking STUDENTS sheet...');
  const students = await sheets.fetchV2Sheet('STUDENTS');
  console.log(`Found ${students.length} students`);
  if (students.length > 0) {
    console.log('First student:', students[0]);
  }
}

// Test all sheets summary
async function testSheetSummary() {
  console.log('📊 Sheet Summary:');
  
  for (const sheetName of sheets.REQUIRED_SHEETS) {
    const rowCount = await sheets.getV2SheetRowCount(sheetName);
    console.log(`  ✅ ${sheetName}: ${rowCount} rows`);
  }
}

async function testV2Sheets() {
  console.log('🧪 Testing Financial TruPath V2 Sheets Access...\n');
  
  try {
    await testSheetHeaders();
    console.log();
    await testStudentData();
    console.log();
    await testSheetSummary();
    
    console.log('\n✅ All tests passed! Sheets are accessible from VSCode.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nMake sure you have:');
    console.error('1. Run: npm install googleapis');
    console.error('2. Have a valid token.json in one of the expected locations');
    console.error('3. Have access to the spreadsheet');
  }
}

// Run the test
testV2Sheets();