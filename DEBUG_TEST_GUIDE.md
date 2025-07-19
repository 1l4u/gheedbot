# Hướng dẫn Test Debug Bot

## 🔧 Các cải thiện đã thực hiện:

### 1. **Sửa lỗi interaction method:**
- Thay đổi từ `interaction.isCommand()` → `interaction.isChatInputCommand()`
- Discord.js v14 đã thay đổi method này

### 2. **Thêm debug logging:**
- Track tất cả interactions nhận được
- Log từng bước xử lý command
- Simplified debug command để test

### 3. **Cải thiện error handling:**
- Better error catching và logging
- Prevent hanging interactions

## 📋 Cách test:

### **Bước 1: Restart bot và kiểm tra logs**
```bash
node index.js
```

**Logs mong đợi:**
```
Bot đã sẵn sàng! Đăng nhập với tên: YourBot#1234
Đang đăng ký slash commands...
Đăng ký slash commands thành công!
✅ Tất cả slash commands đã được đăng ký!
```

### **Bước 2: Test debug command**
Sử dụng `/debug` trong Discord

**Logs mong đợi khi gõ command:**
```
📥 Interaction received: 2 | Command: debug | User: YourName#1234
💬 Chat Input Command: debug
🔧 Executing: handleSlashDebug
🔍 Debug command called by YourName#1234
🔍 Starting debug response...
✅ Debug response sent successfully
```

### **Bước 3: Test autocomplete**
Gõ `/wiki` hoặc `/rw` và xem autocomplete

**Logs mong đợi:**
```
📥 Interaction received: 4 | Command: wiki | User: YourName#1234
🔍 Autocomplete for: wiki
✅ Autocomplete handled for: wiki
```

### **Bước 4: Test full command**
Chọn một item từ autocomplete và gửi command

**Logs mong đợi:**
```
📥 Interaction received: 2 | Command: wiki | User: YourName#1234
💬 Chat Input Command: wiki
🔧 Executing: handleSlashWiki
```

## 🚨 Nếu vẫn không hoạt động:

### **Kiểm tra logs để xác định vấn đề:**

1. **Không thấy "📥 Interaction received":**
   - Bot chưa nhận được interaction
   - Kiểm tra bot permissions
   - Kiểm tra slash commands đã đăng ký chưa

2. **Thấy "📥 Interaction received" nhưng không thấy "💬 Chat Input Command":**
   - Interaction type không đúng
   - Có thể là autocomplete thay vì command

3. **Thấy "💬 Chat Input Command" nhưng không thấy "🔧 Executing":**
   - Command name không match với switch case
   - Có lỗi trong withTimeout wrapper

4. **Thấy "🔧 Executing" nhưng không có response:**
   - Lỗi trong handler function
   - Channel permission issues

## 🔍 Debug Commands:

- `/debug` - Test cơ bản, không bị giới hạn channel
- Kiểm tra console logs để track flow
- Sử dụng browser dev tools để xem network requests

## 📞 Next Steps:

Sau khi test, hãy share logs console để tôi có thể xác định chính xác vấn đề!
