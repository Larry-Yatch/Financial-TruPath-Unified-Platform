/**
 * RefactorTests.js - Test Suite for Refactored Components
 * Validates that all refactored code works correctly in Google Apps Script environment
 */

const RefactorTests = {
  
  /**
   * Run all refactor validation tests
   */
  runAllTests() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    console.log('🧪 Starting Refactor Validation Tests...');
    
    try {
      // Test DataOperations utility
      results.tests.dataOperations = this.testDataOperations();
      
      // Test refactored DataService
      results.tests.dataService = this.testDataService();
      
      // Test refactored Authentication
      results.tests.authentication = this.testAuthentication();
      
      // Test refactored Session management
      results.tests.sessionManagement = this.testSessionManagement();
      
      // Calculate summary
      for (const [testName, result] of Object.entries(results.tests)) {
        results.summary.total++;
        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      }
      
      // Display results
      this.displayResults(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Test suite error:', error);
      return {
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Test DataOperations utility
   */
  testDataOperations() {
    try {
      console.log('📊 Testing DataOperations...');
      
      // Test basic sheet operations
      const testData = {
        Test_Field_1: 'Refactor Test Value',
        Test_Field_2: new Date().toISOString(),
        Test_Field_3: 'SUCCESS'
      };
      
      const headers = ['Test_Field_1', 'Test_Field_2', 'Test_Field_3'];
      
      // Test save operation
      const saveResult = DataOperations.saveToSheet(
        'REFACTOR_TESTS',
        testData,
        headers,
        'refactor test save'
      );
      
      if (!saveResult.success) {
        return {
          success: false,
          error: 'Save operation failed: ' + saveResult.error,
          test: 'DataOperations'
        };
      }
      
      // Test load operation
      const loadResult = DataOperations.loadFromSheet(
        'REFACTOR_TESTS',
        null,
        'refactor test load'
      );
      
      if (!loadResult.success) {
        return {
          success: false,
          error: 'Load operation failed: ' + loadResult.error,
          test: 'DataOperations'
        };
      }
      
      // Test find operation
      const findResult = DataOperations.findRecord(
        'REFACTOR_TESTS',
        { Test_Field_1: 'Refactor Test Value' }
      );
      
      if (!findResult.success || !findResult.record) {
        return {
          success: false,
          error: 'Find operation failed',
          test: 'DataOperations'
        };
      }
      
      return {
        success: true,
        message: 'All DataOperations tests passed',
        details: {
          saveResult: saveResult.success,
          loadResult: loadResult.success,
          findResult: !!findResult.record,
          recordsFound: loadResult.count
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.toString(),
        test: 'DataOperations'
      };
    }
  },
  
  /**
   * Test refactored DataService
   */
  testDataService() {
    try {
      console.log('🔧 Testing DataService...');
      
      const testClientId = 'REFACTOR_TEST_001';
      const testToolId = 'test_tool';
      
      // Test draft saving with new helper methods
      const draftData = {
        field1: 'draft test value',
        field2: 42,
        timestamp: new Date().toISOString()
      };
      
      const draftResult = DataService.saveToolDraftToProperties(
        testClientId,
        testToolId,
        draftData,
        'MANUAL'
      );
      
      if (!draftResult.success) {
        return {
          success: false,
          error: 'Draft save failed: ' + draftResult.error,
          test: 'DataService'
        };
      }
      
      // Test draft retrieval
      const retrieveResult = DataService.getToolDraftFromProperties(
        testClientId,
        testToolId,
        false
      );
      
      if (!retrieveResult || retrieveResult.length === 0) {
        return {
          success: false,
          error: 'Draft retrieval failed',
          test: 'DataService'
        };
      }
      
      // Test response saving with new centralized operations
      const responseData = {
        question1: 'answer1',
        question2: 'answer2',
        completed: true
      };
      
      const responseResult = DataService.saveToolResponse(
        testClientId,
        testToolId,
        responseData
      );
      
      if (!responseResult.success) {
        return {
          success: false,
          error: 'Response save failed: ' + responseResult.error,
          test: 'DataService'
        };
      }
      
      return {
        success: true,
        message: 'All DataService tests passed',
        details: {
          draftSave: draftResult.success,
          draftRetrieve: retrieveResult.length > 0,
          responseSave: responseResult.success
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.toString(),
        test: 'DataService'
      };
    }
  },
  
  /**
   * Test refactored Authentication
   */
  testAuthentication() {
    try {
      console.log('🔐 Testing Authentication...');
      
      // Test the helper functions exist and work
      const testClientId = 'TEST_REFACTOR_001';
      
      // Test input validation
      const validationResult = _validateClientInput(testClientId);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Input validation failed',
          test: 'Authentication'
        };
      }
      
      // Test ID normalization
      const normalizedId = normalizeId(' test-id_123 ');
      if (normalizedId !== 'TESTID123') {
        return {
          success: false,
          error: 'ID normalization failed',
          test: 'Authentication'
        };
      }
      
      // Test roster sheet access (should use DataOperations now)
      const rosterSheet = getRosterSheet();
      if (!rosterSheet || rosterSheet.error) {
        return {
          success: false,
          error: 'Roster sheet access failed: ' + (rosterSheet?.error || 'Unknown error'),
          test: 'Authentication'
        };
      }
      
      return {
        success: true,
        message: 'All Authentication tests passed',
        details: {
          inputValidation: true,
          idNormalization: true,
          rosterAccess: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.toString(),
        test: 'Authentication'
      };
    }
  },
  
  /**
   * Test refactored Session management
   */
  testSessionManagement() {
    try {
      console.log('🔒 Testing Session Management...');
      
      const testClientId = 'REFACTOR_SESSION_TEST';
      
      // Test session creation with new DataOperations
      const sessionResult = createSession(testClientId);
      
      if (!sessionResult.success) {
        return {
          success: false,
          error: 'Session creation failed: ' + sessionResult.error,
          test: 'SessionManagement'
        };
      }
      
      // Test session validation
      const validationResult = validateSession(sessionResult.data.sessionId);
      
      if (!validationResult.valid) {
        return {
          success: false,
          error: 'Session validation failed: ' + validationResult.error,
          test: 'SessionManagement'
        };
      }
      
      // Test finding active session
      const findResult = findActiveSession(testClientId);
      
      if (!findResult || !findResult.success) {
        return {
          success: false,
          error: 'Find active session failed',
          test: 'SessionManagement'
        };
      }
      
      return {
        success: true,
        message: 'All Session Management tests passed',
        details: {
          sessionCreation: true,
          sessionValidation: true,
          sessionFind: true,
          sessionId: sessionResult.data.sessionId
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.toString(),
        test: 'SessionManagement'
      };
    }
  },
  
  /**
   * Display test results in Google Apps Script UI
   */
  displayResults(results) {
    const { summary, tests } = results;
    
    let message = `🧪 REFACTOR VALIDATION RESULTS\n\n`;
    message += `📊 Summary: ${summary.passed}/${summary.total} tests passed\n\n`;
    
    for (const [testName, result] of Object.entries(tests)) {
      const status = result.success ? '✅' : '❌';
      message += `${status} ${testName}: ${result.success ? 'PASSED' : 'FAILED'}\n`;
      
      if (!result.success) {
        message += `   Error: ${result.error}\n`;
      } else if (result.details) {
        message += `   Details: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      message += '\n';
    }
    
    if (summary.failed === 0) {
      message += `🎉 ALL TESTS PASSED! Refactoring is working correctly.\n`;
      message += `The refactored code is ready for production use.`;
    } else {
      message += `⚠️ ${summary.failed} test(s) failed. Please review the errors above.`;
    }
    
    // Display in UI if available
    try {
      SpreadsheetApp.getUi().alert(
        'Refactor Validation Results',
        message,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } catch (e) {
      console.log(message);
    }
    
    console.log('🏁 Test Results:', results);
  },
  
  /**
   * Clean up test data
   */
  cleanupTestData() {
    try {
      // Clean up test sheets and properties
      const testClientIds = ['REFACTOR_TEST_001', 'REFACTOR_SESSION_TEST'];
      
      testClientIds.forEach(clientId => {
        try {
          // Clean up Properties Service data
          const props = PropertiesService.getUserProperties();
          const allProps = props.getProperties();
          
          Object.keys(allProps).forEach(key => {
            if (key.includes(clientId) || key.includes('REFACTOR')) {
              props.deleteProperty(key);
            }
          });
          
        } catch (e) {
          console.warn('Error cleaning up test data for', clientId, ':', e);
        }
      });
      
      console.log('✅ Test data cleanup completed');
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
};

/**
 * Convenient function to run tests from menu
 */
function runRefactorValidationTests() {
  return RefactorTests.runAllTests();
}

/**
 * Convenient function to clean up test data
 */
function cleanupRefactorTestData() {
  return RefactorTests.cleanupTestData();
}