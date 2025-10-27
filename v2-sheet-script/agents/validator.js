#!/usr/bin/env node

/**
 * Code Validator Agent
 * Reviews all changes made in a session for completeness, logic, and best practices
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CodeValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    this.changes = {};
  }

  /**
   * Main validation entry point
   */
  async validate(options = {}) {
    console.log('🔍 Starting code validation...\n');
    
    // Get all changes from git
    this.detectChanges();
    
    // Run validation checks
    await this.validateCompleteness();
    await this.validateLogic();
    await this.validateBestPractices();
    await this.validateConsistency();
    await this.validateSecurity();
    
    // Generate report
    this.generateReport();
    
    return {
      issues: this.issues,
      warnings: this.warnings,
      suggestions: this.suggestions,
      passedValidation: this.issues.length === 0
    };
  }

  /**
   * Detect all changed files
   */
  detectChanges() {
    try {
      // Get staged changes
      const staged = execSync('git diff --cached --name-status', { encoding: 'utf8' });
      
      // Get unstaged changes
      const unstaged = execSync('git diff --name-status', { encoding: 'utf8' });
      
      // Get untracked files
      const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' });
      
      // Parse changes
      this.parseChanges(staged, 'staged');
      this.parseChanges(unstaged, 'unstaged');
      
      // Handle untracked files
      untracked.split('\n').filter(f => f).forEach(file => {
        this.changes[file] = { status: 'new', staged: false };
      });
      
      console.log(`📊 Found ${Object.keys(this.changes).length} changed files\n`);
    } catch (error) {
      console.error('Error detecting changes:', error.message);
    }
  }

  parseChanges(diffOutput, type) {
    diffOutput.split('\n').filter(line => line).forEach(line => {
      const [status, ...fileParts] = line.split('\t');
      const file = fileParts.join('\t');
      
      if (file) {
        this.changes[file] = {
          status: this.getStatus(status),
          staged: type === 'staged'
        };
      }
    });
  }

  getStatus(statusCode) {
    const map = {
      'A': 'added',
      'M': 'modified',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied'
    };
    return map[statusCode] || 'unknown';
  }

  /**
   * Validate completeness of changes
   */
  async validateCompleteness() {
    console.log('✅ Checking completeness...');
    
    for (const [file, info] of Object.entries(this.changes)) {
      if (info.status === 'deleted') continue;
      
      const ext = path.extname(file);
      
      // Check for incomplete TODOs
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for TODOs or FIXMEs
        const todoMatches = content.match(/TODO|FIXME|XXX|HACK/gi) || [];
        if (todoMatches.length > 0) {
          this.warnings.push({
            file,
            type: 'incomplete',
            message: `Found ${todoMatches.length} TODO/FIXME markers`,
            line: this.findLineNumber(content, todoMatches[0])
          });
        }
        
        // Check for console.log statements
        if (ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx') {
          const logMatches = content.match(/console\.(log|error|warn|debug)/g) || [];
          if (logMatches.length > 0) {
            this.warnings.push({
              file,
              type: 'debug-code',
              message: `Found ${logMatches.length} console statements`,
              line: this.findLineNumber(content, logMatches[0])
            });
          }
        }
        
        // Check for incomplete function implementations
        const emptyFunctions = content.match(/{\s*\/\/\s*$|\{\s*\}/gm) || [];
        if (emptyFunctions.length > 0) {
          this.issues.push({
            file,
            type: 'incomplete-implementation',
            message: 'Found empty function bodies',
            severity: 'high'
          });
        }
      }
    }
  }

  /**
   * Validate logic and correctness
   */
  async validateLogic() {
    console.log('🧠 Checking logic...');
    
    for (const [file, info] of Object.entries(this.changes)) {
      if (info.status === 'deleted') continue;
      
      const ext = path.extname(file);
      
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      
      // JavaScript/TypeScript specific checks
      if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        // Check for unreachable code
        const unreachablePatterns = [
          /return[\s\S]*?return/g,  // Multiple returns
          /throw[\s\S]*?[^}\s]/g,    // Code after throw
        ];
        
        for (const pattern of unreachablePatterns) {
          const matches = content.match(pattern) || [];
          if (matches.length > 0) {
            this.issues.push({
              file,
              type: 'unreachable-code',
              message: 'Possible unreachable code detected',
              severity: 'medium'
            });
          }
        }
        
        // Check for infinite loops
        const infiniteLoopPattern = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/g;
        const infiniteLoops = content.match(infiniteLoopPattern) || [];
        if (infiniteLoops.length > 0) {
          this.warnings.push({
            file,
            type: 'potential-infinite-loop',
            message: 'Potential infinite loop detected'
          });
        }
        
        // Check for proper error handling
        const tryBlocks = content.match(/try\s*{/g) || [];
        const catchBlocks = content.match(/catch\s*\(/g) || [];
        if (tryBlocks.length !== catchBlocks.length) {
          this.issues.push({
            file,
            type: 'incomplete-error-handling',
            message: 'Mismatched try-catch blocks',
            severity: 'high'
          });
        }
      }
    }
  }

  /**
   * Validate best practices
   */
  async validateBestPractices() {
    console.log('📚 Checking best practices...');
    
    for (const [file, info] of Object.entries(this.changes)) {
      if (info.status === 'deleted' || !fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file);
      
      if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        // Check variable naming
        const poorNames = content.match(/\b(var|let|const)\s+(x|y|z|a|b|c|d|temp|tmp|data)\b/g) || [];
        if (poorNames.length > 0) {
          this.suggestions.push({
            file,
            type: 'naming',
            message: 'Consider using more descriptive variable names',
            examples: poorNames.slice(0, 3)
          });
        }
        
        // Check function length
        const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g) || [];
        functionMatches.forEach(funcStart => {
          const funcName = funcStart.match(/\b(\w+)\s*[=(]/);
          if (funcName && funcName[1]) {
            const lines = content.split('\n').length;
            if (lines > 100) {
              this.suggestions.push({
                file,
                type: 'complexity',
                message: `Function ${funcName[1]} might be too long (${lines} lines). Consider breaking it down.`
              });
            }
          }
        });
        
        // Check for duplicate code patterns
        const codeBlocks = content.match(/{[^{}]*}/g) || [];
        const duplicates = this.findDuplicates(codeBlocks);
        if (duplicates.length > 0) {
          this.suggestions.push({
            file,
            type: 'duplication',
            message: 'Found potential duplicate code blocks. Consider refactoring.'
          });
        }
      }
    }
  }

  /**
   * Validate consistency across changes
   */
  async validateConsistency() {
    console.log('🔄 Checking consistency...');
    
    const allImports = new Map();
    const allExports = new Map();
    
    for (const [file, info] of Object.entries(this.changes)) {
      if (info.status === 'deleted' || !fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file);
      
      if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        // Track imports
        const imports = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
        imports.forEach(imp => {
          const module = imp.match(/from\s+['"]([^'"]+)['"]/);
          if (module && module[1]) {
            if (!allImports.has(module[1])) {
              allImports.set(module[1], []);
            }
            allImports.get(module[1]).push(file);
          }
        });
        
        // Track exports
        const exports = content.match(/export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g) || [];
        exports.forEach(exp => {
          const name = exp.match(/\b(\w+)$/);
          if (name && name[1]) {
            allExports.set(name[1], file);
          }
        });
      }
    }
    
    // Check for broken imports
    for (const [module, files] of allImports.entries()) {
      if (module.startsWith('.')) {
        // Local import - check if file exists
        files.forEach(importingFile => {
          const resolvedPath = path.resolve(path.dirname(importingFile), module);
          const possiblePaths = [
            resolvedPath,
            resolvedPath + '.js',
            resolvedPath + '.ts',
            resolvedPath + '.jsx',
            resolvedPath + '.tsx',
            path.join(resolvedPath, 'index.js'),
            path.join(resolvedPath, 'index.ts')
          ];
          
          const exists = possiblePaths.some(p => fs.existsSync(p));
          if (!exists) {
            this.issues.push({
              file: importingFile,
              type: 'broken-import',
              message: `Import '${module}' cannot be resolved`,
              severity: 'high'
            });
          }
        });
      }
    }
  }

  /**
   * Validate security concerns
   */
  async validateSecurity() {
    console.log('🔒 Checking security...');
    
    const sensitivePatterns = [
      { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, type: 'api-key' },
      { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, type: 'password' },
      { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, type: 'secret' },
      { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, type: 'token' },
      { pattern: /eval\s*\(/g, type: 'eval-usage' },
      { pattern: /innerHTML\s*=/g, type: 'innerHTML' }
    ];
    
    for (const [file, info] of Object.entries(this.changes)) {
      if (info.status === 'deleted' || !fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      
      for (const { pattern, type } of sensitivePatterns) {
        const matches = content.match(pattern) || [];
        if (matches.length > 0) {
          this.issues.push({
            file,
            type: 'security',
            message: `Potential security issue: ${type}`,
            severity: 'critical',
            occurrences: matches.length
          });
        }
      }
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`   Files changed: ${Object.keys(this.changes).length}`);
    console.log(`   Critical issues: ${this.issues.filter(i => i.severity === 'critical').length}`);
    console.log(`   Issues: ${this.issues.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Suggestions: ${this.suggestions.length}\n`);
    
    // Critical issues
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Must Fix):');
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.file}`);
        console.log(`      ${issue.message}`);
      });
      console.log('');
    }
    
    // Other issues
    const otherIssues = this.issues.filter(i => i.severity !== 'critical');
    if (otherIssues.length > 0) {
      console.log('⚠️  ISSUES:');
      otherIssues.forEach(issue => {
        console.log(`   ⚠️  ${issue.file}`);
        console.log(`      ${issue.message}`);
      });
      console.log('');
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚡ WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`   ⚡ ${warning.file}`);
        console.log(`      ${warning.message}`);
      });
      console.log('');
    }
    
    // Suggestions
    if (this.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS:');
      this.suggestions.forEach(suggestion => {
        console.log(`   💡 ${suggestion.file}`);
        console.log(`      ${suggestion.message}`);
      });
      console.log('');
    }
    
    // Final verdict
    console.log('='.repeat(60));
    if (this.issues.length === 0) {
      console.log('✅ ALL CHECKS PASSED! Code looks good.');
    } else if (criticalIssues.length > 0) {
      console.log('❌ VALIDATION FAILED: Critical issues must be fixed.');
    } else {
      console.log('⚠️  VALIDATION PASSED WITH WARNINGS: Review issues above.');
    }
    console.log('='.repeat(60) + '\n');
    
    // Save report to file
    this.saveReport();
  }

  /**
   * Save report to file
   */
  saveReport() {
    const reportDir = path.join(__dirname, '../validation-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `validation-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      changes: this.changes,
      issues: this.issues,
      warnings: this.warnings,
      suggestions: this.suggestions,
      summary: {
        filesChanged: Object.keys(this.changes).length,
        criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
        totalIssues: this.issues.length,
        totalWarnings: this.warnings.length,
        totalSuggestions: this.suggestions.length,
        passed: this.issues.length === 0
      }
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📁 Report saved to: ${reportFile}\n`);
  }

  /**
   * Helper: Find line number of text
   */
  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return null;
  }

  /**
   * Helper: Find duplicate blocks
   */
  findDuplicates(blocks) {
    const seen = new Set();
    const duplicates = [];
    
    blocks.forEach(block => {
      const normalized = block.replace(/\s+/g, ' ').trim();
      if (normalized.length > 50) {  // Only check substantial blocks
        if (seen.has(normalized)) {
          duplicates.push(normalized);
        }
        seen.add(normalized);
      }
    });
    
    return duplicates;
  }
}

// CLI interface
if (require.main === module) {
  const validator = new CodeValidator();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'watch') {
    // Watch mode - run validation on file changes
    console.log('👁️  Watching for changes...\n');
    
    const chokidar = require('chokidar');
    const watcher = chokidar.watch('.', {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });
    
    let timeout;
    watcher.on('all', (event, path) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(`\n🔄 Change detected in ${path}. Running validation...`);
        validator.validate();
      }, 1000);
    });
  } else {
    // Single run
    validator.validate().then(result => {
      process.exit(result.passedValidation ? 0 : 1);
    });
  }
}

module.exports = CodeValidator;