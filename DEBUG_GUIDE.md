# Hướng dẫn Debug Bot không phản hồi

## Vấn đề phổ biến: Bot không phản hồi slash commands

### 🔍 **Bước 1: Kiểm tra Channel ID**

Bot chỉ hoạt động trong channel được cấu hình trong `config.json`:
- **Allowed Channel ID**: `1361772596303237212`

**Cách kiểm tra:**
1. Sử dụng command `/debug` trong channel bạn đang test
2. Command này sẽ hiển thị:
   - Channel ID hiện tại
   - Có được phép sử dụng bot không
   - Danh sách channel được phép

### 🔧 **Bước 2: Sửa lỗi Channel**

**Nếu bạn muốn test trong channel khác:**

1. **Lấy Channel ID mới:**
   - Bật Developer Mode trong Discord
   - Right-click channel → Copy ID

2. **Cập nhật config.json:**
   ```json
   {
     "allowedChannels": ["CHANNEL_ID_CỦA_BẠN"],
     "allowedChannels_spam": ["CHANNEL_ID_CỦA_BẠN"]
   }
   ```

3. **Hoặc thêm channel mới vào danh sách:**
   ```json
   {
     "allowedChannels": ["1361772596303237212", "CHANNEL_ID_MỚI"],
     "allowedChannels_spam": ["1361772596303237212", "CHANNEL_ID_MỚI"]
   }
   ```

### 🚀 **Bước 3: Kiểm tra Bot Status**

**Sử dụng `/debug` command để kiểm tra:**
- ✅ Bot Status: Ready
- ✅ Slash commands đã đăng ký
- ✅ Channel được phép

### 📋 **Checklist Debug:**

- [ ] Bot đã login thành công (check logs)
- [ ] Slash commands đã đăng ký (check logs: "Đăng ký slash commands thành công!")
- [ ] Đang test trong channel được phép
- [ ] Sử dụng `/debug` để xác nhận thông tin

### 🔄 **Nếu vẫn không hoạt động:**

1. **Restart bot** sau khi thay đổi config
2. **Kiểm tra logs** để tìm lỗi
3. **Test với `/debug` command** trước
4. **Đảm bảo bot có quyền** Send Messages và Use Slash Commands

### 💡 **Lưu ý:**

- Command `/debug` **không bị giới hạn channel** - có thể dùng ở bất kỳ đâu
- Các command khác chỉ hoạt động trong channel được cấu hình
- Thay đổi config cần restart bot để có hiệu lực
