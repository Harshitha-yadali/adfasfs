/**
 * EdenAI Text Generation Service
 * Replaces all OpenRouter API calls with EdenAI's text generation
 */

const EDENAI_API_KEY = import.meta.env.VITE_EDENAI_API_KEY;
const EDENAI_API_URL = 'https://api.edenai.run/v2/text/chat';

// Available providers: openai/gpt-4o-mini, google/gemini-1.5-flash, etc.
const DEFAULT_PROVIDER = 'openai/gpt-4o-mini';

console.log('EdenAI Text Service: API Key configured:', !!EDENAI_API_KEY);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface EdenAITextResponse {
  openai?: {
    generated_text: string;
    message: {
      role: string;
      content: string;
    }[];
  };
  google?: {
    generated_text: string;
  };
  [key: string]: any;
}

/**
 * Generate text using EdenAI's chat API
 */
export const generateText = async (
  prompt: string,
  options: {
    provider?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> => {
  const {
    provider = DEFAULT_PROVIDER,
    temperature = 0.3,
    maxTokens = 4000
  } = options;

  console.log('🤖 EdenAI Text Generation Request');
  console.log('   Provider:', provider);
  console.log('   Temperature:', temperature);
  console.log('   Max Tokens:', maxTokens);
  console.log('   Prompt length:', prompt.length, 'chars');

  if (!EDENAI_API_KEY) {
    console.error('❌ EdenAI API key not configured');
    throw new Error('EdenAI API key is not configured');
  }

  const response = await fetch(EDENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EDENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      providers: provider,
      text: prompt,
      chatbot_global_action: 'You are a helpful AI assistant for resume optimization and career guidance.',
      previous_history: [],
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EdenAI API error:', errorText);
    throw new Error(`EdenAI API error: ${response.status} - ${errorText}`);
  }

  const data: EdenAITextResponse = await response.json();
  
  console.log('📋 EdenAI Raw Response:', JSON.stringify(data).slice(0, 1000));
  
  // Extract generated text from the provider's response
  // EdenAI returns the key as-is (e.g., 'openai/gpt-4o-mini')
  let providerResponse = data[provider];
  
  // Also try without the model suffix for backwards compatibility
  if (!providerResponse && provider.includes('/')) {
    const baseProvider = provider.split('/')[0];
    providerResponse = data[baseProvider];
  }
  
  if (!providerResponse) {
    console.error('❌ No response from provider:', provider);
    console.error('   Available keys:', Object.keys(data));
    console.error('   Full response:', JSON.stringify(data).slice(0, 1000));
    
    // Try to find any provider response
    const availableProviders = Object.keys(data).filter(k => data[k]?.generated_text);
    if (availableProviders.length > 0) {
      const fallbackProvider = availableProviders[0];
      console.log(`🔄 Using fallback provider: ${fallbackProvider}`);
      return data[fallbackProvider].generated_text || '';
    }
    
    throw new Error(`No response from provider: ${provider}. Response: ${JSON.stringify(data).slice(0, 500)}`);
  }

  // Check for errors in provider response
  if (providerResponse.status === 'fail' || providerResponse.error) {
    console.error('❌ Provider returned error:', providerResponse.error);
    throw new Error(`Provider error: ${providerResponse.error?.message || 'Unknown error'}`);
  }

  const generatedText = providerResponse.generated_text || '';
  
  if (!generatedText || generatedText.trim().length === 0) {
    console.error('❌ Empty response from provider');
    console.error('   Provider response:', JSON.stringify(providerResponse).slice(0, 500));
    throw new Error('Empty response from AI provider');
  }
  
  console.log('✅ EdenAI Response received');
  console.log('   Response length:', generatedText.length, 'chars');
  
  return generatedText;
};

/**
 * Chat with context using EdenAI
 */
export const chat = async (
  messages: ChatMessage[],
  options: {
    provider?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> => {
  const {
    provider = DEFAULT_PROVIDER,
    temperature = 0.3,
    maxTokens = 4000
  } = options;

  if (!EDENAI_API_KEY) {
    throw new Error('EdenAI API key is not configured');
  }

  // Convert messages to EdenAI format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const previousHistory = messages
    .filter(m => m.role !== 'system')
    .slice(0, -1)
    .map(m => ({
      role: m.role,
      message: m.content
    }));
  
  const lastMessage = messages[messages.length - 1];

  const response = await fetch(EDENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EDENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      providers: provider,
      text: lastMessage.content,
      chatbot_global_action: systemMessage || 'You are a helpful AI assistant.',
      previous_history: previousHistory,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EdenAI Chat API error:', errorText);
    throw new Error(`EdenAI API error: ${response.status} - ${errorText}`);
  }

  const data: EdenAITextResponse = await response.json();
  
  // Try the exact provider key first, then base provider
  let providerResponse = data[provider];
  if (!providerResponse && provider.includes('/')) {
    const baseProvider = provider.split('/')[0];
    providerResponse = data[baseProvider];
  }
  
  if (!providerResponse) {
    // Try to find any provider response
    const availableProviders = Object.keys(data).filter(k => data[k]?.generated_text);
    if (availableProviders.length > 0) {
      return data[availableProviders[0]].generated_text || '';
    }
    throw new Error(`No response from provider: ${provider}`);
  }

  return providerResponse.generated_text || '';
};

/**
 * Generate text with retry logic and provider fallback
 */
export const generateTextWithRetry = async (
  prompt: string,
  options: {
    provider?: string;
    temperature?: number;
    maxTokens?: number;
    maxRetries?: number;
  } = {}
): Promise<string> => {
  const { maxRetries = 3, ...generateOptions } = options;
  let lastError: Error | null = null;
  let delay = 1000;

  // Try with primary provider first (openai/gpt-4o-mini)
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 EdenAI attempt ${attempt}/${maxRetries}...`);
      return await generateText(prompt, generateOptions);
    } catch (error) {
      lastError = error as Error;
      console.warn(`EdenAI attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  // Try with Google as fallback if OpenAI fails
  const currentProvider = generateOptions.provider || DEFAULT_PROVIDER;
  if (currentProvider.includes('openai')) {
    console.log('🔄 Trying Google as fallback provider...');
    try {
      return await generateText(prompt, {
        ...generateOptions,
        provider: 'google/gemini-1.5-flash'
      });
    } catch (fallbackError) {
      console.warn('Google fallback also failed:', fallbackError);
    }
  }

  throw lastError || new Error('Failed to generate text after retries');
};

/**
 * Parse JSON from AI response
 */
export const parseJSONResponse = <T>(response: string): T => {
  if (!response || response.trim().length === 0) {
    console.error('❌ Empty response received for JSON parsing');
    throw new Error('Empty response from AI - cannot parse JSON');
  }
  
  // Clean the response
  let cleaned = response
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  
  // Try to extract JSON object or array from the response
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }
  
  console.log('🔍 Attempting to parse JSON, length:', cleaned.length);
  console.log('   First 200 chars:', cleaned.slice(0, 200));
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Failed to parse JSON response:', error);
    console.error('   Raw response:', cleaned.slice(0, 500));
    
    // Try to fix common JSON issues
    try {
      // Remove trailing commas before closing brackets
      const fixed = cleaned
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      return JSON.parse(fixed);
    } catch (fixError) {
      console.error('❌ Failed to fix and parse JSON');
      throw new Error('Invalid JSON response from AI');
    }
  }
};

export const edenAITextService = {
  generateText,
  generateTextWithRetry,
  chat,
  parseJSONResponse
};
