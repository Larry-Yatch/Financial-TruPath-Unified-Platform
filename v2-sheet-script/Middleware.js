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
  }
}
