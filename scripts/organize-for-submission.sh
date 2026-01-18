#!/bin/bash

# Script to organize TimeCapsule project for submission
# Creates a clean structure with mobile and web apps separated

DEST_DIR="$HOME/Desktop/TimeCapsule-Rendu"

echo "🚀 Creating organized project structure..."

# Create destination directories
mkdir -p "$DEST_DIR/mobile-app"
mkdir -p "$DEST_DIR/web-app"

echo "📱 Copying Mobile App (Expo)..."

# Copy mobile app files (excluding node_modules, .next, build artifacts)
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'timecapsule-web' \
    --exclude '.expo' \
    --exclude 'android/app/build' \
    --exclude 'android/.gradle' \
    --exclude 'ios/build' \
    --exclude 'ios/Pods' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'tsconfig.tsbuildinfo' \
    "$HOME/Desktop/TimeCapsule/" "$DEST_DIR/mobile-app/"

echo "🌐 Copying Web App (Next.js)..."

# Copy web app files (excluding node_modules, .next)
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    "$HOME/Desktop/TimeCapsule/timecapsule-web/" "$DEST_DIR/web-app/"

echo "✅ Done! Project organized at: $DEST_DIR"
echo ""
echo "📁 Structure:"
echo "   TimeCapsule-Rendu/"
echo "   ├── mobile-app/    (Expo React Native)"
echo "   └── web-app/       (Next.js)"
echo ""
echo "📋 To run mobile app:"
echo "   cd mobile-app && npm install && npx expo start"
echo ""
echo "📋 To run web app:"
echo "   cd web-app && npm install && npm run dev"
