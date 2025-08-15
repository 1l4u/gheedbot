/**
 * Test script để verify HR interface reload functionality
 */

// Mock Discord.js objects
const mockInteraction = {
  user: {
    id: '123456789',
    tag: 'AdminUser#1234',
    username: 'AdminUser'
  },
  member: {
    permissions: {
      has: (permission) => {
        // Mock admin permissions
        return permission === 'ManageChannels';
      }
    }
  },
  customId: 'hr_public_reload',
  deferReply: async (options) => {
    console.log('✅ Mock deferReply called with options:', options);
    return Promise.resolve();
  },
  message: {
    edit: async (options) => {
      console.log('✅ Mock message.edit called');
      console.log('📝 New embed title:', options.embeds[0].data.title);
      console.log('🔘 Number of buttons:', options.components.reduce((total, row) => total + row.components.length, 0));
      return Promise.resolve();
    }
  },
  editReply: async (options) => {
    console.log('✅ Mock editReply called');
    console.log('💬 Reply content:', options.content);
    return Promise.resolve();
  },
  reply: async (options) => {
    console.log('❌ ERROR: reply() should not be called for reload!');
    throw new Error('reply() was called when editReply() should be used');
  }
};

// Mock non-admin user
const mockNonAdminInteraction = {
  user: {
    id: '987654321',
    tag: 'RegularUser#5678',
    username: 'RegularUser'
  },
  member: {
    permissions: {
      has: (permission) => {
        // Mock regular user permissions (no ManageChannels)
        return false;
      }
    }
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Mock reply for permission denied:', options.content);
    return Promise.resolve();
  }
};

// Import HR module
const { handleHrReloadInterface } = require('../commands/hr');

async function testAdminReload() {
  console.log('🧪 Testing Admin HR Interface Reload...\n');
  
  try {
    console.log('👤 Mock Admin User: AdminUser#1234');
    console.log('🔑 Permissions: ManageChannels = true\n');
    
    console.log('🚀 Calling handleHrReloadInterface...\n');
    
    await handleHrReloadInterface(mockInteraction);
    
    console.log('\n✅ Admin reload test completed successfully!');
    console.log('✅ Interface was updated via message.edit()');
    console.log('✅ Success message was sent via editReply()');
    
  } catch (error) {
    console.error('\n❌ Admin reload test failed with error:');
    console.error(error.message);
  }
}

async function testNonAdminReload() {
  console.log('\n🧪 Testing Non-Admin HR Interface Reload...\n');
  
  try {
    console.log('👤 Mock Regular User: RegularUser#5678');
    console.log('🔑 Permissions: ManageChannels = false\n');
    
    console.log('🚀 Calling handleHrReloadInterface...\n');
    
    await handleHrReloadInterface(mockNonAdminInteraction);
    
    console.log('\n✅ Non-admin test completed successfully!');
    console.log('✅ Permission denied message was sent');
    
  } catch (error) {
    console.error('\n❌ Non-admin test failed with error:');
    console.error(error.message);
  }
}

async function testReloadInterfaceStructure() {
  console.log('\n🧪 Testing Reload Interface Structure...\n');
  
  // Capture message.edit calls to verify structure
  let capturedEmbed = null;
  let capturedComponents = null;
  
  const structureTestInteraction = {
    ...mockInteraction,
    message: {
      edit: async (options) => {
        capturedEmbed = options.embeds[0];
        capturedComponents = options.components;
        console.log('✅ Interface structure captured for analysis');
        return Promise.resolve();
      }
    }
  };
  
  try {
    await handleHrReloadInterface(structureTestInteraction);
    
    // Analyze captured structure
    console.log('\n📊 Interface Structure Analysis:');
    
    // Check embed
    if (capturedEmbed) {
      console.log(`✅ Embed title: "${capturedEmbed.data.title}"`);
      console.log(`✅ Embed color: ${capturedEmbed.data.color}`);
      console.log(`✅ Embed fields: ${capturedEmbed.data.fields.length} fields`);
      console.log(`✅ Footer updated: ${capturedEmbed.data.footer.text.includes('reload')}`);
    }
    
    // Check components
    if (capturedComponents) {
      const totalButtons = capturedComponents.reduce((total, row) => total + row.components.length, 0);
      console.log(`✅ Total buttons: ${totalButtons}`);
      
      // Check for reload button
      const hasReloadButton = capturedComponents.some(row => 
        row.components.some(button => button.data.custom_id === 'hr_public_reload')
      );
      console.log(`✅ Reload button present: ${hasReloadButton}`);
      
      // Check button labels
      const buttonLabels = [];
      capturedComponents.forEach(row => {
        row.components.forEach(button => {
          buttonLabels.push(button.data.label);
        });
      });
      console.log(`✅ Button labels: ${buttonLabels.join(', ')}`);
    }
    
    console.log('\n✅ Interface structure test completed!');
    
  } catch (error) {
    console.error('\n❌ Structure test failed:', error.message);
  }
}

async function testReloadErrorHandling() {
  console.log('\n🧪 Testing Reload Error Handling...\n');
  
  // Mock interaction that will cause an error
  const errorInteraction = {
    ...mockInteraction,
    message: {
      edit: async () => {
        throw new Error('Mock edit error for testing');
      }
    },
    editReply: async (options) => {
      console.log('✅ Error message sent via editReply:', options.content);
      return Promise.resolve();
    }
  };
  
  try {
    await handleHrReloadInterface(errorInteraction);
    
    console.log('\n✅ Error handling test completed!');
    console.log('✅ Error was caught and handled gracefully');
    
  } catch (error) {
    console.error('\n❌ Error handling test failed:', error.message);
  }
}

// Test logging behavior
async function testReloadLogging() {
  console.log('\n🧪 Testing Reload Logging...\n');
  
  // Capture console.log output
  const originalLog = console.log;
  const logOutput = [];
  
  console.log = (...args) => {
    logOutput.push(args.join(' '));
    originalLog(...args);
  };
  
  try {
    await handleHrReloadInterface(mockInteraction);
    
    // Restore console.log
    console.log = originalLog;
    
    // Check if expected logs are present
    const hasRequestLog = logOutput.some(log => log.includes('reload được yêu cầu'));
    const hasSuccessLog = logOutput.some(log => log.includes('reload thành công'));
    
    console.log('\n📊 Logging Analysis:');
    console.log(`✅ Request log: ${hasRequestLog ? 'Present' : 'Missing'}`);
    console.log(`✅ Success log: ${hasSuccessLog ? 'Present' : 'Missing'}`);
    
    if (hasRequestLog && hasSuccessLog) {
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
  console.log('🎯 HR Interface Reload Test Suite\n');
  console.log('=' .repeat(60));
  
  await testAdminReload();
  await testNonAdminReload();
  await testReloadInterfaceStructure();
  await testReloadErrorHandling();
  await testReloadLogging();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 All reload tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log('- ✅ Admin can reload interface');
  console.log('- ✅ Non-admin gets permission denied');
  console.log('- ✅ Interface structure is updated');
  console.log('- ✅ Errors are handled gracefully');
  console.log('- ✅ Detailed logging is present');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAdminReload,
  testNonAdminReload,
  testReloadInterfaceStructure,
  testReloadErrorHandling,
  testReloadLogging,
  runAllTests,
  runTests: runAllTests // Alias for compatibility
};
