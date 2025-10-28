/**
 * Financial TruPath V2.0 - Main Entry Point
 * Routes requests to appropriate handlers based on URL parameters
 */

/**
 * Include function for HTML templates
 * Allows including other JS files in templates
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch(e) {
    // console.error('Include error for file:', filename, e);
    return '';
  }
}

/**
 * Main entry point for web application
 * @param {Object} e - Event object with parameters
 * @returns {HtmlOutput} The appropriate HTML page
 */
function doGet(e) {
  try {
    // Get route from URL parameters
    const route = e.parameter.route || 'login';
    
    // Log ALL parameters for debugging
    // console.log('Route requested:', route);
    // console.log('All parameters:', JSON.stringify(e.parameter));
    
    // Handle different routes
    if (route === 'dashboard') {
      // Temporarily bypass session validation for testing navigation
      const sessionId = e.parameter.session || '';
      const clientId = e.parameter.client || 'TEST001';
      
      // Skip session validation during development
      console.log('Dashboard route - clientId:', clientId, 'sessionId:', sessionId);
      return createSimpleDashboard(clientId, sessionId);
      
      /* Original session validation - commented out for testing
      if (sessionId) {
        const validation = validateSession(sessionId);
        if (!validation.valid) {
          return createLoginPage('Your session has expired. Please log in again.');
        }
        return createSimpleDashboard(validation.clientId, sessionId);
      } else {
        return createLoginPage('Please log in to access the dashboard.');
      }
      */
      
    } else if (route === 'login') {
      // Explicitly handle login route
      return createLoginPage();
      
    } else if (route === 'tool' || route === 'orientation' || route === 'Tool1' || route === 'tool1') {
      // Check which tool is being requested
      const toolId = e.parameter.tool || 'orientation';
      const sessionId = e.parameter.session || '';
      const clientId = e.parameter.client || 'TEST001';
      
      // Skip session validation for testing - comment this section to re-enable
      /*
      if (sessionId) {
        const validation = validateSession(sessionId);
        if (!validation.valid) {
          return createLoginPage('Your session has expired. Please log in again.');
        }
      }
      */
      
      // Route to the appropriate tool
      if (toolId === 'test') {
        // Load the TestTool for V10 foundation testing
        const template = HtmlService.createTemplateFromFile('TestTool');
        template.userId = clientId || 'USER_' + Utilities.getUuid();
        template.sessionId = sessionId || Utilities.getUuid();
        
        return template.evaluate()
          .setTitle('Financial TruPath V2.0 - Foundation Test Tool')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
      } else {
        // Default to Tool 1 (existing index.html with sophisticated form)
        const template = HtmlService.createTemplateFromFile('index');
        template.userId = clientId || 'USER_' + Utilities.getUuid();
        template.sessionId = sessionId || Utilities.getUuid();
        template.currentWeek = getCurrentWeek();
        template.config = CONFIG;
        template.baseUrl = ScriptApp.getService().getUrl();
        template.baseUrlJs = `<script>window.BASE_URL = '${ScriptApp.getService().getUrl()}';</script>`;
        
        // console.log('Loading Tool 1 for client:', clientId, 'session:', sessionId);
        
        return template.evaluate()
          .setTitle('Financial TruPath V2.0 - Orientation Assessment')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
      }
    }
    
    // Default: Show login page (inline HTML)
    return createLoginPage();
    
  } catch (error) {
    // console.error('Router error:', error);
    // Return a simple error page since createErrorPage might not exist
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            background: #1e192b; 
            color: #fff;
          }
          .error-box {
            background: rgba(255, 59, 48, 0.1);
            border: 1px solid #ff3b30;
            padding: 20px;
            border-radius: 10px;
            max-width: 600px;
            margin: 0 auto;
          }
          h1 { color: #ad9168; }
          pre { 
            background: #000; 
            padding: 15px; 
            overflow-x: auto;
            border-radius: 5px;
          }
          a {
            color: #ad9168;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            border: 1px solid #ad9168;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>An Error Occurred</h1>
          <p>Route: ${e.parameter.route || 'login'}</p>
          <p>Session: ${e.parameter.session || 'none'}</p>
          <p>Client: ${e.parameter.client || 'none'}</p>
          <pre>${error.toString()}\n\nStack:\n${error.stack || 'No stack trace'}</pre>
          <a href="${ScriptApp.getService().getUrl()}">Back to Login</a>
        </div>
      </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(errorHtml)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Create login page
 * @param {string} message - Optional message to display
 */
function createLoginPage(message) {
  const loginHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruPath Financial - Login</title>
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
    .login-container {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
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
      font-size: 32px;
      letter-spacing: 2px;
      margin-bottom: 10px;
      font-weight: 400;
    }
    .logo p {
      color: #94a3b8;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #ffffff;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(173, 145, 104, 0.3);
      border-radius: 8px;
      font-size: 16px;
      color: #ffffff;
      transition: all 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #ad9168;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 3px rgba(173, 145, 104, 0.1);
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #ad9168;
      color: #1e192b;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover {
      background: #c4a877;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(173, 145, 104, 0.3);
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
      background: rgba(173, 145, 104, 0.1);
      color: #ad9168;
      border: 1px solid rgba(173, 145, 104, 0.3);
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
      background: rgba(173, 145, 104, 0.1);
      border: 1px solid rgba(173, 145, 104, 0.3);
      border-radius: 8px;
      font-size: 12px;
      color: #94a3b8;
    }
    .test-info a {
      color: #ad9168;
      text-decoration: none;
      font-weight: 600;
    }
    .test-info a:hover {
      color: #c4a877;
      text-decoration: underline;
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
    
    <div id="alertBox" class="alert" ${message ? 'style="display: block;"' : ''}>${message || ''}</div>
    
    <!-- Primary Login Form -->
    <div id="primaryLogin">
      <form id="loginForm" onsubmit="handleLogin(event); return false;">
        <div class="form-group">
          <label for="clientId">Enter Your Student ID</label>
          <input type="text" id="clientId" name="clientId" required 
                 placeholder="Enter your Student ID" autocomplete="off">
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
      </form>
      
      <div id="loadingSpinner">
        <p style="color: #ad9168; font-size: 16px; margin-top: 10px;">Verifying...</p>
      </div>
      
      <div style="text-align: center; margin: 20px 0; color: #94a3b8;">
        <small>— OR —</small>
      </div>
      
      <button type="button" class="btn-primary" style="background: transparent; border: 2px solid #ad9168; color: #ad9168;" 
              onclick="showBackupLogin()">Can't Remember Your ID?</button>
    </div>
    
    <!-- Backup Login Form -->
    <div id="backupLogin" style="display: none;">
      <button onclick="showPrimaryLogin()" style="background: none; border: none; color: #ad9168; cursor: pointer; margin-bottom: 20px;">
        ← Back to Student ID login
      </button>
      
      <form id="backupForm" onsubmit="handleBackupLogin(event); return false;">
        <p style="color: #94a3b8; margin-bottom: 20px; font-size: 14px;">
          Enter at least 2 of the following fields:
        </p>
        
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" placeholder="Your first name">
        </div>
        
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" placeholder="Your last name">
        </div>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="Your email address">
        </div>
        
        <button type="submit" class="btn-primary">Look Up My Account</button>
      </form>
    </div>
  </div>

  <script>
    function showAlert(message, type) {
      const alertBox = document.getElementById('alertBox');
      alertBox.textContent = message;
      alertBox.className = 'alert ' + type;
      alertBox.style.display = 'block';
      if (type !== 'error') {
        setTimeout(() => {
          alertBox.style.display = 'none';
        }, 5000);
      }
    }
    
    function showPrimaryLogin() {
      document.getElementById('primaryLogin').style.display = 'block';
      document.getElementById('backupLogin').style.display = 'none';
      document.getElementById('alertBox').style.display = 'none';
    }
    
    function showBackupLogin() {
      document.getElementById('primaryLogin').style.display = 'none';
      document.getElementById('backupLogin').style.display = 'block';
      document.getElementById('alertBox').style.display = 'none';
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
      
      // Try authentication with retry mechanism for iframe timing issues
      attemptAuthentication(clientId, 1);
    }
    
    function attemptAuthentication(clientId, attempt) {
      const maxAttempts = 2;
      
      google.script.run
        .withSuccessHandler(function(result) {
          // Check if result is null or undefined
          if (!result) {
            if (attempt < maxAttempts) {
              console.log('Retry attempt ' + (attempt + 1) + ' due to null response');
              setTimeout(function() {
                attemptAuthentication(clientId, attempt + 1);
              }, 1000);
              return;
            }
            
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('loadingSpinner').style.display = 'none';
            showAlert('Connection issue. Please refresh the page and try again.', 'error');
            return;
          }
          
          if (result.success) {
            // Session created successfully, navigate with session token
            const baseUrl = '${ScriptApp.getService().getUrl()}';
            const dashboardUrl = baseUrl + '?route=dashboard' +
              '&client=' + encodeURIComponent(result.clientId) +
              '&session=' + encodeURIComponent(result.sessionId);
            
            showAlert('Login successful!', 'success');
            
            // Navigate to dashboard after a brief delay
            setTimeout(function() {
              window.location.href = dashboardUrl;
            }, 500);
          } else {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('loadingSpinner').style.display = 'none';
            showAlert(result.error || 'Invalid Student ID', 'error');
          }
        })
        .withFailureHandler(function(error) {
          if (attempt < maxAttempts) {
            console.log('Retry attempt ' + (attempt + 1) + ' due to failure:', error);
            setTimeout(function() {
              attemptAuthentication(clientId, attempt + 1);
            }, 1000);
            return;
          }
          
          document.getElementById('loginForm').style.display = 'block';
          document.getElementById('loadingSpinner').style.display = 'none';
          showAlert('System error. Please refresh the page and try again.', 'error');
          console.error('Final authentication failure:', error);
        })
        .authenticateAndCreateSession(clientId);
    }
    
    function handleBackupLogin(event) {
      event.preventDefault();
      
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      
      // Count how many fields were provided
      let fieldCount = 0;
      if (firstName) fieldCount++;
      if (lastName) fieldCount++;
      if (email) fieldCount++;
      
      if (fieldCount < 2) {
        showAlert('Please provide at least 2 fields to look up your account', 'error');
        return;
      }
      
      document.getElementById('backupLogin').style.display = 'none';
      document.getElementById('loadingSpinner').style.display = 'block';
      
      // Try backup authentication
      google.script.run
        .withSuccessHandler(function(result) {
          // Check if result is null or undefined
          if (!result) {
            document.getElementById('loadingSpinner').style.display = 'none';
            showBackupLogin();
            showAlert('No response from server. Please refresh and try again.', 'error');
            return;
          }
          
          if (result.success) {
            // Found account, now create session
            showAlert('Account found! Logging you in...', 'success');
            
            // Create session with the found client ID
            google.script.run
              .withSuccessHandler(function(sessionResult) {
                // Check if sessionResult is null or undefined
                if (!sessionResult) {
                  document.getElementById('loadingSpinner').style.display = 'none';
                  showBackupLogin();
                  showAlert('Session creation failed. Please refresh and try again.', 'error');
                  return;
                }
                
                if (sessionResult.success) {
                  // Session created, navigate to dashboard
                  const baseUrl = '${ScriptApp.getService().getUrl()}';
                  const dashboardUrl = baseUrl + '?route=dashboard' +
                    '&client=' + encodeURIComponent(sessionResult.clientId) +
                    '&session=' + encodeURIComponent(sessionResult.sessionId);
                  
                  setTimeout(function() {
                    window.top.location.href = dashboardUrl;
                  }, 500);
                } else {
                  document.getElementById('loadingSpinner').style.display = 'none';
                  showBackupLogin();
                  showAlert('Failed to create session. Please try again.', 'error');
                }
              })
              .withFailureHandler(function(error) {
                document.getElementById('loadingSpinner').style.display = 'none';
                showBackupLogin();
                showAlert('System error. Please try again.', 'error');
                // console.error(error);
              })
              .authenticateAndCreateSession(result.clientId);
              
          } else {
            document.getElementById('loadingSpinner').style.display = 'none';
            showBackupLogin();
            showAlert(result.error || 'No matching account found', 'error');
          }
        })
        .withFailureHandler(function(error) {
          document.getElementById('loadingSpinner').style.display = 'none';
          showBackupLogin();
          showAlert('System error. Please try again.', 'error');
          // console.error(error);
        })
        .lookupClientByDetails({
          firstName: firstName,
          lastName: lastName,
          email: email
        });
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(loginHtml)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create a simple, working dashboard page
 * @param {string} clientId - The client ID
 * @param {string} sessionId - The session token
 */
function createSimpleDashboard(clientId, sessionId) {
  const baseUrl = ScriptApp.getService().getUrl();
  
  // Simple HTML dashboard
  const dashboardHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruPath Financial - Dashboard</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Rubik', Arial, sans-serif;
      background: linear-gradient(135deg, #4b4166, #1e192b);
      background-attachment: fixed;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo {
      font-family: 'Radley', serif;
      color: #ad9168;
      font-size: 36px;
      letter-spacing: 2px;
      margin-bottom: 10px;
      font-weight: 400;
    }
    
    .subtitle {
      color: #94a3b8;
      font-size: 16px;
    }
    
    .welcome {
      color: #fff;
      font-size: 20px;
      margin-top: 20px;
    }
    
    .info-box {
      background: rgba(173, 145, 104, 0.1);
      border: 1px solid rgba(173, 145, 104, 0.3);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      color: #fff;
    }
    
    .info-box h3 {
      color: #ad9168;
      margin-bottom: 10px;
    }
    
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .tool-card {
      background: rgba(20, 15, 35, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(173, 145, 104, 0.2);
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s;
      cursor: pointer;
    }
    
    .tool-card:hover {
      transform: translateY(-5px);
      border-color: #ad9168;
      box-shadow: 0 10px 30px rgba(173, 145, 104, 0.2);
    }
    
    .tool-card.locked {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .tool-card.locked:hover {
      transform: none;
      border-color: rgba(173, 145, 104, 0.2);
    }
    
    .tool-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    
    .tool-number {
      background: #ad9168;
      color: #1e192b;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
    
    .tool-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-available {
      background: #ad9168;
      color: #1e192b;
    }
    
    .status-locked {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }
    
    .tool-title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .tool-description {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 15px;
    }
    
    .button {
      display: inline-block;
      padding: 10px 20px;
      background: #ad9168;
      color: #1e192b;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .button:hover {
      background: #c4a877;
      transform: translateY(-2px);
    }
    
    .button.secondary {
      background: transparent;
      color: #ad9168;
      border: 2px solid #ad9168;
    }
    
    .button.secondary:hover {
      background: #ad9168;
      color: #1e192b;
    }
    
    .logout-container {
      text-align: center;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">TruPath Financial</h1>
      <p class="subtitle">Your Journey to Financial Freedom</p>
      <p class="welcome">Welcome! You are logged in as: <strong>${clientId || 'Guest'}</strong></p>
    </div>
    
    <div class="info-box">
      <h3>Session Information</h3>
      <p>Client ID: ${clientId || 'Not set'}</p>
      <p>Session Token: ${sessionId ? sessionId.substring(0, 8) + '...' : 'Not set'}</p>
      <p>Status: Active</p>
    </div>
    
    <div class="tools-grid">
      <!-- Test Tool - V10 Foundation Testing -->
      <div class="tool-card" onclick="navigateToTool('test')" style="border-color: #4CAF50;">
        <div class="tool-header">
          <span class="tool-number">🧪</span>
          <span class="tool-status" style="background: #4CAF50;">TEST V10</span>
        </div>
        <h3 class="tool-title">Foundation Test Tool</h3>
        <p class="tool-description">Test the new V10 foundation with standardized form structure.</p>
        <span class="button">Test Now</span>
      </div>
      
      <!-- Tool 1 - Always Available -->
      <div class="tool-card" onclick="navigateToTool('orientation')">
        <div class="tool-header">
          <span class="tool-number">1</span>
          <span class="tool-status status-available">AVAILABLE</span>
        </div>
        <h3 class="tool-title">Orientation Assessment</h3>
        <p class="tool-description">Complete your comprehensive financial profile and receive personalized insights.</p>
        <span class="button">Start Now</span>
      </div>
      
      <!-- Tool 2 - Coming Soon -->
      <div class="tool-card locked">
        <div class="tool-header">
          <span class="tool-number">2</span>
          <span class="tool-status status-locked">COMING SOON</span>
        </div>
        <h3 class="tool-title">Financial Clarity</h3>
        <p class="tool-description">Deep dive into your income, expenses, and cash flow.</p>
      </div>
      
      <!-- Tool 3 - Coming Soon -->
      <div class="tool-card locked">
        <div class="tool-header">
          <span class="tool-number">3</span>
          <span class="tool-status status-locked">COMING SOON</span>
        </div>
        <h3 class="tool-title">Control Fear Grounding</h3>
        <p class="tool-description">Master your emotions around money.</p>
      </div>
      
      <!-- Tool 4 - Coming Soon -->
      <div class="tool-card locked">
        <div class="tool-header">
          <span class="tool-number">4</span>
          <span class="tool-status status-locked">COMING SOON</span>
        </div>
        <h3 class="tool-title">SMART Goals</h3>
        <p class="tool-description">Transform dreams into actionable goals.</p>
      </div>
    </div>
    
    <div class="logout-container">
      <button onclick="window.top.location.href = '${baseUrl}'" class="button secondary">Sign Out</button>
    </div>
  </div>
  
  <script>
    function navigateToTool(toolId) {
      const baseUrl = '${baseUrl}';
      const toolUrl = baseUrl + '?route=tool' + 
        '&tool=' + toolId + 
        '&client=${clientId || ''}' +
        '&session=${sessionId || ''}';
      window.top.location.href = toolUrl;
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(dashboardHtml)
    .setTitle('TruPath Financial - Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create dashboard page - redirects to simple dashboard
 */
function createDashboardPage(clientId, sessionId) {
  // Using the simple dashboard implementation
  return createSimpleDashboard(clientId, sessionId);
}

// Old complex dashboard implementation has been removed to avoid conflicts
// The createSimpleDashboard function above is now used for all dashboard rendering
/**
 * Create error page
 */
function createErrorPage(message) {
  const errorPageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .error-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 { color: #e74c3c; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <div class="error-box">
        <h1>Error</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
  return HtmlService.createHtmlOutput(errorPageHtml);
}

/**
 * Handle admin route (for testing/debugging)
 */
function handleAdminRoute(adminKey) {
  // Simple admin key check
  if (adminKey !== 'admin2024') { // Change this to a secure key
    return createErrorPage('Unauthorized');
  }
  
  // Show the test interface
  const adminHtml = `<!DOCTYPE html>
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
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).withFailureHandler(showResult).createDataSheets()">
              Create Data Sheets
            </button>
            <button class="btn" onclick="google.script.run.withSuccessHandler(showResult).withFailureHandler(showResult).testDataSaving()">
              Test Data Saving
            </button>
            <button class="btn" onclick="testAuth()">
              Test Authentication
            </button>
          </div>
          
          <div class="section">
            <h3>Quick Links</h3>
            <a href="${ScriptApp.getService().getUrl()}" class="btn">Login Page</a>
            <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=TEST-001&session=test" class="btn">
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
  
  return HtmlService.createHtmlOutput(adminHtml)
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
 * Save user data to the master spreadsheet
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @param {Object} data - Data to save
 * @returns {Object} Success status
 */
function getLastToolResponse(userId, toolId) {
  try {
    // Use the fixed DataService.getToolResponse method
    const response = DataService.getToolResponse(userId, toolId);
    
    if (response) {
      return {
        timestamp: response.timestamp,
        data: response.data,
        clientId: response.clientId,
        toolId: response.toolId
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting last tool response:', error);
    return null;
  }
}

/**
 * Get last submitted response for viewing (bypasses DataService)
 * Direct sheet access for better reliability
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID
 * @returns {Object|null} Last submission or null
 */
function getLastSubmissionForViewing(userId, toolId) {
  try {
    console.log(`🔍 getLastSubmissionForViewing - userId: ${userId}, toolId: ${toolId}`);
    
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    
    if (!responseSheet || responseSheet.getLastRow() < 2) {
      console.log('❌ No response sheet or no data');
      return null;
    }
    
    // Get all data
    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log(`📊 Headers: ${headers.join(', ')}`);
    console.log(`📈 Total rows: ${data.length}`);
    
    // Find column indices - from analysis doc, data is in 'Version' column
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const versionCol = headers.indexOf('Version'); // JSON data is here!
    const responseIdCol = headers.indexOf('Response_ID'); // Timestamp is here!
    
    console.log(`🔍 Columns - Client: ${clientIdCol}, Tool: ${toolIdCol}, Version: ${versionCol}, ResponseID: ${responseIdCol}`);
    
    if (clientIdCol === -1 || toolIdCol === -1 || versionCol === -1) {
      console.error('❌ Required columns not found');
      return null;
    }
    
    // Find the most recent completed submission for this user/tool
    // Simplified: just take the LAST matching row (highest row number = most recent)
    let latestSubmission = null;
    let matchCount = 0;
    let lastMatchingRowIndex = -1;
    
    console.log(`🔎 Searching for userId: "${userId}", toolId: "${toolId}"`);
    
    // First pass: find all matching rows and get the last one
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row[clientIdCol] === userId && row[toolIdCol] === toolId) {
        matchCount++;
        lastMatchingRowIndex = i;
        console.log(`✅ Match ${matchCount} found at row ${i}`);
      }
    }
    
    // If we found matches, process the last one
    if (lastMatchingRowIndex > 0) {
      const row = data[lastMatchingRowIndex];
      console.log(`📝 Processing last matching row: ${lastMatchingRowIndex}`);
      
      try {
        // Parse the JSON data from Version column
        const jsonData = JSON.parse(row[versionCol]);
        latestSubmission = {
          data: jsonData,
          timestamp: row[responseIdCol], // Keep raw timestamp
          userId: userId,
          toolId: toolId,
          found: true,
          source: 'direct_sheet_access',
          rowIndex: lastMatchingRowIndex
        };
        console.log(`✅ Successfully parsed JSON data from row ${lastMatchingRowIndex}`);
      } catch (parseError) {
        console.warn(`⚠️ JSON parse failed for row ${lastMatchingRowIndex}:`, parseError);
        // Try storing raw data if JSON parse fails
        latestSubmission = {
          data: row[versionCol],
          timestamp: row[responseIdCol],
          userId: userId,
          toolId: toolId,
          found: true,
          source: 'direct_sheet_access_raw',
          parseError: parseError.toString(),
          rowIndex: lastMatchingRowIndex
        };
      }
    }
    
    console.log(`🏁 Search complete - Total matches: ${matchCount}`);
    
    if (latestSubmission) {
      console.log(`✅ Returning submission from ${latestSubmission.timestamp}`);
      return latestSubmission;
    }
    
    console.log('❌ No submissions found');
    return null;
    
  } catch (error) {
    console.error('💥 Error in getLastSubmissionForViewing:', error);
    return null;
  }
}

/**
 * DEBUG STEP 1: Test basic sheet connectivity
 */
function testSheetConnectivity() {
  try {
    console.log('🔍 TEST 1: Basic sheet connectivity');
    
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    console.log(`✅ Opened spreadsheet: ${ss.getName()}`);
    
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    console.log(`✅ Found RESPONSES sheet: ${responseSheet ? 'YES' : 'NO'}`);
    
    if (responseSheet) {
      const rowCount = responseSheet.getLastRow();
      console.log(`✅ Row count: ${rowCount}`);
      
      return {
        success: true,
        spreadsheetName: ss.getName(),
        sheetFound: true,
        rowCount: rowCount
      };
    }
    
    return { success: false, error: 'RESPONSES sheet not found' };
    
  } catch (error) {
    console.error('❌ Sheet connectivity test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * DEBUG STEP 2: Test reading headers
 */
function testReadHeaders() {
  try {
    console.log('🔍 TEST 2: Reading headers');
    
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    
    if (!responseSheet) {
      return { success: false, error: 'No sheet found' };
    }
    
    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log(`✅ Headers: ${headers.join(', ')}`);
    console.log(`✅ Total rows: ${data.length}`);
    
    return {
      success: true,
      headers: headers,
      totalRows: data.length,
      clientIdCol: headers.indexOf('Client_ID'),
      toolIdCol: headers.indexOf('Tool_ID'),
      versionCol: headers.indexOf('Version'),
      responseIdCol: headers.indexOf('Response_ID')
    };
    
  } catch (error) {
    console.error('❌ Headers test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * DEBUG STEP 3: Test finding TEST001 rows
 */
function testFindTest001Rows() {
  try {
    console.log('🔍 TEST 3: Finding TEST001 rows');
    
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    
    if (!responseSheet) {
      return { success: false, error: 'No sheet found' };
    }
    
    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];
    
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    
    console.log(`🔍 Looking for TEST001 in column ${clientIdCol} and tool1 in column ${toolIdCol}`);
    
    const matchingRows = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      console.log(`Row ${i}: ClientID="${row[clientIdCol]}", ToolID="${row[toolIdCol]}"`);
      
      if (row[clientIdCol] === 'TEST001' && row[toolIdCol] === 'tool1') {
        matchingRows.push({
          rowIndex: i,
          responseId: row[headers.indexOf('Response_ID')],
          clientId: row[clientIdCol],
          toolId: row[toolIdCol],
          versionData: row[headers.indexOf('Version')]
        });
        console.log(`✅ MATCH found at row ${i}`);
      }
    }
    
    return {
      success: true,
      totalRowsChecked: data.length - 1,
      matchingRows: matchingRows,
      matchCount: matchingRows.length
    };
    
  } catch (error) {
    console.error('❌ Find rows test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * DEBUG STEP 4: Test the exact same logic as getLastSubmissionForViewing
 */
function testGetLastSubmissionLogic() {
  try {
    console.log('🔍 TEST 4: Testing exact getLastSubmissionForViewing logic');
    
    // Use the exact same parameters and logic as the real function
    const userId = 'TEST001';
    const toolId = 'tool1';
    
    console.log(`🔍 Calling with userId: ${userId}, toolId: ${toolId}`);
    
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    
    if (!responseSheet || responseSheet.getLastRow() < 2) {
      return { success: false, error: 'No response sheet or no data' };
    }
    
    // Get all data
    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indices - exact same as getLastSubmissionForViewing
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const versionCol = headers.indexOf('Version'); // JSON data is here!
    const responseIdCol = headers.indexOf('Response_ID'); // Timestamp is here!
    
    console.log(`🔍 Columns - Client: ${clientIdCol}, Tool: ${toolIdCol}, Version: ${versionCol}, ResponseID: ${responseIdCol}`);
    
    if (clientIdCol === -1 || toolIdCol === -1 || versionCol === -1) {
      return { success: false, error: 'Required columns not found' };
    }
    
    // Find the most recent completed submission - EXACT SAME LOGIC
    let latestSubmission = null;
    let latestTimestamp = null;
    let matchCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row[clientIdCol] === userId && row[toolIdCol] === toolId) {
        matchCount++;
        console.log(`✅ Match ${matchCount} found at row ${i}`);
        
        const timestamp = row[responseIdCol] ? new Date(row[responseIdCol]) : null;
        
        if (!latestTimestamp || (timestamp && timestamp > latestTimestamp)) {
          latestTimestamp = timestamp;
          
          try {
            // Parse the JSON data from Version column
            const jsonData = JSON.parse(row[versionCol]);
            latestSubmission = {
              data: jsonData,
              timestamp: timestamp,
              userId: userId,
              toolId: toolId,
              found: true,
              source: 'debug_test_exact_logic',
              rawVersionData: row[versionCol] // Include raw data for inspection
            };
            console.log(`📝 Updated latest submission from row ${i}`);
          } catch (parseError) {
            console.warn(`⚠️ JSON parse failed for row ${i}:`, parseError);
            latestSubmission = {
              data: row[versionCol],
              timestamp: timestamp,
              userId: userId,
              toolId: toolId,
              found: true,
              source: 'debug_test_exact_logic_raw',
              parseError: parseError.toString(),
              rawVersionData: row[versionCol]
            };
          }
        }
      }
    }
    
    return {
      success: true,
      matchCount: matchCount,
      latestSubmission: latestSubmission,
      foundData: latestSubmission !== null
    };
    
  } catch (error) {
    console.error('❌ Test exact logic failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * DEBUG STEP 5: Test the actual getLastSubmissionForViewing function
 */
function testActualFunction() {
  try {
    console.log('🔍 TEST 5: Testing actual getLastSubmissionForViewing function');
    
    const result = getLastSubmissionForViewing('TEST001', 'tool1');
    
    return {
      success: true,
      result: result,
      resultType: typeof result,
      isNull: result === null,
      hasData: result && result.data,
      resultKeys: result ? Object.keys(result) : null
    };
    
  } catch (error) {
    console.error('❌ Test actual function failed:', error);
    return { success: false, error: error.toString() };
  }
}

function saveUserData(userId, toolId, data) {
  try {
    // console.log(`saveUserData called - userId: ${userId}, toolId: ${toolId}, data fields: ${Object.keys(data).length}`);
    
    // Use DataService for saving tool data
    const result = DataService.saveToolResponse(userId, toolId, data);
    
    // console.log('DataService.saveToolResponse result:', JSON.stringify(result));
    
    // Log the save event
    logEvent('DATA_SAVED', {
      userId: userId,
      tool: toolId,
      timestamp: new Date(),
      success: result.success
    });
    
    if (result.success) {
      // Simplify return object to ensure it serializes properly through Google Apps Script
      const returnValue = {
        success: true,
        message: result.message || 'Data saved successfully'
        // Removed insights and timestamp as they might have serialization issues
      };
      // console.log('Returning success:', JSON.stringify(returnValue));
      return returnValue;
    } else {
      const returnValue = {
        success: false,
        message: result.error || 'Failed to save data',
        error: result.error
      };
      // console.log('Returning failure:', JSON.stringify(returnValue));
      return returnValue;
    }
  } catch (error) {
    // console.error('Error saving data:', error);
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
 * Save tool draft (for auto-save and manual save)
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @param {Object} draftData - Draft data to save
 * @param {number} progress - Progress percentage
 * @param {string} status - Status (DRAFT, etc.)
 * @param {string} saveType - 'AUTO' (autosave) or 'MANUAL' (user-triggered)
 */
function saveToolDraft(userId, toolId, draftData, progress, status, saveType = 'AUTO') {
  try {
    // console.log(`saveToolDraft called - userId: ${userId}, toolId: ${toolId}, progress: ${progress}, status: ${status}, saveType: ${saveType}`);
    // Include progress and status in the draft data
    const enrichedData = {
      ...draftData,
      progress: progress || 0,
      status: status || 'DRAFT',
      savedAt: new Date().toISOString()
    };
    // Call the PropertiesService version for draft versioning with saveType
    return DataService.saveToolDraftToProperties(userId, toolId, enrichedData, saveType);
  } catch (error) {
    // console.error('Error saving draft:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get tool draft
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 * @param {boolean} getAllVersions - If true, returns all versions
 */
function getToolDraft(userId, toolId, getAllVersions = false) {
  try {
    // console.log(`getToolDraft called - userId: ${userId}, toolId: ${toolId}, getAllVersions: ${getAllVersions}`);
    return DataService.getToolDraftFromProperties(userId, toolId, getAllVersions);
  } catch (error) {
    // console.error('Error getting draft:', error);
    return null;
  }
}

/**
 * Alias for getToolDraft - for compatibility with Load menu
 * @param {string} userId - User ID  
 * @param {string} toolId - Tool identifier
 * @param {boolean} getAllVersions - Whether to get all versions
 */
function getToolDraftFromProperties(userId, toolId, getAllVersions = false) {
  return getToolDraft(userId, toolId, getAllVersions);
}

/**
 * Get all draft versions for a tool
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 */
function getAllDraftVersions(userId, toolId) {
  try {
    // console.log(`getAllDraftVersions called - userId: ${userId}, toolId: ${toolId}`);
    const result = DataService.getToolDraftFromProperties(userId, toolId, true);
    
    // Convert new format to legacy format for backward compatibility
    return {
      versions: result.manualVersions || [],
      count: result.manualCount || 0,
      latest: result.latest || null,
      manualVersions: result.manualVersions || [],
      manualCount: result.manualCount || 0,
      hasData: result.hasData || false
    };
  } catch (error) {
    // console.error('Error getting draft versions:', error);
    return { 
      versions: [], 
      count: 0, 
      latest: null, 
      manualVersions: [], 
      manualCount: 0, 
      hasData: false 
    };
  }
}

/**
 * Get relevant insights for a specific tool
 * @param {string} userId - User ID
 * @param {string} toolId - Tool identifier
 */
function getRelevantInsights(userId, toolId) {
  try {
    // console.log(`getRelevantInsights called - userId: ${userId}, toolId: ${toolId}`);
    // For now, return empty insights. This will be enhanced later
    return [];
  } catch (error) {
    // console.error('Error getting insights:', error);
    return [];
  }
}

/**
 * Get a specific draft by ID
 * @param {string} draftId - Draft ID
 * @param {string} userId - User ID (optional, for better lookup)
 * @param {string} toolId - Tool ID (optional, for better lookup)
 */
function getSpecificDraft(draftId, userId, toolId) {
  try {
    // console.log(`getSpecificDraft called - draftId: ${draftId}, userId: ${userId}, toolId: ${toolId}`);
    
    // If we have userId and toolId, use the more efficient lookup
    if (userId && toolId) {
      return DataService.getSpecificDraftVersion(userId, toolId, draftId);
    }
    
    // Otherwise, we'd need to search through all user properties
    // For now, require userId and toolId
    // console.warn('getSpecificDraft requires userId and toolId for lookup');
    return null;
  } catch (error) {
    // console.error('Error getting specific draft:', error);
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
    // console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Authenticate user and create session
 * This is the main login function that combines authentication with session creation
 * @param {string} clientId - The client ID to authenticate
 * @returns {Object} Result with session info or error
 */
function authenticateAndCreateSession(clientId) {
  try {
    // Step 1: Authenticate the client ID
    const authResult = lookupClientById(clientId);
    
    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed'
      };
    }
    
    // Step 2: Create a session for the authenticated user
    const sessionResult = createSession(authResult.clientId);
    
    if (!sessionResult.success) {
      return {
        success: false,
        error: 'Failed to create session. Please try again.'
      };
    }
    
    // Step 3: Return combined result
    return {
      success: true,
      clientId: authResult.clientId,
      sessionId: sessionResult.sessionId,
      firstName: authResult.firstName,
      lastName: authResult.lastName,
      email: authResult.email,
      hasCompletedTools: authResult.hasCompletedTools,
      loginTime: sessionResult.loginTime,
      expiresAt: sessionResult.expiresAt
    };
    
  } catch (error) {
    // console.error('Error in authenticateAndCreateSession:', error);
    return {
      success: false,
      error: 'System error during login. Please try again.'
    };
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
    // console.error('Error logging event:', error);
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
  const adminUrlHtml = `
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
    HtmlService.createHtmlOutput(adminUrlHtml).setWidth(500).setHeight(250),
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
    // console.error('Error generating PDF:', error);
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
  
  const statusHtml = `
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
    HtmlService.createHtmlOutput(statusHtml).setWidth(450).setHeight(400),
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

/**
 * Clear all draft data for a specific user (for testing)
 */
function clearUserDrafts(userId = 'TEST002') {
  try {
    const props = PropertiesService.getUserProperties();
    
    // Clear all old and new draft keys
    const oldKeys = [
      `draft_${userId}_tool1`,
      `draft_versions_${userId}_tool1`,
      `drafts_${userId}_tool1_versions`
    ];
    
    const newKeys = [
      `draft_${userId}_tool1_latest`,
      `drafts_${userId}_tool1_manual_versions`, 
      `draft_counter_${userId}_tool1`
    ];
    
    const allKeys = [...oldKeys, ...newKeys];
    
    allKeys.forEach(key => {
      props.deleteProperty(key);
    });
    
    console.log(`Cleared all drafts (old + new format) for user: ${userId}`);
    return `✅ Cleared all drafts (old + new format) for user: ${userId}`;
  } catch (error) {
    console.error('Error clearing drafts:', error);
    return `❌ Error: ${error.toString()}`;
  }
}

/**
 * NUCLEAR OPTION: Clear ALL test data for ALL test users
 * This wipes everything from PropertiesService for any TEST* users
 */
function clearAllTestData() {
  try {
    const props = PropertiesService.getUserProperties();
    const allProperties = props.getProperties();
    let clearedCount = 0;
    const clearedKeys = [];
    
    // Find and delete ALL properties that contain TEST user patterns
    Object.keys(allProperties).forEach(key => {
      // Check if key contains common test user patterns
      if (key.includes('TEST') || 
          key.includes('test') || 
          key.includes('TEST002') || 
          key.includes('TEST999') ||
          key.includes('TEST_USER') ||
          key.includes('draft_') ||
          key.includes('drafts_') ||
          key.includes('_tool1') ||
          key.includes('_tool2') ||
          key.includes('_tool3') ||
          key.includes('_tool4') ||
          key.includes('_tool5')) {
        props.deleteProperty(key);
        clearedKeys.push(key);
        clearedCount++;
      }
    });
    
    console.log(`🧹 CLEARED ALL TEST DATA: ${clearedCount} properties deleted`);
    console.log('Deleted keys:', clearedKeys);
    
    return {
      success: true,
      message: `✅ Cleared ${clearedCount} test data properties`,
      clearedKeys: clearedKeys,
      count: clearedCount
    };
  } catch (error) {
    console.error('Error clearing all test data:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}