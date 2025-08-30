require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { REST } = require('@discordjs/rest');
// Import data manager
const { dataManager, DataManager } = require('./utils/data-manager');
const express = require("express");
const config = require('./config/config.json');
const app = express();
// Import command handlers
const { handleSlashDebug } = require('./commands/debug');
const { handleSlashRuneword } = require('./commands/runeword');
const { handleSlashWiki } = require('./commands/wiki');
const { handleSlashWeapon } = require('./commands/weapon');
const { handleSlashCritChance, handleSlashTas, handleSlashIas, handleDmgCalculator2 } = require('./commands/calculator');
const { handleSlashHr } = require('./commands/hr');
const { checkVersionAndReload } = require('./utils/version-check');
// Import utilities
const { hasBypassPermission, isValidCommand } = require('./utils/permissions');

const PORT = process.env.PORT || 3000;

// Middleware với error handling
app.use(express.json({ limit: '10mb' }));

// Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Hết thời gian chờ request');
    res.status(408).json({
      status: 'error',
      message: 'Request timeout',
      timestamp: new Date().toISOString()
    });
  });
  next();
});

// Route health check (bắt buộc cho Render)
app.get('/ping', (req, res) => {
  try {
    const botStatus = client.isReady() ? 'connected' : 'disconnected';
    res.status(200).json({
      status: 'healthy',
      message: 'Pong!',
      botStatus: botStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Route health check chi tiết hơn
app.get('/health', (req, res) => {
  try {
    const botStatus = client.isReady() ? 'connected' : 'disconnected';
    const dataManagerStatus = dataManager.getStatus();

    res.status(200).json({
      status: 'healthy',
      message: 'Bot đang hoạt động bình thường',
      bot: {
        status: botStatus,
        user: client.user ? client.user.tag : 'Unknown',
        guilds: client.guilds ? client.guilds.cache.size : 0
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      dataManager: dataManagerStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route mặc định
app.get('/', (req, res) => {
  try {
    const botStatus = client.isReady() ? 'connected' : 'disconnected';
    res.send(`
      <html>
        <head><title>GheedBot Status</title></head>
        <body>
          <h1>🤖 GheedBot đang chạy</h1>
          <p><strong>Bot Status:</strong> ${botStatus}</p>
          <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} giây</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p><a href="/ping">Health Check (JSON)</a></p>
          <p><a href="/health">Detailed Health Check</a></p>
          <p><a href="/test-github">Test GitHub Connection</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Lỗi route gốc:', error);
    res.status(500).send('Lỗi máy chủ nội bộ');
  }
});

// Route test kết nối GitHub
app.get('/test-github', async (req, res) => {
  try {
    const { githubFetcher } = require('./utils/github-data');

    console.log('Testing GitHub connection...');
    const testResult = await githubFetcher.fetchFile('data/weapon.json');

    res.status(200).json({
      status: 'success',
      message: 'GitHub connection successful',
      dataSize: Array.isArray(testResult) ? testResult.length : 'N/A',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GitHub test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'GitHub connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler cho Express
app.use((err, req, res, next) => {
  console.error('Lỗi Express:', err);
  res.status(500).json({
    status: 'error',
    message: 'Lỗi máy chủ nội bộ',
    timestamp: new Date().toISOString()
  });
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Không tìm thấy',
    timestamp: new Date().toISOString()
  });
});

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// Xử lý tắt server đúng cách
process.on('SIGTERM', () => {
  console.log('Đang tắt server...');
  server.close(() => {
    console.log('Server đã đóng');
    process.exit(0);
  });
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Không tắt server ngay lập tức, cho phép recovery
  setTimeout(() => {
    server.close(() => process.exit(1));
  }, 5000);
});

// Xử lý unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Log lỗi nhưng không tắt server
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
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
    .setName('weapon')
    .setDescription('Tìm kiếm thông tin weapon')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Tên weapon cần tìm')
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
    .setName('debug')
    .setDescription('Kiểm tra thông tin channel và bot'),
  new SlashCommandBuilder()
    .setName('hr')
    .setDescription('Tính tổng giá trị HR của các runes (private)'),
  new SlashCommandBuilder()
    .setName('setuphr')
    .setDescription('Tạo HR Calculator interface trong channel (cần quyền Manage Channels)'),
  new SlashCommandBuilder()
  .setName('dmgcal')
  .setDescription('Tính dmg vũ khí với weapon picker')
  .addStringOption(option =>
    option.setName('item')
          .setDescription('Chọn weapon')
          .setRequired(true)
          .setAutocomplete(true))
  .addIntegerOption(option =>
    option.setName('ed')
          .setDescription('Enhanced Damage %')
          .setRequired(true))
  .addIntegerOption(option =>
    option.setName('add_min')
          .setDescription('Add Min Damage')
          .setRequired(false))
  .addIntegerOption(option =>
    option.setName('add_max')
          .setDescription('Add Max Damage')
          .setRequired(false))
  .addStringOption(option =>
    option.setName('eth')
          .setDescription('Ethereal weapon (+25% base damage)')
          .setRequired(false)
          .addChoices(
            { name: 'Ethereal', value: 'true' },
            { name: 'Non-Ethereal', value: 'false' }
          ))
  .addIntegerOption(option =>
    option.setName('ed_lvl')
          .setDescription('Enhanced Damage per Level %')
          .setRequired(false))
  .addIntegerOption(option =>
    option.setName('max_lvl')
          .setDescription('Max Damage per Level')
          .setRequired(false))
  .addStringOption(option =>
    option.setName('jewel')
          .setDescription('Jewel stats (format: ED-MaxDmg,ED-MaxDmg). Ví dụ: 40-15,39-25,22-13...')
          .setRequired(false)),
  new SlashCommandBuilder()
  .setName('botreload')
  .setDescription('Reload data'),
].map(command => command.toJSON());

// Hàm đăng ký slash commands
async function registerSlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    console.log('Đang đăng ký slash commands...');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log('Đăng ký slash commands thành công!');
    return true;
  } catch (error) {
    console.error('Lỗi khi đăng ký slash commands:', error);
    return false;
  }
}

// Timeout wrapper cho interactions
async function withTimeout(promise, timeoutMs = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
}

// Xử lý Slash Commands
client.on('interactionCreate', async interaction => {
    const { commandName } = interaction;
    
    // Debug logging với thông tin chi tiết
    const interactionInfo = interaction.isCommand() ? `Lệnh: ${commandName}` :
                           interaction.isButton() ? `Button: ${interaction.customId}` :
                           interaction.isModalSubmit() ? `Modal: ${interaction.customId}` :
                           interaction.isAutocomplete() ? `Autocomplete: ${interaction.commandName}` :
                           `Type: ${interaction.type}`;

    console.log(`Nhận interaction: ${interaction.type} | ${interactionInfo} | Người dùng: ${interaction.user.tag}`);
// Xử lý tương tác autocomplete
if (interaction.isAutocomplete()) {
    console.log(`Autocomplete cho: ${interaction.commandName}`);

  try {
    const dataSource = await getAutocompleteData(interaction.commandName);
    if (!dataSource || dataSource.length === 0) {
      console.log(`Không có nguồn dữ liệu cho: ${interaction.commandName}`);
      await interaction.respond([]);
      return;
    }

    await handleAutocomplete(interaction, dataSource);
    console.log(`Đã xử lý autocomplete cho: ${interaction.commandName}`);
  } catch (err) {
    console.error(`Lỗi xử lý autocomplete ${interaction.commandName}:`, err);
    await interaction.respond([]);
  }
  return;
}

  // Xử lý Modal Submissions
  if (interaction.isModalSubmit()) {
    console.log(`Modal submit: ${interaction.customId}`);

    try {
      // Xử lý HR calculator modals (cả private và public)
      if (interaction.customId.startsWith('hr_modal_') || interaction.customId.startsWith('hr_public_modal_')) {
        const { handleHrModalSubmit } = require('./commands/hr');
        await handleHrModalSubmit(interaction);
        return;
      }

      switch (interaction.customId) {
        case 'hr_calculator_modal':
          const { handleHrModalSubmit } = require('./commands/hr');
          await handleHrModalSubmit(interaction);
          break;
        default:
          console.log(`Unknown modal: ${interaction.customId}`);
          await interaction.reply({
            content: 'Modal không được hỗ trợ',
            ephemeral: true
          });
      }
    } catch (error) {
      console.error(`Lỗi xử lý modal ${interaction.customId}:`, error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Đã xảy ra lỗi khi xử lý modal',
          ephemeral: true
        });
      }
    }
    return;
  }

  if (interaction.isButton()) {
    try{
      // Xử lý HR calculator buttons
      if (interaction.customId.startsWith('hr_')) {
        const { handleHrButton } = require('./commands/hr');
        await handleHrButton(interaction);
        return;
      }

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

  if (interaction.isChatInputCommand()){
    console.log(`Lệnh Chat Input: ${commandName}`);
  try {
    // Direct execution without timeout wrapper for debugging
    console.log(`Chuẩn bị thực thi switch cho: ${commandName}`);
    switch (commandName) {
        case 'rw':
          console.log(`Đang thực thi: handleSlashRuneword`);
          await handleSlashRuneword(interaction);
          break;
        case 'wiki':
          console.log(`Đang thực thi: handleSlashWiki`);
          await handleSlashWiki(interaction);
          break;
        case 'weapon':
          console.log(`Đang thực thi: handleSlashWeapon`);
          await handleSlashWeapon(interaction);
          break;
        case 'chance':
          console.log(`Đang thực thi: handleSlashCritChance`);
          await handleSlashCritChance(interaction);
          break;
        case 'tas':
          console.log(`Đang thực thi: handleSlashTas`);
          await handleSlashTas(interaction);
          break;
        case 'ias':
          console.log(`Đang thực thi: handleSlashIas`);
          await handleSlashIas(interaction);
          break;
        case 'debug':
          console.log(`Đang thực thi: handleSlashDebug`);
          await handleSlashDebug(interaction, client);
          break;
        case 'dmgcal' :
          console.log(`Đang thực thi: handleDmgCalculator2`);
          await handleDmgCalculator2(interaction);
          break;
        case 'hr':
          console.log(`Đang thực thi: handleSlashHr`);
          await handleSlashHr(interaction);
          break;
        case 'setuphr':
          console.log(`Đang thực thi: handleSlashSetupHr`);
          const { handleSlashSetupHr } = require('./commands/hr');
          await handleSlashSetupHr(interaction);
          break;
        case 'botreload':
            // Kiểm tra quyền sử dụng lệnh bằng hàm từ permission.js
            const { hasBypassPermission } = require('./utils/permissions.js');
            if (!hasBypassPermission(interaction.member)) {
              await interaction.reply({
                content: 'Bạn không có quyền sử dụng lệnh này.',
                flags: 1<<6
              });
              break;
            }
          console.log(`Đang thực thi: reloadAll`);
          try {
            await interaction.deferReply({ flags: 1<<6 }); // Cho phép xử lý lâu
            await dataManager.reloadAll();
            await interaction.editReply('Đã reload dữ liệu!');
          } catch (err) {
            await interaction.editReply('Lỗi reload: ' + err.message);
          }
          break;
        default:
          console.log(`Lệnh không xác định: ${commandName}`);
          await interaction.reply({
            content: 'Lệnh không được hỗ trợ',
            flags: 1 << 6
          });
      }

    console.log(`Hoàn thành switch statement cho: ${commandName}`);
		
  } catch (error) {
    console.error(`Lỗi khi xử lý lệnh ${commandName}:`, error);
    
    try {
      // Kiểm tra nếu interaction chưa được reply
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '```Đã xảy ra lỗi! Vui lòng thử lại sau.```',
          flags: 1 << 6
        });
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '```Đã xảy ra lỗi! Vui lòng thử lại sau.```'
        });
      } else {
        await interaction.followUp({
          content: '```Đã xảy ra lỗi! Vui lòng thử lại sau.```',
          flags: 1 << 6
        });
      }
    } catch (replyError) {
      console.error('Lỗi khi gửi error message:', replyError);
    }
  }}
});


// Async function để lấy autocomplete data
async function getAutocompleteData(commandName) {
  try {
    switch (commandName) {
      case 'wiki':
        return await dataManager.getWikis();
      case 'rw':
        return await dataManager.getRunewords();
      case 'weapon':
      case 'dmgcal':
        return await dataManager.getWeapons();
      default:
        return [];
    }
  } catch (error) {
    console.error(`Lỗi lấy autocomplete data cho ${commandName}:`, error.message);
    return [];
  }
}

// Cache để tránh duplicate autocomplete calls
const autocompleteCache = new Map();
const CACHE_DURATION = 1000; // 1 second

// Hàm xử lý autocomplete được tối ưu
async function handleAutocomplete(interaction, dataSource) {
  // Kiểm tra interaction hợp lệ
  if (!interaction.isAutocomplete()) return;

  // Kiểm tra nếu interaction đã được responded
  if (interaction.responded) {
    console.log('Autocomplete interaction đã được phản hồi, bỏ qua...');
    return;
  }

  try {
    // Lấy thông tin command và giá trị nhập
    const commandName = interaction.commandName;
    const focusedOption = interaction.options.getFocused(true);
    const userInput = focusedOption.value.toLowerCase();

    // Tạo cache key
    const cacheKey = `${commandName}:${userInput}:${interaction.user.id}`;
    const now = Date.now();

    // Kiểm tra cache để tránh duplicate calls
    if (autocompleteCache.has(cacheKey)) {
      const cached = autocompleteCache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        console.log(`Bỏ qua autocomplete trùng lặp cho: ${cacheKey}`);
        return;
      }
    }

    // Kiểm tra data source
    if (!dataSource || !Array.isArray(dataSource)) {
      console.log(`Data source không hợp lệ cho command: ${commandName}`);
      await interaction.respond([]); // Trả về danh sách rỗng để tránh lỗi
      return;
    }

    // Lấy danh sách tên duy nhất từ trường `name`
    const choices = [...new Set(
      dataSource
        .filter(item => item && typeof item.name === 'string' && item.name) // Lọc các item hợp lệ
        .map(item => item.name)
    )]
      .filter(choice => choice.toLowerCase().includes(userInput))
      .slice(0, 25) // Discord giới hạn 25 choices
      .map(choice => ({ name: choice, value: choice }));

    // Log để debug
    //console.log(`Autocomplete choices for ${commandName}:`, choices);

    // Cache result
    autocompleteCache.set(cacheKey, { timestamp: now, choices });

    // Clean old cache entries
    for (const [key, value] of autocompleteCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        autocompleteCache.delete(key);
      }
    }

    // Respond với choices (chỉ nếu chưa responded)
    if (!interaction.responded) {
      await interaction.respond(choices);
    }
  } catch (error) {
    console.error('Lỗi trong handleAutocomplete:', error);
    // Trả về danh sách rỗng để tránh crash
    if (!interaction.responded) {
      await interaction.respond([]);
    }
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
    const hasImage = message.attachments.some(attachment => 
      config.imageExtensions.some(ext => attachment.name?.toLowerCase().endsWith(ext))
    );

    if (!hasImage) {
      try {
        await message.delete().catch(err => {
          if (err.code !== 10008) throw err;
          console.warn(`Tin nhắn đã bị xoá trước đó (show channel):`, err.message);
        });

        const warning = await message.channel.send({
          content: `${message.author}, chỉ được đăng ảnh trong kênh này!`,
          allowedMentions: { users: [message.author.id] }
        });

        setTimeout(() => warning.delete().catch(() => {}), 5000);
      } catch (err) {
        console.error('Lỗi xóa tin nhắn show:', err);
      }
    }
  }
});



// Cấu hình
const YOUR_USER_ID = '396596028465348620'; // Thay bằng ID Discord cá nhân của bạn
const COOLDOWN_TIME = 10000; // 5 phút cooldown để chống spam
const lastNotification = new Map(); // Lưu thời gian thông báo cuối cùng

// Sự kiện khi bot sẵn sàng
client.once('ready', () => {
    console.log(`Bot đã sẵn sàng, đăng nhập với tên: ${client.user.tag} lúc ${new Date().toLocaleString()}`);
});

// Theo dõi sự kiện thay đổi trạng thái voice (chỉ đăng ký 1 lần)
client.removeAllListeners('voiceStateUpdate'); // Xóa listeners cũ nếu có
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        // Tìm người dùng để gửi DM
        const user = await client.users.fetch(YOUR_USER_ID).catch(() => null);
        
        // Kiểm tra nếu người dùng tồn tại
        if (!user) {
            console.log('Không tìm thấy người dùng với ID đã cung cấp!');
            return;
        }

        // Bỏ qua nếu người dùng là bot
        if (newState.member.user.bot) return;

        // Lấy ID người dùng và thời gian hiện tại
        // const userId = newState.member.id;
        // const now = Date.now();

        // // Kiểm tra cooldown (5 giây để tránh spam)
        // if (lastNotification.has(userId) && now - lastNotification.get(userId) < 5000) {
        //     console.log(`Cooldown đang hoạt động cho user ${userId}, bỏ qua thông báo`);
        //     return; // Bỏ qua nếu chưa đủ thời gian cooldown
        // }

        // // Cập nhật thời gian thông báo
        // lastNotification.set(userId, now);

        // Lấy nickname (hoặc username nếu không có nickname) và username
        const displayName = newState.member.user.displayName;

        // Người dùng tham gia bất kỳ kênh voice nào
        if (!oldState.channelId && newState.channelId) {
            const channelName = newState.channel.name;
            try {
                await user.send(`**${displayName}** đã tham gia voice **${channelName}**`);
                console.log(`Đã gửi DM: ${displayName} tham gia ${channelName}`);
            } catch (dmError) {
                console.error(`Lỗi gửi DM tham gia: ${dmError.message}`);
            }
        }
        // Người dùng rời bất kỳ kênh voice nào
        else if (oldState.channelId && !newState.channelId) {
            const channelName = oldState.channel.name;
            try {
                await user.send(`**${displayName}** đã rời voice **${channelName}**`);
                console.log(`Đã gửi DM: ${displayName} rời ${channelName}`);
            } catch (dmError) {
                console.error(`Lỗi gửi DM rời: ${dmError.message}`);
            }
        }
        // Người dùng chuyển kênh (không gửi thông báo để tránh spam)
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            console.log(`**${displayName}** chuyển từ ${oldState.channel.name} sang ${newState.channel.name}`);
        }
    } catch (error) {
        console.error('Lỗi khi xử lý sự kiện voiceStateUpdate:', error.message);
    }
});




// --- Các hàm hỗ trợ --- //

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


// Discord client event handlers
client.once('ready', async () => {
  console.log(`Bot đã sẵn sàng! Đăng nhập với tên: ${client.user.tag}`);

  // Khởi tạo data manager
  try {
    await dataManager.initialize();
    console.log('Data Manager đã được khởi tạo thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo Data Manager:', error.message);
    console.log('Bot sẽ tiếp tục chạy với dữ liệu local...');
  }

  // Đăng ký slash commands sau khi bot ready
  const success = await registerSlashCommands();
  if (success) {
    console.log('Tất cả slash commands đã được đăng ký!');
  } else {
    console.log('Có lỗi khi đăng ký slash commands!');
  }
});

client.on('error', (error) => {
  console.error('Lỗi Discord client:', error);
});

client.on('warn', (warning) => {
  console.warn('Discord client warning:', warning);
});

client.on('disconnect', () => {
  console.log('Bot đã ngắt kết nối');
});

client.on('reconnecting', () => {
  console.log('Bot đang kết nối lại...');
});

// Hàm login với retry logic
async function loginWithRetry(maxRetries = 3) {
  const token = process.env.DISCORD_TOKEN || "";
  
  if (!token) {
    console.error('DISCORD_TOKEN không được cung cấp!');
    return;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Đang đăng nhập Discord (lần thử ${attempt}/${maxRetries})...`);
      await client.login(token);
      console.log('Đăng nhập Discord thành công!');
      return;
    } catch (error) {
      console.error(`Lỗi đăng nhập Discord (lần thử ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Đã hết số lần thử đăng nhập Discord!');
        return;
      }
      
      // Đợi trước khi thử lại
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
    }
  }
}

// Tự động reload dữ liệu mỗi 5 phút
setInterval(() => {
  dataManager.reloadAll()
    .then(() => console.log('Đã tự động reload dữ liệu'))
    .catch(err => console.error('Lỗi tự động reload:', err.message));
  //checkVersionAndReload(dataManager);
}, 5 * 60 * 1000);



// Khởi động bot
loginWithRetry().catch(error => {
  console.error('Lỗi khởi động bot:', error);
});
