@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the current Node.js LTS version, then run this file again.
  pause
  exit /b 1
)
if not exist .env.local (
  copy .env.example .env.local >nul
  echo A new .env.local file has been created.
  echo Add at least one API key, save the file, then run START-GENEVIEVE.bat again.
  notepad .env.local
  pause
  exit /b 0
)
echo Starting GENEVIEVE Super Response...
start "" http://localhost:3000
node server.mjs
if errorlevel 1 pause
