#!/usr/bin/env node
/**
 * Master Agent Runner - Orchestrates all specialized agents
 * Provides continuous monitoring and automated fixes for Google Apps Script
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Import all agents
const GasDoctor = require('./gas-doctor');
const DeployGuardian = require('./deploy-guardian');
const SheetsMonitor = require('./sheets-monitor');
const CallbackSurgeon = require('./callback-surgeon');
const QuotaKeeper = require('./quota-keeper');

class MasterAgent {
  constructor() {
    this.agents = {
      gasDoctor: new GasDoctor(),
      deployGuardian: new DeployGuardian(),
      sheetsMonitor: new SheetsMonitor(),
      callbackSurgeon: new CallbackSurgeon(),
      quotaKeeper: new QuotaKeeper()
    };
    
    this.config = this.loadConfig();
    this.status = {
      running: false,
      lastCheck: null,
      issues: [],
      activeMonitors: []
    };
    
    this.intervals = {};
  }

  /**
   * Load or create configuration
   */
  loadConfig() {
    const configFile = 'agents-config.json';
    
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
    
    const defaultConfig = {
      codeFile: 'Code.js',
      monitoring: {
        enabled: true,
        interval: 30000,  // 30 seconds
        autoFix: false
      },
      agents: {
        gasDoctor: { enabled: true, autoFix: false },
        deployGuardian: { enabled: true },
        sheetsMonitor: { enabled: true },
        callbackSurgeon: { enabled: true, autoFix: false },
        quotaKeeper: { enabled: true }
      },
      alerts: {
        console: true,
        file: true,
        sound: false
      },
      watchFiles: ['Code.js', 'appsscript.json']
    };
    
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  /**
   * Start all agents
   */
  async start() {
    console.clear();
    console.log('🤖 MASTER AGENT STARTING...\n');
    console.log('=' .repeat(60));
    console.log('Google Apps Script Development Guardian');
    console.log('=' .repeat(60) + '\n');
    
    this.status.running = true;
    this.status.startTime = Date.now();
    
    // Display configuration
    console.log('📋 Configuration:');
    console.log(`  Code file: ${this.config.codeFile}`);
    console.log(`  Check interval: ${this.config.monitoring.interval / 1000}s`);
    console.log(`  Auto-fix: ${this.config.monitoring.autoFix ? 'ON' : 'OFF'}`);
    console.log(`  Watching: ${this.config.watchFiles.join(', ')}`);
    console.log();
    
    // Start individual monitors
    await this.startMonitors();
    
    // Initial check
    await this.runFullCheck();
    
    // Set up file watchers
    this.setupFileWatchers();
    
    // Set up periodic checks
    this.intervals.main = setInterval(async () => {
      await this.runFullCheck();
    }, this.config.monitoring.interval);
    
    // Display dashboard
    this.intervals.dashboard = setInterval(() => {
      this.displayDashboard();
    }, 5000);
    
    console.log('\n✅ All agents activated!');
    console.log('Press Ctrl+C to stop\n');
  }

  /**
   * Start individual monitors
   */
  async startMonitors() {
    console.log('🚀 Starting monitors...\n');
    
    // Start Sheets Monitor in background
    if (this.config.agents.sheetsMonitor.enabled) {
      try {
        await this.agents.sheetsMonitor.start({ 
          verbose: false,
          interval: 5000 
        });
        this.status.activeMonitors.push('SheetsMonitor');
        console.log('  ✅ Sheets Monitor active');
      } catch (error) {
        console.log('  ⚠️ Sheets Monitor failed:', error.message);
      }
    }
    
    // Start file watching for Gas Doctor
    if (this.config.agents.gasDoctor.enabled) {
      this.status.activeMonitors.push('GasDoctor');
      console.log('  ✅ Gas Doctor active');
    }
    
    // Initialize other agents
    if (this.config.agents.callbackSurgeon.enabled) {
      this.status.activeMonitors.push('CallbackSurgeon');
      console.log('  ✅ Callback Surgeon active');
    }
    
    if (this.config.agents.quotaKeeper.enabled) {
      this.status.activeMonitors.push('QuotaKeeper');
      console.log('  ✅ Quota Keeper active');
    }
    
    if (this.config.agents.deployGuardian.enabled) {
      this.status.activeMonitors.push('DeployGuardian');
      console.log('  ✅ Deploy Guardian active');
    }
  }

  /**
   * Run full system check
   */
  async runFullCheck() {
    const startTime = Date.now();
    const issues = [];
    
    // Run Gas Doctor
    if (this.config.agents.gasDoctor.enabled) {
      this.agents.gasDoctor.issues = [];
      this.agents.gasDoctor.diagnose(this.config.codeFile);
      issues.push(...this.agents.gasDoctor.issues.map(i => ({
        ...i,
        agent: 'GasDoctor'
      })));
    }
    
    // Run Callback Surgeon
    if (this.config.agents.callbackSurgeon.enabled) {
      this.agents.callbackSurgeon.issues = [];
      this.agents.callbackSurgeon.analyze(this.config.codeFile);
      issues.push(...this.agents.callbackSurgeon.issues.map(i => ({
        ...i,
        agent: 'CallbackSurgeon'
      })));
    }
    
    // Run Quota Keeper
    if (this.config.agents.quotaKeeper.enabled) {
      this.agents.quotaKeeper.warnings = [];
      this.agents.quotaKeeper.analyze(this.config.codeFile);
      issues.push(...this.agents.quotaKeeper.warnings.map(w => ({
        ...w,
        agent: 'QuotaKeeper'
      })));
    }
    
    // Update status
    this.status.lastCheck = Date.now();
    this.status.checkDuration = Date.now() - startTime;
    this.status.issues = issues;
    
    // Handle critical issues
    this.handleCriticalIssues(issues);
    
    // Log to file if enabled
    if (this.config.alerts.file) {
      this.logIssues(issues);
    }
    
    return issues;
  }

  /**
   * Setup file watchers
   */
  setupFileWatchers() {
    this.config.watchFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.watchFile(file, { interval: 2000 }, async (curr, prev) => {
          if (curr.mtime > prev.mtime) {
            console.log(`\n📝 File changed: ${file}`);
            console.log('   Running quick check...');
            
            // Run immediate check
            const issues = await this.runQuickCheck(file);
            
            if (issues.length > 0) {
              console.log(`   ⚠️ Found ${issues.length} issues`);
              
              // Auto-fix if enabled
              if (this.config.monitoring.autoFix) {
                this.attemptAutoFix(file, issues);
              }
            } else {
              console.log('   ✅ No issues found');
            }
          }
        });
      }
    });
  }

  /**
   * Run quick check on file change
   */
  async runQuickCheck(file) {
    const issues = [];
    
    if (file.endsWith('.js')) {
      // Quick syntax check
      try {
        require('child_process').execSync(`node -c ${file}`, { stdio: 'pipe' });
      } catch (error) {
        issues.push({
          type: 'SYNTAX_ERROR',
          severity: 'CRITICAL',
          message: 'Syntax error detected',
          agent: 'QuickCheck'
        });
      }
      
      // Quick iframe check
      const code = fs.readFileSync(file, 'utf8');
      if (code.includes('window.location.href') && !code.includes('window.top')) {
        issues.push({
          type: 'IFRAME_ISSUE',
          severity: 'HIGH',
          message: 'Iframe navigation issue detected',
          agent: 'QuickCheck'
        });
      }
    }
    
    return issues;
  }

  /**
   * Display live dashboard
   */
  displayDashboard() {
    if (!this.status.running) return;
    
    console.clear();
    const now = new Date().toLocaleTimeString();
    const uptime = this.formatUptime(Date.now() - this.status.startTime);
    
    console.log('🤖 MASTER AGENT DASHBOARD');
    console.log('=' .repeat(60));
    console.log(`Time: ${now} | Uptime: ${uptime}`);
    console.log('=' .repeat(60) + '\n');
    
    // Active monitors
    console.log('📡 Active Monitors:');
    this.status.activeMonitors.forEach(monitor => {
      console.log(`  ✅ ${monitor}`);
    });
    console.log();
    
    // Current issues summary
    if (this.status.issues.length > 0) {
      const critical = this.status.issues.filter(i => i.severity === 'CRITICAL').length;
      const high = this.status.issues.filter(i => i.severity === 'HIGH').length;
      const medium = this.status.issues.filter(i => i.severity === 'MEDIUM').length;
      const low = this.status.issues.filter(i => i.severity === 'LOW').length;
      
      console.log('⚠️ Current Issues:');
      if (critical > 0) console.log(`  🔴 Critical: ${critical}`);
      if (high > 0) console.log(`  🟠 High: ${high}`);
      if (medium > 0) console.log(`  🟡 Medium: ${medium}`);
      if (low > 0) console.log(`  🔵 Low: ${low}`);
      
      // Show top 3 critical/high issues
      const topIssues = this.status.issues
        .filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')
        .slice(0, 3);
      
      if (topIssues.length > 0) {
        console.log('\n  Top Priority Issues:');
        topIssues.forEach(issue => {
          console.log(`    [${issue.agent}] ${issue.message}`);
        });
      }
    } else {
      console.log('✅ No issues detected');
    }
    
    // Sheets Monitor status
    if (this.agents.sheetsMonitor.stats) {
      console.log('\n📊 Sheets Activity:');
      console.log(`  Sessions: ${this.agents.sheetsMonitor.stats.sessions.total}`);
      console.log(`  Responses: ${this.agents.sheetsMonitor.stats.responses.total}`);
      
      if (this.agents.sheetsMonitor.stats.writes.failed > 0) {
        console.log(`  ⚠️ Failed writes: ${this.agents.sheetsMonitor.stats.writes.failed}`);
      }
    }
    
    // Last check info
    if (this.status.lastCheck) {
      const ago = Math.floor((Date.now() - this.status.lastCheck) / 1000);
      console.log(`\n⏱️ Last full check: ${ago}s ago (${this.status.checkDuration}ms)`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('Press Ctrl+C to stop | Press R for report | Press F to fix');
  }

  /**
   * Handle critical issues
   */
  handleCriticalIssues(issues) {
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    
    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED!');
      critical.forEach(issue => {
        console.log(`  - [${issue.agent}] ${issue.message}`);
        
        // Alert if sound enabled
        if (this.config.alerts.sound) {
          process.stdout.write('\u0007');  // Terminal bell
        }
      });
      
      // Prevent deployment
      if (critical.some(i => i.type === 'SYNTAX_ERROR')) {
        fs.writeFileSync('.deployment-blocked', 'Critical issues detected');
        console.log('\n  ❌ Deployment blocked until issues resolved');
      }
    }
  }

  /**
   * Attempt automatic fixes
   */
  attemptAutoFix(file, issues) {
    console.log('\n🔧 Attempting auto-fix...');
    
    let fixCount = 0;
    
    issues.forEach(issue => {
      if (issue.autoFix && this.config.monitoring.autoFix) {
        switch(issue.type) {
          case 'IFRAME_ISSUE':
            // Fix iframe navigation
            let code = fs.readFileSync(file, 'utf8');
            code = code.replace(/window\.location\.(href|replace)/g, 'window.top.location.$1');
            fs.writeFileSync(file, code);
            console.log('  ✅ Fixed iframe navigation');
            fixCount++;
            break;
            
          case 'CONSOLE_LOGS':
            // Comment out console logs
            let codeC = fs.readFileSync(file, 'utf8');
            codeC = codeC.replace(/^\s*console\.(log|info|warn|error)/gm, '// $&');
            fs.writeFileSync(file, codeC);
            console.log('  ✅ Commented out console statements');
            fixCount++;
            break;
        }
      }
    });
    
    if (fixCount > 0) {
      console.log(`\n✅ Auto-fixed ${fixCount} issues`);
    }
  }

  /**
   * Log issues to file
   */
  logIssues(issues) {
    const logDir = 'agent-logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      issueCount: issues.length,
      issues: issues,
      config: this.config
    };
    
    const logFile = path.join(logDir, `issues-${new Date().toISOString().split('T')[0]}.json`);
    
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.clear();
    console.log('📊 COMPREHENSIVE AGENT REPORT');
    console.log('=' .repeat(60));
    console.log(`Generated: ${new Date().toLocaleString()}`);
    console.log('=' .repeat(60) + '\n');
    
    // Summary
    console.log('📈 SUMMARY:');
    console.log(`  Total issues: ${this.status.issues.length}`);
    console.log(`  Monitors active: ${this.status.activeMonitors.length}`);
    console.log(`  Uptime: ${this.formatUptime(Date.now() - this.status.startTime)}`);
    console.log();
    
    // Issues by agent
    console.log('🤖 ISSUES BY AGENT:');
    const agentGroups = {};
    this.status.issues.forEach(issue => {
      if (!agentGroups[issue.agent]) {
        agentGroups[issue.agent] = [];
      }
      agentGroups[issue.agent].push(issue);
    });
    
    Object.entries(agentGroups).forEach(([agent, issues]) => {
      console.log(`\n  ${agent} (${issues.length} issues):`);
      issues.slice(0, 5).forEach(issue => {
        const icon = {
          'CRITICAL': '🔴',
          'HIGH': '🟠',
          'MEDIUM': '🟡',
          'LOW': '🔵'
        }[issue.severity] || '⚪';
        console.log(`    ${icon} ${issue.message}`);
      });
      if (issues.length > 5) {
        console.log(`    ... and ${issues.length - 5} more`);
      }
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.status.issues.some(i => i.severity === 'CRITICAL')) {
      console.log('  1. Fix critical issues immediately');
    }
    if (!this.config.monitoring.autoFix) {
      console.log('  2. Consider enabling auto-fix for common issues');
    }
    if (this.status.issues.length > 10) {
      console.log('  3. Run focused fixes on high-priority issues');
    }
    
    console.log('\n' + '=' .repeat(60) + '\n');
  }

  /**
   * Format uptime
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Stop all agents
   */
  stop() {
    console.log('\n\n🛑 Shutting down Master Agent...');
    
    this.status.running = false;
    
    // Clear intervals
    Object.values(this.intervals).forEach(interval => {
      clearInterval(interval);
    });
    
    // Stop monitors
    this.agents.sheetsMonitor.stop();
    
    // Unwatch files
    this.config.watchFiles.forEach(file => {
      fs.unwatchFile(file);
    });
    
    // Final report
    this.generateReport();
    
    console.log('👋 Master Agent stopped. Goodbye!\n');
  }
}

// CLI execution
if (require.main === module) {
  const master = new MasterAgent();
  const command = process.argv[2];
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    master.stop();
    process.exit(0);
  });
  
  // Handle keyboard input
  process.stdin.setRawMode && process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (key) => {
    const char = key.toString();
    
    if (char === 'r' || char === 'R') {
      master.generateReport();
    } else if (char === 'f' || char === 'F') {
      console.log('\n🔧 Running auto-fix on all issues...');
      master.attemptAutoFix(master.config.codeFile, master.status.issues);
    } else if (char === '\u0003') {  // Ctrl+C
      master.stop();
      process.exit(0);
    }
  });
  
  switch(command) {
    case 'start':
      master.start();
      break;
      
    case 'check':
      master.runFullCheck().then(issues => {
        console.log(`\nFound ${issues.length} issues`);
        process.exit(issues.length > 0 ? 1 : 0);
      });
      break;
      
    case 'report':
      master.runFullCheck().then(() => {
        master.generateReport();
        process.exit(0);
      });
      break;
      
    default:
      console.log(`
🤖 Master Agent - Orchestrates all Google Apps Script agents

Usage:
  node agents/master-agent.js start   - Start continuous monitoring
  node agents/master-agent.js check   - Run single check
  node agents/master-agent.js report  - Generate full report

Configuration:
  Edit agents-config.json to customize behavior

Features:
  - Continuous monitoring of Code.js
  - Real-time Sheets activity tracking
  - Automatic issue detection
  - Optional auto-fix for common issues
  - Pre-deployment validation

Keyboard shortcuts (when running):
  R - Generate report
  F - Attempt auto-fix
  Ctrl+C - Stop

Examples:
  node agents/master-agent.js start
  npm run agents:start  (if configured in package.json)
      `);
  }
}

module.exports = MasterAgent;