const fs = require('fs');
const path = require('path');

/**
 * Script để dịch các text tiếng Anh trong test files
 */

// Mapping các text cần dịch
const translations = {
  // Test descriptions
  'Constructor creates instance': 'Constructor tạo instance',
  'setRepository updates config': 'setRepository cập nhật config',
  'Cache operations work': 'Các thao tác cache hoạt động',
  'URL construction is correct': 'Xây dựng URL đúng',
  'HTTP request handles errors': 'HTTP request xử lý lỗi',
  'fetchFile handles errors gracefully': 'fetchFile xử lý lỗi một cách nhẹ nhàng',
  'getCacheInfo returns correct format': 'getCacheInfo trả về định dạng đúng',
  'Command files exist and have correct structure': 'File commands tồn tại và có cấu trúc đúng',
  'Calculator command exports correct functions': 'Command Calculator export đúng functions',
  'HR command exports correct functions': 'Command HR export đúng functions',
  'Weapon command exports correct functions': 'Command Weapon export đúng functions',
  'Runeword command exports correct functions': 'Command Runeword export đúng functions',
  'Wiki command exports correct functions': 'Command Wiki export đúng functions',
  'Debug command exports correct functions': 'Command Debug export đúng functions',
  'HR command logic works with mock data': 'Logic command HR hoạt động với mock data',
  'Project structure is correct': 'Cấu trúc project đúng',
  'Commands directory has required files': 'Thư mục commands có các file cần thiết',
  'Utils directory has required files': 'Thư mục utils có các file cần thiết',
  'Config directory structure': 'Cấu trúc thư mục config',
  'Data directory structure': 'Cấu trúc thư mục data',
  'Scripts directory structure': 'Cấu trúc thư mục scripts',
  'package.json is valid': 'package.json hợp lệ',
  'index.js has correct structure': 'index.js có cấu trúc đúng',
  'File permissions are reasonable': 'Quyền file hợp lý',
  'Permissions functions exist': 'Các function permissions tồn tại',
  'Config loading works': 'Tải config hoạt động',
  'Bypass permission works': 'Quyền bypass hoạt động',
  'Valid command check works': 'Kiểm tra command hợp lệ hoạt động',
  'Command permissions work with mock data': 'Quyền command hoạt động với mock data',
  'Error handling works': 'Xử lý lỗi hoạt động',
  
  // Error messages
  'Failed to create instance': 'Thất bại khi tạo instance',
  'Cache not initialized': 'Cache không được khởi tạo',
  'Base URL not set': 'Base URL không được thiết lập',
  'Owner not set correctly': 'Owner không được thiết lập đúng',
  'Repo not set correctly': 'Repo không được thiết lập đúng',
  'Branch not set correctly': 'Branch không được thiết lập đúng',
  'Cache get failed': 'Cache get thất bại',
  'Cache data incorrect': 'Dữ liệu cache không đúng',
  'Cache clear failed': 'Cache clear thất bại',
  'Should have thrown an error': 'Nên đã ném một lỗi',
  'Should have thrown error for non-existent data type': 'Nên đã ném lỗi cho loại dữ liệu không tồn tại',
  'Unexpected error': 'Lỗi không mong đợi',
  'Should not have thrown an error': 'Không nên ném lỗi',
  'Expected error, test passed': 'Lỗi mong đợi, test đạt',
  'Expected behavior': 'Hành vi mong đợi',
  
  // File and directory messages
  'not found': 'không tìm thấy',
  'skipping': 'bỏ qua',
  'missing': 'thiếu',
  'should be': 'nên là',
  'does not export': 'không export',
  'method not found': 'không tìm thấy method',
  'is not a directory': 'không phải là thư mục',
  'is not a file': 'không phải là file',
  'is not valid JSON': 'không phải JSON hợp lệ',
  'should contain an array': 'nên chứa một array',
  'is empty': 'trống',
  'missing required field': 'thiếu trường bắt buộc',
  'should be boolean': 'nên là boolean',
  'should be string': 'nên là string',
  'should return': 'nên trả về',
  'should have': 'nên có',
  'should not': 'không nên',
  'should allow': 'nên cho phép',
  'should not allow': 'không nên cho phép',
  
  // Test runner messages
  'Found': 'Tìm thấy',
  'test files': 'file test',
  'No tests found': 'Không tìm thấy tests',
  'Running': 'Đang chạy',
  'crashed': 'bị crash',
  'does not have function': 'không có function',
  'Total Tests': 'Tổng số Tests',
  'Passed': 'Đạt',
  'Failed': 'Thất bại',
  'Success Rate': 'Tỷ lệ thành công',
  'FAILED TESTS': 'TESTS THẤT BẠI',
  'Unknown': 'Không xác định',
  'ALL TESTS PASSED': 'TẤT CẢ TESTS ĐÃ ĐẠT',
  'SOME TESTS FAILED': 'MỘT SỐ TESTS ĐÃ THẤT BẠI',
  
  // Console messages
  'Loaded test': 'Đã tải test',
  'Failed to load test': 'Thất bại khi tải test',
  'does not have runTests()': 'không có runTests()',
  'Test Summary': 'Tóm tắt Test',
  'Test Details': 'Chi tiết Test',
  'Duration': 'Thời gian',
  'Generated on': 'Được tạo vào',
  'HTML report generated': 'Đã tạo báo cáo HTML',
  'JSON report generated': 'Đã tạo báo cáo JSON',
  'Reports generated': 'Đã tạo báo cáo',
  'Visual report': 'Báo cáo trực quan',
  'Machine readable': 'Máy đọc được'
};

/**
 * Dịch nội dung file
 */
function translateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Áp dụng tất cả translations
    Object.entries(translations).forEach(([english, vietnamese]) => {
      const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const newContent = content.replace(regex, vietnamese);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Ghi lại file nếu có thay đổi
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Đã dịch: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Lỗi dịch file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('Đang dịch các file test...');
  
  const testDir = path.join(__dirname, '..', 'test');
  const testFiles = fs.readdirSync(testDir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(testDir, file));
  
  console.log(`Tìm thấy ${testFiles.length} file test`);
  
  let translatedCount = 0;
  
  testFiles.forEach(file => {
    if (translateFile(file)) {
      translatedCount++;
    }
  });
  
  console.log(`\nHoàn thành! Đã dịch ${translatedCount}/${testFiles.length} files`);
  
  if (translatedCount === 0) {
    console.log('Không có file nào cần dịch');
  } else {
    console.log('Tất cả text tiếng Anh đã được dịch sang tiếng Việt');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { translateFile, translations };
