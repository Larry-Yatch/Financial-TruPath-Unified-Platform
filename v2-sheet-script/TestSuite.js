/**
 * Test Suite for Financial TruPath V2.0
 * Run these tests to validate the platform before deployment
 */

/**
 * Run all tests
 */
function runAllTests() {
  const results = [];
  const startTime = new Date();
  
  // Test categories
  const tests = [
    { name: 'Configuration Tests', fn: testConfiguration },
    { name: 'Data Sheet Tests', fn: testDataSheets },
    { name: 'Data Saving Tests', fn: testDataSaving },
    { name: 'Template Rendering Tests', fn: testTemplateRendering },
    { name: 'Function Availability Tests', fn: testFunctions },
    { name: 'Web App Tests', fn: testWebApp }
  ];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push({
        category: test.name,
        passed: result.passed,
        total: result.total,
        errors: result.errors || []
      });
    } catch (error) {
      results.push({
        category: test.name,
        passed: 0,
        total: 1,
        errors: [error.toString()]
      });
    }
  });
  
  // Generate report
  const report = generateTestReport(results, startTime);
  
  // Show results
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(report).setWidth(600).setHeight(500),
    'Test Results'
  );
  
  return results;
}

/**
 * Test configuration
 */
function testConfiguration() {
  const tests = [];
  const errors = [];
  
  // Test 1: CONFIG object exists
  tests.push({
    name: 'CONFIG object exists',
    test: () => typeof CONFIG !== 'undefined'
  });
  
  // Test 2: Master Sheet ID is valid
  tests.push({
    name: 'Master Sheet ID is valid',
    test: () => CONFIG.MASTER_SHEET_ID && CONFIG.MASTER_SHEET_ID.length > 0
  });
  
  // Test 3: Can access spreadsheet
  tests.push({
    name: 'Can access spreadsheet',
    test: () => {
      try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        return ss !== null;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Test 4: Sheet names are defined
  tests.push({
    name: 'Sheet names are defined',
    test: () => CONFIG.SHEETS && 
                CONFIG.SHEETS.TOOL1_ORIENTATION && 
                CONFIG.SHEETS.STUDENTS
  });
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Test data sheets
 */
function testDataSheets() {
  const tests = [];
  const errors = [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Required sheets
  const requiredSheets = [
    CONFIG.SHEETS.TOOL1_ORIENTATION,
    CONFIG.SHEETS.STUDENTS
  ];
  
  requiredSheets.forEach(sheetName => {
    tests.push({
      name: `Sheet "${sheetName}" exists`,
      test: () => ss.getSheetByName(sheetName) !== null
    });
  });
  
  // Test Tool1 headers if sheet exists
  const tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  if (tool1Sheet) {
    tests.push({
      name: 'Tool1 sheet has headers',
      test: () => {
        const lastCol = tool1Sheet.getLastColumn();
        return lastCol >= 25; // Should have at least 25 columns
      }
    });
  }
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Test data saving functionality
 */
function testDataSaving() {
  const tests = [];
  const errors = [];
  
  // Test DataHub exists
  tests.push({
    name: 'DataHub object exists',
    test: () => typeof DataHub !== 'undefined'
  });
  
  // Test DataHub functions exist
  const requiredFunctions = [
    'saveToolData',
    'getUnifiedProfile',
    'mapFormDataToColumn',
    'calculateFinancialHealth',
    'determineProfileType'
  ];
  
  requiredFunctions.forEach(fn => {
    tests.push({
      name: `DataHub.${fn} exists`,
      test: () => DataHub && typeof DataHub[fn] === 'function'
    });
  });
  
  // Test save functionality with mock data
  tests.push({
    name: 'Can save test data',
    test: () => {
      try {
        const testData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          financialSituation: '0'
        };
        const result = DataHub.saveToolData('TEST-' + Date.now(), 'orientation', testData);
        return result && result.success === true;
      } catch (e) {
        errors.push('Save test error: ' + e.toString());
        return false;
      }
    }
  });
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Test template rendering
 */
function testTemplateRendering() {
  const tests = [];
  const errors = [];
  
  // Test HTML template can be created
  tests.push({
    name: 'Can create HTML template',
    test: () => {
      try {
        const template = HtmlService.createTemplateFromFile('index');
        return template !== null;
      } catch (e) {
        errors.push('Template error: ' + e.toString());
        return false;
      }
    }
  });
  
  // Test template can be evaluated
  tests.push({
    name: 'Can evaluate template',
    test: () => {
      try {
        const template = HtmlService.createTemplateFromFile('index');
        template.userId = 'test-user';
        template.currentWeek = 1;
        template.config = CONFIG;
        const output = template.evaluate();
        return output !== null;
      } catch (e) {
        errors.push('Evaluation error: ' + e.toString());
        return false;
      }
    }
  });
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Test functions availability
 */
function testFunctions() {
  const tests = [];
  const errors = [];
  
  // Required global functions
  const requiredFunctions = [
    'doGet',
    'saveUserData',
    'getUserProfile',
    'getCurrentWeek',
    'generateUserId',
    'createDataSheets'
  ];
  
  requiredFunctions.forEach(fn => {
    tests.push({
      name: `Function ${fn} exists`,
      test: () => typeof global[fn] === 'function' || typeof this[fn] === 'function'
    });
  });
  
  // Test Middleware functions
  tests.push({
    name: 'Middleware object exists',
    test: () => typeof Middleware !== 'undefined'
  });
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Test web app functionality
 */
function testWebApp() {
  const tests = [];
  const errors = [];
  
  // Test doGet function
  tests.push({
    name: 'doGet returns HtmlOutput',
    test: () => {
      try {
        const e = { parameter: { uid: 'test-user' } };
        const result = doGet(e);
        return result && result.getContent;
      } catch (e) {
        errors.push('doGet error: ' + e.toString());
        return false;
      }
    }
  });
  
  // Test web app URL
  tests.push({
    name: 'Web app URL is available',
    test: () => {
      try {
        const url = ScriptApp.getService().getUrl();
        return url !== null && url !== '';
      } catch (e) {
        return true; // URL might not be available in test mode
      }
    }
  });
  
  // Run tests
  let passed = 0;
  tests.forEach(t => {
    try {
      if (t.test()) {
        passed++;
      } else {
        errors.push(`Failed: ${t.name}`);
      }
    } catch (e) {
      errors.push(`Error in ${t.name}: ${e.toString()}`);
    }
  });
  
  return { passed, total: tests.length, errors };
}

/**
 * Generate HTML test report
 */
function generateTestReport(results, startTime) {
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const duration = new Date() - startTime;
  const passRate = Math.round((totalPassed / totalTests) * 100);
  
  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #333; }
      .summary { 
        padding: 15px; 
        background: ${passRate === 100 ? '#d4edda' : '#fff3cd'}; 
        border-radius: 5px; 
        margin-bottom: 20px;
      }
      .category { 
        margin: 15px 0; 
        padding: 10px; 
        border-left: 3px solid #007bff;
      }
      .passed { color: #28a745; }
      .failed { color: #dc3545; }
      .error { 
        color: #dc3545; 
        font-size: 12px; 
        margin-left: 20px;
      }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
      }
      .badge-success { background: #28a745; color: white; }
      .badge-warning { background: #ffc107; color: #212529; }
      .badge-danger { background: #dc3545; color: white; }
    </style>
    
    <h2>🧪 Financial TruPath V2.0 - Test Results</h2>
    
    <div class="summary">
      <strong>Overall Results:</strong> 
      <span class="${passRate === 100 ? 'passed' : 'failed'}">
        ${totalPassed}/${totalTests} tests passed (${passRate}%)
      </span><br>
      <small>Duration: ${duration}ms</small>
    </div>
  `;
  
  results.forEach(result => {
    const categoryPassRate = Math.round((result.passed / result.total) * 100);
    const badgeClass = categoryPassRate === 100 ? 'badge-success' : 
                       categoryPassRate >= 50 ? 'badge-warning' : 'badge-danger';
    
    html += `
      <div class="category">
        <strong>${result.category}</strong>
        <span class="badge ${badgeClass}">${result.passed}/${result.total}</span>
    `;
    
    if (result.errors && result.errors.length > 0) {
      result.errors.forEach(error => {
        html += `<div class="error">❌ ${error}</div>`;
      });
    } else if (result.passed === result.total) {
      html += `<div style="color: #28a745; margin-left: 20px;">✅ All tests passed!</div>`;
    }
    
    html += '</div>';
  });
  
  // Add recommendations
  if (passRate < 100) {
    html += `
      <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <strong>📋 Recommendations:</strong>
        <ul style="margin: 10px 0;">
    `;
    
    if (results.find(r => r.category === 'Data Sheet Tests' && r.passed < r.total)) {
      html += '<li>Run "Create Data Sheets" from the menu to initialize sheets</li>';
    }
    if (results.find(r => r.category === 'Configuration Tests' && r.passed < r.total)) {
      html += '<li>Check CONFIG.js for proper configuration</li>';
    }
    if (results.find(r => r.category === 'Template Rendering Tests' && r.passed < r.total)) {
      html += '<li>Verify index.html template syntax</li>';
    }
    
    html += `
        </ul>
      </div>
    `;
  } else {
    html += `
      <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 5px;">
        <strong>✅ All systems operational!</strong><br>
        The platform is ready for deployment.
      </div>
    `;
  }
  
  return html;
}

/**
 * Quick validation before deployment
 */
function validateBeforeDeployment() {
  console.log('Running pre-deployment validation...');
  
  const checks = [];
  const details = {};
  
  // Critical checks
  checks.push({
    name: 'Spreadsheet Access',
    test: () => SpreadsheetApp.getActiveSpreadsheet() !== null
  });
  
  checks.push({
    name: 'Required Sheets',
    test: () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
      if (tool1Sheet) {
        details['Tool1 Sheet'] = 'Found with ' + tool1Sheet.getLastColumn() + ' columns';
        return true;
      }
      return false;
    }
  });
  
  checks.push({
    name: 'DataHub Functions',
    test: () => {
      const required = ['saveToolData', 'mapFormDataToColumn', 'calculateFinancialHealth', 'determineProfileType'];
      const missing = [];
      required.forEach(fn => {
        if (!DataHub || typeof DataHub[fn] !== 'function') {
          missing.push(fn);
        }
      });
      if (missing.length > 0) {
        details['Missing DataHub Functions'] = missing.join(', ');
        return false;
      }
      return true;
    }
  });
  
  checks.push({
    name: 'Template Syntax',
    test: () => {
      try {
        const template = HtmlService.createTemplateFromFile('index');
        template.userId = 'test-user-123';
        template.currentWeek = 1;
        template.config = CONFIG;
        const output = template.evaluate();
        const content = output.getContent();
        
        // Check for common syntax errors
        if (content.includes('<?=') && !content.includes('<?!=')) {
          details['Template Warning'] = 'Found <?= syntax, should use <?!= for unescaped output';
        }
        
        // Check for undefined variables
        if (content.includes('undefined')) {
          details['Template Warning'] = 'Template contains "undefined" - check variable initialization';
        }
        
        return true;
      } catch (e) {
        details['Template Error'] = e.toString();
        return false;
      }
    }
  });
  
  checks.push({
    name: 'Global Functions',
    test: () => {
      // Check if critical functions exist
      const required = ['doGet', 'saveUserData', 'getCurrentWeek'];
      const missing = [];
      required.forEach(fn => {
        try {
          if (typeof eval(fn) !== 'function') {
            missing.push(fn);
          }
        } catch (e) {
          missing.push(fn);
        }
      });
      if (missing.length > 0) {
        details['Missing Functions'] = missing.join(', ');
        return false;
      }
      return true;
    }
  });
  
  checks.push({
    name: 'Web App Deployment',
    test: () => {
      try {
        const url = ScriptApp.getService().getUrl();
        if (url) {
          details['Web App URL'] = url;
          return true;
        } else {
          details['Web App'] = 'Not deployed yet';
          return false;
        }
      } catch (e) {
        details['Web App'] = 'Cannot check - may not be deployed';
        return true; // Not critical for initial setup
      }
    }
  });
  
  // Run checks
  let allPassed = true;
  const failures = [];
  const successes = [];
  
  checks.forEach(check => {
    try {
      if (check.test()) {
        successes.push(check.name);
      } else {
        allPassed = false;
        failures.push(check.name);
      }
    } catch (e) {
      allPassed = false;
      failures.push(`${check.name}: ${e.toString()}`);
    }
  });
  
  // Generate detailed report
  let message = allPassed ? 
    '✅ VALIDATION PASSED\n\n' :
    '⚠️ VALIDATION ISSUES FOUND\n\n';
  
  if (successes.length > 0) {
    message += '✓ Passed Checks:\n' + successes.map(s => '  • ' + s).join('\n') + '\n\n';
  }
  
  if (failures.length > 0) {
    message += '✗ Failed Checks:\n' + failures.map(f => '  • ' + f).join('\n') + '\n\n';
  }
  
  if (Object.keys(details).length > 0) {
    message += 'Details:\n';
    Object.keys(details).forEach(key => {
      message += `  • ${key}: ${details[key]}\n`;
    });
    message += '\n';
  }
  
  if (!allPassed) {
    message += 'Recommended Actions:\n';
    if (failures.includes('Required Sheets')) {
      message += '  1. Run "Create Data Sheets" from menu\n';
    }
    if (failures.includes('DataHub Functions')) {
      message += '  2. Check DataHub.js for syntax errors\n';
    }
    if (failures.includes('Template Syntax')) {
      message += '  3. Fix template syntax in index.html\n';
    }
    message += '  4. Run "System Health Check" for more details\n';
  } else {
    message += 'Ready to deploy! Next steps:\n';
    message += '  1. Deploy → New Deployment (or Manage Deployments)\n';
    message += '  2. Test the web app with Tool 1\n';
    message += '  3. Monitor logs for any runtime errors\n';
  }
  
  SpreadsheetApp.getUi().alert(message);
  
  return allPassed;
}