#!/usr/bin/env node
/**
 * Claude-Bridge - Connects local agents with Claude's agent system
 * Allows local agents to request Claude agent analysis
 */

const fs = require('fs');
const path = require('path');

class ClaudeBridge {
  constructor() {
    this.requestQueue = [];
    this.resultsDir = 'agent-requests';
    
    // Create directory for agent communication
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir);
    }
  }

  /**
   * Request Claude agent analysis
   * Creates a file that you can share with Claude
   */
  requestClaudeAgent(agentType, context) {
    const timestamp = new Date().toISOString();
    const request = {
      timestamp,
      agentType,
      context,
      status: 'pending',
      localFindings: context.issues || []
    };
    
    // Generate filename
    const filename = `claude-request-${Date.now()}.json`;
    const filepath = path.join(this.resultsDir, filename);
    
    // Write request file
    fs.writeFileSync(filepath, JSON.stringify(request, null, 2));
    
    console.log('\n📨 CLAUDE AGENT REQUEST CREATED');
    console.log('=' .repeat(50));
    console.log(`Agent Type: ${agentType}`);
    console.log(`Request File: ${filepath}`);
    console.log('\nTo execute this request:');
    console.log('1. Tell Claude: "Process agent request from ' + filename + '"');
    console.log('2. Claude will use the ' + agentType + ' agent to analyze');
    console.log('=' .repeat(50) + '\n');
    
    return filepath;
  }

  /**
   * Monitor local agents and trigger Claude requests
   */
  monitorAndTrigger() {
    console.log('🌉 Claude Bridge Active - Monitoring for trigger conditions...\n');
    
    // Watch for specific trigger conditions
    setInterval(() => {
      this.checkTriggerConditions();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Check if we should request Claude agent help
   */
  checkTriggerConditions() {
    // Read latest issues from local agents
    const issueFiles = [
      'gas-doctor-issues.json',
      'quota-keeper-warnings.json',
      'callback-surgeon-issues.json'
    ];
    
    issueFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const issues = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        // Trigger conditions for Claude agents
        if (this.shouldRequestClaudeHelp(issues)) {
          this.createClaudeRequest(issues);
        }
      }
    });
  }

  /**
   * Determine if issues warrant Claude agent help
   */
  shouldRequestClaudeHelp(issues) {
    // Request Claude help for:
    // - Critical issues
    // - Multiple high-severity issues
    // - Complex architectural problems
    // - Security vulnerabilities
    
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    const security = issues.filter(i => 
      i.type.includes('SECURITY') || 
      i.type.includes('CREDENTIAL') ||
      i.type.includes('XSS')
    );
    
    return critical.length > 0 || 
           high.length > 3 || 
           security.length > 0;
  }

  /**
   * Create request for Claude agent
   */
  createClaudeRequest(issues) {
    // Map local findings to appropriate Claude agents
    const agentMapping = {
      'SECURITY': 'locksmith',
      'RUNTIME_ERROR': 'bugsy',
      'CONFIG': 'murphy',
      'ARCHITECTURE': 'validation',
      'PERFORMANCE': 'validation'
    };
    
    // Determine best Claude agent for the issues
    let selectedAgent = 'validation'; // Default
    
    for (const issue of issues) {
      for (const [keyword, agent] of Object.entries(agentMapping)) {
        if (issue.type.includes(keyword)) {
          selectedAgent = agent;
          break;
        }
      }
    }
    
    // Create the request
    this.requestClaudeAgent(selectedAgent, {
      issues: issues,
      file: 'Code.js',
      requestReason: 'Local agents found complex issues requiring deeper analysis'
    });
  }

  /**
   * Generate integration report
   */
  generateIntegrationReport() {
    console.log('\n📊 AGENT INTEGRATION REPORT');
    console.log('=' .repeat(50));
    
    console.log('\n🤖 LOCAL AGENTS (Continuous):');
    console.log('  ✅ Gas-Doctor - Running');
    console.log('  ✅ Deploy-Guardian - Running');
    console.log('  ✅ Sheets-Monitor - Running');
    console.log('  ✅ Callback-Surgeon - Running');
    console.log('  ✅ Quota-Keeper - Running');
    
    console.log('\n🔮 CLAUDE AGENTS (On-Demand):');
    console.log('  ⏸️ validation - Available when requested');
    console.log('  ⏸️ bugsy - Available when requested');
    console.log('  ⏸️ murphy - Available when requested');
    console.log('  ⏸️ locksmith - Available when requested');
    console.log('  ⏸️ sherlock - Available when requested');
    
    console.log('\n🔄 INTEGRATION POINTS:');
    console.log('  1. Local agents detect issues');
    console.log('  2. Bridge creates Claude request');
    console.log('  3. You share request with Claude');
    console.log('  4. Claude runs specialized agent');
    console.log('  5. Combined analysis provides full picture');
    
    console.log('\n💡 WORKFLOW EXAMPLE:');
    console.log('  Gas-Doctor finds: "Possible security issue"');
    console.log('  Bridge creates: claude-request-[timestamp].json');
    console.log('  You tell Claude: "Process agent request"');
    console.log('  Claude runs: locksmith agent for deep security audit');
    
    console.log('\n' + '=' .repeat(50) + '\n');
  }
}

// Integration helper for Master Agent
class MasterAgentIntegration {
  /**
   * Enhance Master Agent with Claude integration
   */
  static enhance(masterAgent) {
    const bridge = new ClaudeBridge();
    
    // Add method to request Claude help
    masterAgent.requestClaudeAnalysis = function(agentType) {
      const context = {
        issues: this.status.issues,
        file: this.config.codeFile,
        localAgentsActive: this.status.activeMonitors
      };
      
      return bridge.requestClaudeAgent(agentType, context);
    };
    
    // Add automatic triggering for critical issues
    const originalHandleCritical = masterAgent.handleCriticalIssues;
    masterAgent.handleCriticalIssues = function(issues) {
      originalHandleCritical.call(this, issues);
      
      const critical = issues.filter(i => i.severity === 'CRITICAL');
      if (critical.length > 0) {
        console.log('\n🔮 Critical issues detected - Claude agent help recommended');
        console.log('   Creating request for Claude analysis...');
        
        // Determine appropriate agent
        const hasSecurityIssue = critical.some(i => 
          i.type.includes('CREDENTIAL') || 
          i.type.includes('SECURITY')
        );
        
        const agentType = hasSecurityIssue ? 'locksmith' : 'validation';
        const requestFile = bridge.requestClaudeAgent(agentType, {
          criticalIssues: critical,
          allIssues: issues
        });
        
        console.log(`   ✅ Request created: ${requestFile}`);
        console.log('   Share this with Claude for deep analysis\n');
      }
    };
    
    return masterAgent;
  }
}

// CLI execution
if (require.main === module) {
  const bridge = new ClaudeBridge();
  const command = process.argv[2];
  
  switch(command) {
    case 'monitor':
      bridge.monitorAndTrigger();
      break;
      
    case 'request':
      const agentType = process.argv[3] || 'validation';
      const reason = process.argv.slice(4).join(' ') || 'Manual request';
      bridge.requestClaudeAgent(agentType, { reason });
      break;
      
    case 'report':
      bridge.generateIntegrationReport();
      break;
      
    default:
      console.log(`
🌉 Claude Bridge - Connect local agents with Claude's agents

Usage:
  node agents/claude-bridge.js monitor  - Monitor and auto-create requests
  node agents/claude-bridge.js request [agent] [reason] - Manual request
  node agents/claude-bridge.js report   - Show integration status

Available Claude Agents to request:
  - validation: Comprehensive code review
  - bugsy: Bug detection and fixes
  - murphy: Configuration and dependencies
  - locksmith: Security audit
  - sherlock: Research and information

Examples:
  node agents/claude-bridge.js request locksmith "Security audit needed"
  node agents/claude-bridge.js request validation "Full code review"
  node agents/claude-bridge.js monitor

Integration with Master Agent:
  When critical issues are found, the bridge automatically creates
  a request file that you can share with Claude for deeper analysis.
      `);
  }
}

module.exports = { ClaudeBridge, MasterAgentIntegration };