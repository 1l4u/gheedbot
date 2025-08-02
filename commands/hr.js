const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');

// Bảng giá trị HR cho các items
const HR_VALUES = {
  'UM': 0.05,
  'MAL': 0.1,
  'IST': 0.15,
  'GUL': 0.25,
  'VEX': 0.5,
  'OHM': 0.75,
  'LO': 1,
  'SUR': 1.5,
  'BER': 3,
  'JAH': 2,
  'CHAM': 2.25,
  'ZOD': 4.5
};

/**
 * Xử lý lệnh /setuphr để tạo HR interface trong channel (chỉ admin)
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashSetupHr(interaction) {
  try {
  // Kiểm tra permissions - yêu cầu role, yêu cầu channel cụ thể
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true, // Setup HR có thể dùng ở bất kỳ đâu
    requireRole: true      // Nhưng cần có role được phép
  });

   if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền cài đặt Interface HR cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

    // Tạo embed cho HR interface công khai
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 HR Public Interface')
      .setDescription('🎯 **Hướng dẫn sử dụng:** Nhấn các button theo thứ tự để nhập số lượng runes của bạn!. Sau đó hãy nhấn "Tính HR" để xem kết quả.')
      .addFields(
        { name: '🟢 Low Runes', value: '`UM` `MAL` `IST` `GUL`', inline: true },
        { name: '🟡 Mid Runes', value: '`VEX` `OHM` `LO` `SUR`', inline: true },
        { name: '🔴 High Runes', value: '`BER` `JAH` `CHAM` `ZOD`', inline: true },
        { name: '� Lưu ý', value: '• Kết quả chỉ **bạn** thấy được\n• Có thể nhập từng nhóm riêng lẻ\n• Dữ liệu được lưu riêng cho mỗi người', inline: false }
      )
      .setFooter({ text: '🛠️ Được thiết lập bởi ' + interaction.user.username + ' • GheedBot HR Calculator' });

    // Tạo buttons cho interface công khai
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_public_group1_runes')
        .setLabel('🟢 Low Runes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_public_group2_runes')
        .setLabel('🟡 Mid Runes')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('hr_public_group3_runes')
        .setLabel('🔴 High Runes')
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_public_calculate')
        .setLabel('🧮 Tính HR')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_public_reset')
        .setLabel('�️ Xóa Dữ Liệu Của Tôi')
        .setStyle(ButtonStyle.Secondary));

    // Gửi interface vào channel (public)
    await interaction.reply({
      embeds: [embed],
      components: [row1, row2]
    });

    console.log(`HR interface được setup trong ${interaction.channel.name} bởi ${interaction.user.tag}`);

  } catch (error) {
    console.error('Lỗi setup HR interface:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Đã xảy ra lỗi khi setup HR interface',
        flags: 1<<6
      });
    }
  }
}

/**
 * Xử lý lệnh /hr để hiển thị interface tính toán HR (private)
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashHr(interaction) {
  try {
    // Kiểm tra quyền trước
    const permissionCheck = await checkCommandPermissions(interaction, 'hr');
    if (!permissionCheck.allowed) {
      return await interaction.reply({
        content: permissionCheck.reason,
        flags: 1<<6
      });
    }

    // Tạo embed giới thiệu
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 HR Private Interface')
      .setDescription('🎯 **Hướng dẫn:** Nhấn các button theo thứ tự để nhập runes của bạn! Sau đó nhấn "Tính HR" để xem kết quả.')
      .addFields(
        { name: '🟢 Low Runes', value: '`UM` `MAL` `IST` `GUL`', inline: true },
        { name: '🟡 Mid Runes', value: '`VEX` `OHM` `LO` `SUR`', inline: true },
        { name: '🔴 High Runes', value: '`BER` `JAH` `CHAM` `ZOD`', inline: true },
        { name: '📋 Lưu ý', value: '• Interface này chỉ bạn thấy\n• Có thể nhập từng nhóm riêng lẻ', inline: false }
      );

    // Tạo buttons cho từng nhóm runes
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_group1_runes')
        .setLabel('🟢 Low Runes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_group2_runes')
        .setLabel('🟡 Mid Runes')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('hr_group3_runes')
        .setLabel('🔴 High Runes')
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_calculate')
        .setLabel('🧮 Tính HR')
        .setStyle(ButtonStyle.Success), // Luôn enable
      new ButtonBuilder()
        .setCustomId('hr_reset')
        .setLabel('🔄 Xóa Dữ Liệu')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
      flags: 1<<6
    });

  } catch (error) {
    console.error('Lỗi tính toán HR:', error);

    // Nếu interaction chưa được reply
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Đã xảy ra lỗi khi hiển thị HR calculator',
        flags: 1<<6
      });
    } else {
      await interaction.editReply({
        content: 'Đã xảy ra lỗi khi hiển thị HR calculator'
      });
    }
  }
}

// Lưu trữ data tạm thời cho mỗi user
const userHrData = new Map();

/**
 * Tạo modal cho nhóm runes cụ thể
 * @param {string} groupType - 'low', 'mid', 'high', 'ultra'
 * @returns {ModalBuilder} - Modal với input fields riêng cho từng rune
 */
function createRuneGroupModal(groupType, isPublic = false) {
  const runeGroups = {
    group1: {
      runes: ['UM', 'MAL', 'IST', 'GUL'],
      title: 'Low Runes',
      description: 'Nhập số lượng runes bạn có (để trống = 0)'
    },
    group2: {
      runes: ['VEX', 'OHM', 'LO', 'SUR'],
      title: 'Mid Runes',
      description: 'Nhập số lượng runes bạn có (để trống = 0)'
    },
    group3: {
      runes: ['BER', 'JAH', 'CHAM', 'ZOD'],
      title: 'High Runes',
      description: 'Nhập số lượng runes cuối cùng và tính toán'
    }
  };

  const group = runeGroups[groupType];
  const modalId = isPublic ? `hr_public_modal_${groupType}` : `hr_modal_${groupType}`;
  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle(group.title);

  // Tạo input field riêng cho từng rune với labels tiếng Việt
  group.runes.forEach((runeName) => {
    const hrValue = HR_VALUES[runeName];
    const row = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(`rune_${runeName.toLowerCase()}`)
        .setLabel(`${runeName} - ${hrValue}`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Nhập số lượng (để trống = 0)')
        .setRequired(false)
        .setMaxLength(3) // Tối đa 999
    );
    modal.addComponents(row);
  });

  return modal;
}

/**
 * Xử lý button clicks cho HR calculator
 * @param {ButtonInteraction} interaction - Button interaction
 */
async function handleHrButton(interaction) {
  try {
    const buttonId = interaction.customId;
    const userId = interaction.user.id;

    console.log(`HR Button clicked: ${buttonId} by ${interaction.user.tag}`);

    // Xử lý public buttons (từ /setuphr)
    if (buttonId.startsWith('hr_public_')) {
      if (buttonId.endsWith('_runes')) {
        // Xử lý buttons cho các nhóm runes (public)
        let groupType = buttonId.replace('hr_public_', '').replace('_runes', '');
        const modal = createRuneGroupModal(groupType, true); // true = public mode
        await interaction.showModal(modal);

      } else if (buttonId === 'hr_public_calculate') {
        // Defer reply ngay lập tức để tránh timeout
        await interaction.deferReply({ flags: 1 << 6 });
        // Tính toán HR từ data đã lưu (public)
        await calculateAndShowHR(interaction, userId, true); // true = public mode

      } else if (buttonId === 'hr_public_reset') {
        // Reset data (public)
        userHrData.delete(userId);
        await interaction.reply({
          content: '🔄 Đã reset dữ liệu HR của bạn!',
          flags: 1<<6
        });
      }
      return;
    }

    // Xử lý private buttons (từ /hr)
    if (buttonId.startsWith('hr_') && buttonId.endsWith('_runes')) {
      // Xử lý buttons cho các nhóm runes
      let groupType = buttonId.replace('hr_', '').replace('_runes', '');
      // Convert old names to new names
      if (groupType === 'low') groupType = 'group1';
      if (groupType === 'mid') groupType = 'group2';
      if (groupType === 'high') groupType = 'group3';

      const modal = createRuneGroupModal(groupType, false); // false = private mode
      await interaction.showModal(modal);

    } else if (buttonId === 'hr_calculate') {
      // Defer reply ngay lập tức để tránh timeout
      await interaction.deferReply({ flags: 1 << 6 });
      // Tính toán HR từ data đã lưu
      await calculateAndShowHR(interaction, userId, false); // false = private mode

    } else if (buttonId === 'hr_reset') {
      // Reset data
      userHrData.delete(userId);
      await interaction.reply({
        content: '🔄 Đã reset tất cả dữ liệu HR!',
        flags: 1<<6
      });
    }

  } catch (error) {
    console.error('Lỗi xử lý HR button:', error);
    console.error('Error details:', error.message);

    try {
      // Kiểm tra nếu interaction chưa được reply
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}`,
          flags: 1<<6
        });
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}`
        });
      }
    } catch (replyError) {
      console.error('Lỗi khi gửi error message:', replyError);
    }
  }
}

/**
 * Xử lý modal submission từ HR calculator
 * @param {ModalSubmitInteraction} interaction - Modal submit interaction
 */
async function handleHrModalSubmit(interaction) {
  try {
    const userId = interaction.user.id;
    const modalId = interaction.customId;

    console.log(`HR Modal submit: ${modalId} từ user ${interaction.user.tag}`);

    // Lấy dữ liệu hiện tại của user (hoặc tạo mới)
    if (!userHrData.has(userId)) {
      userHrData.set(userId, {});
    }
    const userData = userHrData.get(userId);

    // Lấy dữ liệu từ modal và lưu vào userData
    const runeGroups = {
      hr_modal_group1: ['UM', 'MAL', 'IST', 'GUL'],
      hr_modal_group2: ['VEX', 'OHM', 'LO', 'SUR'],
      hr_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD'],
      hr_public_modal_group1: ['UM', 'MAL', 'IST', 'GUL'],
      hr_public_modal_group2: ['VEX', 'OHM', 'LO', 'SUR'],
      hr_public_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD']
    };

    const runes = runeGroups[modalId];
    if (!runes) {
      return await interaction.reply({
        content: 'Modal không hợp lệ',
        flags: 1<<6
      });
    }

    // Lưu dữ liệu từ modal
    runes.forEach(runeName => {
      const fieldId = `rune_${runeName.toLowerCase()}`;
      const value = interaction.fields.getTextInputValue(fieldId) || '0';
      const quantity = parseInt(value) || 0;
      userData[runeName] = quantity;
      console.log(`Lưu ${runeName}: ${quantity} cho user ${interaction.user.tag}`);
    });

    // Tạo summary của dữ liệu đã nhập cho logging
    const summary = Object.entries(userData)
      .filter(([_, quantity]) => quantity > 0)
      .map(([rune, quantity]) => `${rune}: ${quantity}`)
      .join('\n');

    // Chỉ log và lưu cache, không reply cho user
    console.log(`💾 [CACHE] HR Data saved for ${interaction.user.tag}:`);
    console.log(`📊 [DATA] ${summary || 'Chưa có rune nào'}`);
    console.log(`🔍 [MODAL] ${modalId} processed successfully`);

    // Acknowledge interaction để tránh lỗi
    await interaction.deferUpdate();

  } catch (error) {
    console.error('Lỗi xử lý HR modal:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);

    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`,
          flags: 1<<6
        });
      } else {
        await interaction.followUp({
          content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`,
          flags: 1<<6
        });
      }
    } catch (replyError) {
      console.error('Lỗi khi gửi error message:', replyError);
    }
  }
}

/**
 * Tính toán và hiển thị kết quả HR
 * @param {ButtonInteraction} interaction - Button interaction
 * @param {string} userId - User ID
 */
async function calculateAndShowHR(interaction, userId, isPublic = false) {
  try {
    const userData = userHrData.get(userId);
    if (!userData || Object.keys(userData).length === 0) {
      // Kiểm tra nếu interaction đã được deferred
      if (interaction.deferred) {
        return await interaction.editReply({
          content: '❌ Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.'
        });
      } else {
        return await interaction.reply({
          content: 'Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.',
          flags: 1<<6
        });
      }
    }

    // Tính toán HR
    let totalHr = 0;
    const calculations = [];

    Object.entries(userData).forEach(([runeName, quantity]) => {
      if (quantity > 0 && HR_VALUES[runeName]) {
        const value = HR_VALUES[runeName] * quantity;
        totalHr += value;
        calculations.push({
          name: runeName,
          quantity: quantity,
          unitValue: HR_VALUES[runeName],
          totalValue: value
        });
      }
    });

    if (calculations.length === 0) {
      // Kiểm tra nếu interaction đã được deferred
      if (interaction.deferred) {
        return await interaction.editReply({
          content: '❌ Không có rune hợp lệ để tính toán!'
        });
      } else {
        return await interaction.reply({
          content: 'Không có rune hợp lệ để tính toán!',
          flags: 1<<6
        });
      }
    }

    // Tạo embed response
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`**${totalHr.toFixed(2)}**`)
      .setDescription('Chi tiết:')
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    // Thêm từng calculation
    calculations.forEach(calc => {
      embed.addFields({
        name: ``,value: `${calc.quantity}x ${calc.name} = **${calc.totalValue.toFixed(2)}**`, inline: true
      });
    });

    // Kiểm tra nếu interaction đã được deferred
    if (interaction.deferred) {
      await interaction.editReply({
        embeds: [embed]
      });
    } else {
      await interaction.reply({
        embeds: [embed],
        flags: 1<<6
      });
    }

    console.log(`Tính toán HR hoàn thành: ${totalHr.toFixed(2)} HR cho ${interaction.user.tag}`);

  } catch (error) {
    console.error('Lỗi tính toán HR:', error);

    try {
      // Kiểm tra nếu interaction đã được deferred
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Đã xảy ra lỗi khi tính toán HR: ${error.message}`
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Đã xảy ra lỗi khi tính toán HR: ${error.message}`,
          flags: 1<<6
        });
      }
    } catch (replyError) {
      console.error('Lỗi khi gửi error message:', replyError);
    }
  }
}

module.exports = {
  handleSlashHr,
  handleSlashSetupHr,
  handleHrModalSubmit,
  handleHrButton
};