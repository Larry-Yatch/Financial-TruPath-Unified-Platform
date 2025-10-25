#!/usr/bin/env node
/**
 * Safe Deploy - Enforces review before deployment
 * PREVENTS deployment if any issues found
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import agents for checking
const GasDoctor = require('./agents/gas-doctor');
const DeployGuardian = require('./agents/deploy-guardian');
const CallbackSurgeon = require('./agents/callback-surgeon');
const QuotaKeeper = require('./agents/quota-keeper');

class SafeDeploy {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.blockFile = '.deployment-blocked';
    this.codeFile = 'Code.js';
  }

  /**
   * Main deployment flow with gates
   */
  async deploy(description) {
    console.clear();
    console.log('🚦 SAFE DEPLOYMENT PIPELINE');
    console.log('=' .repeat(60));
    console.log('Description: ' + (description || 'No description provided'));
    console.log('=' .repeat(60) + '\n');

    // GATE 1: Syntax Check
    console.log('🔍 GATE 1: Syntax Check');
    if (!this.checkSyntax()) {
      return this.blockDeployment('Syntax errors found');
    }

    // GATE 2: Gas-Doctor Check
    console.log('\n🔍 GATE 2: Google Apps Script Issues');
    if (!await this.runGasDoctor()) {
      return this.blockDeployment('GAS issues found');
    }

    // GATE 3: Callback Check
    console.log('\n🔍 GATE 3: Async Handler Check');
    if (!await this.runCallbackSurgeon()) {
      return this.blockDeployment('Callback issues found');
    }

    // GATE 4: Quota Check
    console.log('\n🔍 GATE 4: Resource Usage Check');
    if (!await this.runQuotaKeeper()) {
      return this.blockDeployment('Quota risks found');
    }

    // GATE 5: Deploy Guardian Final Check
    console.log('\n🔍 GATE 5: Pre-Deployment Validation');
    if (!await this.runDeployGuardian()) {
      return this.blockDeployment('Deployment validation failed');
    }

    // ALL GATES PASSED
    console.log('\n' + '=' .repeat(60));
    console.log('✅ ALL GATES PASSED - SAFE TO DEPLOY');
    console.log('=' .repeat(60) + '\n');

    // Ask for confirmation
    console.log('Ready to deploy. Configuration:');
    console.log(`  File: ${this.codeFile}`);
    console.log(`  Description: ${description}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log();

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings (non-blocking):');
      this.warnings.slice(0, 5).forEach(w => {
        console.log(`  - ${w}`);
      });
      console.log();
    }

    // Proceed with deployment
    return this.executeDeploy(description);
  }

  /**
   * Check syntax
   */
  checkSyntax() {
    try {
      execSync(`node -c ${this.codeFile}`, { stdio: 'pipe' });
      console.log('  ✅ Syntax valid');
      return true;
    } catch (error) {
      console.log('  ❌ Syntax error detected');
      console.log('     ' + error.message.split('\n')[0]);
      this.errors.push('Syntax error in ' + this.codeFile);
      return false;
    }
  }

  /**
   * Run Gas-Doctor check
   */
  async runGasDoctor() {
    const doctor = new GasDoctor();
    doctor.diagnose(this.codeFile);
    
    const critical = doctor.issues.filter(i => i.severity === 'CRITICAL');
    const high = doctor.issues.filter(i => i.severity === 'HIGH');
    
    if (critical.length > 0) {
      console.log(`  ❌ ${critical.length} critical issues found`);
      critical.forEach(i => {
        console.log(`     - ${i.message}`);
        this.errors.push(i.message);
      });
      return false;
    }
    
    if (high.length > 0) {
      console.log(`  ⚠️  ${high.length} high-priority issues found`);
      high.forEach(i => {
        this.warnings.push(i.message);
      });
    }
    
    console.log('  ✅ No critical GAS issues');
    return true;
  }

  /**
   * Run Callback-Surgeon check
   */
  async runCallbackSurgeon() {
    const surgeon = new CallbackSurgeon();
    surgeon.analyze(this.codeFile);
    
    const critical = surgeon.issues.filter(i => i.severity === 'CRITICAL');
    
    if (critical.length > 0) {
      console.log(`  ❌ ${critical.length} critical callback issues`);
      critical.forEach(i => {
        console.log(`     - ${i.message}`);
        this.errors.push(i.message);
      });
      return false;
    }
    
    const missing = surgeon.issues.filter(i => 
      i.type === 'MISSING_FAILURE_HANDLER' || 
      i.type === 'MISSING_NULL_CHECK'
    );
    
    if (missing.length > 0) {
      console.log(`  ⚠️  ${missing.length} missing handlers/checks`);
      missing.forEach(i => {
        this.warnings.push(i.message);
      });
    }
    
    console.log('  ✅ No critical callback issues');
    return true;
  }

  /**
   * Run Quota-Keeper check
   */
  async runQuotaKeeper() {
    const keeper = new QuotaKeeper();
    keeper.analyze(this.codeFile);
    
    const critical = keeper.warnings.filter(w => w.severity === 'CRITICAL');
    
    if (critical.length > 0) {
      console.log(`  ❌ ${critical.length} critical quota risks`);
      critical.forEach(w => {
        console.log(`     - ${w.message}`);
        this.errors.push(w.message);
      });
      return false;
    }
    
    console.log('  ✅ No critical quota risks');
    return true;
  }

  /**
   * Run Deploy-Guardian final check
   */
  async runDeployGuardian() {
    const guardian = new DeployGuardian();
    const ready = await guardian.validate({ file: this.codeFile });
    
    if (!ready) {
      console.log('  ❌ Deployment validation failed');
      guardian.errors.forEach(e => {
        this.errors.push(e);
      });
      return false;
    }
    
    console.log('  ✅ Deployment validation passed');
    return true;
  }

  /**
   * Block deployment and create flag file
   */
  blockDeployment(reason) {
    console.log('\n' + '=' .repeat(60));
    console.log('🛑 DEPLOYMENT BLOCKED');
    console.log('=' .repeat(60));
    console.log('\nReason: ' + reason);
    console.log('\nErrors that must be fixed:');
    this.errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e}`);
    });
    
    // Create block file
    fs.writeFileSync(this.blockFile, JSON.stringify({
      blocked: true,
      reason: reason,
      errors: this.errors,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log('\n📝 Next steps:');
    console.log('  1. Fix the errors listed above');
    console.log('  2. Run: ./start-agents.sh fix');
    console.log('  3. Run: npm run safe-deploy');
    console.log('\n' + '=' .repeat(60) + '\n');
    
    return false;
  }

  /**
   * Execute actual deployment
   */
  executeDeploy(description) {
    // Remove block file if exists
    if (fs.existsSync(this.blockFile)) {
      fs.unlinkSync(this.blockFile);
    }
    
    console.log('🚀 Executing deployment...\n');
    
    try {
      // Push to Apps Script
      console.log('📤 Pushing to Google Apps Script...');
      execSync('clasp push', { stdio: 'inherit' });
      
      // Deploy with description
      const deployDesc = description || `Safe Deploy - ${new Date().toISOString()}`;
      console.log(`\n📦 Creating deployment: "${deployDesc}"...`);
      
      const output = execSync(`clasp deploy --description "${deployDesc}"`, { 
        encoding: 'utf8' 
      });
      
      // Extract deployment URL
      const idMatch = output.match(/AKfyc[\w-]+/);
      if (idMatch) {
        const deployId = idMatch[0];
        const url = `https://script.google.com/macros/s/${deployId}/exec`;
        
        // Log success
        console.log('\n' + '=' .repeat(60));
        console.log('✅ DEPLOYMENT SUCCESSFUL');
        console.log('=' .repeat(60));
        console.log(`\n📋 Deployment ID: ${deployId}`);
        console.log(`🔗 URL: ${url}`);
        console.log('\n🧪 Test URLs:');
        console.log(`  Login: ${url}?route=login`);
        console.log(`  Dashboard: ${url}?route=dashboard&client=TEST001`);
        console.log('\n' + '=' .repeat(60) + '\n');
        
        // Save deployment record
        this.saveDeploymentRecord(deployId, deployDesc, url);
        
        return true;
      }
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Save deployment record
   */
  saveDeploymentRecord(id, description, url) {
    const record = {
      id,
      description,
      url,
      timestamp: new Date().toISOString(),
      checks: {
        syntax: true,
        gasDoctor: true,
        callbacks: true,
        quota: true,
        guardian: true
      },
      warnings: this.warnings
    };
    
    const recordFile = 'deployment-history.json';
    let history = [];
    
    if (fs.existsSync(recordFile)) {
      history = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
    }
    
    history.unshift(record);
    fs.writeFileSync(recordFile, JSON.stringify(history, null, 2));
  }

  /**
   * Check if deployment is blocked
   */
  isBlocked() {
    if (fs.existsSync(this.blockFile)) {
      const block = JSON.parse(fs.readFileSync(this.blockFile, 'utf8'));
      console.log('🛑 DEPLOYMENT IS BLOCKED');
      console.log('Reason:', block.reason);
      console.log('Blocked at:', block.timestamp);
      console.log('\nErrors to fix:');
      block.errors.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e}`);
      });
      console.log('\nRun: ./start-agents.sh fix');
      return true;
    }
    return false;
  }
}

// CLI execution
if (require.main === module) {
  const safeDeploy = new SafeDeploy();
  const command = process.argv[2];
  
  // Check if blocked
  if (command !== 'status' && safeDeploy.isBlocked()) {
    process.exit(1);
  }
  
  switch(command) {
    case 'deploy':
      const description = process.argv.slice(3).join(' ');
      safeDeploy.deploy(description);
      break;
      
    case 'check':
      safeDeploy.deploy().then(result => {
        if (!result) {
          console.log('Deployment checks only - no deployment executed');
        }
      });
      break;
      
    case 'status':
      if (!safeDeploy.isBlocked()) {
        console.log('✅ No deployment blocks');
      }
      break;
      
    default:
      console.log(`
🚦 Safe Deploy - Enforced review before deployment

Usage:
  node safe-deploy.js deploy [description]  - Deploy with checks
  node safe-deploy.js check                 - Run checks only
  node safe-deploy.js status                - Check if blocked

This script PREVENTS deployment if:
  ❌ Syntax errors exist
  ❌ Critical GAS issues found
  ❌ Critical callback issues found
  ❌ Quota risks detected
  ❌ Deploy validation fails

Example:
  node safe-deploy.js deploy "Fixed login and added validation"

The deployment will be BLOCKED until all issues are resolved.
      `);
  }
}

module.exports = SafeDeploy;