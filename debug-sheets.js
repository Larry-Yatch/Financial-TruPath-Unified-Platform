#!/usr/bin/env node
/**
 * Debug utility for Financial TruPath V2 Google Sheets
 * Usage: node debug-sheets.js [command] [options]
 */

const sheets = require('./sheets');

// Commands
const commands = {
  async sessions() {
    console.log('📋 SESSIONS Sheet:');
    const data = await sheets.fetchAsObjects(sheets.SHEETS.v2_data, 'SESSIONS!A:F');
    console.table(data);
    console.log(`Total sessions: ${data.length}`);
  },
  
  async responses() {
    console.log('📋 RESPONSES Sheet:');
    const data = await sheets.fetchAsObjects(sheets.SHEETS.v2_data, 'RESPONSES!A:H');
    if (data.length > 0) {
      // Parse JSON in Data column
      data.forEach(row => {
        if (row.Data) {
          try {
            row.Data = JSON.parse(row.Data);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
      });
    }
    console.table(data);
    console.log(`Total responses: ${data.length}`);
  },
  
  async status() {
    console.log('📋 TOOL_STATUS Sheet:');
    const data = await sheets.fetchAsObjects(sheets.SHEETS.v2_data, 'TOOL_STATUS!A:Z');
    console.table(data);
    console.log(`Students with status: ${data.length}`);
  },
  
  async students() {
    console.log('📋 STUDENTS Sheet:');
    const data = await sheets.fetchAsObjects(sheets.SHEETS.v2_data, 'Students!A:B');
    console.table(data);
    console.log(`Total students: ${data.length}`);
  },
  
  async summary() {
    console.log('📊 Database Summary:\n');
    
    const sheetInfo = [
      { name: 'SESSIONS', range: 'SESSIONS!A:F' },
      { name: 'RESPONSES', range: 'RESPONSES!A:H' },
      { name: 'TOOL_STATUS', range: 'TOOL_STATUS!A:Z' },
      { name: 'TOOL_ACCESS', range: 'TOOL_ACCESS!A:L' },
      { name: 'ACTIVITY_LOG', range: 'ACTIVITY_LOG!A:H' },
      { name: 'ADMINS', range: 'ADMINS!A:F' },
      { name: 'CONFIG', range: 'CONFIG!A:E' },
      { name: 'Students', range: 'Students!A:B' },
    ];
    
    for (const sheet of sheetInfo) {
      try {
        const data = await sheets.fetch(sheets.SHEETS.v2_data, sheet.range);
        const rows = data.length;
        const cols = data[0] ? data[0].length : 0;
        console.log(`  ${sheet.name.padEnd(15)} ${rows} rows × ${cols} columns`);
      } catch (e) {
        console.log(`  ${sheet.name.padEnd(15)} ❌ Error: ${e.message}`);
      }
    }
  },
  
  async watch() {
    console.log('👁️  Watching for changes (refresh every 5 seconds)...\n');
    console.log('Press Ctrl+C to stop\n');
    
    let lastSessionCount = 0;
    let lastResponseCount = 0;
    
    setInterval(async () => {
      try {
        const sessions = await sheets.fetch(sheets.SHEETS.v2_data, 'SESSIONS!A:A');
        const responses = await sheets.fetch(sheets.SHEETS.v2_data, 'RESPONSES!A:A');
        
        const sessionCount = sessions.length - 1;
        const responseCount = responses.length - 1;
        
        if (sessionCount !== lastSessionCount || responseCount !== lastResponseCount) {
          const time = new Date().toLocaleTimeString();
          console.log(`[${time}] Sessions: ${sessionCount} | Responses: ${responseCount}`);
          
          if (sessionCount > lastSessionCount) {
            console.log(`  🆕 New session detected!`);
          }
          if (responseCount > lastResponseCount) {
            console.log(`  🆕 New response detected!`);
          }
          
          lastSessionCount = sessionCount;
          lastResponseCount = responseCount;
        }
      } catch (e) {
        console.error('Watch error:', e.message);
      }
    }, 5000);
  },
  
  async help() {
    console.log(`
Financial TruPath V2 - Sheets Debug Tool

Usage: node debug-sheets.js [command]

Commands:
  sessions  - Show all sessions
  responses - Show all responses (with parsed JSON)
  status    - Show tool completion status
  students  - Show student roster
  summary   - Show database overview
  watch     - Watch for changes in real-time
  help      - Show this help message

Examples:
  node debug-sheets.js summary
  node debug-sheets.js sessions
  node debug-sheets.js watch
    `);
  }
};

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  
  if (commands[command]) {
    try {
      await commands[command]();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    await commands.help();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}