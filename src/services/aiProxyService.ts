// src/services/aiProxyService.ts
// Unified frontend service for all AI API calls via Supabase Edge Function
// All API keys are stored securely in Supabase - never exposed to browser

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/ai-proxy`;

/**
 * Call the AI proxy Edge Function
 */
const callProxy = async (service: string, action: string, params: Record<string, any> = {}) => {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ service, action, ...params }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Proxy request failed: ${response.status}`);
  }

  return data;
};

// ======================
// FILE HELPERS
// ======================
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
  });
};

// ======================
// EDENAI FUNCTIONS
// ======================
export const edenai = {
  /**
   * OCR - Extract text from PDF/DOCX
   */
  async extractText(file: File): Promise<string> {
    const fileBase64 = await fileToBase64(file);
    
    // Start OCR job
    const startResult = await callProxy('edenai', 'ocr_async', {
      fileBase64,
      fileName: file.name,
      fileType: file.type,
    });

    // Poll for results if async
    if (startResult.public_id) {
      return await this.pollOCR(startResult.public_id);
    }

    return this.extractTextFromResult(startResult);
  },

  async pollOCR(jobId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const result = await callProxy('edenai', 'ocr_status', { jobId });
      
      if (result.status === 'finished') {
        return this.extractTextFromResult(result.results || result);
      }
      if (result.status === 'failed') throw new Error('OCR failed');
    }
    throw new Error('OCR timeout');
  },

  extractTextFromResult(result: any): string {
    if (result.mistral?.text) return result.mistral.text;
    if (result.mistral?.pages) {
      return result.mistral.pages.map((p: any) => p.text || '').join('\n\n');
    }
    for (const key of Object.keys(result)) {
      if (result[key]?.text) return result[key].text;
    }
    throw new Error('No text extracted');
  },

  /**
   * Chat - AI text generation
   */
  async chat(prompt: string, options: { provider?: string; temperature?: number; maxTokens?: number } = {}) {
    const result = await callProxy('edenai', 'chat', {
      prompt,
      provider: options.provider || 'openai/gpt-4o-mini',
      temperature: options.temperature || 0.1,
      maxTokens: options.maxTokens || 4000,
    });

    const providerKey = Object.keys(result).find(k => result[k]?.generated_text);
    if (providerKey) return result[providerKey].generated_text;
    throw new Error('No response from EdenAI chat');
  },

  /**
   * Summarize text
   */
  async summarize(text: string, outputLength: 'short' | 'medium' | 'long' = 'medium') {
    const result = await callProxy('edenai', 'summarize', { text, outputLength });
    const providerKey = Object.keys(result).find(k => result[k]?.result);
    if (providerKey) return result[providerKey].result;
    throw new Error('No summary generated');
  },

  /**
   * Content moderation
   */
  async moderate(text: string) {
    return callProxy('edenai', 'moderation', { text });
  },

  /**
   * Spell check
   */
  async spellCheck(text: string) {
    return callProxy('edenai', 'spell_check', { text });
  },
};

// ======================
// OPENROUTER FUNCTIONS
// ======================
export const openrouter = {
  /**
   * Chat completion
   */
  async chat(prompt: string, options: { model?: string; temperature?: number; maxTokens?: number } = {}) {
    const result = await callProxy('openrouter', 'chat', {
      prompt,
      model: options.model || 'google/gemini-2.5-flash',
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 4000,
    });

    return result.choices?.[0]?.message?.content || '';
  },

  /**
   * Chat with system prompt
   */
  async chatWithSystem(systemPrompt: string, userPrompt: string, options: { model?: string; temperature?: number } = {}) {
    const result = await callProxy('openrouter', 'chat_with_system', {
      systemPrompt,
      userPrompt,
      model: options.model || 'google/gemini-2.5-flash',
      temperature: options.temperature || 0.3,
    });

    return result.choices?.[0]?.message?.content || '';
  },
};

// ======================
// GEMINI FUNCTIONS
// ======================
export const gemini = {
  /**
   * Generate content
   */
  async generate(prompt: string, model = 'gemini-pro') {
    const result = await callProxy('gemini', 'generate', { prompt, model });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },
};

// ======================
// GITHUB FUNCTIONS
// ======================
export const github = {
  async getUser(username: string) {
    return callProxy('github', 'user', { username });
  },

  async getRepo(owner: string, repo: string) {
    return callProxy('github', 'repo', { owner, repo });
  },

  async getCommits(owner: string, repo: string) {
    return callProxy('github', 'commits', { owner, repo });
  },

  async searchRepos(query: string, options: { sort?: string; order?: string; perPage?: number } = {}) {
    return callProxy('github', 'search_repos', {
      query,
      sort: options.sort || 'stars',
      order: options.order || 'desc',
      perPage: options.perPage || 10,
    });
  },
};

// ======================
// DEFAULT EXPORT
// ======================
export const aiProxy = {
  edenai,
  openrouter,
  gemini,
  github,
};

export default aiProxy;
