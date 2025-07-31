const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const runewords = require('../runeword.json');

/**
 * Runeword command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashRuneword(interaction) {
  console.log(` Runeword command called by ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(` Runeword permission denied for ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const name = interaction.options.getString('name');
    console.log(`🔍 Searching runeword: ${name}`);
    
    const runeword = runewords[name];
    
    if (!runeword) {
      return await interaction.editReply({
        content: `Không tìm thấy runeword "${name}"`
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`${name}`)
      .addFields(
        { name: '', value: runeword.name || 'N/A' },
        { name: '', value: Array.isArray(runeword.types) ? runeword.types.join(', ') : (runeword.types || 'N/A') },
        { name: '', value: 'Required Level: ' + runeword.level?.toString() || 'N/A'}
      );

    if (runeword.option && runeword.option.length > 0) {
      const propertiesText = runeword.option.join('\n');

      // Chia properties thành nhiều fields nếu quá dài
      const maxFieldLength = 1024;

      if (propertiesText.length <= maxFieldLength) {
        embed.addFields([{
          name: 'Properties',
          value: propertiesText,
          inline: false
        }]);
      } else {
        // Chia thành nhiều parts
        let remainingText = propertiesText;
        let partNumber = 1;

        while (remainingText.length > 0 && partNumber <= 3) {
          let chunk = remainingText.substring(0, maxFieldLength);

          // Tìm vị trí ngắt dòng gần nhất
          if (remainingText.length > maxFieldLength) {
            const lastNewline = chunk.lastIndexOf('\n');
            if (lastNewline > 0) {
              chunk = chunk.substring(0, lastNewline);
            }
          }

          embed.addFields([{
            name: partNumber === 1 ? '' : ``,
            value: chunk,
            inline: false
          }]);

          remainingText = remainingText.substring(chunk.length).trim();
          partNumber++;
        }

        // Nếu vẫn còn text, thêm note
        if (remainingText.length > 0) {
          embed.addFields([{
            name: 'Lưu ý',
            value: '',
            inline: false
          }]);
        }
      }
    }

    await interaction.editReply({
      embeds: [embed]
    });

    console.log(` Runeword response sent for: ${name}`);
  } catch (error) {
    console.error(' Runeword command error:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm runeword'
    });
  }
}

module.exports = {
  handleSlashRuneword
};
