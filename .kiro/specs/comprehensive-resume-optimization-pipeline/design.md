# Design Document

## Overview

The Comprehensive Resume Optimization Pipeline is an 8-step sequential workflow that transforms uploaded resumes into ATS-optimized documents with 90%+ compatibility scores. The system integrates existing services (Mistral OCR, GPT-4o-mini parsing, 220+ metrics scoring) into a cohesive pipeline that guides users through resume completion and optimization while maintaining state and handling errors gracefully.

## Architecture

The pipeline follows a state machine pattern with clear step transitions and rollback capabilities:

```
Step 1: Parse Resume → Step 2: Analyze Against JD → Step 3: Missing Sections Modal
     ↓                        ↓                           ↓
Step 4: Project Analysis → Step 5: Re-Analysis → Step 6: Bullet Rewriting
     ↓                        ↓                     ↓
Step 7: Final Optimization → Step 8: Output Optimized Resume
```

### Key Architectural Principles

1. **Sequential Processing**: Each step must complete before the next begins
2. **State Persistence**: Pipeline state is maintained throughout the process
3. **Error Recovery**: Failed steps can be retried without losing progress
4. **User Interaction Points**: Clear prompts for required user input
5. **Rollback Capability**: Users can return to previous steps if needed

## Components and Interfaces

### Core Pipeline Controller

```typescript
interface PipelineController {
  currentStep: PipelineStep;
  resumeData: ResumeData;
  jobDescription: string;
  pipelineState: PipelineState;
  
  executeStep(step: PipelineStep): Promise<StepResult>;
  handleStepFailure(step: PipelineStep, error: Error): Promise<void>;
  proceedToNextStep(): void;
  rollbackToPreviousStep(): void;
}

enum PipelineStep {
  PARSE_RESUME = 1,
  ANALYZE_AGAINST_JD = 2,
  MISSING_SECTIONS_MODAL = 3,
  PROJECT_ANALYSIS = 4,
  RE_ANALYSIS = 5,
  BULLET_REWRITING = 6,
  FINAL_OPTIMIZATION = 7,
  OUTPUT_RESUME = 8
}

interface PipelineState {
  currentStep: number;
  completedSteps: number[];
  failedSteps: number[];
  userInputRequired: boolean;
  errorMessages: string[];
  progressPercentage: number;
}
```

### Step-Specific Interfaces

#### Step 1: Resume Parser Interface
```typescript
interface ResumeParserService {
  parseResumeFromFile(file: File): Promise<ParsedResume>;
  validateParsedData(data: ParsedResume): ValidationResult;
  identifyMissingSections(data: ParsedResume): string[];
}
```

#### Step 2: Analysis Interface
```typescript
interface AnalysisService {
  analyzeResumeAgainstJD(resume: ResumeData, jd: string): Promise<AnalysisResult>;
  performGeneralAnalysis(resume: ResumeData): Promise<AnalysisResult>;
  identifyGapsAndWeaknesses(analysis: AnalysisResult): GapAnalysis;
}
```

#### Step 3: Missing Sections Interface
```typescript
interface MissingSectionsHandler {
  displayMissingSectionsModal(sections: string[]): Promise<UserInput>;
  validateRequiredSections(input: UserInput): boolean;
  suggestOptionalSections(jd: string): string[];
  allowSkipForOptionalSections(section: string): boolean;
}
```

#### Step 4-5: Project Analysis Interface
```typescript
interface ProjectAnalysisService {
  analyzeProjectsAgainstJD(projects: Project[], jd: string): Promise<ProjectAnalysis>;
  suggestProjectModifications(analysis: ProjectAnalysis): ProjectSuggestions;
  reAnalyzeAfterChanges(projects: Project[], jd: string): Promise<ProjectAnalysis>;
}
```

#### Step 6: Bullet Rewriting Interface
```typescript
interface BulletRewritingService {
  rewriteExperienceBullets(bullets: string[]): Promise<string[]>;
  rewriteProjectBullets(bullets: string[]): Promise<string[]>;
  validateBulletFormat(bullet: string): FormatValidation;
  ensureActionVerbUsage(bullet: string): string;
}
```

#### Step 7: Final Optimization Interface
```typescript
interface FinalOptimizationService {
  addMissingKeywords(resume: ResumeData, jd: string): Promise<ResumeData>;
  generateJDAlignedSummary(resume: ResumeData, jd: string): Promise<string>;
  applyATSFormatting(resume: ResumeData): Promise<ResumeData>;
  apply220PlusMetrics(resume: ResumeData): Promise<ResumeData>;
}
```

#### Step 8: Output Interface
```typescript
interface OutputService {
  generateOptimizedResume(resume: ResumeData): Promise<OptimizedResume>;
  calculateFinalScore(resume: ResumeData, jd: string): Promise<ScoreComparison>;
  generateUserActions(score: number): Promise<UserAction[]>;
  provideExportOptions(resume: ResumeData): ExportOption[];
}
```

## Data Models

### Pipeline State Model
```typescript
interface PipelineExecutionContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  currentStep: PipelineStep;
  stepHistory: StepExecution[];
  resumeVersions: ResumeVersion[];
  userInputs: UserInputRecord[];
  errorLog: ErrorRecord[];
}

interface StepExecution {
  step: PipelineStep;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  retryCount: number;
}

interface ResumeVersion {
  version: number;
  step: PipelineStep;
  data: ResumeData;
  timestamp: Date;
  changes: string[];
}
```

### Missing Sections Model
```typescript
interface MissingSectionRequest {
  section: string;
  required: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestions?: string[];
  skipAllowed: boolean;
  validationRules: ValidationRule[];
}

interface ValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'format' | 'custom';
  value: any;
  errorMessage: string;
}
```

### Progress Tracking Model
```typescript
interface ProgressIndicator {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  stepDescription: string;
  percentageComplete: number;
  estimatedTimeRemaining?: number;
  userActionRequired: boolean;
  actionDescription?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all identified properties, several can be consolidated to eliminate redundancy:

- **Workflow Progression Properties (1.5, 2.5, 3.7, 4.5, 5.5, 6.5, 7.5)**: These all test the same pattern - that completing one step triggers the next. These can be combined into a single comprehensive workflow progression property.

- **Missing Section Validation Properties (3.2, 3.3, 3.4, 3.5)**: These all test that required sections cannot be skipped. These can be combined into one property about required section enforcement.

- **Bullet Format Properties (6.2, 6.3, 6.4)**: These all test bullet formatting requirements and can be combined into a comprehensive bullet formatting property.

- **Error Handling Properties (9.1, 9.2, 9.3, 9.5)**: These test different aspects of error handling and can be consolidated into comprehensive error handling properties.

The following properties provide unique validation value and will be retained:

**Property 1: Resume parsing extracts all required sections**
*For any* valid resume file, parsing should successfully extract name, contact information, skills, experience, projects, education, and certifications when present
**Validates: Requirements 1.1, 1.2**

**Property 2: Missing sections detection accuracy**
*For any* parsed resume data, the system should correctly identify which required sections are missing or incomplete
**Validates: Requirements 1.4**

**Property 3: Workflow progression consistency**
*For any* completed pipeline step, the system should automatically proceed to the next appropriate step in the sequence
**Validates: Requirements 1.5, 2.5, 3.7, 4.5, 5.5, 6.5, 7.5**

**Property 4: Analysis completeness**
*For any* resume and job description pair, analysis should identify gaps, missing keywords, and weak sections using 220+ metrics
**Validates: Requirements 2.1, 2.2**

**Property 5: Required section enforcement**
*For any* missing required section (work experience, projects, skills, education), the system should not allow users to skip providing that information
**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

**Property 6: Optional section flexibility**
*For any* missing optional section (certifications), the system should allow users to skip while providing relevant suggestions
**Validates: Requirements 3.6**

**Property 7: Project analysis accuracy**
*For any* set of projects and job description, analysis should correctly categorize projects as keep, modify, or replace based on JD alignment
**Validates: Requirements 4.1, 4.2, 4.3**

**Property 8: Re-analysis consistency**
*For any* modified project set, re-analysis should produce updated recommendations and scores that reflect the changes
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 9: Bullet formatting compliance**
*For any* rewritten bullet point, it should follow the appropriate format (Action+Context+Result for experience, Tech+Impact+Metrics for projects) and meet length/verb requirements
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Property 10: Keyword integration completeness**
*For any* job description, all missing critical keywords should be added to the skills section during final optimization
**Validates: Requirements 7.1**

**Property 11: Summary generation compliance**
*For any* generated summary, it should be 40-60 words and aligned with the job description requirements
**Validates: Requirements 7.2**

**Property 12: Score target achievement**
*For any* optimized resume, the system should target achieving 90%+ ATS compatibility score
**Validates: Requirements 8.1, 8.2**

**Property 13: User action recommendations**
*For any* resume scoring below 90%, the system should provide specific, actionable recommendations to reach the target score
**Validates: Requirements 8.4**

**Property 14: Error recovery completeness**
*For any* pipeline step failure, the system should provide clear error messages and allow retry without losing previous progress
**Validates: Requirements 9.1, 9.2, 9.4, 9.5**

**Property 15: Progress tracking accuracy**
*For any* pipeline execution, the progress indicator should accurately reflect the current step and completion percentage
**Validates: Requirements 10.1, 10.2, 10.5**

## Error Handling

### Error Categories and Recovery Strategies

#### 1. Parsing Errors
- **File Format Issues**: Provide clear guidance on supported formats
- **OCR Failures**: Offer manual text input as fallback
- **Extraction Failures**: Allow retry with different parsing parameters

#### 2. Analysis Errors
- **API Failures**: Implement retry with exponential backoff
- **Timeout Issues**: Break analysis into smaller chunks
- **Invalid Data**: Provide data validation and correction prompts

#### 3. User Input Errors
- **Validation Failures**: Show specific field-level error messages
- **Incomplete Data**: Highlight missing required fields
- **Format Issues**: Provide examples and format guidance

#### 4. Network Errors
- **Connection Issues**: Save progress locally and retry
- **API Rate Limits**: Implement queuing and retry mechanisms
- **Service Unavailable**: Provide offline mode where possible

### Error Recovery Mechanisms

```typescript
interface ErrorRecoveryStrategy {
  errorType: string;
  retryAttempts: number;
  fallbackOptions: string[];
  userNotification: string;
  progressPreservation: boolean;
}

const errorStrategies: Record<string, ErrorRecoveryStrategy> = {
  'parsing_failure': {
    errorType: 'parsing_failure',
    retryAttempts: 3,
    fallbackOptions: ['manual_text_input', 'different_file_format'],
    userNotification: 'Unable to parse resume. Please try a different format or enter text manually.',
    progressPreservation: true
  },
  'analysis_timeout': {
    errorType: 'analysis_timeout',
    retryAttempts: 2,
    fallbackOptions: ['simplified_analysis', 'manual_review'],
    userNotification: 'Analysis is taking longer than expected. Trying simplified approach.',
    progressPreservation: true
  }
};
```

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Focus:**
- Individual step execution logic
- Error handling for specific scenarios
- User interface interactions
- API integration points
- Data validation functions

**Property-Based Testing Focus:**
- Pipeline workflow consistency across all input combinations
- Resume parsing accuracy for various file formats and content structures
- Analysis completeness for different resume-JD combinations
- Score calculation consistency across optimization scenarios
- Error recovery behavior for various failure modes

### Property-Based Testing Framework

**Framework Selection**: We will use **fast-check** for TypeScript/JavaScript property-based testing, configured to run a minimum of 100 iterations per property test.

**Property Test Implementation Requirements:**
- Each property-based test must be tagged with a comment referencing the design document property
- Tag format: `**Feature: comprehensive-resume-optimization-pipeline, Property {number}: {property_text}**`
- Each correctness property must be implemented by a single property-based test
- Tests should generate realistic resume and job description data for comprehensive coverage

### Test Data Generation

```typescript
// Example property test structure
describe('Resume Optimization Pipeline Properties', () => {
  it('should extract all required sections from valid resumes', () => {
    // **Feature: comprehensive-resume-optimization-pipeline, Property 1: Resume parsing extracts all required sections**
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 2, maxLength: 50 }),
        email: fc.emailAddress(),
        phone: fc.string({ minLength: 10, maxLength: 15 }),
        experience: fc.array(fc.record({
          role: fc.string({ minLength: 5, maxLength: 100 }),
          company: fc.string({ minLength: 2, maxLength: 100 }),
          bullets: fc.array(fc.string({ minLength: 20, maxLength: 200 }))
        }), { minLength: 1, maxLength: 5 })
      }),
      async (resumeData) => {
        const parsedResult = await parseResumeFromData(resumeData);
        expect(parsedResult.name).toBeDefined();
        expect(parsedResult.email).toBeDefined();
        expect(parsedResult.workExperience).toBeDefined();
        // Additional assertions for all required sections
      }
    ));
  });
});
```

### Integration Testing

- End-to-end pipeline execution with various resume types
- Cross-browser compatibility for file upload and processing
- Performance testing with large resume files
- Concurrent user testing for system scalability

### Error Simulation Testing

- Network failure simulation at each pipeline step
- File corruption and invalid format testing
- API timeout and rate limit testing
- Memory and storage limit testing