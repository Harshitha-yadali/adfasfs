# Design Document: Enhanced ATS Score Checker (220+ Metrics)

## Overview

The Enhanced ATS Score Checker is a professional resume evaluation system implementing a **220+ metric scoring framework** across 10 tiers. This comprehensive approach provides a significant competitive advantage over tools like Jobscan (50-80 metrics).

The system provides two scoring modes:
- **JD-Based Scoring**: Evaluates resumes relative to a specific job description
- **General Scoring**: Evaluates against industry best practices

### Key Capabilities
- 220+ metrics across 10 evaluation tiers
- "Big 5" critical metrics with highest impact
- Red flag detection with automatic point deductions
- Multi-level keyword matching (exact, semantic, related)
- Color-coded feedback by priority
- Actionable recommendations with example rewrites

## Architecture

The system follows a layered architecture with tier-based analyzers:

1. **Presentation Layer**: ResumeScoreChecker UI, Score Display, Red Flags Display
2. **Service Layer**: ScoringService orchestrating 10 Tier Analyzers + ScoreMapper
3. **Integration Layer**: EdenAI Text Service, Synonym Expansion Service
4. **Data Layer**: Score Cache, TypeScript Interfaces, Metrics Definitions

## Components and Interfaces

### 1. ScoringService (Enhanced)

```typescript
interface ScoringServiceInterface {
  getComprehensiveScore(
    resumeText: string,
    jobDescription?: string,
    jobTitle?: string,
    scoringMode?: ScoringMode,
    extractionMode?: ExtractionMode,
    trimmed?: boolean,
    filename?: string
  ): Promise<ComprehensiveScore>;
}
```

### 2. Tier Analyzers

```typescript
interface TierAnalyzerInterface {
  analyze(resumeText: string, jobDescription?: string): TierAnalysisResult;
}

interface TierAnalysisResult {
  tierName: string;
  tierNumber: number;
  score: number;
  maxScore: number;
  metrics: MetricResult[];
}
```

### 3. RedFlagDetector

```typescript
interface RedFlagDetectorInterface {
  detectRedFlags(resumeText: string): RedFlagResult;
}

interface RedFlagResult {
  flags: RedFlag[];
  totalPenalty: number;
  autoRejectRisk: boolean;
}
```

### 4. ScoreMapper

```typescript
interface ScoreMapperInterface {
  getMatchBand(score: number): MatchBand;
  getInterviewProbability(score: number): string;
}
```

## Data Models

### ComprehensiveScore (Enhanced)

```typescript
interface ComprehensiveScore {
  overall: number;
  match_band: MatchBand;
  interview_probability_range: string;
  confidence: ConfidenceLevel;
  rubric_version: string;
  weighting_mode: 'JD' | 'GENERAL';
  extraction_mode: ExtractionMode;
  trimmed: boolean;
  job_title?: string;
  tier_scores: TierScores;
  critical_metrics: CriticalMetrics;
  red_flags: RedFlag[];
  red_flag_penalty: number;
  auto_reject_risk: boolean;
  breakdown: MetricBreakdown[];
  missing_keywords: MissingKeyword[];
  actions: string[];
  example_rewrites: ExampleRewrites;
  notes: string[];
  analysis: string;
  keyStrengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  cached?: boolean;
}

interface TierScores {
  basic_structure: TierScore;
  content_structure: TierScore;
  experience: TierScore;
  education_certifications: TierScore;
  skills_keywords: TierScore;
  projects: TierScore;
  red_flags: TierScore;
  competitive: TierScore;
  culture_fit: TierScore;
  qualitative: TierScore;
}

interface CriticalMetrics {
  jd_keywords_match: CriticalMetricScore;
  technical_skills_alignment: CriticalMetricScore;
  quantified_results_presence: CriticalMetricScore;
  job_title_relevance: CriticalMetricScore;
  experience_relevance: CriticalMetricScore;
  total_critical_score: number;
}

interface MissingKeyword {
  keyword: string;
  tier: 'critical' | 'important' | 'nice_to_have';
  impact: number;
  suggestedPlacement: string;
  color: 'red' | 'orange' | 'yellow';
}
```

### Tier Weights

```typescript
const TIER_WEIGHTS = {
  basic_structure: 8,
  content_structure: 10,
  experience: 25,
  education_certifications: 8,
  skills_keywords: 25,
  projects: 8,
  red_flags: 0,
  competitive: 6,
  culture_fit: 5,
  qualitative: 5
};

const MATCH_BAND_THRESHOLDS = {
  'Excellent Match': { min: 90, max: 100, probability: '90-100%' },
  'Very Good Match': { min: 80, max: 89, probability: '80-89%' },
  'Good Match': { min: 70, max: 79, probability: '60-79%' },
  'Fair Match': { min: 60, max: 69, probability: '40-59%' },
  'Below Average': { min: 50, max: 59, probability: '25-39%' },
  'Poor Match': { min: 40, max: 49, probability: '10-24%' },
  'Very Poor': { min: 30, max: 39, probability: '3-9%' },
  'Inadequate': { min: 20, max: 29, probability: '1-2%' },
  'Minimal Match': { min: 0, max: 19, probability: '0-0.5%' }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Valid Score Output Structure
*For any* resume text and scoring mode, the scoring service should return a ComprehensiveScore object with overall score between 0 and 100, a valid match_band, non-empty interview_probability_range, and valid confidence level.
**Validates: Requirements 1.3, 2.3**

### Property 2: All 10 Tier Scores Present
*For any* scoring result, the tier_scores object should contain all 10 tiers with valid scores.
**Validates: Requirements 3-12**

### Property 3: Score-to-Band Mapping Consistency
*For any* overall score, the match_band and interview_probability_range should correctly correspond to the defined thresholds.
**Validates: Requirements 13.1-13.6**

### Property 4: Critical Metrics Present
*For any* JD-based scoring result, the critical_metrics object should contain all 5 "Big 5" metrics.
**Validates: Requirements 1.5**

### Property 5: Missing Keywords Count in JD Mode
*For any* JD-based scoring result, the missing_keywords array should contain between 5 and 15 items.
**Validates: Requirements 1.4**

### Property 6: Recommendations Count
*For any* scoring result, the actions array should contain between 5 and 10 items.
**Validates: Requirements 14.1**

### Property 7: Example Rewrites Structure
*For any* scoring result, the example_rewrites object should contain experience and projects with original, improved, and explanation fields.
**Validates: Requirements 14.3, 14.4**

### Property 8: Red Flag Penalties Applied
*For any* resume with detected red flags, the red_flag_penalty should equal the sum of individual flag penalties.
**Validates: Requirements 9.4**

### Property 9: Response JSON Round-Trip
*For any* valid ComprehensiveScore object, serializing to JSON and deserializing should produce an equivalent object.
**Validates: Requirements 18.2, 18.3**

### Property 10: Keyword Tier Color Mapping
*For any* missing keyword, the color should correctly map: critical->red, important->orange, nice_to_have->yellow.
**Validates: Requirements 15.1**

### Property 11: Low Score Triggers Optimizer Recommendation
*For any* resume with overall score below 40, the response should include optimizer recommendation.
**Validates: Requirements 16.4**

### Property 12: Confidence Level Valid
*For any* scoring result, confidence should be one of 'High', 'Medium', or 'Low'.
**Validates: Requirements 17.1**

### Property 13: Tier Weights Sum to 100
*For any* scoring calculation, the sum of tier weights (excluding red_flags) should equal 100.
**Validates: Requirements 1.2, 2.2**

### Property 14: Response Contains All Required Fields
*For any* scoring result, the ComprehensiveScore should contain all required fields.
**Validates: Requirements 18.1**

## Error Handling

### Input Validation Errors
- Empty Resume: Return error "Please upload your resume first"
- Missing JD in JD-Based Mode: Return error "Job description is required"
- Missing Job Title in JD-Based Mode: Return error "Job title is required"

### Default Error Response
```typescript
const DEFAULT_ERROR_SCORE: ComprehensiveScore = {
  overall: 0,
  match_band: "No Match",
  interview_probability_range: "0%",
  confidence: "Low",
  // ... other fields with defaults
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
 * **Feature: enhanced-ats-score-checker, Property N: Description**
 * **Validates: Requirements X.Y**
 */
```
