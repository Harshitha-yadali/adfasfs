# Requirements Document

## Introduction

This document specifies the requirements for a JD-Based Resume Optimizer that uses 16 scoring parameters to optimize resumes against job descriptions. The system follows a strict pipeline: AI parsing → missing sections check → project analysis/preview → apply optimization → final preview. The optimizer rewrites the entire resume (bullets, summary, skills, role alignment) based on the JD and 16 ATS parameters.

## Glossary

- **JD**: Job Description - the target job posting text
- **16 Parameters**: The 16 resume scoring metrics used for optimization
- **Parsed Resume**: Structured JSON representation of resume extracted by AI
- **Missing Sections**: Required resume sections that are absent or incomplete
- **Project Preview**: Editable view of parsed projects before optimization
- **Optimization**: AI-powered rewriting of resume content against JD and 16 parameters
- **ATS**: Applicant Tracking System - automated resume screening software

## The 16 Scoring Parameters

1. **Contact & Title** - Clear contact info, professional title matching JD
2. **Summary/Objective** - Present and aligned to target role
3. **Role Title Match** - Role keywords match JD (seniority & exact role)
4. **Skills Match (Hard)** - Coverage of technical skills from JD
5. **Skills Match (Soft)** - Communication, teamwork etc. from JD
6. **Experience Relevance** - Relevance of each experience item to JD
7. **Project Quality** - Impact, scope, technologies used
8. **Quantified Results** - Presence of metrics (%, #, time) in bullets
9. **Action Verbs & Impact** - Lead with verbs + outcome
10. **Keyword Density/ATS** - JD keywords in natural contexts
11. **Formatting & Readability** - Bullet length, headers, spacing
12. **Section Completeness** - Required sections exist
13. **Chronology & Dates** - Dates present and consistent
14. **Relevance Filtering** - De-prioritize unrelated items
15. **Tools & Versions** - Specific tools/versions mentioned
16. **Seniority/Scope Alignment** - Responsibilities match JD level

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to upload my resume and have it parsed by AI, so that I can get structured data for optimization.

#### Acceptance Criteria

1. WHEN a user uploads a resume (PDF/text) THEN the System SHALL parse it using AI and return structured JSON with candidate info, experience, projects, education, skills, and certifications
2. WHEN AI parsing completes THEN the System SHALL include parsingConfidence score (0.0-1.0) and missingSections array in the response
3. WHEN parsing fails THEN the System SHALL return an error message and allow retry
4. WHEN resume text is empty or invalid THEN the System SHALL reject the input with a clear error message

### Requirement 2

**User Story:** As a job seeker, I want to be notified of missing resume sections, so that I can add them before optimization.

#### Acceptance Criteria

1. WHEN parsed resume has missingSections THEN the System SHALL display a banner listing all missing sections
2. WHEN user views missing sections banner THEN the System SHALL provide quick-add buttons for each missing section
3. WHEN user adds a missing section THEN the System SHALL update the parsed resume JSON and re-validate
4. WHEN all required sections are present THEN the System SHALL allow proceeding to project preview

### Requirement 3

**User Story:** As a job seeker, I want to preview and edit my parsed projects, so that I can make changes before optimization.

#### Acceptance Criteria

1. WHEN user reaches project preview step THEN the System SHALL display each parsed project in editable form (title, description, tech, metrics)
2. WHEN user edits a project field THEN the System SHALL update the parsed resume JSON in real-time
3. WHEN user clicks "Add New Project" THEN the System SHALL create a new empty project entry
4. WHEN user clicks "Delete Project" THEN the System SHALL remove that project from the list
5. WHEN user clicks "Apply" button THEN the System SHALL save all project changes and proceed to optimization

### Requirement 4

**User Story:** As a job seeker, I want my resume optimized against a job description using 16 parameters, so that I get a fully rewritten ATS-optimized resume.

#### Acceptance Criteria

1. WHEN user clicks Apply with parsed resume and JD THEN the System SHALL call the AI optimizer with the 16 parameters
2. WHEN optimization runs THEN the System SHALL rewrite: summary, all experience bullets, all project bullets, and skills section
3. WHEN optimization runs THEN the System SHALL inject JD keywords naturally into bullets/summary/skills without keyword stuffing
4. WHEN optimization runs THEN the System SHALL align role titles and seniority with JD requirements
5. WHEN optimization completes THEN the System SHALL return optimizedParsedResume JSON, parameterScores (0.0-1.0 for each of 16), suggestions array, and plain-text resume
6. WHEN suggestions require user confirmation THEN the System SHALL prefix them with "[CONFIRM]"

### Requirement 5

**User Story:** As a job seeker, I want to see a side-by-side preview of original vs optimized resume, so that I can review changes before downloading.

#### Acceptance Criteria

1. WHEN optimization completes THEN the System SHALL display side-by-side Original vs Optimized resume view
2. WHEN displaying preview THEN the System SHALL show all 16 parameter scores with visual indicators
3. WHEN displaying preview THEN the System SHALL highlight changes/improvements in the optimized version
4. WHEN user views preview THEN the System SHALL provide Download buttons (PDF/DOCX)
5. WHEN user wants to make final edits THEN the System SHALL allow inline editing of optimized resume

### Requirement 6

**User Story:** As a job seeker, I want the optimizer to preserve my factual information, so that my resume remains truthful.

#### Acceptance Criteria

1. WHEN optimizing resume THEN the System SHALL preserve all factual candidate information (company names, dates, degrees, project names)
2. WHEN optimizing resume THEN the System SHALL NOT invent employers, degrees, or certifications
3. WHEN optimizing bullets THEN the System SHALL rephrase or condense but NOT change dates or employers
4. WHEN adding metrics THEN the System SHALL propose measurable phrasing as suggestions only (marked [CONFIRM]) if no numeric metrics exist

### Requirement 7

**User Story:** As a job seeker, I want each of the 16 parameters scored individually, so that I can see exactly where my resume needs improvement.

#### Acceptance Criteria

1. WHEN optimization completes THEN the System SHALL return a score (0.0-1.0) for each of the 16 parameters
2. WHEN displaying scores THEN the System SHALL include a short note explaining each score
3. WHEN a parameter scores below 0.7 THEN the System SHALL provide specific improvement suggestions
4. WHEN displaying overall score THEN the System SHALL calculate weighted average of all 16 parameters

### Requirement 8

**User Story:** As a job seeker, I want the optimization to use a specific AI prompt format, so that results are consistent and high-quality.

#### Acceptance Criteria

1. WHEN calling AI optimizer THEN the System SHALL use the PrimoResumeOptimizer system prompt
2. WHEN AI returns response THEN the System SHALL parse JSON result followed by plain-text resume (separated by ---RESUME---)
3. WHEN AI response is malformed THEN the System SHALL retry up to 2 times before showing error
4. WHEN AI optimization succeeds THEN the System SHALL include confidence level (high/medium/low) in response
