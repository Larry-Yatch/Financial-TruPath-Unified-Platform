#!/usr/bin/env node

/**
 * Quick validation runner
 * Run this after making changes to check your work
 */

const CodeValidator = require('./v2-sheet-script/agents/validator.js');
const { spawn } = require('child_process');

async function runValidation() {
  try {
    const validator = new CodeValidator();
    const result = await validator.validate();
    process.exit(result.passedValidation ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

function runWatchMode() {
  console.log('Starting validation watcher...');
  const watcher = spawn('node', ['./v2-sheet-script/agents/validator.js', 'watch'], {
    stdio: 'inherit'
  });
  
  watcher.on('error', (error) => {
    console.error('❌ Watcher failed:', error.message);
    process.exit(1);
  });
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'watch') {
  runWatchMode();
} else if (command === 'help' || command === '-h') {
  console.log(`
Validation Runner

Usage: node validate.js [command]

Commands:
  (none)  - Run validation once
  watch   - Run validation in watch mode
  help    - Show this help message
  `);
} else {
  runValidation();
}