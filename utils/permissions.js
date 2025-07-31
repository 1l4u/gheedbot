const config = require('../config/config.json');

/**
 * Kiểm tra quyền bỏ qua bằng ROLE ID
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} - True nếu có quyền bypass
 */
function hasBypassPermission(member) {
  if (!member) return false;
  return config.allowedRoles.some(id => member.roles.cache.has(id));
}

/**
 * Kiểm tra channel có được phép sử dụng commands không
 * @param {string} channelId - Discord channel ID
 * @returns {boolean} - True nếu channel được phép
 */
function isAllowedChannel(channelId) {
  return config.allowedChannels?.includes(channelId) || false;
}

/**
 * Kiểm tra user có role được phép sử dụng commands không
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean} - True nếu có role được phép
 */
function hasAllowedRole(member) {
  if (!member) return false;
  return config.allowedRoles.some(id => member.roles.cache.has(id));
}

/**
 * Kiểm tra permission tổng hợp cho commands
 * @param {Interaction} interaction - Discord interaction
 * @param {Object} options - Options cho permission check
 * @param {boolean} options.requireChannel - Có yêu cầu channel được phép không
 * @param {boolean} options.requireRole - Có yêu cầu role được phép không
 * @returns {Object} - {allowed: boolean, reason: string}
 */
function checkCommandPermissions(interaction, options = {}) {
  const { requireChannel = true, requireRole = false } = options;

  // Kiểm tra channel (nếu yêu cầu)
  if (requireChannel && !isAllowedChannel(interaction.channel.id)) {
    return {
      allowed: false,
      reason: 'Channel không được phép sử dụng lệnh này. Lệnh chỉ được sử dụng trong channel được cấu hình.'
    };
  }

  // Kiểm tra role (chỉ cho debug command)
  if (requireRole && !hasAllowedRole(interaction.member)) {
    return {
      allowed: false,
      reason: 'Bạn không có quyền sử dụng lệnh này.'
    };
  }

  return { allowed: true, reason: null };
}

/**
 * Reply lỗi permission cho interaction
 * @param {Interaction} interaction - Discord interaction
 * @param {string} reason - Lý do bị từ chối
 */
async function replyPermissionError(interaction, reason) {
  await interaction.reply({
    content: reason,
    flags: 1 << 6 // Ephemeral
  });
}

/**
 * Kiểm tra lệnh hợp lệ với regex
 * @param {string} content - Message content
 * @returns {boolean} - True nếu command hợp lệ
 */
function isValidCommand(content) {
  const pattern = new RegExp(
    `^${config.prefix}(${config.allowedCommand.join('|')})(\\s|$|\\?)`,
    'i'
  );
  return pattern.test(content);
}

module.exports = {
  hasBypassPermission,
  isAllowedChannel,
  hasAllowedRole,
  checkCommandPermissions,
  replyPermissionError,
  isValidCommand
};
