#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Ensure vite is installed globally for the build
echo "Installing vite globally..."
npm install -g vite

# Build the client
echo "Building client..."
npx vite build --config vite.config.js

# Build the server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Ensure theme CSS is properly included
echo "Ensuring theme CSS is properly included..."
node ensure-theme.js

echo "Build completed successfully!"
