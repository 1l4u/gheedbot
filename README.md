# Discord Bot - Diablo 2 Helper

## 📁 Cấu trúc Project

```
gheedbot/
├── index.js                 # Main bot file
├── config.json             # Bot configuration
├── .env                    # Environment variables
├── commands/               # Command handlers
│   ├── debug.js           # Debug command
│   ├── runeword.js        # Runeword search
│   ├── wiki.js            # Wiki search
│   └── calculator.js      # Calculator commands
├── utils/                 # Utility functions
│   └── permissions.js     # Permission checks
├── runeword.json          # Runeword data
├── wiki.json              # Wiki data
└── base_item.json         # Base item data
```

## 🔧 Commands

### **Available Commands:**
- `/rw <name>` - Tìm kiếm runeword
- `/wiki <name>` - Tìm kiếm thông tin wiki
- `/chance <ds> <cs> <wm>` - Tính tổng crit chance
- `/tas <ias> <skill_ias> <wsm>` - Tính Total Attack Speed
- `/ias <tas> <skill_ias> <wsm>` - Tính IAS cần thiết
- `/dmgcal <min> <max> <ed> <add_min> <add_max>` - Tính damage vũ khí
- `/debug` - Debug command (chỉ cho allowed roles)

### **Permission Requirements:**

#### **Channel Permissions:**
- Tất cả commands (trừ `/debug`) chỉ hoạt động trong channels được cấu hình
- `/debug` có thể sử dụng ở bất kỳ channel nào

#### **Role Permissions:**
- Tất cả commands yêu cầu user có một trong các allowed roles
- Cấu hình trong `config.json` → `allowedRoles`

## ⚙️ Configuration

### **config.json:**
```json
{
  "allowedChannels": ["CHANNEL_ID"],
  "allowedRoles": ["ROLE_ID_1", "ROLE_ID_2"],
  "allowedChannels_spam": ["SPAM_CHANNEL_ID"],
  "allowedChannels_show": ["SHOW_CHANNEL_ID"]
}
```

### **.env:**
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
PORT=3000
CHANNEL_ID=translation_channel_id
```

## 🚀 Deployment

### **Local Development:**
```bash
npm install
node index.js
```

### **Production (Render):**
- Deploy từ GitHub repository
- Set environment variables trong Render dashboard
- Bot sẽ tự động start với `npm start`

## 🔍 Debug & Monitoring

### **Debug Command:**
- Sử dụng `/debug` để kiểm tra:
  - Channel ID hiện tại
  - User permissions
  - Bot status
  - Configuration

### **Logs:**
- Bot logs tất cả interactions và errors
- Monitor console để debug issues
- Health check endpoint: `/ping`

## 📋 Features

### **Permission System:**
- ✅ Channel-based restrictions
- ✅ Role-based access control
- ✅ Bypass permissions for admins
- ✅ Detailed error messages

### **Command Handlers:**
- ✅ Modular command structure
- ✅ Centralized permission checks
- ✅ Error handling và logging
- ✅ Autocomplete support

### **Stability:**
- ✅ Auto-reconnect on disconnect
- ✅ Graceful error handling
- ✅ Health monitoring
- ✅ Request timeouts

## 🛠️ Maintenance

### **Adding New Commands:**
1. Tạo handler trong `commands/`
2. Import vào `index.js`
3. Thêm vào switch statement
4. Thêm SlashCommandBuilder definition

### **Updating Permissions:**
- Chỉnh sửa `config.json`
- Restart bot để áp dụng changes

### **Monitoring:**
- Check `/ping` endpoint cho health status
- Monitor console logs cho errors
- Sử dụng `/debug` để troubleshoot

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra logs console
2. Sử dụng `/debug` command
3. Verify permissions trong config
4. Check environment variables
