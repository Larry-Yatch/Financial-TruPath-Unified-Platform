/**
 * DataOperations.js - Centralized Data Operations Utility
 * Consolidates all saveToSheet/loadFromSheet patterns into reusable functions
 * Ensures consistent error handling and reduces code duplication
 */

const DataOperations = {
  
  /**
   * Centralized sheet operation with consistent error handling
   * @param {string} sheetName - Name of the sheet to operate on
   * @param {function} operation - Function to perform on the sheet
   * @param {string} operationName - Name for logging/error reporting
   * @returns {*} Operation result or error object
   */
  withSheet(sheetName, operation, operationName = 'sheet operation') {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        throw new Error(`Sheet '${sheetName}' not found`);
      }
      
      return operation(sheet);
      
    } catch (error) {
      console.error(`Error in ${operationName}:`, error);
      return {
        success: false,
        error: error.toString(),
        operation: operationName
      };
    }
  },

  /**
   * Generic save data to sheet with validation
   * @param {string} sheetName - Target sheet name
   * @param {Object} data - Data to save
   * @param {Array} headers - Expected headers for validation
   * @param {string} operationName - Operation name for logging
   * @returns {Object} Save result
   */
  saveToSheet(sheetName, data, headers = null, operationName = 'save data') {
    return this.withSheet(sheetName, (sheet) => {
      // Validate/create headers if provided
      if (headers) {
        const existingHeaders = this.getOrCreateHeaders(sheet, headers);
        if (!existingHeaders.success) {
          return existingHeaders;
        }
      }
      
      // Convert data object to array based on headers
      let rowData;
      if (headers) {
        rowData = headers.map(header => {
          const value = data[header];
          // Handle different data types appropriately
          if (value === undefined || value === null) {
            return '';
          }
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return String(value);
        });
      } else {
        // If no headers provided, assume data is already in correct array format
        rowData = Array.isArray(data) ? data : Object.values(data);
      }
      
      // Log the data being saved for debugging
      console.log(`Saving to ${sheetName}:`, rowData);
      
      // Try to append the row with error handling
      try {
        sheet.appendRow(rowData);
        
        // Force a flush to ensure the data is written
        SpreadsheetApp.flush();
        
        console.log(`Successfully saved to ${sheetName}`);
        
        return {
          success: true,
          message: `${operationName} completed successfully`,
          timestamp: new Date().toISOString(),
          rowData: rowData
        };
      } catch (appendError) {
        console.error(`Failed to append row to ${sheetName}:`, appendError);
        throw appendError;
      }
    }, operationName);
  },

  /**
   * Generic load data from sheet with filtering
   * @param {string} sheetName - Source sheet name
   * @param {Object} filter - Filter criteria {column: value}
   * @param {string} operationName - Operation name for logging
   * @returns {Object} Load result with data array
   */
  loadFromSheet(sheetName, filter = null, operationName = 'load data') {
    return this.withSheet(sheetName, (sheet) => {
      if (sheet.getLastRow() < 2) {
        return {
          success: true,
          data: [],
          message: 'No data found'
        };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      let rows = data.slice(1);
      
      // Apply filter if provided
      if (filter) {
        rows = this.applyFilter(rows, headers, filter);
      }
      
      return {
        success: true,
        data: rows,
        headers: headers,
        count: rows.length
      };
    }, operationName);
  },

  /**
   * Find specific record in sheet
   * @param {string} sheetName - Sheet to search
   * @param {Object} criteria - Search criteria {column: value}
   * @param {boolean} returnLatest - Return most recent match
   * @returns {Object} Found record or null
   */
  findRecord(sheetName, criteria, returnLatest = true) {
    return this.withSheet(sheetName, (sheet) => {
      if (sheet.getLastRow() < 2) {
        return { success: true, record: null };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const matches = this.applyFilter(rows, headers, criteria);
      
      if (matches.length === 0) {
        return { success: true, record: null };
      }
      
      // Return latest (last) match or first match
      const record = returnLatest ? matches[matches.length - 1] : matches[0];
      
      // Convert array back to object using headers
      const recordObj = {};
      headers.forEach((header, index) => {
        recordObj[header] = record[index];
      });
      
      return {
        success: true,
        record: recordObj,
        matchCount: matches.length
      };
    }, 'find record');
  },

  /**
   * Update specific record in sheet
   * @param {string} sheetName - Sheet to update
   * @param {Object} criteria - Find criteria
   * @param {Object} updates - Fields to update
   * @returns {Object} Update result
   */
  updateRecord(sheetName, criteria, updates) {
    return this.withSheet(sheetName, (sheet) => {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Find matching row
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let matches = true;
        
        for (const [column, value] of Object.entries(criteria)) {
          const colIndex = headers.indexOf(column);
          if (colIndex === -1 || row[colIndex] !== value) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          // Update the row
          for (const [column, value] of Object.entries(updates)) {
            const colIndex = headers.indexOf(column);
            if (colIndex !== -1) {
              sheet.getRange(i + 1, colIndex + 1).setValue(value);
            }
          }
          
          return {
            success: true,
            message: 'Record updated successfully',
            rowIndex: i + 1
          };
        }
      }
      
      return {
        success: false,
        error: 'Record not found for update'
      };
    }, 'update record');
  },

  /**
   * Get or create headers for a sheet
   * @param {Sheet} sheet - Sheet object
   * @param {Array} expectedHeaders - Headers to ensure exist
   * @returns {Object} Result with success status
   */
  getOrCreateHeaders(sheet, expectedHeaders) {
    try {
      const lastCol = sheet.getLastColumn();
      let existingHeaders = [];
      
      if (lastCol > 0) {
        existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      }
      
      // Check if headers need to be created or updated
      if (existingHeaders.length === 0 || !this.headersMatch(existingHeaders, expectedHeaders)) {
        sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
        sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        return {
          success: true,
          message: 'Headers created/updated',
          headers: expectedHeaders
        };
      }
      
      return {
        success: true,
        headers: existingHeaders
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Header operation failed: ${error.toString()}`
      };
    }
  },

  /**
   * Check if existing headers match expected headers
   * @param {Array} existing - Existing headers
   * @param {Array} expected - Expected headers
   * @returns {boolean} True if headers match
   */
  headersMatch(existing, expected) {
    if (existing.length !== expected.length) {
      return false;
    }
    
    for (let i = 0; i < expected.length; i++) {
      if (existing[i] !== expected[i]) {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Apply filter criteria to rows
   * @param {Array} rows - Data rows
   * @param {Array} headers - Column headers
   * @param {Object} filter - Filter criteria
   * @returns {Array} Filtered rows
   */
  applyFilter(rows, headers, filter) {
    return rows.filter(row => {
      for (const [column, value] of Object.entries(filter)) {
        const colIndex = headers.indexOf(column);
        if (colIndex === -1 || row[colIndex] !== value) {
          return false;
        }
      }
      return true;
    });
  },

  /**
   * Standardized error response
   * @param {string} operation - Operation name
   * @param {Error|string} error - Error object or message
   * @returns {Object} Standardized error response
   */
  createError(operation, error) {
    return {
      success: false,
      error: error.toString(),
      operation: operation,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Standardized success response
   * @param {string} operation - Operation name
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Standardized success response
   */
  createSuccess(operation, data = null, message = 'Operation completed successfully') {
    const response = {
      success: true,
      operation: operation,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    return response;
  }
};

/**
 * Test DataOperations utility
 */
function testDataOperations() {
  const testData = {
    'Test_Field_1': 'Value 1',
    'Test_Field_2': 'Value 2',
    'Timestamp': new Date().toISOString()
  };
  
  const headers = ['Test_Field_1', 'Test_Field_2', 'Timestamp'];
  
  // Test save
  const saveResult = DataOperations.saveToSheet('TEST_OPERATIONS', testData, headers, 'test save');
  console.log('Save result:', saveResult);
  
  // Test load
  const loadResult = DataOperations.loadFromSheet('TEST_OPERATIONS', null, 'test load');
  console.log('Load result:', loadResult);
  
  // Test find
  const findResult = DataOperations.findRecord('TEST_OPERATIONS', { 'Test_Field_1': 'Value 1' });
  console.log('Find result:', findResult);
  
  return 'DataOperations test complete';
}