#!/bin/bash
# ============================================
#  JNUS Associates Ltd - One Click Deployment
# ============================================

# Check if commit message was provided
if [ -z "$1" ]; then
  echo "❌ Please provide a commit message. Example:"
  echo "./deploy.sh 'Updated services layout'"
  exit 1
fi

# Step 1: Ensure you’re in the right folder
echo "📁 Navigating to project directory..."
cd "$(dirname "$0")" || exit

# Step 2: Stage all modified files
echo "📦 Staging changes..."
git add .

# Step 3: Commit with your message
echo "📝 Committing changes..."
git commit -m "$1"

# Step 4: Pull latest updates (avoid merge issues)
echo "🔄 Pulling latest updates..."
git pull origin main --rebase

# Step 5: Push to GitHub
echo "🚀 Pushing changes to GitHub..."
git push origin main

# Step 6: Open GitHub Pages live site with cache-buster
echo "🌐 Opening live site..."
URL="https://jnusassociates.com?nocache=$(date +%s)"
if command -v open &> /dev/null; then
  open "$URL"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$URL"
else
  echo "🌍 Please open this URL manually: $URL"
fi

echo "✅ Deployment complete!"