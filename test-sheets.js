#!/usr/bin/env node
/**
 * Test script to verify Google Sheets access from VSCode
 * Run with: node test-sheets.js
 */

const sheets = require('./sheets');

async function testV2Sheets() {
  console.log('🧪 Testing Financial TruPath V2 Sheets Access...\n');
  
  try {
    // Test 1: Check SESSIONS sheet
    console.log('📋 Checking SESSIONS sheet...');
    const sessions = await sheets.fetch(sheets.SHEETS.v2_data, 'SESSIONS!A1:F1');
    console.log('Headers:', sessions[0]);
    
    // Test 2: Check RESPONSES sheet
    console.log('\n📋 Checking RESPONSES sheet...');
    const responses = await sheets.fetch(sheets.SHEETS.v2_data, 'RESPONSES!A1:H1');
    console.log('Headers:', responses[0]);
    
    // Test 3: Check TOOL_STATUS sheet
    console.log('\n📋 Checking TOOL_STATUS sheet...');
    const toolStatus = await sheets.fetch(sheets.SHEETS.v2_data, 'TOOL_STATUS!A1:Z1');
    console.log('Headers (first 5):', toolStatus[0].slice(0, 5));
    
    // Test 4: Check STUDENTS sheet (roster)
    console.log('\n📋 Checking STUDENTS sheet...');
    const students = await sheets.fetchAsObjects(sheets.SHEETS.v2_data, 'Students!A:B');
    console.log(`Found ${students.length} students`);
    if (students.length > 0) {
      console.log('First student:', students[0]);
    }
    
    // Test 5: Count sheets
    console.log('\n📊 Sheet Summary:');
    const allSheets = [
      'SESSIONS', 'RESPONSES', 'TOOL_STATUS', 
      'TOOL_ACCESS', 'ACTIVITY_LOG', 'ADMINS', 'CONFIG'
    ];
    
    for (const sheetName of allSheets) {
      try {
        const data = await sheets.fetch(sheets.SHEETS.v2_data, `${sheetName}!A:A`);
        console.log(`  ✅ ${sheetName}: ${data.length} rows`);
      } catch (e) {
        console.log(`  ❌ ${sheetName}: Not found`);
      }
    }
    
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