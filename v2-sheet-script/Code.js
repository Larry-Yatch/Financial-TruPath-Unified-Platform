/**
 * Financial TruPath V2.0 - Main Entry Point
 * Routes requests to appropriate handlers based on URL parameters
 */

/**
 * Main entry point for web application
 * @param {Object} e - Event object with parameters
 * @returns {HtmlOutput} The appropriate HTML page
 */
function doGet(e) {
  try {
    // Get route from URL parameters
    const route = e.parameter.route || 'login';
    const clientId = e.parameter.client;
    const action = e.parameter.action; // view, edit, or new
    
    // Handle dashboard route
    if (route === 'dashboard') {
      if (!clientId) {
        return createLoginPage(); // Redirect to login if no client ID
      }
      return createDashboardPage(clientId);
    }
    
    // Handle tool route
    if (route === 'tool' || route === 'orientation') {
      const toolId = e.parameter.tool || 'orientation';
      
      // Handle action=view to show the report
      if (action === 'view' && clientId) {
        const completion = DataHub.checkToolCompletion(clientId, toolId);
        if (completion.completed && completion.data) {
          return createReportView(clientId, toolId, completion.data);
        } else {
          return createErrorPage('No completed assessment found for this user.');
        }
      }
      
      // Check if student has existing data ONLY when no action is specified
      if (clientId && !action) {
        const completion = DataHub.checkToolCompletion(clientId, toolId);
        if (completion.completed) {
          // Show welcome back screen for THIS specific tool
          return createWelcomeBackPage(clientId, toolId, completion);
        }
      }
      
      // Show Tool 1 (existing index.html)
      const template = HtmlService.createTemplateFromFile('index');
      template.userId = clientId || 'USER_' + Utilities.getUuid();
      template.sessionId = e.parameter.session || Utilities.getUuid();
      template.currentWeek = getCurrentWeek();
      template.config = CONFIG;
      template.action = action || 'new';
      template.existingData = action === 'edit' ? DataHub.checkToolCompletion(clientId, toolId).data : null;
      
      return template.evaluate()
        .setTitle('Financial TruPath V2.0 - Orientation Assessment')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    
    // Default: Show login page
    return createLoginPage();
    
  } catch (error) {
    console.error('Router error:', error);
    return createErrorPage(error.toString());
  }
}

/**
 * Create login page
 */
function createLoginPage() {
  const baseUrl = ScriptApp.getService().getUrl();
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruPath Financial V2.0 - Login</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
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
      font-family: 'Radley', serif;
      color: #ad9168;
      font-size: 28px;
      letter-spacing: 2px;
      margin-bottom: 10px;
      font-weight: 400;
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
    .test-info {
      margin-top: 20px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
    }
    #loadingSpinner {
      display: none;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <h1>TruPath Financial</h1>
      <p>Investment Planning Platform V2.0</p>
    </div>
    
    <div id="alertBox" class="alert"></div>
    
    <form id="loginForm" onsubmit="handleLogin(event); return false;">
      <div class="form-group">
        <label for="clientId">Enter Your Student ID</label>
        <input type="text" id="clientId" name="clientId" required 
               placeholder="Enter your Student ID" autocomplete="off">
      </div>
      <button type="submit" class="btn-primary">Sign In</button>
    </form>
    
    <div id="loadingSpinner">
      <p>Verifying...</p>
    </div>
    
    <div class="test-info">
      <strong>Test Mode:</strong><br>
      To test, click "Get Sample Client IDs" from the spreadsheet menu to get valid IDs.<br><br>
      Or go directly to Tool 1:<br>
      <a href="` + baseUrl + `?route=tool">Skip Login (Test)</a>
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
    
    function handleLogin(event) {
      event.preventDefault();
      const clientId = document.getElementById('clientId').value.trim();
      
      if (!clientId) {
        showAlert('Please enter your Student ID', 'error');
        return;
      }
      
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('loadingSpinner').style.display = 'block';
      
      // Try to authenticate
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            // Redirect to Dashboard (not directly to tool)
            window.location.href = '` + baseUrl + `?route=dashboard&client=' + 
              encodeURIComponent(result.clientId);
            showAlert('Login successful!', 'success');
          } else {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('loadingSpinner').style.display = 'none';
            showAlert(result.error || 'Invalid Student ID', 'error');
          }
        })
        .withFailureHandler(function(error) {
          document.getElementById('loginForm').style.display = 'block';
          document.getElementById('loadingSpinner').style.display = 'none';
          showAlert('System error. Please try again.', 'error');
          console.error(error);
        })
        .lookupClientById(clientId);
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create dashboard page showing all available tools
 */
function createDashboardPage(clientId) {
  const baseUrl = ScriptApp.getService().getUrl();
  
  // Get user's completion status for all tools
  const tools = [
    { id: 'orientation', name: 'Tool 1: Orientation Assessment', week: 1, available: true },
    { id: 'financial-clarity', name: 'Tool 2: Financial Clarity', week: 2, available: false },
    { id: 'control-fear', name: 'Tool 3: Control Fear Grounding', week: 3, available: false },
    { id: 'freedom-framework', name: 'Tool 4: Freedom Framework', week: 4, available: false },
    { id: 'false-self-view', name: 'Tool 5: False Self View', week: 5, available: false },
    { id: 'retirement-blueprint', name: 'Tool 6: Retirement Blueprint', week: 6, available: false },
    { id: 'issues-showing-love', name: 'Tool 7: Issues Showing Love', week: 7, available: false },
    { id: 'investment-tool', name: 'Tool 8: Investment Tool', week: 8, available: false }
  ];
  
  // Check completion status for each tool
  const toolStatuses = tools.map(tool => {
    const completion = DataHub.checkToolCompletion(clientId, tool.id);
    return {
      ...tool,
      completed: completion.completed,
      completedAt: completion.completedAt,
      version: completion.version
    };
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - TruPath Financial V2.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
      min-height: 100vh;
      padding: 20px;
    }
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }
    .header h1 {
      font-family: 'Radley', serif;
      color: #ad9168;
      font-size: 32px;
      letter-spacing: 2px;
      margin-bottom: 5px;
      font-weight: 400;
    }
    .header .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .header p {
      color: #94a3b8;
      font-size: 16px;
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .tool-card {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      transition: all 0.3s;
      position: relative;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .tool-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    }
    .tool-card.unavailable {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .tool-card.unavailable:hover {
      transform: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .week-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #667eea;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .week-badge.completed {
      background: #22c55e;
    }
    .tool-name {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .tool-status {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 15px;
    }
    .completed-indicator {
      color: #22c55e;
      font-weight: 600;
    }
    .locked-indicator {
      color: #999;
      font-style: italic;
    }
    .btn-logout {
      background: #dc3545;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      float: right;
    }
    .btn-logout:hover {
      background: #c82333;
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
  </style>
</head>
<body>
  <div class="dashboard-container">
    <div class="header">
      <button class="btn-logout" onclick="logout()">Logout</button>
      <h1>TruPath Financial</h1>
      <p class="subtitle">Investment Planning Platform V2.0</p>
      <p>Student ID: ` + clientId + `</p>
      
      <div class="progress-bar">
        <div class="progress-fill" style="width: ` + ((toolStatuses.filter(t => t.completed).length / 8) * 100) + `%"></div>
      </div>
      <p>` + toolStatuses.filter(t => t.completed).length + ` of 8 tools completed</p>
    </div>
    
    <div class="tools-grid">
      ` + toolStatuses.map(tool => {
        const isClickable = tool.available;
        const href = isClickable ? 
          baseUrl + '?route=tool&tool=' + tool.id + '&client=' + clientId : 
          '#';
        const className = 'tool-card' + (!tool.available ? ' unavailable' : '');
        const badgeClass = 'week-badge' + (tool.completed ? ' completed' : '');
        
        return '<a href="' + href + '" class="' + className + '" ' + 
          (!isClickable ? 'onclick="event.preventDefault();"' : '') + '>' +
          '<span class="' + badgeClass + '">Week ' + tool.week + '</span>' +
          '<div class="tool-name">' + tool.name + '</div>' +
          '<div class="tool-status">' +
            (tool.completed ? 
              '<span class="completed-indicator">✅ Completed' + 
              (tool.version > 1 ? ' (v' + tool.version + ')' : '') + '</span>' :
              (tool.available ? 
                '<span>📝 Ready to start</span>' : 
                '<span class="locked-indicator">🔒 Coming soon</span>')) +
          '</div>' +
        '</a>';
      }).join('') + `
    </div>
  </div>
  
  <script>
    function logout() {
      if (confirm('Are you sure you want to logout?')) {
        window.location.href = '` + baseUrl + `';
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
 * Create welcome back page for returning students
 */
function createWelcomeBackPage(clientId, toolId, completion) {
  const baseUrl = ScriptApp.getService().getUrl();
  const completedDate = new Date(completion.completedAt).toLocaleDateString();
  const lastModified = completion.lastModified ? new Date(completion.lastModified).toLocaleDateString() : null;
  const version = completion.version || 1;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Back - TruPath Financial V2.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
      background-attachment: fixed;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .welcome-container {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      width: 100%;
      max-width: 600px;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-family: 'Radley', serif;
      color: #ad9168;
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 400;
    }
    .status-box {
      background: rgba(173, 145, 104, 0.1);
      border-left: 4px solid #ad9168;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .status-box h3 {
      font-family: 'Radley', serif;
      color: #ad9168;
      margin-bottom: 10px;
    }
    .status-info {
      color: #94a3b8;
      line-height: 1.6;
    }
    .status-info strong {
      color: #ffffff;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .action-card {
      border: 2px solid rgba(173, 145, 104, 0.2);
      background: rgba(173, 145, 104, 0.05);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .action-card:hover {
      border-color: #ad9168;
      background: rgba(173, 145, 104, 0.1);
      box-shadow: 0 4px 12px rgba(173, 145, 104, 0.25);
      transform: translateY(-2px);
    }
    .action-card h4 {
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .action-card p {
      color: #94a3b8;
      font-size: 14px;
    }
    .icon {
      font-size: 24px;
    }
    .note {
      background: rgba(173, 145, 104, 0.1);
      border-left: 4px solid #ad9168;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 14px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="welcome-container">
    <div class="header">
      <h1>TruPath Financial</h1>
      <p style="color: #94a3b8;">Welcome Back - You've already completed this assessment</p>
    </div>
    
    <div class="status-box">
      <h3>Your Assessment Status</h3>
      <div class="status-info">
        <p><strong>Originally Completed:</strong> ` + completedDate + `</p>
        ` + (lastModified ? '<p><strong>Last Updated:</strong> ' + lastModified + '</p>' : '') + `
        <p><strong>Version:</strong> ` + version + `</p>
        <p><strong>Tool:</strong> Orientation Assessment</p>
      </div>
    </div>
    
    <div class="actions">
      <a href="` + baseUrl + `?route=tool&tool=` + toolId + `&client=` + clientId + `&action=view" class="action-card">
        <h4><span class="icon">📊</span> View Your Report</h4>
        <p>See your assessment results and download your PDF report</p>
      </a>
      
      <a href="` + baseUrl + `?route=tool&tool=` + toolId + `&client=` + clientId + `&action=edit" class="action-card">
        <h4><span class="icon">✏️</span> Update Your Answers</h4>
        <p>Modify your existing responses (creates version ` + (version + 1) + `)</p>
      </a>
      
      <a href="` + baseUrl + `?route=tool&tool=` + toolId + `&client=` + clientId + `&action=new" class="action-card">
        <h4><span class="icon">🔄</span> Start Fresh</h4>
        <p>Begin a completely new assessment (keeps previous as separate attempt)</p>
      </a>
    </div>
    
    <div class="note">
      <strong>Note:</strong> Updating your answers will preserve your original completion date while tracking the changes you make. Starting fresh creates a new assessment alongside your existing one.
    </div>
  </div>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create report view page for displaying assessment results
 */
function createReportView(clientId, toolId, data) {
  const baseUrl = ScriptApp.getService().getUrl();
  
  // Calculate insights from data
  const insights = Middleware.generateInsights(data);
  const scoreData = insights && insights.scoreData ? insights.scoreData : {};
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Report - TruPath Financial V2.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
      min-height: 100vh;
      padding: 20px;
    }
    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #AD9168;
      padding-bottom: 30px;
    }
    .header h1 {
      font-family: 'Radley', serif;
      color: #ad9168;
      font-size: 36px;
      letter-spacing: 2px;
      margin-bottom: 10px;
      font-weight: 400;
    }
    .header .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .score-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      text-align: center;
    }
    .score-value {
      font-size: 72px;
      font-weight: bold;
      margin: 10px 0;
    }
    .score-label {
      font-size: 18px;
      opacity: 0.9;
    }
    .data-section {
      margin: 30px 0;
    }
    .data-section h3 {
      color: #ad9168;
      font-family: 'Radley', serif;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(173, 145, 104, 0.2);
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .data-label {
      color: #94a3b8;
      font-weight: 500;
    }
    .data-value {
      color: #ffffff;
      text-align: right;
    }
    .actions {
      display: flex;
      gap: 15px;
      margin-top: 40px;
    }
    .btn {
      flex: 1;
      padding: 15px 25px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }
    .btn-secondary:hover {
      background: #d0d0d0;
    }
    .btn-success {
      background: #22c55e;
      color: white;
    }
    .btn-success:hover {
      background: #16a34a;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>TruPath Financial</h1>
      <p class="subtitle">Investment Planning Platform V2.0</p>
      <h2 style="color: #ffffff; font-family: 'Radley', serif;">Orientation Assessment Report</h2>
      <p style="color: #94a3b8;">Student ID: ` + clientId + `</p>
    </div>
    
    ` + (scoreData.totalScore ? `
    <div class="score-section">
      <div class="score-label">Financial Foundation Score</div>
      <div class="score-value">` + Math.round(scoreData.totalScore) + `%</div>
      <div class="score-label">` + (scoreData.totalScore >= 70 ? 'Strong Foundation' : scoreData.totalScore >= 40 ? 'Developing Foundation' : 'Needs Attention') + `</div>
    </div>
    ` : '') + `
    
    <div class="data-section">
      <h3>Personal Information</h3>
      <div class="data-row">
        <span class="data-label">Name:</span>
        <span class="data-value">` + (data.firstName || '') + ` ` + (data.lastName || '') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Email:</span>
        <span class="data-value">` + (data.email || 'Not provided') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Age:</span>
        <span class="data-value">` + (data.age || 'Not provided') + `</span>
      </div>
    </div>
    
    <div class="data-section">
      <h3>Financial Situation</h3>
      <div class="data-row">
        <span class="data-label">Income Level:</span>
        <span class="data-value">` + (data.income || 'Not provided') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Savings:</span>
        <span class="data-value">` + (data.savings || 'Not provided') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Debt:</span>
        <span class="data-value">` + (data.debt || 'Not provided') + `</span>
      </div>
    </div>
    
    <div class="data-section">
      <h3>Assessment Details</h3>
      <div class="data-row">
        <span class="data-label">Completed:</span>
        <span class="data-value">` + (data.originalTimestamp ? new Date(data.originalTimestamp).toLocaleDateString() : 'N/A') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Last Modified:</span>
        <span class="data-value">` + (data.lastModified ? new Date(data.lastModified).toLocaleDateString() : 'Never') + `</span>
      </div>
      <div class="data-row">
        <span class="data-label">Version:</span>
        <span class="data-value">` + (data.version || 1) + `</span>
      </div>
    </div>
    
    <div class="actions">
      <button class="btn btn-success" onclick="generatePDF()">📄 Download PDF Report</button>
      <a href="` + baseUrl + `?route=tool&client=` + clientId + `&action=edit" class="btn btn-primary">✏️ Edit Answers</a>
      <a href="` + baseUrl + `?route=dashboard&client=` + clientId + `" class="btn btn-secondary">🏠 Back to Dashboard</a>
    </div>
  </div>
  
  <script>
    function generatePDF() {
      google.script.run.withSuccessHandler(function(result) {
        if (result && result.url) {
          window.open(result.url, '_blank');
        } else {
          alert('Could not generate PDF. Please try again.');
        }
      }).generatePDFReport('` + clientId + `', '` + toolId + `');
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
  const html = '<html><body><h1>Error</h1><p>' + errorMessage + '</p></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle admin route (for testing/debugging)
 */
function handleAdminRoute(adminKey) {
  // Simple admin key check
  if (adminKey !== 'admin2024') { // Change this to a secure key
    return createErrorPage('Unauthorized');
  }
  
  const baseUrl = ScriptApp.getService().getUrl();
  
  // For now, show the test interface
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Financial TruPath V2.0 - Admin</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f7fa;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 10px 10px 0;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            border: none;
          }
          .btn:hover {
            background: #5a67d8;
          }
          .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔧 Admin Panel</h1>
          
          <div class="section">
            <h3>Test Functions</h3>
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).createDataSheets()">
              Create Data Sheets
            </button>
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).testDataSaving()">
              Test Data Saving
            </button>
            <button class="btn" onclick="testAuth()">
              Test Authentication
            </button>
          </div>
          
          <div class="section">
            <h3>Quick Links</h3>
            <a href="` + baseUrl + `" class="btn">Login Page</a>
            <a href="` + baseUrl + `?route=dashboard&client=TEST-001&session=test" class="btn">
              Test Dashboard
            </a>
          </div>
          
          <div id="result" class="section" style="display: none;">
            <h3>Result</h3>
            <pre id="resultContent"></pre>
          </div>
        </div>
        
        <script>
          function showResult(result) {
            document.getElementById('result').style.display = 'block';
            document.getElementById('resultContent').textContent = JSON.stringify(result, null, 2);
          }
          
          function testAuth() {
            const testId = prompt('Enter a test Client ID:');
            if (testId) {
              google.script.run
                .withSuccessHandler(showResult)
                .withFailureHandler(showResult)
                .lookupClientById(testId);
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
 * Include HTML files in templates
 * @param {string} filename - The file to include
 * @returns {string} The file content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
function generateSessionId() {
  return Utilities.getUuid();
}

/**
 * Get current course week
 * @returns {number} Current week number
 */
function getCurrentWeek() {
  const now = new Date();
  const courseStart = CONFIG.COURSE_START_DATE;
  
  // If course hasn't started yet, return week 0
  if (now < courseStart) {
    return 0;
  }
  
  // Calculate weeks since course start
  const diffTime = now - courseStart;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return weekNumber;
}

/**
 * Save user data to the master spreadsheet with versioning
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @param {Object} data - Data to save
 * @param {string} saveMode - 'new', 'update', or 'fresh'
 * @returns {Object} Success status
 */
function saveUserData(userId, toolId, data, saveMode = 'new') {
  try {
    // Set save options based on mode
    const options = {};
    if (saveMode === 'update') {
      options.updateExisting = true;
    } else if (saveMode === 'fresh') {
      options.createNew = true;
    }
    
    const result = DataHub.saveToolData(userId, toolId, data, options);
    
    // Log the save event
    logEvent('DATA_SAVED', {
      userId: userId,
      tool: toolId,
      saveMode: saveMode,
      timestamp: new Date()
    });
    
    return {
      success: true,
      message: 'Data saved successfully',
      insights: result.insights
    };
  } catch (error) {
    console.error('Error saving data:', error);
    logEvent('SAVE_ERROR', {
      userId: userId,
      tool: toolId,
      error: error.toString()
    });
    
    return {
      success: false,
      message: 'Failed to save data',
      error: error.toString()
    };
  }
}

/**
 * Load existing tool data for a user
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @returns {Object} Existing data or null
 */
function loadUserToolData(userId, toolId) {
  try {
    const completion = DataHub.checkToolCompletion(userId, toolId);
    return completion.completed ? completion.data : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @returns {Object} User profile data
 */
function getUserProfile(userId) {
  try {
    return DataHub.getUnifiedProfile(userId);
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Log system events
 * @param {string} eventType - Type of event
 * @param {Object} details - Event details
 */
function logEvent(eventType, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
      // Add headers
      logsSheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Event Type', 'User ID', 'Tool', 'Details']
      ]);
    }
    
    logsSheet.appendRow([
      new Date(),
      eventType,
      details.userId || '',
      details.tool || '',
      JSON.stringify(details)
    ]);
  } catch (error) {
    console.error('Error logging event:', error);
  }
}

/**
 * Get available tools based on current week
 * @returns {Array} Available tools
 */
function getAvailableTools() {
  const currentWeek = getCurrentWeek();
  const tools = [
    {id: 'orientation', name: 'Orientation-Demographics', week: 1},
    {id: 'financial-clarity', name: 'Financial Clarity', week: 2},
    {id: 'control-fear', name: 'Control Fear Grounding', week: 3},
    // Add more tools as needed
  ];
  
  return tools.map(tool => ({
    ...tool,
    available: currentWeek >= tool.week,
    completed: false // This should check actual completion status
  }));
}

// Menu moved to SimpleMenu.js to fix loading issues

/**
 * Import test authentication functions (make them available globally)
 * Note: In Google Apps Script, all .gs/.js files share the same global scope
 * but we need to ensure the functions are defined
 */

/**
 * Test authentication system - main test function
 */
function runAllAuthTests() {
  // Direct implementation - don't rely on external references
  return testAuthenticationSystem();
}

/**
 * Basic authentication system test
 */
function testAuthenticationSystem() {
  const results = {
    timestamp: new Date(),
    tests: {}
  };
  
  try {
    // First verify Authentication.js is loaded
    if (typeof getRosterSheet !== 'function') {
      throw new Error('Authentication.js not loaded. Please refresh the spreadsheet.');
    }
    
    // Test 1: Check if roster sheet is accessible
    const sheet = getRosterSheet();
    results.tests.rosterAccess = {
      success: !!sheet,
      sheetName: sheet ? sheet.getName() : 'Not found'
    };
    
    // Test 2: Check column headers if sheet exists
    if (sheet && sheet.getLastRow() > 0) {
      const headers = sheet.getRange(1, 1, 1, Math.min(10, sheet.getLastColumn())).getValues()[0];
      results.tests.headers = headers;
    }
    
    // Test 3: Try to get a sample Client ID
    if (sheet && sheet.getLastRow() > 1) {
      // Use column 7 (G) directly if ROSTER isn't available
      const clientIdColumn = typeof ROSTER !== 'undefined' ? ROSTER.COLUMNS.CLIENT_ID : 7;
      const sampleId = sheet.getRange(2, clientIdColumn).getValue();
      results.tests.sampleId = sampleId || 'No Client ID found';
      
      // Test 4: Try lookup if we have a sample
      if (sampleId) {
        results.tests.lookupTest = lookupClientById(sampleId);
      }
    }
    
    // Show results
    const ui = SpreadsheetApp.getUi();
    let summary = 'Authentication Test Results:\n\n';
    summary += `✓ Roster Access: ${results.tests.rosterAccess.success ? 'Connected' : 'Failed'}\n`;
    summary += `✓ Sheet Name: ${results.tests.rosterAccess.sheetName}\n`;
    if (results.tests.headers) {
      summary += `✓ Headers Found: ${results.tests.headers.length} columns\n`;
    }
    if (results.tests.sampleId) {
      summary += `✓ Sample Client ID: ${results.tests.sampleId}\n`;
    }
    if (results.tests.lookupTest) {
      summary += `✓ Lookup Test: ${results.tests.lookupTest.success ? 'Success' : 'Failed'}\n`;
      if (results.tests.lookupTest.success) {
        summary += `  - Name: ${results.tests.lookupTest.firstName} ${results.tests.lookupTest.lastName}\n`;
      }
    }
    
    ui.alert('Authentication System Test', summary, ui.ButtonSet.OK);
    return results;
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    return { error: error.toString() };
  }
}

/**
 * Test roster connection specifically
 */
function testRosterConnection() {
  try {
    const sheet = getRosterSheet();
    if (sheet) {
      const info = {
        name: sheet.getName(),
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn(),
        id: sheet.getSheetId()
      };
      
      SpreadsheetApp.getUi().alert(
        'Roster Connection Test',
        `✅ Successfully connected to roster!\n\nSheet: ${info.name}\nRows: ${info.rows}\nColumns: ${info.columns}\nGID: ${info.id}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      
      return { success: true, info: info };
    } else {
      throw new Error('Could not access roster sheet');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Roster Connection Failed',
      `❌ ${error.toString()}\n\nCheck Authentication.js configuration`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return { success: false, error: error.toString() };
  }
}

/**
 * Get sample Client IDs from roster
 */
function getSampleClientIds() {
  try {
    const sheet = getRosterSheet();
    if (!sheet || sheet.getLastRow() < 2) {
      SpreadsheetApp.getUi().alert('No Data', 'No client data found in roster', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get first 5 Client IDs
    const numRows = Math.min(5, sheet.getLastRow() - 1);
    // Use hardcoded columns if ROSTER isn't available: First=3(C), Last=4(D), ClientID=7(G)
    const firstNameCol = typeof ROSTER !== 'undefined' ? ROSTER.COLUMNS.FIRST_NAME : 3;
    const clientIdCol = typeof ROSTER !== 'undefined' ? ROSTER.COLUMNS.CLIENT_ID : 7;
    const columnsToGet = clientIdCol - firstNameCol + 1;
    
    const data = sheet.getRange(2, firstNameCol, numRows, columnsToGet).getValues();
    
    let message = 'Sample Client IDs from Roster:\n\n';
    for (let i = 0; i < data.length; i++) {
      const firstName = data[i][0];  // First column in range
      const lastName = data[i][1];   // Second column in range
      const clientId = data[i][clientIdCol - firstNameCol];  // Adjusted index
      if (clientId) {
        message += `${i + 1}. ${clientId} - ${firstName} ${lastName}\n`;
      }
    }
    
    SpreadsheetApp.getUi().alert('Sample Client IDs', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Test session creation
 */
function testSessionCreation() {
  try {
    const mockClient = {
      clientId: 'TEST-' + Math.floor(Math.random() * 1000),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    };
    
    const session = createUserSession(mockClient);
    const isValid = verifySession(session.sessionId, session.clientId);
    
    const message = `Session Creation Test:\n\n` +
      `Client ID: ${session.clientId}\n` +
      `Session ID: ${session.sessionId}\n` +
      `Created: ${session.loginTime}\n` +
      `Valid: ${isValid ? '✅ Yes' : '❌ No'}`;
    
    SpreadsheetApp.getUi().alert('Session Test', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Open Admin Panel in browser
 */
function openAdminPanel() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert('Web app not deployed yet. Please deploy first.');
    return;
  }
  
  const adminUrl = url + '?route=admin&key=admin2024';
  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3>Admin Panel URL</h3>
      <p>Click the link below to open the admin panel:</p>
      <p><a href="${adminUrl}" target="_blank" style="color: #667eea;">${adminUrl}</a></p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Note: You'll need the admin key to access this panel.<br>
        Current key: admin2024 (change this in production)
      </p>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(500).setHeight(250),
    'Open Admin Panel'
  );
}

/**
 * Initialize the platform (first-time setup)
 */
function initializePlatform() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Step 1: Create data sheets
    createDataSheets();
    
    // Step 2: Test roster connection
    const rosterTest = testRosterConnection();
    if (!rosterTest.success) {
      ui.alert('⚠️ Warning', 'Could not connect to roster. Please check Authentication.js configuration.', ui.ButtonSet.OK);
    }
    
    // Step 3: Get deployment URL
    const url = ScriptApp.getService().getUrl();
    const message = url ? 
      `✅ Platform initialized successfully!\n\nWeb App URL: ${url}\n\nNext steps:\n1. Test authentication with real Client IDs\n2. Deploy to production when ready` :
      `✅ Platform initialized!\n\nNext steps:\n1. Deploy the web app (Extensions → Apps Script → Deploy)\n2. Test authentication\n3. Share URL with clients`;
    
    ui.alert('Platform Initialized', message, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ Error', 'Failed to initialize platform: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Create all necessary data sheets with headers
 */
function createDataSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Tool1_Orientation sheet with all headers
  let tool1Sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  if (!tool1Sheet) {
    tool1Sheet = ss.insertSheet(CONFIG.SHEETS.TOOL1_ORIENTATION);
  }
  
  // Set comprehensive headers for Tool 1 (25 fields + metadata)
  const tool1Headers = DataHub.getHeadersForTool('orientation');
  if (tool1Sheet.getLastColumn() < tool1Headers.length) {
    tool1Sheet.getRange(1, 1, 1, tool1Headers.length).setValues([tool1Headers]);
    tool1Sheet.getRange(1, 1, 1, tool1Headers.length).setFontWeight('bold');
    tool1Sheet.setFrozenRows(1);
  }
  
  // Create Students sheet
  let studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet(CONFIG.SHEETS.STUDENTS);
    const studentHeaders = ['User ID', 'Created Date', 'Last Active', 'Tools Completed', 'Email', 'Name'];
    studentsSheet.getRange(1, 1, 1, studentHeaders.length).setValues([studentHeaders]);
    studentsSheet.getRange(1, 1, 1, studentHeaders.length).setFontWeight('bold');
    studentsSheet.setFrozenRows(1);
  }
  
  // Create Insights sheet
  let insightsSheet = ss.getSheetByName(CONFIG.SHEETS.INSIGHTS);
  if (!insightsSheet) {
    insightsSheet = ss.insertSheet(CONFIG.SHEETS.INSIGHTS);
    const insightHeaders = ['Timestamp', 'User ID', 'Tool', 'Insight Type', 'Priority', 'Message', 'Recommendation'];
    insightsSheet.getRange(1, 1, 1, insightHeaders.length).setValues([insightHeaders]);
    insightsSheet.getRange(1, 1, 1, insightHeaders.length).setFontWeight('bold');
    insightsSheet.setFrozenRows(1);
  }
  
  SpreadsheetApp.getUi().alert('✅ Data sheets created successfully!');
}

/**
 * View Tool 1 data
 */
function viewTool1Data() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL1_ORIENTATION);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Tool 1 sheet not found. Run "Create Data Sheets" first.');
    return;
  }
  
  ss.setActiveSheet(sheet);
}

/**
 * View system logs
 */
function viewLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Logs sheet not found. It will be created when the first log entry is saved.');
    return;
  }
  
  ss.setActiveSheet(sheet);
}

/**
 * Generate PDF report for user
 * @param {Object} reportData - The report data from the assessment
 * @returns {Object} Base64 encoded PDF
 */
function generatePDFReport(reportData) {
  try {
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { margin: 0.5in; }
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      background: #1e1933;
      color: white;
      padding: 30px;
      margin: -20px -20px 30px -20px;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #AD9168;
    }
    .subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-top: 10px;
    }
    .profile-section {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 30px;
    }
    .profile-emoji {
      font-size: 60px;
      margin-bottom: 15px;
    }
    .profile-type {
      font-size: 28px;
      color: #AD9168;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .scores-container {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
    }
    .score-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      width: 45%;
    }
    .score-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .good { color: #22c55e; }
    .warning { color: #f59e0b; }
    .critical { color: #dc3545; }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h3 {
      color: #AD9168;
      border-bottom: 2px solid #AD9168;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .homework-item {
      background: #fff;
      border-left: 4px solid;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .priority-high {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    .priority-medium {
      border-left-color: #f59e0b;
      background: #fffef5;
    }
    .priority-low {
      border-left-color: #22c55e;
      background: #f5fff5;
    }
    ul {
      list-style: none;
      padding-left: 0;
    }
    li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    li:before {
      content: "☐";
      position: absolute;
      left: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FINANCIAL TRUPATH</div>
    <div class="subtitle">Comprehensive Assessment Report</div>
    <div style="margin-top: 10px; font-size: 14px;">Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="profile-section">
    <div class="profile-emoji">${reportData.profile.emoji || '🎯'}</div>
    <div class="profile-type">${reportData.profile.type}</div>
    <p style="font-size: 16px; margin: 10px 0;">${reportData.profile.message}</p>
    <p style="color: #666; font-style: italic;">${reportData.profile.focus}</p>
  </div>

  <div class="scores-container">
    <div class="score-box">
      <div class="score-label">Financial Health Score</div>
      <div class="score-value ${reportData.healthScore >= 70 ? 'good' : reportData.healthScore >= 40 ? 'warning' : 'critical'}">
        ${reportData.healthScore}
      </div>
      <div style="color: #999; font-size: 12px;">out of 100</div>
    </div>
    <div class="score-box">
      <div class="score-label">Mindset Score</div>
      <div class="score-value ${reportData.mindsetScore >= 3 ? 'good' : reportData.mindsetScore >= 0 ? 'warning' : 'critical'}">
        ${reportData.mindsetScore > 0 ? '+' : ''}${reportData.mindsetScore}
      </div>
      <div style="color: #999; font-size: 12px;">Range: -9 to +9</div>
    </div>
  </div>

  <div class="section">
    <h3>📊 Key Insights</h3>
    ${reportData.healthScore < 40 ? '<p>⚠️ <strong>Immediate attention needed:</strong> Your financial health score indicates areas requiring urgent focus.</p>' : ''}
    ${reportData.mindsetScore < 0 ? '<p>🧠 <strong>Mindset barriers detected:</strong> Your beliefs about money may be limiting your progress.</p>' : ''}
    ${reportData.mindsetScore >= 6 ? '<p>✨ <strong>Exceptional mindset:</strong> Your positive outlook is a powerful asset for financial growth.</p>' : ''}
    ${reportData.healthScore >= 70 ? '<p>💪 <strong>Strong foundation:</strong> You have a solid financial base to build upon.</p>' : ''}
  </div>

  <div class="section">
    <h3>📚 Your Personalized Homework</h3>
    
    ${reportData.healthScore < 40 || (reportData.data && reportData.data.totalDebt === 'over_100k') ? `
    <div class="homework-item priority-high">
      <h4 style="color: #dc3545; margin-top: 0;">🔴 Priority 1: Debt & Cash Flow Review (Critical)</h4>
      <ul>
        <li>List all debts with balances, interest rates, and minimum payments</li>
        <li>Calculate total monthly debt payments</li>
        <li>Identify highest interest rate debts</li>
        <li>Review last 3 months of bank statements</li>
      </ul>
    </div>
    ` : ''}
    
    ${reportData.healthScore < 60 || (reportData.data && reportData.data.emergencyFund === 'none') ? `
    <div class="homework-item priority-medium">
      <h4 style="color: #f59e0b; margin-top: 0;">🟡 Priority 2: Expense Tracking</h4>
      <ul>
        <li>Track all expenses for next 7 days</li>
        <li>Identify top 3 spending categories</li>
        <li>Find 3 expenses you could reduce</li>
        <li>Calculate true monthly living costs</li>
      </ul>
    </div>
    ` : ''}
    
    <div class="homework-item priority-low">
      <h4 style="color: #22c55e; margin-top: 0;">🟢 Priority 3: Income & Assets Review</h4>
      <ul>
        <li>Gather last 2 pay stubs</li>
        <li>List all income sources</li>
        <li>Check all account balances</li>
        <li>Review any investment accounts</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h3>🎯 Next Steps</h3>
    <ol>
      <li>Complete your personalized homework tasks above</li>
      <li>Take Tool 2: Financial Clarity Assessment (Week 2)</li>
      ${reportData.mindsetScore < 0 ? '<li>Prepare for Tool 3: Control Fear Grounding (Week 3)</li>' : ''}
      <li>Track your progress weekly using the platform</li>
      <li>Celebrate small wins along your journey</li>
    </ol>
  </div>

  <div class="footer">
    <p><strong>Financial TruPath V2.0</strong></p>
    <p>This report is confidential and for your personal use only</p>
    <p>© ${new Date().getFullYear()} Financial TruPath. All rights reserved.</p>
  </div>
</body>
</html>
    `;
    
    // Create a blob from the HTML
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    
    // Convert HTML to PDF
    const pdf = blob.getAs('application/pdf');
    
    // Convert to base64 for client-side download
    const base64 = Utilities.base64Encode(pdf.getBytes());
    const fileName = `FinancialTruPath_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Return base64 encoded PDF
    return {
      success: true,
      base64: base64,
      fileName: fileName,
      mimeType: 'application/pdf'
    };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function to verify setup
 */
function testWebApp() {
  const url = ScriptApp.getService().getUrl();
  const deploymentInstructions = !url ? `
    <div style="background-color: #FEF3C7; padding: 10px; border-radius: 5px; margin: 10px 0;">
      <strong>⚠️ Web App Not Yet Deployed</strong><br>
      To deploy:<br>
      1. Click Extensions → Apps Script<br>
      2. Click Deploy → New Deployment<br>
      3. Type: Web app<br>
      4. Execute as: Me<br>
      5. Who has access: Anyone (or restrict)<br>
      6. Click Deploy
    </div>
  ` : `<p>Web App URL: <a href="${url}" target="_blank">${url}</a></p>`;
  
  const html = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Financial TruPath V2.0 - Platform Status</h2>
      ${deploymentInstructions}
      <div style="margin-top: 15px;">
        <p><strong>Master Sheet ID:</strong><br>${CONFIG.MASTER_SHEET_ID}</p>
        <p><strong>Current Course Week:</strong> ${getCurrentWeek()}</p>
        <p><strong>Platform Version:</strong> ${CONFIG.VERSION}</p>
        <p><strong>Script ID:</strong><br>1TIkkayrocz3TA2kuYJSsegU94xzrd2fJuY9Wf9eI_K83B0IKyPlpzeY9</p>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc;">
        <strong>✅ Platform Components:</strong><br>
        • DataHub: Ready<br>
        • Middleware: Ready<br>
        • Tool 1 (Orientation): Ready<br>
        • Web Interface: Ready
      </div>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(450).setHeight(400),
    'Platform Test'
  );
}

/**
 * Test data saving function
 */
function testDataSaving() {
  // Create test data that matches what the form would send
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    age: '35',
    maritalStatus: 'single',
    employmentStatus: 'employed_full',
    profession: 'Teacher',
    yearsEmployed: '5',
    annualIncome: '75000',
    otherIncome: '5000',
    retirementAccess: 'yes_401k',
    housingCost: '1500',
    monthlyExpenses: '3500',
    monthlySavings: '500',
    totalDebt: '10k_25k',
    emergencyFund: '1_3_months',
    investmentExperience: 'beginner',
    primaryGoal: 'retirement',
    financialSituation: '0',
    moneyRelationship: '1',
    scarcityAbundance: '0',
    goalConfidence: '1',
    retirementTarget: '65',
    biggestObstacle: 'debt'
  };
  
  try {
    const result = saveUserData('TEST-USER-001', 'orientation', testData);
    
    if (result.success) {
      SpreadsheetApp.getUi().alert('✅ Data saved successfully! Check the Tool1_Orientation sheet.');
    } else {
      SpreadsheetApp.getUi().alert('❌ Error saving data: ' + result.message);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
  }
}