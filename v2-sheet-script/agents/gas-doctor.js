#!/usr/bin/env node
/**
 * Gas-Doctor Agent - Google Apps Script Health Checker
 * Diagnoses and auto-fixes common GAS issues
 */

const fs = require('fs');
const path = require('path');

class GasDoctor {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  /**
   * Main diagnostic runner
   */
  async diagnose(filePath = 'Code.js') {
    console.log('🏥 Gas-Doctor starting diagnosis...\n');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const code = fs.readFileSync(filePath, 'utf8');
    
    // Run all diagnostics
    this.checkIframeNavigation(code);
    this.checkBackticks(code);
    this.checkDuplicateDeclarations(code);
    this.checkCallbackHandlers(code);
    this.checkConsoleLogsInProduction(code);
    this.checkPermissionScopes(filePath);
    this.checkCommonErrors(code);

    // Report findings
    this.reportFindings();

    // Apply auto-fixes if requested
    if (process.argv.includes('--fix')) {
      await this.applyFixes(filePath);
    }

    return this.issues.length === 0;
  }

  /**
   * Check for iframe navigation issues
   */
  checkIframeNavigation(code) {
    const regex = /window\.location\.(href|replace|assign)\s*=(?!.*window\.top)/g;
    const matches = [...code.matchAll(regex)];
    
    if (matches.length > 0) {
      this.issues.push({
        type: 'IFRAME_NAVIGATION',
        severity: 'HIGH',
        message: `Found ${matches.length} iframe navigation issues (use window.top.location instead)`,
        lines: this.getLineNumbers(code, matches),
        autoFix: true
      });
      
      this.fixes.push({
        pattern: /window\.location\.(href|replace|assign)/g,
        replacement: 'window.top.location.$1'
      });
    }
  }

  /**
   * Check for unbalanced backticks
   */
  checkBackticks(code) {
    const backticks = (code.match(/`/g) || []).length;
    
    if (backticks % 2 !== 0) {
      this.issues.push({
        type: 'UNBALANCED_BACKTICKS',
        severity: 'CRITICAL',
        message: `Unbalanced backticks detected (${backticks} found - should be even)`,
        hint: 'This will break ALL template literals after the unclosed backtick'
      });
    }

    // Check for escaped backticks in template literals
    const escapedInTemplates = /\${[^}]*\\`[^}]*}/g;
    if (escapedInTemplates.test(code)) {
      this.issues.push({
        type: 'ESCAPED_BACKTICK_IN_TEMPLATE',
        severity: 'HIGH',
        message: 'Found escaped backtick (\\`) inside template literal - this breaks parsing'
      });
    }
  }

  /**
   * Check for duplicate const/let/var declarations
   */
  checkDuplicateDeclarations(code) {
    const declarations = {};
    const regex = /\b(const|let|var)\s+(\w+)\s*=/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const [, keyword, varName] = match;
      if (declarations[varName]) {
        this.issues.push({
          type: 'DUPLICATE_DECLARATION',
          severity: 'HIGH',
          message: `Duplicate declaration: '${keyword} ${varName}' (previously declared as ${declarations[varName].keyword})`,
          line: this.getLineNumber(code, match.index)
        });
      } else {
        declarations[varName] = { keyword, index: match.index };
      }
    }
  }

  /**
   * Check for missing null checks in callbacks
   */
  checkCallbackHandlers(code) {
    const callbackRegex = /\.withSuccessHandler\s*\(\s*function\s*\([^)]*\)\s*{([^}]*)}/g;
    let match;
    let missingChecks = 0;

    while ((match = callbackRegex.exec(code)) !== null) {
      const handlerBody = match[1];
      
      if (!handlerBody.includes('if (!') && !handlerBody.includes('if(!')) {
        missingChecks++;
        
        this.issues.push({
          type: 'MISSING_NULL_CHECK',
          severity: 'MEDIUM',
          message: 'Success handler missing null check for result',
          line: this.getLineNumber(code, match.index),
          autoFix: true
        });
      }
    }

    // Check for missing failure handlers
    const scriptRunRegex = /google\.script\.run[^;]+;/g;
    const scriptRuns = code.match(scriptRunRegex) || [];
    
    scriptRuns.forEach(run => {
      if (!run.includes('withFailureHandler')) {
        this.issues.push({
          type: 'MISSING_FAILURE_HANDLER',
          severity: 'MEDIUM',
          message: 'google.script.run call missing withFailureHandler',
          snippet: run.substring(0, 50) + '...'
        });
      }
    });
  }

  /**
   * Check for console.logs in production
   */
  checkConsoleLogsInProduction(code) {
    const consoleRegex = /console\.(log|info|warn|error|debug)/g;
    const matches = [...code.matchAll(consoleRegex)];
    
    if (matches.length > 0) {
      this.issues.push({
        type: 'CONSOLE_LOGS',
        severity: 'LOW',
        message: `Found ${matches.length} console statements in production code`,
        lines: this.getLineNumbers(code, matches),
        autoFix: true
      });

      this.fixes.push({
        pattern: /^\s*console\.(log|info|warn|error|debug).*$/gm,
        replacement: '// $&'  // Comment out instead of removing
      });
    }
  }

  /**
   * Check permission scopes in manifest
   */
  checkPermissionScopes(codeFile) {
    const manifestPath = path.join(path.dirname(codeFile), 'appsscript.json');
    
    if (!fs.existsSync(manifestPath)) {
      this.issues.push({
        type: 'MISSING_MANIFEST',
        severity: 'MEDIUM',
        message: 'No appsscript.json manifest file found',
        hint: 'Run: clasp pull to get the manifest file'
      });
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const code = fs.readFileSync(codeFile, 'utf8');

    // Check for required scopes based on code usage
    const scopeChecks = [
      { pattern: /SpreadsheetApp/g, scope: 'spreadsheets' },
      { pattern: /DriveApp/g, scope: 'drive' },
      { pattern: /UrlFetchApp/g, scope: 'external_request' },
      { pattern: /GmailApp/g, scope: 'gmail' },
      { pattern: /Session\.getActiveUser/g, scope: 'userinfo.email' }
    ];

    scopeChecks.forEach(check => {
      if (check.pattern.test(code)) {
        const hasScope = manifest.oauthScopes?.some(s => s.includes(check.scope));
        if (!hasScope) {
          this.issues.push({
            type: 'MISSING_SCOPE',
            severity: 'HIGH',
            message: `Code uses ${check.pattern.source} but missing OAuth scope: ${check.scope}`,
            hint: 'Add to appsscript.json oauthScopes array'
          });
        }
      }
    });
  }

  /**
   * Check for common GAS errors
   */
  checkCommonErrors(code) {
    // Check for common null reference patterns
    if (/e\.parameter\.\w+/.test(code) && !/if\s*\(.*e\.parameter/.test(code)) {
      this.issues.push({
        type: 'UNSAFE_PARAMETER_ACCESS',
        severity: 'MEDIUM',
        message: 'Accessing e.parameter without null check',
        hint: 'Add: if (e.parameter && e.parameter.value)'
      });
    }

    // Check for synchronous includes in loops
    if (/for.*\{[^}]*include\([^}]*\}/s.test(code)) {
      this.issues.push({
        type: 'INCLUDE_IN_LOOP',
        severity: 'HIGH',
        message: 'Using include() inside a loop - causes performance issues',
        hint: 'Move include() outside the loop'
      });
    }

    // Check for proper HtmlService settings
    if (/HtmlService\.createHtmlOutput/.test(code) && 
        !/\.setSandboxMode|\.setXFrameOptionsMode/.test(code)) {
      this.issues.push({
        type: 'HTML_SERVICE_CONFIG',
        severity: 'LOW',
        message: 'HtmlService output missing sandbox/XFrame configuration'
      });
    }
  }

  /**
   * Get line numbers for matches
   */
  getLineNumbers(code, matches) {
    return matches.map(m => this.getLineNumber(code, m.index));
  }

  /**
   * Get line number from index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Report all findings
   */
  reportFindings() {
    if (this.issues.length === 0) {
      console.log('✅ No issues found! Code is healthy.\n');
      return;
    }

    console.log(`Found ${this.issues.length} issues:\n`);

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
          if (issue.line) console.log(`    Line: ${issue.line}`);
          if (issue.lines) console.log(`    Lines: ${issue.lines.join(', ')}`);
          if (issue.hint) console.log(`    💡 ${issue.hint}`);
          if (issue.autoFix) console.log(`    🔧 Auto-fixable`);
        });
        console.log();
      }
    });

    if (this.fixes.length > 0) {
      console.log('💡 Run with --fix flag to auto-fix some issues\n');
    }
  }

  /**
   * Apply automatic fixes
   */
  async applyFixes(filePath) {
    if (this.fixes.length === 0) {
      console.log('No auto-fixes available.\n');
      return;
    }

    console.log(`\n🔧 Applying ${this.fixes.length} auto-fixes...`);
    
    // Backup original
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  Backup created: ${backupPath}`);

    // Apply fixes
    let code = fs.readFileSync(filePath, 'utf8');
    
    this.fixes.forEach(fix => {
      code = code.replace(fix.pattern, fix.replacement);
    });

    fs.writeFileSync(filePath, code);
    console.log(`✅ Fixes applied to ${filePath}\n`);
  }

  /**
   * Watch mode for continuous monitoring
   */
  watch(filePath = 'Code.js') {
    console.log(`👁️  Watching ${filePath} for changes...\n`);
    
    let lastCheck = Date.now();
    
    fs.watchFile(filePath, { interval: 2000 }, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        console.clear();
        console.log(`🔄 File changed - running diagnosis...\n`);
        this.issues = [];
        this.fixes = [];
        this.diagnose(filePath);
      }
    });

    // Initial check
    this.diagnose(filePath);
  }
}

// CLI execution
if (require.main === module) {
  const doctor = new GasDoctor();
  const command = process.argv[2];

  if (command === 'watch') {
    doctor.watch(process.argv[3] || 'Code.js');
  } else {
    doctor.diagnose(process.argv[2] || 'Code.js');
  }
}

module.exports = GasDoctor;