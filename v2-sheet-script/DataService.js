/**
 * DataService.js - Core Data Management for Financial TruPath V2.0
 * Handles all data operations for tools and responses
 * Foundation for cross-tool data flow
 */

const DataService = {
  /**
   * Get current session ID from PropertiesService or session context
   * @returns {string|null} Current session ID or null
   */
  getCurrentSessionId() {
    try {
      // Try to get from PropertiesService (Google Apps Script)
      if (typeof PropertiesService !== 'undefined') {
        const userProperties = PropertiesService.getUserProperties();
        return userProperties.getProperty('sessionId');
      }
      // Fallback to global if available
      if (typeof Session !== 'undefined' && Session.currentSessionId) {
        return Session.currentSessionId;
      }
      return null;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  },
  
  /**
   * Save tool response data to Google Sheets
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier (tool1, tool2, etc.)
   * @param {Object} data - Response data from tool
   * @returns {Object} Result with save status and any generated insights
   */
  saveToolResponse(clientId, toolId, data) {
    try {
      // Validate inputs
      if (!clientId || !toolId || !data) {
        throw new Error(`Invalid parameters: clientId=${clientId}, toolId=${toolId}, data exists=${!!data}`);
      }
      
      console.log(`Saving Tool Response - Client: ${clientId}, Tool: ${toolId}`);
      
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
      
      if (!responseSheet) {
        throw new Error('RESPONSES sheet not found');
      }
      
      // Prepare response data
      const timestamp = new Date();
      const sessionId = this.getCurrentSessionId();
      
      // Log warning if no session but continue saving
      if (!sessionId) {
        console.warn('No active session found, saving with no-session marker');
      }
      
      const responseRecord = {
        timestamp: timestamp.toISOString(),
        clientId: clientId,
        toolId: toolId,
        data: JSON.stringify(data),
        version: CONFIG.VERSION,
        sessionId: sessionId || 'no-session'
      };
      
      // Get headers or create them
      let headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn() || 1).getValues()[0];
      if (!headers[0]) {
        // Initialize headers if sheet is empty
        headers = ['Timestamp', 'Client_ID', 'Tool_ID', 'Response_Data', 'Version', 'Session_ID'];
        responseSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      // Add new response row
      const newRow = [
        responseRecord.timestamp,
        responseRecord.clientId,
        responseRecord.toolId,
        responseRecord.data,
        responseRecord.version,
        responseRecord.sessionId
      ];
      
      responseSheet.appendRow(newRow);
      
      // Update tool status
      this.updateToolStatus(clientId, toolId, 'completed');
      
      // Trigger insight generation (will connect to InsightEngine later)
      const insights = this.triggerInsightGeneration(clientId, toolId, data);
      
      // Log the activity
      this.logActivity(clientId, `Saved ${toolId} response`);
      
      return {
        success: true,
        message: `${toolId} response saved successfully`,
        timestamp: timestamp,
        insights: insights || []
      };
      
    } catch (error) {
      console.error('Error saving tool response:', error);
      return {
        success: false,
        error: error.toString(),
        message: `Failed to save ${toolId} response`
      };
    }
  },
  
  /**
   * Get tool response data for a client
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier (tool1, tool2, etc.)
   * @returns {Object} Tool response data or null if not found
   */
  getToolResponse(clientId, toolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
      
      if (!responseSheet || responseSheet.getLastRow() < 2) {
        return null;
      }
      
      // Get all data
      const data = responseSheet.getDataRange().getValues();
      const headers = data[0];
      
      // Find column indices
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const responseDataCol = headers.indexOf('Response_Data');
      const timestampCol = headers.indexOf('Timestamp');
      
      if (clientIdCol === -1 || toolIdCol === -1 || responseDataCol === -1) {
        console.error('Required columns not found in RESPONSES sheet');
        return null;
      }
      
      // Find the most recent response for this client and tool
      let latestResponse = null;
      let latestTimestamp = null;
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[clientIdCol] === clientId && row[toolIdCol] === toolId) {
          const timestamp = row[timestampCol] ? new Date(row[timestampCol]) : null;
          if (!latestTimestamp || (timestamp && timestamp > latestTimestamp)) {
            latestTimestamp = timestamp;
            try {
              latestResponse = JSON.parse(row[responseDataCol]);
            } catch (e) {
              // If JSON parse fails, return raw data
              latestResponse = row[responseDataCol];
            }
          }
        }
      }
      
      if (latestResponse) {
        return {
          clientId: clientId,
          toolId: toolId,
          data: latestResponse,
          timestamp: latestTimestamp,
          found: true
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting tool response:', error);
      return null;
    }
  },
  
  /**
   * Get all tool responses for a client
   * @param {string} clientId - Student's unique ID
   * @returns {Object} Map of toolId to response data
   */
  getAllToolResponses(clientId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
      
      if (!responseSheet || responseSheet.getLastRow() < 2) {
        return {};
      }
      
      const data = responseSheet.getDataRange().getValues();
      const headers = data[0];
      
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const responseDataCol = headers.indexOf('Response_Data');
      const timestampCol = headers.indexOf('Timestamp');
      
      const responses = {};
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[clientIdCol] === clientId) {
          const toolId = row[toolIdCol];
          const timestamp = row[timestampCol] ? new Date(row[timestampCol]) : null;
          
          // Keep only the most recent response for each tool
          if (!responses[toolId] || 
              (timestamp && (!responses[toolId].timestamp || timestamp > responses[toolId].timestamp))) {
            try {
              responses[toolId] = {
                data: JSON.parse(row[responseDataCol]),
                timestamp: timestamp
              };
            } catch (e) {
              responses[toolId] = {
                data: row[responseDataCol],
                timestamp: timestamp
              };
            }
          }
        }
      }
      
      return responses;
      
    } catch (error) {
      console.error('Error getting all tool responses:', error);
      return {};
    }
  },
  
  /**
   * Update tool completion status for a client
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @param {string} status - Status (not_started, in_progress, completed)
   * @returns {boolean} Success status
   */
  updateToolStatus(clientId, toolId, status) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const statusSheet = ss.getSheetByName(CONFIG.SHEETS.TOOL_STATUS);
      
      if (!statusSheet) {
        console.error('TOOL_STATUS sheet not found');
        return false;
      }
      
      // Get or create headers
      let headers = statusSheet.getRange(1, 1, 1, statusSheet.getLastColumn() || 1).getValues()[0];
      if (!headers[0]) {
        headers = ['Client_ID', 'Tool_ID', 'Status', 'Last_Updated', 'Completion_Date'];
        statusSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');
      const lastUpdatedCol = headers.indexOf('Last_Updated');
      const completionDateCol = headers.indexOf('Completion_Date');
      
      // Find existing row or create new one
      const data = statusSheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId && data[i][toolIdCol] === toolId) {
          rowIndex = i + 1; // Sheet rows are 1-indexed
          break;
        }
      }
      
      const timestamp = new Date().toISOString();
      const completionDate = (status === 'completed') ? timestamp : '';
      
      if (rowIndex > 0) {
        // Update existing row
        statusSheet.getRange(rowIndex, statusCol + 1).setValue(status);
        statusSheet.getRange(rowIndex, lastUpdatedCol + 1).setValue(timestamp);
        if (status === 'completed') {
          statusSheet.getRange(rowIndex, completionDateCol + 1).setValue(completionDate);
        }
      } else {
        // Add new row
        const newRow = new Array(headers.length);
        newRow[clientIdCol] = clientId;
        newRow[toolIdCol] = toolId;
        newRow[statusCol] = status;
        newRow[lastUpdatedCol] = timestamp;
        newRow[completionDateCol] = completionDate;
        statusSheet.appendRow(newRow);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error updating tool status:', error);
      return false;
    }
  },
  
  /**
   * Get tool completion status for a client
   * @param {string} clientId - Student's unique ID
   * @returns {Object} Map of toolId to status
   */
  getToolStatuses(clientId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const statusSheet = ss.getSheetByName(CONFIG.SHEETS.TOOL_STATUS);
      
      if (!statusSheet || statusSheet.getLastRow() < 2) {
        return {};
      }
      
      const data = statusSheet.getDataRange().getValues();
      const headers = data[0];
      
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');
      
      const statuses = {};
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId) {
          statuses[data[i][toolIdCol]] = data[i][statusCol];
        }
      }
      
      return statuses;
      
    } catch (error) {
      console.error('Error getting tool statuses:', error);
      return {};
    }
  },
  
  /**
   * Trigger insight generation after tool completion
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @param {Object} toolData - Tool response data
   * @returns {Array} Generated insights
   */
  triggerInsightGeneration(clientId, toolId, toolData) {
    try {
      // This will be connected to InsightEngine.js in Session 4
      // For now, return placeholder insights
      
      const insights = [];
      
      // Generate basic insights based on tool
      if (toolId === 'tool1') {
        // Tool 1: Orientation insights
        if (toolData.age && toolData.age > 50) {
          insights.push({
            type: 'demographic',
            insight: 'Age 50+ - Consider retirement planning focus',
            priority: 'HIGH'
          });
        }
        
        if (toolData.income && toolData.income < 50000) {
          insights.push({
            type: 'financial',
            insight: 'Lower income bracket - Focus on budgeting',
            priority: 'HIGH'
          });
        }
        
        if (toolData.primaryConcern) {
          insights.push({
            type: 'goal',
            insight: `Primary concern: ${toolData.primaryConcern}`,
            priority: 'CRITICAL'
          });
        }
      }
      
      // Save insights to CrossToolInsights sheet
      if (insights.length > 0) {
        this.saveInsights(clientId, toolId, insights);
      }
      
      return insights;
      
    } catch (error) {
      console.error('Error triggering insight generation:', error);
      return [];
    }
  },
  
  /**
   * Save insights to CrossToolInsights sheet
   * @param {string} clientId - Student's unique ID
   * @param {string} sourceToolId - Source tool that generated insights
   * @param {Array} insights - Array of insight objects
   */
  saveInsights(clientId, sourceToolId, insights) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let insightSheet = ss.getSheetByName(CONFIG.SHEETS.INSIGHTS);
      
      if (!insightSheet) {
        // Create sheet if it doesn't exist
        insightSheet = ss.insertSheet(CONFIG.SHEETS.INSIGHTS);
        const headers = ['Timestamp', 'Client_ID', 'Source_Tool', 'Insight_Type', 'Insight', 'Priority', 'Used_By_Tool'];
        insightSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      const timestamp = new Date().toISOString();
      
      insights.forEach(insight => {
        const row = [
          timestamp,
          clientId,
          sourceToolId,
          insight.type || 'general',
          insight.insight,
          insight.priority || 'MEDIUM',
          '' // Will be updated when other tools use this insight
        ];
        insightSheet.appendRow(row);
      });
      
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  },
  
  /**
   * Get relevant insights for a tool
   * @param {string} clientId - Student's unique ID
   * @param {string} targetToolId - Tool requesting insights
   * @returns {Array} Relevant insights from previous tools
   */
  getRelevantInsights(clientId, targetToolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const insightSheet = ss.getSheetByName(CONFIG.SHEETS.INSIGHTS);
      
      if (!insightSheet || insightSheet.getLastRow() < 2) {
        return [];
      }
      
      const data = insightSheet.getDataRange().getValues();
      const headers = data[0];
      
      const clientIdCol = headers.indexOf('Client_ID');
      const sourceToolCol = headers.indexOf('Source_Tool');
      const insightTypeCol = headers.indexOf('Insight_Type');
      const insightCol = headers.indexOf('Insight');
      const priorityCol = headers.indexOf('Priority');
      const usedByCol = headers.indexOf('Used_By_Tool');
      
      const insights = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId) {
          const insight = {
            sourceTool: data[i][sourceToolCol],
            type: data[i][insightTypeCol],
            insight: data[i][insightCol],
            priority: data[i][priorityCol]
          };
          
          insights.push(insight);
          
          // Update Used_By_Tool column
          const currentUsedBy = data[i][usedByCol] || '';
          if (!currentUsedBy.includes(targetToolId)) {
            const newUsedBy = currentUsedBy ? `${currentUsedBy},${targetToolId}` : targetToolId;
            insightSheet.getRange(i + 1, usedByCol + 1).setValue(newUsedBy);
          }
        }
      }
      
      // Sort by priority
      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      insights.sort((a, b) => {
        return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      });
      
      return insights;
      
    } catch (error) {
      console.error('Error getting relevant insights:', error);
      return [];
    }
  },
  
  /**
   * Log activity to ACTIVITY_LOG sheet
   * @param {string} clientId - Student's unique ID
   * @param {string} activity - Activity description
   */
  logActivity(clientId, activity) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const logSheet = ss.getSheetByName(CONFIG.SHEETS.ACTIVITY_LOG);
      
      if (!logSheet) {
        return;
      }
      
      const timestamp = new Date().toISOString();
      const sessionId = this.getCurrentSessionId() || 'no-session';
      
      logSheet.appendRow([timestamp, clientId, activity, sessionId]);
      
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
};

/**
 * Test DataService functionality
 */
function testDataService() {
  const testClientId = 'TEST001';
  const testToolId = 'tool1';
  
  // Test data
  const testData = {
    age: 35,
    income: 75000,
    primaryConcern: 'retirement_planning',
    debtLevel: 'moderate',
    savingsGoal: 100000,
    timestamp: new Date().toISOString()
  };
  
  console.log('Testing DataService...');
  
  // Test saving tool response
  const saveResult = DataService.saveToolResponse(testClientId, testToolId, testData);
  console.log('Save result:', saveResult);
  
  // Test getting tool response
  const getResult = DataService.getToolResponse(testClientId, testToolId);
  console.log('Get result:', getResult);
  
  // Test getting all responses
  const allResponses = DataService.getAllToolResponses(testClientId);
  console.log('All responses:', allResponses);
  
  // Test getting tool statuses
  const statuses = DataService.getToolStatuses(testClientId);
  console.log('Tool statuses:', statuses);
  
  // Test getting insights
  const insights = DataService.getRelevantInsights(testClientId, 'tool2');
  console.log('Relevant insights:', insights);
  
  return 'DataService test complete - check logs';
}