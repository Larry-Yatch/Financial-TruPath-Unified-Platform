/**
 * Tool 1: Orientation Assessment
 * Comprehensive 25-field assessment for student profiling
 */

const Tool1_Orientation = {
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
      const validation = ToolFramework.validateData('tool1', formData, config);
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
        toolId: 'tool1'
      };
      
      // Use ToolFramework for completion processing
      const frameworkResult = ToolFramework.completeToolSubmission('tool1', clientId, data);
      
      if (!frameworkResult.success) {
        return {
          success: false,
          error: frameworkResult.error || 'Failed to process submission'
        };
      }
      
      // Generate comprehensive report using ToolFramework scoring
      const scores = ToolFramework.calculateScores('tool1', data);
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
      // Use DataService to get existing Tool 1 data
      const response = DataService.getToolResponse(clientId, 'tool1');
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