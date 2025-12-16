# Implementation Plan: Enhanced ATS Score Checker (220+ Metrics)

- [x] 1. Set up type definitions and interfaces
  - [x] 1.1 Update ComprehensiveScore interface with new fields



    - Add tier_scores object with all 10 tiers
    - Add critical_metrics object for Big 5 metrics
    - Add red_flags array and red_flag_penalty
    - Add auto_reject_risk boolean
    - Update MissingKeyword interface with tier and color fields
    - Update src/types/resume.ts



    - _Requirements: 18.1_

  - [x] 1.2 Write property test for response structure
    - **Property 14: Response Contains All Required Fields**
    - **Validates: Requirements 18.1**

  - [x] 1.3 Write property test for JSON round-trip
    - **Property 9: Response JSON Round-Trip**
    - **Validates: Requirements 18.2, 18.3**

- [x] 2. Implement ScoreMapper utility
  - [x] 2.1 Create ScoreMapper service
    - Create src/services/scoreMapperService.ts
    - Implement getMatchBand function with all 9 band thresholds
    - Implement getInterviewProbability function
    - Implement applyPenalties function
    - _Requirements: 13.1-13.6_

  - [x] 2.2 Write property test for score-to-band mapping
    - **Property 3: Score-to-Band Mapping Consistency**
    - **Validates: Requirements 13.1-13.6**

  - [x] 2.3 Write property test for tier weights
    - **Property 13: Tier Weights Sum to 100**
    - **Validates: Requirements 1.2, 2.2**

- [x] 3. Implement Tier 1: Basic Structure Analyzer
  - [x] 3.1 Create BasicStructureAnalyzer service
    - Create src/services/analyzers/basicStructureAnalyzer.ts
    - Implement File & Name metrics (5): filename format, file size, format type, name consistency, version naming
    - Implement Length & Structure metrics (5): page count, word count, whitespace ratio, margins, line spacing
    - Implement Font & Typography metrics (5): font choice, body size, header size, consistency, weight/style
    - Implement Color & Visual metrics (5): text color, accents, tables/graphics, background, visual hierarchy
    - Handle OCR mode detection (always non-ATS-friendly)
    - _Requirements: 3.1-3.5_

- [x] 4. Implement Tier 2: Content Structure Analyzer
  - [x] 4.1 Create ContentStructureAnalyzer service
    - Create src/services/analyzers/contentStructureAnalyzer.ts
    - Implement Section Organization metrics (5): headers, order, completeness, consistency, missing sections
    - Implement Contact Information metrics (5): email, phone, LinkedIn, location, placement
    - Implement Summary/Objective metrics (5): presence, relevance, length, specificity, metrics/proof
    - Implement Date Format metrics (5): consistency, chronological order, validity, current role, education dates
    - Implement Bullet Points metrics (5): count per job, length, format, parsing compatibility, paragraph usage
    - _Requirements: 4.1-4.5_

- [x] 5. Checkpoint - Ensure all tests pass
  - All 23 property tests passing

- [x] 6. Implement Tier 3: Experience Analyzer
  - [x] 6.1 Create ExperienceAnalyzer service
    - Create src/services/analyzers/experienceAnalyzer.ts
    - Implement Job Title & Company metrics (7): exactness, relevance, keyword match, company accuracy, industry relevance, prestige, multiple roles
    - Implement Duration & Stability metrics (7): tenure, gap size, gap frequency, gap explanation, job hopping, progression, current duration
    - Implement Achievements metrics (8): presence, quantified %, metric types, specificity, impact clarity, responsibility ratio, JD relevance, context
    - Implement Action Verbs metrics (6): usage, variety, power score, voice, jargon, grammar
    - Implement Experience Relevance metrics (7): industry match, function match, tech overlap, seniority, company type, team size, geographic
    - _Requirements: 5.1-5.5_

- [x] 7. Implement Tier 4: Education & Certifications Analyzer
  - [x] 7.1 Create EducationCertAnalyzer service
    - Create src/services/analyzers/educationCertAnalyzer.ts
    - Implement Education metrics (10): degree presence, relevance, type, institution, GPA, graduation date, honors, coursework, multiple degrees, online vs traditional
    - Implement Certification metrics (10): count, relevance, currency, credibility, title format, date/validity, cloud certs, security certs, PMP, language certs
    - _Requirements: 6.1-6.2_

- [x] 8. Implement Tier 5: Skills & Keywords Analyzer
  - [x] 8.1 Create SkillsKeywordsAnalyzer service
    - Create src/services/analyzers/skillsKeywordsAnalyzer.ts
    - Implement Skills Organization metrics (5): section presence, categorization, relevance, hierarchy, format
    - Implement Technical Skills metrics (15): programming languages, JD match %, critical skills, frameworks, databases, cloud, DevOps, data tools, APIs, version control, testing, Agile, system design, AI/ML, soft skills keywords
    - Implement Soft Skills metrics (10): leadership, communication, problem-solving, collaboration, initiative, adaptability, customer focus, attention to detail, domain expertise, training
    - Implement multi-level keyword matching: exact (100%), semantic (80-90%), related (50-70%)
    - Implement keyword tier classification: Critical (30%), Important (20%), Nice-to-Have (15%)
    - _Requirements: 7.1-7.5_

  - [x] 8.2 Write property test for missing keywords count
    - **Property 5: Missing Keywords Count in JD Mode**
    - **Validates: Requirements 1.4**

  - [x] 8.3 Write property test for keyword color mapping
    - **Property 10: Keyword Tier Color Mapping**
    - **Validates: Requirements 15.1**

- [x] 9. Implement Tier 6: Projects Analyzer
  - [x] 9.1 Create ProjectsAnalyzer service
    - Create src/services/analyzers/projectsAnalyzer.ts
    - Implement all 15 Project metrics: presence, count, description depth, tech relevance, impact metrics, complexity, open source, portfolio link, team size, scale, recency, role relevance, tangibility, personal vs work, side projects
    - _Requirements: 8.1_

- [x] 10. Checkpoint - Ensure all tests pass
  - All 23 property tests passing

- [x] 11. Implement Tier 7: Red Flag Detector
  - [x] 11.1 Create RedFlagDetector service
    - Create src/services/analyzers/redFlagDetector.ts
    - Implement Employment Red Flags (10): unexplained gap >6mo, job hopping, title inflation, conflicting dates, vague responsibilities, no progress, layoff pattern, LinkedIn inconsistencies, recent change, salary jumps
    - Implement Skills Red Flags (10): keyword stuffing, false claims, missing proof, outdated tech, irrelevant skills, no depth, generic language, missing domain knowledge, unverifiable claims, skill decay
    - Implement Formatting Red Flags (10): grammar/spelling, inconsistent formatting, ATS parsing issues, excessive graphics, font issues, length violations, contact issues, header problems, whitespace, presentation
    - Apply penalties: gap >6mo (-3), job hopping (-3), title inflation (-5)
    - Set auto_reject_risk when >= 3 critical flags
    - _Requirements: 9.1-9.4_

  - [x] 11.2 Write property test for red flag penalties
    - **Property 8: Red Flag Penalties Applied**
    - **Validates: Requirements 9.4**

- [x] 12. Implement Tier 8: Competitive Analyzer
  - [x] 12.1 Create CompetitiveAnalyzer service
    - Create src/services/analyzers/competitiveAnalyzer.ts
    - Implement all 15 Competitive metrics: years match, salary alignment, trajectory, specialization, advantage, unique value, trend alignment, market fit, compensation, geographic flexibility, availability, contract experience, international, diversity, referral strength
    - _Requirements: 10.1_

- [x] 13. Implement Tier 9: Culture Fit Analyzer
  - [x] 13.1 Create CultureFitAnalyzer service
    - Create src/services/analyzers/cultureFitAnalyzer.ts
    - Implement all 20 Culture Fit metrics: culture alignment, work style, collaboration, learning agility, leadership style, risk tolerance, communication style, initiative, feedback response, values, remote capability, distributed team, customer mindset, data-driven, innovation, mentoring, ethics, bias to action, continuous improvement, resilience
    - _Requirements: 11.1_

- [x] 14. Implement Tier 10: Qualitative Analyzer
  - [x] 14.1 Create QualitativeAnalyzer service
    - Create src/services/analyzers/qualitativeAnalyzer.ts
    - Implement all 10 Qualitative metrics: narrative coherence, authenticity, achievement density, communication quality, presentation polish, specificity, JD relevance, motivation, insider knowledge, future potential
    - _Requirements: 12.1_

- [x] 15. Checkpoint - Ensure all tests pass
  - All 10 tier analyzers now implemented and integrated

- [x] 16. Update ScoringService with 220+ metric integration
  - [x] 16.1 Integrate all tier analyzers
    - Created src/services/enhancedScoringService.ts
    - Import and orchestrate all 10 tier analyzers
    - Calculate weighted tier scores
    - Calculate Big 5 critical metrics
    - Apply red flag penalties
    - Generate final overall score
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 16.2 Update JD-based scoring prompt
    - Enhance prompt to leverage 220+ metrics
    - Include tier-specific analysis
    - Ensure 5-15 missing keywords returned
    - Include Big 5 critical metrics
    - _Requirements: 1.1-1.5_

  - [ ] 16.3 Update General scoring prompt
    - Enhance prompt for general mode
    - Use same metric framework against industry standards
    - _Requirements: 2.1-2.3_

  - [x] 16.4 Write property test for valid score output
    - **Property 1: Valid Score Output Structure**
    - **Validates: Requirements 1.3, 2.3**

  - [x] 16.5 Write property test for tier scores presence
    - **Property 2: All 10 Tier Scores Present**
    - **Validates: Requirements 3-12**

  - [x] 16.6 Write property test for critical metrics
    - **Property 4: Critical Metrics Present**
    - **Validates: Requirements 1.5**

- [x] 17. Implement recommendations and example rewrites
  - [x] 17.1 Ensure 5-10 actionable recommendations
    - Validate actions array length
    - Include tier-specific recommendations
    - Reference JD requirements in JD mode
    - _Requirements: 14.1, 14.2_

  - [x] 17.2 Ensure example rewrites structure
    - Validate example_rewrites has experience and projects
    - Each must have original, improved, explanation
    - _Requirements: 14.3, 14.4_

  - [x] 17.3 Write property test for recommendations count
    - **Property 6: Recommendations Count**
    - **Validates: Requirements 14.1**

  - [x] 17.4 Write property test for example rewrites structure
    - **Property 7: Example Rewrites Structure**
    - **Validates: Requirements 14.3, 14.4**

- [x] 18. Implement confidence level assignment
  - [x] 18.1 Add confidence level logic
    - Assign High/Medium/Low based on input quality
    - Consider resume length, JD clarity, section completeness
    - _Requirements: 17.1-17.4_

  - [x] 18.2 Write property test for confidence level
    - **Property 12: Confidence Level Valid**
    - **Validates: Requirements 17.1**

- [x] 19. Checkpoint - Ensure all tests pass
  - All 35 property tests passing

- [x] 20. Update ResumeScoreChecker UI component
  - [x] 20.1 Add tier scores display
    - Create TierScoresDisplay component
    - Show all 10 tier scores with progress bars
    - Highlight top issues per tier
    - _Requirements: 3-12_

  - [x] 20.2 Add Big 5 critical metrics display
    - Create CriticalMetricsDisplay component
    - Show Big 5 metrics prominently
    - Use status indicators (excellent/good/fair/poor)
    - _Requirements: 1.5_

  - [x] 20.3 Add red flags display
    - Create RedFlagsDisplay component
    - Show detected red flags with severity
    - Display auto-reject risk warning if applicable
    - _Requirements: 9.1-9.4_

  - [x] 20.4 Add color-coded missing keywords display
    - Create MissingKeywordBadge component
    - Map tiers to colors: critical->red, important->orange, nice_to_have->yellow
    - Display keywords sorted by impact
    - _Requirements: 15.1-15.4_

  - [x] 20.5 Add low score optimizer recommendation
    - Show prominent recommendation when score < 40
    - Include navigation to JD-based optimizer
    - _Requirements: 16.1-16.4_

  - [x] 20.6 Write property test for low score recommendation
    - **Property 11: Low Score Triggers Optimizer Recommendation**
    - **Validates: Requirements 16.4**

- [x] 21. Integration and error handling
  - [x] 21.1 Integrate all services in scoring flow
    - Call all tier analyzers
    - Apply red flag penalties
    - Calculate final weighted score
    - Include all results in ComprehensiveScore response
    - _Requirements: 18.1_

  - [x] 21.2 Implement error handling
    - Handle API failures with retry logic
    - Return default error score on failure
    - Log errors appropriately
    - _Requirements: 18.1_

- [x] 22. Final Checkpoint - Ensure all tests pass
  - All 35 property tests passing
  - All 10 tier analyzers implemented
  - All UI components created

