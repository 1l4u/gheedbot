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
   * Fetch file từ GitHub với caching và retry logic cho Render
   * @param {string} filePath - Đường dẫn file trong repo
   * @returns {Promise<any>} - Parsed JSON data
   */
  async fetchFile(filePath, retries = 3) {
    const cacheKey = filePath;
    const cached = this.cache.get(cacheKey);

    // Kiểm tra cache
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`Sử dụng cache cho ${filePath}`);
      return cached.data;
    }

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Đang tải ${filePath} từ GitHub (lần thử ${attempt}/${retries})...`);
        const url = `${this.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath}`;

        const data = await this.httpGet(url);

        // Validate JSON
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (parseError) {
          throw new Error(`Invalid JSON in ${filePath}: ${parseError.message}`);
        }

        // Validate data structure
        if (!Array.isArray(parsedData)) {
          console.warn(`Warning: ${filePath} is not an array, got ${typeof parsedData}`);
        }

        // Lưu vào cache
        this.cache.set(cacheKey, {
          data: parsedData,
          timestamp: Date.now()
        });

        console.log(`Đã tải thành công ${filePath} (${data.length} bytes, ${Array.isArray(parsedData) ? parsedData.length : 'N/A'} items)`);
        return parsedData;

      } catch (error) {
        lastError = error;
        console.error(`Lỗi khi tải ${filePath} (lần thử ${attempt}/${retries}):`, error.message);

        // Nếu không phải lần thử cuối, đợi trước khi retry
        if (attempt < retries) {
          const delay = attempt * 2000; // 2s, 4s, 6s...
          console.log(`Đợi ${delay}ms trước khi thử lại...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Tất cả attempts đều thất bại, thử fallback về cache cũ
    if (cached) {
      console.log(`Tất cả attempts thất bại, sử dụng cache cũ cho ${filePath}`);
      return cached.data;
    }

    // Không có cache, throw error cuối cùng
    throw new Error(`Failed to load ${filePath} after ${retries} attempts: ${lastError.message}`);
  }

  /**
   * HTTP GET request với improved error handling cho Render
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} - Response data
   */
  httpGet(url) {
    return new Promise((resolve, reject) => {
      const options = {
        timeout: 30000, // Tăng timeout cho Render
        headers: {
          'User-Agent': 'GheedBot/1.0 (Render Deployment)',
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          'Connection': 'close'
        }
      };

      const request = https.get(url, options, (response) => {
        let data = '';

        // Log response cho debugging
        console.log(`GitHub request: ${response.statusCode} ${response.statusMessage} for ${url}`);

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            console.log(`GitHub data loaded: ${data.length} bytes`);
            resolve(data);
          } else {
            const error = new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
            error.statusCode = response.statusCode;
            error.url = url;
            reject(error);
          }
        });

        response.on('error', (error) => {
          error.url = url;
          reject(error);
        });
      });

      request.on('error', (error) => {
        console.error(`GitHub request error for ${url}:`, error.message);
        error.url = url;
        reject(error);
      });

      request.on('timeout', () => {
        console.error(`GitHub request timeout for ${url}`);
        request.destroy();
        const error = new Error(`Request timeout after 30s`);
        error.url = url;
        error.code = 'TIMEOUT';
        reject(error);
      });

      request.setTimeout(30000);
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
