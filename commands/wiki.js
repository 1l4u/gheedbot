const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions, replyPermissionError } = require('../utils/permissions');
const wiki = require('../wiki.json');

/**
 * Wiki command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashWiki(interaction) {
  console.log(`🔧 Wiki command called by ${interaction.user.tag}`);
  
  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });
  
  if (!permissionCheck.allowed) {
    console.log(`❌ Wiki permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await replyPermissionError(interaction, permissionCheck.reason);
  }

  try {
    const name = interaction.options.getString('name');
    console.log(`🔍 Searching wiki: ${name}`);
    
    const wikiItem = wiki[name];
    
    if (!wikiItem) {
      return await interaction.reply({
        content: `Không tìm thấy thông tin wiki cho "${name}"`,
        flags: 1 << 6
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`📖 ${name}`);
    
    if (wikiItem.properties && wikiItem.properties.length > 0) {
      embed.addFields({
        name: '',
        value: wikiItem.text.join('\n'),
        inline: false
      });
    }

    if (wikiItem.url) {
      embed.setURL(wikiItem.url);
    }

    await interaction.reply({
      embeds: [embed],
      flags: 1 << 6
    });
    
    console.log(`✅ Wiki response sent for: ${name}`);
  } catch (error) {
    console.error('❌ Wiki command error:', error);
    await interaction.reply({
      content: 'Đã xảy ra lỗi khi tìm kiếm wiki',
      flags: 1 << 6
    });
  }
}

module.exports = {
  handleSlashWiki
};
