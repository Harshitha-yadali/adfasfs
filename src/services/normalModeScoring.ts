/**
 * Normal Mode Scoring Service - Fixed Implementation
 * 
 * Addresses the following issues from validation report:
 * 1. Static fallback scoring (~54 for all inputs)
 * 2. Fresher penalization (experience-heavy metrics)
 * 3. No differentiation between good vs bad resumes
 * 4. Parser-to-Scorer disconnection
 * 
 * Key Fixes:
 * - Input-driven scoring (no static fallbacks)
 * - Candidate level normalization (fresher vs experienced)
 * - Content quality validation before scoring
 * - Proper confidence label alignment
 */

import { ResumeData, TierScores, ConfidenceLevel, MatchBand } from '../types/resume';
import { detectCandidateLevel, CandidateLevel } from './resumeScoringFixes';

// ============================================================================
// TYPES
// ============================================================================

export interface NormalModeInput {
  resumeText: string;
  resumeData?: ResumeData;
  userType?: 'fresher' | 'experienced' | 'student';
}

export interface InputQualityAssessment {
  isValid: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
  qualityScore: number; // 0-100
  issues: string[];
  contentMetrics: {
    wordCount: number;
    sectionCount: number;
    hasContactInfo: boolean;
    hasSkills: boolean;
    hasEducation: boolean;
    hasExperience: boolean;
    hasProjects: boolean;
    bulletCount: number;
    uniqueSkillCount: number;
  };
}

export interface NormalizedWeights {
  skills_keywords: number;
  experience: number;
  education: number;
  projects: number;
  certifications: number;
  basic_structure: number;
  content_structure: number;
  competitive: number;
  culture_fit: number;
  qualitative: number;
}

export interface ScoreAdjustment {
  baseScore: number;
  qualityMultiplier: number;
  candidateLevelBonus: number;
  finalScore: number;
  explanation: string;
}

// ============================================================================
// INPUT QUALITY ASSESSMENT
// ============================================================================

/**
 * Assess input quality BEFORE scoring
 * This prevents static fallback scores by validating input first
 */
export function assessInputQuality(input: NormalModeInput): InputQualityAssessment {
  const { resumeText, resumeData } = input;
  const issues: string[] = [];
  
  // Content metrics
  const wordCount = resumeText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const sectionCount = countSections(resumeText);
  const hasContactInfo = checkContactInfo(resumeText);
  const hasSkills = checkSkillsPresence(resumeText, resumeData);
  const hasEducation = checkEducationPresence(resumeText, resumeData);
  const hasExperience = checkExperiencePresence(resumeText, resumeData);
  const hasProjects = checkProjectsPresence(resumeText, resumeData);
  const bulletCount = countBulletPoints(resumeText, resumeData);
  const uniqueSkillCount = countUniqueSkills(resumeText, resumeData);
  
  const contentMetrics = {
    wordCount,
    sectionCount,
    hasContactInfo,
    hasSkills,
    hasEducation,
    hasExperience,
    hasProjects,
    bulletCount,
    uniqueSkillCount,
  };
  
  // Validate input - CRITICAL: This determines if we can score at all
  if (wordCount < 50) {
    issues.push('Resume text too short (< 50 words)');
  }
  if (wordCount < 100) {
    issues.push('Resume appears incomplete');
  }
  if (!hasContactInfo) {
    issues.push('Missing contact information');
  }
  if (!hasSkills && !hasExperience && !hasProjects) {
    issues.push('No substantive content detected');
  }
  if (sectionCount < 2) {
    issues.push('Missing standard resume sections');
  }
  
  // Calculate quality score based on content metrics
  let qualityScore = 0;
  
  // Word count contribution (0-20 points)
  if (wordCount >= 400) qualityScore += 20;
  else if (wordCount >= 200) qualityScore += 15;
  else if (wordCount >= 100) qualityScore += 10;
  else if (wordCount >= 50) qualityScore += 5;
  
  // Section presence contribution (0-30 points)
  if (hasContactInfo) qualityScore += 5;
  if (hasSkills) qualityScore += 8;
  if (hasEducation) qualityScore += 5;
  if (hasExperience) qualityScore += 7;
  if (hasProjects) qualityScore += 5;
  
  // Content depth contribution (0-30 points)
  if (bulletCount >= 10) qualityScore += 15;
  else if (bulletCount >= 5) qualityScore += 10;
  else if (bulletCount >= 2) qualityScore += 5;
  
  if (uniqueSkillCount >= 10) qualityScore += 15;
  else if (uniqueSkillCount >= 5) qualityScore += 10;
  else if (uniqueSkillCount >= 2) qualityScore += 5;
  
  // Section count contribution (0-20 points)
  if (sectionCount >= 5) qualityScore += 20;
  else if (sectionCount >= 3) qualityScore += 15;
  else if (sectionCount >= 2) qualityScore += 10;
  else if (sectionCount >= 1) qualityScore += 5;
  
  // Determine quality level
  let quality: InputQualityAssessment['quality'];
  let isValid = true;
  
  if (qualityScore >= 80) {
    quality = 'excellent';
  } else if (qualityScore >= 60) {
    quality = 'good';
  } else if (qualityScore >= 40) {
    quality = 'fair';
  } else if (qualityScore >= 20) {
    quality = 'poor';
  } else {
    quality = 'invalid';
    isValid = false;
  }
  
  return {
    isValid,
    quality,
    qualityScore,
    issues,
    contentMetrics,
  };
}

// ============================================================================
// CANDIDATE LEVEL NORMALIZATION
// ============================================================================

/**
 * Get normalized weights based on candidate level
 * CRITICAL FIX: Freshers should NOT be penalized for lack of experience
 */
export function getNormalizedWeights(candidateLevel: CandidateLevel): NormalizedWeights {
  switch (candidateLevel) {
    case 'fresher':
      // Freshers: Experience weight = 0, redistributed to skills/projects/education
      return {
        skills_keywords: 35,    // +10% (primary focus for freshers)
        experience: 0,          // 0% (not required)
        education: 18,          // +12% (important for freshers)
        projects: 20,           // +12% (demonstrates capability)
        certifications: 8,      // +4% (shows initiative)
        basic_structure: 6,     // -2%
        content_structure: 6,   // -4%
        competitive: 3,         // -3%
        culture_fit: 2,         // -2%
        qualitative: 2,         // -2%
      };
    
    case 'junior':
      // Junior: Reduced experience weight, boosted skills/projects
      return {
        skills_keywords: 30,
        experience: 12,
        education: 12,
        projects: 16,
        certifications: 6,
        basic_structure: 7,
        content_structure: 8,
        competitive: 4,
        culture_fit: 3,
        qualitative: 2,
      };
    
    case 'mid':
      // Mid-level: Balanced weights
      return {
        skills_keywords: 25,
        experience: 25,
        education: 6,
        projects: 10,
        certifications: 5,
        basic_structure: 8,
        content_structure: 10,
        competitive: 5,
        culture_fit: 3,
        qualitative: 3,
      };
    
    case 'senior':
    default:
      // Senior: Experience-heavy
      return {
        skills_keywords: 22,
        experience: 30,
        education: 4,
        projects: 8,
        certifications: 4,
        basic_structure: 8,
        content_structure: 10,
        competitive: 7,
        culture_fit: 4,
        qualitative: 3,
      };
  }
}

/**
 * Apply normalized weights to tier scores
 */
export function applyNormalizedWeights(
  tierScores: TierScores,
  candidateLevel: CandidateLevel
): TierScores {
  const weights = getNormalizedWeights(candidateLevel);
  
  const normalizedScores: TierScores = {} as TierScores;
  
  for (const [key, tier] of Object.entries(tierScores)) {
    // CRITICAL FIX: Check if tier exists and has required properties
    if (!tier || typeof tier.percentage !== 'number') {
      console.warn(`[normalModeScoring] Invalid tier score for ${key}:`, tier);
      continue; // Skip invalid tier scores
    }
    
    const tierKey = key as keyof NormalizedWeights;
    const newWeight = weights[tierKey] ?? tier.weight;
    
    normalizedScores[tierKey as keyof TierScores] = {
      ...tier,
      weight: newWeight,
      weighted_contribution: (tier.percentage * newWeight) / 100,
    };
  }
  
  return normalizedScores;
}

// ============================================================================
// SCORE ADJUSTMENT
// ============================================================================

/**
 * Calculate final score with quality-based adjustment
 * CRITICAL: Score should reflect actual input quality, not static fallback
 */
export function calculateAdjustedScore(
  baseScore: number,
  inputQuality: InputQualityAssessment,
  candidateLevel: CandidateLevel
): ScoreAdjustment {
  // Quality multiplier: poor input = lower score ceiling
  let qualityMultiplier = 1.0;
  let explanation = '';
  
  switch (inputQuality.quality) {
    case 'excellent':
      qualityMultiplier = 1.0;
      explanation = 'Full scoring applied - excellent input quality';
      break;
    case 'good':
      qualityMultiplier = 0.95;
      explanation = 'Minor quality adjustment applied';
      break;
    case 'fair':
      qualityMultiplier = 0.85;
      explanation = 'Quality adjustment applied - some content missing';
      break;
    case 'poor':
      qualityMultiplier = 0.70;
      explanation = 'Significant quality adjustment - incomplete resume';
      break;
    case 'invalid':
      qualityMultiplier = 0.40;
      explanation = 'Major quality penalty - resume appears invalid or empty';
      break;
  }
  
  // Candidate level bonus for freshers with good content
  let candidateLevelBonus = 0;
  if (candidateLevel === 'fresher' && inputQuality.quality !== 'invalid') {
    // Freshers get a small bonus if they have projects/skills
    if (inputQuality.contentMetrics.hasProjects && inputQuality.contentMetrics.uniqueSkillCount >= 5) {
      candidateLevelBonus = 5;
      explanation += ' | Fresher bonus applied for strong projects/skills';
    }
  }
  
  const adjustedBase = baseScore * qualityMultiplier;
  const finalScore = Math.min(100, Math.max(0, Math.round(adjustedBase + candidateLevelBonus)));
  
  return {
    baseScore,
    qualityMultiplier,
    candidateLevelBonus,
    finalScore,
    explanation,
  };
}

// ============================================================================
// CONFIDENCE ALIGNMENT
// ============================================================================

/**
 * Calculate confidence level aligned with score bands
 * CRITICAL FIX: Confidence should match score quality
 */
export function calculateAlignedConfidence(
  score: number,
  inputQuality: InputQualityAssessment,
  hasJD: boolean
): ConfidenceLevel {
  // FIX: Excellent scores (85+) should automatically get High confidence
  if (score >= 85) return 'High';
  
  // Base confidence from input quality
  let confidencePoints = 0;
  
  // Input quality contribution (0-4 points)
  switch (inputQuality.quality) {
    case 'excellent': confidencePoints += 4; break;
    case 'good': confidencePoints += 3; break;
    case 'fair': confidencePoints += 2; break;
    case 'poor': confidencePoints += 1; break;
    case 'invalid': confidencePoints += 0; break;
  }
  
  // Score quality contribution (0-4 points)
  // CRITICAL: High scores should have high confidence, low scores should have low confidence
  if (score >= 75) confidencePoints += 4; // Good scores get full points
  else if (score >= 65) confidencePoints += 3;
  else if (score >= 55) confidencePoints += 2;
  else if (score >= 45) confidencePoints += 1;
  // Scores below 45 don't add confidence
  
  // JD presence bonus (0-1 point)
  if (hasJD) confidencePoints += 1;
  
  // Content completeness bonus (0-1 point)
  const { contentMetrics } = inputQuality;
  const sectionsPresent = [
    contentMetrics.hasContactInfo,
    contentMetrics.hasSkills,
    contentMetrics.hasEducation,
    contentMetrics.hasExperience || contentMetrics.hasProjects,
  ].filter(Boolean).length;
  
  if (sectionsPresent >= 4) confidencePoints += 1;
  
  // Map to confidence level - Adjusted thresholds
  // Max points: 10 (4 quality + 4 score + 1 JD + 1 completeness)
  if (confidencePoints >= 7) return 'High';   // Lowered from 8
  if (confidencePoints >= 4) return 'Medium'; // Lowered from 5
  return 'Low';
}

/**
 * Get match band description aligned with score
 */
export function getAlignedMatchBand(score: number): MatchBand {
  if (score >= 85) return 'Excellent Match';
  if (score >= 75) return 'Very Good Match';
  if (score >= 65) return 'Good Match';
  if (score >= 55) return 'Fair Match';
  if (score >= 45) return 'Below Average';
  if (score >= 35) return 'Poor Match';
  if (score >= 25) return 'Very Poor';
  if (score >= 15) return 'Inadequate';
  return 'Minimal Match';
}

/**
 * Get interview probability aligned with score
 */
export function getAlignedInterviewProbability(score: number): string {
  if (score >= 85) return '70-85%';
  if (score >= 75) return '55-70%';
  if (score >= 65) return '40-55%';
  if (score >= 55) return '25-40%';
  if (score >= 45) return '15-25%';
  if (score >= 35) return '8-15%';
  if (score >= 25) return '3-8%';
  if (score >= 15) return '1-3%';
  return '0-1%';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function countSections(text: string): number {
  const sectionPatterns = [
    /\b(EXPERIENCE|WORK\s*EXPERIENCE|EMPLOYMENT|PROFESSIONAL\s*EXPERIENCE)\b/i,
    /\b(EDUCATION|ACADEMIC|QUALIFICATIONS)\b/i,
    /\b(SKILLS|TECHNICAL\s*SKILLS|CORE\s*COMPETENCIES)\b/i,
    /\b(PROJECTS|PERSONAL\s*PROJECTS|ACADEMIC\s*PROJECTS)\b/i,
    /\b(CERTIFICATIONS?|CERTIFICATES?|LICENSES?)\b/i,
    /\b(SUMMARY|OBJECTIVE|PROFILE|ABOUT\s*ME)\b/i,
    /\b(ACHIEVEMENTS?|AWARDS?|HONORS?)\b/i,
    /\b(PUBLICATIONS?|RESEARCH)\b/i,
    /\b(LANGUAGES?|INTERESTS?|HOBBIES?)\b/i,
  ];
  
  return sectionPatterns.filter(pattern => pattern.test(text)).length;
}

function checkContactInfo(text: string): boolean {
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/.test(text);
  return hasEmail || hasPhone;
}

function checkSkillsPresence(text: string, resumeData?: ResumeData): boolean {
  if (resumeData?.skills && resumeData.skills.length > 0) {
    return resumeData.skills.some(s => s.list && s.list.length > 0);
  }
  
  // Check text for skills section
  const hasSkillsSection = /\b(SKILLS|TECHNICAL\s*SKILLS|CORE\s*COMPETENCIES)\b/i.test(text);
  const hasTechKeywords = /\b(javascript|python|java|react|node|sql|aws|docker|git)\b/i.test(text);
  
  return hasSkillsSection || hasTechKeywords;
}

function checkEducationPresence(text: string, resumeData?: ResumeData): boolean {
  if (resumeData?.education && resumeData.education.length > 0) {
    return true;
  }
  
  const hasEducationSection = /\b(EDUCATION|ACADEMIC|QUALIFICATIONS)\b/i.test(text);
  const hasDegree = /\b(bachelor|master|b\.?s\.?|m\.?s\.?|b\.?e\.?|m\.?e\.?|b\.?tech|m\.?tech|mba|phd)\b/i.test(text);
  
  return hasEducationSection || hasDegree;
}

function checkExperiencePresence(text: string, resumeData?: ResumeData): boolean {
  if (resumeData?.workExperience && resumeData.workExperience.length > 0) {
    return resumeData.workExperience.some(exp => exp.bullets && exp.bullets.length > 0);
  }
  
  const hasExperienceSection = /\b(EXPERIENCE|WORK\s*EXPERIENCE|EMPLOYMENT)\b/i.test(text);
  const hasJobIndicators = /\b(worked|developed|managed|led|created|implemented|designed)\b/i.test(text);
  
  return hasExperienceSection && hasJobIndicators;
}

function checkProjectsPresence(text: string, resumeData?: ResumeData): boolean {
  if (resumeData?.projects && resumeData.projects.length > 0) {
    return resumeData.projects.some(p => p.bullets && p.bullets.length > 0);
  }
  
  const hasProjectsSection = /\b(PROJECTS|PERSONAL\s*PROJECTS|ACADEMIC\s*PROJECTS)\b/i.test(text);
  return hasProjectsSection;
}

function countBulletPoints(text: string, resumeData?: ResumeData): number {
  let count = 0;
  
  if (resumeData?.workExperience) {
    count += resumeData.workExperience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0);
  }
  if (resumeData?.projects) {
    count += resumeData.projects.reduce((sum, proj) => sum + (proj.bullets?.length || 0), 0);
  }
  
  // Also count from text
  const textBullets = (text.match(/^[\s]*[•\-\*]\s/gm) || []).length;
  
  return Math.max(count, textBullets);
}

function countUniqueSkills(text: string, resumeData?: ResumeData): number {
  const skills = new Set<string>();
  
  if (resumeData?.skills) {
    resumeData.skills.forEach(category => {
      category.list?.forEach(skill => skills.add(skill.toLowerCase()));
    });
  }
  
  // Also extract from text
  const techSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'git', 'jira', 'agile', 'scrum', 'rest', 'graphql', 'api',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
    'tableau', 'power bi', 'excel', 'sql'
  ];
  
  const textLower = text.toLowerCase();
  techSkills.forEach(skill => {
    if (textLower.includes(skill)) {
      skills.add(skill);
    }
  });
  
  return skills.size;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const normalModeScoring = {
  assessInputQuality,
  getNormalizedWeights,
  applyNormalizedWeights,
  calculateAdjustedScore,
  calculateAlignedConfidence,
  getAlignedMatchBand,
  getAlignedInterviewProbability,
};

export default normalModeScoring;
