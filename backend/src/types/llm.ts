// src/types/llm.ts
export interface LLMProvider {
  generateResponse(
    systemPrompt: string,
    userPrompt: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
      outputFormat?: 'text' | 'json';
    }
  ): Promise<string>;
}

export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  outputFormat?: 'text' | 'json';
  // Outros parâmetros específicos que podem ser necessários
}

// Interface para a resposta da API Deepseek
export interface DeepseekResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  id: string;
  object: string;
  created: number;
  model: string;
}

// Interface para a resposta da API Gemini
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

// Interface para a resposta da API Llama
export interface LlamaResponse {
  response: string;
  done: boolean;
}