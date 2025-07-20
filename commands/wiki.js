const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const wiki = require('../wiki.json');

/**
 * Wiki command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashWiki(interaction) {
  console.log(`🔧 Wiki command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`❌ Wiki permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const name = interaction.options.getString('name');
    console.log(`🔍 Searching wiki: ${name}`);

    const wikiItem = wiki[name];

    if (!wikiItem) {
      return await interaction.editReply({
        content: `Không tìm thấy thông tin wiki cho "${name}"`
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`📖 ${name}`);

    // Xử lý text content
    let textContent = '';
    if (wikiItem.text && Array.isArray(wikiItem.text)) {
      textContent = wikiItem.text.join('\n');
    } else if (typeof wikiItem.text === 'string') {
      textContent = wikiItem.text;
    }

    if (textContent) {
      // Truncate nếu quá dài (Discord limit 1024 chars per field)
      if (textContent.length > 1024) {
        textContent = textContent.substring(0, 1021) + '...';
      }

      embed.addFields([{
        name: 'Information',
        value: textContent,
        inline: false
      }]);
    } else {
      embed.setDescription('Không có thông tin chi tiết');
    }

    if (wikiItem.url) {
      embed.setURL(wikiItem.url);
    }

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`✅ Wiki response sent for: ${name}`);
  } catch (error) {
    console.error('❌ Wiki command error:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm wiki'
    });
  }
}

module.exports = {
  handleSlashWiki
};
