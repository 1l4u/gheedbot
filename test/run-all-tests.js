const TestRunner = require('./test-runner');
const fs = require('fs');
const path = require('path');

/**
 * Chạy tất cả tests và tạo report
 */
class AllTestsRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      testFiles: [],
      details: []
    };
  }

  /**
   * Chạy tất cả tests
   */
  async runAllTests() {
    console.log(' GHEEDBOT TEST SUITE');
    console.log('='.repeat(60));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(` Working directory: ${process.cwd()}`);
    console.log('='.repeat(60));

    const runner = new TestRunner();
    await runner.runAll();

    this.results = runner.results;
    this.endTime = Date.now();
    
    await this.generateReport();
    this.printFinalSummary();
  }

  /**
   * Tạo HTML report
   */
  async generateReport() {
    const duration = this.endTime - this.startTime;
    const successRate = this.results.total > 0 
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : 0;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GheedBot Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .success-rate { color: #17a2b8; }
        .test-details { margin-top: 30px; }
        .test-file { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .test-file-header { background: #e9ecef; padding: 15px; font-weight: bold; }
        .test-case { padding: 10px 15px; border-bottom: 1px solid #eee; }
        .test-case:last-child { border-bottom: none; }
        .test-passed { background: #d4edda; color: #155724; }
        .test-failed { background: #f8d7da; color: #721c24; }
        .error-message { font-family: monospace; font-size: 0.9em; margin-top: 5px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 GheedBot Test Report</h1>
            <p class="timestamp">Được tạo vào ${new Date().toLocaleString()}</p>
            <p class="timestamp">Thời gian: ${duration}ms</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${this.results.total}</div>
                <div>Tổng số Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${this.results.passed}</div>
                <div>Đạt</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${this.results.failed}</div>
                <div>Thất bại</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success-rate">${successRate}%</div>
                <div>Tỷ lệ thành công</div>
            </div>
        </div>

        <div class="test-details">
            <h2>📋 Chi tiết Test</h2>
            ${this.generateTestDetailsHtml()}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('./test/test-report.html', html);
    console.log('\n Đã tạo báo cáo HTML: test/test-report.html');
  }

  /**
   * Tạo HTML cho test details
   */
  generateTestDetailsHtml() {
    const testsByFile = {};
    
    // Group tests by file
    this.results.details.forEach(detail => {
      const file = detail.testFile || 'Không xác định';
      if (!testsByFile[file]) {
        testsByFile[file] = [];
      }
      testsByFile[file].push(detail);
    });

    let html = '';
    
    Object.keys(testsByFile).forEach(file => {
      const tests = testsByFile[file];
      const passed = tests.filter(t => t.status === 'ĐẠT').length;
      const failed = tests.filter(t => t.status === 'THẤT BẠI' || t.status === 'CRASHED').length;
      
      html += `
        <div class="test-file">
            <div class="test-file-header">
                 ${file} (${passed}/${tests.length} passed)
            </div>
            ${tests.map(test => `
                <div class="test-case ${test.status === 'ĐẠT' ? 'test-passed' : 'test-failed'}">
                    <strong>${test.test || 'Không xác định Test'}</strong>
                    <span style="float: right;">${test.status}</span>
                    ${test.error ? `<div class="error-message">${test.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
      `;
    });

    return html;
  }

  /**
   * Tạo JSON report
   */
  async generateJsonReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: this.endTime - this.startTime,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: this.results.total > 0 
          ? ((this.results.passed / this.results.total) * 100).toFixed(1)
          : 0
      },
      details: this.results.details,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };

    fs.writeFileSync('./test/test-report.json', JSON.stringify(report, null, 2));
    console.log(' Đã tạo báo cáo JSON: test/test-report.json');
  }

  /**
   * In tóm tắt cuối cùng
   */
  printFinalSummary() {
    const duration = this.endTime - this.startTime;
    const successRate = this.results.total > 0 
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : 0;

    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Thời gian: ${duration}ms`);
    console.log(` Tỷ lệ thành công: ${successRate}%`);
    
    if (this.results.failed === 0) {
      console.log(' ALL TESTS ĐẠT! Bot is ready for production.');
    } else {
      console.log(' SOME TESTS THẤT BẠI! Please review the issues above.');
      console.log('\n Common fixes:');
      console.log('   - Check file permissions');
      console.log('   - Verify config files exist');
      console.log('   - Ensure all dependencies are installed');
      console.log('   - Check GitHub repository exists (if using GitHub mode)');
    }
    
    console.log('\n Đã tạo báo cáo:');
    console.log('   - test/test-report.html (Báo cáo trực quan)');
    console.log('   - test/test-report.json (Máy đọc được)');
    console.log('='.repeat(60));
  }
}

// Chạy tests nếu file này được execute trực tiếp
if (require.main === module) {
  const runner = new AllTestsRunner();
  runner.runAllTests()
    .then(() => {
      process.exit(runner.results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error(' Test runner bị crash:', error);
      process.exit(1);
    });
}

module.exports = AllTestsRunner;
