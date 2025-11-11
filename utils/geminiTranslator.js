const axios = require('axios');

class GeminiTranslator {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiBase = 'https://generativelanguage.googleapis.com/v1';
        this.model = null; // sẽ được chọn tự động
    }

    async initModel() {
        if (this.model) return this.model; // ✅ cache để không gọi lại API

        try {
            console.log('Đang lấy danh sách model khả dụng từ Gemini API...');
            const res = await axios.get(`${this.apiBase}/models?key=${this.apiKey}`);
            
            const models = res.data.models || [];
            if (models.length === 0) throw new Error('Không tìm thấy model nào từ API.');

            // Ưu tiên model mới nhất có chứa "gemini" và "flash"
            const sorted = models
                .filter(m => m.name.includes('gemini'))
                .sort((a, b) => b.name.localeCompare(a.name)); // model mới nhất nằm trước

            const preferred =
                sorted.find(m => m.name.includes('flash')) ||
                sorted.find(m => m.name.includes('pro')) ||
                sorted[0];

            this.model = preferred.name.replace('models/', '');
            console.log(`Chọn model: ${this.model}`);
            return this.model;
        } catch (err) {
            console.error('Không thể lấy danh sách model:', err.response?.data || err.message);
            // Dự phòng model mặc định nếu API ListModels lỗi
            this.model = 'gemini-2.5-flash';
            return this.model;
        }
    }

    async translateToVietnamese(text) {
        try {
            const model = await this.initModel(); // đảm bảo đã chọn model hợp lệ
            const apiUrl = `${this.apiBase}/models/${model}:generateContent`;

            console.log(`Đang dịch bằng ${model}:`, text.substring(0, 50) + '...');

            const response = await axios.post(
                `${apiUrl}?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `Hãy dịch văn bản sau sang tiếng Việt một cách tự nhiên và chính xác. 
CHỈ trả về bản dịch tiếng Việt, không kèm ghi chú hay ký tự đặc biệt.

"${text}"`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1000
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!result) throw new Error('Phản hồi không hợp lệ từ Gemini');
            console.log('Kết quả dịch:', result.substring(0, 50) + '...');
            return result;

        } catch (error) {
            console.error('Lỗi khi dịch bằng Gemini:', error.response?.data || error.message);

            if (error.response?.status === 404) {
                console.warn('Model không còn khả dụng. Thử làm mới danh sách...');
                this.model = null; // xoá cache model
                return this.translateToVietnamese(text); // tự động thử lại với model mới nhất
            }

            throw new Error(`Lỗi dịch thuật Gemini: ${error.message}`);
        }
    }
}

module.exports = GeminiTranslator;
