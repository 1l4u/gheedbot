/**
 * Test script để verify HR interface permissions integration
 * - Test với permissions.js functions
 * - Test multiple permission levels
 */

// Mock config
const mockConfig = {
  allowedRoles: ['123456789', '987654321'], // Mock role IDs
  allowedChannels: ['111111111', '222222222'] // Mock channel IDs
};

// Manual mock functions
const mockFunctions = {
  hasBypassPermission: null,
  hasAllowedRole: null,
  checkCommandPermissions: null
};

// Mock the permissions module
const originalPermissions = require('../utils/permissions');
const mockedPermissions = {
  ...originalPermissions,
  hasBypassPermission: (member) => mockFunctions.hasBypassPermission ? mockFunctions.hasBypassPermission(member) : false,
  hasAllowedRole: (member) => mockFunctions.hasAllowedRole ? mockFunctions.hasAllowedRole(member) : false,
  checkCommandPermissions: (interaction) => mockFunctions.checkCommandPermissions ? mockFunctions.checkCommandPermissions(interaction) : true
};

// Helper functions to set mock behavior
function setMockBehavior(functionName, behavior) {
  mockFunctions[functionName] = behavior;
}

function resetMocks() {
  Object.keys(mockFunctions).forEach(key => {
    mockFunctions[key] = null;
  });
}

// Mock Discord.js objects
const mockAdminInteraction = {
  user: {
    id: '123456789',
    tag: 'AdminUser#1234',
    username: 'AdminUser'
  },
  member: {
    permissions: {
      has: (permission) => permission === 'ManageChannels'
    },
    roles: {
      cache: {
        has: (roleId) => false // No special roles
      }
    }
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Admin reply:', options.content);
    return Promise.resolve();
  }
};

const mockBypassUserInteraction = {
  user: {
    id: '987654321',
    tag: 'BypassUser#5678',
    username: 'BypassUser'
  },
  member: {
    permissions: {
      has: (permission) => false // No admin permissions
    },
    roles: {
      cache: {
        has: (roleId) => roleId === '123456789' // Has bypass role
      }
    }
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Bypass user reply:', options.content);
    return Promise.resolve();
  }
};

const mockAllowedRoleUserInteraction = {
  user: {
    id: '555555555',
    tag: 'AllowedUser#9999',
    username: 'AllowedUser'
  },
  member: {
    permissions: {
      has: (permission) => false // No admin permissions
    },
    roles: {
      cache: {
        has: (roleId) => roleId === '987654321' // Has allowed role
      }
    }
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Allowed role user reply:', options.content);
    return Promise.resolve();
  }
};

const mockRegularUserInteraction = {
  user: {
    id: '111111111',
    tag: 'RegularUser#0000',
    username: 'RegularUser'
  },
  member: {
    permissions: {
      has: (permission) => false // No admin permissions
    },
    roles: {
      cache: {
        has: (roleId) => false // No special roles
      }
    }
  },
  customId: 'hr_public_reload',
  reply: async (options) => {
    console.log('✅ Regular user reply:', options.content);
    return Promise.resolve();
  }
};

// Import HR module
const { handleSlashSetupHr } = require('../commands/hr');

async function testAdminPermissions() {
  console.log('🧪 Testing Admin Permissions...\n');

  try {
    // Setup mocks
    setMockBehavior('hasBypassPermission', () => false);
    setMockBehavior('hasAllowedRole', () => false);
    
    console.log('👤 Mock Admin User: AdminUser#1234');
    console.log('🔑 Permissions: ManageChannels = true');
    console.log('🎭 Bypass Permission = false');
    console.log('👥 Allowed Role = false\n');
    
    // Test button visibility
    const mockSetupInteraction = {
      ...mockAdminInteraction,
      reply: async (options) => {
        const hasReloadButton = options.components.some(row => 
          row.components.some(button => button.data.custom_id === 'hr_public_reload')
        );
        console.log(`🔄 Reload button visible: ${hasReloadButton}`);
        return Promise.resolve();
      }
    };
    
    console.log('🚀 Testing button visibility...\n');
    await handleSlashSetupHr(mockSetupInteraction);
    
    console.log('\n✅ Admin permissions test completed!');
    
  } catch (error) {
    console.error('\n❌ Admin permissions test failed:', error.message);
  }
}

async function testBypassPermissions() {
  console.log('\n🧪 Testing Bypass Permissions...\n');

  try {
    // Setup mocks
    setMockBehavior('hasBypassPermission', () => true);
    setMockBehavior('hasAllowedRole', () => false);
    
    console.log('👤 Mock Bypass User: BypassUser#5678');
    console.log('🔑 Permissions: ManageChannels = false');
    console.log('🎭 Bypass Permission = true');
    console.log('👥 Allowed Role = false\n');
    
    // Test button visibility
    const mockSetupInteraction = {
      ...mockBypassUserInteraction,
      reply: async (options) => {
        const hasReloadButton = options.components.some(row => 
          row.components.some(button => button.data.custom_id === 'hr_public_reload')
        );
        console.log(`🔄 Reload button visible: ${hasReloadButton}`);
        return Promise.resolve();
      }
    };
    
    console.log('🚀 Testing button visibility...\n');
    await handleSlashSetupHr(mockSetupInteraction);
    
    console.log('\n✅ Bypass permissions test completed!');
    
  } catch (error) {
    console.error('\n❌ Bypass permissions test failed:', error.message);
  }
}

async function testAllowedRolePermissions() {
  console.log('\n🧪 Testing Allowed Role Permissions...\n');

  try {
    // Setup mocks
    setMockBehavior('hasBypassPermission', () => false);
    setMockBehavior('hasAllowedRole', () => true);
    
    console.log('👤 Mock Allowed Role User: AllowedUser#9999');
    console.log('🔑 Permissions: ManageChannels = false');
    console.log('🎭 Bypass Permission = false');
    console.log('👥 Allowed Role = true\n');
    
    // Test button visibility
    const mockSetupInteraction = {
      ...mockAllowedRoleUserInteraction,
      reply: async (options) => {
        const hasReloadButton = options.components.some(row => 
          row.components.some(button => button.data.custom_id === 'hr_public_reload')
        );
        console.log(`🔄 Reload button visible: ${hasReloadButton}`);
        return Promise.resolve();
      }
    };
    
    console.log('🚀 Testing button visibility...\n');
    await handleSlashSetupHr(mockSetupInteraction);
    
    console.log('\n✅ Allowed role permissions test completed!');
    
  } catch (error) {
    console.error('\n❌ Allowed role permissions test failed:', error.message);
  }
}

async function testRegularUserPermissions() {
  console.log('\n🧪 Testing Regular User Permissions...\n');

  try {
    // Setup mocks
    setMockBehavior('hasBypassPermission', () => false);
    setMockBehavior('hasAllowedRole', () => false);
    
    console.log('👤 Mock Regular User: RegularUser#0000');
    console.log('🔑 Permissions: ManageChannels = false');
    console.log('🎭 Bypass Permission = false');
    console.log('👥 Allowed Role = false\n');
    
    // Test button visibility
    const mockSetupInteraction = {
      ...mockRegularUserInteraction,
      reply: async (options) => {
        const hasReloadButton = options.components.some(row => 
          row.components.some(button => button.data.custom_id === 'hr_public_reload')
        );
        console.log(`🔄 Reload button visible: ${hasReloadButton}`);
        return Promise.resolve();
      }
    };
    
    console.log('🚀 Testing button visibility...\n');
    await handleSlashSetupHr(mockSetupInteraction);
    
    console.log('\n✅ Regular user permissions test completed!');
    
  } catch (error) {
    console.error('\n❌ Regular user permissions test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 HR Interface Permissions Test Suite\n');
  console.log('=' .repeat(60));
  
  await testAdminPermissions();
  await testBypassPermissions();
  await testAllowedRolePermissions();
  await testRegularUserPermissions();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 All permissions tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log('- ✅ Admin (ManageChannels) can see reload button');
  console.log('- ✅ Bypass permission users can see reload button');
  console.log('- ✅ Allowed role users can see reload button');
  console.log('- ❌ Regular users cannot see reload button');
  console.log('\n🔧 Permission hierarchy:');
  console.log('1. ManageChannels permission (Discord admin)');
  console.log('2. Bypass permission (config.allowedRoles)');
  console.log('3. Allowed role (config.allowedRoles)');
  console.log('4. Regular user (no special permissions)');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAdminPermissions,
  testBypassPermissions,
  testAllowedRolePermissions,
  testRegularUserPermissions,
  runAllTests,
  runTests: runAllTests // Alias for compatibility
};
