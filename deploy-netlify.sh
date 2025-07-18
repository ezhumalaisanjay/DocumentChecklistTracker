#!/bin/bash

echo "🚀 Deploying to Netlify..."

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building project..."
./build-netlify.sh

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment completed!"
echo "📋 Next steps:"
echo "1. Set environment variables in Netlify dashboard:"
echo "   - MONDAY_TOKEN: Your Monday.com API token"
echo "   - WEBHOOK_URL: Your webhook URL"
echo "2. Test the application at your Netlify URL"
echo "3. Check function logs if there are any issues" 