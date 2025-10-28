# Real-Time Console Monitoring Setup

## 🎯 Overview
This document explains how to set up real-time console monitoring that allows Claude Code to see browser console output, JavaScript errors, network requests, and API calls in real-time through Chrome DevTools Protocol.

**Benefits:**
- ✅ Real-time debugging without asking user to check console
- ✅ Instant error detection and analysis
- ✅ Network request monitoring
- ✅ API call tracking
- ✅ Zero code changes required in your application

---

## 🚀 Quick Setup (For Existing Project)

### Step 1: Close All Chrome Windows
```bash
# Force quit all Chrome processes
pkill -f "Google Chrome"
```

### Step 2: Start Chrome with Debug Port
```bash
# Start Chrome with remote debugging enabled
open -a "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

### Step 3: Verify Debug Interface
```bash
# Test the debug interface
curl http://localhost:9222/json
```
You should see JSON output listing all Chrome tabs.

### Step 4: Install Dependencies (if needed)
```bash
npm install ws
```

### Step 5: Start Monitoring
Use the existing `chrome-monitor.js` script:
```bash
node chrome-monitor.js
```

---

## 🔧 Complete Setup (For New Project)

### Prerequisites
- Chrome browser
- Node.js installed
- Terminal access

### Step 1: Project Setup
```bash
# Navigate to your project directory
cd /path/to/your/project

# Install WebSocket dependency
npm install ws
```

### Step 2: Create Monitor Script
Create `chrome-monitor.js` in your project root:

```javascript
#!/usr/bin/env node

/**
 * Chrome Console Monitor
 * Connects to Chrome DevTools and monitors console output in real-time
 */

const WebSocket = require('ws');
const http = require('http');

class ChromeConsoleMonitor {
  constructor() {
    this.debugPort = 9222;
    this.ws = null;
    this.tabId = null;
  }

  async findTargetTab() {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${this.debugPort}/json`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const tabs = JSON.parse(data);
            console.log('🔍 Available tabs:');
            tabs.forEach((tab, i) => {
              console.log(`  ${i + 1}. ${tab.title} - ${tab.url}`);
            });

            // Find your app tab (customize these keywords for your app)
            const targetTab = tabs.find(tab => 
              tab.url.includes('script.google.com') ||
              tab.url.includes('googleusercontent.com') ||
              tab.url.includes('localhost') ||
              tab.title.toLowerCase().includes('your-app-name') ||
              tab.url.includes('your-domain.com')
            );

            if (targetTab) {
              console.log(`✅ Found target tab: ${targetTab.title}`);
              resolve(targetTab);
            } else {
              console.log('❌ Target tab not found. Available tabs:');
              tabs.forEach(tab => console.log(`  - ${tab.title}: ${tab.url}`));
              reject(new Error('Target tab not found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  async connect() {
    try {
      console.log('🔗 Connecting to Chrome DevTools...');
      
      const tab = await this.findTargetTab();
      this.tabId = tab.id;
      
      const wsUrl = tab.webSocketDebuggerUrl;
      console.log(`🔌 Connecting to: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.on('open', () => {
        console.log('✅ Connected to Chrome DevTools!');
        console.log('📺 Monitoring console output...\n');
        
        // Enable Runtime domain to get console messages
        this.ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.enable'
        }));
        
        // Enable Console domain
        this.ws.send(JSON.stringify({
          id: 2,
          method: 'Console.enable'
        }));
      });
      
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      this.ws.on('close', () => {
        console.log('❌ Connection closed');
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
      
    } catch (error) {
      console.error('❌ Failed to connect:', error.message);
    }
  }

  handleMessage(message) {
    if (message.method === 'Runtime.consoleAPICalled') {
      const { type, args, timestamp } = message.params;
      const time = new Date(timestamp).toLocaleTimeString();
      
      // Format console message
      const values = args.map(arg => {
        if (arg.type === 'string') return arg.value;
        if (arg.type === 'number') return arg.value;
        if (arg.type === 'object') return arg.preview?.description || '[Object]';
        return arg.value || arg.description || '[Unknown]';
      });
      
      const logLevel = this.getLogIcon(type);
      console.log(`${logLevel} [${time}] ${values.join(' ')}`);
    }
    
    if (message.method === 'Runtime.exceptionThrown') {
      const { exception, timestamp } = message.params;
      const time = new Date(timestamp).toLocaleTimeString();
      console.log(`🚨 [${time}] ERROR: ${exception.description}`);
      if (exception.stackTrace) {
        console.log(`   Stack: ${exception.stackTrace.callFrames[0]?.url}:${exception.stackTrace.callFrames[0]?.lineNumber}`);
      }
    }
  }

  getLogIcon(type) {
    switch (type) {
      case 'log': return '📝';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🐛';
      default: return '📄';
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Start monitoring
const monitor = new ChromeConsoleMonitor();
monitor.connect();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping monitor...');
  monitor.disconnect();
  process.exit(0);
});

console.log('🚀 Chrome Console Monitor Starting...');
console.log('Press Ctrl+C to stop\n');
```

### Step 3: Chrome Setup
1. **Close all Chrome windows**: `pkill -f "Google Chrome"`
2. **Start Chrome with debugging**: `open -a "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug`
3. **Open your web application** in the debug-enabled Chrome
4. **Start monitoring**: `node chrome-monitor.js`

---

## 📋 Troubleshooting

### Port 9222 Not Accessible
```bash
# Check if port is open
nc -z localhost 9222

# If closed, ensure Chrome started with debug flags
# Make sure to completely quit Chrome first:
pkill -f "Google Chrome"
```

### Monitor Can't Find Your App
Edit the `findTargetTab()` function in `chrome-monitor.js` and update the detection logic:
```javascript
const targetTab = tabs.find(tab => 
  tab.url.includes('your-domain.com') ||        // Your domain
  tab.url.includes('localhost:3000') ||         // Local development
  tab.title.toLowerCase().includes('app-name')  // App title
);
```

### Chrome Won't Start with Debug Flags
Try alternative startup commands:
```bash
# macOS alternative
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug

# Linux
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\temp\chrome-debug
```

---

## 🎯 Prompt for New Claude Chats

Copy this prompt to new Claude Code chats to inform them about the monitoring capability:

### Short Prompt:
```
I have real-time console monitoring set up. You can see all browser console output, JavaScript errors, network requests, and API calls from my web app in real-time through Chrome DevTools Protocol. 

Current setup:
- Chrome running with debug port 9222
- Live WebSocket connection to my app tab
- All console.log, console.error, and network activity is visible instantly

You can debug JavaScript errors in real-time, monitor API calls and responses, and see exactly what happens when I interact with the app. The monitoring is active now.
```

### Detailed Prompt:
```
CONSOLE MONITORING ACTIVE:

I have Chrome DevTools remote debugging set up that allows you to see real-time console output from my web application.

Technical Setup:
- Chrome started with --remote-debugging-port=9222
- WebSocket connection to my app tab via Chrome DevTools Protocol  
- Node.js monitoring script running (chrome-monitor.js)
- All console messages, errors, and network requests are visible in real-time

What You Can See:
✅ All console.log, console.info, console.warn, console.error messages
✅ JavaScript errors with stack traces
✅ Network requests and API calls
✅ Runtime exceptions
✅ Exact timestamps of all events

What This Means:
- No need to ask me to "check the browser console"
- You can debug JavaScript issues in real-time
- You can see API call failures immediately
- You can monitor user interactions and their effects
- You can detect errors the moment they occur

The monitoring is currently active and connected to my app. When I perform actions in the browser, you'll see the corresponding console activity immediately.

How to Use:
- Ask me to trigger specific actions to see console output
- Debug issues by watching real-time console messages
- Monitor network requests when I click buttons or submit forms
- Analyze errors as they happen, not after the fact

Current Status: ✅ MONITORING ACTIVE
```

---

## 🔄 Usage Patterns

### For Debugging Sessions
1. Start monitoring before beginning work
2. Tell Claude about the monitoring capability
3. Perform actions in your app while Claude watches console
4. Claude can immediately see and analyze any errors

### For Development
1. Keep monitoring running during development
2. Claude can catch errors as you test features
3. Real-time feedback on console warnings
4. Immediate detection of API failures

### For Code Reviews
1. Start monitoring before testing new features
2. Claude can verify console is clean during testing
3. Catch any console errors introduced by new code
4. Validate that network requests are working correctly

---

## 📁 File Structure
```
your-project/
├── chrome-monitor.js           # Main monitoring script
├── console-monitor.js          # Alternative simple monitor (optional)
└── Documentation/
    └── Real-Time-Console-Monitoring.md  # This document
```

---

## 🛡️ Security Notes

- The debug port (9222) is only accessible locally
- Uses temporary Chrome profile (`/tmp/chrome-debug`)
- No data is sent externally - monitoring is local only
- Debug session ends when Chrome is closed

---

## 💡 Advanced Usage

### Custom Tab Detection
Modify the monitor to find specific types of apps:
```javascript
// For React apps
tab.url.includes('localhost:3000') && tab.title.includes('React')

// For Google Apps Script
tab.url.includes('script.google.com')

// For Vercel deployments  
tab.url.includes('.vercel.app')

// For specific domains
tab.url.includes('yourdomain.com')
```

### Multiple Tab Monitoring
Extend the script to monitor multiple tabs simultaneously by connecting to multiple WebSocket endpoints.

### Log Filtering
Add filters to only show specific types of messages:
```javascript
// Only show errors
if (message.method === 'Runtime.exceptionThrown') {
  // Handle error
}

// Only show specific log levels
if (type === 'error' || type === 'warn') {
  // Handle critical messages
}
```

---

## 📞 Support

If you encounter issues:
1. Check Chrome started with debug flags: `curl http://localhost:9222/json`
2. Verify Node.js WebSocket dependency: `npm list ws`
3. Ensure target app is open in debug-enabled Chrome
4. Check monitor script can find your app tab

**This monitoring setup provides powerful real-time debugging capabilities that make development and troubleshooting much more efficient!**