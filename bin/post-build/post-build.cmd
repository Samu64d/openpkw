::
:: post-build.cmd
::

@echo off
setlocal enableextensions

:: Set variables
set scriptPath=%~dp0

if "%rootPath:~-1%" == "\" (
	set scriptPath=%scriptPath:~0,-1%
)

set rootPath=%scriptPath%\..\..\

:: Copy electron release
xcopy /i /e /y "%rootPath%\bin\electron" "%rootPath%\build\framework" >nul 2>nul

:: Copy resources
rmdir /s /q "%rootPath%\build\resources" >nul 2>nul
xcopy /i /e /y "%rootPath%\resources" "%rootPath%\build\resources" >nul 2>nul

:: Copy launcher
copy /y "%rootPath%\bin\launcher\launcher.cmd" "%rootPath%\build\openpkw.cmd" >nul 2>nul
