require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { REST } = require('@discordjs/rest');
const runewords = require("./runeword.json");
const itembases = require('./base_item.json');
const wiki = require("./wiki.json");
const express = require("express");
const config = require('./config.json');
const app = express();
const { handleTranslation} = require('./translation');
const PORT = process.env.PORT || 3000;



app.use(express.json());

// Route health check (bắt buộc cho Render)
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Pong!',
    timestamp: new Date().toISOString()
  });
});

// Route mặc định
app.get('/', (req, res) => {
  res.send('Discord Bot is running');
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Xử lý tắt server đúng cách
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Xử lý unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
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
    .setName('botsetup')
    .setDescription('Đại Hoàng Interface'),
  new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Dịch một đoạn văn bản Anh ↔ Việt')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Nội dung cần dịch')
        .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName('dmgcal')
  .setDescription('Tính dmg vũ khí')
  .addIntegerOption(option =>
    option.setName('min_base')
          .setDescription('Min Base Damage')
          .setRequired(true))
  .addIntegerOption(option =>
    option.setName('max_base')
          .setDescription('Max Base Damage')
          .setRequired(true))
  .addIntegerOption(option =>
    option.setName('enhanced')
          .setDescription('Enhanced Damage')
          .setRequired(true))
  .addIntegerOption(option =>
    option.setName('add_min')
          .setDescription('Add Min Damage')
          .setRequired(true))
  .addIntegerOption(option =>
    option.setName('add_max')
          .setDescription('Add Max Damage')
          .setRequired(true))
  // new SlashCommandBuilder()
  //   .setName('dmgcal2')
  //   .setDescription('Tính dmg vũ khí')
  //   .addIntegerOption(option =>
  //     option.setName('item')
  //           .setDescription('Tên item')
  //           .setRequired(true)
  //           .setAutocomplete(true))
  //   .addIntegerOption(option =>
  //     option.setName('enhanced')
  //           .setDescription('Enhanced Damage')
  //           .setRequired(true))
  //   .addIntegerOption(option =>
  //     option.setName('add_min')
  //           .setDescription('Add Min Damage')
  //           .setRequired(true))
  //   .addIntegerOption(option =>
  //     option.setName('add_max')
  //           .setDescription('Add Max Damage')
  //           .setRequired(true))
  //   .addIntegerOption(option =>
  //     option.setName('add_max_lvl')
  //           .setDescription('Add Max Damage per Level')
  //           .setRequired(true))
  //   .addIntegerOption(option =>
  //     option.setName('ed_max_lvl')
  //           .setDescription('Enhanced Damage per Level')
  //           .setRequired(true))
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

  if (!dataSource) return;
  try {
    await handleAutocomplete(interaction, dataSource);
  } catch (err) {
    console.error(`Lỗi xử lý lệnh ${interaction.commandName}:`, err);
  }
}

  if (interaction.isButton()) {
    try{
      switch (interaction.customId) {
        case 'wiki':
          break;
        case 'list':
          break;
        case 'runeword':
          break;
        case 'search':
          break;
        case 'tas':
          break;
        case 'ias':
          break;
        case 'chance':
          break;
        case 'hotkey':
        case 'show_wiki_list':
          break;
        case 'show_rw_list':
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
          flags: 1 << 6
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
      case 'chance':
        await handleSlashCritChance(interaction);
        break;
      case 'tas':
        await handleSlashTas(interaction);
        break;
      case 'ias':
        await handleSlashIas(interaction);
        break;
      case 'botsetup':
        await handleSlashSetup(interaction);
        break;
      case 'translate':
        await handleTranslation(interaction);
        break;
      case 'dmgcal' :
        await handleDmgCalculator(interaction);
        break;
      // case 'dmgcal2' :
      //   await handleDmgCalculator2(interaction);
      //   break;
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


const autocompleteSources = {
  wiki: wiki,
  rw: runewords,
  ib: itembases
  // Có thể thêm các nguồn dữ liệu khác ở đây
};

// Hàm xử lý autocomplete được tối ưu
async function handleAutocomplete(interaction) {
  // Kiểm tra interaction hợp lệ
  if (!interaction.isAutocomplete()) return;

  try {
    // Lấy thông tin command và giá trị nhập
    const commandName = interaction.commandName;
    const focusedValue = interaction.options.getFocused().toLowerCase().trim();
    
    // Kiểm tra nguồn dữ liệu
    const dataSource = autocompleteSources[commandName];
    if (!dataSource) {
      console.warn(`Không tìm thấy nguồn dữ liệu cho command: ${commandName}`);
      return;
    }

    // Tối ưu: Cache keys nếu dữ liệu lớn
    const dataKeys = Object.keys(dataSource);
    
    // Lọc và giới hạn kết quả
    const filtered = dataKeys
      .filter(key => {
        // Tìm kiếm không phân biệt hoa thường
        const normalizedKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedInput = focusedValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedKey.includes(normalizedInput);
      })
      .slice(0, 25); // Giới hạn của Discord

    // Kiểm tra trạng thái interaction trước khi phản hồi
    if (!interaction.responded) {
      await interaction.respond(
        filtered.map(key => ({
          name: key.length > 100 ? `${key.substring(0, 97)}...` : key, // Giới hạn độ dài
          value: key.length > 100 ? key.substring(0, 100) : key // Đảm bảo value không quá dài
        }))
      );
    }
  } catch (error) {
    console.error(`Lỗi xử lý autocomplete cho command ${interaction.commandName}:`, {
      error: error.message,
      stack: error.stack,
      interactionId: interaction.id,
      userId: interaction.user.id
    });

    // Không cần xử lý thêm vì autocomplete đã fail
  }
}



// Các hàm xử lý Slash Command
async function handleSlashRuneword(interaction) {
  if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
        { name: ``, value: `Level: ${rw.level?.toString()}` || "N/A", inline: false }
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
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
  const ias = interaction.options.getInteger('ias');
  const skillIas = interaction.options.getInteger('skill_ias');
  const wsm = interaction.options.getInteger('wsm');

  const eias = Math.floor((120 * ias) / (120 + ias));
  const tas = eias + skillIas - wsm;

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .addFields(
      { name: ``, value: `TAS - ${tas}%`, inline: true },
      { name: ``, value: `EIAS - ${eias}%`, inline: true },
      { name: 'Công thức', value: `- TAS = EIAS + Skill_IAS - WSM\n- EIAS = (120 * IAS) / (120 + IAS)` }
    )
    .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

  await interaction.reply({
    embeds: [embed],
    flags: 1 << 6
  });
}

async function handleSlashIas(interaction) {
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }
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
async function handleSlashSetup(interaction) {
    if (!config.clear_member_id.includes(interaction.user.id)) {
    return await interaction.reply({
      content: 'Bạn không có quyền sử dụng lệnh này.',
      flags: 1 << 6
    });
  }
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
      .setFooter({ text: 'Nhấn các nút bên dưới để sử dụng tính năng tương ứng. Hoặc sử dụng commands / tương ứng.' });

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

async function handleDmgCalculator(interaction) {
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
    return await interaction.reply({
      content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
      flags: 1 << 6
    });
  }

    const minBase = interaction.options.getInteger('min_base');
    const maxBase = interaction.options.getInteger('max_base');
    const enhanced = interaction.options.getInteger('enhanced');
    const addMin = interaction.options.getInteger('add_min');
    const addMax = interaction.options.getInteger('add_max');

    if (minBase < 0 || maxBase < 0 || enhanced < 0 || addMin < 0 || addMax < 0) {
      return await interaction.reply({
        content: 'Giá trị phải từ 0',
        flags: 1 << 6
      });
    }

    const minDmg = Math.round((minBase * (1 + enhanced/100)) + addMin);
    const maxDmg = Math.round((maxBase * (1 + enhanced/100)) + addMax);

    const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .addFields(
      { name: 'Damage', value: `${minDmg}-${maxDmg}`, inline: true }
    )
    .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

  await interaction.reply({
    embeds: [embed],
    flags: 1 << 6
  });
}

async function handleDmgCalculator2(interaction) {
   // Kiểm tra channel allowed
    if (!config.allowedChannels?.includes(interaction.channel.id)) {
        return await interaction.reply({
            content: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong "bot-spam"',
            flags: 1 << 6
        });
    }

    // Lấy base damage từ item
    const itemData = interaction.options.getString('item');
    const item = itembases[itemData];
    if (!item) {
        return await interaction.reply({
            content: `Không tìm thấy thông tin cho item "${itemData}"`,
            flags: 1 << 6
        });
    }

    // Lấy các giá trị từ interaction
    const enhanced = interaction.options.getInteger('enhanced');
    const addMin = interaction.options.getInteger('add_min') || 0;
    const addMax = interaction.options.getInteger('add_max') || 0;
    const maxlvl = interaction.options.getInteger('max_lvl') || 0;
    const edlvl = interaction.options.getInteger('ed_lvl') || 0;

    // Kiểm tra giá trị âm
    if ([enhanced, addMin, addMax, maxlvl, edlvl].some(val => val < 0)) {
        return await interaction.reply({
            content: 'Tất cả giá trị phải lớn hơn hoặc bằng 0',
            flags: 1 << 6
        });
    }
    minBase = parseInt(item.min);
    maxBase = parseInt(item.max);

    // Tính toán damage
    const minDmg = Math.round((minBase * (1 + enhanced/100))) + addMin;
    const maxDmg = Math.round((maxBase * (1 + enhanced/100))) + addMax + maxlvl + (maxBase * edlvl);

    // Tạo embed kết quả
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Damage Calculation for ${itemData}`)
        .addFields(
            { name: 'Base Damage', value: `${minBase}-${maxBase}`, inline: true },
            { name: 'Final Damage', value: `${minDmg}-${maxDmg} (Avg: ${avgDmg})`, inline: true },
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
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