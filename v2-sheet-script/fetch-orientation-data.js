#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Token search paths
const TOKEN_SEARCH_PATHS = [
  path.join(os.homedir(), '.google-sheets-auth', 'token.json'),
  path.join(os.homedir(), '.config', 'claude-mcp-global', 'token.json'),
  path.join(os.homedir(), 'code', 'Control_Fear_Investment_Tool', 'mcp-exploration', 'token.json'),
];

// Orientation Demographics Sheet ID from TOOLS_INVENTORY
const ORIENTATION_SHEET_ID = '18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0';

async function getAuth() {
  // Find token
  let tokenPath = null;
  for (const searchPath of TOKEN_SEARCH_PATHS) {
    if (fs.existsSync(searchPath)) {
      tokenPath = searchPath;
      console.log(`📁 Using token from: ${searchPath}`);
      break;
    }
  }
  
  if (!tokenPath) {
    console.error('❌ No Google Sheets token found!');
    process.exit(1);
  }
  
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  return google.auth.fromJSON(token);
}

async function fetchOrientationData() {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('📊 Fetching Orientation Demographics data...');
    
    // Try to get the headers/questions from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ORIENTATION_SHEET_ID,
      range: 'A1:Z1', // Get the header row with questions
    });
    
    const headers = response.data.values ? response.data.values[0] : [];
    
    console.log('\n✅ Found questions/fields in Orientation Demographics:');
    console.log('=' .repeat(60));
    headers.forEach((header, index) => {
      console.log(`${index + 1}. ${header}`);
    });
    
    // Also try to get some sample data
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: ORIENTATION_SHEET_ID,
      range: 'A1:Z5', // Get first 5 rows
    });
    
    if (dataResponse.data.values && dataResponse.data.values.length > 1) {
      console.log('\n📋 Sheet has', dataResponse.data.values.length - 1, 'data rows');
    }
    
    return headers;
  } catch (error) {
    console.error('❌ Error fetching sheet:', error.message);
    if (error.code === 403) {
      console.error('Permission denied. The sheet might not be shared properly.');
    }
  }
}

// Run it
fetchOrientationData();