# Financial TruPath V2.0 - Quick Start Guide

## 🚀 Getting Started

### Step 1: Open the Google Sheet
Open your Financial TruPath V2.0 spreadsheet in Google Sheets.

### Step 2: Refresh the Page
If you don't see the menu, refresh the page. The custom menu "Financial TruPath V2.0" should appear in the menu bar.

### Step 3: Initialize the Platform
1. Click **Financial TruPath V2.0** → **Initialize Platform**
2. This will create necessary data sheets and test the roster connection

### Step 4: Test Authentication
1. Click **Financial TruPath V2.0** → **🔐 Authentication** → **Test Authentication System**
2. This will verify:
   - Roster spreadsheet connection
   - Column mappings are correct
   - Sample Client IDs can be retrieved
   - Authentication lookups work

### Step 5: Deploy the Web App
1. Click **Extensions** → **Apps Script**
2. Click **Deploy** → **New Deployment**
3. Configure:
   - **Type**: Web app
   - **Execute as**: Me (your account)
   - **Who has access**: Anyone (or restrict as needed)
4. Click **Deploy**
5. Copy the Web App URL

### Step 6: Test the Web Interface
1. Open the Web App URL in your browser
2. You should see the login page
3. Test login with a Client ID from column G of the roster

## 🔐 Authentication Menu Functions

All functions are under **Financial TruPath V2.0** → **🔐 Authentication**:

- **Test Authentication System**: Comprehensive test of the entire auth system
- **Test Roster Connection**: Verify connection to roster spreadsheet
- **Get Sample Client IDs**: Display first 5 Client IDs from roster
- **Test Session Management**: Test session creation and validation

## 📊 Roster Configuration

Your roster is configured to use:
- **Spreadsheet ID**: `104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo`
- **Sheet Name**: "Financial v2 (24SEPT25 start)"
- **Sheet GID**: 753820167

Column mappings:
- **Column C**: First Name
- **Column D**: Last Name
- **Column E**: Phone
- **Column F**: Email
- **Column G**: Student ID/Client ID
- **Column H**: Status (optional)

## 🧪 Testing Functions

Additional testing tools under **Financial TruPath V2.0** → **🧪 Testing**:
- **Run All Tests**: Execute complete test suite
- **Test Data Saving**: Test saving form data to sheets
- **Test Web App**: Display deployment status and URLs

## 🔍 Debug Tools

Debug utilities under **Financial TruPath V2.0** → **🔍 Debug**:
- **System Health Check**: Verify all components are working
- **Check Common Issues**: Scan for typical problems
- **Clear Test Data**: Remove test entries (IDs starting with "TEST-")

## 🌐 URL Routes

Once deployed, your web app supports these routes:
- **Login**: `[base-url]` or `[base-url]?route=login`
- **Dashboard**: `[base-url]?route=dashboard&client=[ID]&session=[sessionId]`
- **Tool**: `[base-url]?route=tool&tool=orientation&client=[ID]&session=[sessionId]`
- **Admin Panel**: `[base-url]?route=admin&key=admin2024`

## ⚡ Quick Test

To quickly verify everything is working:

1. **In the Spreadsheet**:
   - Run: **Financial TruPath V2.0** → **🔐 Authentication** → **Test Authentication System**
   - You should see "✓ Roster Access: Connected" and other success indicators

2. **In the Web App**:
   - Visit your deployed URL
   - Try logging in with a Client ID from the roster
   - You should reach the dashboard

## 🆘 Troubleshooting

If authentication tests fail:
1. Verify you have access to the roster spreadsheet
2. Check that "Financial v2 (24SEPT25 start)" tab exists
3. Ensure Client IDs are in column G
4. Run **System Health Check** from the Debug menu

If menu doesn't appear:
1. Refresh the page
2. Make sure you're in the correct spreadsheet
3. Check that all .js files are present in Apps Script editor

## 📝 Notes

- All test Client IDs should start with "TEST-" for easy cleanup
- The admin panel password is currently "admin2024" (change in production)
- Session data is stored client-side; no real-time sync between devices
- Each tool submission is saved immediately to Google Sheets