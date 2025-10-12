@echo off
title NullTicket - Launch All Services
color 0E
echo ========================================
echo   NullTicket Complete System Launcher
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo in separate terminal windows.
echo.
echo Make sure you have:
echo   [x] Anaconda/Miniconda installed
echo   [x] Node.js installed
echo   [x] Groq API Key ready
echo.
pause

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Launch Backend in new window
echo [INFO] Launching Backend Server...
start "NullTicket Backend" cmd /k "cd /d "%SCRIPT_DIR%" && start_backend.bat"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Launch Frontend in new window
echo [INFO] Launching Frontend Server...
start "NullTicket Frontend" cmd /k "cd /d "%SCRIPT_DIR%" && start_frontend.bat"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Check the separate terminal windows for status.
echo You can close this window now.
echo.
pause
