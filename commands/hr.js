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
    requireChannel: true, // Debug có thể dùng ở bất kỳ đâu
    requireRole: true      // Nhưng cần có role được phép
  });

   if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền debug cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

    // Tạo embed cho HR interface công khai
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 HR Calculator - Public Interface')
      .setDescription('Mọi người có thể sử dụng calculator này để tính toán HR!')
      .addFields(
        { name: '🟢 Nhóm 1', value: 'UM, MAL, IST, GUL', inline: true },
        { name: '🟡 Nhóm 2', value: 'VEX, OHM, LO, SUR', inline: true },
        { name: '🔴 Nhóm 3', value: 'BER, JAH, CHAM, ZOD', inline: true },
        { name: '📝 Hướng dẫn', value: 'Nhấn button để mở form nhập số lượng cho từng rune. Kết quả sẽ hiển thị riêng tư cho bạn.', inline: false }
      )
      .setFooter({ text: 'HR Calculator được setup bởi ' + interaction.user.username });

    // Tạo buttons cho interface công khai
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_public_group1_runes')
        .setLabel('🟢 Nhóm 1 (UM-GUL)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_public_group2_runes')
        .setLabel('🟡 Nhóm 2 (VEX-SUR)')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('hr_public_group3_runes')
        .setLabel('🔴 Nhóm 3 (BER-ZOD)')
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_public_calculate')
        .setLabel('🧮 Tính toán HR')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_public_reset')
        .setLabel('🔄 Reset dữ liệu của tôi')
        .setStyle(ButtonStyle.Secondary)
    );

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
      .setTitle('HR Calculator')
      .setDescription('Chọn nhóm runes để nhập số lượng:')
      .addFields(
        { name: 'Nhóm 1', value: 'UM, MAL, IST, GUL', inline: true },
        { name: 'Nhóm 2', value: 'VEX, OHM, LO, SUR', inline: true },
        { name: 'Nhóm 3', value: 'BER, JAH, CHAM, ZOD', inline: true },
        { name: 'Hướng dẫn', value: 'Nhấn button để mở form nhập số lượng cho từng rune', inline: false }
      );

    // Tạo buttons cho từng nhóm runes
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_group1_runes')
        .setLabel('Nhóm 1 (UM-GUL)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('hr_group2_runes')
        .setLabel('Nhóm 2 (VEX-SUR)')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('hr_group3_runes')
        .setLabel('Nhóm 3 (BER-ZOD)')
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hr_calculate')
        .setLabel('Tính toán HR')
        .setStyle(ButtonStyle.Success), // Luôn enable
      new ButtonBuilder()
        .setCustomId('hr_reset')
        .setLabel('Reset')
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
    group1: { runes: ['UM', 'MAL', 'IST', 'GUL'], title: 'Nhóm 1 (UM-GUL)' },
    group2: { runes: ['VEX', 'OHM', 'LO', 'SUR'], title: 'Nhóm 2 (VEX-SUR)' },
    group3: { runes: ['BER', 'JAH', 'CHAM', 'ZOD'], title: 'Nhóm 3 (BER-ZOD)' }
  };

  const group = runeGroups[groupType];
  const modalId = isPublic ? `hr_public_modal_${groupType}` : `hr_modal_${groupType}`;
  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle(group.title);

  // Tạo input field riêng cho từng rune
  group.runes.forEach((runeName) => {
    const row = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(`rune_${runeName.toLowerCase()}`)
        .setLabel(`${runeName} (${HR_VALUES[runeName]} HR mỗi cái)`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('0')
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

    // Xử lý public buttons (từ /setuphr)
    if (buttonId.startsWith('hr_public_')) {
      if (buttonId.endsWith('_runes')) {
        // Xử lý buttons cho các nhóm runes (public)
        let groupType = buttonId.replace('hr_public_', '').replace('_runes', '');
        const modal = createRuneGroupModal(groupType, true); // true = public mode
        await interaction.showModal(modal);

      } else if (buttonId === 'hr_public_calculate') {
        // Tính toán HR từ data đã lưu (public)
        await calculateAndShowHR(interaction, userId, true); // true = public mode

      } else if (buttonId === 'hr_public_reset') {
        // Reset data (public)
        userHrData.delete(userId);
        await interaction.reply({
          content: 'Đã reset dữ liệu HR của bạn!',
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
      if (groupType === 'ultra') groupType = 'group3';

      const modal = createRuneGroupModal(groupType, false); // false = private mode
      await interaction.showModal(modal);

    } else if (buttonId === 'hr_calculate') {
      // Tính toán HR từ data đã lưu
      await calculateAndShowHR(interaction, userId, false); // false = private mode

    } else if (buttonId === 'hr_reset') {
      // Reset data
      userHrData.delete(userId);
      await interaction.reply({
        content: 'Đã reset tất cả dữ liệu HR!',
        flags: 1<<6
      });
    }

  } catch (error) {
    console.error('Lỗi xử lý HR button:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi xử lý button',
      flags: 1<<6
    });
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
    });

    // Tạo summary của dữ liệu đã nhập
    const summary = Object.entries(userData)
      .filter(([_, quantity]) => quantity > 0)
      .map(([rune, quantity]) => `${rune}: ${quantity}`)
      .join(', ');

    // await interaction.reply({
    //   content: `Đã lưu dữ liệu!\n**Hiện tại:** ${summary || 'Chưa có rune nào'}\n\nTiếp tục nhập các nhóm khác hoặc nhấn "Tính toán HR" để xem kết quả.`,
    //   flags: 1<<6
    // });

  } catch (error) {
    console.error('Lỗi xử lý HR modal:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi lưu dữ liệu',
      flags: 1<<6
    });
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
      return await interaction.reply({
        content: 'Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.',
        flags: 1<<6
      });
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
      return await interaction.reply({
        content: 'Không có rune hợp lệ để tính toán!',
        flags: 1<<6
      });
    }

    // Tạo embed response
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`ổng HR: ${totalHr.toFixed(2)} HR`)
      .setDescription('Chi tiết tính toán:')
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    // Thêm từng calculation
    calculations.forEach(calc => {
      embed.addFields({
        name: `${calc.quantity}x ${calc.name}`,
        value: `${calc.quantity} × ${calc.unitValue} = **${calc.totalValue.toFixed(2)} HR**`,
        inline: true
      });
    });

    await interaction.reply({
      embeds: [embed],
      flags: 1<<6
    });

    console.log(`Tính toán HR hoàn thành: ${totalHr.toFixed(2)} HR cho ${interaction.user.tag}`);

  } catch (error) {
    console.error('Lỗi tính toán HR:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi tính toán HR',
      flags: 1<<6
    });
  }
}

module.exports = {
  handleSlashHr,
  handleSlashSetupHr,
  handleHrModalSubmit,
  handleHrButton
};
