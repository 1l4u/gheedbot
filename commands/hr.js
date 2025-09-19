const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');
const { logger } = require('../utils/logger');
const { M } = require('../utils/log-messages');

// Fallback HR values (used if GitHub/local load fails)
const DEFAULT_HR_VALUES = {
  'UM': 0.05, 'MAL': 0.1, 'IST': 0.15,
  'GUL': 0.25, 'VEX': 0.5, 'OHM': 0.75,
  'LO': 1, 'SUR': 1.5, 'BER': 3,
  'JAH': 2, 'CHAM': 2.25, 'ZOD': 4.5
};

// Active HR values (initialized with defaults)
let HR_VALUES = { ...DEFAULT_HR_VALUES };

// Load HR values from GitHub/local at module load time
(async function initHrValues() {
  try {
    await dataManager.loadData?.('runeValues');
    const hrData = await dataManager.getRuneValues();
    if (hrData && typeof hrData === 'object' && Object.keys(hrData).length > 0) {
      logger.info(M.data.dataLoadEnd({ type: 'HR values', success: true }));
      HR_VALUES = hrData;
    } else {
      logger.warn(M.data.dataLoadError({ type: 'HR values', msg: 'Dữ liệu trống hoặc không hợp lệ' }));
      HR_VALUES = { ...DEFAULT_HR_VALUES };
    }
  } catch (error) {
    logger.error(M.data.loadErrorGitHub, error.message);
    HR_VALUES = { ...DEFAULT_HR_VALUES };
  }
})();

/**
 * Tạo modal cho nhóm runes cụ thể
 * @param {string} groupType - 'group1' | 'group2' | 'group3'
 * @param {boolean} isPublic - Public interface (true) or private (false)
 */
function createRuneGroupModal(groupType, isPublic = false) {
  const runeGroups = {
    group1: {
      runes: ['UM', 'MAL', 'IST'],
      title: 'Low Runes',
      description: 'Nhập số lượng runes bạn có (để trống = 0)'
    },
    group2: {
      runes: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'],
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

  group.runes.forEach((runeName) => {
    const hrValue = HR_VALUES[runeName] ?? 0;
    const row = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(`rune_${runeName.toLowerCase()}`)
        .setLabel(`${runeName} - ${hrValue}`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Nhập số lượng (để trống = 0)')
        .setRequired(false)
        .setMaxLength(3)
    );
    modal.addComponents(row);
  });

  return modal;
}

/**
 * /setuphr - Tạo HR interface public trong channel (cần role được phép)
 */
async function handleSlashSetupHr(interaction) {
  try {
    const permissionCheck = checkCommandPermissions(interaction, {
      requireChannel: true,
      requireRole: true
    });

    if (!permissionCheck.allowed) {
      logger.warn(M.hr.setupDenied({ user: interaction.user.tag, reason: permissionCheck.reason }));
      return await interaction.editReply({ content: permissionCheck.reason });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 HR Public Interface')
      .setDescription('🎯 Hướng dẫn: Nhập số lượng runes (theo nhóm) rồi nhấn "Tính HR" để xem kết quả (ephemeral)')
      .addFields(
        { name: '🟢 Low Runes', value: '`UM` `MAL` `IST`', inline: true },
        { name: '🟡 Mid Runes', value: '`GUL` `VEX` `OHM` `LO` `SUR`', inline: true },
        { name: '🔴 High Runes', value: '`BER` `JAH` `CHAM` `ZOD`', inline: true },
        { name: '📋 Lưu ý', value: '• Kết quả chỉ bạn thấy\n• Có thể nhập từng nhóm riêng lẻ', inline: false }
      )
      .setFooter({ text: `Được thiết lập bởi ${interaction.user.username} • GheedBot HR Calculator` });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hr_public_group1_runes').setLabel('🟢 Low Runes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('hr_public_group2_runes').setLabel('🟡 Mid Runes').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('hr_public_group3_runes').setLabel('🔴 High Runes').setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hr_public_reset').setLabel('🔄 Reset').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('hr_public_calculate').setLabel('🧮 Tính HR').setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
    logger.info(M.hr.setupDone({ channel: interaction.channel.name, user: interaction.user.tag }));
  } catch (error) {
    logger.error(M.hr.modalError, error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Đã xảy ra lỗi khi setup HR interface', flags: 1 << 6 });
    }
  }
}

/**
 * /hr - Tạo HR interface private (ephemeral)
 */
async function handleSlashHr(interaction) {
  try {
    const permissionCheck = await checkCommandPermissions(interaction, 'hr');
    if (!permissionCheck.allowed) {
      return await interaction.reply({ content: permissionCheck.reason, flags: 1 << 6 });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 HR Private Interface')
      .setDescription('🎯 Hướng dẫn: Nhập số lượng runes (theo nhóm) rồi nhấn "Tính HR" để xem kết quả (ephemeral)')
      .addFields(
        { name: '🟢 Low Runes', value: '`UM` `MAL` `IST`', inline: true },
        { name: '🟡 Mid Runes', value: '`GUL` `VEX` `OHM` `LO` `SUR`', inline: true },
        { name: '🔴 High Runes', value: '`BER` `JAH` `CHAM` `ZOD`', inline: true },
        { name: '📋 Lưu ý', value: '• Interface này chỉ bạn thấy\n• Có thể nhập từng nhóm riêng lẻ', inline: false }
      );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hr_group1_runes').setLabel('🟢 Low Runes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('hr_group2_runes').setLabel('🟡 Mid Runes').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('hr_group3_runes').setLabel('🔴 High Runes').setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hr_calculate').setLabel('🧮 Tính HR').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('hr_reset').setLabel('🔄 Xóa Dữ Liệu').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2], flags: 1 << 6 });
  } catch (error) {
    logger.error(M.hr.error, error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Đã xảy ra lỗi khi hiển thị HR calculator', flags: 1 << 6 });
    } else {
      await interaction.editReply({ content: 'Đã xảy ra lỗi khi hiển thị HR calculator' });
    }
  }
}

// Temporary per-user HR cache
const userHrData = new Map();

/**
 * Handle HR button clicks
 */
async function handleHrButton(interaction) {
  try {
    const buttonId = interaction.customId;
    const userId = interaction.user.id;

    // Public interface buttons
    if (buttonId.startsWith('hr_public_')) {
      if (buttonId.endsWith('_runes')) {
        const groupType = buttonId.replace('hr_public_', '').replace('_runes', '');
        const modal = createRuneGroupModal(groupType, true);
        await interaction.showModal(modal);
      } else if (buttonId === 'hr_public_calculate') {
        await interaction.deferReply({ flags: 1 << 6 });
        await calculateAndShowHR(interaction, userId, true);
      } else if (buttonId === 'hr_public_reset') {
        userHrData.delete(userId);
        await interaction.reply({ content: '🔄 Đã reset dữ liệu HR của bạn!', flags: 1 << 6 });
      }
      return;
    }

    // Private interface buttons
    if (buttonId.startsWith('hr_') && buttonId.endsWith('_runes')) {
      let groupType = buttonId.replace('hr_', '').replace('_runes', '');
      if (groupType === 'low') groupType = 'group1';
      if (groupType === 'mid') groupType = 'group2';
      if (groupType === 'high') groupType = 'group3';
      const modal = createRuneGroupModal(groupType, false);
      await interaction.showModal(modal);
    } else if (buttonId === 'hr_calculate') {
      await interaction.deferReply({ flags: 1 << 6 });
      await calculateAndShowHR(interaction, userId, false);
    } else if (buttonId === 'hr_reset') {
      userHrData.delete(userId);
      await interaction.reply({ content: '🔄 Đã reset tất cả dữ liệu HR!', flags: 1 << 6 });
    }
  } catch (error) {
    logger.error(M.hr.error, error);
    logger.error(M.hr.msgError, error.message);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}`, flags: 1 << 6 });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}` });
      }
    } catch (replyError) {
      logger.error(M.hr.msgError, replyError);
    }
  }
}

/**
 * Handle HR modal submit
 */
async function handleHrModalSubmit(interaction) {
  try {
    const userId = interaction.user.id;
    const modalId = interaction.customId;

    if (!userHrData.has(userId)) userHrData.set(userId, {});
    const userData = userHrData.get(userId);

    const runeGroups = {
      hr_modal_group1: ['UM', 'MAL', 'IST'],
      hr_modal_group2: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'],
      hr_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD'],
      hr_public_modal_group1: ['UM', 'MAL', 'IST'],
      hr_public_modal_group2: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'],
      hr_public_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD']
    };

    const runes = runeGroups[modalId];
    if (!runes) {
      return await interaction.reply({ content: 'Modal không hợp lệ', flags: 1 << 6 });
    }

    runes.forEach(runeName => {
      const fieldId = `rune_${runeName.toLowerCase()}`;
      const value = interaction.fields.getTextInputValue(fieldId) || '0';
      const quantity = parseInt(value, 10) || 0;
      userData[runeName] = quantity;
      logger.debug(M.hr.saveRune({ rune: runeName, qty: quantity, user: interaction.user.tag }));
    });

    const summary = Object.entries(userData)
      .filter(([_, quantity]) => quantity > 0)
      .map(([rune, quantity]) => `${rune}: ${quantity}`)
      .join(', ');

    logger.debug(M.hr.cacheSaved({ user: interaction.user.tag, summary, modalId }));
    await interaction.deferUpdate();
  } catch (error) {
    logger.error(M.hr.error, error);
    logger.error(M.hr.msgError, error.message);
    logger.error(M.hr.stackTrace, error.stack);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`, flags: 1 << 6 });
      } else {
        await interaction.followUp({ content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`, flags: 1 << 6 });
      }
    } catch (replyError) {
      logger.error(M.hr.msgError, replyError);
    }
  }
}

/**
 * Calculate and show HR result
 */
async function calculateAndShowHR(interaction, userId, isPublic = false) {
  try {
    const userData = userHrData.get(userId);
    if (!userData || Object.keys(userData).length === 0) {
      if (interaction.deferred) {
        return await interaction.editReply({ content: '❌ Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.' });
      } else {
        return await interaction.reply({ content: '❌ Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.', flags: 1 << 6 });
      }
    }

    let totalHr = 0;
    const calculations = [];

    Object.entries(userData).forEach(([runeName, quantity]) => {
      if (quantity > 0 && HR_VALUES[runeName]) {
        const value = HR_VALUES[runeName] * quantity;
        totalHr += value;
        calculations.push({ name: runeName, quantity, unitValue: HR_VALUES[runeName], totalValue: value });
      }
    });

    if (calculations.length === 0) {
      if (interaction.deferred) {
        return await interaction.editReply({ content: '❌ Không có rune hợp lệ để tính toán!' });
      } else {
        return await interaction.reply({ content: '❌ Không có rune hợp lệ để tính toán!', flags: 1 << 6 });
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`**${totalHr.toFixed(2)}**`)
      .setDescription('Chi tiết:')
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    calculations.forEach(calc => {
      embed.addFields({ name: '', value: `${calc.quantity}x ${calc.name} = **${calc.totalValue.toFixed(2)}**`, inline: true });
    });

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], flags: 1 << 6 });
    }

    logger.info(M.hr.result({ user: interaction.user.tag, total: totalHr.toFixed(2) }));
  } catch (error) {
    logger.error(M.hr.error, error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: `❌ Lỗi: ${error.message}` });
      } else if (!interaction.replied) {
        await interaction.reply({ content: `❌ Lỗi: ${error.message}`, flags: 1 << 6 });
      }
    } catch (replyError) {
      logger.error(M.hr.msgError, replyError);
    }
  }
}

module.exports = {
  handleSlashHr,
  handleSlashSetupHr,
  handleHrModalSubmit,
  handleHrButton
};
