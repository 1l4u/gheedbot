// Centralized log message templates for the whole project
// Usage example:
//   const { M } = require('./log-messages');
//   logger.info(M.server.expressReady({ port }));

const e = require("express");

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
    preloadAllDone: () => 'Preload tất cả file hoàn tất',
    preloadNoFiles: () => 'Không có file nào để preload',
    preloadAlreadyDone: () => 'Preload đã được thực hiện, bỏ qua',
    githubDisabled: () => 'GitHub data loading bị tắt, sử dụng file local',
    githubConfigMissing: () => 'Không tìm thấy github-config.json, sử dụng file local',
    githubConfigError: () => 'Lỗi load GitHub config, sử dụng file local',
    githubConfigDisabled: () => 'GitHub config tồn tại nhưng bị tắt, sử dụng file local',
    githubRateLimit: ({ reset }) => `GitHub rate limit exceeded, reset at ${new Date(reset * 1000).toISOString()}`,
    githubRateLimitShort: () => 'GitHub rate limit exceeded',
    githubAbuseLimit: () => 'GitHub abuse detection triggered',
    githubAbuseLimitWait: ({ ms }) => `Đợi ${ms}ms trước khi thử lại...`,
    githubLoadingData: () => `Đang tải dữ liệu GitHub...`,
    githubUsingLocal: ({ file }) => `Sử dụng file local cho ${file}`,
    githubDataLocalUsed: ({ file }) => `Dữ liệu local được sử dụng cho ${file}`,
    githubDataLoaded: ({ file }) => `Dữ liệu GitHub được sử dụng cho ${file}`,
    githubDataError: ({ file, msg }) => `Lỗi dữ liệu GitHub cho ${file}: ${msg}`,
    githubDataInvalid: ({ file, reason }) => `Dữ liệu GitHub không hợp lệ cho ${file}: ${reason}`,
    githubDataMissing: ({ file }) => `Không có dữ liệu GitHub cho ${file}`,
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
    dataTypeMissing: ({ type }) => `Loại dữ liệu không được hỗ trợ hoặc không tồn tại: ${type}`,
    dataTypeNoPath: ({ type }) => `Không có đường dẫn cấu hình cho loại dữ liệu: ${type}`,
    dataTypeNoLoader: ({ type }) => `Không có hàm loader cho loại dữ liệu: ${type}`,
    dataTypeInvalidLoader: ({ type }) => `Hàm loader không hợp lệ cho loại dữ liệu: ${type}`,
    dataTypeNoLocal: ({ type }) => `Không có đường dẫn local file cho loại dữ liệu: ${type}`,
    dataTypeNoGitHub: ({ type }) => `Không có đường dẫn GitHub cho loại dữ liệu: ${type}`,
    cacheInfo: ({ count }) => `GitHub cache hiện có: ${count} files`,
    cacheInfoEmpty: () => 'Không có file nào trong GitHub cache',
    cacheCleared: () => 'Đã xóa toàn bộ GitHub cache',
    cacheClearedFile: ({ file }) => `Đã xóa cache cho file: ${file}`,
    dataLoadError: ({ type, msg }) => `Lỗi load dữ liệu cho ${type}: ${msg}`,
    dataLoadEnd: ({ type, success }) => `Hoàn tất load dữ liệu cho ${type}, Thành công: ${success}`,
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
    runewordSearching: ({ name }) => `Đang tìm kiếm runeword: ${name}`,
    runewordFound: ({ runeword, name }) => `Tìm thấy runeword "${runeword}" cho "${name}"`,
    helpCalled: ({ user }) => `Lệnh help được gọi bởi ${user}`,
    helpSent: () => 'Đã gửi phản hồi help',
    pingCalled: ({ user }) => `Lệnh ping được gọi bởi ${user}`,
    pingSent: () => 'Đã gửi phản hồi pong',
    unknownSubcommand: ({ name }) => `Subcommand không xác định: ${name}`,
    error: ({ name, msg }) => `Lỗi xử lý lệnh ${name}: ${msg}`,
    errorNoReply: ({ name, msg }) => `Lỗi xử lý lệnh ${name} (không thể trả lời): ${msg}`,
    weaponNoData: ({ name }) => `Không có dữ liệu weapon để tìm kiếm: ${name}`,
    runewordNoData: ({ name }) => `Không có dữ liệu runeword để tìm kiếm: ${name}`,
    wikiNodata: ({ name }) => `Không có dữ liệu wiki để tìm kiếm: ${name}`,

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
    critError: ({ reason }) => `Lỗi tính Crit Chance: ${reason}`,
    tasError: ({ reason }) => `Lỗi tính Total Attack Speed: ${reason}`,
    iasError: ({ reason }) => `Lỗi tính Increased Attack Speed: ${reason}`,
    dmgError: ({ reason }) => `Lỗi tính Damage: ${reason}`,
    dmgSummaryLog: ({ totalED, totalMaxDmg, baseMin, baseMax, finalMin, finalMax }) =>
      `Damage calc result - Total ED: ${totalED}%, Total Max Dmg: +${totalMaxDmg}, Base Dmg: ${baseMin}-${baseMax}, Final Dmg: ${finalMin}-${finalMax}`,
    dmgErrorsCountLog: ({ count }) => `Damage calculation errors: ${count} errors found`,
    dmgJewelsEmptyLog: () => 'No valid jewels provided for damage calculation',
    dmgJewelsEmptyMsg: () => 'Vui lòng cung cấp ít nhất một jewel hợp lệ cho phép tính damage',

  },

  // HR module
  hr: {
    setupDenied: ({ user, reason }) => `Từ chối quyền cài đặt Interface HR cho ${user}: ${reason}`,
    setupDone: ({ channel, user }) => `HR interface được setup trong ${channel} bởi ${user}`,
    saveRune: ({ rune, qty, user }) => `Lưu ${rune}: ${qty} cho user ${user}`,
    cacheSaved: ({ user, summary, modalId }) => `💾 [CACHE] ${user}: ${summary || 'rỗng'}, ${modalId}`,
    result: ({ user, total }) => `✅ ${user}: ${total} HR`,
    error: ({ user, msg }) => `❌ Lỗi xử lý HR cho ${user}: ${msg}`,
    noData: ({ user }) => `⚠️ Không có dữ liệu HR để xử lý cho ${user}`,
    noSetup: ({ user }) => `⚠️ Chưa setup HR interface cho ${user}`,
    buttonError: ({ user, msg }) => `❌ Lỗi xử lý button HR cho ${user}: ${msg}`,
    msgError: ({ user, msg }) => `❌ Lỗi xử lý message HR cho ${user}: ${msg}`,
    modalError: ({ user, msg }) => `❌ Lỗi xử lý modal HR cho ${user}: ${msg}`,
    errorDetails: ({ error }) => `Error details: ${error.message}`,
    stackTrace: ({ error }) => `Stack trace: ${error.stack}`
  },
  
  debug: {
    interactionReceived: ({ id, type }) => `Interaction received: ID=${id}, Type=${type}`,
    interactionHandled: ({ id, type }) => `Interaction handled: ID=${id}, Type=${type}`,
    interactionError: ({ id, type, msg }) => `Interaction error: ID=${id}, Type=${type}, Msg=${msg}`,
    commandStart: ({ name, user }) => `Starting command: ${name} by ${user}`,
    commandEnd: ({ name, user }) => `Finished command: ${name} by ${user}`,
    commandError: ({ name, user, msg }) => `Command error: ${name} by ${user}, Msg=${msg}`,
    permissionDenied: ({ user, reason }) => `Permission denied for ${user}: ${reason}`,
    permissionGranted: ({ user }) => `Permission granted for ${user}`,
    dataLoadStart: ({ type }) => `Starting data load for: ${type}`,
    dataLoadEnd: ({ type, success }) => `Finished data load for: ${type}, Success: ${success}`,
    dataLoadError: ({ type, msg }) => `Load data lỗi: ${type}, Msg=${msg}`,
    interactionNameMissing: () => 'Interaction name không được cung cấp',
    interactionDebugSuccess: () => 'Debug response sent successfully',
  },

  runeword: {
    noData: ({ name }) => `Không có dữ liệu runeword để tìm kiếm: ${name}`,
    invalidData: () => 'Dữ liệu runeword không hợp lệ',
    runewordDetails: ({ name }) => `✅ Runeword: ${name}`,
  },

  wiki: {
    noData: ({ name }) => `Không có dữ liệu wiki để tìm kiếm: ${name}`,
    invalidData: () => 'Dữ liệu wiki không hợp lệ',
    wikiDetails: ({ name }) => `✅ Wiki: ${name}`,
    error: ({ msg }) => `Lỗi xử lý wiki: ${msg}`,
  },
  weapon: {
    noData: ({ name }) => `Không có dữ liệu weapon để tìm kiếm: ${name}`,
    invalidData: () => 'Dữ liệu weapon không hợp lệ',
    weaponDetails: ({ name }) => `✅ Weapon: ${name}`,
    error: ({ msg }) => `Lỗi xử lý weapon: ${msg}`,
  }
};

module.exports = { M, t };
