const { githubFetcher } = require('./github-data');
const fs = require('fs');
const path = require('path');
const { setInterval } = require('timers/promises');
const { logger } = require('./logger');
const { M } = require('./log-messages');

/**
 * Data Manager để quản lý việc load dữ liệu từ GitHub hoặc local
 */
class DataManager {
  constructor() {
    this.useGitHub = false;
    this.githubConfig = null;
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
    logger.info(M.data.githubEnabled());
  }

  /**
   * Tắt GitHub và sử dụng file local
   */
  disableGitHub() {
    this.useGitHub = false;
    logger.info(M.data.githubDisabled());
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
      logger.debug(M.data.usingLoadedData({ type: dataType }));
      return this.data[dataType];
    }

    let githubError = null;
    let localError = null;

    // Thử GitHub trước nếu được bật
    if (this.useGitHub) {
      try {
        logger.info(M.data.loadingFromGitHub({ type: dataType }));
        const mapped = this.githubConfig?.files?.[dataType];
        const filePath = mapped || this.localPaths[dataType].replace('./data/', 'data/');
        const normalizedPath = filePath.startsWith('data/') ? filePath : filePath.replace('./', '');
        const data = await githubFetcher.fetchFile(normalizedPath);

        // Validate data
        if (!data || (Array.isArray(data) && data.length === 0)) {
          logger.warn(M.data.validateEmptyGithub({ type: dataType }));
        }

        this.data[dataType] = data;
        logger.info(M.data.loadedFromGitHub({ type: dataType, items: Array.isArray(data) ? data.length : 'N/A' }));
        return data;

      } catch (error) {
        githubError = error;
        logger.error(M.data.loadErrorGitHub({ type: dataType, msg: error.message }));
      }
    }

    // Fallback: thử load từ file local
    try {
      logger.info(M.data.loadingFromLocal({ type: dataType }));
      const filePath = this.localPaths[dataType];

      if (!fs.existsSync(filePath)) {
        throw new Error(`File không tồn tại: ${filePath}`);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Validate data
      if (!data || (Array.isArray(data) && data.length === 0)) {
        logger.warn(M.data.validateEmptyLocal({ type: dataType }));
      }

      this.data[dataType] = data;
      logger.info(M.data.loadedFromLocal({ type: dataType, items: Array.isArray(data) ? data.length : 'N/A' }));
      return data;

    } catch (error) {
      localError = error;
      logger.error(M.data.loadErrorLocal({ type: dataType, msg: error.message }));
    }

    // Cả GitHub và local đều thất bại
    const errorMsg = M.data.loadFatal({ type: dataType, gMsg: githubError?.message || 'N/A', lMsg: localError?.message || 'N/A' });
    logger.error(errorMsg);
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
    logger.info(M.data.reloadingAll());
    
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
      logger.info(M.data.reloadSuccess());
    } catch (error) {
      logger.error(M.data.reloadError(), error.message);
    }
    
    return results;
  }

  /**
   * Reload dữ liệu cụ thể
   * @param {string} dataType - 'weapons', 'runewords', hoặc 'wikis'
   */
  async reload(dataType) {
    logger.info(M.data.reloadingType({ type: dataType }));
    
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
        this.githubConfig = config;
        if (config.enabled) {
          this.enableGitHub(config.owner, config.repo, config.branch);
          logger.info(M.data.githubConfigLoaded({ owner: config.owner, repo: config.repo, branch: config.branch }));
        } else {
          logger.info(M.data.githubConfigDisabled());
        }
        return config;
      } else {
        logger.info(M.data.githubConfigMissing());
        return null;
      }
    } catch (error) {
      logger.error(M.data.githubConfigError(), error.message);
      return null;
    }
  }

  /**
   * Preload tất cả dữ liệu khi khởi động
   */
  async initialize() {
    logger.info(M.data.initStarting());

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
          logger.error(`${M.data.initFatal()} (${dataType})`, result.reason.message);
        }
      });

      logger.info(M.data.initDone());

    } catch (error) {
      // Bắt các lỗi không mong muốn khác, nhưng không throw để tránh crash
      logger.error(M.data.initFatal(), error.message);
    }
  }
}

// Singleton instance
const dataManager = new DataManager();

module.exports = {
  DataManager,
  dataManager
};
