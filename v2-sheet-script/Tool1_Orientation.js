/**
 * Tool 1: Orientation Assessment
 * Comprehensive 25-field assessment for student profiling
 */

const Tool1_Orientation = {
  /**
   * Process and save orientation form submission
   * @param {Object} formData - Data from the orientation form
   * @param {string} clientId - Validated client ID
   * @returns {Object} Result with report data and insights
   */
  processSubmission(formData, clientId) {
    try {
      // Add metadata
      const data = {
        ...formData,
        userId: clientId,
        timestamp: new Date(),
        toolId: 'orientation'
      };
      
      // Save to DataHub
      const saveResult = DataHub.saveToolData(clientId, 'orientation', data);
      
      if (!saveResult.success) {
        return {
          success: false,
          error: 'Failed to save assessment data'
        };
      }
      
      // Generate comprehensive report
      const report = Middleware.generateOrientationReport(data);
      
      return {
        success: true,
        report: report,
        insights: saveResult.insights,
        nextTool: Middleware.recommendNextTool({ 
          metadata: { completedTools: ['orientation'] },
          demographics: data 
        })
      };
      
    } catch (error) {
      console.error('Error processing orientation:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },
  
  /**
   * Get existing orientation data for a user
   * @param {string} clientId - Client ID
   * @returns {Object|null} Existing data or null
   */
  getExistingData(clientId) {
    try {
      const profile = DataHub.getUnifiedProfile(clientId);
      return profile.demographics || null;
    } catch (error) {
      console.error('Error loading orientation data:', error);
      return null;
    }
  },
  
  /**
   * Get form configuration
   * @returns {Object} Form structure and validation rules
   */
  getFormConfig() {
    return {
      sections: [
        {
          id: 'demographics',
          title: 'Personal Information',
          icon: '👤',
          fields: [
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'age', label: 'Age', type: 'number', min: 18, max: 100, required: true },
            { 
              name: 'maritalStatus', 
              label: 'Marital Status', 
              type: 'select',
              options: ['Single', 'Married', 'Divorced', 'Widowed'],
              required: true 
            },
            { name: 'dependents', label: 'Number of Dependents', type: 'number', min: 0, required: true }
          ]
        },
        {
          id: 'employment',
          title: 'Employment & Income',
          icon: '💼',
          fields: [
            {
              name: 'employmentStatus',
              label: 'Employment Status',
              type: 'select',
              options: ['Employed Full-Time', 'Employed Part-Time', 'Self-Employed', 'Unemployed', 'Retired', 'Student'],
              required: true
            },
            { name: 'profession', label: 'Profession/Industry', type: 'text', required: false },
            { 
              name: 'annualIncome',
              label: 'Annual Household Income',
              type: 'select',
              options: ['< $30,000', '$30,000-$50,000', '$50,000-$75,000', '$75,000-$100,000', '$100,000-$150,000', '> $150,000'],
              required: true
            },
            { name: 'otherIncome', label: 'Other Income Sources', type: 'text', placeholder: 'Rental, investments, etc.', required: false },
            {
              name: 'retirementAccess',
              label: 'Access to Employer Retirement Plan?',
              type: 'radio',
              options: ['Yes', 'No'],
              required: true
            }
          ]
        },
        {
          id: 'financial',
          title: 'Financial Snapshot',
          icon: '💰',
          fields: [
            {
              name: 'totalDebt',
              label: 'Total Debt (excluding mortgage)',
              type: 'select',
              options: ['None', '< $10,000', '$10,000-$25,000', '$25,000-$50,000', '$50,000-$100,000', '> $100,000'],
              required: true
            },
            { name: 'housingCost', label: 'Monthly Housing Cost', type: 'number', min: 0, required: true },
            { name: 'monthlyExpenses', label: 'Total Monthly Expenses', type: 'number', min: 0, required: true },
            { name: 'currentSavings', label: 'Current Total Savings', type: 'number', min: 0, required: true },
            {
              name: 'emergencyFund',
              label: 'Emergency Fund Status',
              type: 'select',
              options: ['None', '< 1 month', '1-3 months', '3-6 months', '> 6 months'],
              required: true
            },
            { name: 'monthlySavings', label: 'Monthly Savings Capacity', type: 'number', min: 0, required: true },
            {
              name: 'investmentExperience',
              label: 'Investment Experience',
              type: 'select',
              options: ['None', 'Beginner', 'Intermediate', 'Advanced'],
              required: true
            }
          ]
        },
        {
          id: 'mindset',
          title: 'Money Mindset Assessment',
          icon: '🧠',
          description: 'Rate from -3 (strongly negative) to +3 (strongly positive)',
          fields: [
            {
              name: 'financialSituation',
              label: 'How would you rate your current financial situation?',
              type: 'slider',
              min: -3,
              max: 3,
              labels: ['Very Poor', 'Poor', 'Below Average', 'Neutral', 'Above Average', 'Good', 'Excellent'],
              required: true
            },
            {
              name: 'moneyRelationship',
              label: 'How would you describe your relationship with money?',
              type: 'slider',
              min: -3,
              max: 3,
              labels: ['Very Stressful', 'Stressful', 'Challenging', 'Neutral', 'Manageable', 'Comfortable', 'Confident'],
              required: true
            },
            {
              name: 'scarcityAbundance',
              label: 'Do you tend toward scarcity or abundance thinking?',
              type: 'slider',
              min: -3,
              max: 3,
              labels: ['Extreme Scarcity', 'Scarcity', 'Mild Scarcity', 'Balanced', 'Mild Abundance', 'Abundance', 'Strong Abundance'],
              required: true
            },
            {
              name: 'goalConfidence',
              label: 'How confident are you in achieving your financial goals?',
              type: 'slider',
              min: -3,
              max: 3,
              labels: ['No Confidence', 'Very Low', 'Low', 'Uncertain', 'Somewhat Confident', 'Confident', 'Very Confident'],
              required: true
            },
            {
              name: 'financialAmbition',
              label: 'What is your level of financial ambition?',
              type: 'slider',
              min: -3,
              max: 3,
              labels: ['Survival Mode', 'Getting By', 'Stability', 'Comfort', 'Growth', 'Wealth Building', 'Financial Freedom'],
              required: true
            }
          ]
        },
        {
          id: 'goals',
          title: 'Goals & Priorities',
          icon: '🎯',
          fields: [
            {
              name: 'primaryGoal',
              label: 'Primary Financial Goal',
              type: 'select',
              options: [
                'Eliminate Debt',
                'Build Emergency Fund',
                'Save for Retirement',
                'Buy a Home',
                'Start a Business',
                'Save for Education',
                'Build Wealth',
                'Financial Independence'
              ],
              required: true
            },
            { 
              name: 'retirementTarget',
              label: 'Target Retirement Age',
              type: 'number',
              min: 50,
              max: 80,
              required: false
            },
            {
              name: 'biggestObstacle',
              label: 'Biggest Financial Obstacle',
              type: 'select',
              options: [
                'Lack of Income',
                'Too Much Debt',
                'No Clear Plan',
                'Lack of Knowledge',
                'Fear/Anxiety',
                'Lack of Discipline',
                'Market Volatility',
                'Family Obligations'
              ],
              required: true
            }
          ]
        }
      ],
      
      validation: {
        age: (value) => value >= 18 && value <= 100,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        housingCost: (value, data) => value <= (data.monthlyExpenses || Infinity),
        monthlySavings: (value, data) => {
          const income = this.estimateMonthlyIncome(data.annualIncome);
          const expenses = data.monthlyExpenses || 0;
          return value <= (income - expenses);
        }
      }
    };
  },
  
  /**
   * Estimate monthly income from range
   */
  estimateMonthlyIncome(incomeRange) {
    const ranges = {
      '< $30,000': 2000,
      '$30,000-$50,000': 3333,
      '$50,000-$75,000': 5208,
      '$75,000-$100,000': 7291,
      '$100,000-$150,000': 10416,
      '> $150,000': 15000
    };
    return ranges[incomeRange] || 5000;
  },
  
  /**
   * Calculate progress metrics
   */
  calculateProgress(data) {
    const sections = this.getFormConfig().sections;
    let totalFields = 0;
    let completedFields = 0;
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          totalFields++;
          if (data[field.name] !== undefined && data[field.name] !== '') {
            completedFields++;
          }
        }
      });
    });
    
    return {
      percentage: Math.round((completedFields / totalFields) * 100),
      completed: completedFields,
      total: totalFields
    };
  }
};