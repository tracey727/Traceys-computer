@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  pause
  exit /b 1
)
call npm test
if errorlevel 1 goto failed
call npm run check
if errorlevel 1 goto failed
echo.
echo All automated checks passed. This folder is ready to upload to GitHub.
pause
exit /b 0
:failed
echo.
echo A check failed. Read the error above before deploying.
pause
exit /b 1
