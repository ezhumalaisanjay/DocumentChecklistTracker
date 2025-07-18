#!/bin/bash

echo "🚀 Starting Netlify build..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Create functions directory
mkdir -p dist/functions

# Build the main API function
echo "🔧 Building API function..."
npx esbuild server/functions/api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js

# Copy shared files with proper extensions
echo "📋 Copying shared files..."
cp server/functions/storage.js dist/functions/storage.js
cp server/functions/schema.js dist/functions/schema.js

# Create a simple index function for testing
echo "📝 Creating index function..."
cat > dist/functions/index.js << 'EOF'
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ 
      message: 'Document Checklist Tracker API is running',
      timestamp: new Date().toISOString()
    }),
  };
};
EOF

echo "✅ Build completed for Netlify deployment"
echo "📁 Built files:"
ls -la dist/functions/