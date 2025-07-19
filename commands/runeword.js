const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions, replyPermissionError } = require('../utils/permissions');
const runewords = require('../runeword.json');

/**
 * Runeword command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashRuneword(interaction) {
  console.log(`🔧 Runeword command called by ${interaction.user.tag}`);
  
  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });
  
  if (!permissionCheck.allowed) {
    console.log(`❌ Runeword permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await replyPermissionError(interaction, permissionCheck.reason);
  }

  try {
    const name = interaction.options.getString('name');
    console.log(`🔍 Searching runeword: ${name}`);
    
    const runeword = runewords[name];
    
    if (!runeword) {
      return await interaction.reply({
        content: `Không tìm thấy runeword "${name}"`,
        flags: 1 << 6
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🏺 ${name}`)
      .addFields(
        { name: 'Runes', value: runeword.runes || 'N/A', inline: true },
        { name: 'Item Types', value: runeword.itemtypes || 'N/A', inline: true },
        { name: 'Required Level', value: runeword.rlvl?.toString() || 'N/A', inline: true }
      );

    if (runeword.properties && runeword.properties.length > 0) {
      embed.addFields({
        name: 'Properties',
        value: runeword.properties.join('\n'),
        inline: false
      });
    }

    await interaction.reply({
      embeds: [embed],
      flags: 1 << 6
    });
    
    console.log(`✅ Runeword response sent for: ${name}`);
  } catch (error) {
    console.error('❌ Runeword command error:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi tìm kiếm runeword',
      flags: 1 << 6
    });
  }
}

module.exports = {
  handleSlashRuneword
};
