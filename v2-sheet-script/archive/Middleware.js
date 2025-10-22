/**
 * Middleware - Cross-Tool Intelligence Engine
 * Generates insights and recommendations based on combined tool data
 */

const Middleware = {
  /**
   * Generate insights based on student profile
   * @param {Object} profile - Complete student profile from DataHub
   * @returns {Array} Array of insights
   */
  generateInsights(profile) {
    const insights = [];
    
    // Check for demographic-based insights
    if (profile.demographics) {
      insights.push(...this.demographicInsights(profile.demographics));
    }
    
    // Check for financial clarity insights
    if (profile.financialClarity) {
      insights.push(...this.financialClarityInsights(profile.financialClarity));
    }
    
    // Cross-tool insights
    if (profile.demographics && profile.financialClarity) {
      insights.push(...this.crossToolInsights(profile));
    }
    
    return insights;
  },
  
  /**
   * Generate demographic-based insights
   */
  demographicInsights(demographics) {
    const insights = [];
    
    if (demographics.age > 50) {
      insights.push({
        type: 'age-based',
        priority: 'high',
        message: 'With less than 15 years to retirement, maximizing contributions is critical',
        tool: 'orientation',
        recommendation: 'Focus on catch-up contributions and tax-advantaged accounts'
      });
    }
    
    if (demographics.income < 50000) {
      insights.push({
        type: 'income-based',
        priority: 'medium',
        message: 'Building emergency fund should be prioritized',
        tool: 'orientation',
        recommendation: 'Start with $1,000 emergency fund, then build to 3 months expenses'
      });
    }
    
    return insights;
  },
  
  /**
   * Generate financial clarity insights
   */
  financialClarityInsights(financialClarity) {
    const insights = [];
    
    // Check for high debt stress
    if (financialClarity.debtScore && financialClarity.debtScore > 70) {
      insights.push({
        type: 'debt-stress',
        priority: 'high',
        message: 'High debt stress detected - this may be limiting other financial goals',
        tool: 'financial-clarity',
        recommendation: 'Consider debt consolidation or avalanche method'
      });
    }
    
    // Check for low emergency fund
    if (financialClarity.emergencyScore && financialClarity.emergencyScore < 30) {
      insights.push({
        type: 'emergency-fund',
        priority: 'high',
        message: 'Emergency fund is critically low',
        tool: 'financial-clarity',
        recommendation: 'Prioritize building emergency savings before investments'
      });
    }
    
    return insights;
  },
  
  /**
   * Generate cross-tool insights
   */
  crossToolInsights(profile) {
    const insights = [];
    
    // Age + Retirement readiness
    if (profile.demographics.age > 50 && 
        profile.financialClarity.retirementScore < 50) {
      insights.push({
        type: 'retirement-urgency',
        priority: 'critical',
        message: 'Limited time to retirement with low retirement readiness',
        tools: ['orientation', 'financial-clarity'],
        recommendation: 'Immediate action needed - consider professional consultation'
      });
    }
    
    // Income + Debt ratio
    const debtToIncomeRatio = this.calculateDebtToIncomeRatio(profile);
    if (debtToIncomeRatio > 0.4) {
      insights.push({
        type: 'debt-to-income',
        priority: 'high',
        message: `Debt-to-income ratio is ${(debtToIncomeRatio * 100).toFixed(1)}% - above healthy threshold`,
        tools: ['orientation', 'financial-clarity'],
        recommendation: 'Focus on debt reduction before new investments'
      });
    }
    
    return insights;
  },
  
  /**
   * Calculate debt-to-income ratio
   */
  calculateDebtToIncomeRatio(profile) {
    if (!profile.demographics?.income || !profile.financialClarity?.debtScore) {
      return 0;
    }
    
    // Simplified calculation - in real app would use actual debt amounts
    const estimatedDebtRatio = profile.financialClarity.debtScore / 100;
    return estimatedDebtRatio;
  },
  
  /**
   * Get next recommended tool based on profile
   */
  recommendNextTool(profile) {
    const completedTools = profile.metadata?.completedTools || [];
    
    // Always start with orientation
    if (!completedTools.includes('orientation')) {
      return {
        toolId: 'orientation',
        reason: 'Foundation data needed for all other tools'
      };
    }
    
    // Financial clarity is critical second step
    if (!completedTools.includes('financial-clarity')) {
      return {
        toolId: 'financial-clarity',
        reason: 'Understanding your financial situation is essential'
      };
    }
    
    // If high debt stress, recommend control fear next
    if (profile.financialClarity?.debtScore > 70 && 
        !completedTools.includes('control-fear')) {
      return {
        toolId: 'control-fear',
        reason: 'Psychological barriers may be affecting your financial decisions'
      };
    }
    
    // Default progression
    const toolOrder = [
      'orientation',
      'financial-clarity', 
      'control-fear',
      'external-validation',
      'false-self-view',
      'issues-showing-love',
      'freedom-framework',
      'retirement-blueprint'
    ];
    
    for (const tool of toolOrder) {
      if (!completedTools.includes(tool)) {
        return {
          toolId: tool,
          reason: 'Continue with course progression'
        };
      }
    }
    
    return {
      toolId: null,
      reason: 'All tools completed!'
    };
  },
  
  /**
   * Identify patterns across tools
   */
  identifyPatterns(profile) {
    const patterns = [];
    
    // Check for avoidance patterns
    if (profile.financialClarity?.debtScore > 60 && 
        profile.controlFear?.score > 60) {
      patterns.push({
        type: 'avoidance',
        confidence: 0.8,
        description: 'High control needs combined with debt stress suggest avoidance patterns',
        impact: 'May resist necessary financial changes'
      });
    }
    
    return patterns;
  },
  
  /**
   * Calculate risk score
   */
  calculateRiskScore(profile) {
    let riskScore = 0;
    
    // Age risk
    if (profile.demographics?.age > 55) riskScore += 2;
    
    // Debt risk
    if (profile.financialClarity?.debtScore > 70) riskScore += 3;
    
    // Emergency fund risk
    if (profile.financialClarity?.emergencyScore < 30) riskScore += 3;
    
    // Retirement readiness risk
    if (profile.demographics?.age > 50 && 
        profile.financialClarity?.retirementScore < 50) riskScore += 2;
    
    return {
      score: riskScore,
      level: riskScore > 7 ? 'high' : riskScore > 4 ? 'medium' : 'low',
      factors: this.getRiskFactors(profile)
    };
  },
  
  /**
   * Get risk factors
   */
  getRiskFactors(profile) {
    const factors = [];
    
    if (profile.demographics?.age > 55) {
      factors.push('Limited time to retirement');
    }
    
    if (profile.financialClarity?.debtScore > 70) {
      factors.push('High debt burden');
    }
    
    if (profile.financialClarity?.emergencyScore < 30) {
      factors.push('Insufficient emergency savings');
    }
    
    return factors;
  },
  
  /**
   * Generate comprehensive Orientation Assessment Report
   */
  generateOrientationReport(data) {
    const report = {
      timestamp: new Date(),
      scores: {},
      profile: {},
      insights: [],
      recommendations: [],
      nextSteps: []
    };
    
    // Calculate Financial Health Score (0-100)
    report.scores.financialHealth = this.calculateOrientationFinancialHealth(data);
    
    // Calculate Mindset Score (-9 to +9)
    report.scores.mindset = 
      (parseInt(data.scarcityAbundance) || 0) + 
      (parseInt(data.financialAmbition) || 0) + 
      (parseInt(data.goalConfidence) || 0);
    
    // Determine profile type
    report.profile = this.determineUserProfile(
      report.scores.financialHealth, 
      report.scores.mindset
    );
    
    // Generate insights  
    report.insights = this.generateDetailedInsights(data, report.scores);
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(data, report);
    
    // Determine next steps
    report.nextSteps = this.determineNextSteps(report);
    
    return report;
  },
  
  /**
   * Calculate financial health from orientation data
   */
  calculateOrientationFinancialHealth(data) {
    let score = 50; // Base score
    
    // Financial situation (-3 to +3) contributes ±30 points
    score += (parseInt(data.financialSituation) || 0) * 10;
    
    // Income level (-3 to +3) contributes ±15 points  
    score += (parseInt(data.incomeLevel) || 0) * 5;
    
    // Debt level (-3 to +3) contributes ±15 points
    score += (parseInt(data.debtLevel) || 0) * 5;
    
    // Money relationship (-3 to +3) contributes ±10 points
    score += (parseInt(data.moneyRelationship) || 0) * 3.33;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  },
  
  /**
   * Determine user profile type based on scores
   */
  determineUserProfile(healthScore, mindsetScore) {
    if (healthScore >= 70 && mindsetScore >= 3) {
      return {
        type: 'Thriving Optimizer',
        emoji: '🚀',
        message: 'You\'re in a strong financial position with an abundance mindset',
        strengths: ['Strong financial foundation', 'Positive money mindset', 'Ready for growth'],
        focus: 'Wealth multiplication and optimization strategies'
      };
    } else if (healthScore >= 70 && mindsetScore < 3) {
      return {
        type: 'Cautious Success', 
        emoji: '🛡️',
        message: 'Financially stable but held back by limiting beliefs',
        strengths: ['Good financial position', 'Solid foundation', 'Room for mindset growth'],
        focus: 'Aligning mindset with financial reality'
      };
    } else if (healthScore >= 40 && mindsetScore >= 0) {
      return {
        type: 'Emerging Builder',
        emoji: '🌱',
        message: 'You\'re on the right path with room to grow',
        strengths: ['Positive trajectory', 'Balanced approach', 'Growth potential'],
        focus: 'Systematic improvement and confidence building'
      };
    } else if (healthScore < 40 && mindsetScore >= 0) {
      return {
        type: 'Optimistic Striver',
        emoji: '💪',
        message: 'Your positive mindset is your greatest asset',
        strengths: ['Strong mindset', 'High motivation', 'Ready for change'],
        focus: 'Converting optimism into concrete financial actions'
      };
    } else {
      return {
        type: 'Foundation Builder',
        emoji: '🏗️', 
        message: 'You\'re ready to build from the ground up',
        strengths: ['Clear starting point', 'Opportunity for growth', 'Fresh perspective'],
        focus: 'Building basics and celebrating small wins'
      };
    }
  },
  
  /**
   * Generate detailed insights from assessment
   */
  generateDetailedInsights(data, scores) {
    const insights = [];
    
    // Financial situation insights
    if (data.financialSituation <= -2) {
      insights.push({
        category: 'Urgent',
        icon: '🚨',
        message: 'Your financial situation needs immediate attention',
        detail: 'Starting with a clear financial picture is crucial',
        tool: 'Tool 2: Financial Clarity'
      });
    }
    
    // Debt insights
    if (data.debtLevel <= -2) {
      insights.push({
        category: 'Debt',
        icon: '⚠️',
        message: 'High debt is constraining your financial growth',
        detail: 'Strategic debt elimination can free up resources',
        tool: 'Tool 4: Financial Freedom Framework'
      });
    }
    
    // Mindset insights  
    if (scores.mindset <= -3) {
      insights.push({
        category: 'Mindset',
        icon: '🧠',
        message: 'Scarcity thinking is blocking your progress',
        detail: 'Shifting mindset is as important as financial strategy',
        tool: 'Tool 3: Control Fear Grounding'
      });
    } else if (scores.mindset >= 6) {
      insights.push({
        category: 'Strength',
        icon: '✨',
        message: 'Your abundance mindset is a powerful asset',
        detail: 'Leverage this strength for accelerated growth',
        tool: 'Tool 8: Investment Tool'
      });
    }
    
    // Goal-specific insights
    if (data.primaryGoal === 'retirement') {
      insights.push({
        category: 'Goal',
        icon: '🎯',
        message: 'Retirement planning is your priority',
        detail: 'Structured retirement strategies will serve you well',
        tool: 'Tools 6 & 8: Retirement Blueprint & Investment Tool'
      });
    }
    
    return insights;
  },
  
  /**
   * Generate personalized recommendations
   */
  generateRecommendations(data, report) {
    const recommendations = [];
    const healthScore = report.scores.financialHealth;
    
    // Priority 1: Emergency situations
    if (healthScore < 30) {
      recommendations.push({
        priority: 1,
        action: 'Complete Financial Clarity Assessment immediately',
        why: 'Understanding your complete financial picture is critical',
        timeframe: 'This week'
      });
    }
    
    // Priority 2: Debt management
    if (data.debtLevel <= -1) {
      recommendations.push({
        priority: 2,
        action: 'Create a debt elimination strategy',
        why: 'Reducing debt will improve cash flow and reduce stress',
        timeframe: 'Next 2 weeks'
      });
    }
    
    // Priority 3: Mindset work
    if (report.scores.mindset < 0) {
      recommendations.push({
        priority: 3,
        action: 'Begin daily mindset exercises',
        why: 'Your beliefs about money directly impact your financial outcomes',
        timeframe: 'Start today'
      });
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
  },
  
  /**
   * Determine next steps based on profile
   */
  determineNextSteps(report) {
    const toolSequence = [];
    
    // Determine tool sequence based on profile
    if (report.scores.financialHealth < 50) {
      toolSequence.push('Tool 2: Financial Clarity - Week 2');
      toolSequence.push('Tool 4: Freedom Framework - Week 4');
    }
    
    if (report.scores.mindset < 0) {
      toolSequence.push('Tool 3: Control Fear - Week 3');
      toolSequence.push('Tool 5: Issues Showing Love - Week 5');
    }
    
    if (report.profile.type === 'Thriving Optimizer') {
      toolSequence.push('Tool 8: Investment Tool - Available Now');
      toolSequence.push('Tool 6: Retirement Blueprint - Week 6');
    }
    
    return toolSequence.slice(0, 3);
  }
}
