/**
 * Debug Helper for Financial TruPath V2.0
 * Tools to help identify and fix issues quickly
 */

/**
 * Enable debug mode with enhanced logging
 */
const DEBUG = {
  enabled: false,
  logs: [],
  
  /**
   * Log debug message
   */
  log: function(message, data = null) {
    if (this.enabled) {
      const entry = {
        timestamp: new Date(),
        message: message,
        data: data
      };
      this.logs.push(entry);
      console.log('[DEBUG]', message, data || '');
    }
  },
  
  /**
   * Get all debug logs
   */
  getLogs: function() {
    return this.logs;
  },
  
  /**
   * Clear debug logs
   */
  clearLogs: function() {
    this.logs = [];
  },
  
  /**
   * Enable debug mode
   */
  enable: function() {
    this.enabled = true;
    console.log('Debug mode enabled');
  },
  
  /**
   * Disable debug mode
   */
  disable: function() {
    this.enabled = false;
    console.log('Debug mode disabled');
  }
};

/**
 * Check system health
 */
function checkSystemHealth() {
  const health = {
    status: 'healthy',
    issues: [],
    warnings: [],
    info: []
  };
  
  try {
    // Check spreadsheet access
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      health.status = 'critical';
      health.issues.push('Cannot access spreadsheet');
    } else {
      health.info.push('Spreadsheet access: OK');
    }
    
    // Check required sheets
    const requiredSheets = [
      CONFIG.SHEETS.TOOL1_ORIENTATION,
      CONFIG.SHEETS.STUDENTS
    ];
    
    requiredSheets.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        health.warnings.push(`Sheet "${sheetName}" not found`);
      } else {
        health.info.push(`Sheet "${sheetName}": OK`);
      }
    });
    
    // Check DataHub
    if (typeof DataHub === 'undefined') {
      health.status = 'critical';
      health.issues.push('DataHub not loaded');
    } else {
      health.info.push('DataHub: OK');
    }
    
    // Check Middleware
    if (typeof Middleware === 'undefined') {
      health.warnings.push('Middleware not loaded');
    } else {
      health.info.push('Middleware: OK');
    }
    
    // Check web app deployment
    try {
      const url = ScriptApp.getService().getUrl();
      if (url) {
        health.info.push(`Web App URL: ${url}`);
      } else {
        health.warnings.push('Web App not deployed');
      }
    } catch (e) {
      health.warnings.push('Cannot check deployment status');
    }
    
    // Set overall status
    if (health.issues.length > 0) {
      health.status = 'critical';
    } else if (health.warnings.length > 0) {
      health.status = 'warning';
    }
    
  } catch (error) {
    health.status = 'error';
    health.issues.push(`System check error: ${error.toString()}`);
  }
  
  return health;
}

/**
 * Display system health report
 */
function showSystemHealth() {
  const health = checkSystemHealth();
  
  let statusEmoji = '✅';
  let statusColor = '#28a745';
  
  if (health.status === 'warning') {
    statusEmoji = '⚠️';
    statusColor = '#ffc107';
  } else if (health.status === 'critical' || health.status === 'error') {
    statusEmoji = '❌';
    statusColor = '#dc3545';
  }
  
  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #333; }
      .status { 
        padding: 15px; 
        background: ${health.status === 'healthy' ? '#d4edda' : health.status === 'warning' ? '#fff3cd' : '#f8d7da'};
        border-radius: 5px;
        margin-bottom: 20px;
      }
      .section {
        margin: 15px 0;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
      }
      .issue { color: #dc3545; }
      .warning { color: #856404; }
      .info { color: #004085; }
      .item { margin: 5px 0; padding-left: 20px; }
    </style>
    
    <h2>🏥 System Health Check</h2>
    
    <div class="status">
      <strong>Status:</strong> ${statusEmoji} ${health.status.toUpperCase()}
    </div>
  `;
  
  if (health.issues.length > 0) {
    html += '<div class="section"><strong>❌ Critical Issues:</strong>';
    health.issues.forEach(issue => {
      html += `<div class="item issue">${issue}</div>`;
    });
    html += '</div>';
  }
  
  if (health.warnings.length > 0) {
    html += '<div class="section"><strong>⚠️ Warnings:</strong>';
    health.warnings.forEach(warning => {
      html += `<div class="item warning">${warning}</div>`;
    });
    html += '</div>';
  }
  
  if (health.info.length > 0) {
    html += '<div class="section"><strong>ℹ️ System Information:</strong>';
    health.info.forEach(info => {
      html += `<div class="item info">${info}</div>`;
    });
    html += '</div>';
  }
  
  // Add quick fixes
  if (health.issues.length > 0 || health.warnings.length > 0) {
    html += `
      <div class="section" style="background: #e7f3ff;">
        <strong>🔧 Quick Fixes:</strong>
        <div class="item">1. Run "Initialize Platform" from menu</div>
        <div class="item">2. Run "Create Data Sheets" from menu</div>
        <div class="item">3. Deploy web app if not deployed</div>
        <div class="item">4. Run "Validate Before Deploy" for full check</div>
      </div>
    `;
  }
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(450),
    'System Health'
  );
}

/**
 * Debug specific user data
 */
function debugUserData(userId) {
  const debugInfo = {
    userId: userId,
    timestamp: new Date(),
    data: {},
    errors: []
  };
  
  try {
    // Try to get user profile
    debugInfo.data.profile = DataHub.getUnifiedProfile(userId);
    
    // Check Tool1 data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
    
    if (tool1Sheet) {
      const data = tool1Sheet.getDataRange().getValues();
      const headers = data[0];
      const userIdCol = headers.indexOf('User ID');
      
      if (userIdCol >= 0) {
        for (let i = 1; i < data.length; i++) {
          if (data[i][userIdCol] === userId) {
            debugInfo.data.tool1Row = i + 1;
            debugInfo.data.tool1Data = {};
            headers.forEach((header, idx) => {
              debugInfo.data.tool1Data[header] = data[i][idx];
            });
            break;
          }
        }
      }
    }
    
  } catch (error) {
    debugInfo.errors.push(error.toString());
  }
  
  console.log('User Debug Info:', debugInfo);
  return debugInfo;
}

/**
 * Clear all test data
 */
function clearTestData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Clear Test Data',
    'This will remove all rows with User IDs starting with "TEST-". Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let totalDeleted = 0;
  
  // Clear from Tool1 sheet
  const tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  if (tool1Sheet) {
    const data = tool1Sheet.getDataRange().getValues();
    const userIdCol = data[0].indexOf('User ID');
    
    if (userIdCol >= 0) {
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][userIdCol] && data[i][userIdCol].toString().startsWith('TEST-')) {
          tool1Sheet.deleteRow(i + 1);
          totalDeleted++;
        }
      }
    }
  }
  
  // Clear from Students sheet
  const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
  if (studentsSheet) {
    const data = studentsSheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i > 0; i--) {
      if (data[i][0] && data[i][0].toString().startsWith('TEST-')) {
        studentsSheet.deleteRow(i + 1);
        totalDeleted++;
      }
    }
  }
  
  ui.alert(`✅ Cleared ${totalDeleted} test records`);
}

/**
 * Check for common issues
 */
function checkCommonIssues() {
  const issues = [];
  
  // Check 1: Template syntax errors
  try {
    const template = HtmlService.createTemplateFromFile('index');
    template.userId = 'test';
    template.currentWeek = 1;
    template.config = CONFIG;
    template.evaluate();
  } catch (error) {
    issues.push({
      type: 'Template Error',
      message: 'HTML template has syntax errors',
      error: error.toString(),
      fix: 'Check index.html for <?= ?> syntax issues'
    });
  }
  
  // Check 2: Missing global functions
  const requiredFunctions = ['doGet', 'saveUserData', 'getCurrentWeek'];
  requiredFunctions.forEach(fn => {
    if (typeof global[fn] !== 'function' && typeof this[fn] !== 'function') {
      issues.push({
        type: 'Missing Function',
        message: `Function ${fn} not found`,
        fix: `Ensure ${fn} is defined in Code.js`
      });
    }
  });
  
  // Check 3: DataHub field mapping
  const testData = {
    firstName: 'Test',
    financialSituation: '0'
  };
  
  try {
    const mapped = DataHub.mapFormDataToColumn('First Name', testData);
    if (mapped !== 'Test') {
      issues.push({
        type: 'Field Mapping',
        message: 'DataHub field mapping may be incorrect',
        fix: 'Check DataHub.mapFormDataToColumn function'
      });
    }
  } catch (error) {
    issues.push({
      type: 'DataHub Error',
      message: 'DataHub mapping function error',
      error: error.toString(),
      fix: 'Check DataHub.js for errors'
    });
  }
  
  return issues;
}

/**
 * Show common issues report
 */
function showCommonIssues() {
  const issues = checkCommonIssues();
  
  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #333; }
      .issue {
        margin: 15px 0;
        padding: 10px;
        background: #fff3cd;
        border-left: 3px solid #ffc107;
        border-radius: 3px;
      }
      .fix {
        margin-top: 5px;
        padding: 5px;
        background: #e7f3ff;
        border-radius: 3px;
        font-size: 12px;
      }
      .error {
        color: #dc3545;
        font-size: 11px;
        font-family: monospace;
      }
    </style>
    
    <h2>🔍 Common Issues Check</h2>
  `;
  
  if (issues.length === 0) {
    html += `
      <div style="padding: 15px; background: #d4edda; border-radius: 5px;">
        ✅ No common issues detected!
      </div>
    `;
  } else {
    html += `<p>Found ${issues.length} potential issue(s):</p>`;
    
    issues.forEach((issue, index) => {
      html += `
        <div class="issue">
          <strong>${index + 1}. ${issue.type}:</strong> ${issue.message}
          ${issue.error ? `<div class="error">${issue.error}</div>` : ''}
          <div class="fix">💡 <strong>Fix:</strong> ${issue.fix}</div>
        </div>
      `;
    });
  }
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(400),
    'Common Issues'
  );
}