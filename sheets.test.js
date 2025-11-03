/**
 * Comprehensive tests for sheets.js - Google Sheets API operations
 * Tests cover authentication, data fetching, error handling, and edge cases
 */

// Mock modules before requiring the target file
jest.mock('googleapis');
jest.mock('fs');
jest.mock('path');
jest.mock('os');

const fs = require('fs');
const path = require('path');
const os = require('os');
const { google } = require('googleapis');

// Import the module under test
const sheets = require('./sheets');

describe('sheets.js - Google Sheets API Operations', () => {
  let mockAuth;
  let mockSheetsService;
  let mockSpreadsheets;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Google API mocks
    mockAuth = { credentials: 'mock-credentials' };
    mockSpreadsheets = {
      values: {
        get: jest.fn(),
      },
    };
    mockSheetsService = {
      spreadsheets: mockSpreadsheets,
    };

    google.auth.fromJSON.mockReturnValue(mockAuth);
    google.sheets.mockReturnValue(mockSheetsService);

    // Setup file system mocks
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ type: 'authorized_user' }));
    
    // Setup path mocks
    path.join.mockImplementation((...args) => args.join('/'));
    os.homedir.mockReturnValue('/mock/home');

    // Reset cached auth to ensure fresh tests
    if (sheets.__resetAuth) {
      sheets.__resetAuth();
    }
  });

  describe('Authentication (getAuth)', () => {
    test('should find and use token from first valid path', async () => {
      const mockTokenPath = '/mock/home/.google-sheets-auth/token.json';
      const mockToken = { type: 'authorized_user', refresh_token: 'test' };

      fs.existsSync.mockImplementation((searchPath) => 
        searchPath === mockTokenPath
      );
      fs.readFileSync.mockReturnValue(JSON.stringify(mockToken));

      // Access getAuth through test method since it's not exported directly
      const result = await sheets.test();
      
      expect(fs.existsSync).toHaveBeenCalledWith(mockTokenPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockTokenPath, 'utf8');
      expect(google.auth.fromJSON).toHaveBeenCalledWith(mockToken);
    });

    test('should try multiple token paths in order', async () => {
      const paths = [
        '/mock/home/.google-sheets-auth/token.json',
        '/mock/home/.config/claude-mcp-global/token.json',
        '/mock/home/code/Control_Fear_Investment_Tool/mcp-exploration/token.json',
      ];

      // Mock first two paths as not existing, third one exists
      fs.existsSync.mockImplementation((searchPath) => 
        searchPath === paths[2]
      );

      await sheets.test();

      expect(fs.existsSync).toHaveBeenCalledWith(paths[0]);
      expect(fs.existsSync).toHaveBeenCalledWith(paths[1]);
      expect(fs.existsSync).toHaveBeenCalledWith(paths[2]);
    });

    test('should cache authentication after first call', async () => {
      // First call
      await sheets.test();
      google.auth.fromJSON.mockClear();
      
      // Second call
      await sheets.test();
      
      expect(google.auth.fromJSON).not.toHaveBeenCalled();
    });

    test('should handle missing token gracefully', async () => {
      fs.existsSync.mockReturnValue(false);
      
      // Mock process.exit to prevent actual exit in tests
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called');
      });
      
      await expect(sheets.test()).rejects.toThrow();
      
      mockExit.mockRestore();
    });

    test('should handle invalid JSON token file', async () => {
      fs.readFileSync.mockReturnValue('invalid json');
      
      await expect(sheets.test()).rejects.toThrow();
    });
  });

  describe('fetch() - Basic data fetching', () => {
    beforeEach(() => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Header1', 'Header2', 'Header3'],
            ['Value1', 'Value2', 'Value3'],
            ['Value4', 'Value5', 'Value6'],
          ],
        },
      });
    });

    test('should fetch data from spreadsheet with default range', async () => {
      const testSheetId = '1234567890';
      const result = await sheets.fetch(testSheetId);

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: testSheetId,
        range: 'A:Z',
      });

      expect(result).toEqual([
        ['Header1', 'Header2', 'Header3'],
        ['Value1', 'Value2', 'Value3'],
        ['Value4', 'Value5', 'Value6'],
      ]);
    });

    test('should fetch data with custom range', async () => {
      const testSheetId = '1234567890';
      const customRange = 'Sheet1!A1:C10';
      
      await sheets.fetch(testSheetId, customRange);

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: testSheetId,
        range: customRange,
      });
    });

    test('should resolve shorthand sheet keys from SHEETS object', async () => {
      await sheets.fetch('scenarios');

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: sheets.SHEETS.scenarios,
        range: 'A:Z',
      });
    });

    test('should return empty array when no values returned', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {},
      });

      const result = await sheets.fetch('test-sheet');
      expect(result).toEqual([]);
    });

    test('should return empty array when values is null', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: { values: null },
      });

      const result = await sheets.fetch('test-sheet');
      expect(result).toEqual([]);
    });
  });

  describe('Error handling in fetch()', () => {
    test('should handle 403 permission denied error', async () => {
      const error = new Error('Permission denied');
      error.code = 403;
      mockSpreadsheets.values.get.mockRejectedValue(error);

      await expect(sheets.fetch('test-sheet')).rejects.toThrow('Permission denied');
    });

    test('should handle 404 not found error', async () => {
      const error = new Error('Not found');
      error.code = 404;
      mockSpreadsheets.values.get.mockRejectedValue(error);

      await expect(sheets.fetch('test-sheet')).rejects.toThrow('Not found');
    });

    test('should handle generic API errors', async () => {
      const error = new Error('API Error');
      error.code = 500;
      mockSpreadsheets.values.get.mockRejectedValue(error);

      await expect(sheets.fetch('test-sheet')).rejects.toThrow('API Error');
    });

    test('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockSpreadsheets.values.get.mockRejectedValue(error);

      await expect(sheets.fetch('test-sheet')).rejects.toThrow('Network timeout');
    });
  });

  describe('fetchAsObjects() - Object conversion', () => {
    test('should convert sheet data to objects using header row', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Age', 'City'],
            ['John', '25', 'NYC'],
            ['Jane', '30', 'LA'],
          ],
        },
      });

      const result = await sheets.fetchAsObjects('test-sheet');

      expect(result).toEqual([
        { Name: 'John', Age: '25', City: 'NYC' },
        { Name: 'Jane', Age: '30', City: 'LA' },
      ]);
    });

    test('should handle missing values in rows', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Age', 'City'],
            ['John', '25'],  // Missing City
            ['Jane'],        // Missing Age and City
          ],
        },
      });

      const result = await sheets.fetchAsObjects('test-sheet');

      expect(result).toEqual([
        { Name: 'John', Age: '25', City: '' },
        { Name: 'Jane', Age: '', City: '' },
      ]);
    });

    test('should return empty array for sheets with only headers', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [['Header1', 'Header2']],
        },
      });

      const result = await sheets.fetchAsObjects('test-sheet');
      expect(result).toEqual([]);
    });

    test('should return empty array for empty sheets', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const result = await sheets.fetchAsObjects('test-sheet');
      expect(result).toEqual([]);
    });

    test('should handle sheets with single header row', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [['SingleHeader']],
        },
      });

      const result = await sheets.fetchAsObjects('test-sheet');
      expect(result).toEqual([]);
    });
  });

  describe('test() - Connection testing', () => {
    test('should return true on successful connection', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [['test', 'data']],
        },
      });

      const result = await sheets.test();
      expect(result).toBe(true);
    });

    test('should return false on connection failure', async () => {
      mockSpreadsheets.values.get.mockRejectedValue(new Error('Connection failed'));

      const result = await sheets.test();
      expect(result).toBe(false);
    });

    test('should test against scenarios sheet by default', async () => {
      await sheets.test();

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: sheets.SHEETS.scenarios,
        range: 'A1:C2',
      });
    });
  });

  describe('saveLocal() - Local file operations', () => {
    beforeEach(() => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Value'],
            ['Test1', '100'],
            ['Test2', '200'],
          ],
        },
      });
    });

    test('should save sheet data as JSON to default filename', async () => {
      const result = await sheets.saveLocal('test-sheet');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'sheet-data.json',
        JSON.stringify([
          { Name: 'Test1', Value: '100' },
          { Name: 'Test2', Value: '200' },
        ], null, 2)
      );

      expect(result).toEqual([
        { Name: 'Test1', Value: '100' },
        { Name: 'Test2', Value: '200' },
      ]);
    });

    test('should save sheet data to custom filename', async () => {
      await sheets.saveLocal('test-sheet', 'custom-file.json');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'custom-file.json',
        expect.any(String)
      );
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(sheets.saveLocal('test-sheet')).rejects.toThrow('Permission denied');
    });
  });

  describe('Convenience shortcuts', () => {
    beforeEach(() => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['ID', 'Name'],
            ['1', 'Test'],
          ],
        },
      });
    });

    test('scenarios() should fetch scenarios sheet as objects', async () => {
      const result = await sheets.scenarios();

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: sheets.SHEETS.scenarios,
        range: 'A:Z',
      });

      expect(result).toEqual([{ ID: '1', Name: 'Test' }]);
    });

    test('roster() should fetch roster sheet as objects', async () => {
      const result = await sheets.roster();

      expect(mockSpreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: sheets.SHEETS.roster,
        range: 'A:Z',
      });

      expect(result).toEqual([{ ID: '1', Name: 'Test' }]);
    });
  });

  describe('SHEETS configuration', () => {
    test('should have correct sheet IDs configured', () => {
      expect(sheets.SHEETS).toHaveProperty('scenarios');
      expect(sheets.SHEETS).toHaveProperty('roster');
      expect(sheets.SHEETS).toHaveProperty('v2_data');
      expect(sheets.SHEETS).toHaveProperty('sessions');
      expect(sheets.SHEETS).toHaveProperty('responses');
      expect(sheets.SHEETS).toHaveProperty('tool_status');

      // V2 sheets should all point to the same spreadsheet
      expect(sheets.SHEETS.v2_data).toBe('18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24');
      expect(sheets.SHEETS.sessions).toBe(sheets.SHEETS.v2_data);
      expect(sheets.SHEETS.responses).toBe(sheets.SHEETS.v2_data);
      expect(sheets.SHEETS.tool_status).toBe(sheets.SHEETS.v2_data);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle large datasets efficiently', async () => {
      // Simulate large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => [`Row${i}`, `Value${i}`]);
      largeData.unshift(['Header1', 'Header2']);

      mockSpreadsheets.values.get.mockResolvedValue({
        data: { values: largeData },
      });

      const result = await sheets.fetchAsObjects('large-sheet');
      
      expect(result).toHaveLength(1000);
      expect(result[0]).toEqual({ Header1: 'Row0', Header2: 'Value0' });
      expect(result[999]).toEqual({ Header1: 'Row999', Header2: 'Value999' });
    });

    test('should handle concurrent requests', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: { values: [['Header'], ['Value']] },
      });

      const promises = Array.from({ length: 5 }, (_, i) => 
        sheets.fetch(`sheet-${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(mockSpreadsheets.values.get).toHaveBeenCalledTimes(5);
    });

    test('should maintain authentication across multiple operations', async () => {
      mockSpreadsheets.values.get.mockResolvedValue({
        data: { values: [['test']] },
      });

      // Multiple operations
      await sheets.fetch('sheet1');
      await sheets.fetchAsObjects('sheet2');
      await sheets.test();

      // Auth should only be created once due to caching
      expect(google.auth.fromJSON).toHaveBeenCalledTimes(1);
      expect(google.sheets).toHaveBeenCalledTimes(3);
    });
  });
});