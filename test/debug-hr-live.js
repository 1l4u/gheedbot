/**
 * Debug script để test HR modal submission với Discord API thật
 */

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

// Import HR functions
const { handleHrModalSubmit, handleHrButton } = require('../commands/hr');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('🤖 Debug bot ready!');
  console.log(`Logged in as ${client.user.tag}`);
  console.log('🔍 Listening for HR modal submissions...');
});

// Debug modal submissions
client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  
  // Chỉ debug HR modals
  if (interaction.customId.startsWith('hr_modal_') || interaction.customId.startsWith('hr_public_modal_')) {
    console.log('\n🔍 DEBUG: HR Modal Submission Detected');
    console.log('📋 Details:');
    console.log(`- User: ${interaction.user.tag} (${interaction.user.id})`);
    console.log(`- Modal ID: ${interaction.customId}`);
    console.log(`- Guild: ${interaction.guild?.name || 'DM'}`);
    console.log(`- Channel: ${interaction.channel?.name || 'Unknown'}`);
    
    // Log input values
    console.log('📝 Input Values:');
    try {
      const runeGroups = {
        hr_modal_group1: ['UM', 'MAL', 'IST', 'GUL'],
        hr_modal_group2: ['VEX', 'OHM', 'LO', 'SUR'],
        hr_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD'],
        hr_public_modal_group1: ['UM', 'MAL', 'IST', 'GUL'],
        hr_public_modal_group2: ['VEX', 'OHM', 'LO', 'SUR'],
        hr_public_modal_group3: ['BER', 'JAH', 'CHAM', 'ZOD']
      };
      
      const runes = runeGroups[interaction.customId];
      if (runes) {
        runes.forEach(runeName => {
          const fieldId = `rune_${runeName.toLowerCase()}`;
          try {
            const value = interaction.fields.getTextInputValue(fieldId) || '0';
            console.log(`  - ${runeName}: ${value}`);
          } catch (fieldError) {
            console.log(`  - ${runeName}: ERROR - ${fieldError.message}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error reading input values:', error.message);
    }
    
    console.log('\n🚀 Calling handleHrModalSubmit...');
    
    try {
      await handleHrModalSubmit(interaction);
      console.log('✅ handleHrModalSubmit completed successfully');
    } catch (error) {
      console.error('❌ handleHrModalSubmit failed:');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    console.log('─'.repeat(60));
  }
});

// Debug button clicks
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  // Chỉ debug HR buttons
  if (interaction.customId.startsWith('hr_')) {
    console.log('\n🔍 DEBUG: HR Button Click Detected');
    console.log('📋 Details:');
    console.log(`- User: ${interaction.user.tag} (${interaction.user.id})`);
    console.log(`- Button ID: ${interaction.customId}`);
    console.log(`- Guild: ${interaction.guild?.name || 'DM'}`);
    console.log(`- Channel: ${interaction.channel?.name || 'Unknown'}`);
    
    console.log('\n🚀 Calling handleHrButton...');
    
    try {
      await handleHrButton(interaction);
      console.log('✅ handleHrButton completed successfully');
    } catch (error) {
      console.error('❌ handleHrButton failed:');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    console.log('─'.repeat(60));
  }
});

// Error handling
client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug bot...');
  client.destroy();
  process.exit(0);
});

console.log('🔧 HR Debug Bot Starting...');
console.log('📝 This bot will log detailed information about HR modal submissions');
console.log('🎯 Use /hr or /setuphr commands to test');
console.log('⏹️  Press Ctrl+C to stop');
