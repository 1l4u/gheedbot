const axios = require('axios');
const translationCache = require('./translationCache');

class GeminiTranslator {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiBase = 'https://generativelanguage.googleapis.com/v1';
        this.model = null;
        
        // Rate limiting settings
        this.rateLimit = {
            requestsPerMinute: 15,
            tokensPerMinute: 1000000,
            lastRequestTime: 0,
            requestCount: 0,
            tokenCount: 0
        };
    }

    async waitForRateLimit() {
        const now = Date.now();
        const timeDiff = now - this.rateLimit.lastRequestTime;
        
        if (timeDiff > 60000) {
            this.rateLimit.requestCount = 0;
            this.rateLimit.lastRequestTime = now;
        }
        
        if (this.rateLimit.requestCount >= this.rateLimit.requestsPerMinute) {
            const waitTime = 60000 - timeDiff + 1000;
            console.log(`⏳ Đạt giới hạn RPM, chờ ${waitTime/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.rateLimit.requestCount = 0;
            this.rateLimit.lastRequestTime = Date.now();
        }
        
        this.rateLimit.requestCount++;
    }

    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }

    async initModel() {
        if (this.model) return this.model;

        try {
            await this.waitForRateLimit();
            
            console.log('Đang lấy danh sách model khả dụng từ Gemini API...');
            const res = await axios.get(`${this.apiBase}/models?key=${this.apiKey}`);
            
            const models = res.data.models || [];
            if (models.length === 0) throw new Error('Không tìm thấy model nào từ API.');

            const sorted = models
                .filter(m => m.name.includes('gemini'))
                .sort((a, b) => b.name.localeCompare(a.name));

            const preferred =
                sorted.find(m => m.name.includes('flash')) ||
                sorted.find(m => m.name.includes('pro')) ||
                sorted[0];

            this.model = preferred.name.replace('models/', '');
            console.log(`Chọn model: ${this.model}`);
            return this.model;
        } catch (err) {
            console.error('Không thể lấy danh sách model:', err.response?.data || err.message);
            this.model = 'gemini-2.5-flash';
            return this.model;
        }
    }

    async detectLanguage(text) {
        const vietnameseRegex = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i;
        const isVietnamese = vietnameseRegex.test(text);
        
        return isVietnamese ? 'vi' : 'en';
    }

    async translateText(text, targetLanguage) {
        // Kiểm tra cache trước
        const cachedTranslation = translationCache.get(text);
        if (cachedTranslation) {
            console.log('✅ Sử dụng bản dịch từ cache');
            return cachedTranslation;
        }

        // Kiểm tra cache tương tự
        const similarTranslation = translationCache.findSimilar(text);
        if (similarTranslation) {
            console.log('✅ Sử dụng bản dịch tương tự từ cache');
            return similarTranslation;
        }

        if (text.length > 3000) {
            throw new Error('Văn bản quá dài. Tối đa 3000 ký tự.');
        }

        const estimatedTokens = this.estimateTokens(text);
        if (estimatedTokens > 8000) {
            throw new Error('Văn bản quá dài. Vui lòng sử dụng đoạn văn ngắn hơn.');
        }

        await this.waitForRateLimit();

        try {
            const model = await this.initModel();
            const apiUrl = `${this.apiBase}/models/${model}:generateContent`;

            const sourceLangName = targetLanguage === 'vi' ? 'tiếng Anh' : 'tiếng Việt'; // 🚨 SỬA: Đổi tên biến
            const targetLangName = targetLanguage === 'vi' ? 'tiếng Việt' : 'tiếng Anh'; // 🚨 SỬA: Đổi tên biến

            console.log(`🌐 Dịch ${sourceLangName} → ${targetLangName} (${estimatedTokens} tokens):`, text.substring(0, 50) + '...');

            const response = await axios.post(
                `${apiUrl}?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `Dịch chính xác từ ${sourceLangName} sang ${targetLangName}. CHỈ trả về bản dịch, không thêm ghi chú:

${text}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: Math.min(estimatedTokens + 100, 1000),
                        topP: 0.8,
                        topK: 40
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 25000
                }
            );

            const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!result) throw new Error('Phản hồi không hợp lệ từ Gemini');
            
            console.log('✅ Dịch thành công:', result.substring(0, 50) + '...');

            // Lưu vào cache
            const detectedSourceLang = await this.detectLanguage(text); // 🚨 SỬA: Đổi tên biến
            translationCache.set(text, result, detectedSourceLang, targetLanguage);

            this.rateLimit.tokenCount += estimatedTokens + this.estimateTokens(result);

            return result;

        } catch (error) {
            console.error('❌ Lỗi dịch:', error.response?.data || error.message);

            if (error.response?.status === 429) {
                console.log('⚠️ Rate limit bị hit, chờ 60s...');
                await new Promise(resolve => setTimeout(resolve, 60000));
                return this.translateText(text, targetLanguage);
            }

            if (error.response?.status === 404) {
                this.model = null;
                return this.translateText(text, targetLanguage);
            }

            throw new Error(`Lỗi dịch thuật: ${error.message}`);
        }
    }

    async autoTranslate(text) {
        const detectedLang = await this.detectLanguage(text);
        const targetLang = detectedLang === 'vi' ? 'en' : 'vi';
        
        console.log(`🔍 Phát hiện: ${detectedLang} → ${targetLang}`);
        return await this.translateText(text, targetLang);
    }

    getUsageStats() {
        const cacheStats = translationCache.getStats();
        return {
            requestsThisMinute: this.rateLimit.requestCount,
            estimatedTokensUsed: this.rateLimit.tokenCount,
            cacheEntries: cacheStats.totalEntries,
            cacheLoaded: cacheStats.isLoaded
        };
    }
}

module.exports = GeminiTranslator;