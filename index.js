require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { REST } = require('@discordjs/rest');
const runewords = require("./runeword.json");
const wiki = require("./wiki.json");
const express = require("express");
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

// Đăng ký Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('rw')
    .setDescription('Tìm kiếm runeword')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Tên runeword cần tìm')
        .setRequired(true)
        .setAutocomplete(true)),
  new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Tìm kiếm thông tin wiki')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Từ khóa cần tìm (nhấn nút để xem danh sách)')
        .setRequired(true)
        .setAutocomplete(true)),
  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Tìm runeword theo loại')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Loại runeword (armors, weapons, etc)')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('chance')
    .setDescription('Tính tổng crit chance')
    .addIntegerOption(option =>
      option.setName('ds')
        .setDescription('Deadly Strike %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('cs')
        .setDescription('Critical Strike %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('wm')
        .setDescription('Weapon Mastery %')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('tas')
    .setDescription('Tính Total Attack Speed')
    .addIntegerOption(option =>
      option.setName('ias')
        .setDescription('IAS %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('skill_ias')
        .setDescription('Skill IAS %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('wsm')
        .setDescription('Weapon Speed Modifier')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('ias')
    .setDescription('Tính IAS cần thiết')
    .addIntegerOption(option =>
      option.setName('tas')
        .setDescription('TAS %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('skill_ias')
        .setDescription('Skill IAS %')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('wsm')
        .setDescription('Weapon Speed Modifier')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('hotkey')
    .setDescription('Hiển thị các phím tắt trong game'),
  new SlashCommandBuilder()
    .setName('hardcore')
    .setDescription('Hiển thị câu nói vui về Hardcore'),
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('Liệt kê tất cả các mục trong wiki'),
    new SlashCommandBuilder()
    .setName('botsetup')
    .setDescription('Đại Hoàng Interface'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Đang đăng ký slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Đăng ký slash commands thành công!');
  } catch (error) {
    console.error('Lỗi khi đăng ký slash commands:', error);
  }
})();

// Xử lý Slash Commands
client.on('interactionCreate', async interaction => {
    const { commandName, options } = interaction;
// Xử lý tương tác autocomplete
if (interaction.isAutocomplete()) {
  const dataSource = autocompleteSources[interaction.commandName];

  if (dataSource) {
    try {
      await handleAutocomplete(interaction, dataSource);
    } catch (err) {
      console.error(`Lỗi xử lý lệnh ${interaction.commandName}:`, err);
      if (interaction.deferred) {
        await interaction.editReply({ content: '```🐺 Đã xảy ra lỗi!```' });
      }
    }
  }
}

  if (interaction.isButton()) {
    try{
      switch (interaction.customId) {
        // Các nút từ giao diện wiki
        case 'wiki':
          //await handleSlashList(interaction);
          break;
        case 'list':
          //await handleSlashList(interaction);
          break;
        case 'runeword':
          //await handleRunewordButton(interaction);
          break;
        case 'search':
          //await handleSlashSearch(interaction);
          break;
        case 'tas':
          //await handleSlashTas(interaction);
          break;
        case 'ias':
          //await handleSlashIas(interaction);
          break;
        case 'chance':
          //await handleSlashCritChance(interaction);
          break;
        case 'hotkey':
          //await interaction.editReply({content: getHotkeyText(),flags: 1 << 6});
        case 'show_wiki_list':
          //await handleButtonList(interaction);
          break;
        case 'show_rw_list':
          //await handleRunewordList(interaction);
          break;
        default:
        await interaction.reply({
          content: 'Lệnh không được hỗ trợ',
          flags: 1 << 6
        });
      }
  }catch (error) {
      console.error('Lỗi xử lý button:', error);
      if (!interaction.replied) {
        await interaction.followUp({
          content: 'Đã xảy ra lỗi khi xử lý yêu cầu',
          ephemeral: true
        });
      }
    }
    return;
  }

  if (interaction.isCommand()){
  try {
    switch (commandName) {
      case 'rw':
        await handleSlashRuneword(interaction);
        break;
      case 'wiki':
        await handleSlashWiki(interaction);
        break;
      case 'search':
        await handleSlashSearch(interaction);
        break;
      case 'chance':
        await handleSlashCritChance(interaction);
        break;
      case 'tas':
        await handleSlashTas(interaction);
        break;
      case 'ias':
        await handleSlashIas(interaction);
        break;
      case 'hotkey':
        await interaction.reply({
          content: getHotkeyText(),
          flags: 1 << 6
        });
        break;
      case 'hardcore':
        await interaction.reply({
          content: getHardcoreText(),
          flags: 1 << 6
        });
        break;
      case 'list':
        await handleSlashList(interaction);
        break;
        case 'botsetup':
        await handleSlashSetup(interaction);
        break;
      default:
        await interaction.reply({
          content: 'Lệnh không được hỗ trợ',
          flags: 1 << 6
        });
    }
	
  } catch (error) {
    console.error(`Lỗi khi xử lý lệnh ${commandName}:`, error);
    await interaction.reply({
      content: '```🐺 Đã xảy ra lỗi!```',
      flags: 1 << 6
    });
  }}
});


// Map các lệnh với dữ liệu tương ứng
const autocompleteSources = {
  wiki: wiki,
  rw: runewords,
  // thêm lệnh khác tại đây, ví dụ:
  // items: itemsData,
};

// Hàm xử lý autocomplete dùng chung
async function handleAutocomplete(interaction, dataObject) {
  const focusedValue = interaction.options.getFocused().toLowerCase();

  const filtered = Object.keys(dataObject)
    .filter(key => key.toLowerCase().includes(focusedValue))
    .slice(0, 25); // Discord giới hạn 25 lựa chọn

  await interaction.respond(
    filtered.map(key => ({ name: key, value: key }))
  );
}



// Các hàm xử lý Slash Command
async function handleSlashRuneword(interaction) {
  const searchTerm = interaction.options.getString('name');

  if (!searchTerm) {
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('show_rw_list')
          .setLabel('Xem toàn bộ danh sách')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: '**Hướng dẫn sử dụng**\n\n' +
               '1. Gõ trực tiếp tên mục bạn muốn tìm\n' +
               '2. Hoặc nhấn nút bên dưới để xem toàn bộ danh sách',
      components: [button],
      flags: 1 << 6,
      fetchReply: true
    });

    // Xử lý khi người dùng nhấn button
    const filter = i => i.customId === 'show_rw_list' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate(); // Ẩn "loading"
      await handleRunewordList(i);
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(console.error); // Xóa button sau 30s
    });

    return;
  }

  const foundKey = Object.keys(runewords).find(
    key => key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    // Gợi ý các runeword gần giống
    const similarKeys = Object.keys(runewords).filter(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    if (similarKeys.length > 0) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(`Không tìm thấy "${searchTerm}"`)
        .setDescription(`Có thể bạn đang tìm:\n${similarKeys.map(k => `- ${k}`).join('\n')}`);

      return interaction.reply({ embeds: [embed], flags : 1 << 6 });
    }

    return interaction.reply({
      content: `\`\`\`\n🐺 Không tìm thấy Runeword "${searchTerm}"\n\`\`\``,
      flags : 1 << 6
    });
  }

  const items = Array.isArray(runewords[foundKey]) ? runewords[foundKey] : [runewords[foundKey]];
  const embeds = [];

  for (const rw of items) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(rw.name || foundKey)
      .addFields(
        { name: ``, value: rw.types?.join(", ") || "N/A", inline: false },
        { name: ``, value: rw.level?.toString() || "N/A", inline: false }
      );

    if (rw.option) {
      embed.addFields(
        { name: '', value: rw.option.join("\n") }
      );
    }

    embeds.push(embed);
  }

  await interaction.reply({
    embeds: embeds,
    flags: 1 << 6
  });
}

async function handleSlashWiki(interaction) {
  const searchTerm = interaction.options.getString('name');
  
  // Trường hợp không nhập query
  if (!searchTerm) {
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('show_wiki_list')
          .setLabel('Xem toàn bộ danh sách')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: '**Hướng dẫn sử dụng**\n\n' +
               '1. Gõ trực tiếp tên mục bạn muốn tìm\n' +
               '2. Hoặc nhấn nút bên dưới để xem toàn bộ danh sách',
      components: [button],
      flags: 1 << 6,
      fetchReply: true
    });

    // Xử lý khi người dùng nhấn button
    const filter = i => i.customId === 'show_wiki_list' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate(); // Ẩn "loading"
      await handleSlashList(i);
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(console.error); // Xóa button sau 30s
    });

    return;
  }

  // Phần xử lý tìm kiếm wiki bình thường
  const foundKey = Object.keys(wiki).find(
    key => key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (!foundKey) {
    // Tìm các từ khóa gần đúng
    const similarKeys = Object.keys(wiki).filter(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Giới hạn 5 gợi ý

    if (similarKeys.length > 0) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(`Không tìm thấy "${searchTerm}"`)
        .setDescription(`Có thể bạn đang tìm kiếm:\n${similarKeys.map(k => `- ${k}`).join('\n')}\n\nNhấn nút bên dưới để xem toàn bộ danh sách`);

      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('show_wiki_list')
            .setLabel('Xem toàn bộ danh sách')
            .setStyle(ButtonStyle.Primary)
        );

      return await interaction.reply({
        embeds: [embed],
        components: [button],
        flags: 1 << 6
      });
    }

    return await interaction.reply({
      content: `\`\`\`\n🐺 Không tìm thấy "${searchTerm}"\nSử dụng /list để xem toàn bộ danh sách\`\`\``,
      flags: 1 << 6
    });
  }

  const items = Array.isArray(wiki[foundKey]) ? wiki[foundKey] : [wiki[foundKey]];
  const combinedContent = items.map(w => w.text || foundKey).join("");

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setDescription(combinedContent);

  await interaction.reply({
    embeds: [embed],
    flags: 1 << 6
  });
}

async function handleSlashSearch(interaction) {
  const searchType = interaction.options.getString('type').toLowerCase();
  const matchedRunewords = new Map();
  
  Object.entries(runewords).forEach(([name, data]) => {
    const items = Array.isArray(data) ? data : [data];
    items.forEach(rw => {
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
    return await interaction.reply({
      content: `\`\`\`\n🐺 Không tìm thấy runeword nào thuộc loại "${searchType}"\`\`\``,
      flags: 1 << 6
    });
  }

  const resultText = `\`\`\`\nRunewords thuộc loại "${searchType}" (${matchedRunewords.size} kết quả):\n\n` +
    Array.from(matchedRunewords.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((rw, i) => `${i + 1}. ${rw.name}`)
      .join("\n") + "\n```";
  
  await interaction.reply({
    content: resultText,
    flags: 1 << 6
  });
}

async function handleSlashCritChance(interaction) {
  const ds = interaction.options.getInteger('ds');
  const cs = interaction.options.getInteger('cs');
  const wm = interaction.options.getInteger('wm');

  if (ds < 0 || cs < 0 || wm < 0 || cs > 75 || wm > 75) {
    return await interaction.reply({
      content: 'Giá trị phải từ 0% đến 75%! (DS có thể 100% nếu mang đồ tăng max DS)',
      flags: 1 << 6
    });
  }

  const totalCritChance = 1 - ((1 - ds/100) * (1 - cs/100) * (1 - wm/100));
  await interaction.reply({
    content: `Tổng Crit Chance: ${(totalCritChance * 100).toFixed(2)}% (Giới hạn: 95%)`,
    flags: 1 << 6
  });
}

async function handleSlashTas(interaction) {
  const ias = interaction.options.getInteger('ias');
  const skillIas = interaction.options.getInteger('skill_ias');
  const wsm = interaction.options.getInteger('wsm');

  const eias = Math.floor((120 * ias) / (120 + ias));
  const tas = eias + skillIas - wsm;

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .addFields(
      { name: `TAS - ${tas}%`, value: '', inline: true },
      { name: `EIAS - ${eias}%`, value: '', inline: true },
      { name: 'Công thức', value: `- TAS = EIAS + Skill_IAS - WSM\n- EIAS = (120 * IAS) / (120 + IAS)` }
    )
    .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

  await interaction.reply({
    embeds: [embed],
    flags: 1 << 6
  });
}

async function handleSlashIas(interaction) {
  const tas = interaction.options.getInteger('tas');
  const skillIas = interaction.options.getInteger('skill_ias');
  const wsm = interaction.options.getInteger('wsm');

  const eias = tas - skillIas + wsm;
  const ias = (120 * eias) / (120 - eias);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .addFields(
      { name: 'IAS cần thiết', value: `${ias.toFixed(2)}%`, inline: true }
    )
    .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

  await interaction.reply({
    embeds: [embed],
    flags: 1 << 6
  });
}


async function handleSlashList(interaction) {
  const isButton = interaction.isButton();

  const allItems = Object.keys(wiki).sort();
  const chunkSize = 20;
  const totalPages = Math.ceil(allItems.length / chunkSize);

  // Hàm tạo embed cho từng trang
  const createListEmbed = (page) => {
    const startIdx = (page - 1) * chunkSize;
    const endIdx = startIdx + chunkSize;
    const items = allItems.slice(startIdx, endIdx);

    return new EmbedBuilder()
      .setTitle(`Danh sách Wiki (Trang ${page}/${totalPages})`)
      .setDescription(items.map((item, idx) => `**${startIdx + idx + 1}.** ${item}`).join('\n'))
      .setColor('#0099ff')
      .setFooter({ text: `Dùng "/wiki <tên mục>" để xem chi tiết` });
  };

  // Tạo action row với các nút phân trang
  const createActionRow = (currentPage) => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );
  };

  let currentPage = 1;
  const initialEmbed = createListEmbed(currentPage);
  const initialRow = createActionRow(currentPage);

  try {
    // Xử lý reply khác nhau cho button và slash command
    let message; // Khai báo biến message ở ngoài để có thể dùng chung
    if (isButton) {
      // Gửi dưới dạng followUp cho button interaction
      message = await interaction.followUp({
        embeds: [initialEmbed],
        components: [initialRow],
        flags: 1 << 6,
        fetchReply: true,
      });
    } else {
      // Gửi dưới dạng reply cho slash command
      message = await interaction.reply({
        embeds: [initialEmbed],
        components: [initialRow],
        flags: 1 << 6,
        fetchReply: true,
      });
    }

    // Tạo collector cho phân trang (đặt bên ngoài khối if...else)
    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'prev_page') currentPage--;
      if (i.customId === 'next_page') currentPage++;

      await i.deferUpdate();
      await i.editReply({
        embeds: [createListEmbed(currentPage)],
        components: [createActionRow(currentPage)],
      });
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(console.error);
    });
  } catch (error) {
    console.error('Lỗi khi xử lý handleSlashList:', error);
    if (isButton) {
      await interaction.followUp({
        content: 'Đã xảy ra lỗi khi tải danh sách',
        flags: 1 << 6,
      });
    } else {
      await interaction.reply({
        content: 'Đã xảy ra lỗi khi tải danh sách',
        flags: 1 << 6,
      });
    }
  }
}

async function handleSlashClear(interaction) {
  try {
    const member = interaction.member;
    const isAllowedUser = member.id === config.clear_member_id;

    if (!isAllowedUser) {
      return await interaction.editReply({
        content: ' Bạn không có quyền sử dụng lệnh này.',
        flags : 1 << 6
      });
    }

    await interaction.editReply({
      content: 'Đang xử lý xóa tin nhắn...',
      flags : 1 << 6
    });

    const channel = interaction.channel;
    let deletedCount = 0;
    let fetched;
    
    do {
      fetched = await channel.messages.fetch({ limit: 100 });
      const deletable = fetched.filter(msg => 
        Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
      );
      
      if (deletable.size > 0) {
        await channel.bulkDelete(deletable, true);
        deletedCount += deletable.size;
      }
    } while (fetched.size >= 2);

    await interaction.editReply({
      content: ` Đã xoá ${deletedCount} tin nhắn (chỉ những tin nhắn < 14 ngày).`,
      flags : 1 << 6
    });

  } catch (err) {
    console.error('Lỗi khi xóa tin nhắn:', err);
    await interaction.editReply({
      content: ' Đã xảy ra lỗi khi xoá tin nhắn.',
      flags : 1 << 6
    });
  }
}

    
async function handleRunewordList(interaction) {
  const allRunewords = Object.keys(runewords).sort();
  const chunkSize = 20;
  const chunks = [];
  
  for (let i = 0; i < allRunewords.length; i += chunkSize) {
    chunks.push(allRunewords.slice(i, i + chunkSize));
  }

  const createEmbed = (page) => new EmbedBuilder()
    .setTitle(`Danh sách Runewords (Trang ${page}/${chunks.length})`)
    .setDescription(chunks[page-1].map((rw, i) => `**${i+1}.** ${rw}`).join('\n'))
    .setColor('#0099ff');

  let currentPage = 1;
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('rw_prev')
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('rw_next')
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(chunks.length <= 1)
    );

  const reply = await interaction.reply({
    embeds: [createEmbed(currentPage)],
    components: [row],
    flags : 1 << 6,
    fetchReply: true
  });

  // Xử lý phân trang
  const collector = reply.createMessageComponentCollector({ time: 60000 });

  collector.on('collect', async i => {
    if (i.customId === 'rw_prev') currentPage--;
    if (i.customId === 'rw_next') currentPage++;

    await i.deferUpdate();
    row.components[0].setDisabled(currentPage <= 1);
    row.components[1].setDisabled(currentPage >= chunks.length);
    
    await i.editReply({
      embeds: [createEmbed(currentPage)],
      components: [row]
    });
  });

  collector.on('end', () => {
    interaction.editReply({ components: [] }).catch(console.error);
  });
}

// Các hàm tiện ích
function getHotkeyText() {
  return "```1. Khi cầm nguyên Stack (2+ vật phẩm trở lên):\n     Giữ chuột trái trên stack để di chuyển cả chồng stack đó.\n     Ctrl + Shift + Click vào ô trống: Tách ra 1 vật phẩm (vật phẩm này sẽ không stack nghĩa là không có dấu + trên vật phẩm, nếu là rune và gem thì có thể ép vào đồ).\n     Ctrl + Click vào ô trống: Tách ra 1 vật phẩm (vẫn giữ stack có dấu +, có thể gộp lại sau, nếu là rune và gem thì không thể ép vào đồ).\n\n2. Khi chỉ có 1 vật phẩm stack(hiển thị dấu +):\nThao tác như trên hoặc\n     Ctrl + Shift + Click: Chuyển đổi chế độ stack/không stack.\n     Shift + Left Click: Identify item\n     Shift + Right Click: Di chuyển giữa các thùng đồ(inventory <-> stash <-> cube)\n     Ctrl + Right Click: ném xuống đất\n     Ctrl + Shift + Right Click: Di chuyển vào cube(cube không được mở nếu không sẽ ném xuống đất)\n\n3. Khi cộng điểm skill hoặc stat:\n     Ctrl + Left Click: 5 điểm\n     Shift + Left Click: 20 điểm\n     Ctrl + Shift + Left Click: All\n\n4. Currency Stash: Khi bạn đặt các vật phẩm vào stash, chúng sẽ tự động chuyển vào Currency Stash, cho phép xếp chồng Rejuv.\n     Left Click: Lấy 1 vật phẩm lên chuột\n     Right Click: Lấy một vật phẩm vào inventory\n     Ctrl + (Left / Right Click): Lấy 5 vật phẩm (chuột / inventory)\n     Shift + (Left / Right Click): Lấy 20 vật phẩm (chuột / inventory)\n     Ctrl + Shift + (Left / Right Click): Lấy 50 vật phẩm (chuột / inventory)```";
}

function getHardcoreText() {
  return "*Hardcore không phải là một lối chơi, mà là một cách sống... rất ngắn.*" + "\n*Chơi Hardcore không phải để chứng tỏ bạn giỏi, mà để chứng tỏ bạn… chịu đựng giỏi.*";
}



async function handleSlashSetup(interaction) {
  try {
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('wiki').setEmoji('1371540189586915429').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('runeword').setEmoji('1371540174604865658').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('chance').setEmoji('1371540179235373056').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('tas').setEmoji('1371540183337402378').setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ias').setEmoji('1371540183337402378').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('search').setEmoji('1371540187540357130').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('list').setEmoji('1371540185606787082').setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('ĐẠI HOÀNG INTERFACE')
      .setDescription('**Giao diện** này cung cấp truy cập nhanh đến các công cụ và dữ liệu trò chơi.')
      .setImage('https://i.imgur.com/1JBh7P7.png')
      .setFooter({ text: 'Nhấn các nút bên dưới để sử dụng tính năng tương ứng' });

    await interaction.channel.send({
    embeds: [embed],
    components: [row1, row2],
  });
    }
  catch (err) {
    console.error('Lỗi', err);
    await interaction.reply({
      content: ' Đã xảy ra lỗi.',
      flags : 1 << 6
    });
  }
}






client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Kiểm tra bypass
  if (hasBypassPermission(message.member)) return;

  const isSpamChannel = config.allowedChannels_spam?.includes(message.channel.id);
  const isShowChannel = config.allowedChannels_show?.includes(message.channel.id);
  
  // --- Xử lý cho spam channel ---
  if (isSpamChannel) {
    if (isValidCommand(message.content)) return handleCommand(message);

    try {
      // Xoá tin nhắn người dùng
      await message.delete().catch(err => {
        if (err.code !== 10008) throw err;
        console.warn(`Tin nhắn đã bị xoá trước đó (spam channel):`, err.message);
      });

      // Gửi cảnh báo
      await sendWarning(message);
    } catch (err) {
      console.error('Lỗi xóa tin nhắn spam:', err);
    }
    return;
  }

  // --- Xử lý cho show channel ---
  if (isShowChannel) {
    const hasImage = message.attachments.some(attach =>
      config.imageExtensions.some(ext => attach.name?.toLowerCase().endsWith(ext))
    );

    const hasImageEmbed = message.embeds.some(embed => embed.image || embed.thumbnail);

    if (!hasImage && !hasImageEmbed) {
      try {
        await message.delete().catch(err => {
          if (err.code !== 10008) throw err;
          console.warn(`Tin nhắn đã bị xoá trước đó (show channel):`, err.message);
        });

        const warning = await message.channel.send(`${message.author}, chỉ gửi hình ở đây!`);
        setTimeout(() => warning.delete().catch(() => {}), 5000);
      } catch (err) {
        console.error('Lỗi xử lý tin nhắn không hình:', err);
      }
    }
    return;
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