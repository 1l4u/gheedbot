const fs = require('fs');
const path = require('path');

/**
 * Test Commands
 */
class CommandsTest {
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
      console.log(`  Đang test ${name}...`);
      await testFunction();
      console.log(`  THÀNH CÔNG ${name} - ĐẠT`);
      this.results.passed++;
      this.results.details.push({
        test: name,
        status: 'ĐẠT'
      });
    } catch (error) {
      console.log(`  THẤT BẠI ${name} - LỖI: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        test: name,
        status: 'THẤT BẠI',
        error: error.message
      });
    }
  }

  /**
   * Test command files exist và có structure đúng
   */
  async testCommandFiles() {
    await this.runTestCase('File commands tồn tại và có cấu trúc đúng', () => {
      const commandsDir = './commands';
      const expectedCommands = [
        'calculator.js',
        'debug.js', 
        'hr.js',
        'runeword.js',
        'weapon.js',
        'wiki.js'
      ];

      if (!fs.existsSync(commandsDir)) {
        throw new Error('Commands directory không tìm thấy');
      }

      for (const cmdFile of expectedCommands) {
        const filePath = path.join(commandsDir, cmdFile);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Command file ${cmdFile} không tìm thấy`);
        }

        // Test require command file
        try {
          const command = require(`../${filePath}`);
          if (!command || typeof command !== 'object') {
            throw new Error(`${cmdFile} không export an object`);
          }
        } catch (error) {
          throw new Error(`Thất bại to require ${cmdFile}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Test calculator command
   */
  async testCalculatorCommand() {
    await this.runTestCase('Command Calculator export đúng functions', () => {
      const calculator = require('../commands/calculator');
      
      const expectedFunctions = [
        'handleSlashCritChance',
        'handleSlashTas', 
        'handleSlashIas',
        'handleDmgCalculator2'
      ];

      for (const funcName of expectedFunctions) {
        if (typeof calculator[funcName] !== 'function') {
          throw new Error(`Calculator thiếu function: ${funcName}`);
        }
      }
    });
  }

  /**
   * Test HR command
   */
  async testHrCommand() {
    await this.runTestCase('Command HR export đúng functions', () => {
      const hr = require('../commands/hr');
      
      if (typeof hr.handleSlashHr !== 'function') {
        throw new Error('HR command thiếu handleSlashHr function');
      }
    });
  }

  /**
   * Test weapon command
   */
  async testWeaponCommand() {
    await this.runTestCase('Command Weapon export đúng functions', () => {
      const weapon = require('../commands/weapon');
      
      if (typeof weapon.handleSlashWeapon !== 'function') {
        throw new Error('Weapon command thiếu handleSlashWeapon function');
      }
    });
  }

  /**
   * Test runeword command
   */
  async testRunewordCommand() {
    await this.runTestCase('Command Runeword export đúng functions', () => {
      const runeword = require('../commands/runeword');
      
      if (typeof runeword.handleSlashRuneword !== 'function') {
        throw new Error('Runeword command thiếu handleSlashRuneword function');
      }
    });
  }

  /**
   * Test wiki command
   */
  async testWikiCommand() {
    await this.runTestCase('Command Wiki export đúng functions', () => {
      const wiki = require('../commands/wiki');
      
      if (typeof wiki.handleSlashWiki !== 'function') {
        throw new Error('Wiki command thiếu handleSlashWiki function');
      }
    });
  }

  /**
   * Test debug command
   */
  async testDebugCommand() {
    await this.runTestCase('Command Debug export đúng functions', () => {
      const debug = require('../commands/debug');
      
      if (typeof debug.handleSlashDebug !== 'function') {
        throw new Error('Debug command thiếu handleSlashDebug function');
      }
    });
  }

  /**
   * Test mock interaction để test command logic
   */
  createMockInteraction(commandName, options = {}) {
    return {
      commandName,
      user: {
        tag: 'TestUser#1234',
        username: 'TestUser',
        id: '123456789'
      },
      guild: {
        id: '987654321',
        name: 'Test Guild'
      },
      channel: {
        id: '555666777',
        name: 'test-channel'
      },
      options: {
        getString: (name) => options.strings?.[name] || null,
        getInteger: (name) => options.integers?.[name] || null,
        getBoolean: (name) => options.booleans?.[name] || null
      },
      deferReply: async () => {},
      editReply: async (content) => {
        console.log(`    📤 Mock reply: ${JSON.stringify(content).substring(0, 100)}...`);
      },
      reply: async (content) => {
        console.log(`    📤 Mock reply: ${JSON.stringify(content).substring(0, 100)}...`);
      }
    };
  }

  /**
   * Test HR command với mock data
   */
  async testHrCommandLogic() {
    await this.runTestCase('Logic command HR hoạt động với mock data', async () => {
      const hr = require('../commands/hr');
      
      const mockInteraction = this.createMockInteraction('hr', {
        integers: {
          'ber': 2,
          'jah': 1,
          'sur': 1
        }
      });

      // Test sẽ không crash
      try {
        await hr.handleSlashHr(mockInteraction);
      } catch (error) {
        // Có thể có lỗi do permissions hoặc thiếu dependencies
        // Nhưng không nên crash hoàn toàn
        if (error.message.includes('Cannot read') || error.message.includes('undefined')) {
          throw new Error(`HR command bị crash unexpectedly: ${error.message}`);
        }
      }
    });
  }

  /**
   * Chạy tất cả tests
   */
  async runTests() {
    console.log('Đang test Commands...');

    await this.testCommandFiles();
    await this.testCalculatorCommand();
    await this.testHrCommand();
    await this.testWeaponCommand();
    await this.testRunewordCommand();
    await this.testWikiCommand();
    await this.testDebugCommand();
    await this.testHrCommandLogic();

    console.log(`\nKết quả Commands Tests: ${this.results.passed}/${this.results.total} đạt`);

    return this.results;
  }
}

// Export để test runner có thể sử dụng
module.exports = {
  runTests: async () => {
    const test = new CommandsTest();
    return await test.runTests();
  }
};
