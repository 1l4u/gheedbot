const { EmbedBuilder } = require('discord.js');
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
 * Xử lý lệnh /hr để tính tổng giá trị HR
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashHr(interaction) {
  try {
    // Defer reply NGAY LẬP TỨC để tránh timeout - chỉ user thực hiện lệnh thấy
    await interaction.deferReply({ ephemeral: true });

    console.log(`Đang tính toán...`);

    // Kiểm tra quyền
    const permissionCheck = await checkCommandPermissions(interaction, 'hr');
    if (!permissionCheck.allowed) {
      return await interaction.editReply({
        content: permissionCheck.reason
      });
    }

    // Lấy tất cả options từ user
    const itemQuantities = {};

    // Lấy số lượng từng item
    Object.keys(HR_VALUES).forEach(itemName => {
      const quantity = interaction.options.getInteger(itemName.toLowerCase());
      if (quantity && quantity > 0) {
        itemQuantities[itemName] = quantity;
      }
    });

    // Tính toán
    let totalHr = 0;
    const calculations = [];

    Object.entries(itemQuantities).forEach(([itemName, quantity]) => {
      const value = HR_VALUES[itemName] * quantity;
      totalHr += value;
      calculations.push({
        name: itemName,
        quantity: quantity,
        unitValue: HR_VALUES[itemName],
        totalValue: value
      });
    });

    // Sắp xếp theo giá trị giảm dần
    calculations.sort((a, b) => b.totalValue - a.totalValue);

    // Tạo embed response với title là tổng HR
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${totalHr.toFixed(2)} HR`)
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    // Thêm từng calculation như một field riêng biệt
    calculations.forEach(calc => {
      embed.addFields({
        name: `${calc.quantity}x ${calc.name}`,
        value: `${calc.totalValue.toFixed(2)} HR`,
        inline: true
      });
    });

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`Tính toán HR hoàn thành: ${totalHr.toFixed(2)} HR`);
  } catch (error) {
    console.error('Lỗi tính toán HR:', error);
    await interaction.editReply({
      content: 'Lỗi khi tính toán HR. Vui lòng thử lại!'
    });
  }
}



module.exports = {
  handleSlashHr
};
