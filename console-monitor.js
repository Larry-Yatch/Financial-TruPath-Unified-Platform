/**
 * Console Monitor - Captures browser console output to file
 * Usage: Include this in your HTML pages to log all console activity
 */

class ConsoleMonitor {
  constructor() {
    this.logs = [];
    this.originalConsole = {};
    this.setupInterception();
    this.startFileLogging();
  }

  setupInterception() {
    const methods = ['log', 'warn', 'error', 'info', 'debug'];
    
    methods.forEach(method => {
      this.originalConsole[method] = console[method];
      console[method] = (...args) => {
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          level: method,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          stack: method === 'error' ? new Error().stack : null
        };
        
        this.logs.push(logEntry);
        this.sendToServer(logEntry);
        
        // Call original console method
        this.originalConsole[method].apply(console, args);
      };
    });
  }

  sendToServer(logEntry) {
    // Send to Google Apps Script endpoint for file logging
    const payload = {
      action: 'logConsole',
      data: logEntry,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    fetch(window.location.origin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      this.originalConsole.error('Failed to send log to server:', err);
    });
  }

  startFileLogging() {
    // Periodic batch send of all logs
    setInterval(() => {
      if (this.logs.length > 0) {
        const batch = [...this.logs];
        this.logs = [];
        
        fetch(window.location.origin, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'logBatch',
            data: batch
          })
        }).catch(err => {
          this.originalConsole.error('Failed to send log batch:', err);
        });
      }
    }, 5000); // Send every 5 seconds
  }
}

// Auto-start monitoring
if (typeof window !== 'undefined') {
  window.consoleMonitor = new ConsoleMonitor();
}