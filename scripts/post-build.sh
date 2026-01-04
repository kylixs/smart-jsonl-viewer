#!/bin/bash

# Post-build script for Chrome extension

echo "Running post-build tasks..."

# Copy manifest.json to dist
cp public/manifest.json dist/

# Copy icons to dist
mkdir -p dist/icons
if [ -d "public/icons" ]; then
  cp -r public/icons/* dist/icons/
fi

echo "Post-build tasks completed!"
