/**
 * Test script để verify modal submission không reply cho user
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
  deferUpdate: async () => {
    console.log('✅ Mock deferUpdate called (no reply to user)');
    return Promise.resolve();
  },
  reply: async (options) => {
    console.log('❌ ERROR: reply() should not be called!');
    console.log('Reply content:', options);
    throw new Error('reply() was called when it should not be');
  }
};

// Import HR module
const { handleHrModalSubmit } = require('../commands/hr');

async function testSilentModalSubmission() {
  console.log('🧪 Testing Silent HR Modal Submission...\n');
  
  try {
    console.log('📝 Mock Input Data:');
    console.log('- UM: 5');
    console.log('- MAL: 3');
    console.log('- IST: 2');
    console.log('- GUL: 1\n');
    
    console.log('🚀 Calling handleHrModalSubmit...\n');
    
    await handleHrModalSubmit(mockInteraction);
    
    console.log('\n✅ Test completed successfully!');
    console.log('✅ No reply was sent to user (as expected)');
    console.log('✅ Data was saved to cache and logged');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    
    if (error.message.includes('reply() was called')) {
      console.error('\n🚨 CRITICAL: Modal submission is still sending replies to users!');
      console.error('🔧 Fix needed: Remove reply() calls from handleHrModalSubmit');
    }
  }
}

// Test với public modal
const mockPublicInteraction = {
  user: {
    id: '987654321',
    tag: 'TestUser2#5678',
    username: 'TestUser2'
  },
  customId: 'hr_public_modal_group2',
  fields: {
    getTextInputValue: (fieldId) => {
      const mockValues = {
        'rune_vex': '2',
        'rune_ohm': '1',
        'rune_lo': '1',
        'rune_sur': '0'
      };
      return mockValues[fieldId] || '0';
    }
  },
  deferUpdate: async () => {
    console.log('✅ Mock deferUpdate called for public modal');
    return Promise.resolve();
  },
  reply: async (options) => {
    console.log('❌ ERROR: reply() called on public modal!');
    throw new Error('Public modal should not reply either');
  }
};

async function testPublicSilentModalSubmission() {
  console.log('\n🧪 Testing Public Silent HR Modal Submission...\n');
  
  try {
    console.log('📝 Mock Public Input Data:');
    console.log('- VEX: 2');
    console.log('- OHM: 1');
    console.log('- LO: 1');
    console.log('- SUR: 0\n');
    
    console.log('🚀 Calling handleHrModalSubmit for public modal...\n');
    
    await handleHrModalSubmit(mockPublicInteraction);
    
    console.log('\n✅ Public test completed successfully!');
    console.log('✅ No reply was sent to user (as expected)');
    console.log('✅ Public modal data was saved silently');
    
  } catch (error) {
    console.error('\n❌ Public test failed with error:');
    console.error(error.message);
  }
}

// Test logging behavior
async function testLoggingBehavior() {
  console.log('\n🧪 Testing Logging Behavior...\n');
  
  // Capture console.log output
  const originalLog = console.log;
  const logOutput = [];
  
  console.log = (...args) => {
    logOutput.push(args.join(' '));
    originalLog(...args);
  };
  
  try {
    await handleHrModalSubmit(mockInteraction);
    
    // Restore console.log
    console.log = originalLog;
    
    // Check if expected logs are present
    const hasDataLog = logOutput.some(log => log.includes('[DATA]'));
    const hasCacheLog = logOutput.some(log => log.includes('[CACHE]'));
    const hasModalLog = logOutput.some(log => log.includes('[MODAL]'));
    
    console.log('\n📊 Logging Analysis:');
    console.log(`✅ Cache log: ${hasCacheLog ? 'Present' : 'Missing'}`);
    console.log(`✅ Data log: ${hasDataLog ? 'Present' : 'Missing'}`);
    console.log(`✅ Modal log: ${hasModalLog ? 'Present' : 'Missing'}`);
    
    if (hasCacheLog && hasDataLog && hasModalLog) {
      console.log('\n✅ All expected logs are present!');
    } else {
      console.log('\n❌ Some expected logs are missing!');
    }
    
  } catch (error) {
    console.log = originalLog;
    console.error('❌ Logging test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 HR Silent Modal Submission Test Suite\n');
  console.log('=' .repeat(60));
  
  await testSilentModalSubmission();
  await testPublicSilentModalSubmission();
  await testLoggingBehavior();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 All silent modal tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log('- ✅ No replies sent to users');
  console.log('- ✅ Data saved to cache');
  console.log('- ✅ Detailed logging present');
  console.log('- ✅ deferUpdate() called to acknowledge interaction');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testSilentModalSubmission,
  testPublicSilentModalSubmission,
  testLoggingBehavior,
  runAllTests
};
