/**
 * Tool 1: Comprehensive Orientation Assessment
 * Collects all demographic and baseline data needed across all 8 tools
 */

function loadOrientationTool() {
  const html = `
    <h2>📋 Comprehensive Financial Profile Assessment</h2>
    <div class="hr"></div>
    <p class="muted" style="margin-bottom: 20px;">
      This one-time comprehensive assessment gathers all the information needed across our entire platform. 
      <strong>You won't have to answer these questions again!</strong>
    </p>
    
    <!-- Progress Indicator -->
    <div style="margin-bottom: 25px;">
      <div style="background: rgba(173, 145, 104, 0.2); border-radius: 20px; height: 8px; overflow: hidden;">
        <div id="progress-bar" style="background: var(--gold); height: 100%; width: 20%; transition: width 0.3s;"></div>
      </div>
      <p class="muted" style="text-align: center; margin-top: 8px;">
        Section <span id="current-section">1</span> of 5 • Approximately 8-10 minutes
      </p>
    </div>
    
    <form id="orientation-form" onsubmit="saveOrientationData(event)">
      <!-- Section 1: Core Demographics (6 questions) -->
      <div class="form-section" style="background: linear-gradient(315deg, rgba(173, 145, 104, 0.1) 0%, rgba(30, 25, 43, 0.2) 100%); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: var(--gold);">👤 Section 1: Core Demographics</h3>
        <div class="form-grid">
          <div>
            <label class="form-label">First Name *</label>
            <input type="text" name="firstName" required class="form-input" placeholder="John">
          </div>
          
          <div>
            <label class="form-label">Last Name *</label>
            <input type="text" name="lastName" required class="form-input" placeholder="Doe">
          </div>
          
          <div>
            <label class="form-label">Email Address *</label>
            <input type="email" name="email" required class="form-input" placeholder="john.doe@example.com">
          </div>
          
          <div>
            <label class="form-label">Date of Birth *</label>
            <input type="date" name="dateOfBirth" required class="form-input">
            <span class="muted" style="font-size: 11px;">Needed for retirement planning</span>
          </div>
          
          <div>
            <label class="form-label">Marital Status *</label>
            <select name="maritalStatus" required class="form-select">
              <option value="">Select...</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="partnered">Domestic Partnership</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Number of Dependents *</label>
            <input type="number" name="dependents" min="0" max="20" required class="form-input" value="0">
            <span class="muted" style="font-size: 11px;">For expense planning</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Employment & Income (5 questions) -->
      <div class="form-section" style="background: linear-gradient(315deg, rgba(173, 145, 104, 0.1) 0%, rgba(30, 25, 43, 0.2) 100%); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: var(--gold);">💼 Section 2: Employment & Income</h3>
        <div class="form-grid">
          <div>
            <label class="form-label">Employment Status *</label>
            <select name="employmentStatus" required class="form-select" onchange="toggleRetirementOptions(this.value)">
              <option value="">Select...</option>
              <option value="w2-fulltime">Employed Full-Time (W2)</option>
              <option value="w2-parttime">Employed Part-Time (W2)</option>
              <option value="self-employed">Self-Employed/1099</option>
              <option value="business-owner">Business Owner</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Industry/Profession</label>
            <input type="text" name="profession" class="form-input" placeholder="e.g., Software Engineer">
          </div>
          
          <div>
            <label class="form-label">Annual Gross Income *</label>
            <input type="number" name="annualIncome" min="0" required class="form-input" placeholder="75000">
            <span class="muted" style="font-size: 11px;">Before taxes</span>
          </div>
          
          <div>
            <label class="form-label">Other Income (Annual)</label>
            <input type="number" name="otherIncome" min="0" class="form-input" placeholder="0">
            <span class="muted" style="font-size: 11px;">Rental, dividends, etc.</span>
          </div>
          
          <div id="retirement-access-div">
            <label class="form-label">401k/Retirement Plan Access *</label>
            <select name="retirementAccess" required class="form-select">
              <option value="">Select...</option>
              <option value="401k-match">401k with Employer Match</option>
              <option value="401k-no-match">401k No Match</option>
              <option value="403b">403(b)</option>
              <option value="sep-ira">SEP-IRA Available</option>
              <option value="solo-401k">Solo 401k Available</option>
              <option value="pension">Pension Plan</option>
              <option value="none">No Workplace Retirement</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section 3: Financial Snapshot (7 questions) -->
      <div class="form-section" style="background: linear-gradient(315deg, rgba(173, 145, 104, 0.1) 0%, rgba(30, 25, 43, 0.2) 100%); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: var(--gold);">💰 Section 3: Financial Snapshot</h3>
        <div class="form-grid">
          <div>
            <label class="form-label">Total Debt (excluding mortgage) *</label>
            <select name="totalDebt" required class="form-select">
              <option value="">Select...</option>
              <option value="0">$0 (Debt Free)</option>
              <option value="1000">Under $1,000</option>
              <option value="5000">$1,000 - $5,000</option>
              <option value="10000">$5,000 - $10,000</option>
              <option value="25000">$10,000 - $25,000</option>
              <option value="50000">$25,000 - $50,000</option>
              <option value="75000">$50,000 - $75,000</option>
              <option value="100000">$75,000 - $100,000</option>
              <option value="100001">Over $100,000</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Monthly Housing Cost *</label>
            <input type="number" name="housingCost" min="0" required class="form-input" placeholder="1500">
            <span class="muted" style="font-size: 11px;">Rent or mortgage</span>
          </div>
          
          <div>
            <label class="form-label">Total Monthly Expenses *</label>
            <input type="number" name="monthlyExpenses" min="0" required class="form-input" placeholder="3500">
            <span class="muted" style="font-size: 11px;">All expenses including housing</span>
          </div>
          
          <div>
            <label class="form-label">Current Savings/Investments *</label>
            <input type="number" name="currentSavings" min="0" required class="form-input" placeholder="10000">
            <span class="muted" style="font-size: 11px;">Total liquid assets</span>
          </div>
          
          <div>
            <label class="form-label">Emergency Fund Status *</label>
            <select name="emergencyFund" required class="form-select">
              <option value="">Select...</option>
              <option value="0">No Emergency Fund</option>
              <option value="1">Less than 1 month</option>
              <option value="2">1-2 months</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12+ months</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Monthly Savings Capacity *</label>
            <input type="number" name="monthlySavings" min="0" required class="form-input" placeholder="500">
            <span class="muted" style="font-size: 11px;">How much can you save per month?</span>
          </div>
          
          <div>
            <label class="form-label">Investment Experience *</label>
            <select name="investmentExperience" required class="form-select">
              <option value="">Select...</option>
              <option value="none">No Experience</option>
              <option value="beginner">Beginner (< 2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="experienced">Experienced (5+ years)</option>
              <option value="expert">Expert (10+ years)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section 4: Mindset & Psychology (4 scored questions) -->
      <div class="form-section" style="background: linear-gradient(315deg, rgba(173, 145, 104, 0.1) 0%, rgba(30, 25, 43, 0.2) 100%); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: var(--gold);">🧠 Section 4: Mindset Assessment</h3>
        
        <div style="margin-bottom: 20px;">
          <label class="form-label">How would you describe your current Financial Situation? *</label>
          <input type="range" name="financialSituation" min="-3" max="3" value="0" required 
                 oninput="updateScaleLabel(this, 'financial-situation-label')">
          <div id="financial-situation-label" class="scale-label" style="text-align: center; margin-top: 10px; color: var(--gold);">
            Okay (0)
          </div>
          <div class="muted" style="font-size: 11px; display: flex; justify-content: space-between; margin-top: 5px;">
            <span>-3: Horrible</span>
            <span>0: Okay</span>
            <span>+3: Great</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label class="form-label">How would you describe your relationship with Money? *</label>
          <input type="range" name="moneyRelationship" min="-3" max="3" value="0" required 
                 oninput="updateScaleLabel(this, 'money-relationship-label')">
          <div id="money-relationship-label" class="scale-label" style="text-align: center; margin-top: 10px; color: var(--gold);">
            Okay (0)
          </div>
          <div class="muted" style="font-size: 11px; display: flex; justify-content: space-between; margin-top: 5px;">
            <span>-3: Combat</span>
            <span>0: Okay</span>
            <span>+3: Great</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label class="form-label">Financial Scarcity vs Abundance Mindset? *</label>
          <input type="range" name="scarcityAbundance" min="-3" max="3" value="0" required 
                 oninput="updateScaleLabel(this, 'scarcity-abundance-label')">
          <div id="scarcity-abundance-label" class="scale-label" style="text-align: center; margin-top: 10px; color: var(--gold);">
            Balanced (0)
          </div>
          <div class="muted" style="font-size: 11px; display: flex; justify-content: space-between; margin-top: 5px;">
            <span>-3: Full Scarcity</span>
            <span>0: Balanced</span>
            <span>+3: Full Abundance</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label class="form-label">How confident are you in reaching your financial goals? *</label>
          <input type="range" name="goalConfidence" min="-3" max="3" value="0" required 
                 oninput="updateScaleLabel(this, 'confidence-label')">
          <div id="confidence-label" class="scale-label" style="text-align: center; margin-top: 10px; color: var(--gold);">
            Maybe (0)
          </div>
          <div class="muted" style="font-size: 11px; display: flex; justify-content: space-between; margin-top: 5px;">
            <span>-3: No Chance</span>
            <span>0: Maybe</span>
            <span>+3: 100% Certain</span>
          </div>
        </div>
      </div>

      <!-- Section 5: Goals & Planning (3 questions) -->
      <div class="form-section" style="background: linear-gradient(315deg, rgba(173, 145, 104, 0.1) 0%, rgba(30, 25, 43, 0.2) 100%); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: var(--gold);">🎯 Section 5: Goals & Planning</h3>
        
        <div style="margin-bottom: 20px;">
          <label class="form-label">What is your PRIMARY financial goal? *</label>
          <select name="primaryGoal" required class="form-select" onchange="showRetirementAge(this.value)">
            <option value="">Select...</option>
            <option value="retirement">Save for Retirement</option>
            <option value="debt">Pay Off Debt</option>
            <option value="emergency">Build Emergency Fund</option>
            <option value="home">Buy a Home</option>
            <option value="education">Fund Education</option>
            <option value="wealth">Build Wealth</option>
            <option value="income">Increase Income</option>
            <option value="freedom">Achieve Financial Freedom</option>
          </select>
        </div>
        
        <div id="retirement-age-div" style="display: none; margin-bottom: 20px;">
          <label class="form-label">Target Retirement Age</label>
          <input type="number" name="retirementAge" min="30" max="100" class="form-input" placeholder="65">
          <span class="muted" style="font-size: 11px;">When would you like to retire?</span>
        </div>
        
        <div>
          <label class="form-label">What is your BIGGEST financial obstacle? *</label>
          <textarea name="biggestObstacle" required class="form-input" rows="3" 
                    placeholder="What's the main thing holding you back financially?" 
                    style="border-radius: 15px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <button type="submit" class="btn" style="min-width: 250px;">
          📊 Complete Assessment & Generate Insights
        </button>
      </div>
    </form>
  `;
  
  document.getElementById('tool-container').innerHTML = html;
}

// Helper function to update scale labels
function updateScaleLabel(input, labelId) {
  const value = parseInt(input.value);
  const label = document.getElementById(labelId);
  
  const labels = {
    'financial-situation-label': {
      '-3': 'Horrible and getting worse (-3)',
      '-2': 'Bad but stable (-2)',
      '-1': 'Not where I want it (-1)',
      '0': 'Okay (0)',
      '1': 'Bad but hopeful (+1)',
      '2': 'Good and improving (+2)',
      '3': 'Great and stable (+3)'
    },
    'money-relationship-label': {
      '-3': 'Constant combat (-3)',
      '-2': 'Consistent fear (-2)',
      '-1': 'Troubled but improving (-1)',
      '0': 'Okay (0)',
      '1': 'Pretty good (+1)',
      '2': 'Good (+2)',
      '3': 'Great (+3)'
    },
    'scarcity-abundance-label': {
      '-3': 'Full scarcity (-3)',
      '-2': 'Scarcity in most areas (-2)',
      '-1': 'Scarcity but aware (-1)',
      '0': 'Balanced (0)',
      '1': 'Mostly abundant (+1)',
      '2': 'Abundant but sometimes blocked (+2)',
      '3': 'Full abundance (+3)'
    },
    'confidence-label': {
      '-3': 'Not a chance (-3)',
      '-2': 'Long shot (-2)',
      '-1': 'Unlikely (-1)',
      '0': 'Maybe (0)',
      '1': 'Likely (+1)',
      '2': 'Probably (+2)',
      '3': '100% certain (+3)'
    }
  };
  
  if (labels[labelId] && labels[labelId][value]) {
    label.textContent = labels[labelId][value];
    
    // Color coding
    if (value < 0) {
      label.style.color = 'var(--bad)';
    } else if (value > 0) {
      label.style.color = 'var(--ok)';
    } else {
      label.style.color = 'var(--gold)';
    }
  }
}

// Show/hide retirement age based on goal
function showRetirementAge(goal) {
  const retDiv = document.getElementById('retirement-age-div');
  if (goal === 'retirement' || goal === 'freedom') {
    retDiv.style.display = 'block';
  } else {
    retDiv.style.display = 'none';
  }
}

// Toggle retirement options based on employment
function toggleRetirementOptions(employment) {
  const retAccess = document.querySelector('select[name="retirementAccess"]');
  if (employment === 'self-employed' || employment === 'business-owner') {
    // Update options for self-employed
    retAccess.innerHTML = `
      <option value="">Select...</option>
      <option value="sep-ira">SEP-IRA</option>
      <option value="solo-401k">Solo 401k</option>
      <option value="simple-ira">SIMPLE IRA</option>
      <option value="none">No Retirement Plan Yet</option>
    `;
  } else if (employment === 'retired' || employment === 'unemployed' || employment === 'student') {
    retAccess.innerHTML = `
      <option value="">Select...</option>
      <option value="ira-only">IRA Only</option>
      <option value="none">No Retirement Accounts</option>
    `;
  } else {
    // Regular employment options
    retAccess.innerHTML = `
      <option value="">Select...</option>
      <option value="401k-match">401k with Employer Match</option>
      <option value="401k-no-match">401k No Match</option>
      <option value="403b">403(b)</option>
      <option value="pension">Pension Plan</option>
      <option value="none">No Workplace Retirement</option>
    `;
  }
}