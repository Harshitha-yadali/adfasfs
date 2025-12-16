# Design Document: Comprehensive Resume Analyzer

## Overview

The Comprehensive Resume Analyzer is a professional resume evaluation system that provides detailed analysis across multiple dimensions: file-level checks, section detection and quality, ATS compatibility, skill extraction, experience quality, and job description matching. The system delivers separate scoring for each evaluation area, allowing users to understand exactly which aspects need improvement.

### Key Capabilities
- File-level analysis (name, size, pages, word count, bullet count)
- Section detection and organization validation
- Section-by-section quality assessment
- ATS compatibility evaluation
- Comprehensive skill extraction and categorization
- Experience quality analysis focusing on impact and achievements
- Job description matching with detailed gap analysis
- Separate scoring for each analysis dimension
- Professional JSON response structure with detailed metrics

## Architecture

The system follows a modular analyzer architecture with specialized components:

1. **Presentation Layer**: ResumeAnalyzer UI, Detailed Metrics Display, Recommendations Panel
2. **Service Layer**: ComprehensiveAnalyzerService orchestrating specialized analyzers
3. **Analyzer Layer**: FileAnalyzer, SectionDetector, QualityAnalyzer, ATSCompatibilityChecker, SkillExtractor, ExperienceAnalyzer, JDMatcher
4. **Integration Layer**: EdenAI Text Service, Resume Parser Service
5. **Data Layer**: Analysis Cache, TypeScript Interfaces, Scoring Algorithms

## Components and Interfaces

### 1. ComprehensiveAnalyzerService (Main Orchestrator)

```typescript
interface ComprehensiveAnalyzerServiceInterface {
  analyzeResume(
    resumeText: string,
    resumeFile?: File,
    jobDescription?: string,
    options?: AnalysisOptions
  ): Promise<ComprehensiveAnalysisResult>;
}

interface AnalysisOptions {
  includeJDMatching?: boolean;
  skipFileAnalysis?: boolean;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
}
```

### 2. FileAnalyzer

```typescript
interface FileAnalyzerInterface {
  analyzeFile(file: File, resumeText: string): FileAnalysisResult;
}

interface FileAnalysisResult {
  pdf_name: string;
  file_size_kb: string;
  page_count: number;
  word_count: number;
  bullet_count: number;
  file_format_valid: boolean;
  size_appropriate: boolean;
  page_count_appropriate: boolean;
}
```

### 3. SectionDetector

```typescript
interface SectionDetectorInterface {
  detectSections(resumeText: string): SectionDetectionResult;
}

interface SectionDetectionResult {
  present_sections: string[];
  missing_sections: string[];
  section_order_correct: boolean;
  section_positions: Record<string, number>;
  section_word_counts: Record<string, number>;
  section_bullet_counts: Record<string, number>;
  order_issues: OrderIssue[];
}
```

### 4. QualityAnalyzer

```typescript
interface QualityAnalyzerInterface {
  analyzeSectionQuality(
    sections: Record<string, string>,
    targetRole?: string
  ): SectionQualityResult;
}

interface SectionQualityResult {
  bullet_clarity_score: number;
  metrics_usage_ratio: number;
  action_verb_ratio: number;
  tech_stack_completeness: number;
  grammar_issues_count: number;
  date_format_consistency: boolean;
  section_quality_scores: Record<string, number>;
}
```

### 5. ATSCompatibilityChecker

```typescript
interface ATSCompatibilityCheckerInterface {
  checkCompatibility(resumeText: string, extractionMode: string): ATSCompatibilityResult;
}

interface ATSCompatibilityResult {
  critical_errors: string[];
  warnings: string[];
  compatibility_score: number;
  has_tables: boolean;
  has_images_icons: boolean;
  has_multi_columns: boolean;
  has_fancy_fonts_colors: boolean;
  has_text_in_graphics: boolean;
  has_problematic_headers_footers: boolean;
}
```

### 6. SkillExtractor

```typescript
interface SkillExtractorInterface {
  extractSkills(resumeText: string): SkillExtractionResult;
}

interface SkillExtractionResult {
  skills_found: string[];
  skill_categories: Record<string, string[]>;
  skills_count: number;
  skills_quality_score: number;
  programming_languages: string[];
  tools_technologies: string[];
  cloud_platforms: string[];
  soft_skills: string[];
}
```

### 7. ExperienceAnalyzer

```typescript
interface ExperienceAnalyzerInterface {
  analyzeExperience(resumeText: string): ExperienceAnalysisResult;
}

interface ExperienceAnalysisResult {
  impact_strength_score: number;
  metrics_usage_ratio: number;
  action_verb_ratio: number;
  achievement_vs_responsibility_ratio: number;
  quantified_bullets_percentage: number;
  strong_action_verbs_count: number;
  experience_quality_issues: string[];
}
```

### 8. JDMatcher

```typescript
interface JDMatcherInterface {
  matchResumeToJD(
    resumeText: string,
    jobDescription: string
  ): JDMatchingResult;
}

interface JDMatchingResult {
  jd_skill_match_score: number;
  jd_experience_match_score: number;
  jd_project_match_score: number;
  overall_fit_score: number;
  exact_skill_matches: string[];
  partial_matches: string[];
  missing_skills: string[];
  missing_hard_skills: string[];
  missing_soft_skills: string[];
  missing_tools: string[];
  missing_certifications: string[];
  missing_domain_keywords: string[];
  jd_requirements: JDRequirements;
}
```

## Data Models

### ComprehensiveAnalysisResult (Main Response)

```typescript
interface ComprehensiveAnalysisResult {
  // File-level analysis
  file_analysis: FileAnalysisResult;
  
  // ATS compatibility
  ats_compatibility: ATSCompatibilityResult;
  
  // Section analysis
  sections: SectionDetectionResult;
  
  // Skills analysis
  skills_analysis: SkillExtractionResult;
  
  // Experience analysis
  experience_analysis: ExperienceAnalysisResult;
  
  // Content quality
  content_quality: ContentQualityResult;
  
  // Scoring
  scores: ComprehensiveScores;
  
  // JD matching (optional)
  jd_matching?: JDMatchingResult;
  
  // Recommendations
  improvements: string[];
  
  // Metadata
  analysis_timestamp: string;
  analysis_version: string;
}

interface ComprehensiveScores {
  ats_score: number;           // 0-100
  structure_score: number;     // 0-100
  impact_score: number;        // 0-100
  content_quality_score: number; // 0-100
  final_resume_score: number;  // 0-100 (weighted average)
  
  // JD-specific scores (when JD provided)
  jd_skill_match_score?: number;
  jd_experience_match_score?: number;
  jd_project_match_score?: number;
  overall_fit_score?: number;
}

interface ContentQualityResult {
  writing_clarity_score: number;
  content_quality_score: number;
  grammar_issues: string[];
  style_issues: string[];
  consistency_issues: string[];
}

interface JDRequirements {
  hard_skills: string[];
  soft_skills: string[];
  tools: string[];
  cloud_platforms: string[];
  experience_level: string;
  certifications: string[];
  domain_knowledge: string[];
}
```

### Scoring Weights

```typescript
const COMPREHENSIVE_SCORING_WEIGHTS = {
  ats_compatibility: 25,    // ATS compatibility is critical
  structure_quality: 20,    // Section organization and completeness
  impact_strength: 30,      // Experience quality and achievements (highest weight)
  content_quality: 25       // Writing quality and clarity
} as const;

const JD_MATCHING_WEIGHTS = {
  skill_match: 40,          // Skills alignment with JD
  experience_match: 35,     // Experience relevance to JD
  project_match: 25         // Project relevance to JD
} as const;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File Analysis Completeness
*For any* resume file and text, the file analyzer should return all required file metrics: PDF name, file size, page count, word count, and bullet count.
**Validates: Requirements 1.1-1.5**

### Property 2: Section Detection Accuracy
*For any* resume text, the section detector should identify all present sections and correctly determine missing sections from the standard set.
**Validates: Requirements 2.1-2.2**

### Property 3: Section Order Validation
*For any* resume with detected sections, the section order validation should correctly identify ordering issues against professional standards.
**Validates: Requirements 2.3-2.4**

### Property 4: Quality Analysis Coverage
*For any* detected section, the quality analyzer should evaluate all required quality metrics: bullet clarity, metric usage, action verbs, tech stack completeness, grammar issues, and date formatting.
**Validates: Requirements 3.1-3.6**

### Property 5: ATS Compatibility Detection
*For any* resume content, the ATS compatibility checker should detect all specified formatting issues: tables, images, multi-columns, fancy fonts, text in graphics, and problematic headers/footers.
**Validates: Requirements 4.1-4.6**

### Property 6: Skill Extraction Completeness
*For any* resume text, the skill extractor should identify skills and organize them into the specified categories: programming languages, tools, cloud platforms, and soft skills.
**Validates: Requirements 5.1-5.4**

### Property 7: Experience Quality Metrics
*For any* experience section, the experience analyzer should calculate all required metrics: impact focus, achievement ratio, quantified metrics percentage, and action verb usage.
**Validates: Requirements 6.1-6.4**

### Property 8: JD Matching Completeness
*For any* resume and job description pair, the JD matcher should extract all JD requirements and compute all match scores: skill match, experience match, project match, and overall fit.
**Validates: Requirements 7.1-7.8**

### Property 9: Comprehensive Scoring Structure
*For any* analysis result, the scoring engine should provide all required scores in the correct range (0-100) and calculate the weighted final score.
**Validates: Requirements 8.1-8.4**

### Property 10: JSON Response Completeness
*For any* analysis, the response should contain all required objects: file_analysis, ats_compatibility, sections, skills_analysis, experience_analysis, content_quality, scores, and improvements.
**Validates: Requirements 9.1-9.6, 11.1-11.9**

### Property 11: Recommendation Generation
*For any* analysis with identified issues, the recommendation engine should provide specific, actionable improvement suggestions.
**Validates: Requirements 10.1-10.4**

### Property 12: JD-Specific Analysis
*For any* analysis with job description, the system should include JD matching results and JD-specific recommendations.
**Validates: Requirements 7.1-7.8, 10.2**

### Property 13: Error Handling Graceful Degradation
*For any* analysis with parsing or processing errors, the system should return partial results with appropriate error messages rather than complete failure.
**Validates: Requirements 12.1-12.4**

### Property 14: Score Range Validation
*For any* calculated score, the value should be within the valid range (0-100) and properly weighted according to the defined scoring weights.
**Validates: Requirements 8.1-8.2**

### Property 15: Missing Keywords Identification
*For any* JD matching analysis, the missing keywords arrays should contain only keywords that are actually present in the JD but absent from the resume.
**Validates: Requirements 7.7**

## Error Handling

### Input Validation Errors
- Empty Resume Text: Return error "Resume content is required for analysis"
- Invalid File Format: Return error "Please provide a valid PDF, DOCX, or TXT file"
- Corrupted File: Return error "File appears to be corrupted or unreadable"

### Partial Analysis Support
When components fail, the system continues with available analyzers:
- File analysis failure: Continue with text-based analysis only
- Section detection failure: Use basic text parsing fallback
- JD analysis failure: Return general resume analysis without JD matching

### Default Error Response
```typescript
const DEFAULT_ERROR_ANALYSIS: ComprehensiveAnalysisResult = {
  file_analysis: { /* basic defaults */ },
  ats_compatibility: { critical_errors: ["Analysis failed"], warnings: [], compatibility_score: 0 },
  sections: { present_sections: [], missing_sections: [], section_order_correct: false },
  skills_analysis: { skills_found: [], skill_categories: {}, skills_count: 0, skills_quality_score: 0 },
  experience_analysis: { impact_strength_score: 0, metrics_usage_ratio: 0, action_verb_ratio: 0 },
  content_quality: { writing_clarity_score: 0, content_quality_score: 0 },
  scores: { ats_score: 0, structure_score: 0, impact_score: 0, content_quality_score: 0, final_resume_score: 0 },
  improvements: ["Analysis failed. Please try again with a different file format."],
  analysis_timestamp: new Date().toISOString(),
  analysis_version: "1.0.0"
};
```

## Testing Strategy

### Property-Based Testing Library
We will use **fast-check** for property-based testing.

### Test Configuration
```typescript
const FC_CONFIG = { numRuns: 100, verbose: true };
```

### Test Annotation Format
```typescript
/**
 * **Feature: comprehensive-resume-analyzer, Property N: Description**
 * **Validates: Requirements X.Y**
 */
```

### Unit Testing Approach
- **File Analysis Tests**: Test with various file formats, sizes, and content structures
- **Section Detection Tests**: Test with resumes having different section arrangements and missing sections
- **Quality Analysis Tests**: Test with content of varying quality levels and formatting styles
- **ATS Compatibility Tests**: Test with resumes containing various ATS-problematic elements
- **Skill Extraction Tests**: Test with resumes containing different skill types and formats
- **Experience Analysis Tests**: Test with experience sections of varying quality and structure
- **JD Matching Tests**: Test with various resume-JD combinations and skill overlaps
- **Integration Tests**: Test complete analysis workflow with real resume samples

### Property-Based Testing Focus
- **Input Validation**: Generate various resume texts and verify robust handling
- **Score Consistency**: Verify scores always fall within valid ranges and follow weighting rules
- **Response Structure**: Verify all required fields are present in responses
- **Error Handling**: Test graceful degradation with invalid or corrupted inputs
- **JD Matching Logic**: Verify matching algorithms work correctly across various inputs