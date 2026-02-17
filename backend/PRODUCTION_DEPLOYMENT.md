# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 📦 PRE-DEPLOYMENT CHECKLIST

### **Security**
- [ ] Generate secure JWT_SECRET (64+ characters)
- [ ] Generate secure JWT_REFRESH_SECRET (different from JWT_SECRET)
- [ ] Generate secure WEBHOOK_VERIFY_TOKEN
- [ ] Set BCRYPT_ROUNDS to 12 in production
- [ ] Enable MongoDB IP whitelist (remove 0.0.0.0/0)
- [ ] Set NODE_ENV=production
- [ ] Review and update CORS origins
- [ ] Enable HTTPS/TLS certificates

### **Database**
- [ ] MongoDB Atlas production cluster configured
- [ ] Database indexes created for performance
- [ ] Connection pooling configured (maxPoolSize=10)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

### **Infrastructure**
- [ ] Server/VM provisioned (min 2GB RAM, 2 vCPU)
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally (`npm i -g pm2`)
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Log rotation configured

### **Application**
- [ ] All dependencies installed (`npm ci --production`)
- [ ] Environment variables configured
- [ ] Logs directory created with write permissions
- [ ] Health check endpoint tested
- [ ] Graceful shutdown tested

---

## 🔧 DEPLOYMENT METHODS

### **Method 1: PM2 (Recommended for VPS/EC2)**

```bash
# 1. Install dependencies
npm ci --production

# 2. Create logs directory
mkdir -p logs

# 3. Start with PM2
pm2 start ecosystem.config.js --env production

# 4. Save PM2 configuration
pm2 save

# 5. Setup PM2 startup script
pm2 startup

# 6. Monitor
pm2 monit
```

**PM2 Commands:**
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart
pm2 reload all          # Zero-downtime reload
pm2 stop all            # Stop
pm2 delete all          # Remove from PM2
```

---

### **Method 2: Docker (Recommended for Cloud)**

```bash
# 1. Build image
docker build -f Dockerfile.production -t whatsapp-crm-api:latest .

# 2. Run container
docker run -d \
  --name whatsapp-crm-api \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  whatsapp-crm-api:latest

# 3. Check logs
docker logs -f whatsapp-crm-api

# 4. Check health
docker inspect --format='{{.State.Health.Status}}' whatsapp-crm-api
```

**Or use Docker Compose:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

---

### **Method 3: Systemd Service (Linux)**

Create `/etc/systemd/system/whatsapp-crm.service`:
```ini
[Unit]
Description=WhatsApp CRM API
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/whatsapp-crm/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=whatsapp-crm

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-crm
sudo systemctl start whatsapp-crm
sudo systemctl status whatsapp-crm
```

---

## 🔍 MONITORING & OBSERVABILITY

### **Health Checks**
```bash
# Basic health
curl https://your-domain.com/api/health

# Detailed health with dependencies
curl https://your-domain.com/api/status
```

### **Log Monitoring**
```bash
# PM2 logs
pm2 logs --lines 100

# Docker logs
docker logs -f whatsapp-crm-api --tail 100

# File logs
tail -f logs/combined.log
tail -f logs/error.log
```

### **Performance Monitoring**
```bash
# PM2 monitoring
pm2 monit

# Docker stats
docker stats whatsapp-crm-api
```

---

## 🔄 ZERO-DOWNTIME DEPLOYMENT

### **With PM2:**
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Reload (zero-downtime)
pm2 reload ecosystem.config.js --env production
```

### **With Docker:**
```bash
# Build new image
docker build -f Dockerfile.production -t whatsapp-crm-api:latest .

# Stop old container
docker stop whatsapp-crm-api

# Remove old container
docker rm whatsapp-crm-api

# Start new container
docker run -d --name whatsapp-crm-api ... (same command as before)
```

---

## 🚨 TROUBLESHOOTING

### **Server Won't Start**
```bash
# Check logs
pm2 logs --err
# or
docker logs whatsapp-crm-api

# Common issues:
# - JWT_SECRET missing
# - MongoDB connection failed
# - Port already in use
```

### **High Memory Usage**
```bash
# Check memory
pm2 monit
# or
docker stats

# Solution: Restart
pm2 restart all
# or
docker restart whatsapp-crm-api
```

### **MongoDB Connection Issues**
```bash
# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log(e))"

# Check:
# - IP whitelist in MongoDB Atlas
# - Connection string format
# - Network connectivity
```

---

## 📊 PERFORMANCE BENCHMARKS

**Expected Performance:**
- Health check: < 50ms
- Auth endpoints: < 200ms
- Message send: < 500ms
- Webhook processing: < 100ms

**Resource Usage:**
- Memory: 150-300MB per instance
- CPU: < 10% idle, < 50% under load
- Connections: 50-100 concurrent

---

## 🔐 SECURITY HARDENING

### **1. Generate Secure Secrets**
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **2. Nginx Reverse Proxy**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **3. Firewall Rules**
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 📈 SCALING STRATEGY

### **Vertical Scaling (Single Server)**
- Start: 2GB RAM, 2 vCPU
- Scale to: 4GB RAM, 4 vCPU
- Use PM2 cluster mode: `instances: 'max'`

### **Horizontal Scaling (Multiple Servers)**
- Load balancer (Nginx/AWS ALB)
- Redis for session storage
- Redis for Socket.IO adapter
- Shared MongoDB Atlas cluster

---

## ✅ POST-DEPLOYMENT VERIFICATION

```bash
# 1. Health check
curl https://your-domain.com/api/health

# 2. Test registration
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!","businessName":"Test"}'

# 3. Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 4. Test webhook
curl "https://your-domain.com/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"

# 5. Monitor logs
pm2 logs --lines 50
```

---

## 🎯 SUCCESS CRITERIA

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] MongoDB connected successfully
- [ ] Can register new user
- [ ] Can login and receive JWT
- [ ] Webhook verification works
- [ ] Logs are being written
- [ ] PM2/Docker monitoring shows healthy status
- [ ] Memory usage stable
- [ ] No error spikes in logs

---

**Deployment Time Estimate:** 30-60 minutes
**Rollback Time:** < 5 minutes with PM2/Docker
