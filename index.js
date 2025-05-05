require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const runewords = require("./runeword.json"); // File JSON của bạn
const crafts = require("./craft.json"); // File JSON của bạn
const wiki = require("./wiki.json");
const express = require("express");
const axios = require('axios');
const config = require('./config.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Tạo một route đơn giản để giữ app "alive"
app.get("/ping", (req, res) => {
  res.send("Pong!");
});

app.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const commands = {
    '!rw': handleRuneword,
    '!wiki': handleWiki,
    '!search': handleSearch,
    '!chance': handleCritChance
  };

  for (const [prefix, handler] of Object.entries(commands)) {
    if (content.startsWith(prefix)) {
      try {
        await handler(message);
      } catch (error) {
        console.error(`Lỗi khi xử lý lệnh ${prefix}:`, error);
        message.channel.send("```🐺 Đã xảy ra lỗi!```");
      }
      return;
    }
  }
});

// Các hàm xử lý lệnh
async function handleRuneword(message) {
  const searchTerm = message.content.slice(3).trim();
  if (!searchTerm) return message.channel.send("```🐺 ẳng ẳng ẳng!```");

  const foundKey = Object.keys(runewords).find(
    key => key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    return message.channel.send(`\`\`\`\n🐺 ẳng ẳng ẳng!"${searchTerm}"\n\`\`\``);
  }

  const items = Array.isArray(runewords[foundKey]) ? runewords[foundKey] : [runewords[foundKey]];

  for (const rw of items) {
    const formattedText = `
    \`\`\`
    \nTên: ${rw.name || foundKey}
    \nLoại: ${rw.types?.join(", ") || "N/A"}
    \nYêu cầu cấp độ: ${rw.level || "N/A"}
    ${rw.option?.map(opt => `\n${opt}`).join("") || "N/A"}
    \`\`\``.trim();
    await message.channel.send(formattedText);
  }
}

async function handleWiki(message) {
  const searchTerm = message.content.slice(5).trim();
  if (!searchTerm) return message.channel.send("```🐺 ẳng ẳng ẳng!```");

  const foundKey = Object.keys(wiki).find(
    key => key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    return message.channel.send(`\`\`\`\n🐺 ẳng ẳng ẳng!"${searchTerm}"\n\`\`\``);
  }

  const items = Array.isArray(wiki[foundKey]) ? wiki[foundKey] : [wiki[foundKey]];
  const combinedContent = items.map(w => w.text || foundKey).join("");

  if (combinedContent.length <= 2000) {
    await message.channel.send(combinedContent);
  } else {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(combinedContent);
    await message.channel.send({ embeds: [embed] });
  }
}

async function handleCraft(message) {
  const searchTerm = message.content.slice(6).trim();
  if (!searchTerm) return message.channel.send("```🐺 ẳng ẳng ẳng!```");

  const foundKey = Object.keys(crafts).find(
    key => key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    return message.channel.send(`\`\`\`\n🐺 ẳng ẳng ẳng! "${searchTerm}"\n\`\`\``);
  }

  const items = Array.isArray(crafts[foundKey]) ? crafts[foundKey] : [crafts[foundKey]];
  let combinedContent = `\`\`\`\nCraft ${searchTerm}\n`;

  items.forEach(craft => {
    combinedContent += `\n------- ${craft.type || foundKey} -------`;
    combinedContent += `\n\nCông thức: ${craft.name}\n`;
    combinedContent += `\n${craft.option?.map(opt => `${opt}`).join("\n") || "N/A"}\n`;
  });

  await message.channel.send(combinedContent + "\n```");
}

async function handleSearch(message) {
  const searchType = message.content.slice(7).trim().toLowerCase();
  if (!searchType) {
    return message.channel.send("```🐺 Vui lòng nhập loại runeword cần tìm (vd: !search armor)```");
  }

  const matchedRunewords = new Map();
  
  Object.entries(runewords).forEach(([name, data]) => {
    const items = Array.isArray(data) ? data : [data];
    items.forEach(rw => {
      // Thay đổi tại đây - chỉ kiểm tra CHÍNH XÁC từ khóa
      if (rw.types?.some(t => t.toLowerCase().split(/\s*,\s*/).includes(searchType))) {
        const key = rw.name?.toLowerCase() || name.toLowerCase();
        if (!matchedRunewords.has(key)) {
          matchedRunewords.set(key, {
            name: rw.name || name,
            types: [...new Set(rw.types)],
            variants: []
          });
        }
        matchedRunewords.get(key).variants.push({
          level: rw.level,
          option: rw.option
        });
      }
    });
  });

  if (matchedRunewords.size === 0) {
    return message.channel.send(
      `\`\`\`\n🐺 Không tìm thấy runeword nào thuộc loại "${searchType}"\`\`\``
    );
  }

  const resultText = `\`\`\`\nRunewords thuộc loại "${searchType}" (${matchedRunewords.size} kết quả):\n\n` +
    Array.from(matchedRunewords.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((rw, i) => `${i + 1}. ${rw.name}`)
      .join("\n") + "\n```";
  
  await message.channel.send(resultText);
}

async function handleCritChance(message) {
  const args = message.content.split(' ').slice(1);
  if (args.length !== 3) {
    return message.reply('Sử dụng: !chance <DS%> <CS%> <WM%> (ví dụ: !chance 20 30 25)\nDS: Deadly Strike\nCS: Critical Strike\nWM: Weapon Mastery');
  }

  const [ds, cs, wm] = args.map(Number);
  if (args.some(isNaN) || ds < 0 || cs < 0 || wm < 0 || cs > 75 || wm > 75) {
    return message.reply('Giá trị phải từ 0% đến 75%! (DS có thể 100% nếu mang đồ tăng max DS)');
  }

  const totalCritChance = 1 - ((1 - ds/100) * (1 - cs/100) * (1 - wm/100));
  message.reply(`Tổng Crit Chance: ${(totalCritChance * 100).toFixed(2)}% (Giới hạn: 95%)`);
}

// client.on('messageCreate', async (message) => {
//   if (message.content.startsWith('!pd2info')) {
//     const args = message.content.split(' ');
//     if (args.length < 3) {
//       return message.reply('Vui lòng nhập đúng cú pháp: `!pdlbinfo <softcore/hardcore> <tên nhân vật>`');
//     }

//     const gameMode = args[1].toLowerCase();
//     const charName = args.slice(2).join(' ');

//     if (!['softcore', 'hardcore'].includes(gameMode)) {
//       return message.reply('Chế độ game phải là `softcore` hoặc `hardcore`');
//     }

//     try {
//       const apiUrl = `https://api.costcosaletracker.com/api/character?gameMode=${gameMode}&name=${encodeURIComponent(charName)}`;
//       const response = await axios.get(apiUrl);
      
//       // Lấy riêng phần lbinfo
//       const info = response.data.lbInfo || {};
      
//       const status = response.data.status || {};
//       const ladder = status.is_ladder ? "Non-Ladder" : "Ladder";

//       // Format thông tin quan trọng
//       const embed = {
//         title: `${ladder} - ${info.name}`,
//         fields: [
//           { name: 'Class', value: info.class || 'N/A', inline: true },
//           { name: 'Level', value: info.level?.toString() || 'N/A', inline: true },
//           { name: 'Rank', value: info.rank?.toString() || 'N/A', inline: true }
//         ],
//         footer: { text: `Chế độ: ${gameMode}` },
//       };

//       message.channel.send({ embeds: [embed] });

//     } catch (error) {
//       console.error('Lỗi API:', error);
//       message.channel.send('Không thể lấy thông tin ladder. Vui lòng thử lại sau!');
//     }
//   }
// });

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  // Kiểm tra nếu kênh không nằm trong danh sách allowedChannels thì bỏ qua
  if (config.allowedChannels_show && !config.allowedChannels_show.includes(message.channel.id)) {
    return;
  }
  
  // Kiểm tra nếu người dùng có role được phép thì bỏ qua
  if (config.allowedRoles && message.member.roles.cache.some(role => config.allowedRoles.includes(role.id))) {
    return;
  }

  const hasImage = message.attachments.size > 0 && 
    message.attachments.some(attach => 
      config.imageExtensions.some(ext => attach.name.toLowerCase().endsWith(ext))
    );

  const hasImageEmbed = message.embeds.some(embed => embed.image || embed.thumbnail);

  if (!hasImage && !hasImageEmbed) {
    try {
      await message.delete();
      setTimeout(() => warning.delete().catch(console.error), 5000);
    } catch (error) {
      console.error('Lỗi xử lý tin nhắn:', error);
    }
  }

});

client.on('messageCreate', async (message) => {
  // Bỏ qua nếu là bot hoặc không phải kênh bot
  if (message.author.bot || config.allowedChannels_spam && !config.allowedChannels_spam.includes(message.channel.id)) return;

  // Kiểm tra có được bỏ qua không
  if (hasBypassPermission(message.member)) return;

  // Kiểm tra lệnh hợp lệ
  if (isValidCommand(message.content)) {
    return handleCommand(message); // Xử lý lệnh
  }

  // Xóa tin nhắn không phải lệnh
  try {
    await message.delete();
    await sendWarning(message);
  } catch (error) {
    console.error('Lỗi xử lý tin nhắn:', error);
  }
});

// --- Các hàm hỗ trợ --- //

// Kiểm tra quyền bỏ qua bằng ROLE ID
function hasBypassPermission(member) {
  if (!member) return false;
  return config.allowedRoles.some(id => member.roles.cache.has(id));
}

// Kiểm tra lệnh hợp lệ với regex
function isValidCommand(content) {
  const pattern = new RegExp(
    `^${config.prefix}(${config.allowedCommand.join('|')})(\\s|$|\\?)`,
    'i'
  );
  return pattern.test(content);
}

// Xử lý lệnh có tham số
function handleCommand(message) {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const params = args;
}

// Gửi cảnh báo tự xóa
async function sendWarning(message) {
  const warning = await message.channel.send({
    content: `${message.author}, chỉ được dùng lệnh trong kênh này!\n` +
             `Lệnh hợp lệ: ${config.allowedCommand.map(c => `${config.prefix}${c}`).join(', ')}`,
    allowedMentions: { users: [message.author.id] }
  });

  setTimeout(() => warning.delete().catch(() => {}), 10000);
}


// Luôn ưu tiên dùng process.env
const token = process.env.DISCORD_TOKEN || "";

client.login(token).catch(console.error);
