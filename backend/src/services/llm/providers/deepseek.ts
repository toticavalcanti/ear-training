// src/services/llm/providers/deepseek.ts
import axios from 'axios';
import { LLMProvider, DeepseekResponse } from '../../../types/llm';

export class DeepseekProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
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
      const response = await axios.post<DeepseekResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          response_format: options.outputFormat === 'json' ? { type: "json_object" } : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response from Deepseek:', error);
      throw new Error('Failed to communicate with Deepseek API');
    }
  }
}