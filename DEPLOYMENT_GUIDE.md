# Financial TruPath V2.0 - Deployment Guide

## 📋 Quick Deployment Steps

### 1. Open Your Master Spreadsheet
Go to: https://docs.google.com/spreadsheets/d/18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24/edit

### 2. Initialize the Platform
1. In the spreadsheet menu bar, click **Financial TruPath V2.0**
2. Select **Initialize Platform** to create necessary sheets
3. Select **Test Web App** to verify setup

### 3. Deploy as Web App
1. From the spreadsheet: **Extensions** → **Apps Script**
2. In Apps Script editor: **Deploy** → **New Deployment**
3. Configure deployment:
   - **Type**: Web app
   - **Description**: Financial TruPath V2.0 Platform
   - **Execute as**: Me (your account)
   - **Who has access**: 
     - "Anyone" for public access
     - "Anyone with Google account" for authentication
     - "Only myself" for testing
4. Click **Deploy**
5. Copy the Web App URL provided

### 4. Test the Web App
1. Open the Web App URL in your browser
2. You should see:
   - Financial TruPath V2.0 header
   - Current course week (Week 1)
   - Tool 1: Orientation available
   - Tool 2: Financial Clarity (locked until Week 2)

### 5. Test Tool 1 (Orientation)
1. Click on "Tool 1: Orientation"
2. Fill out the form with test data
3. Click "Save & Continue"
4. Check the master spreadsheet for saved data in:
   - **Students** sheet - New student record
   - **Tool1_Orientation** sheet - Form data
   - **SystemLogs** sheet - Activity logs

## 🔧 Configuration Options

### Adjust Course Start Date
In **Config.js**, update:
```javascript
COURSE_START_DATE: new Date('2024-10-14'), // Your actual start date
```

### Enable/Disable Features
In **Config.js**, modify:
```javascript
FEATURES: {
  AUTO_SAVE: true,           // Auto-save every 30 seconds
  CROSS_TOOL_INTELLIGENCE: true, // Generate insights
  WEEKLY_LOCKS: true,        // Lock tools by week
  DEBUG_MODE: false          // Enable debug logging
}
```

### Add Script Properties (Optional)
For enhanced security, add these in Apps Script:
1. **Project Settings** → **Script Properties**
2. Add:
   - `GPT_API_KEY`: Your OpenAI API key (if using)
   - `ADMIN_EMAIL`: Admin email for notifications

## 📊 Monitoring & Debugging

### View Logs
- In spreadsheet: **Financial TruPath V2.0** → **View Logs**
- Check **SystemLogs** sheet for all events

### Test Platform Status
- In spreadsheet: **Financial TruPath V2.0** → **Test Web App**
- Shows deployment status and configuration

### Common Issues & Solutions

**Issue: "Web App URL: null"**
- Solution: Deploy the web app following Step 3 above

**Issue: "Current Week: 50" (or wrong week)**
- Solution: Update COURSE_START_DATE in Config.js

**Issue: Data not saving**
- Check permissions on master spreadsheet
- Verify sheet names match CONFIG.SHEETS
- Check SystemLogs for errors

**Issue: Tool locked when it shouldn't be**
- Verify COURSE_START_DATE is correct
- Set FEATURES.WEEKLY_LOCKS to false for testing

## 🚀 Production Checklist

Before going live with students:

- [ ] Deploy web app with appropriate access level
- [ ] Test all forms with sample data
- [ ] Verify data saves to correct sheets
- [ ] Check cross-tool insights generation
- [ ] Test on mobile devices
- [ ] Create backup of master spreadsheet
- [ ] Document web app URL for students
- [ ] Set up monitoring schedule

## 🔗 Important Links

- **Master Spreadsheet**: https://docs.google.com/spreadsheets/d/18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24/edit
- **Apps Script Project**: Access via Extensions → Apps Script from spreadsheet
- **Script ID**: 1TIkkayrocz3TA2kuYJSsegU94xzrd2fJuY9Wf9eI_K83B0IKyPlpzeY9

## 📝 Next Steps

1. Deploy the web app
2. Test with a few pilot users
3. Add remaining tools week by week
4. Monitor usage and gather feedback
5. Iterate and improve

---

**Support**: If you encounter issues, check the SystemLogs sheet first, then review this guide.