# Deploy to Render

## Prerequisites

1. **MongoDB Atlas Account** (Free): https://www.mongodb.com/cloud/atlas
2. **Render Account** (Free): https://render.com
3. **GitHub Repository** with your code

## Step 1: Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a **FREE cluster**
3. Create database user:
   - Database Access → Add New User
   - Username: `admin`
   - Password: (save this)
4. Whitelist all IPs:
   - Network Access → Add IP Address → `0.0.0.0/0`
5. Get connection string:
   - Connect → Connect your application
   - Copy: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/whatsapp-crm`

## Step 2: Push to GitHub

```bash
cd c:\Users\Zatpl\Documents\Details\Project\luffy\backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 3: Deploy on Render

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `whatsapp-crm-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

## Step 4: Add Environment Variables

In Render Dashboard → Environment:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/whatsapp-crm
JWT_SECRET=your-random-32-char-secret-key-here
JWT_EXPIRE=7d
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-id
WHATSAPP_APP_SECRET=your-secret
WHATSAPP_API_VERSION=v18.0
WEBHOOK_VERIFY_TOKEN=your-webhook-token
FRONTEND_URL=https://your-frontend.vercel.app
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 5: Deploy

Click **Create Web Service** → Render will auto-deploy

Your API will be live at: `https://your-app.onrender.com`

## Step 6: Update Webhook URL

After deployment, update in Render:
```
WEBHOOK_URL=https://your-app.onrender.com/webhooks/whatsapp
```

## Test Your Deployment

```bash
curl https://your-app.onrender.com/api/health
```

## Important Notes

- Free tier sleeps after 15 min inactivity (first request takes ~30s)
- Upgrade to paid plan ($7/mo) for always-on service
- MongoDB Atlas free tier: 512MB storage
- Set `FRONTEND_URL` to your actual frontend domain

## Troubleshooting

**MongoDB Connection Failed:**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string has correct password
- Check database user permissions

**App Crashes:**
- Check Render logs: Dashboard → Logs
- Verify all required env vars are set
- Check `npm start` works locally

## Auto-Deploy

Render auto-deploys on every `git push` to main branch.
