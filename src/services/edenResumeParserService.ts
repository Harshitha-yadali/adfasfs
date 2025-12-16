// src/services/edenResumeParserService.ts
// Resume Parser - Uses Mistral OCR + openai/gpt-4o-mini Chat API
// Step 1: Extract text using Mistral OCR (async for multi-page PDFs)
// Step 2: Parse extracted text with Chat API (openai/gpt-4o-mini)

import {
  ResumeData,
  Education,
  WorkExperience,
  Project,
  Skill,
  Certification,
} from '../types/resume';

const EDENAI_API_KEY = import.meta.env.VITE_EDENAI_API_KEY || '';
const EDENAI_OCR_ASYNC_URL = 'https://api.edenai.run/v2/ocr/ocr_async'; // For multi-page PDFs with Mistral
const EDENAI_CHAT_URL = 'https://api.edenai.run/v2/text/chat';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ParsedResume extends ResumeData {
  parsedText: string;
  parsingConfidence?: number;
  rawEdenResponse?: any;
}

/**
 * Main function: Parse resume using Mistral OCR + openai/gpt-4o-mini
 * Flow: Mistral OCR (async) → Chat API parsing
 */
export const parseResumeFromFile = async (file: File): Promise<ParsedResume> => {
  if (!EDENAI_API_KEY) {
    throw new Error('EdenAI API key not configured. Please check your .env file.');
  }

  let extractedText = '';

  try {
    // For text-based files, read directly
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = await file.text();
    } else {
      // Use Mistral OCR for PDF/DOCX
      try {
        extractedText = await extractTextWithMistralOCR(file);
      } catch (ocrError: any) {
        // Fallback: Try reading as text (for text-based PDFs)
        try {
          const textContent = await file.text();
          const readableChars = textContent.substring(0, 2000).replace(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g, '');
          if (readableChars.length > 200) {
            extractedText = textContent
              .replace(/[\x00-\x08\x0E-\x1F]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          } else {
            throw new Error('File content is not readable text');
          }
        } catch (textError) {
          throw new Error(`OCR extraction failed. Please try a different file format (PDF, DOCX, or TXT).`);
        }
      }
    }
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract enough text from file. Please ensure the file contains readable text.');
    }

    // Step 2: Parse text with Chat API (openai/gpt-4o-mini)
    const parsedData = await parseTextWithChatAPI(extractedText);
    
    // Validate we got real data
    if (parsedData.name === 'John Doe' || parsedData.email === 'johndoe@example.com') {
      console.warn('⚠️ Got placeholder data');
      throw new Error('Placeholder data received');
    }
    
    logResults(parsedData);
    return parsedData;
  } catch (error: any) {
    console.error('❌ PARSING FAILED:', error.message);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

/**
 * Extract text using Mistral OCR (async API for multi-page support)
 * Mistral is the most cost-effective provider ($1 per 1K pages)
 */
const extractTextWithMistralOCR = async (file: File, retryCount = 0): Promise<string> => {
  const MAX_RETRIES = 2;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('providers', 'mistral');
  formData.append('language', 'en');

  try {
    const response = await fetch(EDENAI_OCR_ASYNC_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${EDENAI_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral OCR API Error:', response.status, errorText);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('EdenAI API authentication failed. Please check your API key.');
      }
      if (response.status === 429) {
        throw new Error('EdenAI API rate limit exceeded. Please try again later.');
      }
      if (response.status === 400) {
        throw new Error('Invalid file format. Please upload a PDF or DOCX file.');
      }
      
      if (retryCount < MAX_RETRIES) {
        await delay(2000);
        return extractTextWithMistralOCR(file, retryCount + 1);
      }
      throw new Error(`Mistral OCR API failed: ${response.status}`);
    }

    const result = await response.json();

    // Async API returns a job ID - poll for results
    if (result.public_id) {
      return await pollAsyncOCRResult(result.public_id);
    }

    // If sync response, extract text directly
    return extractTextFromOCRResult(result);
  } catch (error: any) {
    console.error('Mistral OCR Error:', error.message);
    if (retryCount < MAX_RETRIES) {
      await delay(2000);
      return extractTextWithMistralOCR(file, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Poll for async OCR job results
 */
const pollAsyncOCRResult = async (jobId: string, maxAttempts = 30): Promise<string> => {
  const pollUrl = `https://api.edenai.run/v2/ocr/ocr_async/${jobId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${EDENAI_API_KEY}` },
      });

      if (!response.ok) {
        await delay(2000);
        continue;
      }

      const result = await response.json();
      
      if (result.status === 'finished') {
        return extractTextFromOCRResult(result.results || result);
      }
      
      if (result.status === 'failed') {
        throw new Error('Mistral OCR job failed');
      }
      
      // Job still processing
      await delay(2000);
    } catch (error: any) {
      await delay(2000);
    }
  }
  
  throw new Error('Mistral OCR job timed out');
};

/**
 * Extract text from OCR result
 */
const extractTextFromOCRResult = (result: any): string => {
  const extractFromProvider = (prov: any, _provName: string): string | null => {
    if (!prov) return null;
    
    if (prov.status === 'fail' || prov.error) {
      return null;
    }
    
    // Direct text field
    if (prov.text && typeof prov.text === 'string' && prov.text.trim().length > 10) {
      return prov.text;
    }
    
    // Multi-page: pages array
    if (prov.pages && Array.isArray(prov.pages)) {
      const allText = prov.pages
        .map((p: any) => p.text || p.content || '')
        .filter((t: string) => t.trim().length > 0)
        .join('\n\n');
      if (allText.length > 10) {
        return allText;
      }
    }
    
    // raw_text field
    if (prov.raw_text && typeof prov.raw_text === 'string' && prov.raw_text.trim().length > 10) {
      return prov.raw_text;
    }
    
    return null;
  };

  // Try Mistral first
  const mistralText = extractFromProvider(result.mistral, 'mistral');
  if (mistralText) return mistralText;
  
  // Fallback: try any available provider
  for (const key of Object.keys(result)) {
    if (key === 'mistral') continue;
    const text = extractFromProvider(result[key], key);
    if (text) return text;
  }

  throw new Error('No text extracted from Mistral OCR');
};


/**
 * Parse text with Chat API (openai/gpt-4o-mini)
 */
const parseTextWithChatAPI = async (text: string, retryCount = 0): Promise<ParsedResume> => {
  const MAX_RETRIES = 2;

  const prompt = `Parse this resume and extract ALL information. Return ONLY valid JSON.

RESUME TEXT:
"""
${text.slice(0, 12000)}
"""

Return JSON with this exact structure:
{
  "name": "Full name from resume",
  "phone": "Phone number",
  "email": "Email address",
  "linkedin": "LinkedIn URL",
  "github": "GitHub URL",
  "location": "City, State",
  "summary": "Professional summary or objective",
  "education": [{"degree": "Degree name", "school": "School name", "year": "Year", "cgpa": "GPA if mentioned", "location": "Location"}],
  "workExperience": [{"role": "Job title", "company": "Company name", "year": "Date range", "bullets": ["Achievement 1", "Achievement 2"]}],
  "projects": [{"title": "Project name", "bullets": ["Description 1", "Description 2"], "githubUrl": "URL if any"}],
  "skills": [{"category": "Category name", "list": ["Skill1", "Skill2"]}],
  "certifications": [{"title": "Cert name", "description": "Details"}]
}

IMPORTANT: Extract ACTUAL data from the resume text. Do NOT use placeholder values like "John Doe".`;

  const requestBody = {
    providers: 'openai/gpt-4o-mini',
    text: prompt,
    chatbot_global_action: 'You are an expert resume parser. Extract real data from the resume. Return only valid JSON, no markdown.',
    previous_history: [],
    temperature: 0.1,
    max_tokens: 4000,
  };

  try {
    const response = await fetch(EDENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${EDENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (retryCount < MAX_RETRIES) {
        await delay(2000);
        return parseTextWithChatAPI(text, retryCount + 1);
      }
      throw new Error(`Chat API failed: ${response.status}`);
    }

    const result = await response.json();

    const providerResult = result?.['openai/gpt-4o-mini'] || result?.['openai__gpt_4o_mini'];
    
    if (!providerResult) {
      throw new Error('No provider result');
    }

    if (providerResult.status === 'fail') {
      throw new Error(providerResult.error?.message || 'Provider failed');
    }

    const content = providerResult.generated_text || '';
    if (!content) {
      throw new Error('Empty response from Chat API');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return mapToResume(parsed, text, result);
  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      await delay(2000);
      return parseTextWithChatAPI(text, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Map parsed JSON to our resume format
 */
const mapToResume = (parsed: any, rawText: string, rawResult: any): ParsedResume => {
  const education: Education[] = (parsed.education || []).map((e: any) => ({
    degree: e.degree || '',
    school: e.school || '',
    year: e.year || '',
    cgpa: e.cgpa || '',
    location: e.location || '',
  }));

  const workExperience: WorkExperience[] = (parsed.workExperience || []).map((w: any) => ({
    role: w.role || '',
    company: w.company || '',
    year: w.year || '',
    bullets: Array.isArray(w.bullets) ? w.bullets : [],
  }));

  const projects: Project[] = (parsed.projects || []).map((p: any) => ({
    title: p.title || '',
    bullets: Array.isArray(p.bullets) ? p.bullets : [],
    githubUrl: p.githubUrl || '',
  }));

  const skills: Skill[] = (parsed.skills || []).map((s: any) => {
    if (typeof s === 'string') return { category: 'Skills', count: 1, list: [s] };
    const list = Array.isArray(s.list) ? s.list : [];
    return { category: s.category || 'Skills', count: list.length, list };
  });

  const certifications: Certification[] = (parsed.certifications || []).map((c: any) => ({
    title: c.title || '',
    description: c.description || '',
  }));

  return {
    name: parsed.name || '',
    phone: parsed.phone || '',
    email: parsed.email || '',
    linkedin: parsed.linkedin || '',
    github: parsed.github || '',
    location: parsed.location || '',
    summary: parsed.summary || '',
    careerObjective: parsed.summary || '',
    education,
    workExperience,
    projects,
    skills,
    certifications,
    parsedText: rawText,
    parsingConfidence: 0.95,
    rawEdenResponse: rawResult,
    origin: 'eden_parsed',
  };
};

const logResults = (_data: ParsedResume) => {
  // Logging disabled for production
};

export const parseResumeFromUrl = async (_: string): Promise<ParsedResume> => {
  throw new Error('URL parsing not supported');
};

export const edenResumeParserService = { parseResumeFromFile, parseResumeFromUrl };
export default edenResumeParserService;
