/**
 * Universal Google Sheets Access - One File Solution
 * 
 * SETUP (one line):
 *   npm install googleapis
 * 
 * USAGE:
 *   const sheets = require('./sheets');
 *   const data = await sheets.fetch('1_c4JB4VG4q-...');
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Auto-find token from any of these locations
const TOKEN_SEARCH_PATHS = [
  path.join(os.homedir(), '.google-sheets-auth', 'token.json'),
  path.join(os.homedir(), '.config', 'claude-mcp-global', 'token.json'),
  path.join(os.homedir(), 'code', 'Control_Fear_Investment_Tool', 'mcp-exploration', 'token.json'),
  './token.json',
  '../token.json',
];

// Your commonly used sheets (add more as needed)
const SHEETS = {
  // Investment Tool
  scenarios: '1_c4JB4VG4q-fekL2T1s6nUo83Ko1nZbAkSkDfFM1X0M',
  roster: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
  
  // Add your other project sheets here
  // myProject: 'sheet-id-here',
};

// Cache auth to avoid re-reading token
let cachedAuth = null;

/**
 * Get authenticated client (auto-finds token)
 */
async function getAuth() {
  if (cachedAuth) return cachedAuth;
  
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
    console.error('Run authentication in the mcp-exploration project first.');
    process.exit(1);
  }
  
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  cachedAuth = google.auth.fromJSON(token);
  return cachedAuth;
}

/**
 * Fetch any Google Sheet
 * @param {string} spreadsheetId - Sheet ID or key from SHEETS object
 * @param {string} range - Optional range (default 'A:Z')
 * @returns {Array} Sheet data as 2D array
 */
async function fetch(spreadsheetId, range = 'A:Z') {
  // Allow using shorthand keys
  if (SHEETS[spreadsheetId]) {
    spreadsheetId = SHEETS[spreadsheetId];
  }
  
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    return response.data.values || [];
  } catch (error) {
    if (error.code === 403) {
      console.error('❌ Permission denied. Make sure the sheet is shared or APIs are enabled.');
    } else if (error.code === 404) {
      console.error('❌ Sheet not found. Check the ID.');
    } else {
      console.error('❌ Error fetching sheet:', error.message);
    }
    throw error;
  }
}

/**
 * Fetch and convert to objects using header row
 */
async function fetchAsObjects(spreadsheetId, range = 'A:Z') {
  const data = await fetch(spreadsheetId, range);
  
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

/**
 * Quick test function
 */
async function test() {
  try {
    console.log('🧪 Testing Google Sheets connection...');
    const data = await fetch(SHEETS.scenarios, 'A1:C2');
    console.log('✅ Success! First few cells:', data);
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Save data locally for debugging
 */
async function saveLocal(spreadsheetId, filename = 'sheet-data.json') {
  const data = await fetchAsObjects(spreadsheetId);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`💾 Saved ${data.length} rows to ${filename}`);
  return data;
}

// Export everything
module.exports = {
  fetch,
  fetchAsObjects,
  test,
  saveLocal,
  SHEETS,
  
  // Convenience shortcuts
  scenarios: () => fetchAsObjects(SHEETS.scenarios),
  roster: () => fetchAsObjects(SHEETS.roster),
};

// If run directly, test connection
if (require.main === module) {
  test();
}