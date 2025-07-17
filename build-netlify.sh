#!/bin/bash

# Build the frontend
npm run build

# Create functions directory
mkdir -p dist/functions

# Build the Netlify function
npx esbuild server/functions/documents.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/documents.js

# Copy storage.ts to functions directory for proper imports
cp server/storage.ts dist/functions/storage.js

echo "Build completed for Netlify deployment"