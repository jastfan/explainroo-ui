@echo off
setlocal enabledelayedexpansion
title Explainroo UI - Local Studio

echo ======================================================================
echo                 Explainroo UI - Visual Explainer Studio
echo ======================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please download and install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Display Node version
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [INFO] Detected Node.js !NODE_VERSION!

:: 3. Check and install dependencies if node_modules does not exist
if not exist "node_modules" (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Dependency installation failed!
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully!
)

:: 4. Launch in default browser
echo [INFO] Launching Explainroo UI at http://localhost:3000...
start "" "http://localhost:3000"

:: 5. Start dev server
call npm run dev

pause
