#!/bin/bash
set -euo pipefail

# ============================================
#  JNUS Associates Ltd - One Click Deployment
# ============================================

# Ensure we're running from the script's directory (repo root)
cd "$(dirname "$0")"

# Helpers
say() { echo -e "$1"; }

# Check if commit message was provided
if [ "${1:-}" = "" ]; then
  say "❌ Please provide a commit message. Example:"
  say "./deploy.sh \"Updated services layout\""
  exit 1
fi

COMMIT_MSG="$1"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"

say "📁 Project directory: $(pwd)"
say "🌿 Current branch: ${BRANCH}"

# Make sure this is a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  say "❌ Not a git repository. Run this from your repo root."
  exit 1
}

# Step 1: Stage changes
say "📦 Staging changes..."
git add -A

# If nothing staged, exit cleanly
if git diff --cached --quiet; then
  say "ℹ️ No changes to commit. Working tree clean."
else
  # Step 2: Commit
  say "📝 Committing changes..."
  git commit -m "$COMMIT_MSG"
fi

# Step 3: Sync with remote (rebase to avoid merge commits)
say "🔄 Pulling latest updates (rebase)..."
git pull --rebase origin "$BRANCH"

# Step 4: Push
say "🚀 Pushing changes to GitHub..."
git push origin "$BRANCH"

# Step 5: Open live site (cache-buster)
say "🌐 Opening live site..."
URL="https://jnusassociates.com?nocache=$(date +%s)"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  say "🌍 Please open this URL manually: $URL"
fi

say "✅ Deployment complete!"