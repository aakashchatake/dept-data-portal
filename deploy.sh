#!/bin/bash

# Department Data Portal - Easy Deployment Script
# This script helps you deploy to Vercel

echo "🚀 Department Data Portal - Deployment Helper"
echo "=============================================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the react-dept-portal directory"
    exit 1
fi

echo "📦 Step 1: Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📤 Step 2: Deployment Options"
echo ""
echo "Choose your deployment method:"
echo ""
echo "A) Vercel (via Browser - Easiest)"
echo "   1. Go to https://vercel.com"
echo "   2. Sign in"
echo "   3. Click 'Add New' → 'Project'"
echo "   4. Drag and drop this folder: $(pwd)"
echo "   5. Click 'Deploy'"
echo ""
echo "B) Netlify (via Browser - Very Easy)"
echo "   1. Go to https://netlify.com"
echo "   2. Sign in"
echo "   3. Drag and drop the 'build' folder"
echo "   4. Done!"
echo ""
echo "C) Firebase Hosting (via CLI)"
echo "   Run: firebase login"
echo "   Then: firebase init hosting"
echo "   Then: firebase deploy"
echo ""
echo "✅ Production build is ready in: $(pwd)/build"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy using one of the methods above"
echo "2. Set up Firebase (see FIREBASE_SETUP.md)"
echo "3. Update public/config.js with your Firebase credentials"
echo "4. Rebuild and redeploy: npm run build"
echo ""
echo "🔗 Your deployed app will be at:"
echo "   - Vercel: https://your-app.vercel.app"
echo "   - Netlify: https://your-app.netlify.app"
echo "   - Firebase: https://your-project.web.app"
echo ""
echo "✨ All ready! Check DEPLOY_NOW.md for detailed instructions."
