const { githubFetcher } = require('./github-data');
const fs = require('fs');
const path = require('path');
const { setInterval } = require('timers/promises');

/**
 * Data Manager để quản lý việc load dữ liệu từ GitHub hoặc local
 */
class DataManager {
  constructor() {
    this.useGitHub = false;
    this.data = {
      weapons: null,
      runewords: null,
      wikis: null,
      auras: null,
      runeValues: null
    };
    this.localPaths = {
      weapons: './data/weapon.json',
      runewords: './data/runeword.json',
      wikis: './data/wiki.json',
      auras: './data/aura.json',
      runeValues: './data/hr-value.json'
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

    // Nếu đã có data trong memory, trả về luôn
    if (this.data[dataType]) {
      console.log(`Sử dụng data đã load cho ${dataType}`);
      return this.data[dataType];
    }

    let githubError = null;
    let localError = null;

    // Thử GitHub trước nếu được bật
    if (this.useGitHub) {
      try {
        console.log(`Đang load ${dataType} từ GitHub...`);
        const filePath = this.localPaths[dataType].replace('./data/', 'data/');
        const data = await githubFetcher.fetchFile(filePath);

        // Validate data
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn(`Warning: ${dataType} từ GitHub trống hoặc null`);
        }

        this.data[dataType] = data;
        console.log(`✅ Load ${dataType} từ GitHub thành công (${Array.isArray(data) ? data.length : 'N/A'} items)`);
        return data;

      } catch (error) {
        githubError = error;
        console.error(`❌ Lỗi load ${dataType} từ GitHub:`, error.message);
      }
    }

    // Fallback: thử load từ file local
    try {
      console.log(`Đang load ${dataType} từ file local...`);
      const filePath = this.localPaths[dataType];

      if (!fs.existsSync(filePath)) {
        throw new Error(`File không tồn tại: ${filePath}`);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Validate data
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn(`Warning: ${dataType} từ local file trống hoặc null`);
      }

      this.data[dataType] = data;
      console.log(`✅ Load ${dataType} từ local file thành công (${Array.isArray(data) ? data.length : 'N/A'} items)`);
      return data;

    } catch (error) {
      localError = error;
      console.error(`❌ Lỗi load ${dataType} từ local file:`, error.message);
    }

    // Cả GitHub và local đều thất bại
    const errorMsg = `Không thể load ${dataType}. GitHub: ${githubError?.message || 'N/A'}, Local: ${localError?.message || 'N/A'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Lấy dữ liệu theo type
   * @param {string} dataType - 'weapons', 'runewords', hoặc 'wikis'
   * @returns {any} - Data đã được load
   */
  getData(dataType) {
    return this.data[dataType];
  }

  /**
   * Lấy dữ liệu weapons
   */
  async getWeapons() {
    // if (!this.data.weapons) {
    //   await this.loadData('weapons');
    // }
    return this.data.weapons;
  }

  /**
   * Lấy dữ liệu runewords
   */
  async getRunewords() {
    // if (!this.data.runewords) {
    //   await this.loadData('runewords');
    // }
    return this.data.runewords;
  }

  /**
   * Lấy dữ liệu wikis
   */
  async getWikis() {
    // if (!this.data.wikis) {
    //   await this.loadData('wikis');
    // }
    return this.data.wikis;
  }

    async getAuras() {
    return this.data.auras;
  }
  /**
   * Lấy dữ liệu giá trị rune
   */
  async getRuneValues() {
    return this.data.runeValues;
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
      wikis: null,
      auras: null,
      runeValues: null
    };
    
    // Load lại
    const results = {};
    try {
      results.weapons = await this.loadData('weapons');
      results.runewords = await this.loadData('runewords');
      results.wikis = await this.loadData('wikis');
      results.auras = await this.loadData('auras');
      results.runeValues = await this.loadData('runeValues');
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
      const filePath = this.localPaths[dataType].replace('./data/', 'data/');
      githubFetcher.clearCache(filePath);
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
      // Sử dụng Promise.allSettled để không bị dừng bởi một lỗi duy nhất
      const results = await Promise.allSettled([
        this.loadData('weapons'),
        this.loadData('runewords'),
        this.loadData('wikis'),
        this.loadData('auras'),
        this.loadData('runeValues')
      ]);

      results.forEach((result, index) => {
        const dataType = Object.keys(this.localPaths)[index];
        if (result.status === 'rejected') {
          console.error(`Lỗi khởi tạo data cho ${dataType}:`, result.reason.message);
        }
      });

      console.log('Khởi tạo Data Manager hoàn tất (có thể có lỗi).');

    } catch (error) {
      // Bắt các lỗi không mong muốn khác, nhưng không throw để tránh crash
      console.error('Lỗi nghiêm trọng khi khởi tạo Data Manager:', error.message);
    }
  }
}

// Singleton instance
const dataManager = new DataManager();

module.exports = {
  DataManager,
  dataManager
};
