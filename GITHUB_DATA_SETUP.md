# GitHub Data Setup Guide

Bot hiện đã được cấu hình để có thể sử dụng dữ liệu từ GitHub thay vì file local. Điều này cho phép bạn cập nhật dữ liệu mà không cần deploy lại bot.

## Cách thiết lập

### 1. Tạo GitHub Repository

1. Tạo một repository public trên GitHub
2. Upload các file JSON vào repository:
   - `weapon.json`
   - `runeword.json` 
   - `wiki.json`

### 2. Cấu hình Bot

Chỉnh sửa file `github-config.json`:

```json
{
  "enabled": true,
  "owner": "your-github-username",
  "repo": "your-repository-name", 
  "branch": "main",
  "files": {
    "weapons": "weapon.json",
    "runewords": "runeword.json",
    "wikis": "wiki.json"
  }
}
```

**Thay đổi:**
- `enabled`: `true` để bật GitHub mode
- `owner`: Username GitHub của bạn
- `repo`: Tên repository chứa file JSON
- `branch`: Branch chứa dữ liệu (thường là `main` hoặc `master`)

### 3. Restart Bot

Sau khi cấu hình xong, restart bot để áp dụng thay đổi.

## Cách hoạt động

### Chế độ Local (mặc định)
- `enabled: false` trong `github-config.json`
- Bot sử dụng file JSON local
- Cần deploy lại khi thay đổi dữ liệu

### Chế độ GitHub
- `enabled: true` trong `github-config.json`
- Bot tải dữ liệu từ GitHub
- Cache 5 phút để tối ưu performance
- Fallback về file local nếu GitHub không khả dụng

## Tính năng

### Auto-caching
- Dữ liệu được cache 5 phút
- Giảm số lần request đến GitHub
- Tự động xóa cache cũ

### Fallback System
- Nếu GitHub không khả dụng → sử dụng file local
- Nếu file local không tồn tại → báo lỗi
- Bot vẫn hoạt động ổn định

### Debug Command
Sử dụng `/debug` để kiểm tra:
- Data Source: GitHub hoặc Local Files
- Loaded Data: weapons, runewords, wikis
- Cache Info: số file đã cache

## Cập nhật dữ liệu

### Với GitHub mode:
1. Chỉnh sửa file JSON trên GitHub
2. Commit changes
3. Bot sẽ tự động tải dữ liệu mới trong 5 phút

### Với Local mode:
1. Chỉnh sửa file JSON local
2. Deploy lại bot

## Lưu ý

### Performance
- GitHub có rate limit (60 requests/hour cho unauthenticated)
- Cache 5 phút giúp giảm số request
- Sử dụng raw.githubusercontent.com để tối ưu tốc độ

### Security
- Repository phải là public để bot có thể truy cập
- Không cần GitHub token cho public repo
- Dữ liệu được validate trước khi sử dụng

### Troubleshooting
- Kiểm tra `/debug` để xem trạng thái
- Xem log console để debug lỗi
- Đảm bảo file JSON có cấu trúc đúng

## Ví dụ Repository Structure

```
your-repo/
├── weapon.json
├── runeword.json
├── wiki.json
└── README.md
```

## URL Pattern

Bot sẽ truy cập file theo pattern:
```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{filename}
```

Ví dụ:
```
https://raw.githubusercontent.com/username/d2-data/main/weapon.json
```
