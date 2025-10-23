/**
 * ToolFramework.js - Unified Framework for Financial TruPath V2.0
 * Provides middleware hooks, reusable components, and cross-tool intelligence
 * The core innovation: Each tool adapts based on insights from previous tools
 */

const ToolFramework = {
  
  // ===== MIDDLEWARE HOOKS =====
  
  /**
   * Initialize tool with previous insights and adaptive configuration
   * @param {string} toolId - Tool identifier (tool1, tool2, etc.)
   * @param {string} clientId - Client ID
   * @param {Object} baseConfig - Base tool configuration
   * @returns {Object} Adapted configuration with insights
   */
  initializeTool(toolId, clientId, baseConfig) {
    try {
      // Load insights from previous tools
      const insights = DataService.getRelevantInsights(clientId, toolId);
      
      // Get tool adapter for this specific tool
      const adapter = this.getToolAdapter(toolId);
      
      // Apply adaptive logic
      const adaptedConfig = adapter ? 
        adapter.adapt(baseConfig, insights, clientId) : 
        baseConfig;
      
      // Log initialization
      console.log(`ToolFramework: Initialized ${toolId} with ${insights.length} insights`);
      
      return {
        config: adaptedConfig,
        insights: insights,
        adaptations: adapter ? adapter.getAdaptationSummary() : [],
        success: true
      };
      
    } catch (error) {
      console.error('ToolFramework initialization error:', error);
      return {
        config: baseConfig,
        insights: [],
        adaptations: [],
        success: false,
        error: error.toString()
      };
    }
  },
  
  /**
   * Process tool completion and generate insights for future tools
   * @param {string} toolId - Tool identifier
   * @param {string} clientId - Client ID
   * @param {Object} responseData - Tool response data
   * @returns {Object} Processing results with insights
   */
  completeToolSubmission(toolId, clientId, responseData) {
    try {
      // Save response data via DataService
      const saveResult = DataService.saveToolResponse(clientId, toolId, responseData);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
      
      // Generate comprehensive insights using InsightEngine
      const insights = this.generateToolInsights(toolId, clientId, responseData);
      
      // Update tool completion status
      DataService.updateToolStatus(clientId, toolId, 'completed');
      
      // Determine next recommended tool
      const nextTool = this.recommendNextTool(clientId);
      
      return {
        success: true,
        insights: insights,
        nextTool: nextTool,
        saveResult: saveResult,
        message: `${toolId} completed successfully`
      };
      
    } catch (error) {
      console.error('ToolFramework completion error:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },
  
  // ===== INSIGHT ENGINE =====
  
  /**
   * Generate insights from tool completion
   * @param {string} toolId - Tool identifier
   * @param {string} clientId - Client ID
   * @param {Object} data - Tool response data
   * @returns {Array} Generated insights
   */
  generateToolInsights(toolId, clientId, data) {
    const insights = [];
    
    try {
      // Get all previous responses for cross-tool analysis
      const allResponses = DataService.getAllToolResponses(clientId);
      
      // Generate tool-specific insights
      switch (toolId) {
        case 'tool1':
          insights.push(...this.generateTool1Insights(data));
          break;
        case 'tool2':
          insights.push(...this.generateTool2Insights(data, allResponses));
          break;
        case 'tool3':
          insights.push(...this.generateTool3Insights(data, allResponses));
          break;
        // Add more tools as needed
      }
      
      // Generate cross-tool insights if multiple tools completed
      if (Object.keys(allResponses).length > 0) {
        insights.push(...this.generateCrossToolInsights(toolId, data, allResponses));
      }
      
      // Save insights to CrossToolInsights sheet
      if (insights.length > 0) {
        DataService.saveInsights(clientId, toolId, insights);
      }
      
      return insights;
      
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  },
  
  /**
   * Generate Tool 1 (Orientation) specific insights
   */
  generateTool1Insights(data) {
    const insights = [];
    
    // Age-based insights
    if (data.age >= 55) {
      insights.push({
        type: 'retirement_urgency',
        insight: 'Limited time to retirement - acceleration needed',
        priority: 'HIGH',
        adaptations: ['emphasize_retirement', 'increase_urgency_tone']
      });
    } else if (data.age <= 30) {
      insights.push({
        type: 'time_advantage',
        insight: 'Young age provides compound interest advantage',
        priority: 'MEDIUM',
        adaptations: ['emphasize_long_term', 'focus_growth']
      });
    }
    
    // Income-based insights
    const incomeLevel = this.parseIncomeLevel(data.annualIncome);
    if (incomeLevel < 50000) {
      insights.push({
        type: 'budget_priority',
        insight: 'Lower income requires careful budgeting focus',
        priority: 'HIGH',
        adaptations: ['emphasize_budgeting', 'debt_avalanche']
      });
    }
    
    // Goal-based insights
    if (data.primaryGoal === 'Eliminate Debt') {
      insights.push({
        type: 'debt_focus',
        insight: 'Debt elimination is primary concern',
        priority: 'CRITICAL',
        adaptations: ['debt_heavy_questions', 'payment_strategies']
      });
    }
    
    // Mindset insights
    const mindsetScore = (data.financialSituation || 0) + (data.moneyRelationship || 0) + (data.goalConfidence || 0);
    if (mindsetScore < -3) {
      insights.push({
        type: 'mindset_barrier',
        insight: 'Negative money mindset needs addressing',
        priority: 'HIGH',
        adaptations: ['gentle_tone', 'confidence_building']
      });
    }
    
    return insights;
  },
  
  /**
   * Generate Tool 2 insights based on Tool 1 context
   */
  generateTool2Insights(data, allResponses) {
    const insights = [];
    const tool1Data = allResponses.tool1?.data;
    
    if (tool1Data) {
      // Cross-reference debt insights
      if (tool1Data.primaryGoal === 'Eliminate Debt' && data.debtPaymentStress > 7) {
        insights.push({
          type: 'debt_stress_confirmation',
          insight: 'High debt stress confirmed - needs immediate attention',
          priority: 'CRITICAL',
          adaptations: ['prioritize_debt_tools', 'stress_management']
        });
      }
      
      // Cash flow insights
      if (data.monthlyShortfall > 0 && tool1Data.age >= 50) {
        insights.push({
          type: 'cashflow_urgency',
          insight: 'Negative cash flow with limited time to recover',
          priority: 'CRITICAL',
          adaptations: ['emergency_mode', 'immediate_action']
        });
      }
    }
    
    return insights;
  },
  
  /**
   * Generate Tool 3 insights based on previous tools
   */
  generateTool3Insights(data, allResponses) {
    const insights = [];
    // Tool 3 specific insight logic will be added
    return insights;
  },
  
  /**
   * Generate cross-tool insights
   */
  generateCrossToolInsights(currentTool, currentData, allResponses) {
    const insights = [];
    
    // Example: Age + Debt combination
    const tool1Data = allResponses.tool1?.data;
    const tool2Data = allResponses.tool2?.data;
    
    if (tool1Data && tool2Data) {
      if (tool1Data.age >= 55 && tool2Data.debtToIncomeRatio > 0.4) {
        insights.push({
          type: 'high_risk_profile',
          insight: 'High debt with limited time creates significant risk',
          priority: 'CRITICAL',
          adaptations: ['aggressive_debt_focus', 'professional_consultation']
        });
      }
    }
    
    return insights;
  },
  
  // ===== TOOL ADAPTERS =====
  
  /**
   * Get tool-specific adapter
   */
  getToolAdapter(toolId) {
    return this.ToolAdapters[toolId] || null;
  },
  
  /**
   * Tool-specific adaptation logic
   */
  ToolAdapters: {
    
    tool2: {
      adaptationSummary: [],
      
      adapt(baseConfig, insights, clientId) {
        let adaptedConfig;
        try {
          adaptedConfig = JSON.parse(JSON.stringify(baseConfig)); // Deep clone
        } catch (error) {
          console.error('Error cloning baseConfig:', error);
          adaptedConfig = baseConfig; // Fallback to shallow reference
        }
        this.adaptationSummary = [];
        
        insights.forEach(insight => {
          if (insight.adaptations) {
            insight.adaptations.forEach(adaptation => {
              switch (adaptation) {
                case 'emphasize_budgeting':
                  this.emphasizeBudgetingQuestions(adaptedConfig);
                  this.adaptationSummary.push('Added budget-focused questions');
                  break;
                  
                case 'debt_heavy_questions':
                  this.addDebtFocusedQuestions(adaptedConfig);
                  this.adaptationSummary.push('Emphasized debt-related questions');
                  break;
                  
                case 'emphasize_retirement':
                  this.emphasizeRetirementQuestions(adaptedConfig);
                  this.adaptationSummary.push('Added retirement urgency focus');
                  break;
              }
            });
          }
        });
        
        return adaptedConfig;
      },
      
      emphasizeBudgetingQuestions(config) {
        // Add budget-specific questions to financial section
        if (config.sections) {
          const financialSection = config.sections.find(s => s.id === 'financial');
          if (financialSection) {
            financialSection.fields.unshift({
              name: 'budgetingChallenges',
              label: 'What are your biggest budgeting challenges?',
              type: 'textarea',
              required: true,
              priority: 'HIGH'
            });
          }
        }
      },
      
      addDebtFocusedQuestions(config) {
        // Add debt-specific section
        if (config.sections) {
          config.sections.splice(1, 0, {
            id: 'debt_focus',
            title: 'Debt Management Focus',
            icon: '💳',
            description: 'Based on your orientation, debt is a primary concern',
            fields: [
              {
                name: 'debtPaymentStrategy',
                label: 'Current debt payment strategy',
                type: 'select',
                options: ['Minimum payments only', 'Avalanche (highest interest)', 'Snowball (smallest balance)', 'No strategy'],
                required: true
              },
              {
                name: 'debtConsolidationInterest',
                label: 'Interest in debt consolidation',
                type: 'slider',
                min: 1,
                max: 10,
                required: true
              }
            ]
          });
        }
      },
      
      emphasizeRetirementQuestions(config) {
        // Add retirement urgency section
        if (config.sections) {
          config.sections.push({
            id: 'retirement_urgency',
            title: 'Retirement Acceleration',
            icon: '⏰',
            description: 'Time-sensitive retirement planning',
            fields: [
              {
                name: 'catchUpContributions',
                label: 'Are you making catch-up contributions?',
                type: 'radio',
                options: ['Yes', 'No', 'Not sure what this means'],
                required: true
              },
              {
                name: 'retirementGapConcern',
                label: 'How concerned are you about retirement shortfall?',
                type: 'slider',
                min: 1,
                max: 10,
                required: true
              }
            ]
          });
        }
      },
      
      getAdaptationSummary() {
        return this.adaptationSummary;
      }
    },
    
    tool3: {
      adaptationSummary: [],
      
      adapt(baseConfig, insights, clientId) {
        let adaptedConfig;
        try {
          adaptedConfig = JSON.parse(JSON.stringify(baseConfig)); // Deep clone
        } catch (error) {
          console.error('Error cloning baseConfig:', error);
          adaptedConfig = baseConfig; // Fallback to shallow reference
        }
        this.adaptationSummary = [];
        
        // Tool 3 adaptation logic based on insights from Tools 1 & 2
        insights.forEach(insight => {
          if (insight.type === 'mindset_barrier') {
            this.addGentleApproach(adaptedConfig);
            this.adaptationSummary.push('Applied gentle tone for mindset barriers');
          }
          
          if (insight.type === 'debt_stress_confirmation') {
            this.addDebtStressQuestions(adaptedConfig);
            this.adaptationSummary.push('Added debt stress management focus');
          }
        });
        
        return adaptedConfig;
      },
      
      addGentleApproach(config) {
        // Modify question tone and add confidence-building elements
        if (config.introduction) {
          config.introduction.tone = 'gentle';
          config.introduction.message = 'This assessment helps identify areas where you already have strengths...';
        }
      },
      
      addDebtStressQuestions(config) {
        // Add debt-related emotional questions
        if (config.sections) {
          config.sections.unshift({
            id: 'debt_emotions',
            title: 'Understanding Debt Stress',
            icon: '💭',
            fields: [
              {
                name: 'debtEmotionalImpact',
                label: 'How does debt affect your daily mood?',
                type: 'slider',
                min: 1,
                max: 10,
                labels: ['No impact', 'Constant worry'],
                required: true
              }
            ]
          });
        }
      },
      
      getAdaptationSummary() {
        return this.adaptationSummary;
      }
    }
  },
  
  // ===== REUSABLE FORM COMPONENTS =====
  
  /**
   * Generate standard demographic fields
   */
  getDemographicFields() {
    return [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'age', label: 'Age', type: 'number', min: 18, max: 100, required: true }
    ];
  },
  
  /**
   * Generate standard financial fields
   */
  getFinancialFields() {
    return [
      {
        name: 'annualIncome',
        label: 'Annual Household Income',
        type: 'select',
        options: ['< $30,000', '$30,000-$50,000', '$50,000-$75,000', '$75,000-$100,000', '$100,000-$150,000', '> $150,000'],
        required: true
      },
      {
        name: 'monthlyExpenses',
        label: 'Monthly Expenses',
        type: 'number',
        min: 0,
        required: true
      }
    ];
  },
  
  /**
   * Generate mindset scale fields
   */
  getMindsetScaleFields() {
    return [
      {
        name: 'financialConfidence',
        label: 'How confident are you about your financial future?',
        type: 'slider',
        min: -3,
        max: 3,
        labels: ['Very Worried', 'Worried', 'Concerned', 'Neutral', 'Hopeful', 'Confident', 'Very Confident'],
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
      }
    ];
  },
  
  // ===== SCORING ENGINE =====
  
  /**
   * Calculate comprehensive scores for any tool
   */
  calculateScores(toolId, data) {
    const scores = {};
    
    switch (toolId) {
      case 'tool1':
        scores.financialHealth = this.calculateFinancialHealthScore(data);
        scores.mindset = this.calculateMindsetScore(data);
        scores.overall = Math.round((scores.financialHealth + (scores.mindset + 9) * 100/18) / 2);
        break;
        
      case 'tool2':
        scores.cashFlow = this.calculateCashFlowScore(data);
        scores.debtHealth = this.calculateDebtScore(data);
        scores.overall = Math.round((scores.cashFlow + scores.debtHealth) / 2);
        break;
        
      // Add more tool-specific scoring
    }
    
    return scores;
  },
  
  /**
   * Calculate financial health score (0-100)
   */
  calculateFinancialHealthScore(data) {
    let score = 50; // Base score
    
    // Financial situation contributes ±30 points
    score += (parseInt(data.financialSituation) || 0) * 10;
    
    // Income level (estimated contribution)
    const incomeLevel = this.parseIncomeLevel(data.annualIncome);
    if (incomeLevel > 100000) score += 15;
    else if (incomeLevel > 75000) score += 10;
    else if (incomeLevel < 30000) score -= 15;
    
    // Debt level impact
    if (data.totalDebt === 'None') score += 15;
    else if (data.totalDebt === '> $100,000') score -= 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  },
  
  /**
   * Calculate mindset score (-9 to +9)
   */
  calculateMindsetScore(data) {
    return (parseInt(data.financialSituation) || 0) +
           (parseInt(data.moneyRelationship) || 0) +
           (parseInt(data.goalConfidence) || 0);
  },
  
  /**
   * Parse income level from range string
   */
  parseIncomeLevel(incomeRange) {
    const ranges = {
      '< $30,000': 25000,
      '$30,000-$50,000': 40000,
      '$50,000-$75,000': 62500,
      '$75,000-$100,000': 87500,
      '$100,000-$150,000': 125000,
      '> $150,000': 175000
    };
    return ranges[incomeRange] || 50000;
  },
  
  // ===== TOOL RECOMMENDATION ENGINE =====
  
  /**
   * Recommend next tool based on completed tools and insights
   */
  recommendNextTool(clientId) {
    try {
      const toolStatuses = DataService.getToolStatuses(clientId);
      const completedTools = Object.keys(toolStatuses).filter(tool => toolStatuses[tool] === 'completed');
      const insights = DataService.getRelevantInsights(clientId, 'next_tool');
      
      // Tool sequence logic
      const toolSequence = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
      
      // Find next uncompleted tool
      for (const tool of toolSequence) {
        if (!completedTools.includes(tool)) {
          return {
            toolId: tool,
            reason: this.getToolRecommendationReason(tool, insights),
            urgency: this.getToolUrgency(tool, insights)
          };
        }
      }
      
      return {
        toolId: null,
        reason: 'All tools completed!',
        urgency: 'none'
      };
      
    } catch (error) {
      console.error('Error recommending next tool:', error);
      return {
        toolId: 'tool2', // Default fallback
        reason: 'Continuing with standard progression',
        urgency: 'normal'
      };
    }
  },
  
  /**
   * Get tool recommendation reason based on insights
   */
  getToolRecommendationReason(toolId, insights) {
    const urgentInsights = insights.filter(i => i.priority === 'CRITICAL' || i.priority === 'HIGH');
    
    const reasons = {
      tool1: 'Foundation assessment needed for all other tools',
      tool2: 'Understanding your complete financial picture is essential',
      tool3: urgentInsights.some(i => i.type.includes('mindset')) ? 
        'Mindset barriers identified - addressing these will accelerate progress' :
        'Psychological factors play a key role in financial success',
      tool4: urgentInsights.some(i => i.type.includes('debt')) ?
        'Debt management is critical for your financial progress' :
        'Building your financial freedom framework'
    };
    
    return reasons[toolId] || 'Continue with course progression';
  },
  
  /**
   * Determine tool urgency based on insights
   */
  getToolUrgency(toolId, insights) {
    const criticalInsights = insights.filter(i => i.priority === 'CRITICAL');
    
    if (criticalInsights.length > 0) {
      return 'critical';
    }
    
    const highInsights = insights.filter(i => i.priority === 'HIGH');
    if (highInsights.length > 1) {
      return 'high';
    }
    
    return 'normal';
  },
  
  // ===== VALIDATION ENGINE =====
  
  /**
   * Validate form data with tool-specific rules
   */
  validateData(toolId, data, config) {
    const errors = [];
    
    if (!config.sections) {
      return { valid: true, errors: [] };
    }
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required && (!data[field.name] || data[field.name] === '')) {
          errors.push(`${field.label} is required`);
        }
        
        // Type-specific validations
        if (data[field.name]) {
          switch (field.type) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field.name])) {
                errors.push(`${field.label} must be a valid email`);
              }
              break;
              
            case 'number':
              const num = parseFloat(data[field.name]);
              if (isNaN(num)) {
                errors.push(`${field.label} must be a number`);
              } else {
                if (field.min !== undefined && num < field.min) {
                  errors.push(`${field.label} must be at least ${field.min}`);
                }
                if (field.max !== undefined && num > field.max) {
                  errors.push(`${field.label} must be at most ${field.max}`);
                }
              }
              break;
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

/**
 * Test ToolFramework functionality
 */
function testToolFramework() {
  console.log('Testing ToolFramework...');
  
  // Test initialization
  const testConfig = { sections: [{ id: 'test', fields: [] }] };
  const initResult = ToolFramework.initializeTool('tool2', 'TEST001', testConfig);
  console.log('Init result:', initResult);
  
  // Test scoring
  const testData = {
    financialSituation: 1,
    moneyRelationship: 0,
    goalConfidence: 2,
    annualIncome: '$75,000-$100,000'
  };
  const scores = ToolFramework.calculateScores('tool1', testData);
  console.log('Scores:', scores);
  
  return 'ToolFramework test complete';
}