"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepseekProvider = void 0;
// src/services/llm/providers/deepseek.ts
const axios_1 = __importDefault(require("axios"));
class DeepseekProvider {
    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY || '';
        this.baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    }
    async generateResponse(systemPrompt, userPrompt, options = {}) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
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
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error generating response from Deepseek:', error);
            throw new Error('Failed to communicate with Deepseek API');
        }
    }
}
exports.DeepseekProvider = DeepseekProvider;
