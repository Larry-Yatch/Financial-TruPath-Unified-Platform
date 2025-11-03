/**
 * Comprehensive tests for Authentication.js - Auth flows
 * Tests cover roster validation, client lookup, session management, and security patterns
 */

// Mock Google Apps Script globals
const mockSpreadsheet = {
  getSheetByName: jest.fn(),
  getSheets: jest.fn(),
};

const mockSheet = {
  getSheetId: jest.fn(),
  getLastRow: jest.fn(),
  getRange: jest.fn(),
  getDataRange: jest.fn(),
};

const mockRange = {
  getDisplayValues: jest.fn(),
  getValues: jest.fn(),
  getValue: jest.fn(),
};

global.SpreadsheetApp = {
  openById: jest.fn(() => mockSpreadsheet),
};

global.Utilities = {
  getUuid: jest.fn(() => 'mock-session-uuid'),
};

global.DataHub = {
  getUnifiedProfile: jest.fn(),
};

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
};

// Import the module under test
const Authentication = require('./Authentication');

describe('Authentication.js - Auth Flows', () => {
  beforeAll(() => {
    console.log = mockConsole.log;
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet);
    mockSpreadsheet.getSheets.mockReturnValue([mockSheet]);
    mockSheet.getSheetId.mockReturnValue(123456);
    mockSheet.getLastRow.mockReturnValue(5);
    mockRange.getDisplayValues.mockReturnValue([]);
    mockRange.getValues.mockReturnValue([]);
    mockRange.getValue.mockReturnValue('');
    mockSheet.getRange.mockReturnValue(mockRange);
    mockSheet.getDataRange.mockReturnValue(mockRange);
  });

  describe('normalizeId()', () => {
    // Access normalizeId through the module exports or test it indirectly
    function testNormalization(input, expected) {
      // Since normalizeId is not exported, we test it through lookupClientById
      // This is integration testing that verifies the normalization logic
      mockRange.getDisplayValues.mockReturnValue([[expected]]);
      mockRange.getValue
        .mockReturnValueOnce('') // status check
        .mockReturnValueOnce('John') // firstName
        .mockReturnValueOnce('Doe') // lastName
        .mockReturnValueOnce('john@test.com'); // email

      const result = Authentication.lookupClientById(input);
      return result.success && result.clientId === expected;
    }

    test('should normalize IDs by removing spaces and special characters', () => {
      expect(testNormalization('TEST-001', 'TEST001')).toBe(true);
      expect(testNormalization('test_002', 'TEST002')).toBe(true);
      expect(testNormalization('TEST.003', 'TEST003')).toBe(true);
      expect(testNormalization('TEST/004', 'TEST004')).toBe(true);
    });

    test('should convert to uppercase', () => {
      expect(testNormalization('test001', 'TEST001')).toBe(true);
      expect(testNormalization('Test001', 'TEST001')).toBe(true);
    });

    test('should remove zero-width characters', () => {
      expect(testNormalization('TEST\u200B001', 'TEST001')).toBe(true);
      expect(testNormalization('TEST\uFEFF001', 'TEST001')).toBe(true);
    });

    test('should handle null and undefined input', () => {
      const result1 = Authentication.lookupClientById(null);
      const result2 = Authentication.lookupClientById(undefined);
      
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result1.error).toContain('Please enter your Client ID');
      expect(result2.error).toContain('Please enter your Client ID');
    });
  });

  describe('getRosterSheet()', () => {
    test('should find sheet by GID when available', () => {
      const testSheet = { getSheetId: () => 123456 };
      mockSpreadsheet.getSheets.mockReturnValue([
        { getSheetId: () => 111111 },
        testSheet,
        { getSheetId: () => 333333 }
      ]);

      // Test indirectly through lookupClientById
      mockRange.getDisplayValues.mockReturnValue([['TEST001']]);
      mockRange.getValue
        .mockReturnValueOnce('') // status
        .mockReturnValueOnce('John') // firstName
        .mockReturnValueOnce('Doe') // lastName
        .mockReturnValueOnce('john@test.com'); // email

      const result = Authentication.lookupClientById('TEST001');
      expect(result.success).toBe(true);
    });

    test('should fall back to sheet name when GID not found', () => {
      mockSpreadsheet.getSheets.mockReturnValue([
        { getSheetId: () => 111111 },
        { getSheetId: () => 222222 }
      ]);
      mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet);

      // Test fallback behavior
      mockRange.getDisplayValues.mockReturnValue([['TEST001']]);
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce('John')
        .mockReturnValueOnce('Doe')
        .mockReturnValueOnce('john@test.com');

      const result = Authentication.lookupClientById('TEST001');
      expect(result.success).toBe(true);
      expect(mockSpreadsheet.getSheetByName).toHaveBeenCalledWith('Students');
    });

    test('should handle spreadsheet access errors', () => {
      SpreadsheetApp.openById.mockImplementation(() => {
        throw new Error('Spreadsheet access denied');
      });

      const result = Authentication.lookupClientById('TEST001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('An error occurred during verification');
    });
  });

  describe('lookupClientById()', () => {
    beforeEach(() => {
      mockSheet.getLastRow.mockReturnValue(4);
      mockRange.getDisplayValues.mockReturnValue([
        ['TEST001'],
        ['TEST002'], 
        ['TEST003']
      ]);
    });

    test('should find valid client ID successfully', () => {
      mockRange.getValue
        .mockReturnValueOnce('') // status check (empty = active)
        .mockReturnValueOnce('John') // firstName
        .mockReturnValueOnce('Doe') // lastName
        .mockReturnValueOnce('john.doe@test.com'); // email

      DataHub.getUnifiedProfile.mockReturnValue({
        metadata: { completedTools: ['tool1'] }
      });

      const result = Authentication.lookupClientById('test-001');

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('TEST001');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@test.com');
      expect(result.fullName).toBe('John Doe');
      expect(result.hasCompletedTools).toBe(true);
    });

    test('should reject inactive accounts', () => {
      mockRange.getValue.mockReturnValueOnce('inactive'); // status check

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Your account is inactive');
    });

    test('should handle empty client ID input', () => {
      const result = Authentication.lookupClientById('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter your Client ID');
    });

    test('should handle whitespace-only input', () => {
      const result = Authentication.lookupClientById('   ');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter your Client ID');
    });

    test('should handle client ID not found', () => {
      mockRange.getDisplayValues.mockReturnValue([
        ['OTHER001'],
        ['OTHER002']
      ]);

      const result = Authentication.lookupClientById('NOTFOUND');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Client ID not found');
    });

    test('should handle empty roster', () => {
      mockSheet.getLastRow.mockReturnValue(1); // Only header row

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Roster is empty');
    });

    test('should handle missing roster sheet', () => {
      mockSpreadsheet.getSheetByName.mockReturnValue(null);
      mockSpreadsheet.getSheets.mockReturnValue([]);

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to access roster');
    });

    test('should handle DataHub profile check errors gracefully', () => {
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce('John')
        .mockReturnValueOnce('Doe')
        .mockReturnValueOnce('john@test.com');

      DataHub.getUnifiedProfile.mockImplementation(() => {
        throw new Error('Profile service error');
      });

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(true);
      expect(result.hasCompletedTools).toBe(false); // Should default to false on error
      expect(mockConsole.log).toHaveBeenCalledWith('Could not check tool completion status:', expect.any(Error));
    });

    test('should trim whitespace from client details', () => {
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce('  John  ') // firstName with spaces
        .mockReturnValueOnce('  Doe  ') // lastName with spaces
        .mockReturnValueOnce('  john@test.com  '); // email with spaces

      const result = Authentication.lookupClientById('TEST001');

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@test.com');
      expect(result.fullName).toBe('John Doe');
    });
  });

  describe('lookupClientByDetails()', () => {
    beforeEach(() => {
      mockSheet.getLastRow.mockReturnValue(4);
      mockRange.getValues.mockReturnValue([
        ['John', 'Doe', '555-1234', 'john.doe@test.com', 'TEST001', ''],
        ['Jane', 'Smith', '555-5678', 'jane.smith@test.com', 'TEST002', ''],
        ['Bob', 'Johnson', '555-9012', 'bob.johnson@test.com', 'TEST003', 'inactive']
      ]);
    });

    test('should find client with matching first name and last name', () => {
      const params = {
        firstName: 'John',
        lastName: 'Doe',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('TEST001');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.matchedOn).toBe('First Name & Last Name');
    });

    test('should find client with matching email and first name', () => {
      const params = {
        firstName: 'Jane',
        lastName: '',
        email: 'jane.smith@test.com'
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('TEST002');
      expect(result.matchedOn).toBe('First Name & Email');
    });

    test('should require at least 2 fields', () => {
      const params = {
        firstName: 'John',
        lastName: '',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Please provide at least 2 fields');
    });

    test('should skip inactive accounts', () => {
      const params = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No matching records found');
    });

    test('should handle multiple matches', () => {
      // Add another John Doe
      mockRange.getValues.mockReturnValue([
        ['John', 'Doe', '555-1234', 'john.doe@test.com', 'TEST001', ''],
        ['John', 'Doe', '555-5678', 'john.doe2@test.com', 'TEST004', '']
      ]);

      const params = {
        firstName: 'John',
        lastName: 'Doe',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Found 2 possible matches');
      expect(result.matches).toHaveLength(2);
    });

    test('should perform case-insensitive matching', () => {
      const params = {
        firstName: 'JOHN',
        lastName: 'DOE',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('TEST001');
    });

    test('should handle empty roster', () => {
      mockSheet.getLastRow.mockReturnValue(1);

      const params = {
        firstName: 'John',
        lastName: 'Doe',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Roster is empty');
    });

    test('should handle missing roster sheet', () => {
      mockSpreadsheet.getSheetByName.mockReturnValue(null);

      const params = {
        firstName: 'John',
        lastName: 'Doe',
        email: ''
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to access roster');
    });

    test('should handle all three fields matching', () => {
      const params = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(true);
      expect(result.matchedOn).toBe('First Name & Last Name & Email');
    });

    test('should trim and normalize input fields', () => {
      const params = {
        firstName: '  JOHN  ',
        lastName: '  DOE  ',
        email: '  JOHN.DOE@TEST.COM  '
      };

      const result = Authentication.lookupClientByDetails(params);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('TEST001');
    });
  });

  describe('createUserSession()', () => {
    const mockClientInfo = {
      clientId: 'TEST001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com'
    };

    test('should create session with all client information', () => {
      const session = Authentication.createUserSession(mockClientInfo);

      expect(session.sessionId).toBe('mock-session-uuid');
      expect(session.clientId).toBe('TEST001');
      expect(session.firstName).toBe('John');
      expect(session.lastName).toBe('Doe');
      expect(session.email).toBe('john.doe@test.com');
      expect(session.loginTime).toBeInstanceOf(Date);
      expect(session.lastActivity).toBeInstanceOf(Date);
    });

    test('should generate unique session ID', () => {
      Utilities.getUuid
        .mockReturnValueOnce('session-1')
        .mockReturnValueOnce('session-2');

      const session1 = Authentication.createUserSession(mockClientInfo);
      const session2 = Authentication.createUserSession(mockClientInfo);

      expect(session1.sessionId).toBe('session-1');
      expect(session2.sessionId).toBe('session-2');
    });

    test('should set current timestamp for login and activity', () => {
      const beforeTime = new Date();
      const session = Authentication.createUserSession(mockClientInfo);
      const afterTime = new Date();

      expect(session.loginTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(session.loginTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(session.lastActivity.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(session.lastActivity.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('verifySession()', () => {
    test('should verify valid session', () => {
      const result = Authentication.verifySession('valid-session-id', 'TEST001');

      expect(result).toBe(true);
    });

    test('should reject empty session ID', () => {
      const result = Authentication.verifySession('', 'TEST001');

      expect(result).toBe(false);
    });

    test('should reject null session ID', () => {
      const result = Authentication.verifySession(null, 'TEST001');

      expect(result).toBe(false);
    });

    test('should reject undefined session ID', () => {
      const result = Authentication.verifySession(undefined, 'TEST001');

      expect(result).toBe(false);
    });

    test('should reject empty client ID', () => {
      const result = Authentication.verifySession('valid-session-id', '');

      expect(result).toBe(false);
    });

    test('should reject null client ID', () => {
      const result = Authentication.verifySession('valid-session-id', null);

      expect(result).toBe(false);
    });

    test('should reject undefined client ID', () => {
      const result = Authentication.verifySession('valid-session-id', undefined);

      expect(result).toBe(false);
    });

    test('should handle whitespace-only client ID', () => {
      const result = Authentication.verifySession('valid-session-id', '   ');

      expect(result).toBe(false);
    });
  });

  describe('ROSTER configuration', () => {
    test('should have correct configuration values', () => {
      // Test ROSTER constants are properly defined
      // Since ROSTER is not exported, we test its usage indirectly
      
      // Verify the correct spreadsheet ID is used
      mockRange.getDisplayValues.mockReturnValue([['TEST001']]);
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce('John')
        .mockReturnValueOnce('Doe')
        .mockReturnValueOnce('john@test.com');

      Authentication.lookupClientById('TEST001');

      expect(SpreadsheetApp.openById).toHaveBeenCalledWith('18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24');
      expect(mockSpreadsheet.getSheetByName).toHaveBeenCalledWith('Students');
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle Google Sheets API errors gracefully', () => {
      mockSheet.getRange.mockImplementation(() => {
        throw new Error('API rate limit exceeded');
      });

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('An error occurred during verification');
      expect(mockConsole.error).toHaveBeenCalledWith('Lookup error:', expect.any(Error));
    });

    test('should handle missing cell values gracefully', () => {
      mockRange.getValue
        .mockReturnValueOnce('') // status
        .mockReturnValueOnce(null) // firstName
        .mockReturnValueOnce(undefined) // lastName
        .mockReturnValueOnce(''); // email

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(true);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
      expect(result.fullName).toBe(' '); // Space between empty strings
    });

    test('should handle non-string cell values', () => {
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce(123) // numeric firstName
        .mockReturnValueOnce(true) // boolean lastName
        .mockReturnValueOnce(['array']); // array email

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(true);
      expect(result.firstName).toBe('123');
      expect(result.lastName).toBe('true');
      expect(result.email).toBe('array');
    });

    test('should handle concurrent lookup requests', async () => {
      mockRange.getDisplayValues.mockReturnValue([['TEST001']]);
      mockRange.getValue
        .mockReturnValue('')
        .mockReturnValueOnce('John')
        .mockReturnValueOnce('Doe')
        .mockReturnValueOnce('john@test.com');

      // Simulate concurrent lookups
      const promises = Array.from({ length: 5 }, () => 
        Promise.resolve(Authentication.lookupClientById('TEST001'))
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.clientId).toBe('TEST001');
      });
    });

    test('should handle very long client IDs', () => {
      const longId = 'A'.repeat(1000);
      mockRange.getDisplayValues.mockReturnValue([[longId]]);
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce('John')
        .mockReturnValueOnce('Doe')
        .mockReturnValueOnce('john@test.com');

      const result = Authentication.lookupClientById(longId);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe(longId);
    });

    test('should handle special characters in names and emails', () => {
      mockRange.getValue
        .mockReturnValueOnce('')
        .mockReturnValueOnce("John O'Connor") // apostrophe
        .mockReturnValueOnce('Van Der Berg') // spaces and capitals
        .mockReturnValueOnce('john+test@gmail.com'); // plus sign

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(true);
      expect(result.firstName).toBe("John O'Connor");
      expect(result.lastName).toBe('Van Der Berg');
      expect(result.email).toBe('john+test@gmail.com');
    });
  });

  describe('Security considerations', () => {
    test('should not expose sensitive data in error messages', () => {
      const result = Authentication.lookupClientById('MALICIOUS-INPUT');

      expect(result.error).not.toContain('MALICIOUS-INPUT');
      expect(result.error).toBe('Client ID not found. Please check your ID and try again.');
    });

    test('should sanitize input data', () => {
      // Test with potential XSS/injection content
      const maliciousId = '<script>alert("xss")</script>';
      
      const result = Authentication.lookupClientById(maliciousId);

      // Should normalize to safe format
      expect(result.success).toBe(false);
      expect(result.error).not.toContain('<script>');
    });

    test('should limit error information disclosure', () => {
      SpreadsheetApp.openById.mockImplementation(() => {
        throw new Error('Internal database error with sensitive path: /secret/config');
      });

      const result = Authentication.lookupClientById('TEST001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during verification. Please try again.');
      expect(result.error).not.toContain('sensitive path');
    });
  });
});