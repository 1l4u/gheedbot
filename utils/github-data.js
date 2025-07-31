const https = require('https');

/**
 * GitHub data fetcher với caching
 */
class GitHubDataFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 phút cache
    this.baseUrl = 'https://raw.githubusercontent.com';
    
    // Cấu hình GitHub repository
    this.config = {
      owner: '1l4u', // Thay bằng username GitHub của bạn
      repo: 'gheedbot', // Thay bằng tên repository
      branch: 'main' // Hoặc 'master' tùy theo branch chính
    };
  }

  /**
   * Cấu hình GitHub repository
   * @param {string} owner - GitHub username
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name (default: main)
   */
  setRepository(owner, repo, branch = 'main') {
    this.config = { owner, repo, branch };
    console.log(`Đã cấu hình GitHub repo: ${owner}/${repo}@${branch}`);
  }

  /**
   * Fetch file từ GitHub với caching
   * @param {string} filePath - Đường dẫn file trong repo
   * @returns {Promise<any>} - Parsed JSON data
   */
  async fetchFile(filePath) {
    const cacheKey = filePath;
    const cached = this.cache.get(cacheKey);
    
    // Kiểm tra cache
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`Sử dụng cache cho ${filePath}`);
      return cached.data;
    }

    try {
      console.log(`Đang tải ${filePath} từ GitHub...`);
      const url = `${this.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath}`;
      const data = await this.httpGet(url);
      const parsedData = JSON.parse(data);
      
      // Lưu vào cache
      this.cache.set(cacheKey, {
        data: parsedData,
        timestamp: Date.now()
      });
      
      console.log(`Đã tải thành công ${filePath} (${data.length} bytes)`);
      return parsedData;
      
    } catch (error) {
      console.error(`Lỗi khi tải ${filePath}:`, error.message);
      
      // Fallback về cache cũ nếu có
      if (cached) {
        console.log(`Sử dụng cache cũ cho ${filePath}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * HTTP GET request
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} - Response data
   */
  httpGet(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Xóa cache cho file cụ thể
   * @param {string} filePath - File path to clear cache
   */
  clearCache(filePath) {
    if (filePath) {
      this.cache.delete(filePath);
      console.log(`Đã xóa cache cho ${filePath}`);
    } else {
      this.cache.clear();
      console.log('Đã xóa toàn bộ cache');
    }
  }

  /**
   * Lấy thông tin cache
   */
  getCacheInfo() {
    const info = [];
    for (const [key, value] of this.cache.entries()) {
      const age = Math.floor((Date.now() - value.timestamp) / 1000);
      info.push({
        file: key,
        age: `${age}s`,
        size: JSON.stringify(value.data).length
      });
    }
    return info;
  }

  /**
   * Preload tất cả file cần thiết
   */
  async preloadAll() {
    const files = ['weapon.json', 'runeword.json', 'wiki.json'];
    const results = {};
    
    for (const file of files) {
      try {
        results[file] = await this.fetchFile(file);
        console.log(`Preload thành công: ${file}`);
      } catch (error) {
        console.error(`Preload thất bại: ${file}`, error.message);
        results[file] = null;
      }
    }
    
    return results;
  }
}

// Singleton instance
const githubFetcher = new GitHubDataFetcher();

module.exports = {
  GitHubDataFetcher,
  githubFetcher
};
