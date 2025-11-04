const { githubFetcher } = require('./github-data');
const fs = require('fs');
const { logger } = require('./logger');
const { M } = require('./log-messages');

/**
 * Data Manager: chỉ sử dụng dữ liệu từ GitHub
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
      runeValues: null,
    };

    // Dùng để suy ra đường dẫn remote nếu thiếu mapping trong config
    this.localPaths = {
      weapons: './data/weapon.json',
      runewords: './data/runeword.json',
      wikis: './data/wiki.json',
      auras: './data/aura.json',
      runeValues: './data/hr-value.json',
    };
  }

  enableGitHub(owner, repo, branch = 'main') {
    this.useGitHub = true;
    githubFetcher.setRepository(owner, repo, branch);
   // logger.info(M.data.githubEnabled());
  }

  disableGitHub() {
    // Không dùng local nữa, nên disable chỉ có tác dụng logic
    this.useGitHub = false;
   // logger.info('Đã tắt GitHub mode (không có fallback local)');
  }

  /**
   * Tạo đường dẫn remote đến file dữ liệu trên GitHub
   */
  getRemotePath(dataType) {
    const mapped = this.githubConfig?.files?.[dataType];
    const fallback = this.localPaths[dataType]?.replace('./data/', 'data/');
    const path = mapped || fallback;
    if (!path) throw new Error(`Không có mapping đường dẫn cho data type: ${dataType}`);
    return path.startsWith('data/') ? path : path.replace(/^\.\/?/, '');
  }

  /**
   * Load dữ liệu (chỉ từ GitHub). Nếu lỗi, throw.
   */
  async loadData(dataType) {
    if (!this.localPaths[dataType]) {
      throw new Error(`Không hỗ trợ data type: ${dataType}`);
    }

    // Nếu đã có data thì trả ngay
    if (this.data[dataType]) {
    //  logger.debug(M.data.usingLoadedData({ type: dataType }));
      return this.data[dataType];
    }

    // Đảm bảo GitHub đã enable
    if (!this.useGitHub) {
      // thử load config 1 lần
      this.loadGitHubConfig();
      if (!this.useGitHub) {
        throw new Error('GitHub mode chưa được bật và không có fallback local');
      }
    }

    try {
    //  logger.info(M.data.loadingFromGitHub({ type: dataType }));
      const remotePath = this.getRemotePath(dataType);
      const data = await githubFetcher.fetchFile(remotePath);

      if (!data || (Array.isArray(data) && data.length === 0)) {
    //    logger.warn(M.data.validateEmptyGithub({ type: dataType }));
      }

      this.data[dataType] = data;
     // logger.info(M.data.loadedFromGitHub({ type: dataType, items: Array.isArray(data) ? data.length : 'N/A' }));
      return data;
    } catch (error) {
    //  logger.error(M.data.loadErrorGitHub({ type: dataType, msg: error.message }));
      throw error;
    }
  }

  getData(dataType) {
    return this.data[dataType];
  }

  async getWeapons() {
    if (!this.data.weapons) await this.loadData('weapons');
    return this.data.weapons;
  }

  async getRunewords() {
    if (!this.data.runewords) await this.loadData('runewords');
    return this.data.runewords;
  }

  async getWikis() {
    if (!this.data.wikis) await this.loadData('wikis');
    return this.data.wikis;
  }

  async getAuras() {
    if (!this.data.auras) await this.loadData('auras');
    return this.data.auras;
  }

  async getRuneValues() {
    if (!this.data.runeValues) await this.loadData('runeValues');
    return this.data.runeValues;
  }

  async reloadAll() {
   // logger.info(M.data.reloadingAll());
    githubFetcher.clearCache();

    this.data = {
      weapons: null,
      runewords: null,
      wikis: null,
      auras: null,
      runeValues: null,
    };

    const results = {};
    const types = ['weapons', 'runewords', 'wikis', 'auras', 'runeValues'];
    try {
      for (const t of types) {
        results[t] = await this.loadData(t);
      }
   //   logger.info(M.data.reloadSuccess());
    } catch (error) {
    //  logger.error(M.data.reloadError(), error.message);
    }
    return results;
  }

  async reload(dataType) {
  //  logger.info(M.data.reloadingType({ type: dataType }));
    const path = this.getRemotePath(dataType);
    githubFetcher.clearCache(path);
    this.data[dataType] = null;
    return await this.loadData(dataType);
  }

  getStatus() {
    return {
      useGitHub: this.useGitHub,
      loadedData: Object.keys(this.data).filter((k) => this.data[k] !== null),
      cacheInfo: this.useGitHub ? githubFetcher.getCacheInfo() : null,
    };
  }

  loadGitHubConfig() {
    try {
      const configPath = './config/github-config.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.githubConfig = config;
        if (config.enabled) {
          this.enableGitHub(config.owner, config.repo, config.branch);
     //     logger.info(M.data.githubConfigLoaded({ owner: config.owner, repo: config.repo, branch: config.branch }));
        } else {
     //     logger.info(M.data.githubConfigDisabled());
        }
        return config;
      } else {
     //   logger.info(M.data.githubConfigMissing());
        return null;
      }
    } catch (error) {
    //  logger.error(M.data.githubConfigError(), error.message);
      return null;
    }
  }

  async initialize() {
  //  logger.info(M.data.initStarting());
    this.loadGitHubConfig();
    try {
      const types = ['weapons', 'runewords', 'wikis', 'auras', 'runeValues'];
      const results = await Promise.allSettled(types.map((t) => this.loadData(t)));
      results.forEach((result, idx) => {
        const dataType = types[idx];
        if (result.status === 'rejected') {
   //       logger.error(`${M.data.initFatal()} (${dataType})`, result.reason?.message || 'unknown');
        }
      });
   //   logger.info(M.data.initDone());
    } catch (error) {
  //    logger.error(M.data.initFatal(), error.message);
    }
  }
}

const dataManager = new DataManager();

module.exports = {
  DataManager,
  dataManager,
};
