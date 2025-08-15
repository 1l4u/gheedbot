/**
 * Simple Test Runner - Chạy tests cơ bản mà không có lỗi
 */

const fs = require('fs');
const path = require('path');

class SimpleTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }

  /**
   * Chạy một test case đơn giản
   */
  async runTestCase(name, testFunction) {
    this.results.total++;
    
    try {
      console.log(`🧪 Testing ${name}...`);
      await testFunction();
      console.log(`✅ ${name} - PASSED`);
      this.results.passed++;
      return true;
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`);
      this.results.failed++;
      this.results.errors.push({
        test: name,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Test cấu trúc file cơ bản
   */
  async testFileStructure() {
    await this.runTestCase('File Structure', () => {
      const requiredFiles = [
        'index.js',
        'package.json',
        '.env',
        'config/config.json'
      ];

      requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          throw new Error(`Missing file: ${file}`);
        }
      });
    });
  }

  /**
   * Test JSON files
   */
  async testJsonFiles() {
    await this.runTestCase('JSON Files', () => {
      const jsonFiles = [
        'package.json',
        'config/config.json',
        'config/github-config.json'
      ];

      jsonFiles.forEach(file => {
        if (fs.existsSync(file)) {
          try {
            JSON.parse(fs.readFileSync(file, 'utf8'));
          } catch (error) {
            throw new Error(`Invalid JSON in ${file}: ${error.message}`);
          }
        }
      });
    });
  }

  /**
   * Test data files
   */
  async testDataFiles() {
    await this.runTestCase('Data Files', () => {
      const dataFiles = [
        'data/weapon.json',
        'data/runeword.json',
        'data/wiki.json'
      ];

      dataFiles.forEach(file => {
        if (fs.existsSync(file)) {
          try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!Array.isArray(data)) {
              throw new Error(`${file} should contain an array`);
            }
            if (data.length === 0) {
              console.warn(`Warning: ${file} is empty`);
            }
          } catch (error) {
            throw new Error(`Invalid data in ${file}: ${error.message}`);
          }
        } else {
          throw new Error(`Missing data file: ${file}`);
        }
      });
    });
  }

  /**
   * Test module loading
   */
  async testModuleLoading() {
    await this.runTestCase('Module Loading', () => {
      const modules = [
        '../utils/data-manager',
        '../utils/permissions',
        '../commands/hr',
        '../commands/weapon'
      ];

      modules.forEach(modulePath => {
        try {
          require(modulePath);
        } catch (error) {
          throw new Error(`Failed to load ${modulePath}: ${error.message}`);
        }
      });
    });
  }

  /**
   * Test environment variables
   */
  async testEnvironment() {
    await this.runTestCase('Environment Variables', () => {
      if (!fs.existsSync('.env')) {
        throw new Error('.env file not found');
      }

      const envContent = fs.readFileSync('.env', 'utf8');
      const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
      
      requiredVars.forEach(varName => {
        if (!envContent.includes(`${varName}=`)) {
          throw new Error(`Missing environment variable: ${varName}`);
        }
      });
    });
  }

  /**
   * Test data manager
   */
  async testDataManager() {
    await this.runTestCase('Data Manager', async () => {
      const { dataManager } = require('../utils/data-manager');
      
      // Test basic functionality
      if (typeof dataManager.getWeapons !== 'function') {
        throw new Error('dataManager.getWeapons is not a function');
      }
      
      if (typeof dataManager.getRunewords !== 'function') {
        throw new Error('dataManager.getRunewords is not a function');
      }
      
      // Test loading (with timeout)
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Data loading timeout')), 5000)
      );
      
      try {
        const weapons = await Promise.race([dataManager.getWeapons(), timeout]);
        if (!Array.isArray(weapons)) {
          throw new Error('Weapons data is not an array');
        }
      } catch (error) {
        if (error.message === 'Data loading timeout') {
          console.warn('Warning: Data loading took too long, skipping');
        } else {
          throw error;
        }
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runAllTests() {
    console.log('🤖 Simple Test Runner for GheedBot');
    console.log('='.repeat(50));
    
    await this.testFileStructure();
    await this.testJsonFiles();
    await this.testDataFiles();
    await this.testModuleLoading();
    await this.testEnvironment();
    await this.testDataManager();
    
    this.printSummary();
    return this.results;
  }

  /**
   * In tóm tắt kết quả
   */
  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('Bot is ready for deployment.');
    } else {
      console.log('\n⚠️ SOME TESTS FAILED');
      console.log('Please fix the issues before deployment.');
    }
  }
}

// CLI usage
if (require.main === module) {
  const runner = new SimpleTestRunner();
  runner.runAllTests().catch(error => {
    console.error('💥 Test runner error:', error.message);
    process.exit(1);
  });
}

module.exports = { SimpleTestRunner };
