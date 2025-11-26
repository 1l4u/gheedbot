const GeminiTranslator = require('../utils/geminiTranslator');

class ContextTranslateHandler {
    constructor() {
        this.translator = new GeminiTranslator();
        this.userCooldowns = new Map();
    }

    isUserInCooldown(userId) {
        const cooldown = this.userCooldowns.get(userId);
        if (!cooldown) return false;
        
        if (Date.now() - cooldown < 3000) { // 3 giây cooldown
            return true;
        }
        
        this.userCooldowns.delete(userId);
        return false;
    }

    async handleMessageContext(interaction) {
        const { commandName, targetMessage, user } = interaction;
        
        
        // Kiểm tra cooldown
        if (this.isUserInCooldown(user.id)) {
            await interaction.reply({
                content: '⏳ Vui lòng đợi 3 giây trước khi dịch tiếp.',
                flags: 1 << 6
            });
            return;
        }

        this.userCooldowns.set(user.id, Date.now());

        try {
            await interaction.deferReply({ flags: 1 << 6 }); // Ephemeral

            const messageContent = targetMessage.content;
            
            if (!messageContent || messageContent.trim() === '') {
                await interaction.editReply({
                    content: '❌ Tin nhắn này không có nội dung để dịch.',
                    flags: 1 << 6
                });
                return;
            }
            
            if (messageContent.length > 2000) {
                await interaction.editReply({
                    content: '❌ Tin nhắn quá dài để dịch. Tối đa 2000 ký tự.',
                    flags: 1 << 6
                });
                return;
            }

            let translatedText;
            let targetLanguage;
            
            if (commandName === 'Dịch sang Tiếng Việt') {
                targetLanguage = 'vi';
                translatedText = await this.translator.translateText(messageContent, targetLanguage);
            } else if (commandName === 'Translate to English') {
                targetLanguage = 'en';
                translatedText = await this.translator.translateText(messageContent, targetLanguage);
            } else {
                // Auto-detect nếu là context menu khác
                translatedText = await this.translator.autoTranslate(messageContent);
            }
            
            if (translatedText.length > 1900) {
                await interaction.editReply({
                    content: '❌ Bản dịch quá dài để hiển thị.',
                    flags: 1 << 6
                });
                return;
            }
            
            const usageStats = this.translator.getUsageStats();
            const cacheInfo = usageStats.cacheLoaded ? 
                `\n\n📊 Cache: ${usageStats.cacheEntries} entries | API: ${usageStats.requestsThisMinute}/15 req` :
                `\n\n📊 API: ${usageStats.requestsThisMinute}/15 req`;
            
            const flag = targetLanguage === 'vi' ? '🇻🇳' : '🇺🇸';
            const languageName = targetLanguage === 'vi' ? 'Tiếng Việt' : 'English';
            
            await interaction.editReply({
                content: `${translatedText}`,
                flags: 1 << 6
            });


        } catch (error) {
            
            let errorMessage = '❌ **Lỗi dịch thuật:** ';
            
            if (error.message.includes('rate limit')) {
                errorMessage += 'Đã vượt quá giới hạn API. Vui lòng thử lại sau 1 phút.';
            } else if (error.message.includes('quá dài')) {
                errorMessage += error.message;
            } else if (error.message.includes('timeout')) {
                errorMessage += 'Request timeout. Vui lòng thử lại.';
            } else {
                errorMessage += 'Đã xảy ra lỗi không mong muốn.';
            }

            await interaction.editReply({
                content: errorMessage,
                flags: 1 << 6
            });
        }
    }
}

const handler = new ContextTranslateHandler();

module.exports = {
    handleMessageContext: (interaction) => handler.handleMessageContext(interaction)
};