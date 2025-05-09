// src/services/llm/providers/llamaProvider.ts
import axios from 'axios';
import { LLMProvider } from '../../../types/llm';

// Definir interface para a resposta da API Deepinfra/Llama
interface LlamaResponse {
  output: {
    content: string;
  };
  // Outros campos que podem vir na resposta
  id: string;
  status: string;
  created_at: string;
}

export class LlamaProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.DEEPINFRA_API_KEY || '';
    this.baseUrl = 'https://api.deepinfra.com/v1/inference';
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
      const response = await axios.post<LlamaResponse>(
        this.baseUrl + '/meta-llama/Llama-3.2-11b-vision-instruct',
        {
          input: {
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
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Agora o TypeScript sabe que response.data tem a estrutura LlamaResponse
      return response.data.output.content;
    } catch (error) {
      console.error('Error generating response from Llama 3.2:', error);
      throw new Error('Failed to communicate with Deepinfra API');
    }
  }
}