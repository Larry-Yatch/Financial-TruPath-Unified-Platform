/**
 * DataHub - Unified Data Management for Financial TruPath V2.0
 * Single source of truth for all student data across tools
 */

const DataHub = {
  /**
   * Get unified profile for a student
   * @param {string} userId - Student's unique ID
   * @returns {Object} Complete student profile
   */
  getUnifiedProfile(userId) {
    const profile = {
      userId: userId,
      metadata: {
        created: this.getStudentCreatedDate(userId),
        lastActive: new Date(),
        courseWeek: getCurrentWeek(),
        completedTools: []
      },
      demographics: null,
      financialClarity: null,
      controlFear: null,
      insights: []
    };
    
    // Load data from each tool's sheet
    profile.demographics = this.loadToolData(userId, CONFIG.SHEETS.TOOL1_ORIENTATION);
    profile.financialClarity = this.loadToolData(userId, CONFIG.SHEETS.TOOL2_FINANCIAL_CLARITY);
    
    // Determine completed tools
    if (profile.demographics) profile.metadata.completedTools.push('orientation');
    if (profile.financialClarity) profile.metadata.completedTools.push('financial-clarity');
    
    // Generate cross-tool insights
    profile.insights = Middleware.generateInsights(profile);
    
    return profile;
  },
  
  /**
   * Save tool data for a student
   * @param {string} userId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Data to save
   * @returns {Object} Save result with insights
   */
  saveToolData(userId, toolId, data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheetName = '';
    
    switch(toolId) {
      case 'orientation':
        sheetName = CONFIG.SHEETS.TOOL1_ORIENTATION;
        break;
      case 'financial-clarity':
        sheetName = CONFIG.SHEETS.TOOL2_FINANCIAL_CLARITY;
        break;
      default:
        throw new Error(`Unknown tool: ${toolId}`);
    }
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = this.createToolSheet(sheetName, toolId);
    }
    
    // Add timestamp and user ID
    data.timestamp = new Date();
    data.userId = userId;
    
    // Find or create row for this user
    const row = this.findOrCreateUserRow(sheet, userId);
    
    // Update the row with new data
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = headers.map(header => {
      const key = this.headerToKey(header);
      return data[key] || '';
    });
    
    sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
    
    // Update student master record
    this.updateStudentRecord(userId, toolId);
    
    // Generate insights based on new data
    const profile = this.getUnifiedProfile(userId);
    const insights = Middleware.generateInsights(profile);
    
    return {
      success: true,
      insights: insights
    };
  },
  
  /**
   * Load tool data for a specific user
   * @param {string} userId - Student's unique ID
   * @param {string} sheetName - Name of the sheet to load from
   * @returns {Object|null} Tool data or null if not found
   */
  loadToolData(userId, sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return null;
    
    const headers = data[0];
    const userIdCol = headers.indexOf('User ID');
    
    if (userIdCol === -1) return null;
    
    // Find user's row
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdCol] === userId) {
        // Convert row to object
        const result = {};
        headers.forEach((header, index) => {
          const key = this.headerToKey(header);
          result[key] = data[i][index];
        });
        return result;
      }
    }
    
    return null;
  },
  
  /**
   * Convert header to key format
   * @param {string} header - Header text
   * @returns {string} Key format
   */
  headerToKey(header) {
    return header.replace(/\s+/g, '').charAt(0).toLowerCase() + 
           header.replace(/\s+/g, '').slice(1);
  },
  
  /**
   * Find or create user row in a sheet
   */
  findOrCreateUserRow(sheet, userId) {
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      // Add headers if sheet is empty
      const headers = this.getHeadersForTool('orientation');
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return 2; // First data row
    }
    
    const headers = data[0];
    const userIdCol = headers.indexOf('User ID');
    
    if (userIdCol === -1) {
      // Add User ID column if missing
      sheet.getRange(1, headers.length + 1).setValue('User ID');
      return data.length + 1;
    }
    
    // Find existing user row
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdCol] === userId) {
        return i + 1;
      }
    }
    
    // Return new row
    return data.length + 1;
  },
  
  /**
   * Get headers for a tool
   */
  getHeadersForTool(toolId) {
    switch(toolId) {
      case 'orientation':
        // Comprehensive 25-field assessment
        return [
          'Timestamp', 'User ID', 
          // Core Demographics (6)
          'First Name', 'Last Name', 'Email', 'Date of Birth', 'Marital Status', 'Dependents',
          // Employment & Income (5)
          'Employment Status', 'Profession', 'Annual Income', 'Other Income', 'Retirement Access',
          // Financial Snapshot (7)
          'Total Debt', 'Housing Cost', 'Monthly Expenses', 'Current Savings', 
          'Emergency Fund', 'Monthly Savings Capacity', 'Investment Experience',
          // Mindset (4)
          'Financial Situation', 'Money Relationship', 'Scarcity Abundance', 'Goal Confidence',
          // Goals (3)
          'Primary Goal', 'Retirement Age Target', 'Biggest Obstacle',
          // Calculated Scores
          'Financial Health Score', 'Mindset Score', 'Profile Type'
        ];
      case 'financial-clarity':
        return ['Timestamp', 'User ID', 'Income Score', 'Spending Score', 'Debt Score', 'Emergency Score'];
      default:
        return ['Timestamp', 'User ID', 'Data'];
    }
  },
  
  /**
   * Create tool sheet with headers
   */
  createToolSheet(sheetName, toolId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.insertSheet(sheetName);
    const headers = this.getHeadersForTool(toolId);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  },
  
  /**
   * Update student record in master list
   */
  updateStudentRecord(userId, toolId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    
    if (!studentsSheet) {
      studentsSheet = this.createStudentsSheet();
    }
    
    const row = this.findOrCreateUserRow(studentsSheet, userId);
    studentsSheet.getRange(row, 2).setValue(new Date()); // Last Active
  },
  
  /**
   * Create students sheet
   */
  createStudentsSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.insertSheet(CONFIG.SHEETS.STUDENTS);
    const headers = ['User ID', 'Last Active', 'Tools Completed', 'Created Date'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  },
  
  /**
   * Get student created date
   */
  getStudentCreatedDate(userId) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
      if (!sheet) return new Date();
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
          return data[i][3] || new Date();
        }
      }
    } catch (error) {
      console.error('Error getting created date:', error);
    }
    return new Date();
  }
}
