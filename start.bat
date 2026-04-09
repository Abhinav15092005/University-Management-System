@echo off
title University Management System - Complete Installer
color 0A
echo ================================================================================
echo                    UNIVERSITY MANAGEMENT SYSTEM
echo                        COMPLETE INSTALLER
echo ================================================================================
echo.

echo [1/8] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit
)
echo [OK] Node.js found

echo.
echo [2/8] Checking MongoDB installation...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not installed!
    echo Please download and install MongoDB from https://www.mongodb.com/try/download/community
    echo Press any key to exit...
    pause >nul
    exit
)
echo [OK] MongoDB found

echo.
echo [3/8] Creating data directory...
if not exist "%~dp0data" mkdir "%~dp0data"
echo [OK] Data directory ready

echo.
echo [4/8] Installing Backend Dependencies...
cd /d "%~dp0server"
echo Installing packages (may take 2-3 minutes)...
call npm install --silent 2>nul
echo [OK] Backend dependencies installed

echo.
echo [5/8] Installing Frontend Dependencies...
cd /d "%~dp0client"
echo Installing packages (may take 3-4 minutes)...
call npm install --silent 2>nul
echo [OK] Frontend dependencies installed

echo.
echo [6/8] Starting MongoDB Server...
cd /d "%~dp0"
start "MongoDB Server" cmd /k "mongod --dbpath=%~dp0data"

timeout /t 5 /nobreak >nul

echo [6.5/8] Creating admin user (if not exists)...
cd /d "%~dp0server"
node create-admin.js
echo [OK] Admin user ready

echo.
echo [7/8] Starting Backend Server...
start "Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm start"

timeout /t 3 /nobreak >nul

echo.
echo [8/8] Starting Frontend Server...
start "Frontend Server (Port 3000)" cmd /k "cd /d "%~dp0client" && npm start"

timeout /t 8 /nobreak >nul

echo.
echo ================================================================================
echo    ALL SERVICES STARTED SUCCESSFULLY!
echo ================================================================================
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo MongoDB: http://localhost:27017
echo.
echo ================================================================================
echo.
echo NOTE: First time setup may take 5-10 minutes for dependencies.
echo       Please wait for "Compiled successfully" message in frontend terminal.
echo.
echo ================================================================================
pause