/**
 * Quick Test - Kiểm tra nhanh các chức năng cơ bản
 */

const fs = require('fs');

console.log('Kiểm tra nhanh GheedBot\n');

// Test 1: File structure
console.log('Kiểm tra cấu trúc file...');
const requiredFiles = [
  'index.js',
  'package.json',
  'commands/hr.js',
  'commands/weapon.js',
  'utils/data-manager.js',
  'config/github-config.json'
];

let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  OK ${file}`);
  } else {
    console.log(`  THIẾU ${file} - THIẾU`);
    filesOk = false;
  }
});

// Test 2: JSON files
console.log('\nKiểm tra file JSON...');
const jsonFiles = [
  'config/github-config.json',
  'data/weapon.json',
  'data/runeword.json'
];

let jsonOk = true;
jsonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      JSON.parse(content);
      console.log(`  OK ${file} - JSON hợp lệ`);
    } catch (error) {
      console.log(`  LỖI ${file} - JSON không hợp lệ: ${error.message}`);
      jsonOk = false;
    }
  } else {
    console.log(`  CẢNH BÁO ${file} - Không tìm thấy`);
  }
});

// Test 3: Module loading
console.log('\nKiểm tra tải module...');
const modules = [
  { path: './commands/hr', name: 'Lệnh HR' },
  { path: './utils/data-manager', name: 'Quản lý dữ liệu' },
  { path: './utils/permissions', name: 'Quyền hạn' }
];

let modulesOk = true;
modules.forEach(mod => {
  try {
    require(`../${mod.path}`);
    console.log(`  OK ${mod.name}`);
  } catch (error) {
    console.log(`  LỖI ${mod.name} - Lỗi: ${error.message}`);
    modulesOk = false;
  }
});

// Test 4: GitHub config
console.log('\nKiểm tra cấu hình GitHub...');
try {
  const githubConfig = require('../config/github-config.json');
  console.log(`  Kích hoạt: ${githubConfig.enabled}`);
  console.log(`  Chủ sở hữu: ${githubConfig.owner}`);
  console.log(`  Repository: ${githubConfig.repo}`);
  console.log(`  Nhánh: ${githubConfig.branch}`);

  if (githubConfig.enabled && (!githubConfig.owner || !githubConfig.repo)) {
    console.log(`  CẢNH BÁO GitHub đã bật nhưng thiếu owner/repo`);
  }
} catch (error) {
  console.log(`  LỖI cấu hình GitHub: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('TÓM TẮT KIỂM TRA NHANH');
console.log('='.repeat(50));

if (filesOk && jsonOk && modulesOk) {
  console.log('TẤT CẢ KIỂM TRA CƠ BẢN ĐÃ THÀNH CÔNG!');
  console.log('Bot đã sẵn sàng để chạy');
  console.log('\nĐể chạy test đầy đủ: node test/run-all-tests.js');
} else {
  console.log('ĐÃ TÌM THẤY MỘT SỐ VẤN ĐỀ!');
  console.log('Vui lòng sửa các vấn đề ở trên');
  console.log('\nCách sửa thông thường:');
  console.log('   - npm install (cho các module bị thiếu)');
  console.log('   - Kiểm tra đường dẫn file và quyền truy cập');
  console.log('   - Xác minh cú pháp JSON');
}

console.log('='.repeat(50));
