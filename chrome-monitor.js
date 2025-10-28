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

  async findTruPathTab() {
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

            // Find TruPath tab (look for keywords in URL or title)
            const truPathTab = tabs.find(tab => 
              tab.url.includes('script.google.com') ||
              tab.url.includes('googleusercontent.com') ||
              tab.title.toLowerCase().includes('trupath') ||
              tab.title.toLowerCase().includes('financial')
            );

            if (truPathTab) {
              console.log(`✅ Found TruPath tab: ${truPathTab.title}`);
              resolve(truPathTab);
            } else {
              console.log('❌ TruPath tab not found. Available tabs:');
              tabs.forEach(tab => console.log(`  - ${tab.title}: ${tab.url}`));
              reject(new Error('TruPath tab not found'));
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
      
      const tab = await this.findTruPathTab();
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