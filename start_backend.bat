@echo off
title NullTicket Backend Server
color 0A
echo ========================================
echo   NullTicket Backend Server Launcher
echo ========================================
echo.

REM Check if conda is available
where conda >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Conda not found in PATH
    echo Please install Anaconda or Miniconda first
    pause
    exit /b 1
)

REM Activate conda base environment
echo [INFO] Activating conda environment...
call conda activate base
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate conda environment
    pause
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0backend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend directory not found
    pause
    exit /b 1
)

REM Check if data directory exists, create if not
if not exist "data" (
    echo [INFO] Creating data directory...
    mkdir data
)

REM Prompt for Groq API Key
echo.
echo ========================================
echo   API Configuration
echo ========================================
set /p GROQ_API_KEY="Enter your Groq API Key: "
if "%GROQ_API_KEY%"=="" (
    echo [ERROR] Groq API Key is required!
    pause
    exit /b 1
)

REM Export environment variable
set GROQ_API_KEY=%GROQ_API_KEY%

REM Set other default environment variables
set DEBUG=False
set DATABASE_URL=sqlite:///./data/tickets.db
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
set EMAIL_ENABLED=True
set GLPI_ENABLED=False
set SOLMAN_ENABLED=False

echo.
echo [INFO] Starting FastAPI server...
echo [INFO] Server will run at: http://127.0.0.1:8000
echo [INFO] API Documentation: http://127.0.0.1:8000/docs
echo [INFO] Dashboard: http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

REM Keep window open if server crashes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server crashed with exit code %ERRORLEVEL%
    pause
)
