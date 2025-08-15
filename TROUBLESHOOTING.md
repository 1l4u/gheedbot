# 🚨 Troubleshooting Guide - GheedBot

Hướng dẫn xử lý sự cố cho GheedBot khi gặp lỗi "Server Unavailable" trên UptimeRobot.

## 🔍 Kiểm tra nhanh

### 1. Sử dụng Deployment Checker

```bash
# Kiểm tra deployment với script
node scripts/check-deployment.js https://your-app.onrender.com

# Hoặc mở file HTML để test trực quan
# Mở test/deployment-check.html trong browser
```

### 2. Kiểm tra endpoints thủ công

```bash
# Test các endpoints cơ bản
curl https://your-app.onrender.com/
curl https://your-app.onrender.com/ping
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/test-github
```

## 🔧 Các nguyên nhân thường gặp

### ❌ 1. UptimeRobot Configuration Sai

**Triệu chứng:**
- UptimeRobot báo "Server Unavailable"
- Bot hoạt động bình thường khi test thủ công

**Giải pháp:**
1. **Kiểm tra URL monitor:**
   - Đảm bảo URL đúng: `https://your-app.onrender.com/ping`
   - Không có trailing slash thừa
   - Protocol đúng (https://)

2. **Kiểm tra timeout settings:**
   - Tăng timeout lên 30-60 giây
   - Bot cần thời gian khởi động

3. **Kiểm tra HTTP method:**
   - Sử dụng GET method
   - Không sử dụng POST/PUT

### ❌ 2. Deployment Platform Issues

**Triệu chứng:**
- Endpoints trả về 503/500 errors
- Bot không khởi động được

**Giải pháp:**

#### Render.com:
```bash
# Kiểm tra logs
# Vào Render dashboard > Your service > Logs

# Kiểm tra environment variables
DISCORD_TOKEN=your_token_here
PORT=10000  # Render sử dụng port 10000
NODE_ENV=production
```

#### Heroku:
```bash
# Kiểm tra logs
heroku logs --tail -a your-app-name

# Kiểm tra config vars
heroku config -a your-app-name

# Restart dyno
heroku restart -a your-app-name
```

### ❌ 3. Discord Token Issues

**Triệu chứng:**
- Bot status: "disconnected"
- Discord login errors trong logs

**Giải pháp:**
1. **Kiểm tra token:**
   - Token còn hạn sử dụng
   - Token không bị regenerate
   - Không có spaces/newlines thừa

2. **Kiểm tra bot permissions:**
   - Bot được invite vào server
   - Có đủ permissions cần thiết

### ❌ 4. GitHub Data Loading Issues

**Triệu chứng:**
- `/test-github` endpoint lỗi
- Data loading failures trong logs

**Giải pháp:**
1. **Kiểm tra GitHub repository:**
   - Repository public
   - Files tồn tại: `data/weapon.json`, `data/runeword.json`, `data/wiki.json`
   - JSON format hợp lệ

2. **Kiểm tra network:**
   - Platform có thể access GitHub
   - Không bị firewall block

### ❌ 5. Memory/Resource Issues

**Triệu chứng:**
- Bot crash sau một thời gian
- Out of memory errors

**Giải pháp:**
1. **Tăng memory limit:**
   - Render: Upgrade plan
   - Heroku: Upgrade dyno type

2. **Optimize code:**
   - Clear cache định kỳ
   - Giảm memory usage

## 🛠️ Các bước debug chi tiết

### Bước 1: Kiểm tra local
```bash
# Chạy bot local
npm start

# Test endpoints local
curl http://localhost:3000/ping
curl http://localhost:3000/health
```

### Bước 2: Kiểm tra deployment
```bash
# Sử dụng deployment checker
node scripts/check-deployment.js https://your-app.onrender.com

# Hoặc test thủ công
curl -v https://your-app.onrender.com/ping
```

### Bước 3: Kiểm tra logs
- **Render:** Dashboard > Service > Logs
- **Heroku:** `heroku logs --tail`
- **VPS:** `pm2 logs gheedbot`

### Bước 4: Kiểm tra environment
```bash
# Kiểm tra environment variables
echo $DISCORD_TOKEN
echo $PORT
echo $NODE_ENV
```

### Bước 5: Test từng component
1. **Discord connection:** Kiểm tra bot online trong Discord
2. **Express server:** Test `/ping` endpoint
3. **Data loading:** Test `/test-github` endpoint
4. **Full health:** Test `/health` endpoint

## 📋 Checklist sửa lỗi

### ✅ UptimeRobot Settings
- [ ] URL đúng format: `https://domain.com/ping`
- [ ] Timeout >= 30 seconds
- [ ] HTTP method = GET
- [ ] Check interval hợp lý (5-10 minutes)

### ✅ Deployment Settings
- [ ] Environment variables đầy đủ
- [ ] Port binding đúng
- [ ] Build/start commands đúng
- [ ] Dependencies installed

### ✅ Bot Configuration
- [ ] Discord token valid
- [ ] Bot permissions đủ
- [ ] GitHub repository accessible
- [ ] JSON files valid

### ✅ Network/Infrastructure
- [ ] Domain/URL accessible
- [ ] SSL certificate valid
- [ ] Firewall rules correct
- [ ] DNS resolution working

## 🆘 Emergency Recovery

Nếu tất cả đều thất bại:

1. **Restart deployment:**
   ```bash
   # Render: Manual deploy
   # Heroku: heroku restart
   # VPS: pm2 restart gheedbot
   ```

2. **Rollback to previous version:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Use local fallback:**
   - Disable GitHub data loading
   - Use local JSON files only

4. **Contact support:**
   - Platform support (Render/Heroku)
   - Discord developer support
   - GitHub support

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề:
1. Tạo GitHub issue với logs đầy đủ
2. Cung cấp deployment URL
3. Mô tả chi tiết lỗi và steps to reproduce
4. Attach screenshots nếu có

---

**Lưu ý:** Hầu hết các lỗi "Server Unavailable" đều do configuration sai chứ không phải code lỗi.
