require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require("discord.js");
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

// Cấu hình tin nhắn tự động
const AUTO_MESSAGE_INTERVAL = 24 * 60 * 60 * 1000; // 6 giờ (đổi thành mili giây)

// Tin nhắn hướng dẫn
const HELP_MESSAGE = "```** Tin nhắn tự động!!! ẳng ẳng ẳng!!! - Hướng dẫn sử dụng lệnh **\n!rw <tên runeword> - Tra cứu Runewords (Vd: !rw enigma)\n!craft <tên công thức> - Tra cứu Crafting (Vd: !craft blood, safety, hitpower, caster, vampiric, bountiful, brilliant)\n!wiki <tên công thức> - Tra cứu Wiki PD2 (Vd: !wiki crafting, ar, itd, ias, bp, affix, cs, ow, cb)\n!hotkey các phím tắt trong game\n!search tìm kiếm rw theo types(loại) vd: !search armor\n!help Gõ lệnh để xem chi tiết!```";

const STACK_MESSAGE = "```1. Khi cầm nguyên Stack (2+ vật phẩm trở lên):\n     Giữ chuột trái trên stack để di chuyển cả chồng stack đó.\n     Ctrl + Shift + Click vào ô trống: Tách ra 1 vật phẩm (vật phẩm này sẽ không stack nghĩa là không có dấu + trên vật phẩm, nếu là rune và gem thì có thể ép vào đồ).\n     Ctrl + Click vào ô trống: Tách ra 1 vật phẩm (vẫn giữ stack có dấu +, có thể gộp lại sau, nếu là rune và gem thì không thể ép vào đồ).\n\n2. Khi chỉ có 1 vật phẩm stack(hiển thị dấu +):\n     Thao tác như trên hoặc\n     Ctrl + Shift + Click: Chuyển đổi chế độ stack/không stack.\n\n     Shift + Left Click: Identify item\n     Shift + Right Click: Di chuyển giữa các thùng đồ(inventory <-> stash <-> cube)\n     Ctrl + Right Click: ném xuống đất\n     Ctrl + Shift + Right Click: Di chuyển vào cube(cube không được mở nếu không sẽ ném xuống đất)\n3. Khi cộng điểm skill hoặc stat:\n     Ctrl + Left Click: 5 điểm\n     Shift + Left Click: 20 điểm\n     Ctrl + Shift + Left Click: All```" + "https://imgur.com/wSctL3q";


client.on("ready", () => {
  console.log(`Bot đã sẵn sàng: ${client.user.tag}`);

  // Thiết lập lặp lại mỗi X giờ
  setInterval(sendAutoMessage, AUTO_MESSAGE_INTERVAL);
});


async function sendAutoMessage() {
  try {
    for (const guild of client.guilds.cache.values()) {
      // Đảm bảo guild.me (bot) đã được cache
      if (!guild.members.me) continue;

      for (const channel of guild.channels.cache.values()) {
        // Kiểm tra loại kênh và quyền
        if (
          channel.type === ChannelType.GuildText &&
          channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
        ) {
          try {
            await channel.send(HELP_MESSAGE);
            console.log(`Đã gửi đến #${channel.name} (${guild.name})`);
          } catch (err) {
            console.error(`Lỗi khi gửi đến #${channel.name}: ${err.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Lỗi nghiêm trọng:', error);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Kiểm tra nếu kênh không nằm trong danh sách allowedChannels thì bỏ qua
  if (config.allowedChannels_spam && !config.allowedChannels_spam.includes(message.channel.id)) {
    return;
  }
  
  // Kiểm tra nếu người dùng có role được phép thì bỏ qua
  if (config.allowedRoles && message.member.roles.cache.some(role => config.allowedRoles.includes(role.id))) {
    return;
  }


  if (message.content.toLowerCase() === "!help") {
    await message.channel.send(HELP_MESSAGE);
  }
  if (message.content.toLowerCase() === "!hotkey") {
    await message.channel.send(STACK_MESSAGE);
  }


  // runeword
  const prefixrw = "!rw";
  if(message.content.toLowerCase().startsWith(prefixrw)){
    const searchTerm = message.content.slice(prefixrw.length).trim();
    if (!searchTerm) {
      return message.channel.send("```🐺 ẳng ẳng ẳng!```");
    }
    const foundKey = Object.keys(runewords).find(
      (key) => key.toLowerCase() === searchTerm.toLowerCase(),
    );
  
    if (!foundKey) {
      return message.channel.send(
        `\`\`\`\n🐺 ẳng ẳng ẳng!"${searchTerm}"\n\`\`\``,
      );
    }
    const item = runewords[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];

  try {
    // Gửi từng embed cho mỗi phiên bản
    for (const rw of itemsToDisplay) {
      const formattedText = `
      \`\`\`
      \nTên: ${rw.name || foundKey}
      \nLoại: ${rw.types?.join(", ") || "N/A"}
      \nYêu cầu cấp độ: ${rw.level || "N/A"}
      ${rw.option?.map((opt) => `\n${opt}`).join("") || "N/A"}
      \`\`\``.trim();
      await message.channel.send(formattedText);
    }
  } catch (error) {
    console.error("Lỗi khi gửi embed:", error);
    message.channel.send("```🐺 ẳng ẳng ẳng!``");
  }
  }
// wiki
  const prefixwiki = "!wiki";
  if (message.content.toLowerCase().startsWith(prefixwiki)){

  const searchTerm = message.content.slice(prefixwiki.length).trim();

  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.channel.send("```🐺 ẳng ẳng ẳng!```");
  }

  // Tìm kiếm không phân biệt hoa thường
  const foundKey = Object.keys(wiki).find(
    (key) => key.toLowerCase() === searchTerm.toLowerCase(),
  );

  if (!foundKey) {
    return message.channel.send(
      `\`\`\`\n🐺 ẳng ẳng ẳng!"${searchTerm}"\n\`\`\``,
    );
  }

  const item = wiki[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];

  let combinedContent = "";

  itemsToDisplay.forEach((wiki, index) => {
    combinedContent += `${wiki.text || foundKey}`;
  });



  await message.channel.send(combinedContent);
}
  // craft

  const prefixcraft = "!craft";
  if (message.content.toLowerCase().startsWith(prefixcraft)){ 

  const searchTerm = message.content.slice(prefixcraft.length).trim();

  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.channel.send("```🐺 ẳng ẳng ẳng!```");
  }

  // Tìm kiếm không phân biệt hoa thường
  const foundKey = Object.keys(crafts).find(
    (key) => key.toLowerCase() === searchTerm.toLowerCase(),
  );

  if (!foundKey) {
    return message.channel.send(
      `\`\`\`\n🐺 ẳng ẳng ẳng! "${searchTerm}"\n\`\`\``,
    );
  }

  const item = crafts[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];



  let combinedContent = `\`\`\`\nCraft ${searchTerm}\n`;

  itemsToDisplay.forEach((craft, index) => {
    combinedContent += `\n------- ${craft.type || foundKey} -------`;
    combinedContent += `\n\nCông thức: ${craft.name}\n`;
    combinedContent += `\n${craft.option?.map((opt) => `${opt}`).join("\n") || "N/A"}\n`;
  });

  combinedContent += "\n```";

  // Gửi một lần duy nhất
  await message.channel.send(combinedContent);
}

  ///// search runeword
  const prefixSearch = "!search";
if (message.content.toLowerCase().startsWith(prefixSearch)) {
    const searchType = message.content.slice(prefixSearch.length).trim().toLowerCase();
    
    if (!searchType) {
        return message.channel.send("```🐺 Vui lòng nhập loại runeword cần tìm (vd: !search armor)```");
    }

    // Tìm tất cả runewords thuộc loại được chỉ định
    const matchedRunewords = new Map();
    
    Object.entries(runewords).forEach(([name, data]) => {
      const items = Array.isArray(data) ? data : [data];
      items.forEach(rw => {
          if (rw.types && rw.types.some(t => t.toLowerCase().includes(searchType))) {
            const key = rw.name?.toLowerCase() || name.toLowerCase();
              // Gộp các phiên bản trùng tên, chỉ giữ lại 1 entry
              if (!matchedRunewords.has(key)) {
                  matchedRunewords.set(key, {
                      name: rw.name || name,
                      types: [...new Set(rw.types)],
                      variants:[]
                  });
              }
              matchedRunewords.get(key).variants.push({
                level:rw.level,
                option:rw.option
              });
          }
      });
    });

    if (matchedRunewords.length === 0) {
        return message.channel.send(`\`\`\`\n🐺 Không tìm thấy runeword nào thuộc loại "${searchType}"\n\`\`\``);
    } 
    const uniqueRunewords = Array.from(matchedRunewords.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Format kết quả
    let resultText = `\`\`\`\nRunewords thuộc loại "${searchType}" (${uniqueRunewords.length} kết quả):\n\n`;
    
    uniqueRunewords.forEach((rw, index) => {
        resultText += `${index + 1}. ${rw.name}\n`;
        resultText += "\n";
    });

    resultText += "```";
    await message.channel.send(resultText);
}
});

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



// Luôn ưu tiên dùng process.env
const token = process.env.DISCORD_TOKEN || "";

client.login(token).catch(console.error);
