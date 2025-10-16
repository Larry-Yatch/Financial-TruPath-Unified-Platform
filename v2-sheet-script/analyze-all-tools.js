#!/usr/bin/env node

/**
 * Analyze all 8 tools to identify common demographic data points
 * This will help us collect everything needed in Tool 1
 */

const toolForms = {
  'Tool 1: Orientation': {
    formUrl: 'https://docs.google.com/forms/d/1A_FjAQbk9fqqWrW7jKXeYl1xJX7EtwCERAjvKY9Xeys/edit',
    sheetId: '18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0',
    fields: ['Name', 'Student ID', 'Email', 'Primary driver', 'Money mindset', 'Scarcity/Abundance', 
             'Relationship with money', 'Financial situation', 'Financial ambition', 'Goals', 
             'Confidence', 'Past situation', 'Future outlook', 'Concerns', 'Obstacles', 
             'Emotions', 'Love experienced', 'Personal development', 'Self-worth', 'Income', 'Debt']
  },
  
  'Tool 2: Financial Clarity': {
    formUrl: 'https://docs.google.com/forms/d/1XqrBcZ92sk6f4zAbWw8r4cSkMSb1F-YF2TaEnCb0izw/edit',
    sheetId: '11vLtB5AIcuxghItuPc0V7Mk7JWrAQx1S0AIjmwLximM',
    emotionalFormUrl: 'https://docs.google.com/forms/d/1pyywd-UMBRO1CpMO-LCRlj6DSLgmNu3wyLoexP2Stp8/edit',
    fields: ['Income details', 'Expenses', 'Debt breakdown', 'Savings', 'Investments', 
             'Emergency fund', 'Financial goals', 'Risk tolerance', 'Emotional assessment']
  },
  
  'Tool 3: False Self/External Validation': {
    falseSelfFormUrl: 'https://docs.google.com/forms/d/1SHCLgRelyMyDTk2qjfixKUVv2Ba-cp3U6npVmpU6His/edit',
    externalValidationFormUrl: 'https://docs.google.com/forms/d/134SM8ev0vba1C2tRQOVxqD7o-9pF9y_veD7-DZj1AEA/edit',
    fields: ['Self-image', 'External validation needs', 'Approval seeking', 'Authentic self', 
             'Social media impact', 'Comparison habits', 'Self-worth sources']
  },
  
  'Tool 4: Financial Freedom Framework': {
    formUrl: 'https://docs.google.com/forms/d/110eAUS3acW_MtJhMZJ-vN9Cneyzn2Waj7F7sSZvIvvE/edit',
    sheetId: '1rYA0Pky8cFR5cizPaGm_xO8SBenBVItFM5nViJhgKIM',
    fields: ['Income', 'Fixed expenses', 'Variable expenses', 'Savings rate', 'Investment allocation',
             'Risk profile', 'Time horizon', 'Financial priorities', 'Lifestyle goals']
  },
  
  'Tool 5: Issues Showing Love': {
    formUrl: 'https://docs.google.com/forms/d/1XbAmuvPJYBInd3lNaxx55gJHwzkXgZQ9pVoj8tSlxk0/edit',
    sheetId: '1Y5pGllwbS7ub5sn7RCKMsHsHkTYr86qpvsff_dpigQ4',
    fields: ['Giving patterns', 'Receiving patterns', 'Love languages', 'Childhood experiences',
             'Relationship status', 'Financial generosity', 'Self-care habits']
  },
  
  'Tool 6: Retirement Blueprint': {
    phase1FormUrl: 'https://docs.google.com/forms/d/1w4aPniYDM3oxiT-crPghmn9sYxYaw51sSexktoZJE8A/edit',
    sheetId: '1QV9KoueTktz7mJhnuhsEkF-ayzv54vT6W4kyu84oiuY',
    // Plus 9 profile-specific forms
    fields: ['Current age', 'Retirement age goal', 'Current savings', 'Monthly contribution capacity',
             'Employment type', '401k availability', 'IRA eligibility', 'Self-employment status',
             'Risk tolerance', 'Investment experience', 'Expected retirement income needs']
  },
  
  'Tool 7: Control Fear Grounding': {
    formUrl: 'https://docs.google.com/forms/d/1PewmMurbTa3GrErnOAH-T5O9SqNbHqrXa25AaDQqgDQ/edit',
    sheetId: '1g1Thn01PhZFBjCrFhJ-oj_Wkd8PEICJ3u5nmWmA47Pg',
    fields: ['Fear patterns', 'Control needs', 'Risk aversion', 'Decision making', 'Past trauma',
             'Safety needs', 'Trust issues', 'Financial fears', 'Scarcity triggers']
  },
  
  'Tool 8: Investment Tool': {
    sheetId: '1_c4JB4VG4q-fekL2T1s6nUo83Ko1nZbAkSkDfFM1X0M',
    fields: ['Monthly savings capacity', 'Current investment balance', 'Risk tolerance (0-10)',
             'Retirement income goal', 'Years to retirement', 'Investment experience']
  }
};

// Identify common fields across all tools
const commonFields = {
  // Demographics
  'Name': ['Tool 1', 'All tools via Student ID'],
  'Email': ['Tool 1', 'All tools for communication'],
  'Age/DOB': ['Tool 1', 'Tool 6', 'Tool 8'],
  'Employment Status': ['Tool 1', 'Tool 4', 'Tool 6'],
  'Marital/Relationship Status': ['Tool 1', 'Tool 5'],
  
  // Financial Metrics
  'Income Level': ['Tool 1', 'Tool 2', 'Tool 4', 'Tool 6'],
  'Debt Level': ['Tool 1', 'Tool 2', 'Tool 4'],
  'Savings/Assets': ['Tool 2', 'Tool 6', 'Tool 8'],
  'Monthly Savings Capacity': ['Tool 4', 'Tool 6', 'Tool 8'],
  'Expenses': ['Tool 2', 'Tool 4'],
  'Emergency Fund': ['Tool 2', 'Tool 4'],
  
  // Psychological/Mindset
  'Risk Tolerance': ['Tool 2', 'Tool 4', 'Tool 6', 'Tool 8'],
  'Scarcity/Abundance Mindset': ['Tool 1', 'Tool 7'],
  'Financial Fears': ['Tool 1', 'Tool 7'],
  'Self-Worth': ['Tool 1', 'Tool 3', 'Tool 5'],
  'Control Needs': ['Tool 3', 'Tool 7'],
  
  // Goals & Planning
  'Retirement Age Goal': ['Tool 6', 'Tool 8'],
  'Financial Goals': ['Tool 1', 'Tool 2', 'Tool 4'],
  'Time Horizon': ['Tool 4', 'Tool 6', 'Tool 8'],
  'Investment Experience': ['Tool 6', 'Tool 8'],
  
  // Behavioral
  'Money Relationship': ['Tool 1', 'Tool 5'],
  'Childhood Experiences': ['Tool 1', 'Tool 5', 'Tool 7'],
  'Personal Development Level': ['Tool 1', 'Tool 3']
};

console.log('🔍 COMPREHENSIVE DATA COLLECTION STRATEGY FOR TOOL 1');
console.log('=' .repeat(70));
console.log('\n📊 ESSENTIAL FIELDS TO COLLECT IN TOOL 1:\n');

// Core Demographics (Always Needed)
console.log('1️⃣ CORE DEMOGRAPHICS (Used by all tools):');
console.log('   • First Name, Last Name, Email');
console.log('   • Age/Date of Birth (needed for Tools 6 & 8 retirement planning)');
console.log('   • Employment Status & Type (Tools 4, 6 - determines retirement options)');
console.log('   • Marital Status (Tool 5 - relationship dynamics)');
console.log('   • Number of Dependents (Tools 2, 4 - expense planning)');

// Financial Metrics
console.log('\n2️⃣ FINANCIAL METRICS (Critical for multiple tools):');
console.log('   • Annual Income (exact or range) - Tools 2, 4, 6');
console.log('   • Total Debt (breakdown optional) - Tools 2, 4');
console.log('   • Current Savings/Assets - Tools 2, 6, 8');
console.log('   • Monthly Savings Capacity - Tools 4, 6, 8');
console.log('   • Monthly Expenses (estimate) - Tools 2, 4');
console.log('   • Emergency Fund Status - Tools 2, 4');
console.log('   • 401k/Retirement Account Access - Tool 6');

// Psychological Profile
console.log('\n3️⃣ PSYCHOLOGICAL PROFILE (For personalization):');
console.log('   • Risk Tolerance Scale - Tools 2, 4, 6, 8');
console.log('   • Scarcity vs Abundance Mindset - Tools 1, 7');
console.log('   • Financial Confidence Level - Tools 1, 7');
console.log('   • Self-Worth Assessment - Tools 1, 3, 5');
console.log('   • Control/Fear Patterns - Tools 3, 7');

// Goals & Timeline
console.log('\n4️⃣ GOALS & TIMELINE (For tool sequencing):');
console.log('   • Primary Financial Goal - All tools');
console.log('   • Retirement Age Target - Tools 6, 8');
console.log('   • Retirement Income Goal - Tools 6, 8');
console.log('   • Investment Experience Level - Tools 6, 8');
console.log('   • Biggest Financial Obstacle - All tools');

// Optional but Valuable
console.log('\n5️⃣ OPTIONAL BUT VALUABLE:');
console.log('   • Childhood Money Experiences - Tools 5, 7');
console.log('   • Personal Development Work Done - Tools 1, 3');
console.log('   • Housing Status (own/rent) - Tool 2');
console.log('   • Industry/Profession - Tool 6 (retirement options)');

console.log('\n✅ RECOMMENDATION:');
console.log('Collect 20-25 comprehensive questions in Tool 1 that cover:');
console.log('• All demographics needed by any tool');
console.log('• Key financial metrics (income, debt, savings, capacity)');
console.log('• Core psychological assessments (risk, mindset, confidence)');
console.log('• Primary goals and obstacles');
console.log('\nThis prevents redundant questions and creates a complete profile!');

console.log('\n🎯 DATA STRATEGY:');
console.log('1. Tool 1 collects comprehensive baseline');
console.log('2. Each subsequent tool pulls forward this data');
console.log('3. Tools only ask for their specific, unique questions');
console.log('4. Updates flow back to master profile');

// Export the analysis
module.exports = { toolForms, commonFields };