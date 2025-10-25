#!/usr/bin/env node
/**
 * Sheets-Monitor Agent - Real-time Google Sheets monitoring
 * Tracks data flow, validates writes, monitors quotas
 */

const fs = require('fs');
const path = require('path');

class SheetsMonitor {
  constructor() {
    this.stats = {
      sessions: { total: 0, lastCheck: 0, failed: [] },
      responses: { total: 0, lastCheck: 0, failed: [] },
      writes: { successful: 0, failed: 0 },
      quota: { reads: 0, writes: 0, lastReset: new Date() }
    };
    this.alerts = [];
    this.watchInterval = null;
  }

  /**
   * Start monitoring sheets
   */
  async start(options = {}) {
    console.log('📊 Sheets-Monitor starting...\n');
    console.log('Press Ctrl+C to stop\n');
    
    // Check if sheets.js exists
    const sheetsPath = path.join(process.cwd(), 'sheets.js');
    if (!fs.existsSync(sheetsPath)) {
      console.error('❌ sheets.js not found. Sheets monitoring requires the sheets API module.');
      return false;
    }

    // Load sheets module
    try {
      this.sheets = require(sheetsPath);
    } catch (error) {
      console.error('❌ Failed to load sheets module:', error.message);
      return false;
    }

    // Set monitoring options
    this.options = {
      interval: options.interval || 5000,  // Check every 5 seconds
      verbose: options.verbose || false,
      alertOnFail: options.alertOnFail !== false,
      trackQuota: options.trackQuota !== false
    };

    // Initial check
    await this.checkSheets();
    
    // Start watching
    this.watchInterval = setInterval(async () => {
      await this.checkSheets();
    }, this.options.interval);

    // Monitor Code.js for data operations
    if (options.watchCode !== false) {
      this.watchCodeFile();
    }

    return true;
  }

  /**
   * Check sheets for changes
   */
  async checkSheets() {
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      // Check sessions
      const sessions = await this.sheets.fetch(this.sheets.SHEETS.v2_data, 'SESSIONS!A:F');
      const sessionCount = Math.max(0, sessions.length - 1); // Subtract header row
      
      // Check responses
      const responses = await this.sheets.fetch(this.sheets.SHEETS.v2_data, 'RESPONSES!A:H');
      const responseCount = Math.max(0, responses.length - 1);
      
      // Track quota
      if (this.options.trackQuota) {
        this.stats.quota.reads += 2; // Two reads performed
        this.checkQuotaLimits();
      }
      
      // Detect changes
      let hasChanges = false;
      const changes = [];
      
      if (sessionCount !== this.stats.sessions.lastCheck) {
        const diff = sessionCount - this.stats.sessions.lastCheck;
        if (diff > 0) {
          changes.push(`🆕 ${diff} new session${diff > 1 ? 's' : ''}`);
          
          // Check session integrity
          if (sessions.length > 1) {
            const lastSession = sessions[sessions.length - 1];
            if (this.validateSession(lastSession)) {
              changes.push('  ✅ Session valid');
            } else {
              changes.push('  ⚠️ Session validation failed');
              this.alerts.push({
                type: 'INVALID_SESSION',
                time: timestamp,
                data: lastSession
              });
            }
          }
        }
        this.stats.sessions.lastCheck = sessionCount;
        this.stats.sessions.total = sessionCount;
        hasChanges = true;
      }
      
      if (responseCount !== this.stats.responses.lastCheck) {
        const diff = responseCount - this.stats.responses.lastCheck;
        if (diff > 0) {
          changes.push(`🆕 ${diff} new response${diff > 1 ? 's' : ''}`);
          
          // Check response integrity
          if (responses.length > 1) {
            const lastResponse = responses[responses.length - 1];
            if (this.validateResponse(lastResponse)) {
              changes.push('  ✅ Response valid');
              this.stats.writes.successful++;
            } else {
              changes.push('  ⚠️ Response validation failed');
              this.stats.writes.failed++;
              this.alerts.push({
                type: 'INVALID_RESPONSE',
                time: timestamp,
                data: lastResponse
              });
            }
          }
        }
        this.stats.responses.lastCheck = responseCount;
        this.stats.responses.total = responseCount;
        hasChanges = true;
      }
      
      // Display updates
      if (hasChanges || this.options.verbose) {
        console.log(`[${timestamp}] Sessions: ${sessionCount} | Responses: ${responseCount}`);
        changes.forEach(change => console.log(change));
        
        // Show stats periodically
        if (this.stats.writes.failed > 0) {
          console.log(`  ⚠️ Failed writes: ${this.stats.writes.failed}`);
        }
      }
      
      // Check for stale data
      this.checkForStaleData(sessions, responses);
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Monitor error:`, error.message);
      this.alerts.push({
        type: 'MONITOR_ERROR',
        time: timestamp,
        error: error.message
      });
    }
  }

  /**
   * Validate session data
   */
  validateSession(sessionRow) {
    if (!sessionRow || sessionRow.length < 6) {
      return false;
    }
    
    const [sessionId, clientId, timestamp, toolId, status, data] = sessionRow;
    
    // Check required fields
    if (!sessionId || !clientId || !timestamp) {
      return false;
    }
    
    // Validate session ID format
    if (!sessionId.match(/^[A-Z0-9]{8,}$/)) {
      console.log('  ⚠️ Invalid session ID format:', sessionId);
      return false;
    }
    
    // Check timestamp is recent (within last hour)
    const sessionTime = new Date(timestamp);
    const hourAgo = new Date(Date.now() - 3600000);
    if (sessionTime < hourAgo) {
      console.log('  ⚠️ Stale session timestamp:', timestamp);
      return false;
    }
    
    return true;
  }

  /**
   * Validate response data
   */
  validateResponse(responseRow) {
    if (!responseRow || responseRow.length < 8) {
      return false;
    }
    
    const [responseId, sessionId, clientId, toolId, questionId, answer, timestamp, data] = responseRow;
    
    // Check required fields
    if (!responseId || !sessionId || !clientId) {
      return false;
    }
    
    // Validate JSON data if present
    if (data) {
      try {
        JSON.parse(data);
      } catch (e) {
        console.log('  ⚠️ Invalid JSON in Data column');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check for stale or orphaned data
   */
  checkForStaleData(sessions, responses) {
    // Skip header rows
    const sessionData = sessions.slice(1);
    const responseData = responses.slice(1);
    
    if (sessionData.length === 0) return;
    
    // Find sessions without responses
    const sessionIds = new Set(sessionData.map(s => s[0]));
    const responseSessionIds = new Set(responseData.map(r => r[1]));
    
    const orphanedSessions = [...sessionIds].filter(id => !responseSessionIds.has(id));
    
    if (orphanedSessions.length > 0 && this.options.verbose) {
      console.log(`  ⚠️ ${orphanedSessions.length} sessions without responses`);
    }
    
    // Check for incomplete sessions (status not 'completed')
    const incompleteSessions = sessionData.filter(s => s[4] !== 'completed' && s[4] !== 'in_progress');
    if (incompleteSessions.length > 0 && this.options.verbose) {
      console.log(`  ⏳ ${incompleteSessions.length} incomplete sessions`);
    }
  }

  /**
   * Monitor Code.js for data operations
   */
  watchCodeFile() {
    const codeFile = 'Code.js';
    
    if (!fs.existsSync(codeFile)) {
      console.log('⚠️ Code.js not found for monitoring');
      return;
    }
    
    console.log('👁️ Watching Code.js for data operations...\n');
    
    fs.watchFile(codeFile, { interval: 2000 }, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        this.analyzeDataOperations(codeFile);
      }
    });
  }

  /**
   * Analyze code for data operations
   */
  analyzeDataOperations(codeFile) {
    const code = fs.readFileSync(codeFile, 'utf8');
    const timestamp = new Date().toLocaleTimeString();
    
    // Check for sheet operations
    const operations = {
      reads: (code.match(/getRange|getValues|getDataRange/g) || []).length,
      writes: (code.match(/setValues|appendRow|setValue/g) || []).length,
      clears: (code.match(/clear|clearContent|clearFormat/g) || []).length
    };
    
    if (operations.writes > 0 || operations.clears > 0) {
      console.log(`[${timestamp}] 📝 Code.js data operations detected:`);
      console.log(`  Reads: ${operations.reads}, Writes: ${operations.writes}, Clears: ${operations.clears}`);
      
      if (operations.clears > 0) {
        console.log('  ⚠️ WARNING: Clear operations detected - potential data loss!');
      }
    }
    
    // Check for missing error handling in data operations
    const unhandledWrites = code.match(/appendRow\([^)]+\)(?!\s*\.catch|\s*}?\s*catch)/g);
    if (unhandledWrites && unhandledWrites.length > 0) {
      console.log(`  ⚠️ ${unhandledWrites.length} unhandled write operations (no error handling)`);
    }
  }

  /**
   * Check quota limits
   */
  checkQuotaLimits() {
    const now = new Date();
    
    // Reset daily quotas
    if (now.getDate() !== this.stats.quota.lastReset.getDate()) {
      this.stats.quota.reads = 0;
      this.stats.quota.writes = 0;
      this.stats.quota.lastReset = now;
    }
    
    // Google Sheets API limits
    const limits = {
      reads: 50000,    // 50k reads per day
      writes: 50000,   // 50k writes per day
      concurrent: 30   // 30 concurrent requests
    };
    
    // Warn at 80% usage
    if (this.stats.quota.reads > limits.reads * 0.8) {
      console.log(`  ⚠️ Quota warning: ${this.stats.quota.reads}/${limits.reads} reads (${Math.round(this.stats.quota.reads/limits.reads*100)}%)`);
    }
    
    if (this.stats.quota.writes > limits.writes * 0.8) {
      console.log(`  ⚠️ Quota warning: ${this.stats.quota.writes}/${limits.writes} writes (${Math.round(this.stats.quota.writes/limits.writes*100)}%)`);
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('SHEETS MONITORING REPORT');
    console.log('='.repeat(50) + '\n');
    
    console.log('📊 CURRENT STATUS:');
    console.log(`  Sessions: ${this.stats.sessions.total}`);
    console.log(`  Responses: ${this.stats.responses.total}`);
    console.log(`  Successful writes: ${this.stats.writes.successful}`);
    console.log(`  Failed writes: ${this.stats.writes.failed}`);
    
    if (this.options.trackQuota) {
      console.log('\n📈 QUOTA USAGE:');
      console.log(`  Reads today: ${this.stats.quota.reads}`);
      console.log(`  Writes today: ${this.stats.quota.writes}`);
    }
    
    if (this.alerts.length > 0) {
      console.log('\n⚠️ ALERTS:');
      this.alerts.slice(-10).forEach(alert => {
        console.log(`  [${alert.time}] ${alert.type}: ${alert.error || 'Check data'}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    
    fs.unwatchFile('Code.js');
    
    console.log('\n📊 Monitoring stopped.');
    this.generateReport();
  }

  /**
   * Export monitoring data
   */
  exportData() {
    const exportData = {
      stats: this.stats,
      alerts: this.alerts,
      timestamp: new Date().toISOString()
    };
    
    const filename = `sheets-monitor-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`📁 Data exported to ${filename}`);
    
    return filename;
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new SheetsMonitor();
  const command = process.argv[2];
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\nStopping monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  switch(command) {
    case 'start':
    case 'watch':
      const verbose = process.argv.includes('--verbose');
      monitor.start({ verbose });
      break;
      
    case 'report':
      monitor.generateReport();
      break;
      
    case 'export':
      monitor.exportData();
      break;
      
    default:
      console.log(`
Sheets-Monitor - Real-time Google Sheets monitoring

Usage:
  node agents/sheets-monitor.js start       - Start monitoring
  node agents/sheets-monitor.js start --verbose - Verbose monitoring
  node agents/sheets-monitor.js report      - Generate report
  node agents/sheets-monitor.js export      - Export monitoring data

Examples:
  node agents/sheets-monitor.js start
  node agents/sheets-monitor.js start --verbose
      `);
  }
}

module.exports = SheetsMonitor;