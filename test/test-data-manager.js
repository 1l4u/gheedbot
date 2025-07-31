const { dataManager } = require('../utils/data-manager');
const fs = require('fs');

/**
 * Test Data Manager
 */
class DataManagerTest {
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
      console.log(`   ${name}...`);
      await testFunction();
      console.log(`   ${name} - ĐẠT`);
      this.results.passed++;
      this.results.details.push({
        test: name,
        status: 'ĐẠT'
      });
    } catch (error) {
      console.log(`   ${name} - THẤT BẠI: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        test: name,
        status: 'THẤT BẠI',
        error: error.message
      });
    }
  }

  /**
   * Test data manager instance
   */
  async testInstance() {
    await this.runTestCase('Data Manager instance tồn tại', () => {
      if (!dataManager) throw new Error('dataManager không được export');
      if (typeof dataManager.loadData !== 'function') {
        throw new Error('Không tìm thấy method loadData');
      }
      if (typeof dataManager.getData !== 'function') {
        throw new Error('Không tìm thấy method getData');
      }
    });
  }

  /**
   * Test local file loading
   */
  async testLocalFileLoading() {
    await this.runTestCase('Tải file local hoạt động', async () => {
      // Đảm bảo GitHub bị tắt cho test này
      const originalUseGitHub = dataManager.useGitHub;
      dataManager.useGitHub = false;

      try {
        // Test tải weapons
        if (fs.existsSync('./data/weapon.json')) {
          await dataManager.loadData('weapons');
          const weapons = dataManager.getData('weapons');

          if (!weapons) throw new Error('Dữ liệu weapons không được tải');
          if (!Array.isArray(weapons)) throw new Error('Dữ liệu weapons phải là array');
          if (weapons.length === 0) throw new Error('Dữ liệu weapons trống');
        } else {
          console.log('      weapon.json không tìm thấy, bỏ qua test weapons');
        }

        // Test tải runewords
        if (fs.existsSync('./data/runeword.json')) {
          await dataManager.loadData('runewords');
          const runewords = dataManager.getData('runewords');

          if (!runewords) throw new Error('Dữ liệu runewords không được tải');
          if (!Array.isArray(runewords)) throw new Error('Dữ liệu runewords phải là array');
        } else {
          console.log('      runeword.json không tìm thấy, bỏ qua test runewords');
        }

      } finally {
        dataManager.useGitHub = originalUseGitHub;
      }
    });
  }

  /**
   * Test data validation
   */
  async testDataValidation() {
    await this.runTestCase('Xác thực dữ liệu hoạt động', async () => {
      const originalUseGitHub = dataManager.useGitHub;
      dataManager.useGitHub = false;

      try {
        if (fs.existsSync('./data/weapon.json')) {
          await dataManager.loadData('weapons');
          const weapons = dataManager.getData('weapons');

          if (weapons && weapons.length > 0) {
            const weapon = weapons[0];

            // Kiểm tra các trường bắt buộc
            if (!weapon.name) throw new Error('Weapon thiếu trường name');

            // Kiểm tra kiểu dữ liệu
            if (typeof weapon.name !== 'string') {
              throw new Error('Tên weapon phải là string');
            }
          }
        }
      } finally {
        dataManager.useGitHub = originalUseGitHub;
      }
    });
  }

  /**
   * Test GitHub configuration
   */
  async testGitHubConfig() {
    await this.runTestCase('Các method cấu hình GitHub hoạt động', () => {
      const originalUseGitHub = dataManager.useGitHub;

      try {
        // Test bật GitHub
        dataManager.enableGitHub('testuser', 'testrepo', 'testbranch');
        if (!dataManager.useGitHub) throw new Error('GitHub không được bật');

        // Test tắt GitHub
        dataManager.disableGitHub();
        if (dataManager.useGitHub) throw new Error('GitHub không được tắt');

      } finally {
        dataManager.useGitHub = originalUseGitHub;
      }
    });
  }

  /**
   * Test config file loading
   */
  async testConfigLoading() {
    await this.runTestCase('Tải file config hoạt động', () => {
      if (fs.existsSync('./config/github-config.json')) {
        const config = dataManager.loadGitHubConfig();

        if (config && typeof config === 'object') {
          if (typeof config.enabled !== 'boolean') {
            throw new Error('Config enabled phải là boolean');
          }

          if (config.enabled) {
            if (!config.owner) throw new Error('Config thiếu owner');
            if (!config.repo) throw new Error('Config thiếu repo');
            if (!config.branch) throw new Error('Config thiếu branch');
          }
        }
      } else {
        console.log('      github-config.json không tìm thấy, bỏ qua test config');
      }
    });
  }

  /**
   * Test data caching
   */
  async testDataCaching() {
    await this.runTestCase('Cache dữ liệu hoạt động', async () => {
      const originalUseGitHub = dataManager.useGitHub;
      dataManager.useGitHub = false;

      try {
        if (fs.existsSync('./data/weapon.json')) {
          // Tải dữ liệu lần đầu
          await dataManager.loadData('weapons');
          const weapons1 = dataManager.getData('weapons');

          // Tải dữ liệu lần thứ hai (nên sử dụng cache)
          const weapons2 = dataManager.getData('weapons');

          if (weapons1 !== weapons2) {
            throw new Error('Dữ liệu không được cache đúng cách');
          }
        }
      } finally {
        dataManager.useGitHub = originalUseGitHub;
      }
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    await this.runTestCase('Xử lý lỗi hoạt động', async () => {
      try {
        // Thử tải loại dữ liệu không tồn tại
        await dataManager.loadData('nonexistent');
        throw new Error('Nên đã ném lỗi cho loại dữ liệu không tồn tại');
      } catch (error) {
        if (error.message.includes('Nên đã ném lỗi')) {
          throw error;
        }
        // Lỗi mong đợi, test đạt
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runTests() {
    console.log(' Đang test Data Manager...');
    
    await this.testInstance();
    await this.testLocalFileLoading();
    await this.testDataValidation();
    await this.testGitHubConfig();
    await this.testConfigLoading();
    await this.testDataCaching();
    await this.testErrorHandling();
    
    console.log(`\nKết quả Data Manager Tests: ${this.results.passed}/${this.results.total} đạt`);

    return this.results;
  }
}

// Export để test runner có thể sử dụng
module.exports = {
  runTests: async () => {
    const test = new DataManagerTest();
    return await test.runTests();
  }
};
