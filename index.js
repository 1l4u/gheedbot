require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const runewords = require("./runeword.json"); // File JSON của bạn
const crafts = require("./craft.json"); // File JSON của bạn

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Bot đã sẵn sàng: ${client.user.tag} ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.toLowerCase().startsWith("!rw")) return;

  const searchTerm = message.content.slice(4).trim();

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
client.on("messageCreate", async (message) => {
  if (message.content.toLowerCase() === "!crafting")
    return message.channel.send(
      "```Craft item sẽ nhận được các affix cố định(đọc trên wiki) cùng với tối đa 4 affix bổ sung.\nCác affix có thể nhận được phụ thuộc vào affix level(alvl), vốn phụ thuộc vào item level(ilvl). ilvl của vật phẩm craft được xác định bằng character level(clvl) và ilvl của phôi.\n- craft ilvl = clvl/2 + ilvl/2 (giá trị được làm tròn xuống)\n\nSố lượng affix bổ sung phụ thuộc vào ilvl:\n- ilvl 1-30 : 4 affix (20%), 3 affix (20%), 2 affix (20%), 1 affix (40%)\n- ilvl 31-50 : 4 affix (20%), 3 affix (20%), 2 affix (60%)\n- ilvl 51-70 : 4 affix (20%), 3 affix (80%)\n- ilvl 71+ : 4 affix (100%)\n+ Lưu ý rằng shop bán magic item(đồ xanh/blue) có ilvl = clvl+5, còn gamble có ilvl trong khoảng clvl-5 -> clvl+4. Ví dụ khi một nhân vật level 86 gamble amulet thì có thể nhận được một cái amulet có ilvl 90 và khi sử dụng amulet này để craft thì có cơ hội nhận được option +2 class skill(đây là một affix bổ sung). ilvl90 là tối tiểu để nhận được option trên```",
    );
});

client.on("messageCreate", async (message) => {
  if (!message.content.toLowerCase().startsWith("!ct")) return;

  const searchTerm = message.content.slice(4).trim();

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

  //try {
  // Gửi từng embed cho mỗi phiên bản
  // for (const craft of itemsToDisplay) {
  //    const formattedText = `
  //   \`\`\`
  //   \n${searchTerm} ${craft.type || foundKey}
  //   \nCông thức: ${craft.name}
  //   ${craft.option?.map((opt) => `\n${opt}`).join("") || "N/A"}
  //   \`\`\``.trim();
  //   await message.channel.send(formattedText);
  // }
  // } catch (error) {
  //  console.error("Lỗi khi gửi embed:", error);
  //  message.channel.send("```🐺 ẳng ẳng ẳng!``");

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


const express = require('express');
const app = express();
const PORT = 3000;

// Khởi tạo web server
app.get('/', (req, res) => {
  res.send('🤖 Ẳng ẳng ẳng!');
});

app.listen(PORT, () => {
  console.log(`server chạy trên port ${PORT}`);
});

// Ping định kỳ mỗi 5 phút
setInterval(() => {
  fetch(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`)
    .then(() => console.log('Ping thành công!'))
    .catch(err => console.error('Lỗi ping:', err));
}, 5 * 60 * 1000);




// Luôn ưu tiên dùng process.env
const token = process.env.DISCORD_TOKEN || ""; // Không đọc từ file .env

client.login(token).catch(console.error);
