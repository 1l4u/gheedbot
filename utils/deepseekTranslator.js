const axios = require('axios');

class DeepSeekTranslator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    }

    async translateToVietnamese(text) {
        try {
            console.log('Translating using DeepSeek-R1 (Free):', text.substring(0, 50) + '...');
            
            const prompt = `Hãy dịch văn bản sau sang tiếng Việt một cách tự nhiên và chính xác. Chỉ trả về bản dịch tiếng Việt, không thêm bất kỳ giải thích nào.

Văn bản: "${text}"`;

            const response = await axios.post(this.apiUrl, {
                model: 'deepseek-reasoner',  // Sử dụng DeepSeek-R1
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            console.log('DeepSeek-R1 API Response received');
            
            if (response.data.choices && response.data.choices[0]) {
                const result = response.data.choices[0].message.content.trim();
                console.log('R1 Translation result:', result.substring(0, 50) + '...');
                return result;
            } else {
                console.log('Phản hồi từ API không hợp lệ');
            }

        } catch (error) {
            console.error('Lỗi DeepSeek-R1 API:', error.response?.data || error.message);
            
            // Xử lý lỗi cụ thể
            if (error.response?.status === 401) {
                console.log('API Key không hợp lệ. Vui lòng kiểm tra lại API Key.');
            } else if (error.response?.status === 429) {
                console.log('Vượt quá giới hạn rate limit. Vui lòng thử lại sau.');
            } else if (error.response?.data?.error?.code === 'model_not_found') {
                // Fallback sang model deepseek-chat nếu R1 không available
                console.log('DeepSeek-R1 not available, trying deepseek-chat...');
                return await this.translateWithChatModel(text);
            } else {
                console.log(`Lỗi dịch thuật: ${error.message}`);
            }
        }
    }

    // Fallback method nếu R1 không hoạt động
    async translateWithChatModel(text) {
        try {
            const response = await axios.post(this.apiUrl, {
                model: 'deepseek-chat',  // Fallback to chat model
                messages: [
                    {
                        role: 'user',
                        content: `Dịch sang tiếng Việt: "${text}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (response.data.choices && response.data.choices[0]) {
                return response.data.choices[0].message.content.trim();
            }
            console.log('Fallback cũng thất bại');
        } catch (fallbackError) {
            console.log(`Cả R1 và fallback đều thất bại: ${fallbackError.message}`);
        }
    }
}

module.exports = DeepSeekTranslator;