const fs = require('fs').promises;
const path = require('path');
const { githubFetcher } = require('./github-data');

class TranslationCache {
    constructor() {
        this.cache = new Map();
        this.cacheFile = 'translation_cache.json';
        this.cachePath = path.join(__dirname, '../data', this.cacheFile);
        this.githubPath = 'data/translation_cache.json';
        this.isLoaded = false;
    }

    async initialize() {
        try {
            await this.loadFromGitHub();
            console.log(`✅ Translation cache loaded: ${this.cache.size} entries`);
            this.isLoaded = true;
        } catch (error) {
            console.error('❌ Failed to load translation cache from GitHub, trying local...', error);
            await this.loadFromLocal();
        }
    }

    async loadFromGitHub() {
        try {
            console.log('🔄 Loading translation cache from GitHub...');
            const cacheData = await githubFetcher.fetchFile(this.githubPath);
            
            if (cacheData && Array.isArray(cacheData)) {
                this.cache.clear();
                cacheData.forEach(entry => {
                    if (entry.text && entry.translation) {
                        this.cache.set(this.normalizeText(entry.text), {
                            translation: entry.translation,
                            sourceLang: entry.sourceLang,
                            targetLang: entry.targetLang,
                            timestamp: entry.timestamp || Date.now()
                        });
                    }
                });
                console.log(`✅ Loaded ${this.cache.size} translations from GitHub`);
            }
        } catch (error) {
            console.error('❌ Failed to load from GitHub:', error.message);
            throw error;
        }
    }

    async loadFromLocal() {
        try {
            const data = await fs.readFile(this.cachePath, 'utf8');
            const cacheData = JSON.parse(data);
            
            if (Array.isArray(cacheData)) {
                this.cache.clear();
                cacheData.forEach(entry => {
                    if (entry.text && entry.translation) {
                        this.cache.set(this.normalizeText(entry.text), {
                            translation: entry.translation,
                            sourceLang: entry.sourceLang,
                            targetLang: entry.targetLang,
                            timestamp: entry.timestamp || Date.now()
                        });
                    }
                });
                console.log(`✅ Loaded ${this.cache.size} translations from local file`);
            }
            this.isLoaded = true;
        } catch (error) {
            console.log('ℹ️ No existing translation cache file, starting fresh');
            this.isLoaded = true;
        }
    }

    async saveToGitHub() {
        try {
            const cacheArray = Array.from(this.cache.entries()).map(([text, data]) => ({
                text: text,
                translation: data.translation,
                sourceLang: data.sourceLang,
                targetLang: data.targetLang,
                timestamp: data.timestamp
            }));

            // Lưu local trước
            await this.saveToLocal();

            console.log('💾 Translation cache saved locally, GitHub sync would require additional setup');
            
        } catch (error) {
            console.error('❌ Failed to save translation cache:', error);
        }
    }

    async saveToLocal() {
        try {
            // Đảm bảo thư mục tồn tại
            const dataDir = path.dirname(this.cachePath);
            await fs.mkdir(dataDir, { recursive: true });

            const cacheArray = Array.from(this.cache.entries()).map(([text, data]) => ({
                text: text,
                translation: data.translation,
                sourceLang: data.sourceLang,
                targetLang: data.targetLang,
                timestamp: data.timestamp
            }));

            await fs.writeFile(this.cachePath, JSON.stringify(cacheArray, null, 2));
            console.log(`💾 Saved ${cacheArray.length} translations to local cache`);
        } catch (error) {
            console.error('❌ Failed to save local cache:', error);
        }
    }

    normalizeText(text) {
        return text.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    get(text) {
        if (!this.isLoaded) return null;
        
        const normalized = this.normalizeText(text);
        const cached = this.cache.get(normalized);
        
        if (cached) {
            console.log(`✅ Cache hit for: ${text.substring(0, 50)}...`);
            return cached.translation;
        }
        
        console.log(`❌ Cache miss for: ${text.substring(0, 50)}...`);
        return null;
    }

    set(text, translation, sourceLang, targetLang) {
        const normalized = this.normalizeText(text);
        this.cache.set(normalized, {
            translation: translation,
            sourceLang: sourceLang,
            targetLang: targetLang,
            timestamp: Date.now()
        });

        // Auto-save khi có thêm bản dịch mới (debounced)
        this.debouncedSave();
    }

    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveToLocal();
        }, 5000); // Save sau 5 giây không có activity
    }

    getStats() {
        return {
            totalEntries: this.cache.size,
            isLoaded: this.isLoaded
        };
    }

    // Tìm bản dịch gần đúng (fuzzy search)
    findSimilar(text, threshold = 0.8) {
        const normalized = this.normalizeText(text);
        
        for (let [cachedText, data] of this.cache.entries()) {
            const similarity = this.calculateSimilarity(normalized, cachedText);
            if (similarity >= threshold) {
                console.log(`🔍 Found similar translation (${Math.round(similarity * 100)}% match)`);
                return data.translation;
            }
        }
        
        return null;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        return (longer.length - this.editDistance(longer, shorter)) / parseFloat(longer.length);
    }

    editDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i-1) === str1.charAt(j-1)) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i-1][j-1] + 1,
                        matrix[i][j-1] + 1,
                        matrix[i-1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}

module.exports = new TranslationCache();