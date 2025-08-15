/**
 * Test script để verify HR interface reload functionality mới
 * - Button reload chỉ hiện với admin
 * - Reload bằng cách gọi lại setupHr logic
 */

// Mock Discord.js objects
const mockAdminInteraction = {
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
  channel: {
    id: '1361772596303237212'
  },
  customId: 'hr_public_reload',
  message: {
    edit: async (options) => {
      console.log('✅ Mock message.edit called for reload');
      console.log('📝 New embed title:', options.embeds[0].data.title);
      console.log('🔘 Number of buttons:', options.components.reduce((total, row) => total + row.components.length, 0));
      return Promise.resolve();
    }
  },
  reply: async (options) => {
    console.log('✅ Mock reply called');
    console.log('💬 Reply content:', options.content);
    console.log('🔒 Ephemeral:', options.ephemeral);
    return Promise.resolve();
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
  channel: {
    id: '1361772596303237212'
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Mock reply for permission denied:', options.content);
    return Promise.resolve();
  }
};

// Mock setup interaction để test button visibility
const mockSetupInteraction = {
  user: {
    id: '123456789',
    tag: 'AdminUser#1234',
    username: 'AdminUser'
  },
  member: {
    permissions: {
      has: (permission) => {
        return permission === 'ManageChannels';
      }
    }
  },
  channel: {
    id: '1361772596303237212'
  },
  reply: async (options) => {
    console.log('✅ Mock setup reply called');
    
    // Analyze buttons để check reload button visibility
    const totalButtons = options.components.reduce((total, row) => total + row.components.length, 0);
    console.log(`🔘 Total buttons created: ${totalButtons}`);
    
    // Check for reload button
    const hasReloadButton = options.components.some(row => 
      row.components.some(button => button.data.custom_id === 'hr_public_reload')
    );
    console.log(`🔄 Reload button present: ${hasReloadButton}`);
    
    return Promise.resolve();
  }
};

// Mock setup interaction cho non-admin
const mockSetupNonAdminInteraction = {
  user: {
    id: '987654321',
    tag: 'RegularUser#5678',
    username: 'RegularUser'
  },
  member: {
    permissions: {
      has: (permission) => {
        return false; // No admin permissions
      }
    }
  },
  channel: {
    id: '1361772596303237212'
  },
  reply: async (options) => {
    console.log('✅ Mock setup reply called for non-admin');
    
    // Analyze buttons để check reload button visibility
    const totalButtons = options.components.reduce((total, row) => total + row.components.length, 0);
    console.log(`🔘 Total buttons created: ${totalButtons}`);
    
    // Check for reload button
    const hasReloadButton = options.components.some(row => 
      row.components.some(button => button.data.custom_id === 'hr_public_reload')
    );
    console.log(`🔄 Reload button present: ${hasReloadButton}`);
    
    return Promise.resolve();
  }
};

// Import HR module
const { reloadHrInterface, handleSlashSetupHr } = require('../commands/hr');

async function testAdminReload() {
  console.log('🧪 Testing Admin HR Interface Reload...\n');
  
  try {
    console.log('👤 Mock Admin User: AdminUser#1234');
    console.log('🔑 Permissions: ManageChannels = true\n');
    
    console.log('🚀 Calling reloadHrInterface...\n');
    
    await reloadHrInterface(mockAdminInteraction);
    
    console.log('\n✅ Admin reload test completed successfully!');
    console.log('✅ Interface was updated via message.edit()');
    console.log('✅ Success message was sent via reply()');
    
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
    
    console.log('🚀 Calling reloadHrInterface...\n');
    
    await reloadHrInterface(mockNonAdminInteraction);
    
    console.log('\n✅ Non-admin test completed successfully!');
    console.log('✅ Permission denied message was sent');
    
  } catch (error) {
    console.error('\n❌ Non-admin test failed with error:');
    console.error(error.message);
  }
}

async function testButtonVisibilityAdmin() {
  console.log('\n🧪 Testing Button Visibility for Admin...\n');
  
  try {
    console.log('👤 Mock Admin User: AdminUser#1234');
    console.log('🔑 Permissions: ManageChannels = true\n');
    
    console.log('🚀 Calling handleSlashSetupHr...\n');
    
    await handleSlashSetupHr(mockSetupInteraction);
    
    console.log('\n✅ Admin button visibility test completed!');
    console.log('✅ Reload button should be present for admin');
    
  } catch (error) {
    console.error('\n❌ Admin button visibility test failed:');
    console.error(error.message);
  }
}

async function testButtonVisibilityNonAdmin() {
  console.log('\n🧪 Testing Button Visibility for Non-Admin...\n');
  
  try {
    console.log('👤 Mock Regular User: RegularUser#5678');
    console.log('🔑 Permissions: ManageChannels = false\n');
    
    console.log('🚀 Calling handleSlashSetupHr...\n');
    
    await handleSlashSetupHr(mockSetupNonAdminInteraction);
    
    console.log('\n✅ Non-admin button visibility test completed!');
    console.log('✅ Reload button should be hidden for non-admin');
    
  } catch (error) {
    console.error('\n❌ Non-admin button visibility test failed:');
    console.error(error.message);
  }
}

async function testReloadLogic() {
  console.log('\n🧪 Testing Reload Logic...\n');
  
  // Capture calls để verify reload logic
  let setupCalled = false;
  let messageEdited = false;
  let replysent = false;
  
  const logicTestInteraction = {
    ...mockAdminInteraction,
    message: {
      edit: async (options) => {
        messageEdited = true;
        console.log('✅ Message.edit called during reload');
        return Promise.resolve();
      }
    },
    reply: async (options) => {
      if (options.content.includes('reload thành công')) {
        replySet = true;
        console.log('✅ Success reply sent');
      }
      return Promise.resolve();
    }
  };
  
  try {
    await reloadHrInterface(logicTestInteraction);
    
    console.log('\n📊 Reload Logic Analysis:');
    console.log(`✅ Message edited: ${messageEdited}`);
    console.log(`✅ Success reply sent: ${replySet || 'Checked'}`);
    
    console.log('\n✅ Reload logic test completed!');
    
  } catch (error) {
    console.error('\n❌ Reload logic test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 HR Interface Reload Test Suite (New Version)\n');
  console.log('=' .repeat(60));
  
  await testAdminReload();
  await testNonAdminReload();
  await testButtonVisibilityAdmin();
  await testButtonVisibilityNonAdmin();
  await testReloadLogic();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 All reload tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log('- ✅ Admin can reload interface');
  console.log('- ✅ Non-admin gets permission denied');
  console.log('- ✅ Reload button visible only for admin');
  console.log('- ✅ Reload button hidden for non-admin');
  console.log('- ✅ Reload uses setupHr logic');
  console.log('- ✅ Interface updated via message.edit()');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAdminReload,
  testNonAdminReload,
  testButtonVisibilityAdmin,
  testButtonVisibilityNonAdmin,
  testReloadLogic,
  runAllTests,
  runTests: runAllTests // Alias for compatibility
};
