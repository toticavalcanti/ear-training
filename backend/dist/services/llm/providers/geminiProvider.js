"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
// src/services/llm/providers/geminiProvider.ts
const axios_1 = __importDefault(require("axios"));
class GeminiProvider {
    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.modelName = 'gemini-1.5-flash-8b';
    }
    async generateResponse(systemPrompt, userPrompt, options = {}) {
        try {
            // Especificar o tipo da resposta
            const response = await axios_1.default.post(`${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`, {
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
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Agora o TypeScript sabe que response.data tem a estrutura GeminiResponse
            return response.data.candidates[0].content.parts[0].text;
        }
        catch (error) {
            console.error('Error generating response from Gemini:', error);
            throw new Error('Failed to communicate with Google Gemini API');
        }
    }
}
exports.GeminiProvider = GeminiProvider;
