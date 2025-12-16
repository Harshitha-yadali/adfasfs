/**
 * ATS Score Checker - 16 Parameter Model
 * 
 * UNIFIED with JD Optimizer - Uses the SAME 16 parameters:
 * 1. Contact & Title
 * 2. Summary/Objective  
 * 3. Role Title Match
 * 4. Skills Match (hard)
 * 5. Skills Match (soft)
 * 6. Section Order
 * 7. Word Variety
 * 8. Quantified Results
 * 9. Action Verbs & Impact
 * 10. Keyword Density
 * 11. Formatting & Readability
 * 12. Section Completeness
 * 13. Chronology & Dates
 * 14. Relevance Filtering
 * 15. Tools & Versions
 * 16. Project Technical Depth
 */

import { EnhancedScoringService, EnhancedScoringInput } from './enhancedScoringService';
import { EnhancedComprehensiveScore } from '../types/resume';
import FullResumeRewriter16ParameterService, { Parameter16Score } from './fullResumeRewriter16ParameterService';

// New unified 16-parameter scores interface (matches JD Optimizer)
export interface Unified16ParameterScores {
  contactTitle: number;           // 1. Contact & Title (max 10)
  summaryObjective: number;       // 2. Summary/Objective (max 8)
  roleTitleMatch: number;         // 3. Role Title Match (max 8)
  hardSkillsMatch: number;        // 4. Skills Match - hard (max 10)
  softSkillsMatch: number;        // 5. Skills Match - soft (max 5)
  sectionOrder: number;           // 6. Section Order (max 5)
  wordVariety: number;            // 7. Word Variety (max 5)
  quantifiedResults: number;      // 8. Quantified Results (max 8)
  actionVerbsImpact: number;      // 9. Action Verbs & Impact (max 8)
  keywordDensity: number;         // 10. Keyword Density (max 10)
  formattingReadability: number;  // 11. Formatting & Readability (max 5)
  sectionCompleteness: number;    // 12. Section Completeness (max 8)
  chronologyDates: number;        // 13. Chronology & Dates (max 5)
  relevanceFiltering: number;     // 14. Relevance Filtering (max 5)
  toolsVersions: number;          // 15. Tools & Versions (max 5)
  projectTechnicalDepth: number;  // 16. Project Technical Depth (max 7)
}

export interface ATSScore16Parameter {
  overallScore: number; // 0-100
  confidence: 'High' | 'Medium' | 'Low';
  matchQuality: 'Excellent' | 'Good' | 'Adequate' | 'Poor' | 'Inadequate';
  interviewChance: '1-2%' | '5-12%' | '20-30%' | '40-60%' | '70-80%' | '80-90%' | '90%+';
  // Keep old scores for backward compatibility
  scores: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceRelevance: number;
    technicalCompetencies: number;
    educationScore: number;
    quantifiedAchievements: number;
    employmentHistory: number;
    industryExperience: number;
    jobTitleMatch: number;
    careerProgression: number;
    certifications: number;
    formatting: number;
    contentQuality: number;
    grammar: number;
    resumeLength: number;
    filenameQuality: number;
  };
  // NEW: Unified 16-parameter scores (same as JD Optimizer)
  unified16Scores?: Parameter16Score[];
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  missingKeywords: {
    critical: string[];
    important: string[];
    optional: string[];
  };
}

export class ATSScoreChecker16Parameter {
  
  /**
   * Evaluate resume using 16-parameter ATS model
   */
  static async evaluateResume(
    resumeText: string,
    jobDescription?: string,
    filename?: string,
    file?: File,
    useEnhancedProcessing: boolean = true
  ): Promise<ATSScore16Parameter> {
    
    console.log('🎯 ATSScoreChecker16Parameter.evaluateResume() called');
    console.log('📊 This should return 16 parameters, NOT 220+ metrics');
    
    // Use enhanced processing (including OCR) if file is provided and enabled
    if (file && useEnhancedProcessing) {
      console.log('🔍 16-Parameter ATS: Using enhanced processing (OCR enabled)');
      const enhancedScore = await EnhancedScoringService.processAndScore(
        file, 
        undefined, 
        jobDescription
      );
      return this.mapToSixteenParameters(enhancedScore, jobDescription);
    } else {
      // Use text-only processing (no OCR)
      console.log('📝 16-Parameter ATS: Using text-only processing (OCR disabled)');
      const enhancedInput: EnhancedScoringInput = {
        resumeText,
        jobDescription,
        extractionMode: 'TEXT',
        filename
      };
      
      const enhancedScore = await EnhancedScoringService.calculateScore(enhancedInput);
      return this.mapToSixteenParameters(enhancedScore, jobDescription);
    }
  }

  /**
   * Evaluate resume with OCR explicitly enabled
   */
  static async evaluateResumeWithOCR(
    file: File,
    jobDescription?: string
  ): Promise<ATSScore16Parameter> {
    console.log('🔍 16-Parameter ATS: OCR processing explicitly requested');
    return this.evaluateResume('', jobDescription, file.name, file, true);
  }

  /**
   * Evaluate resume with OCR explicitly disabled (text-only)
   */
  static async evaluateResumeTextOnly(
    resumeText: string,
    jobDescription?: string,
    filename?: string
  ): Promise<ATSScore16Parameter> {
    console.log('📝 16-Parameter ATS: Text-only processing explicitly requested');
    return this.evaluateResume(resumeText, jobDescription, filename, undefined, false);
  }
  
  /**
   * Map enhanced scoring results to 16-parameter format
   */
  private static mapToSixteenParameters(
    enhancedScore: EnhancedComprehensiveScore,
    jobDescription?: string
  ): ATSScore16Parameter {
    
    const hasJD = Boolean(jobDescription && jobDescription.length > 50);
    
    // Use intelligent mapping that considers both enhanced scores AND direct analysis
    const scores = this.calculateIntelligentParameterScores(enhancedScore, jobDescription);
    
    // Calculate raw total from intelligent scores
    const rawTotal = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    // Define max scores for each parameter
    const maxScores: Record<string, number> = {
      keywordMatch: 25, skillsAlignment: 20, experienceRelevance: 15,
      technicalCompetencies: 12, educationScore: 10, quantifiedAchievements: 8,
      employmentHistory: 8, industryExperience: 7, jobTitleMatch: 6,
      careerProgression: 6, certifications: 5, formatting: 5,
      contentQuality: 4, grammar: 3, resumeLength: 2, filenameQuality: 2
    };
    
    // Ensure no parameter exceeds its maximum
    Object.keys(scores).forEach(key => {
      scores[key] = Math.min(scores[key], maxScores[key] || 5);
    });
    
    // Calculate overall score from parameter totals
    const overallScore = Math.min(100, Math.max(0, Object.values(scores).reduce((sum, score) => sum + score, 0)));
    
    // Determine match quality and interview chance
    const matchQuality = this.getMatchQuality(overallScore);
    const interviewChance = this.getInterviewChance(overallScore);
    
    // Generate summary
    const summary = this.generateSummary(enhancedScore, hasJD);
    
    // Extract strengths and improvements
    const strengths = enhancedScore.keyStrengths.slice(0, 3);
    const areasToImprove = enhancedScore.improvementAreas.slice(0, 3);
    
    // Map missing keywords
    const missingKeywords = this.mapMissingKeywords(enhancedScore.missing_keywords_enhanced);
    
    const result = {
      overallScore,
      confidence: enhancedScore.confidence,
      matchQuality,
      interviewChance,
      scores: {
        keywordMatch: scores.keywordMatch,
        skillsAlignment: scores.skillsAlignment,
        experienceRelevance: scores.experienceRelevance,
        technicalCompetencies: scores.technicalCompetencies,
        educationScore: scores.educationScore,
        quantifiedAchievements: scores.quantifiedAchievements,
        employmentHistory: scores.employmentHistory,
        industryExperience: scores.industryExperience,
        jobTitleMatch: scores.jobTitleMatch,
        careerProgression: scores.careerProgression,
        certifications: scores.certifications,
        formatting: scores.formatting,
        contentQuality: scores.contentQuality,
        grammar: scores.grammar,
        resumeLength: scores.resumeLength,
        filenameQuality: scores.filenameQuality
      },
      summary,
      strengths,
      areasToImprove,
      missingKeywords,
      // Add unified 16 scores (same as JD Optimizer) - will be populated by evaluateWithUnified16
      unified16Scores: undefined
    };
    
    console.log('✅ 16-Parameter ATS Result:', {
      overallScore: result.overallScore,
      parameterCount: Object.keys(result.scores).length,
      sampleParameters: Object.keys(result.scores).slice(0, 3)
    });
    
    return result;
  }

  /**
   * NEW: Evaluate resume using the UNIFIED 16-parameter model (same as JD Optimizer)
   * This ensures consistency between Score Checker and JD Optimizer scores
   */
  static async evaluateWithUnified16(
    resumeText: string,
    jobDescription: string,
    targetRole?: string
  ): Promise<ATSScore16Parameter> {
    console.log('🎯 ATSScoreChecker16Parameter.evaluateWithUnified16() - Using UNIFIED 16 parameters');
    console.log('📝 Resume text length:', resumeText.length);
    console.log('📋 JD length:', jobDescription.length);
    
    // First get the legacy scores for backward compatibility
    const legacyResult = await this.evaluateResumeTextOnly(resumeText, jobDescription);
    console.log('📊 Legacy result obtained, now getting unified scores...');
    
    // Now get the unified 16-parameter scores using FullResumeRewriter16ParameterService
    try {
      console.log('🔄 Calling FullResumeRewriter16ParameterService.scoreOnly()...');
      const unified16Result = await FullResumeRewriter16ParameterService.scoreOnly(
        resumeText,
        jobDescription,
        targetRole
      );
      
      console.log('✅ scoreOnly returned:', unified16Result);
      
      // Calculate overall from unified scores
      const unifiedOverall = unified16Result.overallScore;
      
      // Update the result with unified scores
      legacyResult.unified16Scores = unified16Result.scores;
      legacyResult.overallScore = unifiedOverall; // Use unified overall score
      legacyResult.matchQuality = this.getMatchQuality(unifiedOverall);
      legacyResult.interviewChance = this.getInterviewChance(unifiedOverall);
      
      // Map unified scores to legacy format for backward compatibility
      legacyResult.scores = this.mapUnifiedToLegacy(unified16Result.scores);
      
      // Update suggestions from unified scores
      const allSuggestions = unified16Result.scores
        .filter(s => s.percentage < 80)
        .flatMap(s => s.suggestions)
        .slice(0, 5);
      
      if (allSuggestions.length > 0) {
        legacyResult.areasToImprove = allSuggestions;
      }
      
      // Update summary to match the unified score
      legacyResult.summary = this.generateSummaryFromScore(unifiedOverall, true);
      
      console.log('✅ Unified 16-Parameter Result:', {
        overallScore: unifiedOverall,
        parameterCount: unified16Result.scores.length,
        parameters: unified16Result.scores.map(s => `${s.parameter}: ${s.percentage}%`),
        unified16ScoresSet: !!legacyResult.unified16Scores
      });
      
    } catch (error) {
      console.error('❌ Failed to get unified 16 scores:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack');
    }
    
    console.log('🔍 Final result unified16Scores:', legacyResult.unified16Scores?.length || 'undefined');
    return legacyResult;
  }

  /**
   * Evaluate resume using UNIFIED 16 parameters with PARSED resume data
   * This method uses already-parsed resume data for more accurate scoring
   */
  static async evaluateWithUnified16AndParsedData(
    resumeText: string,
    jobDescription: string,
    parsedResumeData: any, // ParsedResume type
    targetRole?: string
  ): Promise<ATSScore16Parameter> {
    console.log('🎯 ATSScoreChecker16Parameter.evaluateWithUnified16AndParsedData() - Using PARSED data');
    console.log('📝 Resume text length:', resumeText.length);
    console.log('📋 JD length:', jobDescription.length);
    console.log('📊 Parsed data:', {
      name: parsedResumeData?.name,
      skills: parsedResumeData?.skills?.length || 0,
      workExp: parsedResumeData?.workExperience?.length || 0,
      projects: parsedResumeData?.projects?.length || 0,
      education: parsedResumeData?.education?.length || 0
    });
    
    // First get the legacy scores for backward compatibility
    const legacyResult = await this.evaluateResumeTextOnly(resumeText, jobDescription);
    console.log('📊 Legacy result obtained, now getting unified scores with parsed data...');
    
    // Now get the unified 16-parameter scores using parsed data
    try {
      console.log('🔄 Calling FullResumeRewriter16ParameterService.scoreWithParsedData()...');
      const unified16Result = await FullResumeRewriter16ParameterService.scoreWithParsedData(
        parsedResumeData,
        jobDescription,
        targetRole
      );
      
      console.log('✅ scoreWithParsedData returned:', unified16Result);
      
      // Calculate overall from unified scores
      const unifiedOverall = unified16Result.overallScore;
      
      // Update the result with unified scores
      legacyResult.unified16Scores = unified16Result.scores;
      legacyResult.overallScore = unifiedOverall;
      legacyResult.matchQuality = this.getMatchQuality(unifiedOverall);
      legacyResult.interviewChance = this.getInterviewChance(unifiedOverall);
      
      // Map unified scores to legacy format
      legacyResult.scores = this.mapUnifiedToLegacy(unified16Result.scores);
      
      // Update suggestions from unified scores
      const allSuggestions = unified16Result.scores
        .filter(s => s.percentage < 80)
        .flatMap(s => s.suggestions)
        .slice(0, 5);
      
      if (allSuggestions.length > 0) {
        legacyResult.areasToImprove = allSuggestions;
      }
      
      // Update summary to match the unified score
      legacyResult.summary = this.generateSummaryFromScore(unifiedOverall, true);
      
      console.log('✅ Unified 16-Parameter Result (with parsed data):', {
        overallScore: unifiedOverall,
        parameterCount: unified16Result.scores.length,
        parameters: unified16Result.scores.map(s => `${s.parameter}: ${s.percentage}%`)
      });
      
    } catch (error) {
      console.error('❌ Failed to get unified 16 scores with parsed data:', error);
      // Fallback to text-only scoring
      return this.evaluateWithUnified16(resumeText, jobDescription, targetRole);
    }
    
    return legacyResult;
  }

  /**
   * Map unified 16 scores to legacy format for backward compatibility
   */
  private static mapUnifiedToLegacy(unified16Scores: Parameter16Score[]): ATSScore16Parameter['scores'] {
    // Create a map for quick lookup
    const scoreMap = new Map<number, Parameter16Score>();
    unified16Scores.forEach(s => scoreMap.set(s.parameterNumber, s));
    
    // Map unified parameters to legacy parameters
    // Unified: 1-Contact, 2-Summary, 3-RoleTitle, 4-HardSkills, 5-SoftSkills, 6-SectionOrder,
    //          7-WordVariety, 8-Quantified, 9-ActionVerbs, 10-KeywordDensity, 11-Formatting,
    //          12-SectionComplete, 13-Chronology, 14-Relevance, 15-Tools, 16-ProjectDepth
    
    const getScore = (num: number) => scoreMap.get(num);
    
    return {
      keywordMatch: Math.round(((getScore(10)?.percentage || 0) / 100) * 25), // Keyword Density -> keywordMatch
      skillsAlignment: Math.round(((getScore(4)?.percentage || 0) / 100) * 20), // Hard Skills -> skillsAlignment
      experienceRelevance: Math.round(((getScore(14)?.percentage || 0) / 100) * 15), // Relevance -> experienceRelevance
      technicalCompetencies: Math.round(((getScore(15)?.percentage || 0) / 100) * 12), // Tools -> technicalCompetencies
      educationScore: Math.round(((getScore(12)?.percentage || 0) / 100) * 10), // Section Complete -> educationScore
      quantifiedAchievements: Math.round(((getScore(8)?.percentage || 0) / 100) * 8), // Quantified -> quantifiedAchievements
      employmentHistory: Math.round(((getScore(13)?.percentage || 0) / 100) * 8), // Chronology -> employmentHistory
      industryExperience: Math.round(((getScore(16)?.percentage || 0) / 100) * 7), // Project Depth -> industryExperience
      jobTitleMatch: Math.round(((getScore(3)?.percentage || 0) / 100) * 6), // Role Title -> jobTitleMatch
      careerProgression: Math.round(((getScore(9)?.percentage || 0) / 100) * 6), // Action Verbs -> careerProgression
      certifications: Math.round(((getScore(5)?.percentage || 0) / 100) * 5), // Soft Skills -> certifications
      formatting: Math.round(((getScore(11)?.percentage || 0) / 100) * 5), // Formatting -> formatting
      contentQuality: Math.round(((getScore(2)?.percentage || 0) / 100) * 4), // Summary -> contentQuality
      grammar: Math.round(((getScore(7)?.percentage || 0) / 100) * 3), // Word Variety -> grammar
      resumeLength: Math.round(((getScore(6)?.percentage || 0) / 100) * 2), // Section Order -> resumeLength
      filenameQuality: Math.round(((getScore(1)?.percentage || 0) / 100) * 2), // Contact -> filenameQuality
    };
  }
  
  /**
   * Determine match quality based on overall score
   */
  private static getMatchQuality(score: number): 'Excellent' | 'Good' | 'Adequate' | 'Poor' | 'Inadequate' {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Adequate';
    if (score >= 35) return 'Poor';
    return 'Inadequate';
  }
  
  /**
   * Determine shortlist/interview chance based on overall score
   * Higher scores = higher chances of getting shortlisted
   */
  private static getInterviewChance(score: number): '1-2%' | '5-12%' | '20-30%' | '40-60%' | '70-80%' | '80-90%' | '90%+' {
    // For high scores (90+), show very high shortlist chances
    if (score >= 95) return '90%+';
    if (score >= 90) return '80-90%';
    if (score >= 85) return '70-80%';
    if (score >= 75) return '40-60%';
    if (score >= 60) return '20-30%';
    if (score >= 40) return '5-12%';
    return '1-2%';
  }
  
  /**
   * Generate concise summary from enhanced score
   */
  private static generateSummary(enhancedScore: EnhancedComprehensiveScore, hasJD: boolean): string {
    return this.generateSummaryFromScore(enhancedScore.overall, hasJD);
  }
  
  /**
   * Generate concise summary from a numeric score
   * Used by both legacy and unified scoring
   */
  private static generateSummaryFromScore(score: number, hasJD: boolean): string {
    const mode = hasJD ? 'JD-based' : 'general';
    
    if (score >= 85) {
      return `Excellent ${mode} resume with strong ATS compatibility and comprehensive skill alignment.`;
    } else if (score >= 70) {
      return `Good ${mode} resume with solid foundation, minor improvements needed for optimal ATS performance.`;
    } else if (score >= 55) {
      return `Adequate ${mode} resume with moderate ATS compatibility, several areas need enhancement.`;
    } else if (score >= 35) {
      return `Poor ${mode} resume with significant ATS compatibility issues requiring major improvements.`;
    } else {
      return `Inadequate ${mode} resume with critical ATS failures, comprehensive revision needed.`;
    }
  }
  
  /**
   * Map missing keywords to priority categories
   */
  private static mapMissingKeywords(enhancedKeywords: any[]): {
    critical: string[];
    important: string[];
    optional: string[];
  } {
    const critical: string[] = [];
    const important: string[] = [];
    const optional: string[] = [];
    
    enhancedKeywords.forEach(keyword => {
      if (keyword.tier === 'critical') {
        critical.push(keyword.keyword);
      } else if (keyword.tier === 'important') {
        important.push(keyword.keyword);
      } else {
        optional.push(keyword.keyword);
      }
    });
    
    return {
      critical: critical.slice(0, 5),
      important: important.slice(0, 5),
      optional: optional.slice(0, 5)
    };
  }
  
  /**
   * Calculate intelligent parameter scores that don't just rely on tier percentages
   */
  private static calculateIntelligentParameterScores(
    enhancedScore: EnhancedComprehensiveScore,
    jobDescription?: string
  ): Record<string, number> {
    
    // Start with enhanced scoring as baseline but apply intelligent adjustments
    const baseScores = {
      // Skills & Keywords Group (45 points total) - Use intelligent scoring
      keywordMatch: this.calculateKeywordMatch(enhancedScore, jobDescription),
      skillsAlignment: this.calculateSkillsAlignment(enhancedScore, jobDescription),
      
      // Experience Group (29 points total) - Apply intelligent experience scoring
      experienceRelevance: this.calculateExperienceRelevance(enhancedScore, jobDescription),
      employmentHistory: this.calculateEmploymentHistory(enhancedScore),
      careerProgression: this.calculateCareerProgression(enhancedScore),
      
      // Technical & Critical Metrics (18 points total)
      technicalCompetencies: Math.max(
        Math.round((enhancedScore.critical_metrics.technical_skills_alignment.percentage / 100) * 12),
        enhancedScore.critical_metrics.technical_skills_alignment.score > 0 ? 2 : 0
      ),
      quantifiedAchievements: this.calculateQuantifiedAchievements(enhancedScore),
      jobTitleMatch: Math.max(
        Math.round((enhancedScore.critical_metrics.job_title_relevance.percentage / 100) * 6),
        enhancedScore.critical_metrics.job_title_relevance.score > 0 ? 1 : 0
      ),
      
      // Education & Certifications (15 points total)
      educationScore: Math.max(
        Math.round((enhancedScore.tier_scores.education.percentage / 100) * 10),
        enhancedScore.tier_scores.education.score > 0 ? 2 : 0
      ),
      certifications: Math.max(
        Math.round((enhancedScore.tier_scores.certifications.percentage / 100) * 5),
        enhancedScore.tier_scores.certifications.score > 0 ? 1 : 0
      ),
      
      // Structure & Quality (13 points total)
      formatting: Math.max(
        Math.round((enhancedScore.tier_scores.basic_structure.percentage / 100) * 5),
        2 // Minimum formatting score
      ),
      contentQuality: Math.max(
        Math.round((enhancedScore.tier_scores.content_structure.percentage / 100) * 4),
        1 // Minimum content quality
      ),
      grammar: Math.max(
        Math.round((enhancedScore.tier_scores.qualitative.percentage / 100) * 3),
        1 // Minimum grammar score
      ),
      resumeLength: Math.max(
        Math.round((enhancedScore.tier_scores.basic_structure.percentage / 100) * 2),
        1 // Minimum length score
      ),
      
      // Industry & Competitive (7 points total)
      industryExperience: Math.max(
        Math.round((enhancedScore.tier_scores.competitive.percentage / 100) * 7),
        enhancedScore.tier_scores.competitive.score > 0 ? 1 : 0
      ),
      
      // Filename Quality (2 points)
      filenameQuality: Math.max(
        Math.round((enhancedScore.tier_scores.basic_structure.percentage / 100) * 2),
        1 // Minimum filename score
      )
    };
    
    return baseScores;
  }
  
  /**
   * Calculate experience relevance with intelligent analysis
   */
  private static calculateExperienceRelevance(
    enhancedScore: EnhancedComprehensiveScore,
    jobDescription?: string
  ): number {
    const maxScore = 15;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.tier_scores.experience.percentage / 100) * maxScore);
    
    // Apply intelligent adjustments
    if (enhancedScore.critical_metrics.experience_relevance.score > 0) {
      // If critical experience metric shows relevance, ensure minimum score
      score = Math.max(score, 3);
    }
    
    // If JD-based and has job description, boost score based on keyword matches
    if (jobDescription && enhancedScore.critical_metrics.jd_keywords_match.percentage > 30) {
      score = Math.max(score, Math.round(maxScore * 0.4)); // At least 40% if good keyword match
    }
    
    // Ensure experience tier contributes meaningfully
    if (enhancedScore.tier_scores.experience.score > 0) {
      score = Math.max(score, 2); // Minimum 2 points if any experience detected
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate employment history score
   */
  private static calculateEmploymentHistory(enhancedScore: EnhancedComprehensiveScore): number {
    const maxScore = 8;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.tier_scores.experience.percentage / 100) * maxScore);
    
    // Ensure minimum if experience exists
    if (enhancedScore.tier_scores.experience.score > 0) {
      score = Math.max(score, 2);
    }
    
    // Boost if no red flags in employment
    if (enhancedScore.red_flags.length === 0) {
      score = Math.max(score, Math.round(maxScore * 0.5));
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate career progression score
   */
  private static calculateCareerProgression(enhancedScore: EnhancedComprehensiveScore): number {
    const maxScore = 6;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.tier_scores.experience.percentage / 100) * maxScore);
    
    // Look for progression indicators in the enhanced score
    if (enhancedScore.tier_scores.experience.score > 0) {
      // If experience exists, assume some progression
      score = Math.max(score, 1);
    }
    
    // Check if competitive tier shows good progression
    if (enhancedScore.tier_scores.competitive.percentage > 50) {
      score = Math.max(score, Math.round(maxScore * 0.5));
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate quantified achievements score with intelligent detection
   */
  private static calculateQuantifiedAchievements(enhancedScore: EnhancedComprehensiveScore): number {
    const maxScore = 8;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.critical_metrics.quantified_results_presence.percentage / 100) * maxScore);
    
    // Apply intelligent detection
    if (enhancedScore.critical_metrics.quantified_results_presence.score > 0) {
      // If any quantified results detected, ensure minimum score
      score = Math.max(score, 2);
    }
    
    // Check experience tier for quantified content
    if (enhancedScore.tier_scores.experience.percentage > 40) {
      // If experience tier is decent, likely has some quantified content
      score = Math.max(score, Math.round(maxScore * 0.25)); // At least 25%
    }
    
    // Check if competitive tier indicates strong achievements
    if (enhancedScore.tier_scores.competitive.percentage > 60) {
      score = Math.max(score, Math.round(maxScore * 0.4)); // 40% if competitive
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate keyword match score with JD awareness
   */
  private static calculateKeywordMatch(
    enhancedScore: EnhancedComprehensiveScore,
    jobDescription?: string
  ): number {
    const maxScore = 25;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.tier_scores.skills_keywords.percentage / 100) * maxScore);
    
    // If JD-based scoring, prioritize JD keyword match
    if (jobDescription) {
      const jdMatchScore = Math.round((enhancedScore.critical_metrics.jd_keywords_match.percentage / 100) * maxScore);
      score = Math.max(score, jdMatchScore);
      
      // Ensure minimum if any JD keywords matched
      if (enhancedScore.critical_metrics.jd_keywords_match.percentage > 0) {
        score = Math.max(score, 5); // Minimum 5 points for any JD match
      }
    }
    
    // Ensure minimum based on skills tier
    if (enhancedScore.tier_scores.skills_keywords.score > 0) {
      score = Math.max(score, 3); // Minimum 3 points if any skills detected
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate skills alignment score with technical focus
   */
  private static calculateSkillsAlignment(
    enhancedScore: EnhancedComprehensiveScore,
    jobDescription?: string
  ): number {
    const maxScore = 20;
    
    // Start with enhanced score
    let score = Math.round((enhancedScore.tier_scores.skills_keywords.percentage / 100) * maxScore);
    
    // Boost based on technical skills alignment
    const techScore = Math.round((enhancedScore.critical_metrics.technical_skills_alignment.percentage / 100) * maxScore);
    score = Math.max(score, techScore);
    
    // If JD-based, ensure reasonable alignment
    if (jobDescription && enhancedScore.critical_metrics.technical_skills_alignment.percentage > 30) {
      score = Math.max(score, Math.round(maxScore * 0.4)); // At least 40% if decent tech alignment
    }
    
    // Ensure minimum if any technical skills detected
    if (enhancedScore.critical_metrics.technical_skills_alignment.score > 0) {
      score = Math.max(score, 4); // Minimum 4 points for any tech skills
    }
    
    return Math.min(score, maxScore);
  }

  /**
   * Simple JSON-only evaluation (for API compatibility)
   */
  static async evaluateResumeJSON(
    resumeText: string,
    jobDescription?: string,
    filename?: string
  ): Promise<string> {
    const result = await this.evaluateResume(resumeText, jobDescription, filename);
    return JSON.stringify(result, null, 2);
  }

}

// Export for use in other services
export const atsScoreChecker16Parameter = ATSScoreChecker16Parameter;