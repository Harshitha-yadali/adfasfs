// src/services/jdSummarizerService.ts
// JD Summarization Service using EdenAI (OpenAI gpt-4o-mini)

// Use environment variable - DO NOT hard-code
const EDENAI_API_KEY = import.meta.env.VITE_EDENAI_API_KEY || '';
const EDENAI_SUMMARIZE_URL = 'https://api.edenai.run/v2/text/summarize';

export interface JdSummary {
  summary: string;
  responsibilities: string[];
  coreSkills: string[];
  domain: string;
  rawResponse?: any;
}

/**
 * Summarize a Job Description using EdenAI (OpenAI provider)
 * Returns a 2-4 sentence summary focused on responsibilities, core skills, and domain
 */
export const summarizeJd = async (jobDescription: string): Promise<string> => {
  if (!EDENAI_API_KEY) {
    console.warn('EdenAI API key not configured. Skipping JD summarization.');
    return '';
  }

  if (!jobDescription || jobDescription.trim().length < 50) {
    console.warn('Job description too short for summarization.');
    return '';
  }

  try {
    const response = await fetch(EDENAI_SUMMARIZE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EDENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: 'openai',
        text: jobDescription,
        output_sentences: 3,
        language: 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EdenAI Summarize error: ${response.status} - ${errorText}`);
      return '';
    }

    const result = await response.json();
    
    // Extract summary from OpenAI provider response
    const summary = result?.openai?.result || 
                    result?.openai?.summary || 
                    result?.result || 
                    '';
    
    return summary.trim();
  } catch (error: any) {
    console.error('EdenAI JD Summarization error:', error);
    return '';
  }
};

/**
 * Get detailed JD analysis with structured output
 */
export const analyzeJd = async (jobDescription: string): Promise<JdSummary> => {
  const summary = await summarizeJd(jobDescription);
  
  // Extract key components from the JD text
  const responsibilities = extractResponsibilities(jobDescription);
  const coreSkills = extractCoreSkills(jobDescription);
  const domain = detectDomain(jobDescription);
  
  return {
    summary,
    responsibilities,
    coreSkills,
    domain,
  };
};

/**
 * Extract responsibilities from JD text
 */
const extractResponsibilities = (text: string): string[] => {
  const responsibilities: string[] = [];
  const lines = text.split(/[\n\r]+/);
  
  // Common responsibility indicators
  const responsibilityPatterns = [
    /^[\s•\-\*]*(?:responsible for|will be responsible|duties include|responsibilities include)/i,
    /^[\s•\-\*]*(?:develop|design|implement|build|create|manage|lead|coordinate|analyze|optimize)/i,
    /^[\s•\-\*]*(?:work with|collaborate|partner|support|assist|maintain|ensure)/i,
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 20 && trimmed.length < 200) {
      for (const pattern of responsibilityPatterns) {
        if (pattern.test(trimmed)) {
          responsibilities.push(trimmed.replace(/^[\s•\-\*]+/, '').trim());
          break;
        }
      }
    }
  }
  
  return responsibilities.slice(0, 8); // Max 8 responsibilities
};

/**
 * Extract core skills from JD text
 */
const extractCoreSkills = (text: string): string[] => {
  const skills: Set<string> = new Set();
  const textLower = text.toLowerCase();
  
  // Common technical skills to look for
  const skillPatterns = [
    // Programming Languages
    /\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
    // Frameworks
    /\b(react|angular|vue|node\.?js|express|django|flask|spring|\.net|rails)\b/gi,
    // Databases
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|oracle)\b/gi,
    // Cloud & DevOps
    /\b(aws|azure|gcp|docker|kubernetes|jenkins|terraform|ci\/cd|devops)\b/gi,
    // Tools & Concepts
    /\b(git|agile|scrum|rest\s?api|graphql|microservices|machine learning|ai|ml)\b/gi,
  ];
  
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        skills.add(match.trim());
      }
    }
  }
  
  return Array.from(skills).slice(0, 15); // Max 15 skills
};

/**
 * Detect domain/industry from JD text
 */
const detectDomain = (text: string): string => {
  const textLower = text.toLowerCase();
  
  const domainKeywords: Record<string, string[]> = {
    'FinTech': ['fintech', 'banking', 'payment', 'financial', 'trading', 'investment', 'insurance'],
    'Healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinical', 'pharma', 'biotech'],
    'E-commerce': ['ecommerce', 'e-commerce', 'retail', 'shopping', 'marketplace', 'commerce'],
    'AI/ML': ['machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'computer vision', 'data science'],
    'Cloud/Infrastructure': ['cloud', 'infrastructure', 'devops', 'platform', 'saas', 'paas'],
    'Gaming': ['gaming', 'game', 'entertainment', 'esports'],
    'EdTech': ['education', 'edtech', 'learning', 'training', 'lms'],
    'SaaS': ['saas', 'software as a service', 'subscription', 'b2b', 'enterprise'],
  };
  
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        return domain;
      }
    }
  }
  
  return 'Technology';
};

export const jdSummarizerService = {
  summarizeJd,
  analyzeJd,
};

export default jdSummarizerService;
