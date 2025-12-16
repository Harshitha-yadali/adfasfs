# Requirements Document

## Introduction

This feature enhances the existing ATS Score Checker to implement a professional **220+ metric scoring system** across 10 tiers, following industry-standard ATS scanning methodology. The system provides JD-based scoring when a job description is provided (scoring everything relative to that specific JD) and general ATS scoring when no JD is available. This comprehensive approach gives PrimoBoost a significant competitive advantage over tools like Jobscan (50-80 metrics) by evaluating resumes across 220+ data points.

The system implements a 10-tier architecture covering:
- Tier 1: Basic Structure (20 metrics)
- Tier 2: Content Structure (25 metrics)
- Tier 3: Experience (35 metrics)
- Tier 4: Education & Certifications (20 metrics)
- Tier 5: Skills & Keywords (40 metrics)
- Tier 6: Projects (15 metrics)
- Tier 7: Red Flags (30 metrics)
- Tier 8: Competitive Analysis (15 metrics)
- Tier 9: Culture Fit (20 metrics)
- Tier 10: Qualitative Assessment (10 metrics)

## Glossary

- **ATS (Applicant Tracking System)**: Software used by employers to filter and rank job applications based on keyword matching and formatting compatibility
- **JD (Job Description)**: The full text of a job posting that describes requirements, responsibilities, and qualifications
- **JD-Based Scoring**: Resume evaluation mode where all metrics are scored relative to a specific job description
- **General Scoring**: Resume evaluation mode that assesses ATS compatibility and quality against industry best practices without a specific JD
- **Scoring Mode**: The evaluation approach used (either 'jd_based' or 'general')
- **Extraction Mode**: The method used to extract text from the resume ('TEXT' for direct extraction, 'OCR' for image-based extraction)
- **ATS-Friendly Format**: Resume format that uses simple layouts, no tables, no multi-column designs, no colors/icons, and standard fonts
- **Non-ATS-Friendly Format**: Resume format containing elements that ATS systems cannot parse correctly (tables, colors, icons, images)
- **Match Band**: A categorical rating indicating how well a resume matches requirements (e.g., "Excellent Match", "Good Match", "Poor Match")
- **Interview Probability Range**: An estimated percentage range indicating likelihood of receiving an interview based on the score
- **Metric Tier**: One of 10 categories grouping related evaluation metrics
- **Critical Metrics**: The "Big 5" metrics with highest impact on scoring (JD Keywords Match, Technical Skills Alignment, Quantified Results, Job Title Relevance, Experience Relevance)
- **Red Flag**: A negative indicator that can result in automatic rejection or significant score deduction
- **Keyword Tier**: Classification of keywords by importance (Critical 30%, Important 20%, Nice-to-Have 15%)
- **Exact Match**: When a keyword appears identically in both JD and resume (100% weight)
- **Semantic Match**: When a keyword's meaning is conveyed through related terms (80-90% weight)
- **Related Match**: When a keyword is partially addressed through similar concepts (50-70% weight)

## Requirements

### Requirement 1: JD-Based Scoring Mode

**User Story:** As a job seeker, I want to score my resume against a specific job description, so that I can understand how well my resume matches that particular role.

#### Acceptance Criteria

1. WHEN a user selects JD-based scoring mode and provides a resume, job description, and job title THEN the ATS_Score_Checker SHALL evaluate the resume using the 220+ metric system across all 10 tiers weighted relative to the provided JD
2. WHEN performing JD-based scoring THEN the ATS_Score_Checker SHALL calculate a weighted overall score from 0-100 based on all applicable metrics
3. WHEN JD-based scoring completes THEN the ATS_Score_Checker SHALL return a score from 0-100 with a match band and interview probability range
4. WHEN JD-based scoring identifies gaps THEN the ATS_Score_Checker SHALL provide 5-15 missing keywords that are clearly required in the JD but absent from the resume
5. WHEN JD-based scoring completes THEN the ATS_Score_Checker SHALL highlight the "Big 5" critical metrics: JD Keywords Match, Technical Skills Alignment, Quantified Results Presence, Job Title Relevance, and Experience Relevance

### Requirement 2: General Scoring Mode

**User Story:** As a job seeker without a specific job in mind, I want to get a general ATS score for my resume, so that I can understand its overall quality and ATS compatibility.

#### Acceptance Criteria

1. WHEN a user selects general scoring mode and provides only a resume THEN the ATS_Score_Checker SHALL evaluate the resume against industry best practices using applicable metrics from all 10 tiers
2. WHEN performing general scoring THEN the ATS_Score_Checker SHALL use the same metric framework but evaluate against general standards instead of a specific JD
3. WHEN general scoring completes THEN the ATS_Score_Checker SHALL return a score from 0-100 with a quality band and general recommendations

### Requirement 3: Tier 1 - Basic Structure Metrics (20 metrics)

**User Story:** As a job seeker, I want the system to evaluate my resume's basic structure, so that I can ensure it meets fundamental ATS requirements.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Basic_Structure_Analyzer SHALL evaluate File & Name metrics (5): Resume Filename Format, File Size Optimization, File Format Type, File Name Consistency, Version Control Naming
2. WHEN analyzing a resume THEN the Basic_Structure_Analyzer SHALL evaluate Length & Structure metrics (5): Total Page Count, Total Word Count per Page, Content-to-Whitespace Ratio, Margins & Padding Size, Line Spacing
3. WHEN analyzing a resume THEN the Basic_Structure_Analyzer SHALL evaluate Font & Typography metrics (5): Primary Font Choice, Font Size - Body Text, Font Size - Headers, Font Consistency, Font Weight & Style
4. WHEN analyzing a resume THEN the Basic_Structure_Analyzer SHALL evaluate Color & Visual metrics (5): Color Scheme - Text, Color Scheme - Accents, Use of Tables & Graphics, Background & Decoration, Visual Hierarchy Clarity
5. WHEN the extraction mode is 'OCR' (indicating image-based resume like JPG/PNG) THEN the Basic_Structure_Analyzer SHALL flag the resume as non-ATS-friendly and deduct points accordingly

### Requirement 4: Tier 2 - Content Structure Metrics (25 metrics)

**User Story:** As a job seeker, I want the system to evaluate my resume's content organization, so that I can ensure proper section structure.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Content_Structure_Analyzer SHALL evaluate Section Organization metrics (5): Section Headers - Standard Names, Section Order, Section Completeness, Section Consistency, Missing Sections Detection
2. WHEN analyzing a resume THEN the Content_Structure_Analyzer SHALL evaluate Contact Information metrics (5): Email Address Format, Phone Number Format, LinkedIn Profile Link, Location Information, Contact Info Placement
3. WHEN analyzing a resume THEN the Content_Structure_Analyzer SHALL evaluate Summary/Objective metrics (5): Summary Presence, Summary Relevance to JD, Summary Length, Summary Specificity, Summary with Metrics/Proof
4. WHEN analyzing a resume THEN the Content_Structure_Analyzer SHALL evaluate Date Format metrics (5): Date Format Consistency, Chronological Order, Date Ranges Validity, Current Role Indicator, Education Date Format
5. WHEN analyzing a resume THEN the Content_Structure_Analyzer SHALL evaluate Bullet Points metrics (5): Bullet Count per Job, Bullet Point Length, Bullet Format Consistency, Bullet Parsing Compatibility, Text Paragraph Usage

### Requirement 5: Tier 3 - Experience Metrics (35 metrics)

**User Story:** As a job seeker, I want the system to thoroughly evaluate my work experience, so that I can optimize how I present my professional history.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Experience_Analyzer SHALL evaluate Job Title & Company metrics (7): Job Title Exactness, Job Title Relevance to JD, Job Title Keyword Match, Company Name Accuracy, Company Relevance to Industry, Company Size/Prestige, Multiple Roles at Same Company
2. WHEN analyzing a resume THEN the Experience_Analyzer SHALL evaluate Duration & Stability metrics (7): Tenure in Each Role, Employment Gaps - Size, Employment Gaps - Frequency, Gap Explanation, Job Hopping Pattern, Career Progression Timeline, Current Role Duration
3. WHEN analyzing a resume THEN the Experience_Analyzer SHALL evaluate Achievements metrics (8): Achievement Presence, Quantified Results %, Metric Types Covered, Metric Specificity, Business Impact Clarity, Responsibility-to-Achievement Ratio, Relevance to JD Requirements, Context & Specificity
4. WHEN analyzing a resume THEN the Experience_Analyzer SHALL evaluate Action Verbs metrics (6): Action Verb Usage, Action Verb Variety, Power Verb Score, Passive vs. Active Voice, Jargon & Clarity, Grammar & Spelling
5. WHEN analyzing a resume THEN the Experience_Analyzer SHALL evaluate Experience Relevance metrics (7): Industry Match, Role Function Match, Technical Stack Overlap, Seniority Level Match, Company Type Relevance, Team Size Match, Geographic/Remote Relevance

### Requirement 6: Tier 4 - Education & Certifications Metrics (20 metrics)

**User Story:** As a job seeker, I want the system to evaluate my education and certifications, so that I can ensure they are properly presented.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Education_Analyzer SHALL evaluate Education metrics (10): Degree Presence, Degree Relevance to Role, Degree Type Specificity, Institution Prestige, GPA Inclusion, Graduation Date Accuracy, Honors & Recognition, Relevant Coursework, Multiple Degrees, Online vs. Traditional
2. WHEN analyzing a resume THEN the Certification_Analyzer SHALL evaluate Certification metrics (10): Certification Count, Certification Relevance to JD, Certification Currency, Certification Credibility, Certification Title Format, Certification Date/Validity, Cloud Certifications, Security/Compliance Certs, PMP/Project Management, Language Proficiency Certs

### Requirement 7: Tier 5 - Skills & Keywords Metrics (40 metrics)

**User Story:** As a job seeker, I want the system to thoroughly analyze my skills and keyword coverage, so that I can maximize my ATS match rate.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Skills_Analyzer SHALL evaluate Skills Organization metrics (5): Skills Section Presence, Skills Categorization, Skill-to-Job Relevance, Skills Order/Hierarchy, Skills Format Consistency
2. WHEN analyzing a resume THEN the Skills_Analyzer SHALL evaluate Technical Skills metrics (15): Programming Languages, JD Keywords Match %, Critical Skills Presence, Framework/Library Keywords, Database Technologies, Cloud Platforms, DevOps/Infrastructure, Data & Analytics Tools, API/Integration Expertise, Version Control Systems, Testing & QA Tools, Agile/Scrum Methodology, System Design & Architecture, AI/ML Keywords, Soft Skills Keywords
3. WHEN analyzing a resume THEN the Skills_Analyzer SHALL evaluate Soft Skills metrics (10): Leadership Demonstration, Communication Skills, Problem-Solving Evidence, Collaboration & Teamwork, Initiative & Proactivity, Adaptability & Learning, Customer/Stakeholder Focus, Attention to Detail, Domain Expertise Depth, Training & Development
4. WHEN performing keyword analysis THEN the Keyword_Matcher SHALL identify exact matches (100% weight), semantic matches (80-90% weight), and related matches (50-70% weight)
5. WHEN categorizing JD keywords THEN the Keyword_Matcher SHALL classify them into tiers: Critical (30% weight), Important (20% weight), and Nice-to-Have (15% weight)

### Requirement 8: Tier 6 - Projects Metrics (15 metrics)

**User Story:** As a job seeker, I want the system to evaluate my projects section, so that I can showcase relevant work effectively.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Projects_Analyzer SHALL evaluate all 15 Project metrics: Projects Section Presence, Project Count, Project Description Depth, Project Tech Stack Relevance, Project Impact Metrics, Project Complexity, Open Source Contribution, Portfolio/GitHub Link, Project Team Size, Project Scale/Users, Project Recency, Project Relevance to Role, Project Tangibility, Personal vs. Work Projects, Side Projects/Hobby Skills

### Requirement 9: Tier 7 - Red Flags Detection (30 metrics)

**User Story:** As a job seeker, I want the system to detect red flags in my resume, so that I can fix issues that could lead to automatic rejection.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Red_Flag_Detector SHALL evaluate Employment Red Flags (10): Unexplained Gap >6 Months, Job Hopping Pattern, Title Inflation Detected, Conflicting Dates, Vague Job Responsibilities, No Progress/Skill Development, Company Layoff Pattern, Inconsistencies with LinkedIn, Very Recent Role Change, Unrealistic Salary Jumps
2. WHEN analyzing a resume THEN the Red_Flag_Detector SHALL evaluate Skills Red Flags (10): Keyword Stuffing Detected, False Skill Claims, Missing Proof of Claims, Outdated Tech Emphasis, Irrelevant Skills Listed, No Technical Depth, Generic Skill Language, Missing Domain Knowledge, Unverifiable Claims, Skill Decay Over Time
3. WHEN analyzing a resume THEN the Red_Flag_Detector SHALL evaluate Formatting Red Flags (10): Poor Grammar/Spelling, Inconsistent Formatting, ATS Parsing Issues, Excessive Graphics/Colors, Font Inconsistencies, Length Violations, Contact Info Issues, Section Header Problems, Whitespace Problems, Overall Presentation
4. WHEN a red flag is detected THEN the ATS_Score_Checker SHALL apply appropriate point deductions: Employment gaps >6 months (-3 points), Job hopping pattern (-3 points), Title inflation (-5 points), Multiple red flags (potential automatic rejection warning)

### Requirement 10: Tier 8 - Competitive Analysis Metrics (15 metrics)

**User Story:** As a job seeker, I want the system to analyze my competitive positioning, so that I can understand how I compare to other candidates.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Competitive_Analyzer SHALL evaluate all 15 Competitive metrics: Years of Experience Match, Salary Expectation Alignment, Career Trajectory vs. JD, Specialization Depth, Competitive Advantage, Unique Value Proposition, Industry Trend Alignment, Market Fit Score, Compensation Realism, Geographic Flexibility, Availability & Timeline, Contract/Freelance Experience, International Experience, Diversity & Inclusion Factors, Referral/Network Strength

### Requirement 11: Tier 9 - Culture Fit Metrics (20 metrics)

**User Story:** As a job seeker, I want the system to assess culture fit indicators, so that I can present myself as a good cultural match.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Culture_Fit_Analyzer SHALL evaluate all 20 Culture Fit metrics: Company Culture Alignment, Work Style Indicators, Team Collaboration Evidence, Learning Agility Indicators, Leadership Style Indicators, Risk Tolerance Indicators, Communication Style, Initiative & Autonomy, Feedback Response Indicators, Values Alignment, Remote Work Capability, Distributed Team Experience, Customer-Centric Mindset, Data-Driven Decision Making, Innovation Orientation, Mentoring & Knowledge Sharing, Ethical & Professional Standards, Bias Towards Action, Continuous Improvement, Resilience & Problem-Solving

### Requirement 12: Tier 10 - Qualitative Assessment Metrics (10 metrics)

**User Story:** As a job seeker, I want the system to provide qualitative assessment, so that I can understand the overall impression my resume creates.

#### Acceptance Criteria

1. WHEN analyzing a resume THEN the Qualitative_Analyzer SHALL evaluate all 10 Qualitative metrics: Overall Narrative Coherence, Authenticity & Credibility, Achievement Density, Written Communication Quality, Presentation Polish, Specificity vs. Generality, JD Relevance Score, Motivation & Enthusiasm, Industry Insider Knowledge, Future Potential Indicators

### Requirement 13: Score-to-Band Mapping

**User Story:** As a job seeker, I want to see my interview probability based on my score, so that I can understand my realistic chances of getting an interview.

#### Acceptance Criteria

1. WHEN the overall score is 90-100 THEN the ATS_Score_Checker SHALL display "Excellent Match" with 90-100% interview probability
2. WHEN the overall score is 80-89 THEN the ATS_Score_Checker SHALL display "Very Good Match" with 80-89% interview probability
3. WHEN the overall score is 70-79 THEN the ATS_Score_Checker SHALL display "Good Match" with 60-79% interview probability
4. WHEN the overall score is 60-69 THEN the ATS_Score_Checker SHALL display "Fair Match" with 40-59% interview probability
5. WHEN the overall score is 50-59 THEN the ATS_Score_Checker SHALL display "Below Average" with 25-39% interview probability
6. WHEN the overall score is below 50 THEN the ATS_Score_Checker SHALL display "Poor Match" or lower with corresponding reduced interview probability

### Requirement 14: Actionable Recommendations

**User Story:** As a job seeker, I want to receive actionable improvement suggestions, so that I can enhance my resume's match score.

#### Acceptance Criteria

1. WHEN scoring completes THEN the ATS_Score_Checker SHALL provide 5-10 concrete, actionable recommendations specific to the scoring mode used
2. WHEN in JD-based mode THEN the recommendations SHALL reference specific JD requirements and suggest how to address gaps
3. WHEN scoring completes THEN the ATS_Score_Checker SHALL provide example rewrites for at least one experience bullet and one project bullet
4. WHEN providing example rewrites THEN the ATS_Score_Checker SHALL include the original text, improved version, and explanation of why the improvement is better

### Requirement 15: Color-Coded Feedback

**User Story:** As a job seeker, I want to see color-coded feedback for missing keywords and issues, so that I can quickly identify priorities.

#### Acceptance Criteria

1. WHEN displaying missing keywords THEN the UI SHALL color-code them by importance: red for critical missing terms, orange for important missing terms, yellow for nice-to-have missing terms
2. WHEN a keyword is marked as critical and missing THEN the UI SHALL display it with a red badge and high priority indicator
3. WHEN displaying red flags THEN the UI SHALL use red highlighting with severity indicators
4. WHEN providing keyword feedback THEN the ATS_Score_Checker SHALL rank missing keywords by their impact on the overall score

### Requirement 16: Non-ATS-Friendly Resume Guidance

**User Story:** As a job seeker with a non-ATS-friendly resume, I want to be guided to create an ATS-compliant version, so that I can improve my chances of passing ATS screening.

#### Acceptance Criteria

1. WHEN a resume is determined to be non-ATS-friendly THEN the ATS_Score_Checker SHALL display a clear message indicating the resume does not meet ATS requirements
2. WHEN displaying the non-ATS-friendly message THEN the ATS_Score_Checker SHALL show a button labeled "Generate ATS-Friendly Resume" that navigates to the JD-based optimizer
3. WHEN the user clicks the navigation button THEN the System SHALL navigate to the JD-based optimizer page with the current resume data pre-loaded
4. WHEN a resume has severe formatting issues (score below 40) THEN the ATS_Score_Checker SHALL prominently recommend generating a new ATS-friendly resume

### Requirement 17: Confidence Level

**User Story:** As a job seeker, I want to understand the confidence level of my score, so that I can know how reliable the assessment is.

#### Acceptance Criteria

1. WHEN scoring completes THEN the ATS_Score_Checker SHALL assign a confidence level of "High", "Medium", or "Low"
2. WHEN the resume and JD are clear and detailed THEN the confidence level SHALL be "High"
3. WHEN there is ambiguity or missing information THEN the confidence level SHALL be "Medium"
4. WHEN the resume is sparse or the JD is vague THEN the confidence level SHALL be "Low"

### Requirement 18: Response Structure

**User Story:** As a developer, I want the scoring response to follow a consistent JSON structure, so that the UI can reliably display results.

#### Acceptance Criteria

1. WHEN the scoring service returns results THEN the response SHALL include: overall score, match_band, interview_probability_range, confidence, rubric_version, weighting_mode, extraction_mode, trimmed flag, tier_scores object (with scores for all 10 tiers), critical_metrics object (Big 5 scores), breakdown array, missing_keywords array, red_flags array, actions array, example_rewrites object, notes array, analysis summary, keyStrengths array, improvementAreas array, recommendations array
2. WHEN serializing the scoring response THEN the Scoring_Service SHALL produce valid JSON that conforms to the ComprehensiveScore TypeScript interface
3. WHEN deserializing a scoring response THEN the Scoring_Service SHALL parse the JSON and produce an equivalent ComprehensiveScore object

