const fs = require('fs');
const path = require('path');

/**
 * Script để tự động xóa icon và dịch text tiếng Anh sang tiếng Việt
 */

// Mapping các icon và text cần thay thế
const replacements = [
  // Icons trong console.log
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  { from: //g, to: '' },
  
  // Text tiếng Anh sang tiếng Việt
  { from: /Testing Commands\.\.\./g, to: 'Đang test Commands...' },
  { from: /Testing GitHub Data Fetcher\.\.\./g, to: 'Đang test GitHub Data Fetcher...' },
  { from: /Testing Data Manager\.\.\./g, to: 'Đang test Data Manager...' },
  { from: /Testing File Structure\.\.\./g, to: 'Đang test File Structure...' },
  { from: /Testing Permissions System\.\.\./g, to: 'Đang test Permissions System...' },
  { from: /ĐẠT/g, to: 'ĐẠT' },
  { from: /THẤT BẠI/g, to: 'THẤT BẠI' },
  { from: /LỖI/g, to: 'LỖI' },
  { from: /CẢNH BÁO/g, to: 'CẢNH BÁO' },
  { from: /THÀNH CÔNG/g, to: 'THÀNH CÔNG' },
  { from: /Starting Test Runner\.\.\./g, to: 'Đang khởi động Test Runner...' },
  { from: /ALL TESTS ĐẠT!/g, to: 'TẤT CẢ TESTS ĐÃ THÀNH CÔNG!' },
  { from: /SOME TESTS THẤT BẠI!/g, to: 'MỘT SỐ TESTS ĐÃ THẤT BẠI!' },
  { from: /Test hoàn thành thành công!/g, to: 'Test hoàn thành thành công!' },
  { from: /Kiểm tra nhanh GheedBot/g, to: 'Kiểm tra nhanh GheedBot' },
  { from: /Checking file structure\.\.\./g, to: 'Kiểm tra cấu trúc file...' },
  { from: /Checking JSON files\.\.\./g, to: 'Kiểm tra file JSON...' },
  { from: /Checking module loading\.\.\./g, to: 'Kiểm tra tải module...' },
  { from: /Checking GitHub configuration\.\.\./g, to: 'Kiểm tra cấu hình GitHub...' },
  { from: /JSON hợp lệ/g, to: 'JSON hợp lệ' },
  { from: /JSON không hợp lệ/g, to: 'JSON không hợp lệ' },
  { from: /Không tìm thấy/g, to: 'Không tìm thấy' },
  { from: /THIẾU/g, to: 'THIẾU' },
  { from: /Lỗi:/g, to: 'Lỗi:' },
  { from: /Kích hoạt:/g, to: 'Kích hoạt:' },
  { from: /Chủ sở hữu:/g, to: 'Chủ sở hữu:' },
  { from: /Repository:/g, to: 'Repository:' },
  { from: /Nhánh:/g, to: 'Nhánh:' }
];

/**
 * Xử lý một file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Áp dụng tất cả replacements
    replacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Ghi lại file nếu có thay đổi
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Đã cập nhật: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Lỗi xử lý file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Tìm tất cả file JS trong thư mục
 */
function findJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      findJSFiles(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main function
 */
function main() {
  console.log('Đang tìm và xử lý các file JS...');
  
  const projectRoot = path.join(__dirname, '..');
  const jsFiles = findJSFiles(projectRoot);
  
  console.log(`Tìm thấy ${jsFiles.length} file JS`);
  
  let processedCount = 0;
  
  jsFiles.forEach(file => {
    if (processFile(file)) {
      processedCount++;
    }
  });
  
  console.log(`\nHoàn thành! Đã xử lý ${processedCount}/${jsFiles.length} files`);
  
  if (processedCount === 0) {
    console.log('Không có file nào cần cập nhật');
  } else {
    console.log('Tất cả icons đã được xóa và text đã được dịch sang tiếng Việt');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { processFile, findJSFiles, replacements };
