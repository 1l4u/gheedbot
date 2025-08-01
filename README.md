# 🤖 GheedBot - Diablo 2 Discord Bot

Một Discord bot chuyên dụng cho cộng đồng Diablo 2, cung cấp các công cụ tra cứu thông tin game và tính toán.

## ✨ Tính năng chính

### 🔍 **Tra cứu thông tin**
- **`/rw <name>`** - Tìm kiếm runeword
- **`/weapon <name>`** - Tìm kiếm thông tin weapon
- **`/wiki <keyword>`** - Tra cứu wiki Diablo 2

### 🧮 **Công cụ tính toán**
- **`/hr`** - HR Calculator (interface riêng tư)
- **`/setuphr`** - Tạo HR Calculator công khai trong channel
- **`/chance <ds> <cs> <wm>`** - Tính tổng crit chance
- **`/tas <ias> <fanat> <wsm>`** - Tính Total Attack Speed
- **`/ias <tas> <fanat> <wsm>`** - Tính IAS cần thiết
- **`/dmgcal <weapon>`** - Damage calculator với weapon picker

### 🛠️ **Quản trị**
- **`/debug`** - Kiểm tra thông tin channel và bot

## 🚀 Cài đặt và triển khai

### 📋 Yêu cầu hệ thống
- Node.js 16.9.0 hoặc cao hơn
- npm hoặc yarn
- Discord Bot Token
- Git (để clone repository)

### 🤖 Tạo Discord Bot

1. **Truy cập Discord Developer Portal:**
   - Vào [https://discord.com/developers/applications](https://discord.com/developers/applications)
   - Đăng nhập với tài khoản Discord

2. **Tạo Application mới:**
   - Nhấn "New Application"
   - Đặt tên cho bot (ví dụ: "GheedBot")
   - Nhấn "Create"

3. **Tạo Bot:**
   - Vào tab "Bot" ở sidebar
   - Nhấn "Add Bot"
   - Copy "Token" (giữ bí mật!)

4. **Cấu hình Bot:**
   - Bật "Message Content Intent" nếu cần
   - Tùy chỉnh avatar và tên bot

5. **Invite Bot vào server:**
   - Vào tab "OAuth2" > "URL Generator"
   - Chọn scopes: `bot`, `applications.commands`
   - Chọn permissions cần thiết
   - Copy URL và mở trong browser để invite

### 🔧 Cài đặt

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/gheedbot.git
cd gheedbot
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình environment:**
```bash
# Tạo file .env trong thư mục gốc
touch .env

# Thêm nội dung vào .env:
DISCORD_TOKEN=your_discord_bot_token_here
PORT=3000
NODE_ENV=production
```

**⚠️ Lưu ý:** Không commit file `.env` lên GitHub! Đã có trong `.gitignore`.

4. **Cấu hình bot:**
```bash
# Chỉnh sửa config/config.json
{
  "prefix": "!",
  "allowedChannels": ["channel-id-1", "channel-id-2"],
  "allowedRoles": ["role-id-1", "role-id-2"]
}
```

### 🏃‍♂️ Chạy bot

#### Development:
```bash
npm run dev
# hoặc
node index.js
```

#### Production (với PM2):
```bash
npm install -g pm2
pm2 start index.js --name "gheedbot"
pm2 save
pm2 startup
```

### 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy test cụ thể
node test/test-commands.js
node test/test-hr-modal.js

# Test với HTML demo
# Mở test/hr-interface-demo.html trong browser
```

## 📁 Cấu trúc project

```
gheedbot/
├── commands/           # Slash commands
│   ├── calculator.js   # Damage calculator
│   ├── hr.js          # HR calculator
│   ├── runeword.js    # Runeword lookup
│   ├── weapon.js      # Weapon lookup
│   └── wiki.js        # Wiki lookup
├── config/            # Configuration files
│   └── config.json    # Bot settings
├── data/              # Game data
│   ├── runeword.json  # Runeword database
│   ├── weapon.json    # Weapon database
│   └── wiki.json      # Wiki database
├── utils/             # Utility modules
│   ├── data-manager.js    # Data management
│   ├── github-data.js     # GitHub integration
│   └── permissions.js     # Permission system
├── test/              # Test files
│   ├── hr-interface-demo.html
│   ├── setuphr-demo.html
│   └── *.js          # Test scripts
├── scripts/           # Utility scripts
├── index.js          # Main bot file
├── package.json      # Dependencies
└── README.md         # This file
```

## 🎮 Hướng dẫn sử dụng

### 💎 HR Calculator

#### **Cách 1: Interface riêng tư (`/hr`)**
1. Gõ `/hr` ở bất kỳ đâu
2. Interface hiện ra chỉ bạn thấy
3. Nhấn buttons để nhập số lượng runes
4. Nhấn "🧮 Tính toán HR" để xem kết quả

#### **Cách 2: Interface công khai (`/setuphr`)**
1. **Admin** gõ `/setuphr` trong channel
2. Interface xuất hiện cho mọi người
3. Mọi người có thể sử dụng cùng lúc
4. Kết quả hiển thị riêng tư cho từng người

#### **Nhóm runes:**
- **🟢 Nhóm 1:** UM, MAL, IST, GUL
- **🟡 Nhóm 2:** VEX, OHM, LO, SUR  
- **🔴 Nhóm 3:** BER, JAH, CHAM, ZOD

### 🔍 Tra cứu thông tin

#### **Runewords:**
```
/rw enigma
/rw heart of the oak
```

#### **Weapons:**
```
/weapon grief
/weapon breath of the dying
```

#### **Wiki:**
```
/wiki crafting
/wiki uber
```

### 🧮 Calculators

#### **Crit Chance:**
```
/chance ds:30 cs:20 wm:15
# Tính tổng crit chance từ Deadly Strike, Critical Strike, Weapon Mastery
```

#### **Attack Speed:**
```
/tas ias:40 fanat:20 wsm:10
# Tính Total Attack Speed

/ias tas:75 fanat:20 wsm:10  
# Tính IAS cần thiết để đạt TAS mong muốn
```

## ⚙️ Cấu hình

### 🔐 Permissions

Bot sử dụng hệ thống permission dựa trên:
- **Channels:** Chỉ hoạt động trong channels được phép
- **Roles:** Một số lệnh yêu cầu roles cụ thể
- **Admin commands:** `/setuphr` cần quyền "Manage Channels"

### 📊 Data Management

Bot tự động:
- Load data từ GitHub khi khởi động
- Cache data trong memory để tăng tốc
- Update data định kỳ
- Fallback về local files nếu GitHub không khả dụng

### 🔄 Auto-update

Bot có thể tự động update data từ GitHub repository:
```javascript
// Trong config/github-config.json
{
  "owner": "your-github-username",
  "repo": "your-data-repo", 
  "branch": "main"
}
```

## 🐛 Troubleshooting

### ❌ Bot không phản hồi
1. Kiểm tra bot có online không
2. Kiểm tra permissions trong channel
3. Kiểm tra console logs

### ❌ Slash commands không xuất hiện
1. Restart bot để register commands
2. Kiểm tra bot có quyền "Use Slash Commands"
3. Đợi Discord sync (có thể mất vài phút)

### ❌ HR Calculator lỗi
1. Kiểm tra console logs
2. Restart bot
3. Test với `/hr` trước khi dùng `/setuphr`

### ❌ Data không load
1. Kiểm tra kết nối internet
2. Kiểm tra GitHub repository
3. Kiểm tra local data files

## 🤝 Đóng góp

### 📝 Báo lỗi
1. Mở [GitHub Issues](https://github.com/1l4u/gheedbot/issues)
2. Mô tả chi tiết lỗi
3. Cung cấp logs nếu có

### 🔧 Phát triển
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

### 📊 Thêm data
1. Chỉnh sửa files trong `data/`
2. Test với `npm test`
3. Submit Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **GitHub:** [1l4u](https://github.com/1l4u)
- **Discord:** hieunguyen#7399
- **Project Link:** [https://github.com/1l4u/gheedbot](https://github.com/1l4u/gheedbot)

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Diablo 2 Community](https://www.reddit.com/r/diablo2/) - Game data và feedback
- [Arreat Summit](http://classic.battle.net/diablo2exp/) - Official game reference

---

⭐ **Nếu project hữu ích, hãy star repository!** ⭐
