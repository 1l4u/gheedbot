const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const wiki = require('../wiki.json');

/**
 * Wiki command handler
 * @param {Interaction} interaction - Discord interaction
 */
async function handleSlashWiki(interaction) {
  console.log(`Lệnh wiki được gọi bởi ${interaction.user.tag}`);

  // Defer reply để tránh timeout
  await interaction.deferReply({ flags: 1 << 6 });

  // Kiểm tra permissions - chỉ yêu cầu channel, không cần role
  const permissionCheck = checkCommandPermissions(interaction, {
    requireChannel: true,
    requireRole: false
  });

  if (!permissionCheck.allowed) {
    console.log(`Từ chối quyền wiki cho ${interaction.user.tag}: ${permissionCheck.reason}`);
    return await interaction.editReply({
      content: permissionCheck.reason
    });
  }

  try {
    const name = interaction.options.getString('name');
    console.log(`Đang tìm kiếm wiki: ${name}`);

    const wikiItem = wiki[name];

    if (!wikiItem) {
      return await interaction.editReply({
        content: `Không tìm thấy thông tin wiki cho "${name}"`
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`${name}`);

    // Xử lý text content
    let textContent = '';
    if (wikiItem.text && Array.isArray(wikiItem.text)) {
      textContent = wikiItem.text.join('\n');
    } else if (typeof wikiItem.text === 'string') {
      textContent = wikiItem.text;
    }

    if (textContent) {
      // Chia text thành nhiều fields nếu quá dài
      const maxFieldLength = 1024;
      const fields = [];

      if (textContent.length <= maxFieldLength) {
        // Nếu ngắn, chỉ cần 1 field
        fields.push({
          name: '',
          value: textContent,
          inline: false
        });
      } else {
        // Chia thành nhiều parts
        let remainingText = textContent;
        let partNumber = 1;

        while (remainingText.length > 0) {
          let chunk = remainingText.substring(0, maxFieldLength);

          // Tìm vị trí ngắt dòng gần nhất để không cắt giữa từ
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

          // Giới hạn tối đa 5 fields để tránh spam
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
    } else {
      embed.setDescription('Không có thông tin chi tiết');
    }

    if (wikiItem.url) {
      embed.setURL(wikiItem.url);
    }

    // Nếu nội dung gốc quá dài (>4000 chars), gửi kèm file attachment
    let files = [];
    if (textContent && textContent.length > 4000) {
      const buffer = Buffer.from(textContent, 'utf8');
      const attachment = new AttachmentBuilder(buffer, {
        name: `${name}_info.txt`,
        description: `Full information for ${name}`
      });
      files.push(attachment);

      // Thêm note về file attachment
      embed.addFields([{
        name: 'File đính kèm',
        value: 'Nội dung đầy đủ được gửi trong file đính kèm',
        inline: false
      }]);
    }

    await interaction.editReply({
      embeds: [embed],
      files: files
    });

    console.log(`Đã gửi phản hồi wiki cho: ${name}`);
  } catch (error) {
    console.error('Lỗi lệnh wiki:', error);
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi tìm kiếm wiki'
    });
  }
}

module.exports = {
  handleSlashWiki
};
