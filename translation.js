const translate = require('google-translate-api-x');


const CHANNEL_ID = process.env.CHANNEL_ID || '';

function detectLang(text) {
    const viChars = /[ăâêôơưđà-ỹĂÂÊÔƠƯĐ]/i;
    return viChars.test(text) ? 'vi' : 'en';
}

async function translateText(text, fromLang, toLang) {
    try {
        const res = await translate(text, { from: fromLang, to: toLang });
        return res.text;
    } catch (err) {
        console.error("Lỗi dịch:", err);
        return null;
    }
}

// Slash command: /translate
async function handleTranslation(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'translate') return;
    if (interaction.channel.id !== CHANNEL_ID) {
        return interaction.reply({
            content: 'Lệnh này chỉ hoạt động trong kênh được chỉ định.',
            flags: 1 << 6
        });
    }

    const text = interaction.options.getString('text');
    const fromLang = detectLang(text);
    const toLang = fromLang === 'vi' ? 'en' : 'vi';
    const translated = await translateText(text, fromLang, toLang);

    if (translated) {
        await interaction.reply({content : `Dịch (${fromLang.toUpperCase()} → ${toLang.toUpperCase()}):\n> ${translated}`, flags: 1 << 6});
    } else {
        await interaction.reply({content:'Không thể dịch nội dung.',flags: 1 << 6});
    }
}

async function handleAutoTranslate(message) {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    const text = message.content;
    const fromLang = detectLang(text);
    const toLang = fromLang === 'vi' ? 'en' : 'vi';

    const translated = await translateText(text, fromLang, toLang);
    if (translated && translated !== text) {
        await message.reply(`(${fromLang.toUpperCase()} → ${toLang.toUpperCase()}): ${translated}`);
    }
}


module.exports = {
    handleTranslation,
    handleAutoTranslate,
};