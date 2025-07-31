# Sửa lỗi Voice Notification gửi 4 thông báo

## Vấn đề
Bot gửi 4 thông báo trùng lặp khi 1 người tham gia hoặc thoát voice channel.

## Nguyên nhân phân tích

### 1. **Cooldown bị vô hiệu hóa**
- Code cooldown đã bị comment out
- Không có throttling để ngăn spam notifications

### 2. **Thiếu error handling**
- Không có try-catch riêng cho việc gửi DM
- Lỗi gửi DM có thể gây retry

### 3. **Không xử lý channel switching**
- Khi user chuyển từ channel A sang B, có thể trigger cả join và leave

### 4. **Potential multiple listeners**
- Có thể có nhiều event listeners được đăng ký

## Giải pháp đã áp dụng

### 1. **Kích hoạt lại Cooldown**
```javascript
// Trước (bị comment):
// const userId = newState.member.id;
// const now = Date.now();
// if (lastNotification.has(userId) && now - lastNotification.get(userId) < COOLDOWN_TIME) {
//     return;
// }

// Sau (đã sửa):
const userId = newState.member.id;
const now = Date.now();

// Kiểm tra cooldown (5 giây để tránh spam)
if (lastNotification.has(userId) && now - lastNotification.get(userId) < 5000) {
    console.log(`Cooldown active for user ${userId}, skipping notification`);
    return;
}

lastNotification.set(userId, now);
```

### 2. **Thêm Error Handling cho DM**
```javascript
// Trước:
await user.send(`${nickname} (${username}) đã tham gia voice ${channelName}...`);

// Sau:
try {
    await user.send(`${nickname} (${username}) đã tham gia voice ${channelName}...`);
    console.log(`Đã gửi DM: ${nickname} (${username}) tham gia ${channelName}`);
} catch (dmError) {
    console.error(`Lỗi gửi DM tham gia: ${dmError.message}`);
}
```

### 3. **Xử lý Channel Switching**
```javascript
// Thêm case cho việc chuyển channel (không gửi thông báo)
else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    console.log(`${nickname} (${username}) chuyển từ ${oldState.channel.name} sang ${newState.channel.name} - không gửi thông báo`);
}
```

### 4. **Đảm bảo Single Event Listener**
```javascript
// Trước:
client.on('voiceStateUpdate', async (oldState, newState) => {

// Sau:
client.removeAllListeners('voiceStateUpdate'); // Xóa listeners cũ nếu có
client.on('voiceStateUpdate', async (oldState, newState) => {
```

## Cải tiến chi tiết

### **Cooldown Logic**
- **Thời gian:** 5 giây (thay vì 10 giây ban đầu)
- **Mục đích:** Ngăn spam khi user join/leave nhanh liên tiếp
- **Log:** Ghi log khi cooldown active để debug

### **Error Handling**
- **Separate try-catch:** Riêng cho việc gửi DM
- **Không interrupt:** Lỗi gửi DM không làm crash toàn bộ handler
- **Detailed logging:** Log cụ thể lỗi gửi DM

### **Event Logic**
- **Join:** `!oldState.channelId && newState.channelId`
- **Leave:** `oldState.channelId && !newState.channelId`
- **Switch:** `oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId`

### **Listener Management**
- **Remove old listeners:** Tránh duplicate listeners
- **Single registration:** Đảm bảo chỉ có 1 listener active

## Testing

### **Scenarios to test:**
1. **User join voice** → 1 notification ✅
2. **User leave voice** → 1 notification ✅
3. **User switch channels** → 0 notifications ✅
4. **Multiple users join/leave** → Separate notifications với cooldown ✅
5. **Rapid join/leave** → Cooldown prevents spam ✅

### **Expected behavior:**
- **1 notification per action** (join/leave only)
- **No notifications for channel switching**
- **5-second cooldown per user**
- **Proper error handling**

## Monitoring

### **Console logs để debug:**
```
Đã gửi DM: nickname (username) tham gia channelName
Đã gửi DM: nickname (username) rời channelName
Cooldown active for user 123456789, skipping notification
nickname (username) chuyển từ General sang Music - không gửi thông báo
Lỗi gửi DM tham gia: User has DMs disabled
```

### **Metrics to watch:**
- Số lượng notifications per user per minute
- Error rate của DM sending
- Cooldown activation frequency

## Backup Plan

Nếu vẫn có vấn đề:

### **Option 1: Increase cooldown**
```javascript
if (lastNotification.has(userId) && now - lastNotification.get(userId) < 10000) { // 10 giây
```

### **Option 2: Add event deduplication**
```javascript
const eventKey = `${userId}-${oldState.channelId}-${newState.channelId}`;
if (recentEvents.has(eventKey)) return;
recentEvents.set(eventKey, now);
```

### **Option 3: Use once() instead of on()**
```javascript
client.once('voiceStateUpdate', handler);
// Re-register after each event
```

## Files Modified

1. **`index.js`**:
   - Uncommented và sửa cooldown logic
   - Thêm error handling cho DM
   - Thêm xử lý channel switching
   - Thêm removeAllListeners để tránh duplicate

## Status

✅ **Đã sửa:** Cooldown, error handling, channel switching, listener management
🔄 **Đang test:** Monitoring notifications trong production
📊 **Next:** Theo dõi logs để đảm bảo không còn duplicate notifications
