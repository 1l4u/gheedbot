const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const config = require('../config.json');

/**
 * Debug command để kiểm tra channel và bot info
 * Chỉ cho phép users có allowed roles sử dụng
 * @param {Interaction} interaction - Discord interaction
 * @param {Client} client - Discord client
 */
async function handleSlashDebug(interaction, client) {
  console.log(`Lệnh debug được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - yêu cầu role, không yêu cầu channel cụ thể
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: false, // Debug có thể dùng ở bất kỳ đâu
    requireRole: true      // Nhưng cần có role được phép
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền debug cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    console.log(`🔍 Starting debug response...`);
    
    const channelId = interaction.channel.id;
    const guildId = interaction.guild?.id || 'DM';
    const userId = interaction.user.id;
    const isAllowedChannel = config.allowedChannels?.includes(channelId);
    const hasAllowedRole = interaction.member?.roles.cache.some(role => 
      config.allowedRoles.includes(role.id)
    );
    
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🔍 Debug Information')
      .addFields(
        { name: 'Channel ID', value: `\`${channelId}\``, inline: true },
        { name: 'Guild ID', value: `\`${guildId}\``, inline: true },
        { name: 'User ID', value: `\`${userId}\``, inline: true },
        { name: 'Allowed Channel?', value: isAllowedChannel ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Has Allowed Role?', value: hasAllowedRole ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Bot Status', value: client.isReady() ? '✅ Ready' : '❌ Not Ready', inline: true },
        { name: 'Allowed Channels', value: config.allowedChannels?.map(id => `\`${id}\``).join('\n') || 'None', inline: false },
        { name: 'Allowed Roles', value: config.allowedRoles?.map(id => `\`${id}\``).join('\n') || 'None', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(`✅ Debug response sent successfully`);
  } catch (error) {
    console.error('❌ Debug command error:', error);
    await interaction.editReply({
      content: 'Lỗi khi thực hiện debug command'
    });
  }
}

module.exports = {
  handleSlashDebug
};
