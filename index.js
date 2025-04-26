require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require("discord.js");
const runewords = require("./runeword.json"); // File JSON của bạn
const crafts = require("./craft.json"); // File JSON của bạn
const wiki = require("./wiki.json");
const express = require("express");

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
  ],
});

// Cấu hình tin nhắn tự động
const AUTO_MESSAGE_INTERVAL = 6 * 60 * 60 * 1000; // 6 giờ (đổi thành mili giây)

// Tin nhắn hướng dẫn
const HELP_MESSAGE = "```** Tin nhắn tự động!!! ẳng ẳng ẳng!!! - Hướng dẫn sử dụng lệnh **\n!rw <tên runeword> - Tra cứu Runewords (Vd: !rw enigma)\n!craft <tên công thức> - Tra cứu Crafting (Vd: !craft blood, safety, hitpower, caster, vampiric, bountiful, brilliant)\n!wiki <tên công thức> - Tra cứu Wiki PD2 (Vd: !wiki crafting, ar, itd, ias, bp, affix, cs, ow, cb)\n!hotkey các phím tắt trong game\nwss thông tin về corrupt item\n!help Gõ lệnh để xem chi tiết!```";

const STACK_MESSAGE = "```1. Khi cầm nguyên Stack (2+ vật phẩm trở lên):\n     Giữ chuột trái trên stack để di chuyển cả chồng stack đó.\n     Ctrl + Shift + Click vào ô trống: Tách ra 1 vật phẩm (vật phẩm này sẽ không stack nghĩa là không có dấu + trên vật phẩm, nếu là rune và gem thì có thể ép vào đồ).\n     Ctrl + Click vào ô trống: Tách ra 1 vật phẩm (vẫn giữ stack có dấu +, có thể gộp lại sau, nếu là rune và gem thì không thể ép vào đồ).\n\n2. Khi chỉ có 1 vật phẩm stack(hiển thị dấu +):\n     Thao tác như trên hoặc\n     Ctrl + Shift + Click: Chuyển đổi chế độ stack/không stack.\n\n     Shift + Left Click: Identify item\n     Shift + Right Click: Di chuyển giữa các thùng đồ(inventory <-> stash <-> cube)\n     Ctrl + Right Click: ném xuống đất\n     Ctrl + Shift + Right Click: Di chuyển vào cube(cube không được mở nếu không sẽ ném xuống đất)\n3. Khi cộng điểm skill hoặc stat:\n     Ctrl + Left Click: 5 điểm\n     Shift + Left Click: 20 điểm\n     Ctrl + Shift + Left Click: All```" + "https://imgur.com/wSctL3q";

const WSS = "```1. Worldstone Shard (wss) là một vật phẩm mới có thể rơi ở bất kỳ đâu trong game. Wss dùng để làm biến đổi (Corrupted) trang bị:\n     - Thêm socket (nếu trang bị có thể có socket)\n     - Nhận mod đặc biệt (tăng thêm chỉ số ngẫu nhiên)\n     - Brick (trang bị có thể biến thành đồ rare ngẫu nhiên\n\n2. Corrupt trang bị (hay còn gọi là slam)\nA. Normal Item (không phải unique,set,runeword,magic,rare) không có socket :\n     - 50% thêm socket (số socket từ 1 đến tối đa theo từng loại trang bị)\n     - 50% biến thành đồ rare(brick)\nB Unique,Set,Rare,Magic Item:\n Nếu trang bị có thể thêm socket:\n     - 25% thêm socket (số lượng socket ngẫu nhiên, có thể 1 hoặc tối đa theo từng loại trang bị)\n     - 50% nhận thêm thuộc tính đặc biệt(có 3 loại thuộc tính là thấp, trung, cao)\n     - 25% biến thành đồ rare(brick)\n Nếu không thể thêm socket (vd: ring,amulet,gloves,belt,boots,throw,javelin...):\n     - 75% nhận option\n     - 25% thành rare\n\n3. Tỷ lệ số Socket khi slam thành công - tỷ lệ%(socket):\n     - Armor(Helm/Armor/Shield): 48%(1), 28%(2), 24%(3)\n     - Vũ khí 1 tay: 48%(2), 28%(3), 24%(4)\n     - Vũ khí 2 tay: 30%(3), 28%(4), 24%(5), 18%(6)```";

client.on("ready", () => {
  console.log(`✅ Bot đã sẵn sàng: ${client.user.tag}`);

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
            console.log(`✅ Đã gửi đến #${channel.name} (${guild.name})`);
          } catch (err) {
            console.error(`❌ Lỗi khi gửi đến #${channel.name}: ${err.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Lỗi nghiêm trọng:', error);
  }
}

client.on("messageCreate", async (message) => {
  if (message.content.toLowerCase() === "!help") {
    await message.channel.send(HELP_MESSAGE);
  }
  if (message.content.toLowerCase() === "!hotkey") {
    await message.channel.send(STACK_MESSAGE);
  }
   if (message.content.toLowerCase() === "!wss") {
    await message.channel.send(WSS);
  }
});

 //runeword
client.on("messageCreate", async (message) => {
  const prefix = "!rw";
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const searchTerm = message.content.slice(prefix.length).trim();

  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.channel.send("```🐺 ẳng ẳng ẳng!```");
  }

  // Tìm kiếm không phân biệt hoa thường
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
});
// wiki
client.on("messageCreate", async (message) => {
	const prefix = "!wiki";
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const searchTerm = message.content.slice(prefix.length).trim();

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

  try {
    // Gửi từng embed cho mỗi phiên bản
    for (const wiki of itemsToDisplay) {
      const formattedText = `\n${wiki.text}`.trim();
      await message.channel.send(formattedText);
    }
  } catch (error) {
    console.error("Lỗi khi gửi embed:", error);
    message.channel.send("```🐺 ẳng ẳng ẳng!``");
  }
});

client.on("messageCreate", async (message) => {
	const prefix = "!craft";
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const searchTerm = message.content.slice(prefix.length).trim();

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
});

// Luôn ưu tiên dùng process.env
const token = process.env.DISCORD_TOKEN || "";

client.login(token).catch(console.error);
