require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const runewords = require("./runeword.json"); // File JSON của bạn
const crafts = require("./craft.json"); // File JSON của bạn
const wiki = require("./wiki.json");
const express = require("express");
const axios = require('axios');
const config = require('./config.json');
const fs = require('fs');
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
const hotkey = "```1. Khi cầm nguyên Stack (2+ vật phẩm trở lên):\n     Giữ chuột trái trên stack để di chuyển cả chồng stack đó.\n     Ctrl + Shift + Click vào ô trống: Tách ra 1 vật phẩm (vật phẩm này sẽ không stack nghĩa là không có dấu + trên vật phẩm, nếu là rune và gem thì có thể ép vào đồ).\n     Ctrl + Click vào ô trống: Tách ra 1 vật phẩm (vẫn giữ stack có dấu +, có thể gộp lại sau, nếu là rune và gem thì không thể ép vào đồ).\n\n2. Khi chỉ có 1 vật phẩm stack(hiển thị dấu +):\nThao tác như trên hoặc\n     Ctrl + Shift + Click: Chuyển đổi chế độ stack/không stack.\n     Shift + Left Click: Identify item\n     Shift + Right Click: Di chuyển giữa các thùng đồ(inventory <-> stash <-> cube)\n     Ctrl + Right Click: ném xuống đất\n     Ctrl + Shift + Right Click: Di chuyển vào cube(cube không được mở nếu không sẽ ném xuống đất)\n\n3. Khi cộng điểm skill hoặc stat:\n     Ctrl + Left Click: 5 điểm\n     Shift + Left Click: 20 điểm\n     Ctrl + Shift + Left Click: All\n\n4. Currency Stash: Khi bạn đặt các vật phẩm vào stash, chúng sẽ tự động chuyển vào Currency Stash, cho phép xếp chồng Rejuv.\n     Left Click: Lấy 1 vật phẩm lên chuột\n     Right Click: Lấy một vật phẩm vào inventory\n     Ctrl + (Left / Right Click): Lấy 5 vật phẩm (chuột / inventory)\n     Shift + (Left / Right Click): Lấy 20 vật phẩm (chuột / inventory)\n     Ctrl + Shift + (Left / Right Click): Lấy 50 vật phẩm (chuột / inventory)```"

const hardcore = "*Hardcore không phải là một lối chơi, mà là một cách sống... rất ngắn.*" + "\n*Chơi Hardcore không phải để chứng tỏ bạn giỏi, mà để chứng tỏ bạn… chịu đựng giỏi.*"

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const commands = {
    '!rw': handleRuneword,
    '!wiki': handleWiki,
    '!search': handleSearch,
    '!chance': handleCritChance,
    '!tas': handleTas,
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

  if (message.content.toLowerCase() === "!hotkey") 
    return message.channel.send(hotkey);

  if (message.content.toLowerCase() === "!hardcore") 
    return message.reply(hardcore);

  const data = JSON.parse(fs.readFileSync('wiki.json', 'utf8'));

  if (message.content === '!list') {
    // Lấy tất cả các key từ object chính
    const keysList = Object.keys(data)
      .map((key, index) => `${index + 1}. ${key}`)
      .join('\n');
    
    message.channel.send(`\`\`\`${keysList}\`\`\``);
  };

});

// Các hàm xử lý lệnh

async function handleTas(message) {
  const args = message.content.split(' ').slice(1);

  // Kiểm tra số lượng tham số
  if (args.length !== 3) {
    return await message.reply({
      content: '**Sai cú pháp!** Sử dụng: `!tas <IAS> <Skill_IAS> <WSM>`\n' +
               'Ví dụ: `!tas 50 20 -10`',
      allowedMentions: { repliedUser: true }
    });
  }

  // Chuyển đổi và kiểm tra giá trị số
  const [ias, skillIas, wsm] = args.map(Number);
  if (args.some(val => isNaN(val))) {
    return await message.reply({
      content: '**Giá trị phải là số!** Ví dụ: `!tas 50 20 -10`',
      allowedMentions: { repliedUser: true }
    });
  }

  // Tính toán
  const eias = Math.floor((120 * ias) / (120 + ias));
  const tas = eias + skillIas - wsm;

  // Tạo embed kết quả
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .addFields(
      { name: 'EIAS - Effective Item IAS', value: `${eias}%`, inline: false },
      { name: 'TAS -  Total Attack Speed', value: `${tas}%`, inline: false },
      { name: '', value: `- TAS = EIAS + Skill_IAS - WSM` },
      { name: '',  value: `- EIAS = (120 * IAS) / (120 + IAS)`}
    )
    .setFooter({ text: `Yêu cầu bởi ${message.author.username}` });

  await message.reply({ embeds: [embed] });
}

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


  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setDescription(combinedContent);
  await message.channel.send({ embeds: [embed] });

  // if (combinedContent.length <= 2000) {
  //   await message.channel.send(combinedContent);
  // } else {
  //   const embed = new EmbedBuilder()
  //     .setColor('#0099ff')
  //     .setDescription(combinedContent);
  //   await message.channel.send({ embeds: [embed] });
  // }
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
    // Bỏ qua nếu là bot
    if (message.author.bot) return;

    // Kiểm tra kênh được phép (nếu có cấu hình)
    if (config.allowedChannels_spam && config.allowedChannels_spam.length > 0) {
      if (!config.allowedChannels_spam.includes(message.channel.id)) {
        return; // Bỏ qua nếu không phải kênh được phép
      }
    }
  
    // Kiểm tra có được bỏ qua không
    if (hasBypassPermission(message.member)) {
      return;
    }

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
