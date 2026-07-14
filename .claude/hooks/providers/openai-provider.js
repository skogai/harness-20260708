/**
 * OpenAI AI Provider
 *
 * Uses openai SDK with gpt-4o-mini model.
 * Also works with Azure OpenAI via OPENAI_BASE_URL.
 *
 * Set OPENAI_API_KEY environment variable.
 * Optionally set OPENAI_BASE_URL for Azure or compatible endpoints.
 */
export class OpenAIProvider {
    name = 'openai';
    client = null;
    async initialize() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
            return false;
        try {
            const { default: OpenAI } = await import('openai');
            const opts = { apiKey };
            if (process.env.OPENAI_BASE_URL) {
                opts.baseURL = process.env.OPENAI_BASE_URL;
            }
            this.client = new OpenAI(opts);
            return true;
        }
        catch {
            return false;
        }
    }
    async classifyPrompt(prompt) {
        return this.generate(prompt);
    }
    async analyzeEdit(prompt) {
        return this.generate(prompt);
    }
    async generate(prompt) {
        if (!this.client) {
            throw new Error('OpenAI client not initialized');
        }
        const response = await this.client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
        });
        return response.choices?.[0]?.message?.content || '';
    }
}
export async function createOpenAIProvider() {
    const provider = new OpenAIProvider();
    const ok = await provider.initialize();
    return ok ? provider : null;
}
