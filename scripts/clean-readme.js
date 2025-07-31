const fs = require('fs');

/**
 * Script để xóa tất cả emoji/icon trong README.md
 */

function cleanReadme() {
  const readmePath = './test/README.md';
  
  try {
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Xóa tất cả emoji/icon
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|🧪|✅|❌|⚠️|🔧|📊|💡|🚀|📁|📄|📦|🐙|👤|🌿|🎉|💥|📋|📈|🔴|🔄|🎯|🛠️|🔍|📞|🏁|⏱️|📝|💻|🌐|🔗|⭐|🔥|💪|🎨|🔒|🔓|🆕|🆙|🔀|🔁|🔂|🔃|🔄|🔅|🔆|🔇|🔈|🔉|🔊|🔋|🔌|🔍|🔎|🔏|🔐|🔑|🔒|🔓|🔔|🔕|🔖|🔗|🔘|🔙|🔚|🔛|🔜|🔝|🔞|🔟|🔠|🔡|🔢|🔣|🔤|🔥|🔦|🔧|🔨|🔩|🔪|🔫|🔬|🔭|🔮|🔯|🔰|🔱|🔲|🔳|🔴|🔵|🔶|🔷|🔸|🔹|🔺|🔻|🔼|🔽|🕐|🕑|🕒|🕓|🕔|🕕|🕖|🕗|🕘|🕙|🕚|🕛|🕜|🕝|🕞|🕟|🕠|🕡|🕢|🕣|🕤|🕥|🕦|🕧/gu;
    
    content = content.replace(emojiRegex, '');
    
    // Xóa các icon cụ thể còn sót lại
    const specificIcons = [
      '🧪', '✅', '❌', '⚠️', '🔧', '📊', '💡', '🚀', '📁', '📄', 
      '📦', '🐙', '👤', '🌿', '🎉', '💥', '📋', '📈', '🔴', '🔄',
      '🎯', '🛠️', '🔍', '📞', '🏁', '⏱️', '📝', '💻', '🌐', '🔗'
    ];
    
    specificIcons.forEach(icon => {
      content = content.replace(new RegExp(icon, 'g'), '');
    });
    
    // Dọn dẹp khoảng trắng thừa
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/^\s+/gm, '');
    content = content.replace(/\s+$/gm, '');
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Ghi lại file
    fs.writeFileSync(readmePath, content, 'utf8');
    console.log('Đã xóa tất cả icon trong README.md');
    
  } catch (error) {
    console.error('Lỗi xử lý README.md:', error.message);
  }
}

// Chạy script
if (require.main === module) {
  cleanReadme();
}

module.exports = { cleanReadme };
