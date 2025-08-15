/**
 * Full System Test - Test toàn bộ hệ thống GheedBot
 */

const { DeploymentChecker } = require('../scripts/check-deployment');
const { AutoFixer } = require('../scripts/auto-fix');
const fs = require('fs');

class FullSystemTest {
  constructor() {
    this.results = {
      fileStructure: false,
      jsonValidation: false,
      environment: false,
      dataLoading: false,
      endpoints: false,
      deployment: false
    };
    this.errors = [];
  }

  /**
   * Test 1: File Structure
   */
  testFileStructure() {
    console.log('🧪 Test 1: Cấu trúc file...');
    
    const requiredFiles = [
      'index.js',
      'package.json',
      '.env',
      'config/config.json',
      'config/github-config.json',
      'data/weapon.json',
      'data/runeword.json',
      'data/wiki.json'
    ];

    let allExists = true;
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        console.log(`  ❌ Thiếu: ${file}`);
        this.errors.push(`Thiếu file ${file}`);
        allExists = false;
      } else {
        console.log(`  ✅ OK: ${file}`);
      }
    });

    this.results.fileStructure = allExists;
    return allExists;
  }

  /**
   * Test 2: JSON Validation
   */
  testJsonValidation() {
    console.log('\n🧪 Test 2: Validation JSON...');
    
    const jsonFiles = [
      'package.json',
      'config/config.json',
      'config/github-config.json',
      'data/weapon.json',
      'data/runeword.json',
      'data/wiki.json'
    ];

    let allValid = true;
    jsonFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const parsed = JSON.parse(content);
          
          // Validate specific files
          if (file.includes('weapon.json') && Array.isArray(parsed)) {
            console.log(`  ✅ ${file} - ${parsed.length} weapons`);
          } else if (file.includes('runeword.json') && Array.isArray(parsed)) {
            console.log(`  ✅ ${file} - ${parsed.length} runewords`);
          } else if (file.includes('wiki.json') && Array.isArray(parsed)) {
            console.log(`  ✅ ${file} - ${parsed.length} wiki entries`);
          } else {
            console.log(`  ✅ ${file} - Valid JSON`);
          }
        } catch (error) {
          console.log(`  ❌ ${file} - ${error.message}`);
          this.errors.push(`JSON lỗi: ${file}`);
          allValid = false;
        }
      }
    });

    this.results.jsonValidation = allValid;
    return allValid;
  }

  /**
   * Test 3: Environment Variables
   */
  testEnvironment() {
    console.log('\n🧪 Test 3: Environment variables...');
    
    const requiredEnvs = ['DISCORD_TOKEN', 'CLIENT_ID'];
    let allSet = true;

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
        if (envVars[env] && envVars[env].length > 10) {
          console.log(`  ✅ ${env} - Set`);
        } else {
          console.log(`  ❌ ${env} - Not set or invalid`);
          this.errors.push(`Environment variable ${env} không hợp lệ`);
          allSet = false;
        }
      });
    } else {
      console.log('  ❌ .env file không tồn tại');
      this.errors.push('.env file không tồn tại');
      allSet = false;
    }

    this.results.environment = allSet;
    return allSet;
  }

  /**
   * Test 4: Data Loading
   */
  async testDataLoading() {
    console.log('\n🧪 Test 4: Data loading...');
    
    try {
      const { dataManager } = require('../utils/data-manager');
      
      // Test weapons
      const weapons = await dataManager.getWeapons();
      if (Array.isArray(weapons) && weapons.length > 0) {
        console.log(`  ✅ Weapons loaded - ${weapons.length} items`);
      } else {
        console.log('  ❌ Weapons loading failed');
        this.errors.push('Weapons loading failed');
        this.results.dataLoading = false;
        return false;
      }

      // Test runewords
      const runewords = await dataManager.getRunewords();
      if (Array.isArray(runewords) && runewords.length > 0) {
        console.log(`  ✅ Runewords loaded - ${runewords.length} items`);
      } else {
        console.log('  ❌ Runewords loading failed');
        this.errors.push('Runewords loading failed');
        this.results.dataLoading = false;
        return false;
      }

      // Test wikis
      const wikis = await dataManager.getWikis();
      if (Array.isArray(wikis) && wikis.length > 0) {
        console.log(`  ✅ Wikis loaded - ${wikis.length} items`);
      } else {
        console.log('  ❌ Wikis loading failed');
        this.errors.push('Wikis loading failed');
        this.results.dataLoading = false;
        return false;
      }

      this.results.dataLoading = true;
      return true;
      
    } catch (error) {
      console.log(`  ❌ Data loading error: ${error.message}`);
      this.errors.push(`Data loading error: ${error.message}`);
      this.results.dataLoading = false;
      return false;
    }
  }

  /**
   * Test 5: Endpoints (nếu server đang chạy)
   */
  async testEndpoints() {
    console.log('\n🧪 Test 5: Endpoints...');
    
    try {
      const checker = new DeploymentChecker();
      checker.setBaseUrl('http://localhost:3000');
      
      const endpoints = ['/', '/ping', '/health', '/test-github'];
      let allWorking = true;
      
      for (const endpoint of endpoints) {
        try {
          const result = await checker.testEndpoint(endpoint);
          if (result.success) {
            console.log(`  ✅ ${endpoint} - OK`);
          } else {
            console.log(`  ❌ ${endpoint} - Failed`);
            allWorking = false;
          }
        } catch (error) {
          console.log(`  ⚠️ ${endpoint} - Server not running`);
          allWorking = false;
        }
      }
      
      this.results.endpoints = allWorking;
      return allWorking;
      
    } catch (error) {
      console.log(`  ⚠️ Endpoint test skipped - Server not running`);
      this.results.endpoints = false;
      return false;
    }
  }

  /**
   * Chạy tất cả tests
   */
  async runAllTests() {
    console.log('🤖 GheedBot Full System Test');
    console.log('='.repeat(50));
    
    // Run tests
    this.testFileStructure();
    this.testJsonValidation();
    this.testEnvironment();
    await this.testDataLoading();
    await this.testEndpoints();
    
    this.printSummary();
    return this.results;
  }

  /**
   * In tóm tắt kết quả
   */
  printSummary() {
    console.log('\n📊 TÓM TẮT KẾT QUẢ');
    console.log('='.repeat(50));
    
    const tests = Object.keys(this.results);
    const passed = tests.filter(test => this.results[test]).length;
    const total = tests.length;
    
    console.log(`Tests passed: ${passed}/${total}`);
    console.log('');
    
    tests.forEach(test => {
      const status = this.results[test] ? '✅' : '❌';
      const name = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} ${name}`);
    });
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors found:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (passed === total) {
      console.log('\n🎉 TẤT CẢ TESTS ĐỀU THÀNH CÔNG!');
      console.log('Bot đã sẵn sàng để deploy và hoạt động.');
    } else {
      console.log('\n⚠️ MỘT SỐ TESTS THẤT BẠI');
      console.log('Vui lòng sửa các lỗi trước khi deploy.');
    }
    
    console.log('\n🔧 Next steps:');
    console.log('1. Sửa các lỗi nếu có');
    console.log('2. Deploy lên platform (Render/Heroku)');
    console.log('3. Cấu hình UptimeRobot monitor');
    console.log('4. Test deployment với: node scripts/check-deployment.js <URL>');
  }
}

// CLI usage
if (require.main === module) {
  const tester = new FullSystemTest();
  tester.runAllTests().catch(error => {
    console.error('💥 Lỗi khi chạy system test:', error.message);
    process.exit(1);
  });
}

module.exports = { FullSystemTest };
