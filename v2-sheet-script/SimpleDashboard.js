/**
 * Simplified Dashboard for Financial TruPath V2.0
 * A clean, working dashboard without complex dependencies
 */

/**
 * Create a simple, working dashboard page
 * @param {string} clientId - The client ID
 * @param {string} sessionId - The session token
 */
function createSimpleDashboard(clientId, sessionId) {
  const baseUrl = ScriptApp.getService().getUrl();
  
  // Simple HTML dashboard
  const html = `
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
      <a href="${baseUrl}" class="button secondary">Sign Out</a>
    </div>
  </div>
  
  <script>
    function navigateToTool(toolId) {
      const baseUrl = '${baseUrl}';
      const toolUrl = baseUrl + '?route=tool' + 
        '&tool=' + toolId + 
        '&client=${clientId || ''}' +
        '&session=${sessionId || ''}';
      window.location.href = toolUrl;
    }
  </script>
</body>
</html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('TruPath Financial - Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}