const fs = require('fs');
const path = require('path');

/**
 * Test Runner - Chạy tất cả tests trong thư mục test
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Tự động tìm và load tất cả file test
   */
  loadTests() {
    const testDir = __dirname;
    const files = fs.readdirSync(testDir);
    
    for (const file of files) {
      if (file.startsWith('test-') && file.endsWith('.js') && file !== 'test-runner.js') {
        try {
          const testModule = require(path.join(testDir, file));
          this.tests.push({
            name: file,
            module: testModule
          });
          console.log(` Đã tải test: ${file}`);
        } catch (error) {
          console.log(` Thất bại to load test: ${file} - ${error.message}`);
        }
      }
    }
  }

  /**
   * Chạy tất cả tests
   */
  async runAll() {
    console.log('\n Đang khởi động Test Runner...\n');
    console.log('='.repeat(60));
    
    this.loadTests();
    
    if (this.tests.length === 0) {
      console.log(' Không tìm thấy tests!');
      return;
    }

    console.log(`\n📋 Tìm thấy ${this.tests.length} file test\n`);

    for (const test of this.tests) {
      await this.runTest(test);
    }

    this.printSummary();
  }

  /**
   * Chạy một test file
   */
  async runTest(test) {
    console.log(`\n Đang chạy: ${test.name}`);
    console.log('-'.repeat(40));

    try {
      if (typeof test.module.runTests === 'function') {
        const result = await test.module.runTests();
        this.processResult(test.name, result);
      } else {
        console.log(`  ${test.name} không có function runTests()`);
      }
    } catch (error) {
      console.log(` ${test.name} bị crash: ${error.message}`);
      this.results.failed++;
      this.results.total++;
      this.results.details.push({
        test: test.name,
        status: 'CRASHED',
        error: error.message
      });
    }
  }

  /**
   * Xử lý kết quả test
   */
  processResult(testName, result) {
    if (result && typeof result === 'object') {
      this.results.passed += result.passed || 0;
      this.results.failed += result.failed || 0;
      this.results.total += result.total || 0;
      
      if (result.details) {
        this.results.details.push(...result.details.map(d => ({
          ...d,
          testFile: testName
        })));
      }
    } else {
      this.results.total++;
      if (result === true) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
    }
  }

  /**
   * In tóm tắt kết quả
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(' TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Tổng số Tests: ${this.results.total}`);
    console.log(` Đạt: ${this.results.passed}`);
    console.log(` Thất bại: ${this.results.failed}`);
    
    const successRate = this.results.total > 0 
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : 0;
    console.log(`📈 Tỷ lệ thành công: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n THẤT BẠI TESTS:');
      this.results.details
        .filter(d => d.status === 'THẤT BẠI' || d.status === 'CRASHED')
        .forEach(d => {
          console.log(`  - ${d.testFile}: ${d.test || 'Không xác định'} - ${d.error || d.message}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log(' TẤT CẢ TESTS ĐẠT!');
    } else {
      console.log(' MỘT SỐ TESTS ĐÃ THẤT BẠI!');
    }
  }
}

// Chạy tests nếu file này được execute trực tiếp
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAll().catch(console.error);
}

module.exports = TestRunner;
