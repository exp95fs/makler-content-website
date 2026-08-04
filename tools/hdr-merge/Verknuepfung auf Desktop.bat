@echo off
rem Legt eine Verknuepfung mit Symbol auf dem Desktop an.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Verknuepfung.ps1"
echo.
pause
