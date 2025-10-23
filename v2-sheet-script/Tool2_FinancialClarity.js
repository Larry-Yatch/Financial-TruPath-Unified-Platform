/**
 * Tool 2: Financial Clarity Assessment
 * Demonstrates adaptive questioning based on Tool 1 insights
 * The key innovation: Questions adapt based on what Tool 1 discovered
 */

const Tool2_FinancialClarity = {
  
  /**
   * Initialize tool with adaptive configuration based on Tool 1 insights
   * @param {string} clientId - Client ID
   * @returns {Object} Adaptive configuration for Tool 2
   */
  initialize(clientId) {
    try {
      // Get base configuration
      const baseConfig = this.getBaseConfig();
      
      // Use ToolFramework to get adaptive configuration
      const frameworkResult = ToolFramework.initializeTool('tool2', clientId, baseConfig);
      
      if (!frameworkResult.success) {
        console.warn('ToolFramework initialization failed, using base config');
        return {
          config: baseConfig,
          insights: [],
          adaptations: [],
          success: true
        };
      }
      
      // Add context about adaptations for user
      const adaptationContext = this.buildAdaptationContext(frameworkResult.insights, frameworkResult.adaptations);
      
      return {
        config: frameworkResult.config,
        insights: frameworkResult.insights,
        adaptations: frameworkResult.adaptations,
        adaptationContext: adaptationContext,
        success: true
      };
      
    } catch (error) {
      console.error('Tool2 initialization error:', error);
      return {
        config: this.getBaseConfig(),
        insights: [],
        adaptations: [],
        error: error.toString(),
        success: false
      };
    }
  },
  
  /**
   * Process and save financial clarity assessment
   * @param {Object} formData - Assessment data
   * @param {string} clientId - Client ID
   * @returns {Object} Processing results
   */
  processSubmission(formData, clientId) {
    try {
      // Validate input data
      const config = this.getBaseConfig();
      const validation = ToolFramework.validateData('tool2', formData, config);
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
        toolId: 'tool2'
      };
      
      // Use ToolFramework for completion processing
      const frameworkResult = ToolFramework.completeToolSubmission('tool2', clientId, data);
      
      if (!frameworkResult.success) {
        return {
          success: false,
          error: frameworkResult.error || 'Failed to process submission'
        };
      }
      
      // Generate Tool 2 specific scores
      const scores = ToolFramework.calculateScores('tool2', data);
      const report = this.generateFinancialClarityReport(data, scores);
      
      // Generate cross-tool insights
      const crossInsights = this.generateCrossToolInsights(clientId, data, frameworkResult.insights);
      
      return {
        success: true,
        report: report,
        insights: frameworkResult.insights,
        crossInsights: crossInsights,
        scores: scores,
        nextTool: frameworkResult.nextTool,
        message: 'Financial Clarity Assessment completed successfully'
      };
      
    } catch (error) {
      console.error('Tool2 processing error:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },
  
  /**
   * Get base configuration for Tool 2
   */
  getBaseConfig() {
    return {
      title: 'Financial Clarity Assessment',
      description: 'Get a clear picture of your current financial situation',
      sections: [
        {
          id: 'income_expenses',
          title: 'Income & Expenses',
          icon: '💰',
          fields: [
            {
              name: 'monthlyIncome',
              label: 'Monthly Take-Home Income',
              type: 'number',
              min: 0,
              required: true
            },
            {
              name: 'monthlyExpenses',
              label: 'Total Monthly Expenses',
              type: 'number',
              min: 0,
              required: true
            },
            {
              name: 'expenseCategories',
              label: 'Biggest expense categories',
              type: 'checkbox',
              options: [
                'Housing (rent/mortgage)',
                'Food & groceries',
                'Transportation',
                'Insurance',
                'Debt payments',
                'Entertainment',
                'Subscriptions'
              ],
              required: true
            }
          ]
        },
        {
          id: 'debt_management',
          title: 'Debt Overview',
          icon: '💳',
          fields: [
            {
              name: 'totalMonthlyDebtPayments',
              label: 'Total monthly debt payments',
              type: 'number',
              min: 0,
              required: true
            },
            {
              name: 'highestInterestRate',
              label: 'Highest interest rate on any debt',
              type: 'number',
              min: 0,
              max: 50,
              step: 0.1,
              required: false
            },
            {
              name: 'debtStressLevel',
              label: 'How stressed are you about debt?',
              type: 'slider',
              min: 1,
              max: 10,
              labels: ['No stress', 'Extreme stress'],
              required: true
            }
          ]
        },
        {
          id: 'savings_investments',
          title: 'Savings & Investments',
          icon: '📈',
          fields: [
            {
              name: 'monthlySavings',
              label: 'Amount saved monthly',
              type: 'number',
              min: 0,
              required: true
            },
            {
              name: 'emergencyFundMonths',
              label: 'Emergency fund covers how many months?',
              type: 'select',
              options: ['0 months', '< 1 month', '1-2 months', '3-5 months', '6+ months'],
              required: true
            },
            {
              name: 'investmentAccounts',
              label: 'Current investment accounts',
              type: 'checkbox',
              options: [
                '401(k)/403(b)',
                'IRA/Roth IRA',
                'Brokerage account',
                'Savings account only',
                'No investments'
              ],
              required: true
            }
          ]
        },
        {
          id: 'financial_habits',
          title: 'Financial Habits',
          icon: '📊',
          fields: [
            {
              name: 'budgetingMethod',
              label: 'How do you track spending?',
              type: 'select',
              options: [
                'Detailed budget/app',
                'Simple tracking',
                'Bank statements only',
                'Mental tracking',
                'No tracking'
              ],
              required: true
            },
            {
              name: 'financialGoalsClarity',
              label: 'How clear are your financial goals?',
              type: 'slider',
              min: 1,
              max: 10,
              labels: ['Very unclear', 'Crystal clear'],
              required: true
            }
          ]
        }
      ]
    };
  },
  
  /**
   * Build context about why questions were adapted
   */
  buildAdaptationContext(insights, adaptations) {
    const context = {
      message: '',
      focusAreas: [],
      reasoning: []
    };
    
    if (adaptations.length === 0) {
      context.message = 'Standard financial clarity assessment - no specific adaptations needed.';
      return context;
    }
    
    // Build explanation of adaptations
    const adaptationMessages = {
      'Added budget-focused questions': 'Based on your income level, we\'ve added specific budgeting questions.',
      'Emphasized debt-related questions': 'Since debt is a primary concern, we\'ve expanded the debt section.',
      'Added retirement urgency focus': 'Given your age, we\'ve included time-sensitive retirement questions.'
    };
    
    const reasons = adaptations.map(adaptation => adaptationMessages[adaptation] || adaptation);
    context.reasoning = reasons;
    
    if (insights.some(i => i.type === 'debt_focus')) {
      context.focusAreas.push('Debt Management');
    }
    if (insights.some(i => i.type === 'retirement_urgency')) {
      context.focusAreas.push('Retirement Planning');
    }
    if (insights.some(i => i.type === 'budget_priority')) {
      context.focusAreas.push('Budgeting');
    }
    
    context.message = `This assessment has been personalized based on your Tool 1 responses. Focus areas: ${context.focusAreas.join(', ')}.`;
    
    return context;
  },
  
  /**
   * Generate financial clarity report
   */
  generateFinancialClarityReport(data, scores) {
    const monthlyIncome = data.monthlyIncome || 0;
    const monthlyExpenses = data.monthlyExpenses || 0;
    const monthlyDebtPayments = data.totalMonthlyDebtPayments || 0;
    const monthlySavings = data.monthlySavings || 0;
    
    // Calculate key ratios
    const cashFlow = monthlyIncome - monthlyExpenses;
    const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) : 0;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) : 0;
    
    const report = {
      summary: {
        monthlyIncome: monthlyIncome,
        monthlyExpenses: monthlyExpenses,
        cashFlow: cashFlow,
        cashFlowStatus: cashFlow > 0 ? 'positive' : 'negative'
      },
      ratios: {
        debtToIncome: Math.round(debtToIncomeRatio * 100),
        savingsRate: Math.round(savingsRate * 100),
        debtToIncomeHealth: this.assessDebtToIncomeHealth(debtToIncomeRatio),
        savingsRateHealth: this.assessSavingsRateHealth(savingsRate)
      },
      debt: {
        monthlyPayments: monthlyDebtPayments,
        stressLevel: data.debtStressLevel || 0,
        highestRate: data.highestInterestRate || 0
      },
      savings: {
        monthlyAmount: monthlySavings,
        emergencyFund: data.emergencyFundMonths,
        emergencyFundHealth: this.assessEmergencyFundHealth(data.emergencyFundMonths)
      },
      habits: {
        budgetingMethod: data.budgetingMethod,
        goalsClarity: data.financialGoalsClarity || 0
      },
      scores: scores,
      recommendations: this.generateFinancialRecommendations(data, {
        cashFlow: cashFlow,
        debtToIncomeRatio: debtToIncomeRatio,
        savingsRate: savingsRate
      }),
      timestamp: new Date().toISOString()
    };
    
    return report;
  },
  
  /**
   * Assess debt-to-income health
   */
  assessDebtToIncomeHealth(ratio) {
    if (ratio <= 0.2) return { status: 'excellent', message: 'Very healthy debt level' };
    if (ratio <= 0.36) return { status: 'good', message: 'Manageable debt level' };
    if (ratio <= 0.5) return { status: 'concerning', message: 'High debt burden' };
    return { status: 'critical', message: 'Dangerously high debt level' };
  },
  
  /**
   * Assess savings rate health
   */
  assessSavingsRateHealth(rate) {
    if (rate >= 0.2) return { status: 'excellent', message: 'Outstanding savings rate' };
    if (rate >= 0.15) return { status: 'good', message: 'Good savings discipline' };
    if (rate >= 0.1) return { status: 'fair', message: 'Adequate savings rate' };
    if (rate > 0) return { status: 'poor', message: 'Low savings rate' };
    return { status: 'critical', message: 'No regular savings' };
  },
  
  /**
   * Assess emergency fund health
   */
  assessEmergencyFundHealth(months) {
    if (months === '6+ months') return { status: 'excellent', message: 'Excellent emergency preparedness' };
    if (months === '3-5 months') return { status: 'good', message: 'Good emergency fund' };
    if (months === '1-2 months') return { status: 'fair', message: 'Minimal emergency fund' };
    if (months === '< 1 month') return { status: 'poor', message: 'Insufficient emergency fund' };
    return { status: 'critical', message: 'No emergency fund' };
  },
  
  /**
   * Generate financial recommendations
   */
  generateFinancialRecommendations(data, calculations) {
    const recommendations = [];
    
    // Cash flow recommendations
    if (calculations.cashFlow < 0) {
      recommendations.push({
        priority: 1,
        category: 'Cash Flow',
        action: 'Reduce expenses or increase income immediately',
        reason: 'Negative cash flow is unsustainable',
        urgency: 'critical'
      });
    }
    
    // Debt recommendations
    if (calculations.debtToIncomeRatio > 0.4) {
      recommendations.push({
        priority: 1,
        category: 'Debt',
        action: 'Focus on aggressive debt reduction',
        reason: 'Debt-to-income ratio exceeds healthy limits',
        urgency: 'high'
      });
    }
    
    // Savings recommendations
    if (calculations.savingsRate < 0.1) {
      recommendations.push({
        priority: 2,
        category: 'Savings',
        action: 'Increase savings rate to at least 10%',
        reason: 'Current savings rate is below recommended minimum',
        urgency: 'medium'
      });
    }
    
    // Emergency fund recommendations
    if (data.emergencyFundMonths === '0 months' || data.emergencyFundMonths === '< 1 month') {
      recommendations.push({
        priority: 1,
        category: 'Emergency Fund',
        action: 'Build emergency fund to cover 3-6 months expenses',
        reason: 'No emergency fund leaves you vulnerable to financial shocks',
        urgency: 'high'
      });
    }
    
    return recommendations.slice(0, 4);
  },
  
  /**
   * Generate cross-tool insights comparing Tool 1 and Tool 2 data
   */
  generateCrossToolInsights(clientId, tool2Data, existingInsights) {
    try {
      // Get Tool 1 data
      const tool1Response = DataService.getToolResponse(clientId, 'tool1');
      if (!tool1Response) {
        return [];
      }
      
      const tool1Data = tool1Response.data;
      const crossInsights = [];
      
      // Compare stated vs actual financial situation
      const statedSituation = tool1Data.financialSituation || 0;
      const actualCashFlow = (tool2Data.monthlyIncome || 0) - (tool2Data.monthlyExpenses || 0);
      
      if (statedSituation >= 1 && actualCashFlow < 0) {
        crossInsights.push({
          type: 'reality_check',
          insight: 'Financial situation assessment differs from actual cash flow',
          priority: 'HIGH',
          details: 'Tool 1 indicated positive financial situation, but Tool 2 shows negative cash flow',
          recommendation: 'Focus on expense reduction and budgeting in Tool 3'
        });
      }
      
      // Compare stated debt concern vs actual debt impact
      const primaryGoal = tool1Data.primaryGoal;
      const debtStress = tool2Data.debtStressLevel || 0;
      
      if (primaryGoal === 'Eliminate Debt' && debtStress >= 8) {
        crossInsights.push({
          type: 'debt_confirmation',
          insight: 'High debt stress confirmed through detailed assessment',
          priority: 'CRITICAL',
          details: 'Both tools indicate debt as major concern requiring immediate attention',
          recommendation: 'Prioritize debt elimination strategy in next tools'
        });
      }
      
      // Age vs savings rate insight
      const age = tool1Data.age || 0;
      const savingsRate = tool2Data.monthlySavings && tool2Data.monthlyIncome ? 
        (tool2Data.monthlySavings / tool2Data.monthlyIncome) : 0;
      
      if (age >= 50 && savingsRate < 0.15) {
        crossInsights.push({
          type: 'retirement_concern',
          insight: 'Low savings rate with limited time to retirement',
          priority: 'HIGH',
          details: `Age ${age} with ${Math.round(savingsRate * 100)}% savings rate may impact retirement readiness`,
          recommendation: 'Increase retirement contributions and consider catch-up contributions'
        });
      }
      
      return crossInsights;
      
    } catch (error) {
      console.error('Error generating cross-tool insights:', error);
      return [];
    }
  }
};

/**
 * Test Tool2 functionality
 */
function testTool2() {
  console.log('Testing Tool2 Financial Clarity...');
  
  const testData = {
    monthlyIncome: 5000,
    monthlyExpenses: 4800,
    totalMonthlyDebtPayments: 800,
    monthlySavings: 200,
    debtStressLevel: 7,
    emergencyFundMonths: '1-2 months',
    budgetingMethod: 'Simple tracking'
  };
  
  const scores = { cashFlow: 60, debtHealth: 40, overall: 50 };
  const report = Tool2_FinancialClarity.generateFinancialClarityReport(testData, scores);
  console.log('Tool2 Report:', report);
  
  return 'Tool2 test complete';
}