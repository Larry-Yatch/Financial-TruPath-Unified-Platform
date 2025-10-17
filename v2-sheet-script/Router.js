/**
 * Router Module - Handles application routing and navigation
 * Financial TruPath V2.0
 */

// ====== ENVIRONMENT CONFIGURATION ======
const ENV = {
  mode: 'development', // 'development' or 'production'
  version: '2.0.0',
  deploymentDate: new Date('2024-10-16')
};

// ====== ROUTING CONFIGURATION ======
const ROUTES = {
  login: 'login',
  dashboard: 'dashboard',
  tool: 'tool',
  report: 'report',
  admin: 'admin'
};

// ====== AVAILABLE TOOLS ======
const TOOLS_REGISTRY = {
  orientation: {
    id: 'orientation',
    name: 'Orientation Assessment',
    week: 1,
    handler: Tool1_Orientation,
    available: true,
    description: 'Comprehensive 25-field assessment for financial and mindset profiling'
  },
  'financial-clarity': {
    id: 'financial-clarity',
    name: 'Financial Clarity',
    week: 2,
    handler: null, // Tool2_FinancialClarity
    available: false,
    description: 'Deep dive into your financial situation and cash flow'
  },
  'control-fear': {
    id: 'control-fear',
    name: 'Control Fear Grounding',
    week: 3,
    handler: null,
    available: false,
    description: 'Identify and address psychological barriers to financial success'
  },
  'freedom-framework': {
    id: 'freedom-framework',
    name: 'Freedom Framework',
    week: 4,
    handler: null,
    available: false,
    description: 'Build your personal financial freedom roadmap'
  },
  'false-self-view': {
    id: 'false-self-view',
    name: 'False Self View',
    week: 5,
    handler: null,
    available: false,
    description: 'Discover your authentic relationship with money'
  },
  'retirement-blueprint': {
    id: 'retirement-blueprint',
    name: 'Retirement Blueprint',
    week: 6,
    handler: null,
    available: false,
    description: 'Design your retirement strategy and timeline'
  },
  'issues-showing-love': {
    id: 'issues-showing-love',
    name: 'Issues Showing Love',
    week: 7,
    handler: null,
    available: false,
    description: 'Understand how relationships impact your finances'
  },
  'investment-tool': {
    id: 'investment-tool',
    name: 'Investment Tool',
    week: 8,
    handler: null,
    available: false,
    description: 'Advanced investment planning and optimization'
  }
};

/**
 * Route handler for login page
 */
function handleLoginRoute() {
  try {
    const template = HtmlService.createTemplateFromFile('login');
    template.env = ENV;
    template.deploymentUrl = ScriptApp.getService().getUrl();
    
    // Check if login.html exists, otherwise create a simple login page
    try {
      return template.evaluate()
        .setTitle('Financial TruPath V2.0 - Login')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    } catch (e) {
      // Return inline login HTML if template doesn't exist
      return createInlineLoginPage();
    }
  } catch (error) {
    console.error('Login route error:', error);
    return createErrorPage('Failed to load login page');
  }
}

/**
 * Route handler for dashboard
 */
function handleDashboardRoute(clientId, sessionId) {
  // Verify session
  if (!verifySession(sessionId, clientId)) {
    return handleLoginRoute();
  }
  
  try {
    const template = HtmlService.createTemplateFromFile('dashboard');
    template.clientId = clientId;
    template.sessionId = sessionId;
    template.profile = DataHub.getUnifiedProfile(clientId);
    template.tools = TOOLS_REGISTRY;
    template.env = ENV;
    
    // Check if dashboard.html exists
    try {
      return template.evaluate()
        .setTitle('Financial TruPath V2.0 - Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    } catch (e) {
      // Return inline dashboard if template doesn't exist
      return createInlineDashboard(clientId, sessionId);
    }
  } catch (error) {
    console.error('Dashboard route error:', error);
    return createErrorPage('Failed to load dashboard');
  }
}

/**
 * Route handler for specific tool
 */
function handleToolRoute(toolId, clientId, sessionId) {
  // Verify session
  if (!verifySession(sessionId, clientId)) {
    return handleLoginRoute();
  }
  
  // Check if tool exists and is available
  const tool = TOOLS_REGISTRY[toolId];
  if (!tool || !tool.available) {
    return createErrorPage(`Tool "${toolId}" is not available yet`);
  }
  
  // For Tool 1, use existing index.html
  if (toolId === 'orientation') {
    const template = HtmlService.createTemplateFromFile('index');
    template.userId = clientId;
    template.sessionId = sessionId;
    template.currentWeek = getCurrentWeek();
    template.config = CONFIG;
    
    return template.evaluate()
      .setTitle(`Financial TruPath V2.0 - ${tool.name}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
  
  // Future tools will have their own templates
  return createErrorPage(`Tool "${tool.name}" interface coming soon`);
}

/**
 * Route handler for reports
 */
function handleReportRoute(clientId, sessionId) {
  // Verify session
  if (!verifySession(sessionId, clientId)) {
    return handleLoginRoute();
  }
  
  try {
    const profile = DataHub.getUnifiedProfile(clientId);
    
    // Generate inline reports page
    return createInlineReportsPage(clientId, sessionId, profile);
  } catch (error) {
    console.error('Report route error:', error);
    return createErrorPage('Failed to load reports');
  }
}

/**
 * Create inline login page
 */
function createInlineLoginPage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial TruPath V2.0 - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .login-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 450px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #AD9168;
      font-size: 32px;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .logo p {
      color: #666;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #333;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .btn-secondary {
      width: 100%;
      padding: 14px;
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      transition: all 0.3s;
    }
    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }
    .divider {
      text-align: center;
      margin: 25px 0;
      position: relative;
    }
    .divider:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
    .divider span {
      background: white;
      padding: 0 15px;
      color: #999;
      position: relative;
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }
    .alert.error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
    .alert.success {
      background: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }
    #loadingSpinner {
      display: none;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <h1>FINANCIAL TRUPATH</h1>
      <p>Version 2.0 - Unified Platform</p>
    </div>
    
    <div id="alertBox" class="alert"></div>
    
    <form id="loginForm" onsubmit="handleLogin(event); return false;">
      <div class="form-group">
        <label for="clientId">Client ID</label>
        <input type="text" id="clientId" name="clientId" required 
               placeholder="Enter your Client ID" autocomplete="off">
      </div>
      <button type="submit" class="btn-primary">Sign In with Client ID</button>
    </form>
    
    <div class="divider">
      <span>OR</span>
    </div>
    
    <button class="btn-secondary" onclick="showNameLookup()">
      Look Up by Name/Email
    </button>
    
    <div id="loadingSpinner">
      <div class="spinner"></div>
      <p style="margin-top: 10px; color: #666;">Verifying...</p>
    </div>
    
    <div id="nameLookupForm" style="display: none; margin-top: 20px;">
      <form onsubmit="handleNameLookup(event); return false;">
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
          Enter at least 2 fields to find your account
        </p>
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" autocomplete="given-name">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" autocomplete="family-name">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" autocomplete="email">
        </div>
        <button type="submit" class="btn-primary">Find My Account</button>
        <button type="button" class="btn-secondary" onclick="hideNameLookup()">
          Back to Client ID
        </button>
      </form>
    </div>
  </div>

  <script>
    function showAlert(message, type) {
      const alertBox = document.getElementById('alertBox');
      alertBox.textContent = message;
      alertBox.className = 'alert ' + type;
      alertBox.style.display = 'block';
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 5000);
    }
    
    function showLoading() {
      document.getElementById('loadingSpinner').style.display = 'block';
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('nameLookupForm').style.display = 'none';
    }
    
    function hideLoading() {
      document.getElementById('loadingSpinner').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
    }
    
    function showNameLookup() {
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('nameLookupForm').style.display = 'block';
    }
    
    function hideNameLookup() {
      document.getElementById('nameLookupForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
    }
    
    function handleLogin(event) {
      event.preventDefault();
      const clientId = document.getElementById('clientId').value.trim();
      
      if (!clientId) {
        showAlert('Please enter your Client ID', 'error');
        return;
      }
      
      showLoading();
      
      google.script.run
        .withSuccessHandler(handleAuthSuccess)
        .withFailureHandler(handleAuthFailure)
        .lookupClientById(clientId);
    }
    
    function handleNameLookup(event) {
      event.preventDefault();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      
      let providedCount = 0;
      if (firstName) providedCount++;
      if (lastName) providedCount++;
      if (email) providedCount++;
      
      if (providedCount < 2) {
        showAlert('Please provide at least 2 fields', 'error');
        return;
      }
      
      showLoading();
      
      google.script.run
        .withSuccessHandler(handleAuthSuccess)
        .withFailureHandler(handleAuthFailure)
        .lookupClientByDetails({firstName, lastName, email});
    }
    
    function handleAuthSuccess(result) {
      if (result.success) {
        // Create session
        google.script.run
          .withSuccessHandler(function(session) {
            // Redirect to dashboard
            const url = '${ScriptApp.getService().getUrl()}?route=dashboard' +
              '&client=' + encodeURIComponent(session.clientId) +
              '&session=' + encodeURIComponent(session.sessionId);
            window.location.href = url;
          })
          .withFailureHandler(handleAuthFailure)
          .createUserSession(result);
      } else {
        hideLoading();
        showAlert(result.error || 'Authentication failed', 'error');
      }
    }
    
    function handleAuthFailure(error) {
      hideLoading();
      showAlert('System error. Please try again.', 'error');
      console.error(error);
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create inline dashboard
 */
function createInlineDashboard(clientId, sessionId) {
  const profile = DataHub.getUnifiedProfile(clientId);
  const completedTools = profile.metadata.completedTools || [];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial TruPath V2.0 - Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .welcome-card {
      background: white;
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 25px;
    }
    .tool-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: all 0.3s;
      cursor: pointer;
      position: relative;
    }
    .tool-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .tool-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tool-card.disabled:hover {
      transform: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .tool-week {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #667eea;
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
    }
    .tool-card.completed .tool-week {
      background: #22c55e;
    }
    .tool-card h3 {
      color: #333;
      margin-bottom: 10px;
    }
    .tool-card p {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
    .progress-bar {
      background: #e0e0e0;
      height: 8px;
      border-radius: 4px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-fill {
      background: linear-gradient(90deg, #667eea, #764ba2);
      height: 100%;
      transition: width 0.5s;
    }
    .btn-logout {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-logout:hover {
      background: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="header">
    <button class="btn-logout" onclick="logout()">Logout</button>
    <h1>Financial TruPath Dashboard</h1>
    <p>Welcome back, ${profile.demographics?.firstName || 'User'}</p>
  </div>
  
  <div class="container">
    <div class="welcome-card">
      <h2>Your Progress</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(completedTools.length / 8) * 100}%"></div>
      </div>
      <p>${completedTools.length} of 8 tools completed</p>
      
      ${completedTools.length > 0 ? `
        <h3 style="margin-top: 20px;">Completed Tools:</h3>
        <ul style="margin-top: 10px; color: #666;">
          ${completedTools.map(tool => `<li>✅ ${tool}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    
    <h2>Available Tools</h2>
    <div class="tools-grid">
      ${Object.values(TOOLS_REGISTRY).map(tool => {
        const isCompleted = completedTools.includes(tool.id);
        const isAvailable = tool.available && getCurrentWeek() >= tool.week;
        const cardClass = isAvailable ? (isCompleted ? 'completed' : '') : 'disabled';
        const onclick = isAvailable && !isCompleted ? 
          `window.location.href='${ScriptApp.getService().getUrl()}?route=tool&tool=${tool.id}&client=${clientId}&session=${sessionId}'` : '';
        
        return `
          <div class="tool-card ${cardClass}" ${onclick ? `onclick="${onclick}"` : ''}>
            <div class="tool-week">Week ${tool.week}</div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            ${isCompleted ? '<p style="color: #22c55e; margin-top: 10px;">✅ Completed</p>' : ''}
            ${!isAvailable ? '<p style="color: #999; margin-top: 10px;">🔒 Coming Week ' + tool.week + '</p>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  </div>
  
  <script>
    function logout() {
      if (confirm('Are you sure you want to logout?')) {
        window.location.href = '${ScriptApp.getService().getUrl()}';
      }
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create inline reports page
 */
function createInlineReportsPage(clientId, sessionId, profile) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial TruPath V2.0 - Reports</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-bottom: 20px; }
    .report-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .btn {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-right: 10px;
    }
    .btn:hover {
      background: #5a67d8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Your Reports</h1>
    
    ${profile.demographics ? `
      <div class="report-section">
        <h3>Tool 1: Orientation Assessment</h3>
        <p>Completed: ${new Date(profile.demographics.timestamp).toLocaleDateString()}</p>
        <p>Profile Type: ${profile.demographics.profileType || 'N/A'}</p>
        <p>Financial Health Score: ${profile.demographics.financialHealthScore || 'N/A'}</p>
        <button class="btn" onclick="downloadOrientationReport()">Download PDF Report</button>
      </div>
    ` : '<p>No reports available yet. Complete assessments to generate reports.</p>'}
    
    <button class="btn" onclick="window.location.href='${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}&session=${sessionId}'">
      Back to Dashboard
    </button>
  </div>
  
  <script>
    function downloadOrientationReport() {
      alert('Downloading report...');
      // Add actual download logic here
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create error page
 */
function createErrorPage(errorMessage) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Financial TruPath V2.0</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .error-container {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #dc3545; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 1.5rem; }
    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background 0.3s;
    }
    a:hover { background: #5a67d8; }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>⚠️ Error</h1>
    <p>${errorMessage}</p>
    <a href="${ScriptApp.getService().getUrl()}">Return to Login</a>
  </div>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}