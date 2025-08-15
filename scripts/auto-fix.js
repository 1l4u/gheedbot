/**
 * Auto-fix script cho các vấn đề thường gặp của GheedBot
 */

const fs = require('fs');
const path = require('path');

class AutoFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  /**
   * Kiểm tra và sửa file structure
   */
  checkFileStructure() {
    console.log('🔍 Kiểm tra cấu trúc file...');
    
    const requiredFiles = [
      'index.js',
      'package.json',
      '.env',
      'config/config.json',
      'config/github-config.json',
      'data/weapon.json',
      'data/runeword.json',
      'data/wiki.json',
      'utils/data-manager.js',
      'utils/github-data.js',
      'utils/permissions.js'
    ];

    const requiredDirs = [
      'commands',
      'config',
      'data',
      'utils',
      'test',
      'scripts'
    ];

    // Kiểm tra directories
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`📁 Tạo thư mục: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        this.fixes.push(`Tạo thư mục ${dir}`);
      }
    });

    // Kiểm tra files
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        console.log(`❌ Thiếu file: ${file}`);
        this.errors.push(`Thiếu file ${file}`);
      } else {
        console.log(`✅ File OK: ${file}`);
      }
    });
  }

  /**
   * Kiểm tra và sửa JSON files
   */
  checkJsonFiles() {
    console.log('\n🔍 Kiểm tra file JSON...');
    
    const jsonFiles = [
      'package.json',
      'config/config.json',
      'config/github-config.json',
      'data/weapon.json',
      'data/runeword.json',
      'data/wiki.json'
    ];

    jsonFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          JSON.parse(content);
          console.log(`✅ JSON OK: ${file}`);
        } catch (error) {
          console.log(`❌ JSON lỗi: ${file} - ${error.message}`);
          this.errors.push(`JSON lỗi trong ${file}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Kiểm tra environment variables
   */
  checkEnvironment() {
    console.log('\n🔍 Kiểm tra environment variables...');
    
    const requiredEnvs = ['DISCORD_TOKEN', 'CLIENT_ID'];
    const optionalEnvs = ['PORT', 'NODE_ENV'];
    
    // Load .env file
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      requiredEnvs.forEach(env => {
        if (envVars[env]) {
          console.log(`✅ ENV OK: ${env}`);
        } else {
          console.log(`❌ ENV thiếu: ${env}`);
          this.errors.push(`Environment variable ${env} không được đặt`);
        }
      });

      optionalEnvs.forEach(env => {
        if (envVars[env]) {
          console.log(`✅ ENV OK: ${env} = ${envVars[env]}`);
        } else {
          console.log(`⚠️ ENV tùy chọn: ${env} chưa được đặt`);
        }
      });
    } else {
      console.log('❌ File .env không tồn tại');
      this.errors.push('File .env không tồn tại');
    }
  }

  /**
   * Sửa package.json scripts
   */
  fixPackageScripts() {
    console.log('\n🔧 Kiểm tra package.json scripts...');
    
    if (!fs.existsSync('package.json')) {
      console.log('❌ package.json không tồn tại');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const requiredScripts = {
        'start': 'node index.js',
        'dev': 'node index.js',
        'test': 'node test/run-all-tests.js',
        'test:quick': 'node test/quick-test.js'
      };

      let needsUpdate = false;
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
        needsUpdate = true;
      }

      Object.entries(requiredScripts).forEach(([script, command]) => {
        if (!packageJson.scripts[script]) {
          console.log(`➕ Thêm script: ${script}`);
          packageJson.scripts[script] = command;
          needsUpdate = true;
          this.fixes.push(`Thêm script ${script}`);
        }
      });

      if (needsUpdate) {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ Đã cập nhật package.json');
      } else {
        console.log('✅ Package.json scripts OK');
      }
      
    } catch (error) {
      console.log(`❌ Lỗi xử lý package.json: ${error.message}`);
      this.errors.push(`Lỗi package.json: ${error.message}`);
    }
  }

  /**
   * Tạo file .gitignore nếu thiếu
   */
  createGitignore() {
    console.log('\n🔧 Kiểm tra .gitignore...');
    
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', gitignoreContent);
      console.log('✅ Đã tạo .gitignore');
      this.fixes.push('Tạo file .gitignore');
    } else {
      console.log('✅ .gitignore đã tồn tại');
    }
  }

  /**
   * Chạy tất cả các fixes
   */
  async runAllFixes() {
    console.log('🤖 GheedBot Auto-Fix Tool');
    console.log('='.repeat(50));
    
    this.checkFileStructure();
    this.checkJsonFiles();
    this.checkEnvironment();
    this.fixPackageScripts();
    this.createGitignore();
    
    this.printSummary();
  }

  /**
   * In tóm tắt kết quả
   */
  printSummary() {
    console.log('\n📊 TÓM TẮT KẾT QUẢ');
    console.log('='.repeat(50));
    
    console.log(`✅ Fixes applied: ${this.fixes.length}`);
    console.log(`❌ Errors found: ${this.errors.length}`);
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Các fixes đã áp dụng:');
      this.fixes.forEach(fix => console.log(`  - ${fix}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Các lỗi cần sửa thủ công:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 TẤT CẢ KIỂM TRA ĐỀU THÀNH CÔNG!');
      console.log('Bot đã sẵn sàng để deploy.');
    } else {
      console.log('\n⚠️ CÒN MỘT SỐ VẤN ĐỀ CẦN SỬA');
      console.log('Vui lòng sửa các lỗi trên trước khi deploy.');
    }
  }
}

// CLI usage
if (require.main === module) {
  const fixer = new AutoFixer();
  fixer.runAllFixes().catch(error => {
    console.error('💥 Lỗi khi chạy auto-fix:', error.message);
    process.exit(1);
  });
}

module.exports = { AutoFixer };
