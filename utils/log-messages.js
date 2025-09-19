// Centralized log message templates for the whole project
// Usage example:
//   const { M } = require('./log-messages');
//   logger.info(M.server.expressReady({ port }));

function t(strings, ...keys) {
  // simple tagged template utility if ever needed
  return (...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = typeof key === 'number' ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
}

const M = {
  // Server/Express
  server: {
    expressReady: ({ port }) => `✅ Server Express đã sẵn sàng và đang lắng nghe trên port ${port}`,
    healthEndpoint: () => 'Health check endpoint có tại /ping',
    requestTimeout: () => 'Hết thời gian chờ request',
    notFound: () => 'Không tìm thấy',
    internalError: () => 'Lỗi máy chủ nội bộ',
    shuttingDown: () => 'SIGTERM: Đang tắt server một cách lịch sự...',
    serverClosed: () => 'Server Express đã đóng.',
    clientDestroyed: () => 'Client Discord đã ngắt kết nối.',
    healthCheckError: () => 'Health check error',
    detailedHealthCheckError: () => 'Detailed health check error',
    rootRouteError: () => 'Lỗi route gốc',
  },

  // Discord Bot lifecycle
  bot: {
    starting: () => 'Bắt đầu quá trình khởi tạo bot...',
    tokenMissing: () => 'DISCORD_TOKEN không được cung cấp! Bot không thể khởi động.',
    loginSuccess: ({ user }) => `✅ Bot đã đăng nhập với tên: ${user}`,
    ready: ({ user }) => `Bot đã sẵn sàng! Đăng nhập với tên: ${user}`,
    dataManagerInitDone: () => '✅ Data Manager đã khởi tạo xong.',
    slashRegistered: () => '✅ Slash commands đã được đăng ký!',
    bootComplete: () => '🚀 GheedBot đã hoàn tất khởi động và sẵn sàng hoạt động!',
    fatalStartupError: () => '💥 Lỗi nghiêm trọng trong quá trình khởi động bot',
    retryIn: ({ seconds }) => `Sẽ thử lại sau ${seconds} giây...`,
    disconnect: () => 'Bot đã ngắt kết nối! Sẽ tự động kết nối lại...',
    reconnecting: () => 'Bot đang kết nối lại...',
    clientError: () => 'Lỗi Discord client',
    clientWarn: () => 'Discord client warning',
  },

  // Slash commands and interactions
  interactions: {
    registering: () => 'Đang đăng ký slash commands...',
    registered: () => 'Đăng ký slash commands thành công!',
    registerError: () => 'Lỗi khi đăng ký slash commands',
    unknownModal: ({ id }) => `Unknown modal: ${id}`,
    buttonError: () => 'Lỗi xử lý button',
    unknownCommand: ({ name }) => `Lệnh không xác định: ${name}`,
    commandDone: ({ name }) => `Hoàn thành: ${name}`,
    autocompleteNoSource: ({ name }) => `Không có nguồn dữ liệu cho: ${name}`,
    autocompleteError: ({ name }) => `Lỗi xử lý autocomplete ${name}`,
    autocompleteRespondedSkip: () => 'Autocomplete interaction đã được phản hồi, bỏ qua...',
    autocompleteDuplicateSkip: ({ key }) => `Bỏ qua autocomplete trùng lặp cho: ${key}`,
    autocompleteInvalidSource: ({ name }) => `Data source không hợp lệ cho command: ${name}`,
  },

  // Moderation/messages
  moderation: {
    spamDeletedWarn: ({ reason }) => `Tin nhắn đã bị xoá trước đó (spam channel): ${reason}`,
    showDeletedWarn: ({ reason }) => `Tin nhắn đã bị xoá trước đó (show channel): ${reason}`,
    spamDeleteError: () => 'Lỗi xóa tin nhắn spam',
    showDeleteError: () => 'Lỗi xóa tin nhắn show',
  },

  // GitHub data
  github: {
    repoConfigured: ({ owner, repo, branch }) => `Đã cấu hình GitHub repo: ${owner}/${repo}@${branch}`,
    usingCache: ({ file }) => `Sử dụng cache cho ${file}`,
    loadingAttempt: ({ file, attempt, retries }) => `Đang tải ${file} từ GitHub (lần thử ${attempt}/${retries})...` ,
    jsonNotArray: ({ file, type }) => `Warning: ${file} is not an array, got ${type}`,
    loaded: ({ file, bytes, items }) => `Đã tải thành công ${file} (${bytes} bytes, ${items} items)`,
    loadError: ({ file, attempt, retries, msg }) => `Lỗi khi tải ${file} (lần thử ${attempt}/${retries}): ${msg}`,
    retryWait: ({ ms }) => `Đợi ${ms}ms trước khi thử lại...`,
    allAttemptsFailedUseCache: ({ file }) => `Tất cả attempts thất bại, sử dụng cache cũ cho ${file}`,
    httpRequest: ({ code, status, url }) => `GitHub request: ${code} ${status} for ${url}`,
    httpLoaded: ({ bytes }) => `GitHub data loaded: ${bytes} bytes`,
    requestError: ({ url, msg }) => `GitHub request error for ${url}: ${msg}`,
    requestTimeout: ({ url }) => `GitHub request timeout for ${url}`,
    cacheClearedFile: ({ file }) => `Đã xóa cache cho ${file}`,
    cacheClearedAll: () => 'Đã xóa toàn bộ cache',
    preloadSuccess: ({ file }) => `Preload thành công: ${file}`,
    preloadFailed: ({ file, msg }) => `Preload thất bại: ${file} - ${msg}`,
  },

  // Data Manager
  data: {
    githubEnabled: () => 'Đã bật chế độ GitHub data loading',
    githubDisabled: () => 'Đã tắt chế độ GitHub, sử dụng file local',
    usingLoadedData: ({ type }) => `Sử dụng data đã load cho ${type}`,
    loadingFromGitHub: ({ type }) => `Đang load ${type} từ GitHub...`,
    loadingFromLocal: ({ type }) => `Đang load ${type} từ file local...`,
    validateEmptyGithub: ({ type }) => `Warning: ${type} từ GitHub trống hoặc null`,
    validateEmptyLocal: ({ type }) => `Warning: ${type} từ local file trống hoặc null`,
    loadedFromGitHub: ({ type, items }) => `✅ Load ${type} từ GitHub thành công (${items} items)`,
    loadedFromLocal: ({ type, items }) => `✅ Load ${type} từ local file thành công (${items} items)`,
    loadErrorGitHub: ({ type, msg }) => `❌ Lỗi load ${type} từ GitHub: ${msg}`,
    loadErrorLocal: ({ type, msg }) => `❌ Lỗi load ${type} từ local file: ${msg}`,
    loadFatal: ({ type, gMsg, lMsg }) => `Không thể load ${type}. GitHub: ${gMsg}, Local: ${lMsg}`,
    reloadingAll: () => 'Đang reload tất cả dữ liệu...',
    reloadSuccess: () => 'Reload thành công tất cả dữ liệu',
    reloadError: () => 'Lỗi khi reload dữ liệu',
    reloadingType: ({ type }) => `Đang reload ${type}...`,
    initStarting: () => 'Đang khởi tạo Data Manager...',
    initDone: () => 'Khởi tạo Data Manager hoàn tất (có thể có lỗi).',
    initFatal: () => 'Lỗi nghiêm trọng khi khởi tạo Data Manager',
    githubConfigLoaded: ({ owner, repo, branch }) => `Đã load cấu hình GitHub: ${owner}/${repo}@${branch}`,
    githubConfigDisabled: () => 'GitHub config tồn tại nhưng bị tắt',
    githubConfigMissing: () => 'Không tìm thấy github-config.json, sử dụng file local',
    githubConfigError: () => 'Lỗi load GitHub config',
  },

  // Version check
  version: {
    localReadError: () => 'Lỗi đọc version local',
    githubReadError: () => 'Lỗi lấy version từ GitHub',
    unchanged: ({ from, to }) => `Version không thay đổi: ${from} -> ${to}.`,
    changedReload: ({ from, to }) => `Version thay đổi: ${from} -> ${to}. Đang reload dữ liệu...`,
  },

  // Commands specific
  commands: {
    critCalled: ({ user }) => `Lệnh CritChance được gọi bởi ${user}`,
    critSent: () => 'Đã gửi phản hồi CritChance',
    tasCalled: ({ user }) => `Lệnh TAS được gọi bởi ${user}`,
    tasSent: () => 'Đã gửi phản hồi TAS',
    iasCalled: ({ user }) => `Lệnh IAS được gọi bởi ${user}`,
    iasSent: () => 'Đã gửi phản hồi IAS',
    dmgCalled: ({ user }) => `Lệnh dmgcal được gọi bởi ${user}`,
    dmgSent: ({ summary }) => `Đã gửi phản hồi Damage Calculator.\n${summary}`,
    weaponCalled: ({ user }) => `Lệnh weapon được gọi bởi ${user}`,
    weaponSearching: ({ name }) => `Đang tìm kiếm weapon: ${name}`,
    weaponFound: ({ weapon, name }) => `Tìm thấy weapon "${weapon}" cho "${name}"`,
    wikiCalled: ({ user }) => `Lệnh wiki được gọi bởi ${user}`,
    runewordCalled: ({ user }) => `Lệnh runeword được gọi bởi ${user}`,
  },

  // Calculator/Jewel parsing
  calculator: {
    jewelInvalidDetails: ({ index, part, reasons }) => `Jewel ${index} (${part}): ${reasons}`,
    jewelAcceptedLog: ({ part, ed, maxDmg }) => `Jewel: ${part} (${ed}% ED, +${maxDmg} Max Dmg)`,
    jewelInvalidFormatMsg: ({ index, part }) => `Jewel ${index}: sai "${part}" (cần: ED hoặc ED-MaxDmg)`,
    jewelInvalidFormatLog: ({ part }) => `Jewel không hợp lệ: ${part} (expected: ED hoặc ED-MaxDmg)`,
    jewelsParsedSummaryLog: ({ count, totalED, totalMaxDmg }) => `Parsed jewels: ${count} valid jewels, Total ED: ${totalED}%, Total Max Dmg: +${totalMaxDmg}`,
    jewelsErrorsCountLog: ({ count }) => `Jewel errors: ${count} errors found`,
    jewelStringErrorMsg: ({ index, reason }) => `Jewel ${index}: ${reason}`,
    jewelStringErrorLog: ({ reason }) => `Jewel string error: ${reason}`,
  },

  // HR module
  hr: {
    setupDenied: ({ user, reason }) => `Từ chối quyền cài đặt Interface HR cho ${user}: ${reason}`,
    setupDone: ({ channel, user }) => `HR interface được setup trong ${channel} bởi ${user}`,
    saveRune: ({ rune, qty, user }) => `Lưu ${rune}: ${qty} cho user ${user}`,
    cacheSaved: ({ user, summary, modalId }) => `💾 [CACHE] ${user}: ${summary || 'rỗng'}, ${modalId}`,
    result: ({ user, total }) => `✅ ${user}: ${total} HR`,
  },
};

module.exports = { M, t };
