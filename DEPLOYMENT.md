# Netlify Deployment Guide

## Overview
This guide will help you deploy the Document Checklist Tracker application to Netlify with full API functionality including Monday.com integration and webhook support.

## Prerequisites
- Netlify account
- GitHub repository with your code
- Monday.com API token
- Webhook URL (optional)

## Step 1: Environment Variables

Set these environment variables in your Netlify dashboard:

### Required Variables
- `MONDAY_TOKEN`: Your Monday.com API token
- `WEBHOOK_URL`: Your webhook URL for file processing

### Optional Variables
- `NODE_VERSION`: Set to "20" (default)

## Step 2: Deploy to Netlify

### Option A: Deploy from Git (Recommended)

1. **Connect to Git Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository

2. **Configure Build Settings**
   - Build command: `chmod +x build-netlify.sh && ./build-netlify.sh`
   - Publish directory: `dist/public`
   - Node version: `20`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add the variables listed above

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option B: Deploy from Local Build

1. **Build Locally**
   ```bash
   chmod +x build-netlify.sh
   ./build-netlify.sh
   ```

2. **Deploy to Netlify**
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```

## Step 3: Verify Deployment

### Test API Endpoints
Your API will be available at:
- `https://your-site.netlify.app/.netlify/functions/api/monday/documents/app_1752674377597_3uzu2eefu`
- `https://your-site.netlify.app/.netlify/functions/api/documents/primary`

### Test Frontend
- Visit `https://your-site.netlify.app/`
- The application should load with Monday.com integration

## Step 4: Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node version is set to 20
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **API Not Working**
   - Verify environment variables are set correctly
   - Check function logs in Netlify dashboard
   - Ensure Monday.com token is valid

3. **CORS Issues**
   - CORS is already configured in the functions
   - If issues persist, check browser console for errors

4. **File Upload Issues**
   - File uploads are handled via base64 encoding
   - Check webhook URL is correct
   - Verify webhook endpoint is working

### Debugging

1. **Check Function Logs**
   - Go to Functions tab in Netlify dashboard
   - Click on function to view logs

2. **Test Functions Locally**
   ```bash
   npx netlify-cli dev
   ```

3. **Check Environment Variables**
   - Verify all variables are set in Netlify dashboard
   - Check for typos in variable names

## Security Considerations

1. **API Tokens**
   - Never commit API tokens to Git
   - Use environment variables for all sensitive data
   - Rotate tokens regularly

2. **CORS**
   - CORS is configured to allow all origins for demo
   - Restrict to specific domains in production

3. **File Uploads**
   - Files are stored in memory (not persistent)
   - Consider using external storage for production

## Performance Optimization

1. **Caching**
   - Monday.com data is cached for 5 minutes
   - Adjust cache settings as needed

2. **Function Optimization**
   - Functions are bundled with esbuild
   - External packages are excluded from bundle

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Netlify function logs
3. Verify all environment variables are set correctly
4. Test API endpoints individually

## Production Checklist

- [ ] Environment variables set
- [ ] Monday.com token configured
- [ ] Webhook URL configured
- [ ] Custom domain set up (if needed)
- [ ] SSL certificate active
- [ ] All API endpoints working
- [ ] File uploads functional
- [ ] Monday.com integration working 