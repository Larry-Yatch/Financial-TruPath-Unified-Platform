/**
 * DataService.js - Core Data Management for Financial TruPath V2.0
 * Handles all data operations for tools and responses
 * Foundation for cross-tool data flow
 * Refactored to use centralized DataOperations utility
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
   * Save a tool draft (incomplete submission)
   * @param {string} clientId - Client/User ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Form data
   * @param {Object} progress - Progress information
   * @param {string} status - 'DRAFT' or 'COMPLETED'
   * @returns {Object} Result with success status
   */
  saveToolDraftToSheet(clientId, toolId, data, progress, status = 'DRAFT') {
    if (!this._validateDraftParams(clientId, toolId)) {
      return DataOperations.createError('save draft', 'Invalid parameters');
    }
    
    console.log(`Saving Tool Draft - Client: ${clientId}, Tool: ${toolId}, Status: ${status}`);
    
    const draftRecord = this._prepareDraftRecord(clientId, toolId, data, progress, status);
    const headers = ['Timestamp', 'Session_ID', 'Client_ID', 'Tool_ID', 'Version', 'Status', 'Progress'];
    
    const result = DataOperations.saveToSheet(
      CONFIG.SHEETS.RESPONSES,
      draftRecord,
      headers,
      'save tool draft'
    );
    
    if (result.success) {
      console.log('Draft saved successfully');
      return {
        success: true,
        message: 'Draft saved',
        draftId: draftRecord.Session_ID
      };
    }
    
    return result;
  },
  
  /**
   * Get the most recent draft for a tool
   * @param {string} clientId - Client/User ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Draft data or null
   */
  getToolDraftFromSheet(clientId, toolId) {
    const result = DataOperations.findRecord(
      CONFIG.SHEETS.RESPONSES,
      { Client_ID: clientId, Tool_ID: toolId, Status: 'DRAFT' },
      true // return latest
    );
    
    if (!result.success || !result.record) {
      return null;
    }
    
    try {
      return {
        timestamp: result.record.Timestamp,
        sessionId: result.record.Session_ID,
        clientId: result.record.Client_ID,
        toolId: result.record.Tool_ID,
        data: JSON.parse(result.record.Version || '{}'),
        status: result.record.Status || 'DRAFT',
        progress: JSON.parse(result.record.Progress || '{}')
      };
    } catch (error) {
      console.error('Error parsing draft data:', error);
      return null;
    }
  },
  
  /**
   * Get specific draft by ID
   * @param {string} draftId - Draft session ID
   * @returns {Object|null} Draft data or null
   */
  getSpecificDraft(draftId) {
    const result = DataOperations.findRecord(
      CONFIG.SHEETS.RESPONSES,
      { Session_ID: draftId },
      false // return first match
    );
    
    if (!result.success || !result.record) {
      return null;
    }
    
    try {
      return {
        timestamp: result.record.Timestamp,
        sessionId: result.record.Session_ID,
        clientId: result.record.Client_ID,
        toolId: result.record.Tool_ID,
        data: JSON.parse(result.record.Version || '{}'),
        status: result.record.Status || 'COMPLETED',
        progress: JSON.parse(result.record.Progress || '{}')
      };
    } catch (error) {
      console.error('Error parsing specific draft data:', error);
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
    if (!this._validateResponseParams(clientId, toolId, data)) {
      return DataOperations.createError('save response', 'Invalid parameters');
    }
    
    console.log(`Saving Tool Response - Client: ${clientId}, Tool: ${toolId}`);
    
    const responseRecord = this._prepareResponseRecord(clientId, toolId, data);
    const headers = ['Timestamp', 'Client_ID', 'Tool_ID', 'Version', 'Session_ID'];
    
    const result = DataOperations.saveToSheet(
      CONFIG.SHEETS.RESPONSES,
      responseRecord,
      headers,
      'save tool response'
    );
    
    if (!result.success) {
      return result;
    }
    
    // Post-save operations with graceful error handling
    const insights = this._handlePostSaveOperations(clientId, toolId, data);
    
    return DataOperations.createSuccess(
      'save tool response',
      { insights },
      `${toolId} response saved successfully`
    );
  },
  
  /**
   * Save tool draft (for auto-save and manual save)
   * AUTO saves overwrite latest only, MANUAL saves create versions (up to 3)
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @param {Object} draftData - Draft data to save
   * @param {string} saveType - 'AUTO' (overwrites latest) or 'MANUAL' (creates version)
   * @returns {Object} Result with success status
   */
  saveToolDraftToProperties(clientId, toolId, draftData, saveType = 'AUTO') {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const latestKey = `draft_${clientId}_${toolId}_latest`;
      const manualVersionsKey = `drafts_${clientId}_${toolId}_manual_versions`;
      
      // Create base draft object
      const draft = {
        id: Utilities.getUuid(),
        data: draftData,
        timestamp: new Date().toISOString(),
        clientId: clientId,
        toolId: toolId,
        saveType: saveType
      };
      
      if (saveType === 'AUTO') {
        // AUTO saves: Just overwrite the latest draft, no versioning
        userProperties.setProperty(latestKey, JSON.stringify(draft));
        
        return {
          success: true,
          message: 'Auto-draft saved successfully',
          timestamp: draft.timestamp,
          saveType: 'AUTO',
          versionCount: 0
        };
        
      } else if (saveType === 'MANUAL') {
        // MANUAL saves: Create version AND update latest
        
        // Get existing manual versions or initialize empty array
        let manualVersions = [];
        const existingVersions = userProperties.getProperty(manualVersionsKey);
        if (existingVersions) {
          try {
            manualVersions = JSON.parse(existingVersions);
          } catch (e) {
            console.warn('Error parsing existing manual versions, starting fresh');
            manualVersions = [];
          }
        }
        
        // Get global version counter for this user/tool
        const versionCounterKey = `draft_counter_${clientId}_${toolId}`;
        let versionCounter = parseInt(userProperties.getProperty(versionCounterKey) || '0');
        versionCounter++;
        
        // Add version number for manual saves
        draft.version = versionCounter;
        draft.label = `Manual Save - ${Math.round(draftData.progress || 0)}% Complete`;
        
        // Update version counter
        userProperties.setProperty(versionCounterKey, versionCounter.toString());
        
        // Add to beginning of manual versions array
        manualVersions.unshift(draft);
        
        // Keep only the 3 most recent manual versions
        if (manualVersions.length > 3) {
          manualVersions = manualVersions.slice(0, 3);
        }
        
        // Save the manual versions array
        userProperties.setProperty(manualVersionsKey, JSON.stringify(manualVersions));
        
        // Also update the latest draft
        userProperties.setProperty(latestKey, JSON.stringify(draft));
        
        return {
          success: true,
          message: 'Manual save created successfully',
          timestamp: draft.timestamp,
          saveType: 'MANUAL',
          versionCount: manualVersions.length,
          version: draft.version,
          label: draft.label
        };
      } else {
        throw new Error(`Invalid saveType: ${saveType}. Must be 'AUTO' or 'MANUAL'`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },
  
  /**
   * Get tool draft(s) - updated for new versioning strategy
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @param {boolean} getAllVersions - If true, returns manual versions + latest
   * @returns {Object} Draft data or object with versions info
   */
  getToolDraftFromProperties(clientId, toolId, getAllVersions = false) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const latestKey = `draft_${clientId}_${toolId}_latest`;
      const manualVersionsKey = `drafts_${clientId}_${toolId}_manual_versions`;
      
      if (getAllVersions) {
        // Return manual versions + latest
        const manualVersionsJson = userProperties.getProperty(manualVersionsKey);
        const latestJson = userProperties.getProperty(latestKey);
        
        let manualVersions = [];
        if (manualVersionsJson) {
          try {
            manualVersions = JSON.parse(manualVersionsJson);
          } catch (e) {
            console.warn('Error parsing manual versions');
          }
        }
        
        let latest = null;
        if (latestJson) {
          try {
            latest = JSON.parse(latestJson);
          } catch (e) {
            console.warn('Error parsing latest draft');
          }
        }
        
        return {
          manualVersions: manualVersions,
          manualCount: manualVersions.length,
          latest: latest,
          hasData: (manualVersions.length > 0 || latest !== null)
        };
      } else {
        // Return just the latest draft (for backward compatibility, wrap in array format)
        const latestJson = userProperties.getProperty(latestKey);
        
        if (latestJson) {
          try {
            const latest = JSON.parse(latestJson);
            // Return as array for backward compatibility with existing code
            return [latest];
          } catch (e) {
            console.warn('Error parsing latest draft');
            return [];
          }
        }
        
        // No latest draft found - return empty array for backward compatibility
        return [];
      }
    } catch (error) {
      console.error('Error getting draft:', error);
      return []; // Return empty array for backward compatibility
    }
  },
  
  /**
   * Get a specific draft version by ID
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier  
   * @param {string} draftId - Draft ID
   * @returns {Object} Specific draft or null
   */
  getSpecificDraftVersion(clientId, toolId, draftId) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const latestKey = `draft_${clientId}_${toolId}_latest`;
      const manualVersionsKey = `drafts_${clientId}_${toolId}_manual_versions`;
      
      // Check if it's the latest draft
      const latestJson = userProperties.getProperty(latestKey);
      if (latestJson) {
        const latest = JSON.parse(latestJson);
        if (latest.id === draftId) {
          return latest;
        }
      }
      
      // Check manual versions
      const manualVersionsJson = userProperties.getProperty(manualVersionsKey);
      if (manualVersionsJson) {
        const manualVersions = JSON.parse(manualVersionsJson);
        const draft = manualVersions.find(v => v.id === draftId);
        if (draft) {
          return draft;
        }
      }
      
      // Fallback: check old storage format for backward compatibility
      const oldVersionsKey = `drafts_${clientId}_${toolId}_versions`;
      const oldVersionsJson = userProperties.getProperty(oldVersionsKey);
      if (oldVersionsJson) {
        const oldVersions = JSON.parse(oldVersionsJson);
        const draft = oldVersions.find(v => v.id === draftId);
        if (draft) {
          return draft;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting specific draft:', error);
      return null;
    }
  },
  
  /**
   * Get all draft versions for a tool (used by ToolWrapper Load button)
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Object with versions array and metadata
   */
  getAllDraftVersions(clientId, toolId) {
    try {
      // Use the existing getToolDraft function with getAllVersions=true
      return this.getToolDraftFromProperties(clientId, toolId, true);
    } catch (error) {
      console.error('Error getting all draft versions:', error);
      return {
        versions: [],
        count: 0,
        latest: null
      };
    }
  },
  
  /**
   * Get a specific draft by ID (used by ToolWrapper Load button)
   * @param {string} draftId - Draft ID
   * @param {string} clientId - Student's unique ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Specific draft or null
   */
  getSpecificDraft(draftId, clientId, toolId) {
    try {
      return this.getSpecificDraftVersion(clientId, toolId, draftId);
    } catch (error) {
      console.error('Error getting specific draft:', error);
      return null;
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
      console.log(`🔧 DataService.getToolResponse called - clientId: ${clientId}, toolId: ${toolId}`);
      
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
      
      console.log(`📋 Found sheet: ${responseSheet ? 'YES' : 'NO'}, rows: ${responseSheet ? responseSheet.getLastRow() : 0}`);
      
      if (!responseSheet || responseSheet.getLastRow() < 2) {
        console.log(`❌ No data found - sheet: ${!!responseSheet}, rows: ${responseSheet ? responseSheet.getLastRow() : 0}`);
        return null;
      }
      
      // Get all data
      const data = responseSheet.getDataRange().getValues();
      const headers = data[0];
      
      console.log(`📊 Headers found:`, headers);
      console.log(`📈 Total rows: ${data.length}`);
      
      // Find column indices
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const responseDataCol = headers.indexOf('Version'); // Data is actually in Version column!
      const timestampCol = headers.indexOf('Response_ID'); // Timestamp is in Response_ID column!
      
      console.log(`🔍 Column indices - ClientID: ${clientIdCol}, ToolID: ${toolIdCol}, ResponseData: ${responseDataCol}`);
      
      if (clientIdCol === -1 || toolIdCol === -1 || responseDataCol === -1) {
        console.error('❌ Required columns not found in RESPONSES sheet');
        return null;
      }
      
      // Find the most recent response for this client and tool
      let latestResponse = null;
      let latestTimestamp = null;
      let matchCount = 0;
      
      console.log(`🔎 Searching for clientId: "${clientId}", toolId: "${toolId}"`);
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        console.log(`📝 Row ${i}: ClientID="${row[clientIdCol]}", ToolID="${row[toolIdCol]}"`);
        
        if (row[clientIdCol] === clientId && row[toolIdCol] === toolId) {
          matchCount++;
          console.log(`✅ Match found! Row ${i}`);
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
      
      console.log(`🏁 Search complete - Matches found: ${matchCount}`);
      
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
      
      if (clientIdCol === -1 || toolIdCol === -1 || responseDataCol === -1) {
        console.error('Required columns not found in RESPONSES sheet');
        return {};
      }
      
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
      
      if (clientIdCol === -1 || toolIdCol === -1 || statusCol === -1) {
        console.error('Required columns not found in TOOL_STATUS sheet');
        return {};
      }
      
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
      
      if (clientIdCol === -1 || sourceToolCol === -1 || insightTypeCol === -1 || 
          insightCol === -1 || priorityCol === -1 || usedByCol === -1) {
        console.error('Required columns not found in CrossToolInsights sheet');
        return [];
      }
      
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
    const logData = {
      Timestamp: new Date().toISOString(),
      Client_ID: clientId,
      Activity: activity,
      Session_ID: this.getCurrentSessionId() || 'no-session'
    };
    
    const headers = ['Timestamp', 'Client_ID', 'Activity', 'Session_ID'];
    
    DataOperations.saveToSheet(
      CONFIG.SHEETS.ACTIVITY_LOG,
      logData,
      headers,
      'log activity'
    );
  },
  
  // ===== HELPER METHODS =====
  
  /**
   * Validate draft parameters
   * @private
   */
  _validateDraftParams(clientId, toolId) {
    return !!(clientId && toolId);
  },
  
  /**
   * Validate response parameters
   * @private
   */
  _validateResponseParams(clientId, toolId, data) {
    return !!(clientId && toolId && data);
  },
  
  /**
   * Prepare draft record for saving
   * @private
   */
  _prepareDraftRecord(clientId, toolId, data, progress, status) {
    const timestamp = new Date().toISOString();
    const sessionId = this.getCurrentSessionId() || 'draft-' + Utilities.getUuid();
    
    return {
      Timestamp: timestamp,
      Session_ID: sessionId,
      Client_ID: clientId,
      Tool_ID: toolId,
      Version: JSON.stringify(data),
      Status: status,
      Progress: JSON.stringify(progress || {})
    };
  },
  
  /**
   * Prepare response record for saving
   * @private
   */
  _prepareResponseRecord(clientId, toolId, data) {
    const timestamp = new Date().toISOString();
    const sessionId = this.getCurrentSessionId();
    
    if (!sessionId) {
      console.warn('No active session found, saving with no-session marker');
    }
    
    return {
      Timestamp: timestamp,
      Client_ID: clientId,
      Tool_ID: toolId,
      Version: JSON.stringify(data),
      Session_ID: sessionId || 'no-session'
    };
  },
  
  /**
   * Handle post-save operations with error handling
   * @private
   */
  _handlePostSaveOperations(clientId, toolId, data) {
    let insights = [];
    
    // Update tool status (with error handling)
    try {
      this.updateToolStatus(clientId, toolId, 'completed');
    } catch (statusError) {
      console.warn('Could not update tool status:', statusError);
    }
    
    // Trigger insight generation (with error handling)
    try {
      insights = this.triggerInsightGeneration(clientId, toolId, data);
    } catch (insightError) {
      console.warn('Could not generate insights:', insightError);
    }
    
    // Log the activity (with error handling)
    try {
      this.logActivity(clientId, `Saved ${toolId} response`);
    } catch (logError) {
      console.warn('Could not log activity:', logError);
    }
    
    return insights;
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

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
}