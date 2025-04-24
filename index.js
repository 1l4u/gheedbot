require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const runewords = require("./runeword.json"); // File JSON của bạn
const crafts = require("./craft.json"); // File JSON của bạn

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(
    `Bot đã sẵn sàng: ${client.user.tag}`,
  );
});

client.on("messageCreate", async (message) => {
  if (!message.content.toLowerCase().startsWith("!rw")) return;

  const searchTerm = message.content.slice(4).trim();

  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.channel.send("```🐺 ẳng ẳng ẳng!```");
  }

  // Tìm kiếm không phân biệt hoa thường
  const foundKey = Object.keys(runewords).find(
    (key) => key.toLowerCase() === searchTerm.toLowerCase(),
  );

  if (!foundKey) {
    return message.channel.send(
      `\`\`\`\n🐺 ẳng ẳng ẳng!"${searchTerm}"\n\`\`\``,
    );
  }

  const item = runewords[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];

  try {
    // Gửi từng embed cho mỗi phiên bản
    for (const rw of itemsToDisplay) {
      const formattedText = `
      \`\`\`
      \nTên: ${rw.name || foundKey}
      \nLoại: ${rw.types?.join(", ") || "N/A"}
      \nYêu cầu cấp độ: ${rw.level || "N/A"}
      ${rw.option?.map((opt) => `\n${opt}`).join("") || "N/A"}
      \`\`\``.trim();
      await message.channel.send(formattedText);
    }
  } catch (error) {
    console.error("Lỗi khi gửi embed:", error);
    message.channel.send("```🐺 ẳng ẳng ẳng!``");
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.toLowerCase() === "!tung")
    return message.channel.send("🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷");
  if (message.content.toLowerCase() === "!crafting")
    return message.channel.send(
      "```Craft item sẽ nhận được các affix cố định(đọc trên wiki) cùng với tối đa 4 affix bổ sung.\nCác affix có thể nhận được phụ thuộc vào affix level(alvl), vốn phụ thuộc vào item level(ilvl). ilvl của vật phẩm craft được xác định bằng character level(clvl) và ilvl của phôi.\n- craft ilvl = clvl/2 + ilvl/2 (giá trị được làm tròn xuống)\n\nSố lượng affix bổ sung phụ thuộc vào ilvl:\n- ilvl 1-30 : 4 affix (20%), 3 affix (20%), 2 affix (20%), 1 affix (40%)\n- ilvl 31-50 : 4 affix (20%), 3 affix (20%), 2 affix (60%)\n- ilvl 51-70 : 4 affix (20%), 3 affix (80%)\n- ilvl 71+ : 4 affix (100%)\n+ Lưu ý rằng shop bán magic item(đồ xanh/blue) có ilvl = clvl+5, còn gamble có ilvl trong khoảng clvl-5 -> clvl+4. Ví dụ khi một nhân vật level 86 gamble amulet thì có thể nhận được một cái amulet có ilvl 90 và khi sử dụng amulet này để craft thì có cơ hội nhận được option +2 class skill(đây là một affix bổ sung). ilvl90 là tối tiểu để nhận được option trên```",
    );
  if (message.content.toLowerCase() === "!ar")
    return message.channel.send(
      "``` Hầu hết các kỹ năng sử dụng vũ khí đều yêu cầu kiểm tra trúng đích (Hit Check) để xác định xem đòn tấn công có thành công hay không. Chỉ số Tấn công (Attack Rating - AR) đối trọng với Phòng thủ (Defense) của mục tiêu trong công thức tính Tỷ lệ Trúng đích (Chance to Hit).\nCông thức cơ bản tính Chỉ số Tấn công (Base Attack Rating):\n\n          * Base Attack Rating = ((Dexterity - 7) * 5) + Class Constant\n\n           Dexterity: Chỉ số chính ảnh hưởng đến AR.\n           Class Constant: Hằng số riêng của mỗi nhân vật (ảnh hưởng đến AR cơ bản).\n\n Giải thích chi tiết:\n         * Hit Check (Kiểm tra trúng đích):\n         * Khi sử dụng kỹ năng gắn với vũ khí (ví dụ: Zeal, Fury, Strafe), game sẽ tính toán Chance to Hit dựa trên:\n         * AR (Attack Rating) của người tấn công.\n         * Defense của mục tiêu.\n Nếu Hit Check thành công, đòn đánh mới gây sát thương.\n     - Mỗi điểm Dexterity cung cấp +5 AR.\n     - Ví dụ: Nhân vật có 100 Dexterity sẽ nhận:\n          (100 - 7) * 5 = 465 AR (chưa cộng Class Constant)\n Class Constant (Hằng số nhân vật): Mỗi nhân vật có AR cơ bản khác nhau.\n          Amazon		 5\n          Assassin	   15\n          Barbarian	  20\n          Druid	  	5\n          Necromancer   -10\n          Paladin		20\n          Sorceress	 -15\nCông thức hoàn chỉnh tính Tỷ lệ Trúng đích (Chance to Hit):\n         * Chance to Hit (%) = 200% * (AR / (AR + Defense)) * (Attacker Level / (Attacker Level + Defender Level))\n     Nếu kết quả lớn hơn 95%, sẽ bị giới hạn ở 95%.(tỉ lệ đánh trúng tối đa là 95%)\n     Nếu kết quả dưới 5%, sẽ bị giới hạn ở 5%.(vì tỉ lệ đánh trúng tối tiểu là 5%)```",
    );
  if (message.content.toLowerCase() === "!itd")
    return message.channel.send(
      "``` *** Ignore Target Defense(itd): khi hiệu ứng này kích hoạt thì Defense của mục tiêu sẽ bằng 0 -> tỉ lệ đánh trúng của bạn sẽ tăng tối đa (95%). Lưu ý itd chỉ có tác dụng với quái thông thường, không có tác dụng với boss, player, mercenary và tất cả các quái có tên riêng(ví dụ như Bishibosh ở Cold Plain, hay Rakanishu ở Stony Field...)\n\n *** -Target Defense: Hiệu ứng này giúp giảm phòng thủ của mục tiêu theo % sau khi đã tính toán các hiệu ứng +xx%Defense trên phòng thủ cơ bản của chúng. Ví dụ quái có phòng thủ cơ bản là 1000. và +200% defense -> phòng thủ quái là 3000 -> áp dụng hiệu ứng -target defense lên giá trị cuối là 3000. Lưu ý hiệu ứng này chỉ có tác dụng bằng 1 nửa với các mục tiêu sau: player, mercenary, boss, quái có tên riêng(boss maps,...)```",
    );
  if (message.content.toLowerCase() === "!ias")
    return message.channel.send(
      "```Hầu hết các đòn tấn công sử dụng breakpoint tiêu chuẩn, trừ những đòn tấn công đặc biệt như (multi hit, wereform) sử dụng breakpoint khác.\n\n *** Công thức: TAS = Effective Item IAS + Skill IAS - WSM\n\n - WSM: Weapon Speed Modifier là chỉ số tấn công cơ bản của vũ khí(club là -10, mace là 0...)\n - Skill IAS: Tốc độ đánh từ kỹ năng(Burst of Speed, Frenzy, Werewoft, Fânticism), và các hiệu ứng giảm tốc từ quái(Decrepify, Holy Freeze)\n - Effective Item IAS: %IAS từ trang bị\n - TAS: Total Attack Speed: Tổng tốc độ đánh sau cùng\n\n Trường hợp đặc biệt:\n     * Nếu WSM = Skill IAS = 0 thì TAS = Effective Item IAS\n     * Nếu WSM hoặc Skill IAS khác 0 thì Effective Item IAS = TAS - Skill IAS + WSM\n\n\n *** Khi biến hình(Wereform Weapon Threshold - WWT) được tính bằng :\n\n           WWT = WIAS(Weapon IAS) - WSM\n\n Tốc độ đánh của Werewolf/Werebear phụ thuộc mạnh vào IAS trên vũ khí (Weapon IAS) hơn các đòn tấn công thông thường\n Weapon IAS KHÔNG bao gồm IAS từ trang bị khác (như găng tay, áo giáp). Nó là giá trị trên vũ khí, không phải Effective IAS. Do đó, không thể cộng trừ trực tiếp với Total Attack Speed (TAS) trong bảng breakpoint\n WWT càng cao → TAS càng cao (vì Weapon IAS đồng thời tăng cả WWT và TAS). Werewolf cung cấp +20 tốc độ đánh tối thiểu(level của werewolf càng cao cung cấp tốc độ đánh càng nhiều, werewolf level 20 +68% ias), giúp bù đắp WSM chậm (ví dụ: War Pike +20) và ngăn TAS âm.```",
    );
  if (message.content.toLowerCase() === "!bp")
    return message.channel.send(
      "``` *** Diablo 2 chạy ở 25 khung hình/giây(FPS), và mọi hành động trong game đều được tính theo từng khung hình riêng. Vì vậy, để cải thiện tốc độ(fcr,fhr,fbr,ias) tjò bạn giảm được ít nhất 1 khung hình(frame). Những ngưỡng để giảm khung hình này được gọi là 'Breakpoint'\n\n     - Với 100% Fcr(Faster cast rate), Sorceress có thể đạt được frame 9 tương đương 9/25 = 0,36 giây (ngoại trừ các kỹ năng thuộc dạng slow như chain lightning và frozen orb)\n\n     - Để đạt được 8 frame thì cần có 105 FCR. Nếu chỉ có 104 FCR thì tốc độ cast skill vẫn là 9 frames vì 104 không đủ để vượt ngưỡng breakpoint tiếp theo là 105```",
    );
  if (message.content.toLowerCase() === "!affix")
    return message.channel.send(
      "```Cấp độ tiền tố (Affix Level - alvl) quyết định những tiền tố (affix) nào có thể xuất hiện trên trang bị. alvl được tính dựa trên 3 yếu tố:\n     Cấp độ vật phẩm (Item Level - ilvl) – Thay đổi tùy nguồn rơi.\n     Cấp độ chất lượng (Quality Level - qlvl) – Cố định theo loại trang bị.\n     Cấp độ ma thuật (Magic Level - maglvl) – Chỉ áp dụng cho một số vật phẩm đặc biệt.\nCông thức tính alvl:\n     1. Nếu qlvl > ilvl: ilvl = qlvl\n Trang bị không thể rơi với ilvl thấp hơn qlvl của nó, trừ khi bị biến đổi (ví dụ: Imbue hoặc công thức Cube).\n     2. Vật phẩm có maglvl > 0: alvl = ilvl + maglvl\nÁp dụng cho: Wands, Staves, Orbs: maglvl = 1. Circlet (3), Coronet (8), Tiara (13), Diadem (18).\n Ảnh hưởng: Giảm ilvl tối thiểu để nhận affix cao cấp.\n Ví dụ: Tiara (maglvl=13) có thể nhận +2 class skill ở ilvl 77 (thay vì 90+). Diadem (maglvl=18, qlvl=86): Luôn có alvl = 99 (ilvl không quan trọng).\n     3. Vật phẩm thông thường (maglvl = 0):\nNếu ilvl < (99 - [qlvl/2]):  alvl = ilvl - [qlvl/2]\n Ngược lại: alvl = 2*ilvl - 99 \nVật phẩm có qlvl thấp (ví dụ: Amulet, Ring, Jewel, Quiver - qlvl=1): alvl = ilvl \n Vật phẩm có qlvl cao (ví dụ: Elite Unique): Cần ilvl cao để đạt alvl tối đa. \n\nGiải thích qua ví dụ:\n Một Amulet (qlvl=1) rơi ở ilvl 90: alvl = 90 (vì qlvl=1) → Có thể nhận mọi affix yêu cầu alvl ≤ 90.\n Một Archon Plate (qlvl=85) rơi ở ilvl 85: 99 - [85/2] = 57 → ilvl (85) > 57 → alvl = 2*85 - 99 = 71 → Đủ điều kiện nhận affix cấp 71+.\n Một Tiara (qlvl=55, maglvl=13) rơi ở ilvl 77: alvl = 77 + 13 = 90 → Nhận được +2 class skill (yêu cầu alvl 90).```",
    );
  if (message.content.toLowerCase() === "!cs")
    return message.channel.send(
      "```Sát thương chí mạng (Critical Damage) đã được cân bằng lại để cải thiện việc lựa chọn trang bị, giúp Deadly Strike(DS) có sức mạnh tương đương với các chỉ số khác. Nhiều nguồn tỷ lệ chí mạng cũng được điều chỉnh tương tự, đồng thời một số kỹ năng được tăng sát thương để bù đắp.\nThay đổi quan trọng:\n     Giới hạn tỷ lệ chí mạng(crit chance):\n          Mỗi nguồn chí mạng (Deadly Strike, Critical Strike, Weapon Mastery) giờ bị giới hạn 75% (thay vì 100%).\n          Sát thương chí mạng chỉ nhân 1.5x (thay vì 2x) sát thương vật lý.\n     Chỉ số mới:\n          '+x% maximum Deadly Strike' xuất hiện trên một số trang bị (ví dụ: Wraithskin, Death Cleaver, Headstriker).\n          Cho phép đạt 100% DS nếu kết hợp đủ các nguồn này.\nCó 3 nguồn tăng crit chance:\n          Deadly Strike (DS): Từ trang bị (Highlord’s Wrath, Gore Rider) hoặc kỹ năng Blessed Aim (Paladin).\n          Critical Strike (CS): Kỹ năng Critical Strike (Amazon), Joust (Paladin).\n          Weapon Mastery (WM): General Mastery, Polearm/Spear Mastery, Throwing Mastery, Claw/Dagger Mastery, Javelin/Spear Mastery.\n\n     Công thức tính tổng tỷ lệ chí mạng:\n          Tổng Crit Chance = 1 - [(1 - DS) × (1 - CS) × (1 - WM)] (Làm tròn xuống đến % gần nhất)\n\n Ví dụ 1: Amazon có: 50% DS (từ trang bị), 50% CS (từ kỹ năng) 0% WM:\n          1 - [(1 - 0.50) × (1 - 0.50)] = 1 - (0.5 × 0.5) = 75%\n Ví dụ 2: Amazon có: 40% DS, 65% CS, 30% WM (từ Javelin Mastery)\n          1 - [(0.6) × (0.35) × (0.7)] = 1 - 0.147 = 85.3% → Làm tròn thành **85%**\nGiới hạn tối đa lý thuyết: 75% DS + 75% CS + 35% WM → ~95% tổng crit chance.```",
    );
  if (message.content.toLowerCase() === "!ow")
    return message.channel.send(
      "```Open Wounds gây sát thương vật lý theo thời gian. Lượng sát thương phụ thuộc vào cấp độ của nhân vật gây ra hiệu ứng này\nSát thương giờ đây chịu ảnh hưởng bởi thuộc tính mới: '+X Open Wounds Damage per Second', thường đi kèm với hiệu ứng 'X% Chance of Open Wounds'.\nSát thương OW giờ cũng bị ảnh hưởng bởi by Physical Damage Reduction(giảm sát thương vật lý) ví dụ như các kỹ năng: Battle Cry, Amplify Damage, Defiance, v.v.\nSát thương OW không bị ảnh hưởng bởi các bộ tăng sát thương khác.\nHiệu ứng OW giờ cũng được kích hoạt bởi 'Attacker Takes Damage of X', ngoài các đòn tấn công thông thường.\nThời gian hiệu lực của OW giờ là 5 giây (trước đây là 8 giây) và có thể chồng tối đa 3 lần trên mỗi mục tiêu.\nOW giờ chịu giảm hiệu lực còn 1/4 khi áp dụng lên pets và mercenary.\nOW không còn bị giảm một nửa sát thương khi áp dụng lên các kẻ địch mạnh (champions, uniques, super uniques, bosses, prime evils).\n\n\nCharacter Level 	1 	2 	3 	4 	5 	6 	7 	8 	9 	10 	11 	12 	13 	14 	15 	16 	17 	18 	19 	20 	21 	22 	23 	24 	25\nDamage per Second 	3 	4 	5 	6 	7 	8 	9 	10 	10 	11 	12 	13 	14 	15 	16 	17 	19 	21 	23 	25 	26 	28 	30 	32 	33\nCharacter Level 	26 	27 	28 	29 	30 	31 	32 	33 	34 	35 	36 	37 	38 	39 	40 	41 	42 	43 	44 	45 	46 	47 	48 	49 	50\nDamage per Second 	35 	37 	39 	40 	42 	45 	47 	50 	53 	55 	58 	61 	63 	66 	68 	71 	74 	76 	79 	82 	85 	89 	92 	96 	99\nCharacter Level 	51 	52 	53 	54 	55 	56 	57 	58 	59 	60 	61 	62 	63 	64 	65 	66 	67 	68 	69 	70 	71 	72 	73 	74 	75\nDamage per Second 	103 	106 	110 	113 	117 	120 	124 	127 	131 	134 	139 	143 	148 	152 	156 	161 	165 	170 	174 	178 	183 	187 	191 	196 	200\nCharacter Level 	76 	77 	78 	79 	80 	81 	82 	83 	84 	85 	86 	87 	88 	89 	90 	91 	92 	93 	94 	95 	96 	97 	98 	99\nDamage per Second 	205 	209 	213 	218 	222 	227 	231 	235 	240 	244 	249 	253 	257 	262 	266 	271 	275 	279 	284 	288 	293 	297 	301 	306```",
    );
  if (message.content.toLowerCase() === "!cb")
    return message.channel.send(
      "```Crushing Blow (cb) giảm một phần máu hiện tại của mục tiêu, do đó hiệu quả hơn với những mục tiêu có nhiều máu, và kém hiệu quả hơn khi mục tiêu yếu máu.\nĐòn tấn công có thể có tối đa 100% cơ hội gây Crushing Blow — mọi phần trăm vượt quá sẽ không có tác dụng thêm.\nCrushing Blow giờ bị giảm hiệu lực mạnh hơn đối với boss (boss act, boss map, Uber boss...). Lượng máu bị giảm bởi đòn cận chiến giờ đã bằng với đòn tấn công tầm xa.\nBảng tỉ lệ giảm máu theo loại mục tiêu:\n     Hầu hết mục tiêu*	1/8\n     Super Uniques	    1/8\n     Boss	             1/80**\n     Players,Mercenary	1/10\n* 'Hầu hết mục tiêu' bao gồm normal, minion, Champion, and Unique.\n** Tác động bởi giảm dần hiệu quả (diminishing returns) theo công thức: 1 / (80 + (missing hp%)^2)```",
    );
  if (message.content.toLowerCase() === "!cmd")
    return message.channel.send(
      "```!rw botd\n!ct blood\n!ias\n!itd\n!ar\n!affix\n!bp\n!crafting\n!tung\n!cs\n!cb```",
    );
});

client.on("messageCreate", async (message) => {
  if (!message.content.toLowerCase().startsWith("!ct")) return;

  const searchTerm = message.content.slice(4).trim();

  // Kiểm tra đầu vào
  if (!searchTerm) {
    return message.channel.send("```🐺 ẳng ẳng ẳng!```");
  }

  // Tìm kiếm không phân biệt hoa thường
  const foundKey = Object.keys(crafts).find(
    (key) => key.toLowerCase() === searchTerm.toLowerCase(),
  );

  if (!foundKey) {
    return message.channel.send(
      `\`\`\`\n🐺 ẳng ẳng ẳng! "${searchTerm}"\n\`\`\``,
    );
  }

  const item = crafts[foundKey];

  // Xử lý cả trường hợp item là array hoặc object
  const itemsToDisplay = Array.isArray(item) ? item : [item];



  let combinedContent = `\`\`\`\nCraft ${searchTerm}\n`;

  itemsToDisplay.forEach((craft, index) => {
    combinedContent += `\n------- ${craft.type || foundKey} -------`;
    combinedContent += `\n\nCông thức: ${craft.name}\n`;
    combinedContent += `\n${craft.option?.map((opt) => `${opt}`).join("\n") || "N/A"}\n`;
  });

  combinedContent += "\n```";

  // Gửi một lần duy nhất
  await message.channel.send(combinedContent);
});

// Luôn ưu tiên dùng process.env
const token = process.env.DISCORD_TOKEN || ""; // Không đọc từ file .env

client.login(token).catch(console.error);
