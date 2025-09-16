const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');

/**
 * Runeword command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashRuneword(interaction) {
  console.log(`Lệnh runeword được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền runeword cho ${interaction.user.tag}: ${permissionCheck.reason}`);
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
        content: 'Vui lòng cung cấp tên runeword'
      });
    }
    const name = nameOption.toLowerCase();
    console.log(`Đang tìm kiếm runeword: ${name}`);

    // Lấy dữ liệu runewords từ data manager
    const runewords = await dataManager.getRunewords();
    if (!Array.isArray(runewords)) {
      console.log('Dữ liệu runeword không hợp lệ: không phải array');
      return await interaction.editReply({
        content: 'Dữ liệu runeword không hợp lệ'
      });
    }

    // Tìm tất cả các runeword khớp với name
    const matchedRunewords = runewords.filter(
      item => item && typeof item.name === 'string' && item.name.toLowerCase() === name
    );

    if (matchedRunewords.length === 0) {
      return await interaction.editReply({
        content: `Không tìm thấy runeword "${name}"`
      });
    }

    // Tạo embeds và files cho từng runeword khớp
    const embeds = [];
    const files = [];

    for (const runeword of matchedRunewords) {
      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle(`${runeword.name}${runeword.type ? ` (${runeword.type})` : ''}`)
        .addFields(
          { name: '', value: runeword.types.join(', ') || 'N/A'},
          { name: '', value: 'Required Level: ' + runeword.level || 'N/A'}
        );

      // Xử lý options hoặc text
      let textContent = '';
      if (runeword.option && Array.isArray(runeword.option)) {
        textContent = runeword.option.join('\n');
      } else if (typeof runeword.option === 'string') {
        textContent = runeword.option;
      } else {
        textContent = 'Không có thông tin chi tiết';
      }

      // Chia text thành nhiều fields nếu quá dài
      const maxFieldLength = 1024;
      const fields = [];

      if (textContent.length <= maxFieldLength) {
        fields.push({
          name: '',
          value: textContent,
          inline: false
        });
      } else {
        let remainingText = textContent;
        let partNumber = 1;

        while (remainingText.length > 0) {
          await new Promise(resolve => setImmediate(resolve));
          let chunk = remainingText.substring(0, maxFieldLength);

          if (remainingText.length > maxFieldLength) {
            const lastNewline = chunk.lastIndexOf('\n');
            const lastSpace = chunk.lastIndexOf(' ');
            const breakPoint = lastNewline > -1 ? lastNewline : (lastSpace > -1 ? lastSpace : maxFieldLength);

            if (breakPoint > 0 && breakPoint < maxFieldLength) {
              chunk = chunk.substring(0, breakPoint);
            }
          }

          fields.push({
            name: partNumber === 1 ? '' : ``,
            value: chunk,
            inline: false
          });

          remainingText = remainingText.substring(chunk.length).trim();
          partNumber++;

          if (partNumber > 5) {
            fields.push({
              name: 'Thông tin bị cắt',
              value: '... (nội dung quá dài, đã bị cắt)',
              inline: false
            });
            break;
          }
        }
      }

      embed.addFields(fields);

      if (runeword.url) {
        embed.setURL(runeword.url);
      }

      // Xử lý file attachment nếu nội dung quá dài
      if (textContent && textContent.length > 4000) {
        const buffer = Buffer.from(textContent, 'utf8');
        const attachment = new AttachmentBuilder(buffer, {
          name: `${runeword.name}${runeword.type ? `_${runeword.type}` : ''}_info.txt`,
          description: `Thông tin đầy đủ cho ${runeword.name}${runeword.type ? ` (${runeword.type})` : ''}`
        });
        files.push(attachment);

        embed.addFields([{
          name: '📎 File đính kèm',
          value: 'Nội dung đầy đủ được gửi trong file đính kèm',
          inline: false
        }]);
      }

      embeds.push(embed);
    }

    await interaction.editReply({
      embeds: embeds,
      files: files
    });

    console.log(`Đã gửi phản hồi runeword cho: ${name}`);
  } catch (error) {
    console.error('Lỗi lệnh runeword:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm runeword'
    });
  }
}

module.exports = {
  handleSlashRuneword
};