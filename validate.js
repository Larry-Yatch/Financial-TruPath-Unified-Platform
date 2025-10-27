#!/usr/bin/env node

/**
 * Quick validation runner
 * Run this after making changes to check your work
 */

const CodeValidator = require('./v2-sheet-script/agents/validator.js');

async function runValidation() {
  const validator = new CodeValidator();
  const result = await validator.validate();
  
  // Exit with appropriate code
  process.exit(result.passedValidation ? 0 : 1);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args[0] === 'watch') {
  // Run in watch mode
  console.log('Starting validation watcher...');
  require('child_process').spawn('node', ['./v2-sheet-script/agents/validator.js', 'watch'], {
    stdio: 'inherit'
  });
} else {
  // Single validation run
  runValidation();
}