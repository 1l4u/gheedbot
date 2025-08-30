const fs = require('fs');
const path = require('path');
const versionFile = path.join(__dirname, '../version.md');

let lastVersion = null;

function getCurrentVersion() {
  if (!fs.existsSync(versionFile)) return null;
  const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  return data.version;
}

function updateVersion(newVersion) {
  fs.writeFileSync(versionFile, JSON.stringify({ version: newVersion }, null, 2), 'utf8');
  lastVersion = newVersion;
}

async function checkVersionAndReload(dataManager) {
  const currentVersion = getCurrentVersion();
  if (lastVersion === null) lastVersion = currentVersion;

  if (currentVersion !== lastVersion) {
    console.log(`Version thay đổi: ${lastVersion} -> ${currentVersion}. Đang reload dữ liệu...`);
    lastVersion = currentVersion;
    await dataManager.reloadAll();
  }
}

module.exports = {
  checkVersionAndReload,
  updateVersion,
  getCurrentVersion
};