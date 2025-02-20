const runner = `
@echo off
REM ========= Ensure Administrator Rights =========
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /B
)
echo Running with administrative privileges.
echo.

REM ========= Check and Install Chocolatey =========
echo Checking if Chocolatey is installed...
where choco >nul 2>&1
if errorlevel 1 (
    echo Chocolatey not found. Installing Chocolatey...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
) else (
    echo Chocolatey is already installed.
)
echo.

REM ========= Check and Install Git =========
echo Checking if Git is installed...
where git >nul 2>&1
if errorlevel 1 (
    echo Git not found. Installing Git...
    choco install git -y
) else (
    echo Git is already installed.
)
echo.

REM ========= Check and Install Node.js =========
echo Checking if Node.js is installed...
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Installing Node.js...
    choco install nodejs -y
) else (
    echo Node.js is already installed.
)
echo.
REM Note: Installing Node.js via Chocolatey bundles npm by default.

REM ========= Clone the Repository =========
set "REPO_DIR=%APPDATA%\\com.mindcraft.app"
if not exist "%REPO_DIR%" (
    echo Directory "%REPO_DIR%" does not exist. Creating it...
    mkdir "%REPO_DIR%"
    echo Cloning repository (branch desktop-app) into "%REPO_DIR%"...
    git clone -b desktop-app https://github.com/Vinamra7/mindcraft.git "%REPO_DIR%"
) else (
    echo Directory "%REPO_DIR%" already exists. Skipping clone.
)
echo.

REM ========= Install Dependencies and Run the App =========
cd /d "%REPO_DIR%"
echo Running npm install...
npm i

echo Starting application with node...

  `

// const test = 
// `echo `

export function command() {
    return runner;
};