// Jest setup file for Google Sheets integration tests

// Mock Google APIs
const mockGoogleAuth = {
  fromJSON: jest.fn(),
};

const mockSheetsApi = {
  spreadsheets: {
    values: {
      get: jest.fn(),
      update: jest.fn(),
      append: jest.fn(),
    },
  },
};

const mockGoogle = {
  auth: mockGoogleAuth,
  sheets: jest.fn(() => mockSheetsApi),
};

// Mock file system operations
const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
};

// Mock path operations
const mockPath = {
  join: jest.fn((...args) => args.join('/')),
};

// Mock os operations
const mockOs = {
  homedir: jest.fn(() => '/mock/home'),
};

// Mock Google Apps Script globals for DataService and Authentication tests
global.SpreadsheetApp = {
  openById: jest.fn(),
};

global.PropertiesService = {
  getUserProperties: jest.fn(),
};

global.Utilities = {
  getUuid: jest.fn(() => 'mock-uuid-123'),
};

global.CONFIG = {
  MASTER_SHEET_ID: 'test-sheet-id',
  VERSION: '2.0',
  SHEETS: {
    RESPONSES: 'RESPONSES',
    TOOL_STATUS: 'TOOL_STATUS',
    INSIGHTS: 'CrossToolInsights',
    ACTIVITY_LOG: 'ACTIVITY_LOG',
  },
};

global.DataHub = {
  getUnifiedProfile: jest.fn(),
};

// Export mocks for use in tests
global.__mocks__ = {
  google: mockGoogle,
  fs: mockFs,
  path: mockPath,
  os: mockOs,
  googleAuth: mockGoogleAuth,
  sheetsApi: mockSheetsApi,
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});