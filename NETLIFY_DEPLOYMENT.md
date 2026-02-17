# WhatsApp CRM - Netlify Deployment

## Project Structure
- `frontend/` - React frontend
- `backend/` - Express backend (deployed as Netlify Functions)
- `netlify/functions/` - Serverless function wrappers

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Setup for Netlify deployment"
git push origin main
```

### 2. Deploy on Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Netlify will auto-detect settings from `netlify.toml`
5. Add environment variables in Netlify dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `WHATSAPP_API_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WEBHOOK_VERIFY_TOKEN`
   - Any other backend environment variables

### 3. Update Frontend API URL
Update `frontend/src/config/api.js` to use:
```javascript
const API_URL = '/.netlify/functions/api';
```

### 4. Configure WhatsApp Webhook
Set webhook URL to: `https://your-site.netlify.app/.netlify/functions/api/webhooks/whatsapp`

## Local Development
```bash
npm install
npm run build
```

## Notes
- Backend runs as serverless functions
- MongoDB connection is cached for performance
- All API routes are prefixed with `/.netlify/functions/api`
