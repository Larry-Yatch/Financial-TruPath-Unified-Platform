/**
 * Tool 1 Enhanced: Comprehensive Assessment with Psychological Depth
 * Enhanced 32-field assessment for comprehensive student profiling
 */

var Tool1_Enhanced = {
  /**
   * Process and save orientation form submission using ToolFramework
   * @param {Object} formData - Data from the orientation form
   * @param {string} clientId - Validated client ID
   * @returns {Object} Result with report data and insights
   */
  processSubmission(formData, clientId) {
    try {
      // Validate input data
      const config = this.getFormConfig();
      const validation = ToolFramework.validateData('tool1_enhanced', formData, config);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed: ' + validation.errors.join(', ')
        };
      }
      
      // Add metadata
      const data = {
        ...formData,
        userId: clientId,
        timestamp: new Date(),
        toolId: 'tool1_enhanced'
      };
      
      // Use ToolFramework for completion processing
      const frameworkResult = ToolFramework.completeToolSubmission('tool1_enhanced', clientId, data);
      
      if (!frameworkResult.success) {
        return {
          success: false,
          error: frameworkResult.error || 'Failed to process submission'
        };
      }
      
      // Generate comprehensive report using ToolFramework scoring
      const scores = ToolFramework.calculateScores('tool1_enhanced', data);
      const report = this.generateFrameworkReport(data, scores);
      
      return {
        success: true,
        report: report,
        insights: frameworkResult.insights,
        scores: scores,
        nextTool: frameworkResult.nextTool,
        message: frameworkResult.message,
        timestamp: new Date()
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
      // Use DataService to get existing Tool 1 Enhanced data
      const response = DataService.getToolResponse(clientId, 'tool1_enhanced');
      return response ? response.data : null;
    } catch (error) {
      console.error('Error loading orientation data:', error);
      return null;
    }
  },
  
  /**
   * Generate comprehensive report using ToolFramework
   * @param {Object} data - Orientation form data
   * @param {Object} scores - Calculated scores from ToolFramework
   * @returns {Object} Enhanced report structure
   */
  generateFrameworkReport(data, scores) {
    const report = {
      summary: {
        name: `${data.firstName || ''} ${data.lastName || ''}`,
        age: data.age,
        status: data.maritalStatus,
        dependents: data.dependents || 0
      },
      financial: {
        income: data.annualIncome,
        employmentStatus: data.employmentStatus,
        primaryGoal: data.primaryGoal,
        debtLevel: data.totalDebt,
        emergencyFund: data.emergencyFund
      },
      mindset: {
        financialSituation: data.financialSituation,
        moneyRelationship: data.moneyRelationship,
        scarcityAbundance: data.scarcityAbundance,
        goalConfidence: data.goalConfidence,
        financialAmbition: data.financialAmbition
      },
      scores: {
        financialHealth: scores.financialHealth || 0,
        mindset: scores.mindset || 0,
        overall: scores.overall || 0
      },
      profile: this.determineUserProfile(scores),
      recommendations: this.generateRecommendations(data, scores),
      timestamp: new Date().toISOString()
    };
    
    return report;
  },
  
  /**
   * Generate basic report from orientation data (legacy method)
   * @param {Object} data - Orientation form data
   * @returns {Object} Basic report structure
   */
  generateBasicReport(data) {
    const report = {
      summary: {
        name: `${data.firstName || ''} ${data.lastName || ''}`,
        age: data.age,
        status: data.maritalStatus,
        dependents: data.dependents || 0
      },
      financial: {
        income: data.income,
        employmentStatus: data.employmentStatus,
        primaryConcern: data.primaryFinancialConcern,
        debtLevel: data.totalDebt
      },
      goals: {
        shortTerm: data.shortTermGoals,
        longTerm: data.longTermGoals,
        retirementTarget: data.retirementAge
      },
      readiness: {
        confidenceLevel: data.financialConfidence,
        knowledgeLevel: data.financialKnowledge,
        stressLevel: data.financialStress
      },
      timestamp: new Date().toISOString()
    };
    
    return report;
  },
  
  /**
   * Determine user profile based on scores
   */
  determineUserProfile(scores) {
    const healthScore = scores.financialHealth || 0;
    const mindsetScore = scores.mindset || 0;
    
    if (healthScore >= 70 && mindsetScore >= 3) {
      return {
        type: 'Thriving Optimizer',
        emoji: '🚀',
        message: 'Strong financial position with positive mindset',
        focus: 'Wealth optimization strategies'
      };
    } else if (healthScore >= 70 && mindsetScore < 3) {
      return {
        type: 'Cautious Success',
        emoji: '🛡️',
        message: 'Financially stable but mindset needs work',
        focus: 'Aligning mindset with financial reality'
      };
    } else if (healthScore >= 40 && mindsetScore >= 0) {
      return {
        type: 'Emerging Builder',
        emoji: '🌱',
        message: 'On the right path with growth potential',
        focus: 'Systematic improvement and confidence building'
      };
    } else if (healthScore < 40 && mindsetScore >= 0) {
      return {
        type: 'Optimistic Striver',
        emoji: '💪',
        message: 'Positive mindset is your greatest asset',
        focus: 'Converting optimism into concrete actions'
      };
    } else {
      return {
        type: 'Foundation Builder',
        emoji: '🏗️',
        message: 'Ready to build from the ground up',
        focus: 'Building basics and celebrating small wins'
      };
    }
  },
  
  /**
   * Generate personalized recommendations
   */
  generateRecommendations(data, scores) {
    const recommendations = [];
    
    if (scores.financialHealth < 50) {
      recommendations.push({
        priority: 1,
        action: 'Complete Financial Clarity Assessment next',
        reason: 'Understanding your complete financial picture is critical',
        urgency: 'high'
      });
    }
    
    if (scores.mindset < 0) {
      recommendations.push({
        priority: 2,
        action: 'Begin mindset work in Tool 3',
        reason: 'Negative money beliefs are limiting your progress',
        urgency: 'high'
      });
    }
    
    if (data.primaryGoal === 'Eliminate Debt') {
      recommendations.push({
        priority: 1,
        action: 'Focus on debt elimination strategies',
        reason: 'Debt is your primary concern',
        urgency: 'critical'
      });
    }
    
    return recommendations.slice(0, 3);
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
          title: 'Basic Information',
          icon: '👤',
          fields: [
            { 
              name: 'participationDriver', 
              label: 'What was the primary driver that led to your participation in this course?', 
              type: 'textarea', 
              maxLength: 1000,
              required: true 
            },
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
            { name: 'dependents', label: 'Number of Dependents', type: 'number', min: 0, required: true },
            {
              name: 'incomeSourcesCount',
              label: 'How many different sources of income do you have?',
              type: 'select',
              options: ['1', '2', '3', '4', '5+'],
              required: true
            },
            {
              name: 'businessOwnerStatus',
              label: 'Are you a business owner?',
              type: 'select',
              options: ['Yes', 'No', 'Previously but not now', 'Pre-startup mode', 'Want to be someday'],
              required: true
            },
            {
              name: 'businessRevenueStatus',
              label: 'Is your business currently producing revenue?',
              type: 'select',
              options: ['Yes-profitable', 'Yes-breaking even', 'Yes-losing money', 'No revenue yet', 'N/A'],
              required: true,
              conditional: {
                dependsOn: 'businessOwnerStatus',
                showWhen: ['Yes', 'Previously but not now', 'Pre-startup mode'],
                autoFillWhen: {
                  'No': 'N/A',
                  'Want to be someday': 'N/A'
                }
              }
            }
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
          id: 'currentMindset',
          title: 'Current Money Mindset',
          icon: '🧠',
          description: 'Rate your current thinking and feeling patterns about money (no neutral option - choose positive or negative)',
          fields: [
            {
              name: 'moneyRelationship',
              label: 'How would you describe your relationship with money?',
              type: 'radio',
              options: [
                { value: -3, label: 'Constant combat' },
                { value: -2, label: 'Relatively consistent fear' },
                { value: -1, label: 'Troubled but getting better' },
                { value: 1, label: 'Ok' },
                { value: 2, label: 'Good' },
                { value: 3, label: 'Great' }
              ],
              required: true,
              scaleType: 'noZero'
            },
            {
              name: 'currentFinancialSituation',
              label: 'How would you describe your current financial situation?',
              type: 'radio',
              options: [
                { value: -3, label: 'Horrible and getting worse' },
                { value: -2, label: 'Bad but stable' },
                { value: -1, label: 'Not where I want it and stuck' },
                { value: 1, label: 'Bad but I see the light and have hope' },
                { value: 2, label: 'Good and getting better' },
                { value: 3, label: 'Great and stable' }
              ],
              required: true,
              scaleType: 'noZero'
            },
            {
              name: 'goalConfidence',
              label: 'How confident are you in reaching your financial goals?',
              type: 'radio',
              options: [
                { value: -3, label: 'Not a chance' },
                { value: -2, label: 'It\'s a long shot' },
                { value: -1, label: 'Possible but unlikely' },
                { value: 1, label: 'Maybe' },
                { value: 2, label: 'Probably' },
                { value: 3, label: '100% chance' }
              ],
              required: true,
              scaleType: 'noZero'
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
        },
        // Scale validation for noZero fields
        scaleNoZero: (value) => {
          const validValues = [-3, -2, -1, 1, 2, 3];
          return validValues.includes(Number(value));
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
   * Calculate progress metrics with conditional field logic
   */
  calculateProgress(data) {
    const sections = this.getFormConfig().sections;
    let totalFields = 0;
    let completedFields = 0;
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          // Handle conditional fields
          if (field.conditional) {
            const dependentValue = data[field.conditional.dependsOn];
            
            // Auto-fill logic
            if (field.conditional.autoFillWhen && field.conditional.autoFillWhen[dependentValue]) {
              // Field is auto-filled, count as completed
              totalFields++;
              completedFields++;
              return;
            }
            
            // Show when logic
            if (field.conditional.showWhen && field.conditional.showWhen.includes(dependentValue)) {
              totalFields++;
              if (data[field.name] !== undefined && data[field.name] !== '') {
                completedFields++;
              }
            }
            // If not in showWhen list, field is hidden and not counted
          } else {
            // Regular field
            totalFields++;
            if (data[field.name] !== undefined && data[field.name] !== '') {
              completedFields++;
            }
          }
        }
      });
    });
    
    return {
      percentage: Math.round((completedFields / totalFields) * 100),
      completed: completedFields,
      total: totalFields
    };
  },

  /**
   * Validate conditional fields and apply auto-fill logic
   */
  validateConditionalFields(data) {
    const config = this.getFormConfig();
    const processedData = { ...data };
    const errors = [];
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.conditional) {
          const dependentValue = data[field.conditional.dependsOn];
          
          // Apply auto-fill logic
          if (field.conditional.autoFillWhen && field.conditional.autoFillWhen[dependentValue]) {
            processedData[field.name] = field.conditional.autoFillWhen[dependentValue];
          }
          
          // Validate required conditional fields
          if (field.required && field.conditional.showWhen && field.conditional.showWhen.includes(dependentValue)) {
            if (!data[field.name] || data[field.name] === '') {
              errors.push(`${field.label} is required when ${field.conditional.dependsOn} is "${dependentValue}"`);
            }
          }
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors: errors,
      processedData: processedData
    };
  },

  /**
   * Validate scale fields (especially noZero scale types)
   */
  validateScaleFields(data) {
    const config = this.getFormConfig();
    const errors = [];
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.scaleType === 'noZero' && field.required) {
          const value = data[field.name];
          
          if (value === undefined || value === null || value === '') {
            errors.push(`${field.label} is required`);
          } else if (value === 0) {
            errors.push(`${field.label} cannot be neutral (0) - please choose positive or negative`);
          } else if (!config.validation.scaleNoZero(value)) {
            errors.push(`${field.label} must be between -3 and +3 (excluding 0)`);
          }
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
};