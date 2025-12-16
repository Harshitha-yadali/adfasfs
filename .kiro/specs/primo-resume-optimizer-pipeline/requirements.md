# Requirements Document

## Introduction

This specification defines the PrimoResumeOptimizer Pipeline - a streamlined 5-step resume optimization workflow that uses AI parsing, missing section detection, project preview/editing, and 16-parameter optimization to produce ATS-optimized resumes. The system follows a strict flow: Parse → Check Missing Sections → Project Preview → Optimize (16 parameters) → Final Preview.

## Glossary

- **PrimoResumeOptimizer**: The AI-powered resume optimization system
- **16 Parameters**: The specific scoring metrics used to evaluate and optimize resumes (Contact & Title, Summary/Objective, Role Title Match, Hard Skills Match, Soft Skills Match, Experience Relevance, Project Quality, Quantified Results, Action Verbs & Impact-first Bullets, Keyword Density/ATS Hits, Formatting & Readability, Section Completeness, Chronology & Dates, Relevance Filtering, Tools & Versions, Seniority/Scope Alignment)
- **Parsed Resume**: Structured JSON representation of resume content extracted by AI
- **Missing Sections**: Required resume sections not found during parsing
- **Project Preview**: Editable interface showing parsed projects before optimization
- **JD**: Job Description - the target job posting for optimization
- **ATS**: Applicant Tracking System - software used by employers to filter resumes

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to upload my resume and have it parsed by AI into structured data, so that the system can analyze and optimize my content.

#### Acceptance Criteria

1. WHEN a user uploads a resume (PDF or text) THEN the system SHALL call the parseResume API to extract structured JSON
2. WHEN parsing completes THEN the system SHALL extract candidate info (name, contact, title, summary), experience entries, projects, education, skills (technical, tools, soft), and certifications
3. WHEN parsing completes THEN the system SHALL return a parsingConfidence score (0.0-1.0) indicating extraction quality
4. WHEN parsing completes THEN the system SHALL identify and list any missingSections in the response
5. WHEN parsing fails THEN the system SHALL display a clear error message and allow the user to retry

### Requirement 2

**User Story:** As a job seeker, I want to be notified of missing resume sections, so that I can add required information before optimization.

#### Acceptance Criteria

1. WHEN missingSections array is non-empty THEN the system SHALL display a banner listing the missing sections
2. WHEN missing sections are detected THEN the system SHALL provide quick-add buttons for each missing section
3. WHEN user adds a missing section THEN the system SHALL update the parsed resume JSON with the new content
4. WHEN all required sections are present THEN the system SHALL enable progression to the Project Preview step
5. WHEN user attempts to proceed without required sections THEN the system SHALL prevent progression and highlight missing items

### Requirement 3

**User Story:** As a job seeker, I want to preview and edit my parsed projects before optimization, so that I can ensure project information is accurate and complete.

#### Acceptance Criteria

1. WHEN user reaches the Project Preview step THEN the system SHALL display each parsed project in an editable form
2. WHEN displaying projects THEN the system SHALL show project name, description, role, technologies, metrics, and link fields
3. WHEN user edits a project field THEN the system SHALL update the corresponding value in the parsed resume JSON
4. WHEN user clicks "Add Project" THEN the system SHALL create a new empty project entry for user input
5. WHEN user clicks "Apply" THEN the system SHALL save all project changes and proceed to the Optimize step

### Requirement 4

**User Story:** As a job seeker, I want my resume optimized against a job description using 16 specific parameters, so that I receive targeted improvements and scoring.

#### Acceptance Criteria

1. WHEN user clicks Apply THEN the system SHALL call the optimizeResume API with parsed resume, job description, and 16 parameters
2. WHEN optimization runs THEN the system SHALL rewrite summary, experience bullets, project descriptions, and skills section
3. WHEN optimization runs THEN the system SHALL inject JD keywords naturally without keyword stuffing
4. WHEN optimization completes THEN the system SHALL return optimizedParsedResume JSON, optimizedResumeText (plain text), and parameterScores for all 16 parameters
5. WHEN optimization completes THEN the system SHALL return suggestions array with improvement recommendations (prefixed with [CONFIRM] when user action required)
6. WHEN optimization completes THEN the system SHALL return a confidence level (high/medium/low)

### Requirement 5

**User Story:** As a job seeker, I want to see a side-by-side preview of my original and optimized resume, so that I can review changes before downloading.

#### Acceptance Criteria

1. WHEN optimization completes THEN the system SHALL display Original vs Optimized resume side-by-side
2. WHEN displaying comparison THEN the system SHALL show the 16 parameter scores with notes for each
3. WHEN displaying comparison THEN the system SHALL highlight key changes between original and optimized versions
4. WHEN user reviews the preview THEN the system SHALL allow final edits to the optimized content
5. WHEN user is satisfied THEN the system SHALL provide Download options (PDF, DOCX formats)

### Requirement 6

**User Story:** As a job seeker, I want each of the 16 parameters scored individually, so that I understand exactly where my resume excels and needs improvement.

#### Acceptance Criteria

1. WHEN scoring Contact & Title THEN the system SHALL evaluate clear contact info and professional title matching JD
2. WHEN scoring Summary/Objective THEN the system SHALL evaluate presence and alignment to target role
3. WHEN scoring Role Title Match THEN the system SHALL evaluate role keywords matching JD (seniority and exact role)
4. WHEN scoring Hard Skills Match THEN the system SHALL evaluate coverage of technical skills from JD
5. WHEN scoring Soft Skills Match THEN the system SHALL evaluate communication, teamwork, and other soft skills from JD
6. WHEN scoring Experience Relevance THEN the system SHALL evaluate relevance of each experience item to JD
7. WHEN scoring Project Quality THEN the system SHALL evaluate impact, scope, and technologies used
8. WHEN scoring Quantified Results THEN the system SHALL evaluate presence of metrics (%, #, time) in bullets
9. WHEN scoring Action Verbs & Impact-first Bullets THEN the system SHALL evaluate leading with verbs and outcomes
10. WHEN scoring Keyword Density/ATS Hits THEN the system SHALL evaluate presence of JD keywords in natural contexts
11. WHEN scoring Formatting & Readability THEN the system SHALL evaluate bullet length, headers, spacing, and fonts
12. WHEN scoring Section Completeness THEN the system SHALL evaluate presence of required sections (Experience, Projects, Education, Skills, Contact)
13. WHEN scoring Chronology & Dates THEN the system SHALL evaluate date presence and consistency
14. WHEN scoring Relevance Filtering THEN the system SHALL evaluate de-prioritization of unrelated low-value items
15. WHEN scoring Tools & Versions THEN the system SHALL evaluate specific tools and versions mentioned where relevant
16. WHEN scoring Seniority/Scope Alignment THEN the system SHALL evaluate responsibilities level matching JD (ownership vs task)

### Requirement 7

**User Story:** As a job seeker, I want the AI to preserve my factual information while improving presentation, so that my resume remains truthful and accurate.

#### Acceptance Criteria

1. WHEN rewriting content THEN the system SHALL preserve company names, dates, degrees, and project names exactly
2. WHEN rewriting content THEN the system SHALL rephrase or condense descriptions without changing factual information
3. WHEN metrics are missing THEN the system SHALL propose measurable phrasing as suggestions only (not fabricate numbers)
4. WHEN suggesting changes requiring confirmation THEN the system SHALL prefix with [CONFIRM] marker
5. WHEN missing sections exist THEN the system SHALL provide template snippets for user to complete

### Requirement 8

**User Story:** As a job seeker, I want the optimization to follow specific bullet formatting rules, so that my resume follows best practices.

#### Acceptance Criteria

1. WHEN rewriting experience bullets THEN the system SHALL follow Action + Context + Result format
2. WHEN rewriting project bullets THEN the system SHALL follow Tech + Impact + Metrics format
3. WHEN rewriting any bullet THEN the system SHALL produce 1-3 improved bullets per original entry
4. WHEN rewriting bullets THEN the system SHALL use impact-first style with action verbs leading
5. WHEN metrics exist THEN the system SHALL include them; when absent THEN the system SHALL suggest measurable phrasing
