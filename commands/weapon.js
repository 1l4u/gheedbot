const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const weapons = require('../weapon.json');

/**
 * Weapon command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashWeapon(interaction) {
  console.log(`Lệnh weapon được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền weapon cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    // Lấy và kiểm tra giá trị name
    const nameOption = interaction.options.getString('name');
    if (!nameOption) {
      console.log('Không có tên được cung cấp trong interaction');
      return await interaction.editReply({
        content: 'Vui lòng cung cấp tên weapon'
      });
    }
    const name = nameOption.toLowerCase();
    console.log(`Đang tìm kiếm weapon: ${name}`);

    // Kiểm tra dữ liệu weapons
    if (!Array.isArray(weapons)) {
      console.log('Dữ liệu weapon không hợp lệ: không phải array');
      return await interaction.editReply({
        content: 'Dữ liệu weapon không hợp lệ'
      });
    }

    // Tìm tất cả các weapon khớp với name
    const matchedWeapons = weapons.filter(
      weapon => weapon && typeof weapon.name === 'string' && weapon.name.toLowerCase().includes(name)
    );

    if (matchedWeapons.length === 0) {
      return await interaction.editReply({
        content: `Không tìm thấy weapon "${name}"`
      });
    }

    // Giới hạn số lượng kết quả hiển thị
    const maxResults = 5;
    const weaponsToShow = matchedWeapons.slice(0, maxResults);

    // Tạo embeds cho từng weapon
    const embeds = [];

    for (const weapon of weaponsToShow) {
      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle(`${weapon.name}`);

      // Tạo các fields cho thông tin weapon
      const fields = [];

      // Damage field
      if (weapon.min && weapon.max) {
        fields.push({
          name: 'Damage',
          value: `${weapon.min} - ${weapon.max}`,
          inline: true
        });
      }

      // WSM field
      if (weapon.wsm !== undefined && weapon.wsm !== '') {
        fields.push({
          name: 'WSM',
          value: weapon.wsm,
          inline: true
        });
      }

      // Required field (Strength - Dexterity)
      if (weapon.str !== undefined && weapon.str !== '') {
        const strValue = weapon.str;
        const dexValue = weapon.dex !== undefined && weapon.dex !== '' ? weapon.dex : '0';
        fields.push({
          name: 'Required',
          value: `${strValue} - ${dexValue}`,
          inline: true
        });
      }

      // Socket field
      if (weapon.sock !== undefined && weapon.sock !== '') {
        fields.push({
          name: 'Socket',
          value: weapon.sock,
          inline: true
        });
      }

      // Thêm các fields vào embed
      if (fields.length > 0) {
        embed.addFields(fields);
      }

      // Thêm footer với thông tin bổ sung
      const footerInfo = [];
      if (weapon.code) footerInfo.push(`Code: ${weapon.code}`);
      if (weapon.qlvl) footerInfo.push(`QLvl: ${weapon.qlvl}`);
      if (weapon.rlvl) footerInfo.push(`RLvl: ${weapon.rlvl}`);

      if (footerInfo.length > 0) {
        embed.setFooter({ text: footerInfo.join(' | ') });
      }

      embeds.push(embed);
    }

    // Thêm thông báo nếu có nhiều kết quả hơn
    if (matchedWeapons.length > maxResults) {
      const additionalEmbed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setDescription(`Tìm thấy ${matchedWeapons.length} weapons. Chỉ hiển thị ${maxResults} kết quả đầu tiên.`);
      embeds.push(additionalEmbed);
    }

    console.log(`Tìm thấy ${weaponsToShow.length} weapons cho "${name}"`);

    // Gửi kết quả
    await interaction.editReply({
      embeds: embeds
    });

  } catch (error) {
    console.error('Lỗi trong lệnh weapon:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm weapon'
    });
  }
}

module.exports = {
  handleSlashWeapon
};
