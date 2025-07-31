const fs = require('fs');
const path = require('path');

/**
 * Test File Structure và Configuration
 */
class FileStructureTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Helper để chạy một test case
   */
  async runTestCase(name, testFunction) {
    this.results.total++;
    try {
      console.log(`  Đang test ${name}...`);
      await testFunction();
      console.log(`  THÀNH CÔNG ${name} - ĐẠT`);
      this.results.passed++;
      this.results.details.push({
        test: name,
        status: 'ĐẠT'
      });
    } catch (error) {
      console.log(`  THẤT BẠI ${name} - LỖI: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        test: name,
        status: 'THẤT BẠI',
        error: error.message
      });
    }
  }

  /**
   * Test project structure
   */
  async testProjectStructure() {
    await this.runTestCase('Cấu trúc project đúng', () => {
      const expectedDirs = [
        'commands',
        'utils', 
        'config',
        'data',
        'scripts',
        'test'
      ];

      const expectedFiles = [
        'index.js',
        'package.json'
      ];

      // Check directories
      for (const dir of expectedDirs) {
        if (!fs.existsSync(dir)) {
          throw new Error(`Directory ${dir} không tìm thấy`);
        }
        
        const stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
          throw new Error(`${dir} không phải là thư mục`);
        }
      }

      // Check files
      for (const file of expectedFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`File ${file} không tìm thấy`);
        }
        
        const stat = fs.statSync(file);
        if (!stat.isFile()) {
          throw new Error(`${file} không phải là file`);
        }
      }
    });
  }

  /**
   * Test commands directory
   */
  async testCommandsDirectory() {
    await this.runTestCase('Thư mục commands có các file cần thiết', () => {
      const commandsDir = './commands';
      const requiredCommands = [
        'calculator.js',
        'debug.js',
        'hr.js', 
        'runeword.js',
        'weapon.js',
        'wiki.js'
      ];

      for (const cmd of requiredCommands) {
        const filePath = path.join(commandsDir, cmd);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Command file ${cmd} không tìm thấy`);
        }
      }
    });
  }

  /**
   * Test utils directory
   */
  async testUtilsDirectory() {
    await this.runTestCase('Thư mục utils có các file cần thiết', () => {
      const utilsDir = './utils';
      const requiredUtils = [
        'data-manager.js',
        'github-data.js',
        'permissions.js'
      ];

      for (const util of requiredUtils) {
        const filePath = path.join(utilsDir, util);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Util file ${util} không tìm thấy`);
        }
      }
    });
  }

  /**
   * Test config directory
   */
  async testConfigDirectory() {
    await this.runTestCase('Cấu trúc thư mục config', () => {
      const configDir = './config';
      const expectedConfigs = [
        'config.json',
        'github-config.json'
      ];

      for (const config of expectedConfigs) {
        const filePath = path.join(configDir, config);
        if (!fs.existsSync(filePath)) {
          console.log(`      Config file ${config} không tìm thấy`);
        } else {
          // Test JSON validity
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            JSON.parse(content);
          } catch (error) {
            throw new Error(`Config file ${config} không phải JSON hợp lệ: ${error.message}`);
          }
        }
      }
    });
  }

  /**
   * Test data directory
   */
  async testDataDirectory() {
    await this.runTestCase('Cấu trúc thư mục data', () => {
      const dataDir = './data';
      const expectedData = [
        'weapon.json',
        'runeword.json', 
        'wiki.json'
      ];

      for (const dataFile of expectedData) {
        const filePath = path.join(dataDir, dataFile);
        if (!fs.existsSync(filePath)) {
          console.log(`      Data file ${dataFile} không tìm thấy`);
        } else {
          // Test JSON validity và basic structure
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            if (!Array.isArray(data)) {
              throw new Error(`Data file ${dataFile} nên chứa một array`);
            }
            
            if (data.length === 0) {
              console.log(`      Data file ${dataFile} trống`);
            }
            
          } catch (error) {
            throw new Error(`Data file ${dataFile} không phải JSON hợp lệ: ${error.message}`);
          }
        }
      }
    });
  }

  /**
   * Test scripts directory
   */
  async testScriptsDirectory() {
    await this.runTestCase('Cấu trúc thư mục scripts', () => {
      const scriptsDir = './scripts';
      
      if (!fs.existsSync(scriptsDir)) {
        console.log('      Scripts directory không tìm thấy');
        return;
      }

      const files = fs.readdirSync(scriptsDir);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      if (jsFiles.length === 0) {
        console.log('      No JS files found in scripts directory');
      } else {
        console.log(`     Tìm thấy ${jsFiles.length} script files: ${jsFiles.join(', ')}`);
      }
    });
  }

  /**
   * Test package.json
   */
  async testPackageJson() {
    await this.runTestCase('package.json hợp lệ', () => {
      if (!fs.existsSync('./package.json')) {
        throw new Error('package.json không tìm thấy');
      }

      const packageContent = fs.readFileSync('./package.json', 'utf8');
      const packageJson = JSON.parse(packageContent);

      // Check required fields
      const requiredFields = ['name', 'version', 'dependencies'];
      for (const field of requiredFields) {
        if (!(field in packageJson)) {
          throw new Error(`package.json thiếu required field: ${field}`);
        }
      }

      // Check Discord.js dependency
      if (!packageJson.dependencies['discord.js']) {
        throw new Error('package.json thiếu discord.js dependency');
      }
    });
  }

  /**
   * Test index.js structure
   */
  async testIndexJs() {
    await this.runTestCase('index.js có cấu trúc đúng', () => {
      if (!fs.existsSync('./index.js')) {
        throw new Error('index.js không tìm thấy');
      }

      const indexContent = fs.readFileSync('./index.js', 'utf8');
      
      // Check for required imports
      const requiredImports = [
        'discord.js',
        './commands/',
        './utils/'
      ];

      for (const imp of requiredImports) {
        if (!indexContent.includes(imp)) {
          throw new Error(`index.js thiếu import: ${imp}`);
        }
      }

      // Check for client creation
      if (!indexContent.includes('new Client')) {
        throw new Error('index.js thiếu Discord client creation');
      }

      // Check for login
      if (!indexContent.includes('client.login')) {
        throw new Error('index.js thiếu client login');
      }
    });
  }

  /**
   * Test file permissions (nếu trên Unix)
   */
  async testFilePermissions() {
    await this.runTestCase('Quyền file hợp lý', () => {
      const sensitiveFiles = [
        '.env',
        'config/config.json'
      ];

      for (const file of sensitiveFiles) {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          const mode = stats.mode;
          
          // Check if file is readable by others (basic security check)
          if (process.platform !== 'win32') {
            const otherRead = mode & parseInt('004', 8);
            if (otherRead) {
              console.log(`      ${file} is readable by others - consider restricting permissions`);
            }
          }
        }
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runTests() {
    console.log(' Đang test File Structure...');
    
    await this.testProjectStructure();
    await this.testCommandsDirectory();
    await this.testUtilsDirectory();
    await this.testConfigDirectory();
    await this.testDataDirectory();
    await this.testScriptsDirectory();
    await this.testPackageJson();
    await this.testIndexJs();
    await this.testFilePermissions();
    
    console.log(`\n File Structure Tests: ${this.results.passed}/${this.results.total} passed`);
    
    return this.results;
  }
}

// Export để test runner có thể sử dụng
module.exports = {
  runTests: async () => {
    const test = new FileStructureTest();
    return await test.runTests();
  }
};
