@echo off
echo Starting Jira Lite MVP Backend...
echo.

REM Activate virtual environment if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run the server
python main.py
