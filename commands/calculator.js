const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');

/**
 * Crit Chance calculator command
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashCritChance(interaction) {
  console.log(`Lệnh CritChance được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền CritChance cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const ds = interaction.options.getInteger('ds');
    const cs = interaction.options.getInteger('cs');
    const wm = interaction.options.getInteger('wm');

    // Convert to decimal for calculation
    const dsDecimal = ds / 100;
    const csDecimal = cs / 100;
    const wmDecimal = wm / 100;

    // Calculate total crit chance using the formula: 1 - [(1 - DS) × (1 - CS) × (1 - WM)]
    const totalCritDecimal = 1 - ((1 - dsDecimal) * (1 - csDecimal) * (1 - wmDecimal));
    const totalCrit = Math.floor(totalCritDecimal * 100); // Convert back to percentage and round down
    const effectiveCrit = Math.min(totalCrit, 95); // Cap at 95%

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Crit Chance Calculator')
      .addFields(
        { name: 'Deadly Strike', value: `${ds}%`, inline: true },
        { name: 'Critical Strike', value: `${cs}%`, inline: true },
        { name: 'Weapon Mastery', value: `${wm}%`, inline: true },
        { name: 'Total Crit Chance', value: `${effectiveCrit}%`, inline: false }
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`Đã gửi phản hồi CritChance`);
  } catch (error) {
    console.error('Lỗi lệnh CritChance:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán crit chance'
    });
  }
}

/**
 * TAS (Total Attack Speed) calculator command
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashTas(interaction) {
  console.log(`Lệnh TAS được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền TAS cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const ias = interaction.options.getInteger('ias');
    const skillIas = interaction.options.getInteger('skill_ias');
    const wsm = interaction.options.getInteger('wsm');

    const eias = Math.floor((120 * ias) / (120 + ias));
    const tas = eias + skillIas - wsm;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .addFields(
        { name: `TAS`, value: `${tas}%`, inline: true },
        { name: `EIAS`, value: `${eias}%`, inline: true },
        { name: 'Công thức', value: `- TAS = EIAS + Skill_IAS - WSM\n- EIAS = (120 * IAS) / (120 + IAS)` }
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`Đã gửi phản hồi TAS`);
  } catch (error) {
    console.error('Lỗi lệnh TAS:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán TAS'
    });
  }
}

/**
 * IAS calculator command
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashIas(interaction) {
  console.log(`Lệnh IAS được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền IAS cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
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

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`Đã gửi phản hồi IAS`);
  } catch (error) {
    console.error('Lỗi lệnh IAS:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán IAS'
    });
  }
}

/**
 * Damage calculator 2 command với weapon picker
 * @param {Interaction} interaction - Discord interaction
 */
async function handleDmgCalculator2(interaction) {
  console.log(`Lệnh dmgcal2 được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền dmgcal2 cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    // Lấy tên weapon
    const itemName = interaction.options.getString('item');
    if (!itemName) {
      return await interaction.editReply({
        content: 'Vui lòng chọn weapon'
      });
    }

    // Lấy dữ liệu weapons và tìm weapon
    const weapons = await dataManager.getWeapons();
    const weapon = weapons.find(w => w.name.toLowerCase() === itemName.toLowerCase());
    if (!weapon) {
      return await interaction.editReply({
        content: `Không tìm thấy weapon "${itemName}"`
      });
    }

    // Kiểm tra weapon có min/max damage không
    if (!weapon.min || !weapon.max) {
      return await interaction.editReply({
        content: `Weapon "${itemName}" không có thông tin damage`
      });
    }

    // Lấy các tham số khác
    const ed = interaction.options.getInteger('ed');
    const addMin = interaction.options.getInteger('add_min');
    const addMax = interaction.options.getInteger('add_max');
    const isEth = interaction.options.getBoolean('eth') || false;
    const edLvl = interaction.options.getInteger('ed_lvl') || 0;
    const maxLvl = interaction.options.getInteger('max_lvl') || 0;

    // Chuyển đổi min/max từ string sang number
    let minBase = parseInt(weapon.min);
    let maxBase = parseInt(weapon.max);

    // Áp dụng Ethereal bonus (+25% base damage) nếu được chọn
    if (isEth) {
      minBase = Math.floor(minBase * 1.25);
      maxBase = Math.floor(maxBase * 1.25);
    }

    // Tính toán damage
    const minDamage = Math.floor((minBase * (100 + ed + edLvl)) / 100) + addMin;
    const maxDamage = Math.floor((maxBase * (100 + ed + edLvl)) / 100) + addMax + maxLvl;

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`${weapon.name}${isEth ? ' (Ethereal)' : ''}`)
      .addFields(
        { name: 'Base Damage: ', value: isEth ? `${parseInt(weapon.min)} - ${parseInt(weapon.max)} → ${minBase} - ${maxBase}` : `${minBase} - ${maxBase}`},
        { name: 'Final Damage: ', value: minDamage.toString() + ' - ' + maxDamage.toString()},
        { name: 'WSM', value: weapon.speed, inline: false }
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    // Thêm thông tin ED/Lvl và Max/Lvl nếu có
    if (edLvl > 0 || maxLvl > 0) {
      const additionalFields = [];
      if (edLvl > 0) additionalFields.push(`ED/Lvl: ${edLvl}%`);
      if (maxLvl > 0) additionalFields.push(`Max/Lvl: ${maxLvl}`);

      embed.addFields({
        name: 'Per Level Bonuses',
        value: additionalFields.join('\n'),
        inline: false
      });
    }

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`Đã gửi phản hồi Damage Calculator`);
  } catch (error) {
    console.error('Lỗi lệnh Damage Calculator:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán damage'
    });
  }
}

module.exports = {
  handleSlashCritChance,
  handleSlashTas,
  handleSlashIas,
  handleDmgCalculator2
};
