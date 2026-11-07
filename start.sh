#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "                Explainroo UI - Visual Explainer Studio"
echo "======================================================================"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "[INFO] Detected Node.js $(node -v)"

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] First time setup: Installing dependencies..."
    npm install
fi

# 3. Open browser after short delay
echo "[INFO] Launching Explainroo UI at http://localhost:3000..."
(sleep 2 && (command -v xdg-open &> /dev/null && xdg-open http://localhost:3000 || open http://localhost:3000) 2>/dev/null) &

# 4. Start dev server
npm run dev
