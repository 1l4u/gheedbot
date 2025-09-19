const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');
const { logger } = require('../utils/logger');
const { M } = require('../utils/log-messages');

/**
 * Weapon command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashWeapon(interaction) {
  logger.debug(M.commands.weaponCalled({ user: interaction.user.tag }));

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    logger.warn(M.hr.setupDenied({ user: interaction.user.tag, reason: permissionCheck.reason }));
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    // Lấy và kiểm tra giá trị name
    const nameOption = interaction.options.getString('name');
    if (!nameOption) {
      logger.debug(M.debug.interactionNameMissing);
      return await interaction.editReply({
        content: 'Vui lòng cung cấp tên weapon'
      });
    }
    const name = nameOption.toLowerCase();
    logger.debug(M.commands.weaponSearching({ name }));

    // Lấy dữ liệu weapons từ data manager
    const weapons = await dataManager.getWeapons();
    if (!Array.isArray(weapons)) {
      logger.error(M.weapon.invalidData);
      return await interaction.editReply({
        content: 'Dữ liệu weapon không hợp lệ'
      });
    }

    // Tìm weapon khớp chính xác với name (exact match)
    let matchedWeapon = weapons.find(
      weapon => weapon && typeof weapon.name === 'string' && weapon.name.toLowerCase() === name
    );

    // Nếu không tìm thấy exact match, tìm partial match đầu tiên
    if (!matchedWeapon) {
      matchedWeapon = weapons.find(
        weapon => weapon && typeof weapon.name === 'string' && weapon.name.toLowerCase().includes(name)
      );
    }

    if (!matchedWeapon) {
      return await interaction.editReply({
        content: `Không tìm thấy weapon "${name}"`
      });
    }

    // Tạo embed cho weapon duy nhất
    const weapon = matchedWeapon;
    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`${weapon.name}`);

    // Tạo các fields cho thông tin weapon
    const fields = [];

    // Damage field
    if (weapon.min && weapon.max) {
      fields.push({
        name: '',
        value: `Damage: ${weapon.min} - ${weapon.max}`,
      });
    }

    // WSM field
    if (weapon.speed !== undefined && weapon.speed !== '') {
      fields.push({
        name: '',
        value: `WSM: ${weapon.speed}`,
      });
    }

    // Required field (Strength - Dexterity)
    if (weapon.reqstr !== undefined && weapon.reqstr !== '') {
      const strValue = weapon.reqstr;
      const dexValue = weapon.reqdex !== undefined && weapon.reqdex !== '' ? weapon.reqdex : '0';
      fields.push({
        name: '',
        value: `Required: Str: ${strValue} - Dex: ${dexValue}`,
      });
    }

    // Thêm các fields vào embed
    if (fields.length > 0) {
      embed.addFields(fields);
    }

    // Thêm footer với thông tin bổ sung
    const footerInfo = [];
    if (weapon.levelreq) footerInfo.push(`Level: ${weapon.levelreq}`);
    if (weapon.StrBonus) footerInfo.push(`StrBonus: ${weapon.StrBonus}`);
    if (weapon.DexBonus) footerInfo.push(`DexBonus: ${weapon.DexBonus}`);

    if (footerInfo.length > 0) {
      embed.setFooter({ text: footerInfo.join(' | ') });
    }

    logger.debug(M.commands.weaponFound({ weapon: weapon.name, name }));

    // Gửi kết quả (chỉ 1 embed)
    await interaction.editReply({
      embeds: [embed]
    });

  } catch (error) {
    logger.error(M.weapon.error, error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm weapon'
    });
  }
}

module.exports = {
  handleSlashWeapon
};
