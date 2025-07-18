# Quick Netlify Deployment Guide

## 🚀 Deploy to Netlify in 3 Steps

### Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub, GitLab, or Bitbucket.

### Step 2: Deploy via Netlify Dashboard

1. **Go to [Netlify](https://app.netlify.com/)**
2. **Click "New site from Git"**
3. **Select your repository**
4. **Configure build settings:**
   - Build command: `chmod +x build-netlify.sh && ./build-netlify.sh`
   - Publish directory: `dist/public`
   - Node version: `20`

### Step 3: Set Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
MONDAY_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzOTcyMTg4NCwiYWFpIjoxMSwidWlkIjo3ODE3NzU4NCwiaWFkIjoiMjAyNS0wNy0xNlQxMjowMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTUxNjQ0NSwicmduIjoidXNlMSJ9.s43_kjRmv-QaZ92LYdRlEvrq9CYqxKhh3XXpR-8nhKU

WEBHOOK_URL=https://hook.us1.make.com/2vu8udpshhdhjkoks8gchub16wjp7cu3
```

### Step 4: Deploy!

Click **"Deploy site"** and wait for the build to complete.

## 🧪 Test Your Deployment

### Frontend
- Visit your Netlify URL (e.g., `https://your-site.netlify.app/`)
- The app should load with Monday.com integration

### API Endpoints
Test these URLs:
- `https://your-site.netlify.app/.netlify/functions/api/monday/documents/app_1752674377597_3uzu2eefu`
- `https://your-site.netlify.app/.netlify/functions/api/documents/primary`

## 🔧 Alternative: Deploy via CLI

If you prefer command line:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

## 🐛 Troubleshooting

### Build Fails?
- Check Node version is set to 20
- Verify all files are committed to Git
- Check build logs for specific errors

### API Not Working?
- Verify environment variables are set
- Check function logs in Netlify dashboard
- Test API endpoints individually

### Need Help?
- Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review Netlify function logs
- Verify environment variables

## ✅ What's Included

- ✅ Full Monday.com API integration
- ✅ Document upload with webhook support
- ✅ File storage and retrieval
- ✅ CORS configuration
- ✅ Production-ready build process
- ✅ Environment variable support

Your Document Checklist Tracker is now ready for production! 🎉 