const https = require('https');
const { githubFetcher } = require('../utils/github-data');

/**
 * Script debug GitHub connection cho Render deployment
 */

async function debugGitHubConnection() {
  console.log('='.repeat(60));
  console.log('DEBUG GITHUB CONNECTION CHO RENDER');
  console.log('='.repeat(60));
  
  // 1. Kiểm tra config
  console.log('\n1. Kiểm tra GitHub config...');
  try {
    const config = require('../config/github-config.json');
    console.log('✅ Config loaded:', JSON.stringify(config, null, 2));
    
    if (!config.enabled) {
      console.log('❌ GitHub bị tắt trong config');
      return;
    }
    
    if (!config.owner || !config.repo || !config.branch) {
      console.log('❌ Config thiếu thông tin cần thiết');
      return;
    }
    
  } catch (error) {
    console.log('❌ Lỗi load config:', error.message);
    return;
  }
  
  // 2. Kiểm tra DNS resolution
  console.log('\n2. Kiểm tra DNS resolution...');
  try {
    const dns = require('dns').promises;
    const addresses = await dns.lookup('raw.githubusercontent.com');
    console.log('✅ DNS resolved:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }
  
  // 3. Test HTTP connection trực tiếp
  console.log('\n3. Test HTTP connection...');
  const testUrls = [
    'https://raw.githubusercontent.com/1l4u/gheedbot/main/data/weapon.json',
    'https://raw.githubusercontent.com/1l4u/gheedbot/main/data/runeword.json',
    'https://raw.githubusercontent.com/1l4u/gheedbot/main/data/wiki.json'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\nTesting: ${url}`);
      const data = await testHttpGet(url);
      const size = data.length;
      console.log(`✅ Success - Size: ${size} bytes`);
      
      // Test JSON parsing
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ JSON valid - Items: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
      } catch (parseError) {
        console.log(`❌ JSON invalid: ${parseError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Status: ${error.statusCode}`);
    }
  }
  
  // 4. Test với GitHub fetcher
  console.log('\n4. Test với GitHub fetcher...');
  try {
    githubFetcher.setRepository('1l4u', 'gheedbot', 'main');
    
    const files = ['data/weapon.json', 'data/runeword.json', 'data/wiki.json'];
    for (const file of files) {
      try {
        console.log(`\nFetching: ${file}`);
        const data = await githubFetcher.fetchFile(file);
        console.log(`✅ Success - Items: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ GitHub fetcher error:', error.message);
  }
  
  // 5. Kiểm tra environment
  console.log('\n5. Environment info...');
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Arch: ${process.arch}`);
  console.log(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  
  // Kiểm tra environment variables
  const envVars = ['NODE_ENV', 'PORT', 'RENDER', 'RENDER_SERVICE_NAME'];
  envVars.forEach(envVar => {
    const value = process.env[envVar];
    console.log(`${envVar}: ${value || 'undefined'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('DEBUG HOÀN THÀNH');
  console.log('='.repeat(60));
}

/**
 * Test HTTP GET với timeout và error handling tốt hơn
 */
function testHttpGet(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      timeout: timeout,
      headers: {
        'User-Agent': 'GheedBot/1.0',
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache'
      }
    }, (response) => {
      let data = '';
      
      // Log response info
      console.log(`   Status: ${response.statusCode} ${response.statusMessage}`);
      console.log(`   Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
      
      response.on('error', (error) => {
        reject(error);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
    
    request.setTimeout(timeout);
  });
}

// Chạy debug nếu file này được execute trực tiếp
if (require.main === module) {
  debugGitHubConnection().catch(console.error);
}

module.exports = { debugGitHubConnection, testHttpGet };
