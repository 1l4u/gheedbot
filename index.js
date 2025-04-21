require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const runewords = require('./runeword.json'); // File JSON của bạn



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Bot đã sẵn sàng: ${client.user.tag}`);
});


client.on('messageCreate', async (message) => {
  if (!message.content.toLowerCase().startsWith('!rw')) return;

  const searchTerm = message.content.slice(4).trim();
  
  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.reply({
      content: '🐺 ẳng ẳng ẳng! Hãy nhập tên Runeword (ví dụ: `!rw lore`)',
      allowedMentions: { repliedUser: false }
    });
  }

  // Tìm kiếm không phân biệt hoa thường
  const foundKey = Object.keys(runewords).find(key => 
    key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    return message.reply({
      content: `🐺 ẳng ẳng ẳng! Không tìm thấy Runeword "${searchTerm}"`,
      allowedMentions: { repliedUser: false }
    });
  }

  const item = runewords[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];

  try {
    // Gửi từng embed cho mỗi phiên bản
    for (const rw of itemsToDisplay) {
      const embed = {
        title: rw.name || foundKey,
        color: 0xFF9900, // Màu cam
        fields: [
          { name: 'Types', value: rw.types?.join(', ') || 'N/A' },
          { name: 'Required Level', value: rw.level || 'N/A' },
          { 
            name: 'Options', 
            value: rw.option?.map(opt => `${opt}`).join('\n') || 'N/A',
            inline: false 
          }
        ],
        footer: { text: `Requested by ${message.author.username}` },
        timestamp: new Date()
      };

      await message.reply({ 
        embeds: [embed],
        allowedMentions: { repliedUser: false }
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi embed:', error);
    message.reply({
      content: '🐺 ẳng! Có lỗi khi hiển thị thông tin Runeword',
      allowedMentions: { repliedUser: false }
    });
  }
});
// Tạo web server đơn giản
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot đang chạy'));
app.listen(3000, () => console.log('Keep-alive server started'));

// Ping định kỳ (mỗi 5 phút)
setInterval(() => {
  fetch('https://your-repl-url.repl.co').catch(console.error);
}, 5 * 60 * 1000);
// Thay YOUR_BOT_TOKEN bằng token của bạn
client.login(process.env.DISCORD_TOKEN);