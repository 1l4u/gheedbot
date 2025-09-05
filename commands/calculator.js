const { EmbedBuilder } = require('discord.js');
const { checkCommandPermissions } = require('../utils/permissions');
const { dataManager } = require('../utils/data-manager');

/**
 * Parse jewel string format: ED-MaxDmg,ED-MaxDmg với validation
 * Ví dụ: "40-15,39-25" → [{ed: 40, maxDmg: 15}, {ed: 39, maxDmg: 25}]
 * @param {string} jewelString - Jewel string to parse
 * @returns {Object} - {totalED: number, totalMaxDmg: number, jewels: Array, errors: Array}
 */
function parseJewelString(jewelString) {
  if (!jewelString || jewelString.trim() === '') {
    return { totalED: 0, totalMaxDmg: 0, jewels: [], errors: [] };
  }

  try {
    const jewels = [];
    const errors = [];
    let totalED = 0;
    let totalMaxDmg = 0;

    // Split by comma để lấy từng jewel
    const jewelParts = jewelString.split(',').map(part => part.trim());

    for (let i = 0; i < jewelParts.length; i++) {
      const jewelPart = jewelParts[i];
      if (jewelPart === '') continue;

      // Kiểm tra cả hai định dạng: ED-MaxDmg hoặc chỉ ED
      const match = jewelPart.match(/^(\d+)(?:-(\d+))?$/);
      if (match) {
        const ed = parseInt(match[1]);
        const maxDmg = match[2] ? parseInt(match[2]) : 0; // Nếu không có MaxDmg, mặc định là 0

        // Validation jewel stats
        const jewelErrors = [];
        if (ed < 0 || ed > 45) {
          jewelErrors.push(`ED phải từ 0-40% (nhận: ${ed}%). Hoặc Ohm = 45`);
        }
        if (match[2] && (maxDmg < 0 || maxDmg > 30)) {
          jewelErrors.push(`Max Dmg phải từ 0-30 (nhận: ${maxDmg})`);
        }

        if (jewelErrors.length > 0) {
          errors.push(`Jewel ${i + 1} (${jewelPart}): ${jewelErrors.join(', ')}`);
          console.log(`Invalid jewel stats: ${jewelPart} - ${jewelErrors.join(', ')}`);
        } else {
          jewels.push({ ed, maxDmg });
          totalED += ed;
          totalMaxDmg += maxDmg;
          console.log(`Valid jewel: ${jewelPart} (${ed}% ED, +${maxDmg} Max Dmg)`);
        }
      } else {
        errors.push(`Jewel ${i + 1}: Format sai "${jewelPart}" (cần: ED hoặc ED-MaxDmg)`);
        console.log(`Invalid jewel format: ${jewelPart} (expected: ED hoặc ED-MaxDmg)`);
      }
    }

    console.log(`Parsed jewels: ${jewels.length} valid jewels, Total ED: ${totalED}%, Total Max Dmg: +${totalMaxDmg}`);
    if (errors.length > 0) {
      console.log(`Jewel errors: ${errors.length} errors found`);
    }

    return { totalED, totalMaxDmg, jewels, errors };

  } catch (error) {
    console.error('Lỗi parse jewel string:', error);
    return { totalED: 0, totalMaxDmg: 0, jewels: [], errors: [`Lỗi parse: ${error.message}`] };
  }
}

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
        { name: '', value: `Deadly Strike: ${ds}%`, inline: true },
        { name: '', value: `Critical Strike: ${cs}%`, inline: true },
        { name: '', value: `Weapon Mastery: ${wm}%`, inline: true },
        { name: '', value: `Total Crit Chance: ${effectiveCrit}%`, inline: false }
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
        { name: '', value: `TAS: ${tas}%`, inline: true },
        { name: '', value: `EIAS: ${eias}%`, inline: true },
        { name: '', value: `Công thức: TAS = EIAS + Skill_IAS - WSM\n- EIAS = (120 * IAS) / (120 + IAS)` }
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
        { name: '', value: `IAS cần thiết: ${ias.toFixed(2)}%`, inline: true }
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
  console.log(`Lệnh dmgcal được gọi bởi ${interaction.user.tag}`);

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
    const addMin = interaction.options.getInteger('add_min') || 0;
    const addMax = interaction.options.getInteger('add_max') || 0;
    const ethOption = interaction.options.getString('eth') || 'false';
    const isEth = ethOption === 'true';
    const edLvl = interaction.options.getInteger('ed_lvl') || 0;
    const maxLvl = interaction.options.getInteger('max_lvl') || 0;
    // Parse jewel string (format: ED-MaxDmg,ED-MaxDmg)
    const jewelString = interaction.options.getString('jewel') || '';
    const jewelStats = parseJewelString(jewelString);

    // Kiểm tra lỗi jewel và thông báo cho user
    if (jewelStats.errors.length > 0) {
      const errorMessage = [
        '**Lỗi Jewel Stats:**',
        '',
        ...jewelStats.errors,
        '',
        '📋 **Yêu cầu:**',
        '• ED: 0-40%',
        '• Max Dmg: 0-30',
        '• Format: ED-MaxDmg (ví dụ: 40-15)',
        '',
        '💡 **Ví dụ hợp lệ:** `40-15,39-25,38-20`'
      ].join('\n');

      await interaction.editReply({
        content: 'Có cái đầu buồi jewel ' + `**${jewelString}**`
      });
      return;
    }

    // Chuyển đổi min/max từ string sang number
    let minBase = parseInt(weapon.min);
    let maxBase = parseInt(weapon.max);

    // Áp dụng Ethereal bonus (+25% base damage) nếu được chọn
    if (isEth) {
      minBase = Math.floor(minBase * 1.25);
      maxBase = Math.floor(maxBase * 1.25);
    }

    // Tính toán damage với jewel stats
    const totalED = ed + jewelStats.totalED;
    const totalAddMax = addMax + jewelStats.totalMaxDmg;

    const minDamage = Math.floor((minBase * (1 + totalED/100))) + addMin;
    const maxDamage = Math.floor((maxBase * (1 + totalED/100))) + totalAddMax + maxLvl + Math.floor(maxBase * edLvl/100);

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle(`${weapon.name}${isEth ? ' (Ethereal)' : ''}`)
      .addFields(
        { name: '', value: `**Damage**: ${minDamage} - ${maxDamage}`},
        { name: '', value: `**Base Damage**: ${isEth ? `${minBase} - ${maxBase}` : `${weapon.min} - ${weapon.max}`}`},
      )
      .setFooter({ text: `WSM: ${weapon.speed}\nRequested by: ${interaction.user.username}` });
    if(totalED > 0 || addMin > 0 || totalAddMax > 0){
     const additionalFields = [];
      if (totalED > 0) additionalFields.push(`Enhanced Damage: ${totalED}%`);
      if (addMin > 0) additionalFields.push(`Add Min: ${addMin}`);
      if (totalAddMax > 0) additionalFields.push(`Add Max: ${totalAddMax}`);

      // Hiển thị jewel details nếu có
    if (jewelStats.jewels.length > 0) {
      const jewelDetails = jewelStats.jewels.map((jewel, index) =>
        `Socket ${index + 1}: ${jewel.ed > 40 ? `${jewel.ed} ED` : `${jewel.ed}-${jewel.maxDmg}`}`
      ).join('\n');
      additionalFields.push(`\n**Sockets:**\n${jewelDetails}`);
    }

      embed.addFields({
        name: 'Options',
        value: additionalFields.join('\n'),
        inline: false
      });
    }

    // Thêm thông tin ED/Lvl và Max/Lvl nếu có
    if (edLvl > 0 || maxLvl > 0) {
      const additionalFields = [];
      if (edLvl > 0) additionalFields.push(`ED/Lvl: ${edLvl}%`);
      if (maxLvl > 0) additionalFields.push(`Max/Lvl: ${maxLvl}`);

      embed.addFields({
        name: 'Level Bonuses',
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
