# Permission System Update

## 🔄 Thay đổi đã thực hiện:

### **1. Command Permissions:**

#### **Chỉ `/debug` cần allowed role:**
- ✅ `/debug` - Yêu cầu user có allowed role
- ✅ Có thể sử dụng ở bất kỳ channel nào

#### **Các commands khác chỉ cần channel:**
- ✅ `/rw` - Chỉ cần đúng channel
- ✅ `/wiki` - Chỉ cần đúng channel  
- ✅ `/chance` - Chỉ cần đúng channel
- ✅ `/tas` - Chỉ cần đúng channel
- ✅ `/ias` - Chỉ cần đúng channel
- ✅ `/dmgcal` - Chỉ cần đúng channel

### **2. Channel Restrictions:**

#### **Allowed Channels (Commands):**
- Channel ID: `1361772596303237212`
- Cho phép sử dụng tất cả commands (trừ debug)

#### **Show Channel (Images Only):**
- Channel ID: `1362684571182698616`
- Chỉ cho phép đăng hình ảnh
- Tin nhắn không có ảnh sẽ bị xóa
- **Ngoại trừ:** Users có allowed roles được bypass

#### **Spam Channel:**
- Channel ID: `1361772596303237212`
- Chỉ cho phép commands
- Tin nhắn khác sẽ bị xóa
- **Ngoại trừ:** Users có allowed roles được bypass

### **3. Role System:**

#### **Allowed Roles:**
- `1371860537356324995`
- `1362362087501860954`

#### **Quyền của Allowed Roles:**
- ✅ Bypass tất cả channel restrictions
- ✅ Có thể đăng tin nhắn bất kỳ ở channel nào
- ✅ Có thể sử dụng `/debug` command
- ✅ Có thể sử dụng tất cả commands ở bất kỳ channel nào

## 📋 Permission Matrix:

| Command | Channel Required | Role Required | Notes |
|---------|------------------|---------------|-------|
| `/debug` | ❌ Any channel | ✅ Allowed role | Admin only |
| `/rw` | ✅ Allowed channel | ❌ No | Public |
| `/wiki` | ✅ Allowed channel | ❌ No | Public |
| `/chance` | ✅ Allowed channel | ❌ No | Public |
| `/tas` | ✅ Allowed channel | ❌ No | Public |
| `/ias` | ✅ Allowed channel | ❌ No | Public |
| `/dmgcal` | ✅ Allowed channel | ❌ No | Public |

## 🔧 Channel Behavior:

### **Channel `1361772596303237212` (Bot Commands):**
- ✅ Tất cả commands hoạt động
- ❌ Tin nhắn thường bị xóa (trừ allowed roles)
- ✅ Commands được phép

### **Channel `1362684571182698616` (Images Only):**
- ❌ Commands không hoạt động (trừ `/debug` cho allowed roles)
- ✅ Hình ảnh được phép
- ❌ Tin nhắn text bị xóa (trừ allowed roles)

### **Channels khác:**
- ❌ Commands không hoạt động (trừ `/debug` cho allowed roles)
- ✅ Tin nhắn thường được phép

## 🎯 Kết quả:

1. **Public users:** Chỉ có thể dùng commands trong channel được cấu hình
2. **Allowed roles:** Có thể làm gì cũng được ở bất kỳ đâu
3. **Debug command:** Chỉ admins (allowed roles) mới dùng được
4. **Image channel:** Chỉ cho phép ảnh, text bị xóa (trừ admins)

## 🚀 Test Commands:

### **Test với public user:**
```
/rw Enigma          # ✅ Hoạt động trong allowed channel
/debug              # ❌ Bị từ chối (cần role)
```

### **Test với allowed role:**
```
/rw Enigma          # ✅ Hoạt động ở bất kỳ channel nào
/debug              # ✅ Hoạt động ở bất kỳ channel nào
```

### **Test image channel:**
- Public user gửi text → ❌ Bị xóa
- Allowed role gửi text → ✅ Được giữ lại
- Bất kỳ ai gửi ảnh → ✅ Được giữ lại
