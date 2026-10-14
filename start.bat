@echo off
title DataQuest Arcade
echo ========================================================
echo   Starting DataQuest Arcade (Gamified Data Science Lab)
echo ========================================================
echo.
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000"
node server.js
pause
