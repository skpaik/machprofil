#!/usr/bin/env bash
# File: deploy.sh
# Purpose: Build Next.js static export and deploy to /docs for GitHub Pages Classic

set -e  # exit on first error

# Configuration
REPO_NAME="machprofil"
DOCS_DIR="docs"

echo "📦 Building Next.js in production mode..."
NODE_ENV=production npm run build

# Next.js output: export to 'out/' automatically because of output: 'export'
# Determine if basePath folder exists
BASE_PATH_DIR="out/$REPO_NAME"

if [ -d "$BASE_PATH_DIR" ]; then
  echo "📂 Flattening basePath folder to $DOCS_DIR..."
  rm -rf $DOCS_DIR/*
  cp -r $BASE_PATH_DIR/* $DOCS_DIR/
else
  echo "📂 Copying out/ to $DOCS_DIR..."
  rm -rf $DOCS_DIR/*
  cp -r out/* $DOCS_DIR/
fi

# Ensure .nojekyll to disable Jekyll processing
touch $DOCS_DIR/.nojekyll

# Commit & push
git add $DOCS_DIR
git commit -m "Deploy Next.js static export to GitHub Pages"
git push

echo "🚀 Deployment complete! Your site should be live at https://<username>.github.io/$REPO_NAME/"
