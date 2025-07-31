const { checkCommandPermissions, hasBypassPermission, isValidCommand } = require('../utils/permissions');
const fs = require('fs');

/**
 * Test Permissions System
 */
class PermissionsTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Helper để chạy một test case
   */
  async runTestCase(name, testFunction) {
    this.results.total++;
    try {
      console.log(`   ${name}...`);
      await testFunction();
      console.log(`   ${name} - ĐẠT`);
      this.results.passed++;
      this.results.details.push({
        test: name,
        status: 'ĐẠT'
      });
    } catch (error) {
      console.log(`   ${name} - THẤT BẠI: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        test: name,
        status: 'THẤT BẠI',
        error: error.message
      });
    }
  }

  /**
   * Tạo mock interaction
   */
  createMockInteraction(userId, channelId, guildId, memberRoles = []) {
    return {
      user: {
        id: userId,
        tag: 'TestUser#1234'
      },
      channel: {
        id: channelId,
        name: 'test-channel'
      },
      guild: {
        id: guildId,
        name: 'Test Guild'
      },
      member: {
        roles: {
          cache: new Map(memberRoles.map(roleId => [roleId, { id: roleId }]))
        }
      }
    };
  }

  /**
   * Test permissions functions exist
   */
  async testPermissionsFunctionsExist() {
    await this.runTestCase('Các function permissions tồn tại', () => {
      if (typeof checkCommandPermissions !== 'function') {
        throw new Error('checkCommandPermissions function không tìm thấy');
      }
      if (typeof hasBypassPermission !== 'function') {
        throw new Error('hasBypassPermission function không tìm thấy');
      }
      if (typeof isValidCommand !== 'function') {
        throw new Error('isValidCommand function không tìm thấy');
      }
    });
  }

  /**
   * Test config loading
   */
  async testConfigLoading() {
    await this.runTestCase('Tải config hoạt động', () => {
      if (fs.existsSync('./config/config.json')) {
        const config = require('../config/config.json');
        
        if (!config || typeof config !== 'object') {
          throw new Error('Config is not an object');
        }
        
        // Check expected fields
        const expectedFields = [
          'clear_member_id',
          'allowedChannels',
          'allowedRoles', 
          'allowedCommand'
        ];
        
        for (const field of expectedFields) {
          if (!(field in config)) {
            console.log(`      Config thiếu field: ${field}`);
          }
        }
      } else {
        console.log('      config.json không tìm thấy, bỏ qua config test');
      }
    });
  }

  /**
   * Test bypass permission
   */
  async testBypassPermission() {
    await this.runTestCase('Quyền bypass hoạt động', () => {
      // Test với user ID có trong clear_member_id (nếu có config)
      try {
        const config = require('../config/config.json');
        if (config.clear_member_id && config.clear_member_id.length > 0) {
          const bypassUserId = config.clear_member_id[0];
          const mockInteraction = this.createMockInteraction(bypassUserId, 'any', 'any');
          
          const hasPermission = hasBypassPermission(mockInteraction);
          if (!hasPermission) {
            throw new Error('Bypass permission nên trả về true for clear_member_id');
          }
        }
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          console.log('      config.json không tìm thấy, bỏ qua bypass test');
        } else {
          throw error;
        }
      }
      
      // Test với user ID không có trong danh sách
      const mockInteraction = this.createMockInteraction('999999999', 'any', 'any');
      const hasPermission = hasBypassPermission(mockInteraction);
      if (hasPermission) {
        throw new Error('Bypass permission nên trả về false for non-bypass user');
      }
    });
  }

  /**
   * Test valid command check
   */
  async testValidCommand() {
    await this.runTestCase('Kiểm tra command hợp lệ hoạt động', () => {
      try {
        const config = require('../config/config.json');
        if (config.allowedCommand && config.allowedCommand.length > 0) {
          const validCmd = config.allowedCommand[0];
          if (!isValidCommand(validCmd)) {
            throw new Error(`${validCmd} nên là valid command`);
          }
        }
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          console.log('      config.json không tìm thấy, bỏ qua valid command test');
        } else {
          throw error;
        }
      }
      
      // Test invalid command
      if (isValidCommand('invalidcommand123')) {
        throw new Error('invalidcommand123 không nên be valid');
      }
    });
  }

  /**
   * Test command permissions với mock data
   */
  async testCommandPermissions() {
    await this.runTestCase('Quyền command hoạt động với mock data', async () => {
      try {
        const config = require('../config/config.json');
        
        // Test với allowed channel và role
        if (config.allowedChannels && config.allowedChannels.length > 0 &&
            config.allowedRoles && config.allowedRoles.length > 0) {
          
          const allowedChannel = config.allowedChannels[0];
          const allowedRole = config.allowedRoles[0];
          
          const mockInteraction = this.createMockInteraction(
            '123456789',
            allowedChannel,
            '987654321',
            [allowedRole]
          );
          
          const result = await checkCommandPermissions(mockInteraction, 'rw');
          if (!result.allowed) {
            throw new Error('Should allow command in allowed channel with allowed role');
          }
        }
        
        // Test với không allowed channel
        const mockInteractionBadChannel = this.createMockInteraction(
          '123456789',
          'badchannel123',
          '987654321',
          []
        );
        
        const resultBadChannel = await checkCommandPermissions(mockInteractionBadChannel, 'rw');
        if (resultBadChannel.allowed) {
          throw new Error('Should not allow command in non-allowed channel');
        }
        
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          console.log('      config.json không tìm thấy, using default behavior');
          
          // Test default behavior
          const mockInteraction = this.createMockInteraction('123', 'channel123', 'guild123');
          const result = await checkCommandPermissions(mockInteraction, 'rw');
          
          // Should have some result
          if (typeof result !== 'object' || typeof result.allowed !== 'boolean') {
            throw new Error('checkCommandPermissions nên trả về object with allowed property');
          }
        } else {
          throw error;
        }
      }
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    await this.runTestCase('Xử lý lỗi hoạt động', async () => {
      // Test với null interaction
      try {
        await checkCommandPermissions(null, 'rw');
        throw new Error('Should throw error for null interaction');
      } catch (error) {
        if (error.message.includes('Should throw error')) {
          throw error;
        }
        // Expected error
      }
      
      // Test với invalid command
      const mockInteraction = this.createMockInteraction('123', 'channel123', 'guild123');
      const result = await checkCommandPermissions(mockInteraction, 'invalidcommand');
      
      if (result.allowed) {
        throw new Error('Should not allow invalid command');
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runTests() {
    console.log(' Đang test Permissions System...');
    
    await this.testPermissionsFunctionsExist();
    await this.testConfigLoading();
    await this.testBypassPermission();
    await this.testValidCommand();
    await this.testCommandPermissions();
    await this.testErrorHandling();
    
    console.log(`\n Permissions Tests: ${this.results.passed}/${this.results.total} passed`);
    
    return this.results;
  }
}

// Export để test runner có thể sử dụng
module.exports = {
  runTests: async () => {
    const test = new PermissionsTest();
    return await test.runTests();
  }
};
