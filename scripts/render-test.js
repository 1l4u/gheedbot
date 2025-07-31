const { dataManager } = require('../utils/data-manager');

/**
 * Script test cho Render deployment
 */

async function testRenderDeployment() {
  console.log('='.repeat(60));
  console.log('RENDER DEPLOYMENT TEST');
  console.log('='.repeat(60));
  
  // 1. Environment check
  console.log('\n1. Environment Check:');
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`Is Render: ${process.env.RENDER ? 'YES' : 'NO'}`);
  console.log(`Service: ${process.env.RENDER_SERVICE_NAME || 'N/A'}`);
  
  // 2. Config check
  console.log('\n2. Config Check:');
  try {
    const config = dataManager.loadGitHubConfig();
    console.log(`GitHub enabled: ${config.enabled}`);
    console.log(`Owner: ${config.owner}`);
    console.log(`Repo: ${config.repo}`);
    console.log(`Branch: ${config.branch}`);
  } catch (error) {
    console.log(`Config error: ${error.message}`);
  }
  
  // 3. Data loading test
  console.log('\n3. Data Loading Test:');
  const dataTypes = ['weapons', 'runewords', 'wikis'];
  
  for (const dataType of dataTypes) {
    try {
      console.log(`\nTesting ${dataType}...`);
      const startTime = Date.now();
      
      const data = await dataManager.loadData(dataType);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ ${dataType}: ${Array.isArray(data) ? data.length : 'N/A'} items (${loadTime}ms)`);
      
      // Sample data check
      if (Array.isArray(data) && data.length > 0) {
        const sample = data[0];
        console.log(`   Sample keys: ${Object.keys(sample).slice(0, 5).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ ${dataType}: ${error.message}`);
    }
  }
  
  // 4. Memory usage after loading
  console.log('\n4. Memory Usage After Loading:');
  const memUsage = process.memoryUsage();
  console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
  console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
  
  // 5. Performance test
  console.log('\n5. Performance Test:');
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = dataTypes.map(type => dataManager.loadData(type));
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Concurrent loading: ${totalTime}ms`);
    
  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
  }
  
  // 6. Cache test
  console.log('\n6. Cache Test:');
  try {
    const startTime = Date.now();
    
    // Load again (should use cache)
    await dataManager.loadData('weapons');
    
    const cacheTime = Date.now() - startTime;
    console.log(`✅ Cache loading: ${cacheTime}ms`);
    
  } catch (error) {
    console.log(`❌ Cache test failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST HOÀN THÀNH');
  console.log('='.repeat(60));
}

// Chạy test nếu file này được execute trực tiếp
if (require.main === module) {
  testRenderDeployment().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testRenderDeployment };
