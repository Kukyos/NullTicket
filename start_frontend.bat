@echo off
title NullTicket Frontend Server
color 0B
echo ========================================
echo   NullTicket Frontend Server Launcher
echo ========================================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found in PATH
    echo Please install Node.js first: https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd /d "%~dp0frontend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend directory not found
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting Next.js development server...
echo [INFO] Frontend will run at: http://localhost:3000 (or next available port)
echo [INFO] Make sure backend is running at: http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server
call npm run dev

REM Keep window open if server crashes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server crashed with exit code %ERRORLEVEL%
    pause
)
