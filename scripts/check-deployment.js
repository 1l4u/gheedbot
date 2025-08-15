/**
 * Script kiểm tra deployment status của GheedBot
 */

const https = require('https');
const http = require('http');

class DeploymentChecker {
  constructor() {
    this.results = {};
    this.baseUrl = '';
  }

  /**
   * Đặt base URL cho deployment
   */
  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    console.log(`🔗 Base URL đã đặt: ${this.baseUrl}`);
  }

  /**
   * HTTP request với timeout
   */
  async httpRequest(url, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const startTime = Date.now();
      
      const request = client.get(url, {
        timeout: timeout,
        headers: {
          'User-Agent': 'GheedBot-Deployment-Checker/1.0',
          'Accept': 'application/json, text/html, */*'
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          let parsedData = null;
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            // Not JSON, keep as text
          }
          
          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            headers: response.headers,
            data: parsedData || data,
            responseTime: responseTime,
            success: response.statusCode >= 200 && response.statusCode < 300
          });
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

  /**
   * Test một endpoint cụ thể
   */
  async testEndpoint(endpoint) {
    if (!this.baseUrl) {
      throw new Error('Base URL chưa được đặt');
    }
    
    const url = this.baseUrl + endpoint;
    console.log(`🧪 Testing ${endpoint}...`);
    
    try {
      const result = await this.httpRequest(url);
      
      this.results[endpoint] = result;
      
      if (result.success) {
        console.log(`✅ ${endpoint} - ${result.statusCode} (${result.responseTime}ms)`);
        
        // Log thêm thông tin cho một số endpoints
        if (endpoint === '/health' && result.data && typeof result.data === 'object') {
          console.log(`   Bot Status: ${result.data.bot?.status || 'unknown'}`);
          console.log(`   Uptime: ${Math.floor(result.data.server?.uptime || 0)}s`);
        }
        
        if (endpoint === '/test-github' && result.data && typeof result.data === 'object') {
          console.log(`   GitHub Status: ${result.data.status}`);
          console.log(`   Data Size: ${result.data.dataSize}`);
        }
      } else {
        console.log(`❌ ${endpoint} - ${result.statusCode} ${result.statusMessage}`);
      }
      
      return result;
      
    } catch (error) {
      console.log(`💥 ${endpoint} - Error: ${error.message}`);
      this.results[endpoint] = {
        success: false,
        error: error.message
      };
      return this.results[endpoint];
    }
  }

  /**
   * Test tất cả endpoints
   */
  async testAllEndpoints() {
    const endpoints = ['/', '/ping', '/health', '/test-github'];
    
    console.log('🚀 Bắt đầu kiểm tra tất cả endpoints...\n');
    
    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint);
      console.log(''); // Empty line for readability
    }
    
    this.printSummary();
  }

  /**
   * In tóm tắt kết quả
   */
  printSummary() {
    console.log('📊 TÓM TẮT KẾT QUẢ');
    console.log('='.repeat(50));
    
    const total = Object.keys(this.results).length;
    const successful = Object.values(this.results).filter(r => r.success).length;
    const failed = total - successful;
    
    console.log(`Tổng endpoints: ${total}`);
    console.log(`Thành công: ${successful}`);
    console.log(`Thất bại: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 TẤT CẢ ENDPOINTS HOẠT ĐỘNG TỐT!');
      console.log('Bot deployment đang hoạt động bình thường.');
    } else if (successful === 0) {
      console.log('\n💀 TẤT CẢ ENDPOINTS ĐỀU LỖI!');
      console.log('Bot deployment có vấn đề nghiêm trọng.');
    } else {
      console.log('\n⚠️ MỘT SỐ ENDPOINTS CÓ VẤN ĐỀ');
      console.log('Cần kiểm tra và sửa lỗi.');
    }
    
    console.log('\n🔧 HƯỚNG DẪN SỬA LỖI:');
    console.log('1. Kiểm tra logs trên platform deployment');
    console.log('2. Kiểm tra environment variables (DISCORD_TOKEN, PORT)');
    console.log('3. Kiểm tra network/firewall settings');
    console.log('4. Kiểm tra UptimeRobot configuration');
    console.log('5. Restart deployment nếu cần thiết');
  }

  /**
   * Test với URL cụ thể
   */
  static async quickTest(url) {
    const checker = new DeploymentChecker();
    checker.setBaseUrl(url);
    await checker.testAllEndpoints();
    return checker.results;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Cần cung cấp URL deployment');
    console.log('Cách sử dụng: node check-deployment.js <URL>');
    console.log('Ví dụ: node check-deployment.js https://your-app.onrender.com');
    process.exit(1);
  }
  
  const url = args[0];
  
  console.log('🤖 GheedBot Deployment Checker');
  console.log('='.repeat(50));
  console.log(`Target URL: ${url}\n`);
  
  DeploymentChecker.quickTest(url)
    .then(() => {
      console.log('\n✅ Kiểm tra hoàn tất!');
    })
    .catch((error) => {
      console.error('\n💥 Lỗi khi kiểm tra:', error.message);
      process.exit(1);
    });
}

module.exports = { DeploymentChecker };
