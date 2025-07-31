# Render Deployment Setup

## Vấn đề thường gặp khi deploy lên Render

### 1. **Network Issues**
- Render có thể có network restrictions
- GitHub API rate limiting
- DNS resolution issues
- Timeout issues

### 2. **Environment Differences**
- Node.js version khác nhau
- Memory limitations
- File system permissions
- Environment variables

## Giải pháp đã implement

### 1. **Improved Error Handling**
- Retry logic với exponential backoff
- Fallback từ GitHub về local files
- Better timeout handling (30s thay vì 10s)
- Detailed error logging

### 2. **Enhanced HTTP Requests**
- User-Agent header cho Render
- Connection: close header
- Cache-Control: no-cache
- Improved timeout handling

### 3. **Data Loading Strategy**
- Memory caching để tránh reload
- Concurrent loading với Promise.all
- Validation cho data structure
- Graceful degradation

## Environment Variables cho Render

Trong Render dashboard, set các environment variables sau:

```bash
# Required
DISCORD_TOKEN=your_discord_bot_token
NODE_ENV=production

# Optional - GitHub config
GITHUB_ENABLED=true
GITHUB_OWNER=1l4u
GITHUB_REPO=gheedbot
GITHUB_BRANCH=main

# Optional - Performance tuning
NODE_OPTIONS=--max-old-space-size=512
```

## Build Commands cho Render

### Build Command:
```bash
npm install
```

### Start Command:
```bash
node index.js
```

## Debugging trên Render

### 1. **Chạy debug script**
```bash
node scripts/debug-github.js
```

### 2. **Chạy render test**
```bash
node scripts/render-test.js
```

### 3. **Check logs**
- Xem Render logs để tìm lỗi cụ thể
- Tìm timeout errors
- Tìm network errors
- Tìm memory errors

## Common Issues & Solutions

### Issue 1: "ENOTFOUND raw.githubusercontent.com"
**Nguyên nhân:** DNS resolution issue trên Render
**Giải pháp:** 
- Đã thêm retry logic
- Fallback về local files
- Check DNS trong debug script

### Issue 2: "Request timeout"
**Nguyên nhân:** Network slow hoặc GitHub API slow
**Giải pháp:**
- Tăng timeout từ 10s lên 30s
- Retry với exponential backoff
- Fallback về cache cũ

### Issue 3: "JSON parse error"
**Nguyên nhân:** Incomplete download hoặc corrupted data
**Giải pháp:**
- Validate JSON trước khi parse
- Retry on parse errors
- Fallback về local files

### Issue 4: "Memory limit exceeded"
**Nguyên nhân:** Render free tier có memory limit
**Giải pháp:**
- Set NODE_OPTIONS=--max-old-space-size=512
- Memory caching thay vì reload
- Cleanup unused data

## Testing Strategy

### Local Testing:
```bash
# Test GitHub connection
node scripts/debug-github.js

# Test data loading
node scripts/render-test.js

# Run full test suite
node test/run-all-tests.js
```

### Production Testing:
1. Deploy lên Render
2. Check logs trong Render dashboard
3. Test bot commands trong Discord
4. Monitor memory usage

## Monitoring

### Health Check Endpoint:
Bot có endpoint `/` để Render check health:
```
GET https://your-app.onrender.com/
Response: "Discord Bot đang chạy"
```

### Log Monitoring:
- GitHub request logs
- Data loading logs
- Error logs với stack trace
- Performance metrics

## Fallback Strategy

1. **Primary:** GitHub raw files
2. **Secondary:** Local files trong repo
3. **Tertiary:** Cached data (even if expired)
4. **Last resort:** Empty arrays với warning

Với setup này, bot sẽ hoạt động ngay cả khi GitHub không accessible trên Render.
