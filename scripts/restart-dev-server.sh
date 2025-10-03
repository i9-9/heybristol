#!/bin/bash

echo "🧹 Cleaning Next.js cache and restarting development server..."
echo "=============================================================="

# Stop any running development server
echo "🛑 Stopping any running development server..."
pkill -f "next dev" || true

# Clean Next.js cache
echo "🧹 Cleaning .next directory..."
rm -rf .next

# Clean node_modules cache (optional, but can help)
echo "🧹 Cleaning node_modules cache..."
rm -rf node_modules/.cache

# Wait a moment
echo "⏳ Waiting 2 seconds..."
sleep 2

# Start development server
echo "🚀 Starting development server..."
npm run dev
