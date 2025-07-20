const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');

/**
 * Crit Chance calculator command
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashCritChance(interaction) {
  console.log(`🔧 CritChance command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`❌ CritChance permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
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
      .setTitle('🎯 Crit Chance Calculator')
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

    console.log(`✅ CritChance response sent`);
  } catch (error) {
    console.error('❌ CritChance command error:', error);
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
  console.log(`🔧 TAS command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`❌ TAS permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
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

    console.log(`✅ TAS response sent`);
  } catch (error) {
    console.error('❌ TAS command error:', error);
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
  console.log(`🔧 IAS command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`❌ IAS permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
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

    console.log(`✅ IAS response sent`);
  } catch (error) {
    console.error('❌ IAS command error:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán IAS'
    });
  }
}

/**
 * Damage calculator command
 * @param {Interaction} interaction - Discord interaction
 */
async function handleDmgCalculator(interaction) {
  console.log(`🔧 DmgCalculator command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`❌ DmgCalculator permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const minBase = interaction.options.getInteger('min_base');
    const maxBase = interaction.options.getInteger('max_base');
    const ed = interaction.options.getInteger('ed');
    const addMin = interaction.options.getInteger('add_min');
    const addMax = interaction.options.getInteger('add_max');

    const minDamage = Math.floor((minBase * (100 + ed)) / 100) + addMin;
    const maxDamage = Math.floor((maxBase * (100 + ed)) / 100) + addMax;
    const avgDamage = (minDamage + maxDamage) / 2;

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle('⚔️ Damage Calculator')
      .addFields(
        { name: 'Min Damage', value: minDamage.toString(), inline: true },
        { name: 'Max Damage', value: maxDamage.toString(), inline: true },
        { name: 'Average Damage', value: avgDamage.toFixed(1), inline: true }
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` });

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`✅ DmgCalculator response sent`);
  } catch (error) {
    console.error('❌ DmgCalculator command error:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tính toán damage'
    });
  }
}

module.exports = {
  handleSlashCritChance,
  handleSlashTas,
  handleSlashIas,
  handleDmgCalculator
};
