const fs = require('fs');
const path = require('path');
const axios = require('axios');
const versionFile = path.join(__dirname, '../version.json');

let lastVersion = null;

// Hàm lấy version từ local
function getLocalVersion() {
  if (!fs.existsSync(versionFile)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    return data.version;
  } catch (err) {
    console.error('Lỗi đọc version local:', err.message);
    return null;
  }
}

// Hàm lấy version từ GitHub
async function getGitHubVersion(githubConfig) {
  try {
    const { owner, repo, branch } = githubConfig;
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/version.json`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.data.version;
  } catch (err) {
    console.error('Lỗi lấy version từ GitHub:', err.message);
    return null;
  }
}

// Hàm cập nhật version local
function updateVersion(newVersion) {
  fs.writeFileSync(versionFile, JSON.stringify({ version: newVersion }, null, 2), 'utf8');
  lastVersion = newVersion;
}

// Hàm kiểm tra version và reload nếu thay đổi
async function checkVersionAndReload(dataManager) {
  let currentVersion = null;
  if (dataManager.useGitHub && dataManager.githubConfig) {
    currentVersion = await getGitHubVersion(dataManager.githubConfig);
  } else {
    currentVersion = getLocalVersion();
  }

  if (lastVersion === null) {
    lastVersion = currentVersion;
    console.log(`Version không thay đổi: ${lastVersion} -> ${currentVersion}.`);
  }

  if (currentVersion && currentVersion !== lastVersion) {
    console.log(`Version thay đổi: ${lastVersion} -> ${currentVersion}. Đang reload dữ liệu...`);
    lastVersion = currentVersion;
    await dataManager.reloadAll();
  }
}

module.exports = {
  checkVersionAndReload,
  updateVersion,
  getLocalVersion
};