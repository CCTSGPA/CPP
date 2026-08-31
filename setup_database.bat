@echo off
REM ============================================================================
REM  CivicWatch Database Setup Script for Windows
REM  This script sets up MySQL database and imports schema files
REM ============================================================================

echo.
echo ============================================================================
echo  CivicWatch Local Database Setup
echo ============================================================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL is not installed or not in PATH.
    echo Please install MySQL 8.0 or add it to your system PATH.
    echo.
    echo MySQL can be downloaded from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo [1/6] MySQL found. Proceeding with database setup...
echo.

REM Get MySQL root password
set /p MYSQL_ROOT_PASSWORD="Enter MySQL root password (press Enter if no password): "
if "%MYSQL_ROOT_PASSWORD%"=="" (
    set MYSQL_PASS_OPTION=
) else (
    set MYSQL_PASS_OPTION=-p%MYSQL_ROOT_PASSWORD%
)

REM Change to project directory
cd /d "%~dp0"

REM Step 1: Run setup script to create database and user
echo [2/6] Creating database and user...
mysql -u root %MYSQL_PASS_OPTION% < setup_db.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database and user
    pause
    exit /b 1
)
echo [2/6] DONE: Database and user created successfully
echo.

REM Step 2: Import SQL schema files in order
echo [3/6] Importing users schema...
mysql -u ccts_user -pccts_password corruption_db < corruption_db_users.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to import users schema
    pause
    exit /b 1
)
echo [3/6] DONE: Users schema imported
echo.

echo [4/6] Importing complaints schema...
mysql -u ccts_user -pccts_password corruption_db < corruption_db_complaints.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to import complaints schema
    pause
    exit /b 1
)
echo [4/6] DONE: Complaints schema imported
echo.

echo [5/6] Importing download forms schema...
mysql -u ccts_user -pccts_password corruption_db < corruption_db_download_forms.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to import download forms schema
    pause
    exit /b 1
)
echo [5/6] DONE: Download forms schema imported
echo.

echo [6/6] Importing status history schema...
mysql -u ccts_user -pccts_password corruption_db < corruption_db_status_history.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to import status history schema
    pause
    exit /b 1
)
echo [6/6] DONE: Status history schema imported
echo.

echo ============================================================================
echo  Database Setup Complete!
echo ============================================================================
echo.
echo Connection Details:
echo   Host: localhost
echo   Port: 3306
echo   Database: corruption_db
echo   Username: ccts_user
echo   Password: ccts_password
echo.
echo The .env file has been created with these credentials.
echo You can now start the Spring Boot application!
echo.
pause
