const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');

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
    // Lấy và kiểm tra giá trị name
    const nameOption = interaction.options.getString('name');
    if (!nameOption) {
      console.log('Không có tên được cung cấp trong interaction');
      return await interaction.editReply({
        content: 'Vui lòng cung cấp tên mục wiki'
      });
    }
    const name = nameOption.toLowerCase();
    console.log(`Đang tìm kiếm wiki: ${name}`);

    // Lấy dữ liệu wiki từ data manager
    const wiki = await dataManager.getWikis();
    if (!Array.isArray(wiki)) {
      console.log('Dữ liệu wiki không hợp lệ: không phải array');
      return await interaction.editReply({
        content: 'Dữ liệu wiki không hợp lệ'
      });
    }

    // Tìm tất cả các mục wiki khớp với name
    const matchedWikiItems = wiki.filter(
      item => item && typeof item.name === 'string' && item.name.toLowerCase() === name
    );

    if (matchedWikiItems.length === 0) {
      return await interaction.editReply({
        content: `Không tìm thấy thông tin wiki cho "${name}"`
      });
    }

    // Tạo embeds và files cho từng mục wiki khớp
    const embeds = [];
    const files = [];

    for (const wikiItem of matchedWikiItems) {
      // Xử lý text content
      let textContents = [];
      if (wikiItem.text && Array.isArray(wikiItem.text)) {
        textContents = wikiItem.text;
      } else if (typeof wikiItem.text === 'string') {
        textContents = [wikiItem.text];
      } else {
        textContents = ['Không có thông tin chi tiết'];
      }

      // Tạo embed cho mỗi phần text
      for (let i = 0; i < textContents.length; i++) {
        const textContent = textContents[i];
        const embed = new EmbedBuilder()
          .setColor('#ff6600')
          .setTitle(`${wikiItem.name}${textContents.length > 1 ? ` ` : ''}`);

        if (wikiItem.url) {
          embed.setURL(wikiItem.url);
        }


        if (textContent) {
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
              let chunk = remainingText.substring(0, maxFieldLength);

              // Tìm vị trí ngắt dòng hoặc khoảng trắng gần nhất
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

              // Giới hạn tối đa 5 fields
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

        // Xử lý file attachment nếu nội dung quá dài
        if (textContent && textContent.length > 4000) {
          const buffer = Buffer.from(textContent, 'utf8');
          const attachment = new AttachmentBuilder(buffer, {
            name: `${wikiItem.name}${textContents.length > 1 ? `_part${i + 1}` : ''}_info.txt`,
            description: `Thông tin đầy đủ cho ${wikiItem.name}${textContents.length > 1 ? `` : ''}`
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
    }

    await interaction.editReply({
      embeds: embeds,
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