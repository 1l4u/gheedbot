const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');
const { logger } = require('../utils/logger');
const { M } = require('../utils/log-messages');

let HR_VALUES = {};
async function getHrValues() {
  const runeValues = await dataManager.getRuneValues();
  HR_VALUES = runeValues || {};
  
  // Chuyển đổi mảng JSON thành object với key là tên rune
  const hrMap = {};
  if (Array.isArray(runeValues)) {
    runeValues.forEach(rune => {
      hrMap[rune.name.toUpperCase()] = rune.hr_rate;
    });
  }
  
  return hrMap;
}

function createRuneGroupModal(groupType, isPublic = false, hrValues = HR_VALUES) {
  const runeGroups = {
    group1: { runes: ['UM', 'MAL', 'IST'], title: 'Low Runes' },
    group2: { runes: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'], title: 'Mid Runes' },
    group3: { runes: ['BER', 'JAH', 'CHAM', 'ZOD'], title: 'High Runes' },
  };

  const group = runeGroups[groupType];
  const modalId = isPublic ? `hr_public_modal_${groupType}` : `hr_modal_${groupType}`;
  const modal = new ModalBuilder().setCustomId(modalId).setTitle(group.title);

  group.runes.forEach((runeName) => {
    const hrValue = hrValues[runeName] ?? 0;

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

// /setuphr - public interface
async function handleSlashSetupHr(interaction) {
  try {
    const permissionCheck = checkCommandPermissions(interaction, {
      requireChannel: true,
      requireRole: true,
    });

    if (!permissionCheck.allowed) {
      return await interaction.editReply({ content: permissionCheck.reason });
    }

    // Load HR values trước khi hiển thị interface
    const hrValues = await getHrValues();

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('## Đại Hoàng Interface')
      .setDescription('🎯 Hướng dẫn: Nhập số lượng runes (theo nhóm) rồi nhấn **Tính HR** để xem kết quả')
      .addFields(
        { name: '🟢 Low Runes', value: '`UM` `MAL` `IST`', inline: true },
        { name: '🟡 Mid Runes', value: '`GUL` `VEX` `OHM` `LO` `SUR`', inline: true },
        { name: '🔴 High Runes', value: '`BER` `JAH` `CHAM` `ZOD`', inline: true },
        { name: '📋 Lưu ý', value: '• Kết quả chỉ bạn thấy\n• Có thể nhập từng nhóm riêng lẻ', inline: false }
      )
      .setFooter({ text: `Được thiết lập bởi *"${interaction.user.username}"*` });

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
  } catch (error) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Đã xảy ra lỗi khi setup HR interface', flags: 1 << 6 });
    }
  }
}

// /hr - private interface
async function handleSlashHr(interaction) {
  try {
    const permissionCheck = await checkCommandPermissions(interaction, 'hr');
    if (!permissionCheck.allowed) {
      return await interaction.reply({ content: permissionCheck.reason, flags: 1 << 6 });
    }

    // Load HR values trước khi hiển thị interface
    const hrValues = await getHrValues();

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
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Đã xảy ra lỗi khi hiển thị HR calculator', flags: 1 << 6 });
    } else {
      await interaction.editReply({ content: 'Đã xảy ra lỗi khi hiển thị HR calculator' });
    }
  }
}

// temporary per-user cache
const userHrData = new Map();

async function handleHrButton(interaction) {
  try {
    const buttonId = interaction.customId;
    const userId = interaction.user.id;

    // Xử lý public interface
    if (buttonId.startsWith('hr_public_')) {
      if (buttonId.endsWith('_runes')) {
        const groupType = buttonId.replace('hr_public_', '').replace('_runes', '');
        const hrValues = await getHrValues();
        const modal = createRuneGroupModal(groupType, true, hrValues);
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

    // Xử lý private interface
    if (buttonId.startsWith('hr_') && buttonId.endsWith('_runes')) {
      let groupType = buttonId.replace('hr_', '').replace('_runes', '');
      
      // Map button IDs to group types
      const buttonToGroupMap = {
        'group1': 'group1',
        'group2': 'group2', 
        'group3': 'group3',
        'low': 'group1',
        'mid': 'group2',
        'high': 'group3'
      };
      
      const actualGroupType = buttonToGroupMap[groupType];
      if (!actualGroupType) {
        return await interaction.reply({ content: '❌ Nhóm rune không hợp lệ!', flags: 1 << 6 });
      }
      
      const hrValues = await getHrValues();
      const modal = createRuneGroupModal(actualGroupType, false, hrValues);
      await interaction.showModal(modal);
    } else if (buttonId === 'hr_calculate') {
      await interaction.deferReply({ flags: 1 << 6 });
      await calculateAndShowHR(interaction, userId, false);
    } else if (buttonId === 'hr_reset') {
      userHrData.delete(userId);
      await interaction.reply({ content: '🔄 Đã reset tất cả dữ liệu HR!', flags: 1 << 6 });
    }
  } catch (error) {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}`, flags: 1 << 6 });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: `❌ Đã xảy ra lỗi khi xử lý button: ${error.message}` });
      }
    } catch (replyError) {
      logger.error('Lỗi khi gửi error message:', replyError);
    }
  }
}

async function handleHrModalSubmit(interaction) {
  try {
    const userId = interaction.user.id;
    const modalId = interaction.customId;

    if (!userHrData.has(userId)) {
      userHrData.set(userId, {});
    }
    const userData = userHrData.get(userId);

    const runeGroups = {
      hr_modal_group1: ['UM', 'MAL', 'IST'],
      hr_modal_group2: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'],
      hr_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD'],
      hr_public_modal_group1: ['UM', 'MAL', 'IST'],
      hr_public_modal_group2: ['GUL', 'VEX', 'OHM', 'LO', 'SUR'],
      hr_public_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD'],
    };

    const runes = runeGroups[modalId];
    if (!runes) {
      return await interaction.reply({ content: 'Modal không hợp lệ', flags: 1 << 6 });
    }

    let hasValidData = false;
    
    runes.forEach((runeName) => {
      const fieldId = `rune_${runeName.toLowerCase()}`;
      const value = interaction.fields.getTextInputValue(fieldId) || '0';
      const quantity = parseInt(value, 10) || 0;
      
      if (quantity > 0) {
        userData[runeName] = quantity;
        hasValidData = true;
      } else if (userData[runeName]) {
        // Xóa rune nếu số lượng là 0
        delete userData[runeName];
      }
    });

    if (hasValidData) {
  // Định nghĩa thứ tự rune từ cao đến thấp
  const runePriorityOrder = ['ZOD', 'CHAM', 'JAH', 'BER', 'SUR', 'LO', 'OHM', 'VEX', 'GUL', 'IST', 'MAL', 'UM'];
  
  const summary = Object.entries(userData)
    .filter(([_, quantity]) => quantity > 0)
    // Sắp xếp theo thứ tự ưu tiên
    .sort(([runeA], [runeB]) => {
      const indexA = runePriorityOrder.indexOf(runeA);
      const indexB = runePriorityOrder.indexOf(runeB);
      return indexA - indexB; // Sắp xếp từ cao (index thấp) đến thấp (index cao)
    })
    .map(([rune, quantity]) => `${rune}: ${quantity}`)
    .join(', ');
  
  console.log(`${interaction.user.tag}: ${summary}`); // Debug log
  await interaction.deferUpdate();
} else {
    }
  } catch (error) {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`, flags: 1 << 6 });
      } else {
        await interaction.followUp({ content: `❌ Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`, flags: 1 << 6 });
      }
    } catch (replyError) {
    }
  }
}

async function calculateAndShowHR(interaction, userId, isPublic = false) {
  try {
    const userData = userHrData.get(userId);
    
    // Kiểm tra xem có dữ liệu hợp lệ không
    if (!userData || Object.keys(userData).length === 0 || 
        Object.values(userData).every(quantity => quantity <= 0)) {
      if (interaction.deferred) {
        return await interaction.editReply({ content: '❌ Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.' });
      } else {
        return await interaction.reply({ content: '❌ Chưa có dữ liệu rune nào! Vui lòng nhập số lượng runes trước.', flags: 1 << 6 });
      }
    }

    const hrValues = await getHrValues();

    let totalHr = 0;
    const calculations = [];

    Object.entries(userData).forEach(([runeName, quantity]) => {
      if (quantity > 0 && hrValues[runeName]) {
        const value = hrValues[runeName] * quantity;
        totalHr += value;
        calculations.push({ name: runeName, quantity, unitValue: hrValues[runeName], totalValue: value });
      } else if (quantity > 0) {
        console.log(`Rune ${runeName} not found in HR values or value is 0`); // Debug log
      }
    });

    if (calculations.length === 0) {
      if (interaction.deferred) {
        return await interaction.editReply({ content: '❌ Không có rune hợp lệ để tính toán! Vui lòng kiểm tra lại dữ liệu rune.' });
      } else {
        return await interaction.reply({ content: '❌ Không có rune hợp lệ để tính toán! Vui lòng kiểm tra lại dữ liệu rune.', flags: 1 << 6 });
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`Tổng HR: **${totalHr.toFixed(2)}**`)
      .setDescription('Chi tiết tính toán:')
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    calculations.forEach((calc) => {
      embed.addFields({ 
        name: ``, 
        value: `${calc.quantity} × ${calc.name} = **${calc.totalValue.toFixed(2)}**`, 
        inline: false 
      });
    });

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], flags: 1 << 6 });
    }

    logger.info(M.hr.result({ user: interaction.user.tag, total: totalHr.toFixed(2) }));
  } catch (error) {
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: `❌ Lỗi khi tính toán HR: ${error.message}` });
      } else if (!interaction.replied) {
        await interaction.reply({ content: `❌ Lỗi khi tính toán HR: ${error.message}`, flags: 1 << 6 });
      }
    } catch (replyError) {
    }
  }
}

module.exports = {
  handleSlashHr,
  handleSlashSetupHr,
  handleHrModalSubmit,
  handleHrButton,
};