// src/services/llm/providers/geminiProvider.ts
import axios from 'axios';
import { LLMProvider } from '../../../types/llm';

// Definir interface para a resposta da API Gemini
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.modelName = 'gemini-1.5-flash-8b';
  }
  
  async generateResponse(
    systemPrompt: string,
    userPrompt: string, 
    options: {
      temperature?: number;
      maxTokens?: number;
      outputFormat?: 'text' | 'json';
    } = {}
  ): Promise<string> {
    try {
      // Especificar o tipo da resposta
      const response = await axios.post<GeminiResponse>(
        `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: `${systemPrompt}\n\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 2000,
            responseFormat: options.outputFormat === 'json' ? "RESPONSE_FORMAT_JSON" : "RESPONSE_FORMAT_TEXT"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Agora o TypeScript sabe que response.data tem a estrutura GeminiResponse
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error('Failed to communicate with Google Gemini API');
    }
  }
}