#!/usr/bin/env node
/**
 * Callback-Surgeon Agent - Fixes async handler issues in Google Apps Script
 * Prevents infinite loops, null errors, and unhandled promises
 */

const fs = require('fs');
const path = require('path');

class CallbackSurgeon {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.patterns = {
      scriptRun: /google\.script\.run[\s\S]*?(?=google\.script\.run|$)/g,
      successHandler: /\.withSuccessHandler\s*\(\s*function\s*\(([^)]*)\)\s*{([^}]*)}/g,
      failureHandler: /\.withFailureHandler/g,
      functionCall: /\.\w+\([^)]*\)(?:\s*;)?$/
    };
  }

  /**
   * Analyze and fix callback issues
   */
  async analyze(filePath = 'Code.js') {
    console.log('🔄 Callback-Surgeon analyzing async handlers...\n');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const code = fs.readFileSync(filePath, 'utf8');
    
    // Run all checks
    this.findScriptRunCalls(code);
    this.checkSuccessHandlers(code);
    this.checkFailureHandlers(code);
    this.checkPromisePatterns(code);
    this.checkInfiniteLoops(code);
    this.checkLoadingStates(code);
    
    // Report findings
    this.reportFindings();
    
    // Apply fixes if requested
    if (process.argv.includes('--fix')) {
      await this.applyFixes(filePath, code);
    }
    
    return this.issues.length === 0;
  }

  /**
   * Find all google.script.run calls
   */
  findScriptRunCalls(code) {
    const scriptRuns = code.match(this.patterns.scriptRun) || [];
    console.log(`Found ${scriptRuns.length} google.script.run calls\n`);
    
    scriptRuns.forEach((call, index) => {
      this.analyzeScriptRun(call, index);
    });
  }

  /**
   * Analyze individual script run call
   */
  analyzeScriptRun(call, index) {
    const callNum = index + 1;
    let hasIssues = false;
    
    // Check for success handler
    if (!call.includes('withSuccessHandler')) {
      this.issues.push({
        type: 'MISSING_SUCCESS_HANDLER',
        severity: 'HIGH',
        message: `Call #${callNum}: Missing withSuccessHandler`,
        snippet: this.truncate(call),
        fix: 'Add .withSuccessHandler(function(result) { ... })'
      });
      hasIssues = true;
    }
    
    // Check for failure handler
    if (!call.includes('withFailureHandler')) {
      this.issues.push({
        type: 'MISSING_FAILURE_HANDLER',
        severity: 'MEDIUM',
        message: `Call #${callNum}: Missing withFailureHandler`,
        snippet: this.truncate(call),
        fix: 'Add .withFailureHandler(function(error) { ... })'
      });
      hasIssues = true;
    }
    
    // Check if function call exists at the end
    const functionMatch = call.match(/\.(\w+)\([^)]*\)(?:\s*;)?$/);
    if (!functionMatch) {
      this.issues.push({
        type: 'INCOMPLETE_CALL',
        severity: 'CRITICAL',
        message: `Call #${callNum}: No function call at the end`,
        snippet: this.truncate(call),
        fix: 'Add the actual function call at the end'
      });
      hasIssues = true;
    }
    
    if (!hasIssues) {
      // Analyze handler quality
      this.analyzeHandlerQuality(call, callNum);
    }
  }

  /**
   * Check success handler implementations
   */
  checkSuccessHandlers(code) {
    const handlers = [...code.matchAll(this.patterns.successHandler)];
    
    handlers.forEach((match, index) => {
      const [fullMatch, paramName, handlerBody] = match;
      const handlerNum = index + 1;
      
      // Check for null check
      if (paramName && !handlerBody.includes(`!${paramName}`) && 
          !handlerBody.includes(`${paramName} ==`) &&
          !handlerBody.includes(`${paramName}==`) &&
          !handlerBody.includes(`${paramName} ===`)) {
        
        this.issues.push({
          type: 'MISSING_NULL_CHECK',
          severity: 'HIGH',
          message: `Success handler #${handlerNum}: No null check for '${paramName}'`,
          fix: `Add: if (!${paramName}) { handleError("No response"); return; }`,
          autoFix: true
        });
        
        this.fixes.push({
          pattern: new RegExp(`function\\s*\\(${paramName}\\)\\s*{`),
          replacement: `function(${paramName}) {\n    if (!${paramName}) {\n      console.error('No response from server');\n      return;\n    }`
        });
      }
      
      // Check for success property check
      if (paramName && handlerBody.includes(`${paramName}.success`) &&
          !handlerBody.includes(`!${paramName}.success`) &&
          !handlerBody.includes(`${paramName}.success ===`) &&
          !handlerBody.includes(`${paramName}.success ==`)) {
        
        this.issues.push({
          type: 'UNSAFE_SUCCESS_CHECK',
          severity: 'MEDIUM',
          message: `Success handler #${handlerNum}: Accessing .success without validation`,
          fix: `Add: if (${paramName}.success === false) { handleError(${paramName}.error); return; }`
        });
      }
      
      // Check for proper error handling
      if (handlerBody.includes('.error') && !handlerBody.includes('||')) {
        this.issues.push({
          type: 'NO_ERROR_FALLBACK',
          severity: 'LOW',
          message: `Success handler #${handlerNum}: No fallback for error message`,
          fix: `Use: ${paramName}.error || 'Unknown error'`
        });
      }
    });
  }

  /**
   * Check failure handler implementations
   */
  checkFailureHandlers(code) {
    // Find failure handlers
    const failureHandlers = code.match(/\.withFailureHandler\s*\(\s*function\s*\([^)]*\)\s*{[^}]*}/g) || [];
    
    failureHandlers.forEach((handler, index) => {
      const handlerNum = index + 1;
      
      // Check if handler just logs
      if (handler.includes('console.') && !handler.includes('alert') && 
          !handler.includes('showError') && !handler.includes('handleError')) {
        
        this.issues.push({
          type: 'SILENT_FAILURE',
          severity: 'MEDIUM',
          message: `Failure handler #${handlerNum}: Only logs error, user won't see it`,
          fix: 'Add user-visible error handling (alert, UI update, etc.)'
        });
      }
      
      // Check for retry logic
      if (!handler.includes('retry') && !handler.includes('setTimeout')) {
        this.issues.push({
          type: 'NO_RETRY_LOGIC',
          severity: 'LOW',
          message: `Failure handler #${handlerNum}: No retry mechanism`,
          fix: 'Consider adding retry logic for transient failures'
        });
      }
    });
  }

  /**
   * Check for promise-like patterns
   */
  checkPromisePatterns(code) {
    // Check for async/await usage (not supported in Apps Script)
    if (code.includes('async ') || code.includes('await ')) {
      this.issues.push({
        type: 'ASYNC_AWAIT_USAGE',
        severity: 'CRITICAL',
        message: 'Using async/await - not supported in Google Apps Script!',
        fix: 'Use google.script.run with callbacks instead'
      });
    }
    
    // Check for .then() chains (indicating confusion with Promises)
    if (code.includes('google.script.run') && code.includes('.then(')) {
      this.issues.push({
        type: 'PROMISE_CONFUSION',
        severity: 'HIGH',
        message: 'Using .then() with google.script.run - this is not a Promise!',
        fix: 'Use .withSuccessHandler() instead of .then()'
      });
    }
  }

  /**
   * Check for infinite loop patterns
   */
  checkInfiniteLoops(code) {
    // Pattern: "Verifying..." or similar loading messages without timeout
    const loadingPatterns = [
      /innerHTML\s*=\s*['"].*(?:Verifying|Loading|Processing|Checking).*['"]/gi,
      /textContent\s*=\s*['"].*(?:Verifying|Loading|Processing|Checking).*['"]/gi
    ];
    
    loadingPatterns.forEach(pattern => {
      const matches = code.match(pattern) || [];
      matches.forEach(match => {
        // Check if there's a timeout or error handler nearby
        const surroundingCode = this.getSurroundingCode(code, code.indexOf(match));
        
        if (!surroundingCode.includes('setTimeout') && 
            !surroundingCode.includes('clearTimeout')) {
          
          this.issues.push({
            type: 'INFINITE_LOADING_RISK',
            severity: 'HIGH',
            message: 'Loading state without timeout - risk of infinite "Verifying..."',
            snippet: this.truncate(match),
            fix: 'Add timeout: setTimeout(() => { showError("Timeout"); }, 30000)'
          });
        }
      });
    });
  }

  /**
   * Check for proper loading state management
   */
  checkLoadingStates(code) {
    // Find show/hide loading patterns
    const showLoading = code.match(/(?:show|display).*(?:Loading|Spinner|Progress)/gi) || [];
    const hideLoading = code.match(/(?:hide|remove).*(?:Loading|Spinner|Progress)/gi) || [];
    
    if (showLoading.length > hideLoading.length) {
      this.issues.push({
        type: 'UNBALANCED_LOADING_STATES',
        severity: 'MEDIUM',
        message: `${showLoading.length} show loading calls but only ${hideLoading.length} hide calls`,
        fix: 'Ensure every showLoading() has a corresponding hideLoading() in both success and failure handlers'
      });
    }
    
    // Check for loading state in finally equivalent
    if (showLoading.length > 0 && !code.includes('finally')) {
      // Check if both success and failure handlers hide loading
      const hasProperCleanup = code.includes('withSuccessHandler') && 
                               code.includes('withFailureHandler');
      
      if (!hasProperCleanup) {
        this.issues.push({
          type: 'LOADING_STATE_LEAK',
          severity: 'HIGH',
          message: 'Loading state might not be cleared on error',
          fix: 'Hide loading spinner in BOTH success and failure handlers'
        });
      }
    }
  }

  /**
   * Analyze handler quality
   */
  analyzeHandlerQuality(call, callNum) {
    // Extract handlers
    const successMatch = call.match(/\.withSuccessHandler\s*\(\s*function\s*\([^)]*\)\s*{([^}]*)}/);
    
    if (successMatch) {
      const handlerBody = successMatch[1];
      
      // Check for empty handler
      if (handlerBody.trim().length === 0) {
        this.issues.push({
          type: 'EMPTY_HANDLER',
          severity: 'HIGH',
          message: `Call #${callNum}: Success handler is empty`,
          fix: 'Add proper result handling logic'
        });
      }
      
      // Check for only console.log
      if (handlerBody.trim().startsWith('console.log') && 
          !handlerBody.includes('return') &&
          !handlerBody.includes('if')) {
        
        this.issues.push({
          type: 'DEBUG_ONLY_HANDLER',
          severity: 'MEDIUM',
          message: `Call #${callNum}: Handler only logs, no actual processing`,
          fix: 'Add proper result processing after logging'
        });
      }
    }
  }

  /**
   * Get surrounding code context
   */
  getSurroundingCode(code, index, range = 500) {
    const start = Math.max(0, index - range);
    const end = Math.min(code.length, index + range);
    return code.substring(start, end);
  }

  /**
   * Truncate long strings for display
   */
  truncate(str, maxLength = 50) {
    str = str.replace(/\s+/g, ' ').trim();
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  /**
   * Generate safe callback template
   */
  generateSafeCallback(functionName) {
    return `
google.script.run
  .withSuccessHandler(function(result) {
    // Null check first
    if (!result) {
      console.error('No response from server');
      showError('Server did not respond. Please try again.');
      hideLoading();
      return;
    }
    
    // Check for error in response
    if (result.error || result.success === false) {
      console.error('Server error:', result.error);
      showError(result.error || 'Operation failed');
      hideLoading();
      return;
    }
    
    // Success - process result
    hideLoading();
    // TODO: Add your success logic here
    console.log('Success:', result);
  })
  .withFailureHandler(function(error) {
    console.error('Call failed:', error);
    showError('Connection error: ' + error.message);
    hideLoading();
    
    // Optional: Retry logic
    // setTimeout(() => { retryOperation(); }, 3000);
  })
  .${functionName}(/* parameters */);`;
  }

  /**
   * Report all findings
   */
  reportFindings() {
    if (this.issues.length === 0) {
      console.log('✅ No callback issues found! Async handlers look good.\n');
      return;
    }
    
    console.log(`Found ${this.issues.length} callback issues:\n`);
    
    // Group by severity
    const critical = this.issues.filter(i => i.severity === 'CRITICAL');
    const high = this.issues.filter(i => i.severity === 'HIGH');
    const medium = this.issues.filter(i => i.severity === 'MEDIUM');
    const low = this.issues.filter(i => i.severity === 'LOW');
    
    [
      { items: critical, emoji: '🔴', label: 'CRITICAL' },
      { items: high, emoji: '🟠', label: 'HIGH' },
      { items: medium, emoji: '🟡', label: 'MEDIUM' },
      { items: low, emoji: '🔵', label: 'LOW' }
    ].forEach(({ items, emoji, label }) => {
      if (items.length > 0) {
        console.log(`${emoji} ${label} (${items.length}):`);
        items.forEach(issue => {
          console.log(`  - ${issue.message}`);
          if (issue.snippet) console.log(`    Code: ${issue.snippet}`);
          if (issue.fix) console.log(`    💡 Fix: ${issue.fix}`);
          if (issue.autoFix) console.log(`    🔧 Auto-fixable`);
        });
        console.log();
      }
    });
    
    // Show template
    if (this.issues.length > 0) {
      console.log('📋 SAFE CALLBACK TEMPLATE:');
      console.log(this.generateSafeCallback('yourServerFunction'));
      console.log();
    }
    
    if (this.fixes.length > 0) {
      console.log('💡 Run with --fix flag to apply auto-fixes\n');
    }
  }

  /**
   * Apply automatic fixes
   */
  async applyFixes(filePath, originalCode) {
    if (this.fixes.length === 0) {
      console.log('No auto-fixes available.\n');
      return;
    }
    
    console.log(`\n🔧 Applying ${this.fixes.length} auto-fixes...`);
    
    // Backup original
    const backupPath = filePath + '.callback-backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  Backup created: ${backupPath}`);
    
    // Apply fixes
    let code = originalCode;
    
    this.fixes.forEach(fix => {
      code = code.replace(fix.pattern, fix.replacement);
    });
    
    fs.writeFileSync(filePath, code);
    console.log(`✅ Fixes applied to ${filePath}\n`);
  }
}

// CLI execution
if (require.main === module) {
  const surgeon = new CallbackSurgeon();
  const command = process.argv[2];
  
  switch(command) {
    case 'analyze':
    case 'check':
      surgeon.analyze(process.argv[3] || 'Code.js');
      break;
      
    case 'template':
      console.log('Safe Callback Template:');
      console.log(surgeon.generateSafeCallback('yourServerFunction'));
      break;
      
    default:
      console.log(`
Callback-Surgeon - Fix async handler issues in Google Apps Script

Usage:
  node agents/callback-surgeon.js analyze [file]  - Analyze callbacks
  node agents/callback-surgeon.js analyze --fix   - Auto-fix issues
  node agents/callback-surgeon.js template        - Show safe template

Examples:
  node agents/callback-surgeon.js analyze Code.js
  node agents/callback-surgeon.js analyze Code.js --fix
  node agents/callback-surgeon.js template
      `);
  }
}

module.exports = CallbackSurgeon;