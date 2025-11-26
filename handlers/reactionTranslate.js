const { EmbedBuilder } = require('discord.js');
const GeminiTranslator = require('../utils/geminiTranslator');
const translationCache = require('../utils/translationCache');

class ReactionHandler {
    constructor() {
        try {
            this.translator = new GeminiTranslator();
        } catch (error) {
            this.translator = {
                async autoTranslate(text) {
                    return '❌ Lỗi hệ thống dịch thuật. Vui lòng thử lại sau.';
                },
                getUsageStats() {
                    return { 
                        requestsThisMinute: 0, 
                        estimatedTokensUsed: 0, 
                        cacheEntries: 0,
                        cacheLoaded: false
                    };
                }
            };
        }
        
        this.userCooldowns = new Map();
        this.userRequestCounts = new Map();
    }

    canUserRequest(userId) {
        const now = Date.now();
        const userStats = this.userRequestCounts.get(userId) || { count: 0, lastReset: now };
        
        if (now - userStats.lastReset > 60000) {
            userStats.count = 0;
            userStats.lastReset = now;
        }
        
        if (userStats.count >= 5) {
            return false;
        }
        
        userStats.count++;
        this.userRequestCounts.set(userId, userStats);
        return true;
    }

    isUserInCooldown(userId) {
        const cooldown = this.userCooldowns.get(userId);
        if (!cooldown) return false;
        
        if (Date.now() - cooldown < 5000) {
            return true;
        }
        
        this.userCooldowns.delete(userId);
        return false;
    }

    async handleReactionTranslate(reaction, user) {
        
        if (!['🇻🇳', '🇺🇸'].includes(reaction.emoji.name)) return;
        if (user.bot) return;

        if (this.isUserInCooldown(user.id)) {
            return;
        }

        if (!this.canUserRequest(user.id)) {
            return;
        }

        try {
            const message = reaction.message;
            
            if (!message.content || message.content.trim() === '') {
                return;
            }

            if (message.content.length > 2000) {
                return;
            }


            this.userCooldowns.set(user.id, Date.now());

            // Kiểm tra cache ngay lập tức
            const cachedTranslation = translationCache.get(message.content);
            if (cachedTranslation) {
                await this.sendEphemeralReply(message, user, cachedTranslation, true);
                return;
            }

            // Nếu không có cache, xử lý dịch
            await this.sendEphemeralReply(message, user, '⏳ Đang dịch... Vui lòng chờ.', false);
            
            const translatedText = await this.translator.autoTranslate(message.content);

            if (translatedText.length > 1900) {
                await this.sendEphemeralReply(message, user, '❌ Bản dịch quá dài để hiển thị.', false);
                return;
            }

            await this.sendEphemeralReply(message, user, translatedText, false);


        } catch (error) {
            console.error('❌ Lỗi trong handleReactionTranslate:', error);
            
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

            try {
                await reaction.message.reply({
                    content: errorMessage,
                    flags: 1 << 6
                });
            } catch (replyError) {
            }
        }
    }

    async sendEphemeralReply(originalMessage, user, content, isFromCache = false) {
        try {
            const usageStats = this.translator.getUsageStats();
            
            let messageContent;
            if (isFromCache) {
                messageContent = `${content}`;
            } else if (content === '⏳ Đang dịch... Vui lòng chờ.') {
                messageContent = content;
            } else {
                const cacheInfo = usageStats.cacheLoaded ? 
                    `\n\n📊 Cache: ${usageStats.cacheEntries} entries | API: ${usageStats.requestsThisMinute}/15 req` :
                    `\n\n📊 API: ${usageStats.requestsThisMinute}/15 req`;
                
                messageContent = `${content}`;
            }

            if (content === '⏳ Đang dịch... Vui lòng chờ.') {
                // Gửi message mới
                await originalMessage.reply({
                    content: messageContent,
                    flags: 1 << 6
                });
            } else {
                // Cập nhật message hiện có hoặc gửi mới
                try {
                    // Thử tìm message để edit
                    const messages = await originalMessage.channel.messages.fetch({ limit: 10 });
                    const userMessage = messages.find(msg => 
                        msg.author.id === originalMessage.client.user.id && 
                        msg.content.includes('⏳ Đang dịch') &&
                        msg.mentions.users.has(user.id)
                    );
                    
                    if (userMessage) {
                        await userMessage.edit(messageContent);
                    } else {
                        await originalMessage.reply({
                            content: messageContent,
                            flags: 1 << 6
                        });
                    }
                } catch (editError) {
                    await originalMessage.reply({
                        content: messageContent,
                        flags: 1 << 6
                    });
                }
            }

        } catch (error) {
        }
    }

    getStats() {
        return {
            translator: this.translator.getUsageStats(),
            userCount: this.userRequestCounts.size,
            cooldownCount: this.userCooldowns.size
        };
    }
}

const handler = new ReactionHandler();

module.exports = {
    onReactionAdd: (reaction, user) => handler.handleReactionTranslate(reaction, user),
    onReactionRemove: () => {},
    getHandlerStats: () => handler.getStats()
};