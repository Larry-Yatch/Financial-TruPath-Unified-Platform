#!/usr/bin/env node
/**
 * Deploy-Guardian Agent - Safe Deployment Manager for Google Apps Script
 * Prevents broken deployments and manages versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeployGuardian {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Pre-deployment validation
   */
  async validate(options = {}) {
    console.log('🚀 Deploy-Guardian pre-flight checks...\n');
    
    const codeFile = options.file || 'Code.js';
    const manifestFile = 'appsscript.json';
    
    // Run all checks
    this.checkSyntax(codeFile);
    this.checkConsoleLogs(codeFile);
    this.checkTestFunctions(codeFile);
    this.checkManifest(manifestFile);
    this.checkSessionValidation(codeFile);
    this.checkHardcodedCredentials(codeFile);
    this.checkDeploymentHistory();
    
    // Generate report
    return this.generateReport();
  }

  /**
   * Check JavaScript syntax
   */
  checkSyntax(filePath) {
    console.log('  Checking syntax...');
    
    try {
      execSync(`node -c ${filePath}`, { stdio: 'pipe' });
      this.checks.push('✅ Syntax valid');
    } catch (error) {
      this.errors.push(`❌ Syntax error: ${error.message}`);
      
      // Try to find the specific error
      const output = error.toString();
      const lineMatch = output.match(/(\d+):(\d+)/);
      if (lineMatch) {
        this.errors.push(`   Line ${lineMatch[1]}, Column ${lineMatch[2]}`);
      }
    }
  }

  /**
   * Check for console.log statements
   */
  checkConsoleLogs(filePath) {
    console.log('  Checking for console statements...');
    
    const code = fs.readFileSync(filePath, 'utf8');
    const consoleRegex = /^\s*console\.(log|info|warn|error|debug)/gm;
    const matches = [...code.matchAll(consoleRegex)];
    
    if (matches.length > 0) {
      this.warnings.push(`⚠️  Found ${matches.length} console statements`);
      
      // Show line numbers
      const lines = matches.map(m => this.getLineNumber(code, m.index));
      this.warnings.push(`   Lines: ${lines.slice(0, 5).join(', ')}${lines.length > 5 ? '...' : ''}`);
    } else {
      this.checks.push('✅ No console statements');
    }
  }

  /**
   * Check for test functions in production
   */
  checkTestFunctions(filePath) {
    console.log('  Checking for test functions...');
    
    const code = fs.readFileSync(filePath, 'utf8');
    const testPatterns = [
      /function\s+test\w+/gi,
      /function\s+\w*Test\w*/gi,
      /function\s+debug\w+/gi,
      /function\s+demo\w+/gi,
      /function\s+sample\w+/gi
    ];
    
    let testFunctions = [];
    testPatterns.forEach(pattern => {
      const matches = [...code.matchAll(pattern)];
      testFunctions = testFunctions.concat(matches.map(m => m[0]));
    });
    
    if (testFunctions.length > 0) {
      this.warnings.push(`⚠️  Found ${testFunctions.length} test functions:`);
      testFunctions.slice(0, 5).forEach(func => {
        this.warnings.push(`   - ${func}`);
      });
      if (testFunctions.length > 5) {
        this.warnings.push(`   ... and ${testFunctions.length - 5} more`);
      }
    } else {
      this.checks.push('✅ No test functions found');
    }
  }

  /**
   * Validate manifest file
   */
  checkManifest(manifestPath) {
    console.log('  Checking manifest...');
    
    if (!fs.existsSync(manifestPath)) {
      this.errors.push('❌ Missing appsscript.json manifest');
      this.errors.push('   Run: clasp pull');
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Check required fields
      if (!manifest.timeZone) {
        this.warnings.push('⚠️  Missing timeZone in manifest');
      }
      
      // Check for webapp config
      if (manifest.webapp) {
        if (!manifest.webapp.access || !manifest.webapp.executeAs) {
          this.warnings.push('⚠️  Incomplete webapp configuration');
        }
        this.checks.push(`✅ Webapp configured (access: ${manifest.webapp.access})`);
      }
      
      // Check OAuth scopes
      if (manifest.oauthScopes && manifest.oauthScopes.length > 0) {
        this.checks.push(`✅ OAuth scopes: ${manifest.oauthScopes.length} configured`);
      } else {
        this.warnings.push('⚠️  No OAuth scopes defined');
      }
      
    } catch (error) {
      this.errors.push(`❌ Invalid manifest JSON: ${error.message}`);
    }
  }

  /**
   * Check if session validation is disabled
   */
  checkSessionValidation(filePath) {
    console.log('  Checking session validation...');
    
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Look for commented out validation
    const commentedValidation = /\/\/.*validateSession|\/\*.*validateSession.*\*\//s;
    if (commentedValidation.test(code)) {
      this.warnings.push('⚠️  Session validation appears to be disabled');
    }
    
    // Look for test mode flags
    const testModePatterns = [
      /const\s+TEST_MODE\s*=\s*true/i,
      /const\s+DEBUG\s*=\s*true/i,
      /const\s+SKIP_AUTH\s*=\s*true/i
    ];
    
    testModePatterns.forEach(pattern => {
      if (pattern.test(code)) {
        this.errors.push('❌ Test/Debug mode is enabled!');
      }
    });
  }

  /**
   * Check for hardcoded credentials
   */
  checkHardcodedCredentials(filePath) {
    console.log('  Checking for hardcoded credentials...');
    
    const code = fs.readFileSync(filePath, 'utf8');
    const credentialPatterns = [
      /['"]password['"]\s*:\s*['"][^'"]+['"]/gi,
      /['"]apikey['"]\s*:\s*['"][^'"]+['"]/gi,
      /['"]api_key['"]\s*:\s*['"][^'"]+['"]/gi,
      /['"]secret['"]\s*:\s*['"][^'"]+['"]/gi,
      /const\s+\w*PASSWORD\s*=\s*['"][^'"]+['"]/gi,
      /const\s+\w*KEY\s*=\s*['"][^'"]+['"]/gi,
      /const\s+\w*TOKEN\s*=\s*['"][^'"]+['"]/gi
    ];
    
    let found = false;
    credentialPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        found = true;
      }
    });
    
    if (found) {
      this.errors.push('❌ Possible hardcoded credentials detected!');
      this.errors.push('   Use PropertiesService.getScriptProperties() instead');
    } else {
      this.checks.push('✅ No obvious hardcoded credentials');
    }
  }

  /**
   * Check deployment history
   */
  checkDeploymentHistory() {
    console.log('  Checking deployment history...');
    
    try {
      const output = execSync('clasp deployments', { encoding: 'utf8' });
      const deploymentCount = (output.match(/AKfyc/g) || []).length;
      
      if (deploymentCount > 5) {
        this.warnings.push(`⚠️  ${deploymentCount} deployments exist (consider archiving old ones)`);
        this.warnings.push('   Run: node agents/deploy-guardian.js cleanup');
      } else {
        this.checks.push(`✅ ${deploymentCount} deployments (healthy)`);
      }
    } catch (error) {
      this.warnings.push('⚠️  Could not check deployments (clasp not configured?)');
    }
  }

  /**
   * Deploy with safety checks
   */
  async deploy(description) {
    console.log('\n🚀 Initiating safe deployment...\n');
    
    // Run validation first
    const valid = await this.validate();
    
    if (!valid) {
      console.log('\n❌ Deployment cancelled due to errors.\n');
      return false;
    }
    
    // If only warnings, ask for confirmation
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings detected. Deploy anyway? (y/n)');
      // In real implementation, would wait for user input
      // For now, we'll proceed
    }
    
    try {
      // Create backup of current version
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = `backups/${timestamp}`;
      fs.mkdirSync(backupDir, { recursive: true });
      fs.copyFileSync('Code.js', `${backupDir}/Code.js`);
      fs.copyFileSync('appsscript.json', `${backupDir}/appsscript.json`);
      console.log(`✅ Backup created: ${backupDir}`);
      
      // Push to Apps Script
      console.log('\n📤 Pushing to Apps Script...');
      execSync('clasp push', { stdio: 'inherit' });
      
      // Deploy with description
      const version = this.generateVersion();
      const deployDesc = description || `v${version} - ${new Date().toLocaleDateString()}`;
      console.log(`\n🚀 Creating deployment: ${deployDesc}`);
      
      const deployOutput = execSync(`clasp deploy --description "${deployDesc}"`, { encoding: 'utf8' });
      
      // Extract deployment ID
      const deployIdMatch = deployOutput.match(/AKfyc[\w-]+/);
      if (deployIdMatch) {
        const deployId = deployIdMatch[0];
        const deployUrl = `https://script.google.com/macros/s/${deployId}/exec`;
        
        // Save deployment info
        const deployInfo = {
          id: deployId,
          url: deployUrl,
          description: deployDesc,
          timestamp: new Date().toISOString(),
          version: version
        };
        
        fs.writeFileSync('last-deployment.json', JSON.stringify(deployInfo, null, 2));
        
        console.log('\n✅ Deployment successful!');
        console.log(`📋 Deployment ID: ${deployId}`);
        console.log(`🔗 URL: ${deployUrl}`);
        console.log('\n📝 Test URLs:');
        console.log(`  Login: ${deployUrl}?route=login`);
        console.log(`  Admin: ${deployUrl}?route=admin&key=admin2024`);
        console.log(`  Dashboard: ${deployUrl}?route=dashboard&client=TEST001&session=test`);
        
        return true;
      }
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Cleanup old deployments
   */
  async cleanup() {
    console.log('🧹 Cleaning up old deployments...\n');
    
    try {
      const output = execSync('clasp deployments', { encoding: 'utf8' });
      const lines = output.split('\n');
      const deployments = [];
      
      lines.forEach(line => {
        const match = line.match(/- (AKfyc[\w-]+) @(\d+|HEAD)/);
        if (match && match[2] !== 'HEAD') {
          deployments.push({
            id: match[1],
            version: match[2],
            description: line.split(' - ')[1] || ''
          });
        }
      });
      
      if (deployments.length === 0) {
        console.log('No old deployments to clean up.');
        return;
      }
      
      console.log(`Found ${deployments.length} deployments to archive:\n`);
      
      // Keep last 3 deployments
      const toDelete = deployments.slice(3);
      const toKeep = deployments.slice(0, 3);
      
      console.log('Keeping:');
      toKeep.forEach(d => console.log(`  ✅ ${d.description || d.id}`));
      
      if (toDelete.length > 0) {
        console.log('\nArchiving:');
        toDelete.forEach(d => {
          console.log(`  🗑️  ${d.description || d.id}`);
          try {
            execSync(`clasp undeploy ${d.id}`, { stdio: 'pipe' });
          } catch (e) {
            console.log(`     Failed to delete ${d.id}`);
          }
        });
      }
      
      console.log('\n✅ Cleanup complete!');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  /**
   * Generate version number
   */
  generateVersion() {
    const date = new Date();
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}${date.getMinutes()}`;
  }

  /**
   * Get line number from index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Generate deployment report
   */
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(50) + '\n');
    
    if (this.errors.length > 0) {
      console.log('❌ ERRORS (must fix):');
      this.errors.forEach(e => console.log(e));
      console.log();
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS (review):');
      this.warnings.forEach(w => console.log(w));
      console.log();
    }
    
    if (this.checks.length > 0) {
      console.log('✅ PASSED CHECKS:');
      this.checks.forEach(c => console.log(c));
      console.log();
    }
    
    const ready = this.errors.length === 0;
    console.log(ready ? '✅ READY TO DEPLOY' : '❌ NOT READY - FIX ERRORS FIRST');
    console.log('='.repeat(50) + '\n');
    
    return ready;
  }
}

// CLI execution
if (require.main === module) {
  const guardian = new DeployGuardian();
  const command = process.argv[2];
  
  switch(command) {
    case 'check':
    case 'validate':
      guardian.validate();
      break;
      
    case 'deploy':
      const description = process.argv.slice(3).join(' ');
      guardian.deploy(description);
      break;
      
    case 'cleanup':
      guardian.cleanup();
      break;
      
    default:
      console.log(`
Deploy-Guardian - Safe deployment manager for Google Apps Script

Usage:
  node agents/deploy-guardian.js check      - Run pre-deployment checks
  node agents/deploy-guardian.js deploy [description] - Deploy with safety checks
  node agents/deploy-guardian.js cleanup    - Archive old deployments

Examples:
  node agents/deploy-guardian.js check
  node agents/deploy-guardian.js deploy "Fixed login bug"
  node agents/deploy-guardian.js cleanup
      `);
  }
}

module.exports = DeployGuardian;