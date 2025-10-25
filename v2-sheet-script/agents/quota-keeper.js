#!/usr/bin/env node
/**
 * Quota-Keeper Agent - Resource monitor for Google Apps Script
 * Tracks execution time, API calls, and prevents quota exhaustion
 */

const fs = require('fs');
const path = require('path');

class QuotaKeeper {
  constructor() {
    this.limits = {
      execution: {
        single: 6 * 60 * 1000,      // 6 minutes per execution
        daily: 6 * 60 * 60 * 1000,  // 6 hours total runtime per day
      },
      triggers: {
        total: 20,                   // 20 triggers per user per script
        dailyRuntime: 6 * 60 * 60 * 1000  // 6 hours trigger runtime
      },
      api: {
        urlFetch: 20000,             // 20k URL Fetch calls per day
        email: 100,                  // 100 emails per day (consumer)
        emailRecipients: 50,         // 50 recipients per message
        drive: 20000,                // 20k Drive API calls
        sheets: {
          reads: 50000,              // 50k cell reads per day
          writes: 50000              // 50k cell writes per day
        }
      },
      properties: {
        store: 500000,               // 500KB total storage
        keySize: 9000,               // 9KB per key
        keys: 500                    // 500 keys max
      }
    };
    
    this.usage = this.loadUsageData();
    this.warnings = [];
    this.monitoring = false;
  }

  /**
   * Load or initialize usage data
   */
  loadUsageData() {
    const usageFile = 'quota-usage.json';
    
    if (fs.existsSync(usageFile)) {
      const data = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
      
      // Reset daily counters if new day
      const today = new Date().toDateString();
      if (data.date !== today) {
        data.date = today;
        data.daily = this.getEmptyDailyUsage();
      }
      
      return data;
    }
    
    return {
      date: new Date().toDateString(),
      daily: this.getEmptyDailyUsage(),
      triggers: [],
      warnings: [],
      lastCheck: Date.now()
    };
  }

  /**
   * Get empty daily usage structure
   */
  getEmptyDailyUsage() {
    return {
      execution: {
        count: 0,
        totalTime: 0,
        longestRun: 0
      },
      api: {
        urlFetch: 0,
        email: 0,
        drive: 0,
        sheetsReads: 0,
        sheetsWrites: 0
      },
      triggers: {
        count: 0,
        runtime: 0
      }
    };
  }

  /**
   * Analyze code for quota usage patterns
   */
  async analyze(filePath = 'Code.js') {
    console.log('⏱️ Quota-Keeper analyzing resource usage...\n');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const code = fs.readFileSync(filePath, 'utf8');
    
    // Analyze different quota usages
    this.analyzeExecutionPatterns(code);
    this.analyzeApiCalls(code);
    this.analyzeSheetsOperations(code);
    this.analyzeEmailOperations(code);
    this.analyzeTriggers(code);
    this.analyzeProperties(code);
    
    // Check for optimization opportunities
    this.findOptimizations(code);
    
    // Report findings
    this.generateReport();
    
    // Save usage data
    this.saveUsageData();
    
    return this.warnings.length === 0;
  }

  /**
   * Analyze execution time patterns
   */
  analyzeExecutionPatterns(code) {
    console.log('  Analyzing execution patterns...');
    
    // Check for long-running operations
    const patterns = {
      loops: {
        regex: /for\s*\([^)]*\)\s*{[\s\S]*?SpreadsheetApp[\s\S]*?}/g,
        warning: 'Loop contains SpreadsheetApp call - potential timeout risk'
      },
      whileLoops: {
        regex: /while\s*\([^)]*\)\s*{[\s\S]*?}/g,
        warning: 'While loop detected - ensure proper exit conditions'
      },
      recursion: {
        regex: /function\s+(\w+)[\s\S]*?\1\(/g,
        warning: 'Possible recursion detected - risk of stack overflow'
      },
      sleep: {
        regex: /Utilities\.sleep\((\d+)\)/g,
        warning: 'Sleep calls consume execution time'
      }
    };
    
    Object.entries(patterns).forEach(([name, pattern]) => {
      const matches = code.match(pattern.regex) || [];
      if (matches.length > 0) {
        this.warnings.push({
          type: 'EXECUTION_RISK',
          category: name,
          message: pattern.warning,
          count: matches.length,
          severity: name === 'loops' ? 'HIGH' : 'MEDIUM'
        });
        
        // Calculate sleep time if applicable
        if (name === 'sleep') {
          const totalSleep = matches.reduce((sum, match) => {
            const time = parseInt(match.match(/\d+/)[0]);
            return sum + time;
          }, 0);
          
          if (totalSleep > 30000) {  // More than 30 seconds
            this.warnings.push({
              type: 'EXCESSIVE_SLEEP',
              message: `Total sleep time: ${totalSleep}ms (${totalSleep/1000}s)`,
              severity: 'HIGH'
            });
          }
        }
      }
    });
  }

  /**
   * Analyze API call usage
   */
  analyzeApiCalls(code) {
    console.log('  Analyzing API calls...');
    
    const apiPatterns = {
      urlFetch: /UrlFetchApp\.(fetch|fetchAll)/g,
      drive: /DriveApp\./g,
      gmail: /GmailApp\./g,
      calendar: /CalendarApp\./g,
      docs: /DocumentApp\./g
    };
    
    const apiUsage = {};
    
    Object.entries(apiPatterns).forEach(([api, pattern]) => {
      const matches = code.match(pattern) || [];
      apiUsage[api] = matches.length;
      
      if (matches.length > 0) {
        // Estimate daily usage based on patterns
        const estimatedDaily = this.estimateDailyUsage(api, matches.length, code);
        
        if (api === 'urlFetch' && estimatedDaily > this.limits.api.urlFetch * 0.8) {
          this.warnings.push({
            type: 'URL_FETCH_QUOTA_RISK',
            message: `Estimated ${estimatedDaily} URL Fetch calls/day (limit: ${this.limits.api.urlFetch})`,
            severity: 'HIGH'
          });
        }
      }
    });
    
    // Check for batch opportunities
    if (apiUsage.urlFetch > 5) {
      const hasFetchAll = code.includes('UrlFetchApp.fetchAll');
      if (!hasFetchAll) {
        this.warnings.push({
          type: 'BATCH_OPPORTUNITY',
          message: `Multiple UrlFetch calls detected - consider using fetchAll() for batch requests`,
          severity: 'MEDIUM'
        });
      }
    }
  }

  /**
   * Analyze Sheets operations
   */
  analyzeSheetsOperations(code) {
    console.log('  Analyzing Sheets operations...');
    
    const operations = {
      reads: {
        patterns: [
          /getRange/g,
          /getValues/g,
          /getValue/g,
          /getDataRange/g,
          /getCell/g
        ],
        limit: this.limits.api.sheets.reads
      },
      writes: {
        patterns: [
          /setValues/g,
          /setValue/g,
          /appendRow/g,
          /insertRow/g,
          /clear/g
        ],
        limit: this.limits.api.sheets.writes
      }
    };
    
    Object.entries(operations).forEach(([type, config]) => {
      let count = 0;
      config.patterns.forEach(pattern => {
        count += (code.match(pattern) || []).length;
      });
      
      if (count > 0) {
        // Check if operations are in loops
        const inLoopPattern = new RegExp(`for.*{[^}]*(?:${config.patterns.map(p => p.source.replace(/\//g, '')).join('|')})[^}]*}`, 'gs');
        const loopedOps = code.match(inLoopPattern) || [];
        
        if (loopedOps.length > 0) {
          this.warnings.push({
            type: 'SHEETS_IN_LOOP',
            message: `${type} operations inside loops - use batch operations instead`,
            severity: 'HIGH',
            count: loopedOps.length
          });
        }
        
        // Estimate daily usage
        const estimatedDaily = this.estimateDailyUsage(`sheets${type}`, count, code);
        
        if (estimatedDaily > config.limit * 0.8) {
          this.warnings.push({
            type: 'SHEETS_QUOTA_RISK',
            message: `Estimated ${estimatedDaily} sheet ${type}/day (limit: ${config.limit})`,
            severity: 'HIGH'
          });
        }
      }
    });
    
    // Check for inefficient patterns
    this.checkSheetsInefficiencies(code);
  }

  /**
   * Check for Sheets inefficiencies
   */
  checkSheetsInefficiencies(code) {
    // Check for cell-by-cell operations
    if (code.includes('getCell') || code.includes('getValue()')) {
      this.warnings.push({
        type: 'INEFFICIENT_SHEETS',
        message: 'Using getCell/getValue in loops - use getValues() for batch reads',
        severity: 'HIGH'
      });
    }
    
    // Check for multiple getRange calls
    const getRangeCount = (code.match(/getRange/g) || []).length;
    if (getRangeCount > 10) {
      this.warnings.push({
        type: 'MULTIPLE_GET_RANGE',
        message: `${getRangeCount} getRange calls - consider caching or batch operations`,
        severity: 'MEDIUM'
      });
    }
    
    // Check for missing flush
    if (code.includes('setValue') && !code.includes('SpreadsheetApp.flush')) {
      this.warnings.push({
        type: 'MISSING_FLUSH',
        message: 'Multiple setValue without flush() - changes may not persist immediately',
        severity: 'LOW'
      });
    }
  }

  /**
   * Analyze email operations
   */
  analyzeEmailOperations(code) {
    console.log('  Analyzing email operations...');
    
    const emailPatterns = [
      /GmailApp\.sendEmail/g,
      /MailApp\.sendEmail/g,
      /GmailApp\.createDraft/g
    ];
    
    let emailCount = 0;
    emailPatterns.forEach(pattern => {
      emailCount += (code.match(pattern) || []).length;
    });
    
    if (emailCount > 0) {
      // Check if in loop
      const inLoop = /for.*{[^}]*(?:sendEmail|createDraft)[^}]*}/s.test(code);
      
      if (inLoop) {
        this.warnings.push({
          type: 'EMAIL_IN_LOOP',
          message: 'Email operations in loop - risk of quota exhaustion',
          severity: 'CRITICAL'
        });
      }
      
      // Check recipient count
      const recipientPattern = /to:\s*['"]([^'"]+)['"]/g;
      const recipients = code.match(recipientPattern) || [];
      
      recipients.forEach(recipient => {
        const addresses = recipient.split(',').length;
        if (addresses > this.limits.api.emailRecipients) {
          this.warnings.push({
            type: 'TOO_MANY_RECIPIENTS',
            message: `Email with ${addresses} recipients (limit: ${this.limits.api.emailRecipients})`,
            severity: 'HIGH'
          });
        }
      });
    }
  }

  /**
   * Analyze trigger usage
   */
  analyzeTriggers(code) {
    console.log('  Analyzing triggers...');
    
    const triggerPatterns = [
      /ScriptApp\.newTrigger/g,
      /\.timeBased\(\)/g,
      /\.onEdit\(\)/g,
      /\.onFormSubmit\(\)/g,
      /\.onChange\(\)/g
    ];
    
    let triggerCount = 0;
    triggerPatterns.forEach(pattern => {
      triggerCount += (code.match(pattern) || []).length;
    });
    
    if (triggerCount > 0) {
      // Check for trigger cleanup
      if (!code.includes('deleteTrigger')) {
        this.warnings.push({
          type: 'NO_TRIGGER_CLEANUP',
          message: 'Creating triggers without cleanup - risk of trigger accumulation',
          severity: 'MEDIUM'
        });
      }
      
      // Check time-based triggers
      const timeBasedCount = (code.match(/\.timeBased\(\)/g) || []).length;
      if (timeBasedCount > 0) {
        const everyMinute = code.includes('everyMinutes(1)');
        if (everyMinute) {
          this.warnings.push({
            type: 'FREQUENT_TRIGGER',
            message: 'Every-minute trigger consumes significant daily runtime',
            severity: 'HIGH'
          });
        }
      }
    }
  }

  /**
   * Analyze Properties Service usage
   */
  analyzeProperties(code) {
    console.log('  Analyzing Properties Service...');
    
    const propertyPatterns = [
      /PropertiesService\.getScriptProperties/g,
      /PropertiesService\.getUserProperties/g,
      /PropertiesService\.getDocumentProperties/g
    ];
    
    let propertyCount = 0;
    propertyPatterns.forEach(pattern => {
      propertyCount += (code.match(pattern) || []).length;
    });
    
    if (propertyCount > 0) {
      // Check for large data storage
      const setPropertyPattern = /setProperty\(['"]([^'"]+)['"],\s*([^)]+)\)/g;
      const matches = [...code.matchAll(setPropertyPattern)];
      
      matches.forEach(match => {
        const [, key, value] = match;
        
        // Check if storing large objects
        if (value.includes('JSON.stringify') && value.includes('{')) {
          this.warnings.push({
            type: 'LARGE_PROPERTY_RISK',
            message: `Storing JSON object in property '${key}' - max 9KB per key`,
            severity: 'MEDIUM'
          });
        }
      });
    }
  }

  /**
   * Find optimization opportunities
   */
  findOptimizations(code) {
    console.log('  Finding optimization opportunities...');
    
    const optimizations = [];
    
    // Check for cache opportunities
    if (!code.includes('CacheService')) {
      const hasRepeatedReads = (code.match(/getRange/g) || []).length > 5;
      if (hasRepeatedReads) {
        optimizations.push({
          type: 'ADD_CACHING',
          message: 'Consider using CacheService for frequently accessed data',
          impact: 'HIGH'
        });
      }
    }
    
    // Check for batch opportunities
    const hasMultipleWrites = (code.match(/setValue\(/g) || []).length > 3;
    if (hasMultipleWrites && !code.includes('setValues')) {
      optimizations.push({
        type: 'USE_BATCH_WRITES',
        message: 'Multiple setValue calls - use setValues() for batch writes',
        impact: 'HIGH'
      });
    }
    
    // Check for LockService usage
    if (!code.includes('LockService') && code.includes('appendRow')) {
      optimizations.push({
        type: 'ADD_LOCK_SERVICE',
        message: 'Consider LockService for concurrent write operations',
        impact: 'MEDIUM'
      });
    }
    
    // Check for exponential backoff
    if (code.includes('UrlFetchApp') && !code.includes('exponential')) {
      optimizations.push({
        type: 'ADD_RETRY_LOGIC',
        message: 'Add exponential backoff for UrlFetch operations',
        impact: 'MEDIUM'
      });
    }
    
    if (optimizations.length > 0) {
      this.warnings.push({
        type: 'OPTIMIZATIONS_AVAILABLE',
        message: `${optimizations.length} optimization opportunities found`,
        severity: 'INFO',
        details: optimizations
      });
    }
  }

  /**
   * Estimate daily usage based on patterns
   */
  estimateDailyUsage(operation, count, code) {
    // Check if operation is in a trigger
    const inTrigger = code.includes('function doGet') || 
                     code.includes('function doPost') ||
                     code.includes('.timeBased()');
    
    if (inTrigger) {
      // Estimate based on trigger frequency
      if (code.includes('everyMinutes(1)')) return count * 60 * 24;
      if (code.includes('everyMinutes(5)')) return count * 12 * 24;
      if (code.includes('everyHours(1)')) return count * 24;
      if (code.includes('everyDays(1)')) return count;
    }
    
    // Default estimate: assume 10 executions per day
    return count * 10;
  }

  /**
   * Monitor real-time usage
   */
  async monitor() {
    console.log('⏱️ Starting real-time quota monitoring...\n');
    console.log('Press Ctrl+C to stop\n');
    
    this.monitoring = true;
    
    const checkInterval = setInterval(() => {
      if (!this.monitoring) {
        clearInterval(checkInterval);
        return;
      }
      
      this.updateUsageStats();
      this.displayCurrentUsage();
      this.checkQuotaThresholds();
      
    }, 5000);  // Check every 5 seconds
  }

  /**
   * Update usage statistics
   */
  updateUsageStats() {
    // In real implementation, would track actual API calls
    // For now, simulate with random increments for demo
    const simulateUsage = false;  // Set to true for demo
    
    if (simulateUsage) {
      this.usage.daily.api.urlFetch += Math.floor(Math.random() * 10);
      this.usage.daily.api.sheetsReads += Math.floor(Math.random() * 50);
      this.usage.daily.api.sheetsWrites += Math.floor(Math.random() * 20);
    }
  }

  /**
   * Display current usage
   */
  displayCurrentUsage() {
    const timestamp = new Date().toLocaleTimeString();
    console.clear();
    console.log('⏱️ QUOTA KEEPER - Real-time Monitor');
    console.log('=' .repeat(50));
    console.log(`Time: ${timestamp}`);
    console.log();
    
    // Display usage bars
    this.displayUsageBar('URL Fetch', this.usage.daily.api.urlFetch, this.limits.api.urlFetch);
    this.displayUsageBar('Sheet Reads', this.usage.daily.api.sheetsReads, this.limits.api.sheets.reads);
    this.displayUsageBar('Sheet Writes', this.usage.daily.api.sheetsWrites, this.limits.api.sheets.writes);
    this.displayUsageBar('Emails', this.usage.daily.api.email, this.limits.api.email);
    
    console.log();
    console.log('Press Ctrl+C to stop monitoring');
  }

  /**
   * Display usage bar
   */
  displayUsageBar(name, current, limit) {
    const percentage = Math.min(100, (current / limit) * 100);
    const barLength = 30;
    const filledLength = Math.floor((percentage / 100) * barLength);
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const color = percentage > 80 ? '🔴' : percentage > 60 ? '🟡' : '🟢';
    
    console.log(`${name.padEnd(15)} ${color} [${bar}] ${current}/${limit} (${percentage.toFixed(1)}%)`);
  }

  /**
   * Check quota thresholds
   */
  checkQuotaThresholds() {
    const thresholds = [
      { name: 'URL Fetch', current: this.usage.daily.api.urlFetch, limit: this.limits.api.urlFetch },
      { name: 'Sheet Reads', current: this.usage.daily.api.sheetsReads, limit: this.limits.api.sheets.reads },
      { name: 'Sheet Writes', current: this.usage.daily.api.sheetsWrites, limit: this.limits.api.sheets.writes }
    ];
    
    thresholds.forEach(({ name, current, limit }) => {
      const percentage = (current / limit) * 100;
      
      if (percentage > 90) {
        console.log(`\n⚠️ CRITICAL: ${name} at ${percentage.toFixed(1)}% of quota!`);
      } else if (percentage > 80) {
        console.log(`\n⚠️ WARNING: ${name} at ${percentage.toFixed(1)}% of quota`);
      }
    });
  }

  /**
   * Generate quota report
   */
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('QUOTA ANALYSIS REPORT');
    console.log('='.repeat(50) + '\n');
    
    // Group warnings by severity
    const critical = this.warnings.filter(w => w.severity === 'CRITICAL');
    const high = this.warnings.filter(w => w.severity === 'HIGH');
    const medium = this.warnings.filter(w => w.severity === 'MEDIUM');
    const low = this.warnings.filter(w => w.severity === 'LOW');
    const info = this.warnings.filter(w => w.severity === 'INFO');
    
    [
      { items: critical, emoji: '🔴', label: 'CRITICAL' },
      { items: high, emoji: '🟠', label: 'HIGH RISK' },
      { items: medium, emoji: '🟡', label: 'MEDIUM RISK' },
      { items: low, emoji: '🔵', label: 'LOW RISK' },
      { items: info, emoji: 'ℹ️', label: 'INFO' }
    ].forEach(({ items, emoji, label }) => {
      if (items.length > 0) {
        console.log(`${emoji} ${label} (${items.length}):`);
        items.forEach(warning => {
          console.log(`  - ${warning.message}`);
          if (warning.count) console.log(`    Count: ${warning.count}`);
          if (warning.details) {
            warning.details.forEach(detail => {
              console.log(`    💡 ${detail.message}`);
            });
          }
        });
        console.log();
      }
    });
    
    console.log('📊 QUOTA LIMITS REFERENCE:');
    console.log('  Execution: 6 min/run, 6 hours/day');
    console.log('  URL Fetch: 20,000/day');
    console.log('  Sheets: 50,000 reads & writes/day');
    console.log('  Email: 100/day (consumer)');
    console.log('  Triggers: 20 per script');
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * Save usage data
   */
  saveUsageData() {
    fs.writeFileSync('quota-usage.json', JSON.stringify(this.usage, null, 2));
  }
}

// CLI execution
if (require.main === module) {
  const keeper = new QuotaKeeper();
  const command = process.argv[2];
  
  switch(command) {
    case 'analyze':
    case 'check':
      keeper.analyze(process.argv[3] || 'Code.js');
      break;
      
    case 'monitor':
      keeper.monitor();
      
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        keeper.monitoring = false;
        console.log('\n\nStopping monitor...');
        keeper.generateReport();
        process.exit(0);
      });
      break;
      
    default:
      console.log(`
Quota-Keeper - Resource monitor for Google Apps Script

Usage:
  node agents/quota-keeper.js analyze [file]  - Analyze quota usage
  node agents/quota-keeper.js monitor         - Real-time monitoring

Examples:
  node agents/quota-keeper.js analyze Code.js
  node agents/quota-keeper.js monitor
      `);
  }
}

module.exports = QuotaKeeper;