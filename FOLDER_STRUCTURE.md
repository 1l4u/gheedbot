# Cấu trúc thư mục mới

Bot đã được tổ chức lại với cấu trúc thư mục rõ ràng hơn:

## Cấu trúc thư mục

```
gheedbot/
├── index.js                    # File chính của bot
├── package.json               # Dependencies
├── package-lock.json          # Lock file
├── .env                       # Environment variables (không commit)
│
├── commands/                  # Discord slash commands
│   ├── calculator.js
│   ├── debug.js
│   ├── runeword.js
│   ├── weapon.js
│   ├── wiki.js
│   └── wiki_backup.js
│
├── utils/                     # Utility functions
│   ├── data-manager.js        # Quản lý dữ liệu GitHub/Local
│   ├── github-data.js         # GitHub API integration
│   └── permissions.js         # Permission checking
│
├── config/                    # Configuration files
│   ├── config.json           # Bot configuration
│   └── github-config.json    # GitHub repository settings
│
├── data/                      # JSON data files
│   ├── weapon.json           # Weapon data
│   ├── runeword.json         # Runeword data
│   ├── wiki.json             # Wiki data
│   ├── classoverview.json    # Class overview
│   ├── craft.json            # Crafting data
│   ├── weaponfix.json        # Raw weapon data (input)
│   └── weapon_fixed.json     # Processed weapon data (output)
│
├── scripts/                   # Utility scripts
│   ├── fix_weaponfix.js      # Weapon data processing script
│   ├── translation.js        # Translation utilities
│   └── rw_backup.js          # Runeword backup script
│
└── node_modules/             # Dependencies (auto-generated)
```

## Lợi ích của cấu trúc mới

### 1. **Tổ chức rõ ràng**
- **commands/**: Tất cả Discord commands ở một nơi
- **utils/**: Các utility functions tái sử dụng
- **config/**: Tất cả file cấu hình
- **data/**: Tất cả dữ liệu JSON
- **scripts/**: Các script tiện ích

### 2. **Dễ bảo trì**
- Tìm file dễ dàng hơn
- Thêm commands mới đơn giản
- Quản lý dữ liệu tập trung

### 3. **Scalable**
- Dễ thêm modules mới
- Tách biệt logic và data
- Cấu hình linh hoạt

## Cách sử dụng

### Chạy bot
```bash
node index.js
```

### Chạy scripts
```bash
# Từ thư mục gốc
cd scripts
node fix_weaponfix.js

# Hoặc
node scripts/fix_weaponfix.js
```

### Cập nhật dữ liệu
1. **GitHub mode**: Chỉnh sửa file trên GitHub
2. **Local mode**: Chỉnh sửa file trong `data/`

### Thêm command mới
1. Tạo file trong `commands/`
2. Import vào `index.js`
3. Đăng ký slash command

## Migration từ cấu trúc cũ

Tất cả đường dẫn đã được cập nhật tự động:

### Config files
- `config.json` → `config/config.json`
- `github-config.json` → `config/github-config.json`

### Data files
- `weapon.json` → `data/weapon.json`
- `runeword.json` → `data/runeword.json`
- `wiki.json` → `data/wiki.json`

### Scripts
- `fix_weaponfix.js` → `scripts/fix_weaponfix.js`
- Đường dẫn input/output đã được cập nhật

## Lưu ý

### GitHub Integration
- Bot vẫn hoạt động với GitHub data loading
- File local được sử dụng làm fallback
- Cấu hình GitHub trong `config/github-config.json`

### Backward Compatibility
- Tất cả chức năng cũ vẫn hoạt động
- Không cần thay đổi cách sử dụng bot
- Commands và features không đổi

### Development
- Thêm file mới vào đúng thư mục
- Import đường dẫn tương đối
- Kiểm tra paths khi di chuyển file
