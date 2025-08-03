/**
 * Test script để verify weapon command chỉ trả về 1 kết quả duy nhất
 * Giống như logic của /rw và /wiki
 */

// Mock Discord.js objects
const mockInteraction = {
  user: {
    id: '123456789',
    tag: 'TestUser#1234',
    username: 'TestUser'
  },
  channel: {
    id: '1361772596303237212' // Allowed channel
  },
  options: {
    getString: (name) => {
      if (name === 'name') return 'grief'; // Test weapon name
      return null;
    }
  },
  deferReply: async (options) => {
    console.log('✅ Mock deferReply called');
    return Promise.resolve();
  },
  editReply: async (options) => {
    console.log('✅ Mock editReply called');
    
    // Analyze response
    if (options.content) {
      console.log('📝 Content response:', options.content);
    }
    
    if (options.embeds) {
      console.log(`📊 Number of embeds: ${options.embeds.length}`);
      
      if (options.embeds.length === 1) {
        const embed = options.embeds[0];
        console.log(`🎯 Single weapon found: ${embed.data.title}`);
        console.log(`🔧 Fields: ${embed.data.fields ? embed.data.fields.length : 0} fields`);
        
        // Check fields
        if (embed.data.fields) {
          embed.data.fields.forEach((field, index) => {
            console.log(`   Field ${index + 1}: ${field.name} = ${field.value}`);
          });
        }
        
        // Check footer
        if (embed.data.footer) {
          console.log(`📄 Footer: ${embed.data.footer.text}`);
        }
      } else {
        console.log('❌ ERROR: Multiple embeds returned!');
        options.embeds.forEach((embed, index) => {
          console.log(`   Embed ${index + 1}: ${embed.data.title}`);
        });
      }
    }
    
    return Promise.resolve();
  }
};

// Mock exact match interaction
const mockExactMatchInteraction = {
  ...mockInteraction,
  options: {
    getString: (name) => {
      if (name === 'name') return 'Grief'; // Exact match test
      return null;
    }
  }
};

// Mock partial match interaction
const mockPartialMatchInteraction = {
  ...mockInteraction,
  options: {
    getString: (name) => {
      if (name === 'name') return 'grie'; // Partial match test
      return null;
    }
  }
};

// Mock not found interaction
const mockNotFoundInteraction = {
  ...mockInteraction,
  options: {
    getString: (name) => {
      if (name === 'name') return 'nonexistentweapon123'; // Not found test
      return null;
    }
  }
};

// Import weapon module
const { handleSlashWeapon } = require('../commands/weapon');

async function testExactMatch() {
  console.log('🧪 Testing Exact Match...\n');
  
  try {
    console.log('🔍 Searching for: "Grief" (exact match)');
    
    await handleSlashWeapon(mockExactMatchInteraction);
    
    console.log('\n✅ Exact match test completed!');
    
  } catch (error) {
    console.error('\n❌ Exact match test failed:', error.message);
  }
}

async function testPartialMatch() {
  console.log('\n🧪 Testing Partial Match...\n');
  
  try {
    console.log('🔍 Searching for: "grie" (partial match)');
    
    await handleSlashWeapon(mockPartialMatchInteraction);
    
    console.log('\n✅ Partial match test completed!');
    
  } catch (error) {
    console.error('\n❌ Partial match test failed:', error.message);
  }
}

async function testNotFound() {
  console.log('\n🧪 Testing Not Found...\n');
  
  try {
    console.log('🔍 Searching for: "nonexistentweapon123" (not found)');
    
    await handleSlashWeapon(mockNotFoundInteraction);
    
    console.log('\n✅ Not found test completed!');
    
  } catch (error) {
    console.error('\n❌ Not found test failed:', error.message);
  }
}

async function testSingleResultLogic() {
  console.log('\n🧪 Testing Single Result Logic...\n');
  
  // Test với multiple potential matches
  const mockMultipleMatchInteraction = {
    ...mockInteraction,
    options: {
      getString: (name) => {
        if (name === 'name') return 'sword'; // Should match multiple but return only 1
        return null;
      }
    },
    editReply: async (options) => {
      console.log('✅ Mock editReply for multiple potential matches');
      
      if (options.embeds) {
        const embedCount = options.embeds.length;
        console.log(`📊 Embeds returned: ${embedCount}`);
        
        if (embedCount === 1) {
          console.log('✅ PASS: Only 1 result returned despite multiple potential matches');
          console.log(`🎯 Selected weapon: ${options.embeds[0].data.title}`);
        } else {
          console.log('❌ FAIL: Multiple results returned!');
          options.embeds.forEach((embed, index) => {
            console.log(`   Result ${index + 1}: ${embed.data.title}`);
          });
        }
      }
      
      return Promise.resolve();
    }
  };
  
  try {
    console.log('🔍 Searching for: "sword" (multiple potential matches)');
    
    await handleSlashWeapon(mockMultipleMatchInteraction);
    
    console.log('\n✅ Single result logic test completed!');
    
  } catch (error) {
    console.error('\n❌ Single result logic test failed:', error.message);
  }
}

async function testResponseStructure() {
  console.log('\n🧪 Testing Response Structure...\n');
  
  const mockStructureInteraction = {
    ...mockInteraction,
    editReply: async (options) => {
      console.log('✅ Analyzing response structure...');
      
      // Check structure
      const hasContent = !!options.content;
      const hasEmbeds = !!options.embeds;
      const embedCount = options.embeds ? options.embeds.length : 0;
      
      console.log(`📝 Has content: ${hasContent}`);
      console.log(`📊 Has embeds: ${hasEmbeds}`);
      console.log(`🔢 Embed count: ${embedCount}`);
      
      if (hasEmbeds && embedCount === 1) {
        const embed = options.embeds[0];
        const hasTitle = !!embed.data.title;
        const hasFields = !!embed.data.fields;
        const fieldCount = embed.data.fields ? embed.data.fields.length : 0;
        const hasFooter = !!embed.data.footer;
        const hasColor = !!embed.data.color;
        
        console.log(`📋 Structure Analysis:`);
        console.log(`   ✅ Title: ${hasTitle}`);
        console.log(`   ✅ Fields: ${hasFields} (${fieldCount} fields)`);
        console.log(`   ✅ Footer: ${hasFooter}`);
        console.log(`   ✅ Color: ${hasColor}`);
        
        // Expected fields: Damage, WSM, Required
        const expectedFields = ['Damage', 'WSM', 'Required'];
        if (embed.data.fields) {
          const actualFields = embed.data.fields.map(f => f.name);
          console.log(`   📊 Field names: ${actualFields.join(', ')}`);
        }
      }
      
      return Promise.resolve();
    }
  };
  
  try {
    console.log('🔍 Testing response structure...');
    
    await handleSlashWeapon(mockStructureInteraction);
    
    console.log('\n✅ Response structure test completed!');
    
  } catch (error) {
    console.error('\n❌ Response structure test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 Weapon Single Result Test Suite\n');
  console.log('=' .repeat(60));
  
  await testExactMatch();
  await testPartialMatch();
  await testNotFound();
  await testSingleResultLogic();
  await testResponseStructure();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 All weapon single result tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log('- ✅ Exact match takes priority');
  console.log('- ✅ Partial match as fallback');
  console.log('- ✅ Only 1 result returned');
  console.log('- ✅ Proper embed structure');
  console.log('- ✅ Clear not found message');
  console.log('\n🔄 Logic comparison:');
  console.log('- /rw: Exact match only');
  console.log('- /wiki: Exact match only');
  console.log('- /weapon: Exact match → Partial match fallback');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testExactMatch,
  testPartialMatch,
  testNotFound,
  testSingleResultLogic,
  testResponseStructure,
  runAllTests
};
