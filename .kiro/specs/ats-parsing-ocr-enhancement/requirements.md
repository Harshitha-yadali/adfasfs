# Requirements Document

## Introduction

This feature addresses the critical parsing and OCR failures identified in the ATS Resume Score Checker metrics report. The current system has 0% OCR success rate and 40-60% layout parsing accuracy, which are the biggest blockers for enterprise rollout. This enhancement implements robust parsing capabilities, OCR support, and semantic matching to transform the system from "requires targeted fixes" to "production ready."

The enhancement focuses on the three P0 failures identified:
1. OCR missing (0% success on scanned PDFs/screenshots)
2. Hard-coded formatting penalties causing 30-40% resume loss
3. Multi-column detection and textbox flattening failures

## Glossary

- **OCR (Optical Character Recognition)**: Technology that converts images of text into machine-readable text
- **Layout Parsing**: The process of extracting structured content from complex document layouts including multi-column formats, tables, and textboxes
- **Textbox Flattening**: Converting content from separate textboxes into a coherent text flow
- **Multi-column Detection**: Identifying and properly ordering content from documents with multiple column layouts
- **Semantic Matching**: Using AI/ML to identify conceptually similar terms beyond exact keyword matches
- **Parsing Success Rate**: Percentage of resumes that can be successfully converted to readable text
- **Layout Accuracy**: Percentage of documents where content structure is correctly preserved during parsing
- **Extraction Mode**: Method used to extract text - 'TEXT' for direct extraction, 'OCR' for image-based extraction
- **Confidence Calibration**: Adjusting confidence scores to accurately reflect parsing quality and content reliability
- **Formatting Penalties**: Point deductions applied for non-ATS-friendly formatting elements
- **Template-heavy PDF**: Resume with complex visual layouts, graphics, or non-standard formatting
- **Scanned PDF**: PDF created by scanning a physical document, requiring OCR for text extraction
- **Screenshot PDF**: PDF created from image files, requiring OCR processing

## Requirements

### Requirement 1: OCR Implementation and Support

**User Story:** As a job seeker with a scanned resume or image-based PDF, I want the system to extract and analyze my resume content, so that I can receive scoring and feedback regardless of my file format.

#### Acceptance Criteria

1. WHEN a user uploads a scanned PDF or image-based resume THEN the OCR_Service SHALL extract text content with at least 95% accuracy for clear, standard fonts
2. WHEN OCR processing is required THEN the System SHALL automatically detect the need for OCR and apply the appropriate extraction method
3. WHEN OCR extraction completes THEN the System SHALL set extraction_mode to 'OCR' in the response metadata
4. WHEN OCR text quality is poor THEN the System SHALL assign appropriate confidence levels and provide quality warnings to the user
5. WHEN OCR processing fails THEN the System SHALL return a clear error message explaining the issue and suggesting alternative file formats

### Requirement 2: Multi-Column Layout Detection and Processing

**User Story:** As a job seeker with a multi-column resume layout, I want the system to correctly parse my content in the proper order, so that my experience and skills are accurately analyzed.

#### Acceptance Criteria

1. WHEN analyzing a multi-column resume THEN the Layout_Parser SHALL detect column boundaries and extract content in logical reading order
2. WHEN processing multi-column content THEN the Layout_Parser SHALL maintain the relationship between headers and their corresponding content sections
3. WHEN multi-column parsing completes THEN the System SHALL achieve at least 90% layout accuracy compared to the original document structure
4. WHEN column detection is uncertain THEN the System SHALL apply conservative parsing and flag potential ordering issues in the confidence assessment
5. WHEN multi-column content includes tables or textboxes THEN the Layout_Parser SHALL integrate this content into the main text flow appropriately

### Requirement 3: Textbox and Table Content Integration

**User Story:** As a job seeker with resume content in textboxes or tables, I want this information to be included in my analysis, so that all my qualifications are properly evaluated.

#### Acceptance Criteria

1. WHEN a resume contains textboxes THEN the Textbox_Extractor SHALL identify and extract all textbox content
2. WHEN a resume contains tables THEN the Table_Parser SHALL extract table content and convert it to readable text format
3. WHEN integrating textbox content THEN the System SHALL place extracted text in contextually appropriate locations within the main document flow
4. WHEN table content is extracted THEN the System SHALL preserve the logical relationships between table headers and data
5. WHEN textbox or table extraction is incomplete THEN the System SHALL flag this in the confidence assessment and provide appropriate warnings

### Requirement 4: Adaptive Formatting Penalty System

**User Story:** As a job seeker with a visually designed resume, I want to receive constructive feedback rather than harsh penalties, so that I can understand how to improve without being unfairly penalized for design choices.

#### Acceptance Criteria

1. WHEN evaluating resume formatting THEN the Formatting_Analyzer SHALL apply graduated penalties based on ATS impact severity rather than binary pass/fail scoring
2. WHEN a resume has minor formatting issues THEN the System SHALL apply minimal penalties (1-2 points) and provide specific improvement suggestions
3. WHEN a resume has moderate formatting issues THEN the System SHALL apply moderate penalties (3-5 points) and explain the ATS compatibility impact
4. WHEN a resume has severe formatting issues THEN the System SHALL apply significant penalties (6-10 points) and recommend generating an ATS-friendly version
5. WHEN formatting penalties are applied THEN the System SHALL provide specific, actionable guidance for each penalty type

### Requirement 5: Semantic Matching Implementation

**User Story:** As a job seeker whose resume uses different terminology than the job description, I want the system to recognize semantic similarities, so that my relevant skills and experience are properly credited.

#### Acceptance Criteria

1. WHEN comparing resume content to job descriptions THEN the Semantic_Matcher SHALL identify conceptually similar terms beyond exact keyword matches
2. WHEN semantic matching is performed THEN the System SHALL assign appropriate weights: exact matches (100%), semantic matches (80-90%), related matches (50-70%)
3. WHEN semantic matches are found THEN the System SHALL include these in the keyword analysis and explain the relationship to the user
4. WHEN no semantic matches are available THEN the System SHALL fall back to exact matching and suggest alternative terminology
5. WHEN semantic matching confidence is low THEN the System SHALL flag uncertain matches and request user validation

### Requirement 6: Enhanced Confidence Calibration

**User Story:** As a job seeker, I want to understand how reliable my score is based on parsing quality and content completeness, so that I can trust the assessment appropriately.

#### Acceptance Criteria

1. WHEN parsing quality is high (>95% accuracy) THEN the Confidence_Calculator SHALL assign "High" confidence
2. WHEN parsing quality is moderate (80-95% accuracy) THEN the Confidence_Calculator SHALL assign "Medium" confidence and explain limitations
3. WHEN parsing quality is low (<80% accuracy) THEN the Confidence_Calculator SHALL assign "Low" confidence and recommend alternative file formats
4. WHEN OCR is used THEN the Confidence_Calculator SHALL factor OCR quality into the overall confidence assessment
5. WHEN layout parsing issues are detected THEN the Confidence_Calculator SHALL reduce confidence appropriately and explain the impact

### Requirement 7: File Format Support Expansion

**User Story:** As a job seeker with various file formats, I want the system to handle my resume regardless of format, so that I don't need to convert files before analysis.

#### Acceptance Criteria

1. WHEN a user uploads a DOC or DOCX file THEN the File_Processor SHALL convert it to text while preserving structure
2. WHEN a user uploads an RTF file THEN the File_Processor SHALL extract content and maintain formatting information
3. WHEN a user uploads a TXT or MD file THEN the File_Processor SHALL process it directly with appropriate structure detection
4. WHEN a user uploads an image file (JPG, PNG) THEN the File_Processor SHALL apply OCR processing automatically
5. WHEN an unsupported file format is uploaded THEN the System SHALL provide clear guidance on supported formats and conversion options

### Requirement 8: Parsing Quality Metrics and Monitoring

**User Story:** As a system administrator, I want to monitor parsing success rates and quality metrics, so that I can identify and address parsing issues proactively.

#### Acceptance Criteria

1. WHEN parsing is performed THEN the System SHALL track parsing success rate, layout accuracy, and OCR quality metrics
2. WHEN parsing quality falls below thresholds THEN the System SHALL log detailed error information for analysis
3. WHEN OCR processing is used THEN the System SHALL track OCR confidence scores and character recognition accuracy
4. WHEN layout parsing issues occur THEN the System SHALL record specific failure modes for improvement
5. WHEN quality metrics are collected THEN the System SHALL provide aggregated reports for system optimization

### Requirement 9: Error Recovery and Fallback Mechanisms

**User Story:** As a job seeker whose resume fails to parse correctly, I want the system to attempt alternative processing methods, so that I can still receive useful feedback.

#### Acceptance Criteria

1. WHEN primary parsing fails THEN the Fallback_Processor SHALL attempt alternative extraction methods
2. WHEN OCR quality is insufficient THEN the System SHALL suggest manual text input or alternative file formats
3. WHEN layout parsing produces poor results THEN the System SHALL offer simplified parsing with user confirmation
4. WHEN all parsing methods fail THEN the System SHALL provide clear guidance on preparing an ATS-compatible resume
5. WHEN fallback processing is used THEN the System SHALL clearly communicate the limitations and reduced confidence

### Requirement 10: Performance Optimization for Complex Documents

**User Story:** As a job seeker with a complex resume layout, I want the analysis to complete in a reasonable time, so that I can receive feedback without excessive delays.

#### Acceptance Criteria

1. WHEN processing complex layouts THEN the System SHALL complete parsing within 30 seconds for documents up to 5 pages
2. WHEN OCR processing is required THEN the System SHALL optimize image preprocessing to improve speed and accuracy
3. WHEN multiple parsing attempts are needed THEN the System SHALL prioritize methods by success probability and speed
4. WHEN processing time exceeds limits THEN the System SHALL provide progress updates and estimated completion times
5. WHEN performance optimization is applied THEN the System SHALL maintain parsing accuracy above minimum thresholds

### Requirement 11: User Feedback and Parsing Transparency

**User Story:** As a job seeker, I want to understand what parsing methods were used and any limitations, so that I can make informed decisions about my resume format.

#### Acceptance Criteria

1. WHEN parsing completes THEN the System SHALL display the extraction method used (TEXT, OCR, or HYBRID)
2. WHEN parsing issues are detected THEN the System SHALL explain specific problems and their impact on scoring
3. WHEN OCR is used THEN the System SHALL indicate OCR confidence and suggest verification of extracted content
4. WHEN layout parsing has limitations THEN the System SHALL highlight sections that may need manual review
5. WHEN providing parsing feedback THEN the System SHALL offer specific recommendations for improving resume compatibility

### Requirement 12: Integration with Existing Scoring System

**User Story:** As a job seeker, I want enhanced parsing to work seamlessly with the existing scoring system, so that I receive comprehensive analysis without disruption.

#### Acceptance Criteria

1. WHEN enhanced parsing is used THEN the System SHALL integrate seamlessly with the existing 220+ metric scoring framework
2. WHEN parsing quality affects scoring THEN the System SHALL adjust confidence levels appropriately without changing core scoring logic
3. WHEN semantic matching is applied THEN the System SHALL integrate results into existing keyword analysis workflows
4. WHEN formatting penalties are updated THEN the System SHALL maintain compatibility with existing tier scoring
5. WHEN parsing enhancements are active THEN the System SHALL preserve all existing API interfaces and response formats