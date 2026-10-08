@echo off
:: ============================================================
::  Appointment Scheduler - Build Script (Windows)
::  Requirements: MinGW g++ with pthread and sqlite3
:: ============================================================
echo Building Appointment Scheduler...

:: Check for g++
where g++ >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: g++ not found. Please install MinGW-w64 and ensure g++ is in PATH.
    echo Download: https://www.mingw-w64.org/downloads/
    exit /b 1
)

:: Check for sqlite3 dev library
where pkg-config >nul 2>nul
if %errorlevel% equ 0 (
    pkg-config --exists sqlite3 2>nul
    if %errorlevel% equ 0 (
        echo Found sqlite3 via pkg-config
        set LDFLAGS=
        for /f "tokens=1" %%p in ('pkg-config --libs sqlite3 2>nul') do set LDFLAGS=%%p
    )
)

if "%LDFLAGS%"=="" (
    echo Installing SQLite3 development headers...
    echo Please install: apt-get install libsqlite3-dev (Linux)
    echo or: brew install sqlite3 (Mac)
    exit /b 1
)

echo Linking with: %LDFLAGS%

:: Compile
g++ -std=c++17 -O2 -o appointment-scheduler.exe server.cpp database.cpp %LDFLAGS%
if %errorlevel% neq 0 (
    echo.
    echo BUILD FAILED
    exit /b 1
)

echo.
echo BUILD SUCCESSFUL
echo.
echo To run, execute: appointment-scheduler.exe [port]
echo Default port: 8080
echo Open browser to: http://localhost:8080
echo.
