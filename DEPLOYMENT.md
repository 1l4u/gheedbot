# 🚀 Deployment Guide

Hướng dẫn triển khai GheedBot lên các platforms khác nhau.

## 🌐 Render.com (Recommended)

### 📋 Chuẩn bị

1. **Tạo tài khoản** tại [render.com](https://render.com)
2. **Connect GitHub** repository
3. **Chuẩn bị Discord Bot Token**

### 🔧 Triển khai

1. **Tạo Web Service mới:**
   - Chọn "New" → "Web Service"
   - Connect GitHub repository
   - Chọn branch (thường là `main`)

2. **Cấu hình Service:**
   ```
   Name: gheedbot
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables:**
   ```
   DISCORD_TOKEN=your_discord_bot_token
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy:**
   - Nhấn "Create Web Service"
   - Đợi build và deploy hoàn thành

### 🔄 Auto-Deploy

- **Automatic deploys** khi push code lên GitHub
- **Build logs** để debug issues
- **Health checks** tự động

## 🐳 Docker

### 📄 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### 🐙 Docker Compose

```yaml
version: '3.8'

services:
  gheedbot:
    build: .
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - NODE_ENV=production
    ports:
      - "3000:3000"
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### 🚀 Deploy với Docker

```bash
# Build image
docker build -t gheedbot .

# Run container
docker run -d \
  --name gheedbot \
  -e DISCORD_TOKEN=your_token \
  -p 3000:3000 \
  --restart unless-stopped \
  gheedbot

# Với Docker Compose
docker-compose up -d
```

## ☁️ Heroku

### 📋 Chuẩn bị

1. **Cài đặt Heroku CLI**
2. **Login:** `heroku login`
3. **Tạo app:** `heroku create your-bot-name`

### 🔧 Deploy

```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-bot-name.git

# Set environment variables
heroku config:set DISCORD_TOKEN=your_token
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### 📄 Procfile

```
web: npm start
```

## 🖥️ VPS/Dedicated Server

### 📋 Yêu cầu hệ thống

- **OS:** Ubuntu 20.04+ / CentOS 8+
- **RAM:** 512MB minimum, 1GB recommended
- **Storage:** 1GB minimum
- **Network:** Stable internet connection

### 🔧 Cài đặt

1. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Cài đặt Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Cài đặt PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone và setup:**
   ```bash
   git clone https://github.com/yourusername/gheedbot.git
   cd gheedbot
   npm install --production
   cp .env.example .env
   # Edit .env với Discord token
   ```

5. **Start với PM2:**
   ```bash
   pm2 start index.js --name "gheedbot"
   pm2 save
   pm2 startup
   ```

### 🔄 Auto-restart và Monitoring

```bash
# Monitor
pm2 monit

# Logs
pm2 logs gheedbot

# Restart
pm2 restart gheedbot

# Stop
pm2 stop gheedbot
```

## 🌩️ AWS EC2

### 📋 Setup EC2 Instance

1. **Launch Instance:**
   - AMI: Ubuntu Server 20.04 LTS
   - Instance Type: t2.micro (free tier)
   - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect và setup:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow VPS setup steps above
   ```

### 🔒 Security Best Practices

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Create non-root user
sudo adduser botuser
sudo usermod -aG sudo botuser
```

## 📊 Monitoring & Logging

### 📈 Health Checks

```javascript
// Add to index.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

### 📝 Logging Setup

```bash
# PM2 logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔧 Environment Variables

### 🔑 Required Variables

```bash
DISCORD_TOKEN=your_discord_bot_token
```

### ⚙️ Optional Variables

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
GITHUB_TOKEN=your_github_token
```

## 🚨 Troubleshooting

### ❌ Common Issues

1. **Bot không online:**
   - Kiểm tra Discord token
   - Kiểm tra network connectivity
   - Check logs: `pm2 logs gheedbot`

2. **Commands không hoạt động:**
   - Verify bot permissions
   - Check slash command registration
   - Restart bot: `pm2 restart gheedbot`

3. **Memory issues:**
   - Monitor usage: `pm2 monit`
   - Increase server RAM
   - Optimize code

### 📋 Debug Commands

```bash
# Check bot status
pm2 status

# View logs
pm2 logs gheedbot --lines 100

# Monitor resources
pm2 monit

# Restart bot
pm2 restart gheedbot
```

## 🔄 Updates & Maintenance

### 📥 Update Bot

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart bot
pm2 restart gheedbot
```

### 🧹 Maintenance Tasks

```bash
# Clean logs
pm2 flush

# Update PM2
npm update -g pm2
pm2 update

# System updates
sudo apt update && sudo apt upgrade -y
```

---

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy:

1. **Check logs** đầu tiên
2. **Search GitHub Issues**
3. **Create new issue** với logs và error details
4. **Join Discord** để được hỗ trợ trực tiếp

---

**Happy Deploying!** 🎉
