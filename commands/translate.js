const { EmbedBuilder } = require('discord.js');
const GeminiTranslator = require('../utils/geminiTranslator');

async function handleSlashTranslate(interaction) {
    console.log('🚀 Bắt đầu handleSlashTranslate');
    
    // Sử dụng flags: 1<<6 để chỉ hiển thị cho user
    await interaction.deferReply({ flags: 1<<6 });
    
    const textToTranslate = interaction.options.getString('text');


    // Kiểm tra độ dài văn bản
    if (textToTranslate.length > 2000) {
        return await interaction.editReply({
            content: '❌ **Lỗi:** Văn bản quá dài. Tối đa 2000 ký tự.',
            flags: 1<<6
        });
    }

    try {
        const translator = new GeminiTranslator();
        const translatedText = await translator.translateToVietnamese(textToTranslate);

        // Kiểm tra nếu bản dịch quá dài
        if (translatedText.length > 4096) {
            return await interaction.editReply({
                content: '**Lỗi:** Bản dịch quá dài để hiển thị trên Discord.',
                flags: 1<<6
            });
        }

        // Tạo embed đẹp mắt
        const embed = new EmbedBuilder()
            .setColor(0x4285F4) // Màu xanh của Google
            .addFields(
                {
    name: '',
    value: '🇺🇸 '+textToTranslate.length > 1024 ? 
           textToTranslate.substring(0, 1021) + '...' : 
           textToTranslate,
    inline: false
},
{
    name: '',
    value: '🇻🇳 '+translatedText.length > 1024 ? 
           translatedText.substring(0, 1021) + '...' : 
           translatedText,
    inline: false
}
            )
            .setFooter({ 
                text: `Yêu cầu bởi ${interaction.user.username} | Powered by Google Gemini AI`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp()
            .setThumbnail('https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg');

        await interaction.editReply({ 
            embeds: [embed],
            flags: 1<<6 // Đảm bảo chỉ hiển thị cho user
        });

    } catch (error) {        
        let errorMessage = '**Lỗi dịch thuật:** ';
        
        if (error.message.includes('rate limit')) {
            errorMessage += 'Đã vượt quá giới hạn request. Vui lòng thử lại sau 1 phút.';
        } else if (error.message.includes('API Key')) {
            errorMessage += 'API Key chưa được cấu hình hoặc không hợp lệ. Vui lòng liên hệ admin.';
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Request timeout. Vui lòng thử lại.';
        } else {
            errorMessage += error.message;
        }

        await interaction.editReply({
            content: errorMessage,
            flags: 1<<6
        });
    }
}

module.exports = {
    handleSlashTranslate
};