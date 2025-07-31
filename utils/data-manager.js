const { githubFetcher } = require('./github-data');
const fs = require('fs');
const path = require('path');

/**
 * Data Manager để quản lý việc load dữ liệu từ GitHub hoặc local
 */
class DataManager {
  constructor() {
    this.useGitHub = false;
    this.data = {
      weapons: null,
      runewords: null,
      wikis: null
    };
    this.localPaths = {
      weapons: './data/weapon.json',
      runewords: './data/runeword.json',
      wikis: './data/wiki.json'
    };
  }

  /**
   * Cấu hình để sử dụng GitHub
   * @param {string} owner - GitHub username
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   */
  enableGitHub(owner, repo, branch = 'main') {
    this.useGitHub = true;
    githubFetcher.setRepository(owner, repo, branch);
    console.log('Đã bật chế độ GitHub data loading');
  }

  /**
   * Tắt GitHub và sử dụng file local
   */
  disableGitHub() {
    this.useGitHub = false;
    console.log('Đã tắt chế độ GitHub, sử dụng file local');
  }

  /**
   * Load dữ liệu từ GitHub hoặc local
   * @param {string} dataType - 'weapons', 'runewords', hoặc 'wikis'
   * @returns {Promise<any>} - Data
   */
  async loadData(dataType) {
    if (!this.localPaths[dataType]) {
      throw new Error(`Không hỗ trợ data type: ${dataType}`);
    }

    try {
      if (this.useGitHub) {
        // Load từ GitHub
        const fileName = path.basename(this.localPaths[dataType]);
        const data = await githubFetcher.fetchFile(fileName);
        this.data[dataType] = data;
        return data;
      } else {
        // Load từ file local
        const filePath = this.localPaths[dataType];
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.data[dataType] = data;
          return data;
        } else {
          throw new Error(`File local không tồn tại: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi load ${dataType}:`, error.message);
      
      // Fallback: thử load từ source khác
      if (this.useGitHub) {
        console.log(`Fallback: thử load ${dataType} từ file local...`);
        try {
          const filePath = this.localPaths[dataType];
          if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.data[dataType] = data;
            return data;
          }
        } catch (fallbackError) {
          console.error(`Fallback cũng thất bại:`, fallbackError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Lấy dữ liệu weapons
   */
  async getWeapons() {
    if (!this.data.weapons) {
      await this.loadData('weapons');
    }
    return this.data.weapons;
  }

  /**
   * Lấy dữ liệu runewords
   */
  async getRunewords() {
    if (!this.data.runewords) {
      await this.loadData('runewords');
    }
    return this.data.runewords;
  }

  /**
   * Lấy dữ liệu wikis
   */
  async getWikis() {
    if (!this.data.wikis) {
      await this.loadData('wikis');
    }
    return this.data.wikis;
  }

  /**
   * Reload tất cả dữ liệu
   */
  async reloadAll() {
    console.log('Đang reload tất cả dữ liệu...');
    
    // Xóa cache
    if (this.useGitHub) {
      githubFetcher.clearCache();
    }
    
    // Reset data
    this.data = {
      weapons: null,
      runewords: null,
      wikis: null
    };
    
    // Load lại
    const results = {};
    try {
      results.weapons = await this.loadData('weapons');
      results.runewords = await this.loadData('runewords');
      results.wikis = await this.loadData('wikis');
      console.log('Reload thành công tất cả dữ liệu');
    } catch (error) {
      console.error('Lỗi khi reload dữ liệu:', error.message);
    }
    
    return results;
  }

  /**
   * Reload dữ liệu cụ thể
   * @param {string} dataType - 'weapons', 'runewords', hoặc 'wikis'
   */
  async reload(dataType) {
    console.log(`Đang reload ${dataType}...`);
    
    if (this.useGitHub) {
      const fileName = path.basename(this.localPaths[dataType]);
      githubFetcher.clearCache(fileName);
    }
    
    this.data[dataType] = null;
    return await this.loadData(dataType);
  }

  /**
   * Lấy thông tin trạng thái
   */
  getStatus() {
    return {
      useGitHub: this.useGitHub,
      loadedData: Object.keys(this.data).filter(key => this.data[key] !== null),
      cacheInfo: this.useGitHub ? githubFetcher.getCacheInfo() : null
    };
  }

  /**
   * Load cấu hình GitHub từ file
   */
  loadGitHubConfig() {
    try {
      const configPath = './config/github-config.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.enabled) {
          this.enableGitHub(config.owner, config.repo, config.branch);
          console.log(`Đã load cấu hình GitHub: ${config.owner}/${config.repo}@${config.branch}`);
        } else {
          console.log('GitHub config tồn tại nhưng bị tắt');
        }
        return config;
      } else {
        console.log('Không tìm thấy github-config.json, sử dụng file local');
        return null;
      }
    } catch (error) {
      console.error('Lỗi load GitHub config:', error.message);
      return null;
    }
  }

  /**
   * Preload tất cả dữ liệu khi khởi động
   */
  async initialize() {
    console.log('Đang khởi tạo Data Manager...');

    // Load cấu hình GitHub
    this.loadGitHubConfig();

    try {
      await this.loadData('weapons');
      await this.loadData('runewords');
      await this.loadData('wikis');
      console.log('Khởi tạo Data Manager thành công');
    } catch (error) {
      console.error('Lỗi khởi tạo Data Manager:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const dataManager = new DataManager();

module.exports = {
  DataManager,
  dataManager
};
