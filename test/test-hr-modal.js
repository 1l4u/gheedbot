/**
 * Test script để debug HR modal submission
 */

// Mock Discord.js objects
const mockInteraction = {
  user: {
    id: '123456789',
    tag: 'TestUser#1234',
    username: 'TestUser'
  },
  customId: 'hr_modal_group1',
  fields: {
    getTextInputValue: (fieldId) => {
      // Mock input values
      const mockValues = {
        'rune_um': '5',
        'rune_mal': '3',
        'rune_ist': '2',
        'rune_gul': '1'
      };
      return mockValues[fieldId] || '0';
    }
  },
  reply: async (options) => {
    console.log('✅ Mock Reply:', options);
    return Promise.resolve();
  }
};

// Import HR module
const { handleHrModalSubmit } = require('../commands/hr');

async function testHrModalSubmission() {
  console.log('🧪 Testing HR Modal Submission...\n');
  
  try {
    console.log('📝 Mock Input Data:');
    console.log('- UM: 5');
    console.log('- MAL: 3');
    console.log('- IST: 2');
    console.log('- GUL: 1\n');
    
    console.log('🚀 Calling handleHrModalSubmit...\n');
    
    await handleHrModalSubmit(mockInteraction);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    console.error('\n📍 Stack trace:');
    console.error(error.stack);
  }
}

// Test public modal too
const mockPublicInteraction = {
  user: {
    id: '987654321',
    tag: 'TestUser2#5678',
    username: 'TestUser2'
  },
  customId: 'hr_public_modal_group2',
  fields: {
    getTextInputValue: (fieldId) => {
      // Mock input values for group 2
      const mockValues = {
        'rune_vex': '2',
        'rune_ohm': '1',
        'rune_lo': '1',
        'rune_sur': '0'
      };
      return mockValues[fieldId] || '0';
    }
  },
  reply: async (options) => {
    console.log('✅ Mock Public Reply:', options);
    return Promise.resolve();
  }
};

async function testPublicHrModalSubmission() {
  console.log('\n🧪 Testing Public HR Modal Submission...\n');
  
  try {
    console.log('📝 Mock Public Input Data:');
    console.log('- VEX: 2');
    console.log('- OHM: 1');
    console.log('- LO: 1');
    console.log('- SUR: 0\n');
    
    console.log('🚀 Calling handleHrModalSubmit for public modal...\n');
    
    await handleHrModalSubmit(mockPublicInteraction);
    
    console.log('\n✅ Public test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Public test failed with error:');
    console.error(error);
    console.error('\n📍 Stack trace:');
    console.error(error.stack);
  }
}

// Run tests
async function runAllTests() {
  console.log('🎯 HR Modal Submission Test Suite\n');
  console.log('=' .repeat(50));
  
  await testHrModalSubmission();
  await testPublicHrModalSubmission();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 All tests completed!');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHrModalSubmission,
  testPublicHrModalSubmission,
  runAllTests
};
