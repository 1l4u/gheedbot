const { GitHubDataFetcher } = require('../utils/github-data');

/**
 * Test GitHub Data Fetcher
 */
class GitHubDataTest {
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
   * Test constructor và cấu hình
   */
  async testConstructor() {
    await this.runTestCase('Constructor tạo instance', () => {
      const fetcher = new GitHubDataFetcher();
      if (!fetcher) throw new Error('Thất bại khi tạo instance');
      if (!fetcher.cache) throw new Error('Cache không được khởi tạo');
      if (!fetcher.baseUrl) throw new Error('Base URL không được thiết lập');
    });
  }

  /**
   * Test setRepository method
   */
  async testSetRepository() {
    await this.runTestCase('setRepository cập nhật config', () => {
      const fetcher = new GitHubDataFetcher();
      fetcher.setRepository('testuser', 'testrepo', 'testbranch');
      
      if (fetcher.config.owner !== 'testuser') {
        throw new Error('Owner không được thiết lập đúng');
      }
      if (fetcher.config.repo !== 'testrepo') {
        throw new Error('Repo không được thiết lập đúng');
      }
      if (fetcher.config.branch !== 'testbranch') {
        throw new Error('Branch không được thiết lập đúng');
      }
    });
  }

  /**
   * Test cache functionality
   */
  async testCache() {
    await this.runTestCase('Các thao tác cache hoạt động', () => {
      const fetcher = new GitHubDataFetcher();
      
      // Test cache set/get
      const testData = { test: 'data' };
      fetcher.cache.set('test-key', {
        data: testData,
        timestamp: Date.now()
      });
      
      const cached = fetcher.cache.get('test-key');
      if (!cached) throw new Error('Cache get thất bại');
      if (cached.data.test !== 'data') throw new Error('Dữ liệu cache không đúng');
      
      // Test cache clear
      fetcher.clearCache('test-key');
      if (fetcher.cache.has('test-key')) throw new Error('Cache clear thất bại');
    });
  }

  /**
   * Test URL construction
   */
  async testUrlConstruction() {
    await this.runTestCase('Xây dựng URL đúng', () => {
      const fetcher = new GitHubDataFetcher();
      fetcher.setRepository('1l4u', 'gheedbot', 'main');
      
      const expectedUrl = 'https://raw.githubusercontent.com/1l4u/gheedbot/main/data/weapon.json';
      const actualUrl = `${fetcher.baseUrl}/${fetcher.config.owner}/${fetcher.config.repo}/${fetcher.config.branch}/data/weapon.json`;
      
      if (actualUrl !== expectedUrl) {
        throw new Error(`URL mismatch: expected ${expectedUrl}, got ${actualUrl}`);
      }
    });
  }

  /**
   * Test HTTP request với mock
   */
  async testHttpRequest() {
    await this.runTestCase('HTTP request xử lý lỗi', async () => {
      const fetcher = new GitHubDataFetcher();
      
      try {
        // Test với URL không tồn tại
        await fetcher.httpGet('https://raw.githubusercontent.com/nonexistent/repo/main/file.json');
        throw new Error('Nên đã ném một lỗi');
      } catch (error) {
        if (!error.message.includes('404') && !error.message.includes('ENOTFOUND')) {
          throw new Error(`Lỗi không mong đợi: ${error.message}`);
        }
        // Lỗi mong đợi, test đạt
      }
    });
  }

  /**
   * Test fetchFile với fallback
   */
  async testFetchFileWithFallback() {
    await this.runTestCase('fetchFile xử lý lỗi một cách nhẹ nhàng', async () => {
      const fetcher = new GitHubDataFetcher();
      fetcher.setRepository('nonexistent', 'repo', 'main');
      
      try {
        await fetcher.fetchFile('nonexistent.json');
        throw new Error('Nên đã ném một lỗi');
      } catch (error) {
        // Hành vi mong đợi
        if (!error.message.includes('404') && !error.message.includes('ENOTFOUND')) {
          throw new Error(`Lỗi không mong đợi: ${error.message}`);
        }
      }
    });
  }

  /**
   * Test getCacheInfo
   */
  async testGetCacheInfo() {
    await this.runTestCase('getCacheInfo trả về định dạng đúng', () => {
      const fetcher = new GitHubDataFetcher();
      
      // Add some test data to cache
      fetcher.cache.set('test1', {
        data: { test: 'data1' },
        timestamp: Date.now()
      });
      
      fetcher.cache.set('test2', {
        data: { test: 'data2' },
        timestamp: Date.now() - 5000
      });
      
      const info = fetcher.getCacheInfo();
      
      if (!Array.isArray(info)) throw new Error('getCacheInfo nên trả về array');
      if (info.length !== 2) throw new Error('Should have 2 cache entries');
      
      const entry = info[0];
      if (!entry.file || !entry.age || !entry.size) {
        throw new Error('Cache info thiếu required fields');
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runTests() {
    console.log(' Đang test GitHub Data Fetcher...');
    
    await this.testConstructor();
    await this.testSetRepository();
    await this.testCache();
    await this.testUrlConstruction();
    await this.testHttpRequest();
    await this.testFetchFileWithFallback();
    await this.testGetCacheInfo();
    
    console.log(`\n GitHub Data Tests: ${this.results.passed}/${this.results.total} passed`);
    
    return this.results;
  }
}

// Export để test runner có thể sử dụng
module.exports = {
  runTests: async () => {
    const test = new GitHubDataTest();
    return await test.runTests();
  }
};
