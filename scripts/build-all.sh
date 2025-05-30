#!/bin/bash

# Exit on error
set -e

echo "Building packages with improved TypeScript settings..."

# Clean up any previous builds
echo "Cleaning previous builds..."
yarn run clean

# Build shared package with skipLibCheck
echo "Building shared package..."
cd packages/shared
yarn tsc --skipLibCheck
cd ../..

# Build core package with skipLibCheck
echo "Building core package..."
cd packages/core
yarn tsc --skipLibCheck
cd ../..

# Build messaging package with skipLibCheck
echo "Building messaging package..."
cd packages/messaging
yarn tsc --skipLibCheck
cd ../..

# Build web package with Vite
echo "Building web package with Vite..."
cd packages/web
yarn build
cd ../..

echo "Build completed successfully!"
