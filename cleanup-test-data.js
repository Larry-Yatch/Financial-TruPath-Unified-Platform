#!/usr/bin/env node

/**
 * Cleanup script for test data in Google Sheets
 * Removes old test sessions and responses, keeping only recent ones
 */

const sheets = require('./sheets');

const SPREADSHEET_ID = '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24';

async function cleanupSheets() {
  try {
    console.log('🧹 Starting cleanup of test data...\n');
    console.log('📊 Current state before cleanup:');
    
    // Show current state
    await require('./debug-sheets').commands.summary();
    
    console.log('\n⚠️  Manual cleanup needed:');
    console.log('   Please manually delete old rows from the Google Sheets:');
    console.log('   1. Open: https://docs.google.com/spreadsheets/d/18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24/edit');
    console.log('   2. Go to SESSIONS sheet - delete rows 2-40 (keep header + last 3)');
    console.log('   3. Go to RESPONSES sheet - delete rows 2-10 (keep header + last 2)');
    console.log('   4. This will give us a clean state for testing\n');
    
    console.log('💡 Alternatively, you can use the Google Sheets UI to:');
    console.log('   - Select rows to delete');
    console.log('   - Right-click → Delete rows');
    console.log('   - Keep only the most recent test data\n');

  } catch (error) {
    console.error('❌ Error during cleanup check:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupSheets();
}

module.exports = { cleanupSheets };