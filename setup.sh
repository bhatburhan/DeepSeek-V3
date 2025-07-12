#!/bin/bash

# Accountrix Setup Script
# This script helps you get started with the Accountrix app

echo "🔒 Setting up Accountrix - Privacy-First Account Session Manager"
echo "================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create assets directory if it doesn't exist
if [ ! -d "assets" ]; then
    mkdir -p assets
    echo "📁 Created assets directory"
    echo "   Please add your app icons and splash screen:"
    echo "   - assets/icon.png (1024x1024)"
    echo "   - assets/splash.png (1284x2778)"
    echo "   - assets/adaptive-icon.png (1024x1024)"
    echo "   - assets/favicon.png (32x32)"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
# OAuth Configuration
# Replace these with your actual OAuth client IDs

GOOGLE_CLIENT_ID=your_google_client_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id
APPLE_CLIENT_ID=your_apple_client_id

# Development Configuration
NODE_ENV=development
DEBUG=true
EOF
    echo "✅ .env file created"
    echo "   Please update the OAuth client IDs in .env file"
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
    echo "✅ Expo CLI installed"
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "1. 🔧 Configure OAuth credentials:"
echo "   - Update client IDs in .env file"
echo "   - Follow the OAuth setup guide in README-ACCOUNTRIX.md"
echo ""
echo "2. 🖼️  Add app assets:"
echo "   - Add app icons to assets/ directory"
echo "   - Use the sizes specified above"
echo ""
echo "3. 🚀 Start development:"
echo "   npm run ios     # Run on iOS simulator"
echo "   npm run android # Run on Android emulator"
echo "   npm run web     # Run as web app"
echo ""
echo "4. 📚 Read the documentation:"
echo "   - README-ACCOUNTRIX.md for complete setup guide"
echo "   - API documentation for OAuth integration"
echo ""
echo "🔒 Privacy Note: All user data is stored locally on device"
echo "   No cloud sync • No tracking • Complete privacy"
echo ""
echo "Happy coding! 🚀"