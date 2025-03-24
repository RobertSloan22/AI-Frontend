export class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.error('Missing VITE_OPENAI_API_KEY environment variable');
      throw new Error('OpenAI API key is required');
    }
  }

  async createSession() {
    try {
      console.log('Creating OpenAI session...');
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-12-17',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData?.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      console.log('Session created successfully');
      return data;
    } catch (error) {
      console.error('Error creating OpenAI session:', error);
      throw error;
    }
  }

  async createChatCompletion(model: string, messages: any[]) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
    }
  }
} 