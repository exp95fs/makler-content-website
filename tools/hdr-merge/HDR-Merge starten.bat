@echo off
rem Startet die Oberflaeche von HDR Merge.
rem Ein Ordner kann auch direkt auf diese Datei gezogen werden.
setlocal
cd /d "%~dp0"

where pyw >nul 2>&1
if %errorlevel%==0 (
    start "" pyw "hdr_merge_gui.pyw" "%~1"
    exit /b
)
where pythonw >nul 2>&1
if %errorlevel%==0 (
    start "" pythonw "hdr_merge_gui.pyw" "%~1"
    exit /b
)
where py >nul 2>&1
if %errorlevel%==0 (
    start "" py "hdr_merge_gui.pyw" "%~1"
    exit /b
)

echo.
echo Python wurde auf diesem Rechner nicht gefunden.
echo.
echo Bitte Python von https://www.python.org/downloads/ installieren
echo und dabei den Haken "Add python.exe to PATH" setzen.
echo.
pause
