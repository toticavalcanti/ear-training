"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamaProvider = void 0;
// src/services/llm/providers/llamaProvider.ts
const axios_1 = __importDefault(require("axios"));
class LlamaProvider {
    constructor() {
        this.apiKey = process.env.DEEPINFRA_API_KEY || '';
        this.baseUrl = 'https://api.deepinfra.com/v1/inference';
    }
    async generateResponse(systemPrompt, userPrompt, options = {}) {
        try {
            // Especificar o tipo da resposta
            const response = await axios_1.default.post(this.baseUrl + '/meta-llama/Llama-3.2-11b-vision-instruct', {
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
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            // Agora o TypeScript sabe que response.data tem a estrutura LlamaResponse
            return response.data.output.content;
        }
        catch (error) {
            console.error('Error generating response from Llama 3.2:', error);
            throw new Error('Failed to communicate with Deepinfra API');
        }
    }
}
exports.LlamaProvider = LlamaProvider;
