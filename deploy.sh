#!/bin/bash

# Deployment script for Simply QR to Cloudflare Pages

echo "🚀 Simply QR - Cloudflare Deployment Script"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "   Run: git init"
    exit 1
fi

# Show current status
echo "📊 Current Git Status:"
git status --short
echo ""

# Ask for confirmation
read -p "Do you want to commit and push to GitHub? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Deployment cancelled"
    exit 0
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "feat: complete QR code management platform with Cloudflare integration

- Next.js 15 application with TypeScript
- Clerk authentication integration
- Cloudflare D1 database (SQLite)
- Cloudflare R2 storage for QR codes
- Complete analytics dashboard
- QR code generation with customization
- Scan tracking system
- Responsive UI with Tailwind CSS"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "❌ No remote 'origin' configured"
    echo "   Add remote: git remote add origin <your-repo-url>"
    exit 1
fi

# Push to GitHub
echo "🚢 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Navigate to Workers & Pages > simply-qr"
echo "3. Click 'Connect to Git'"
echo "4. Select your GitHub repository"
echo "5. Configure build settings:"
echo "   - Build command: npm run build"
echo "   - Build output: .next"
echo "6. Add environment variables (see CLOUDFLARE_DEPLOYMENT_STATUS.md)"
echo "7. Add D1 and R2 bindings"
echo "8. Click 'Save and Deploy'"
echo ""
echo "📚 For detailed instructions, see: CLOUDFLARE_DEPLOYMENT_STATUS.md"
echo ""
echo "🎉 Your app will be live at: https://simply-qr.pages.dev"
