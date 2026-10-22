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

set rootPath=%scriptPath%..\..
set cachePath=%rootPath%\.cache
set buildPath=%rootPath%\build

:: Download electron release
start /b /wait "" "node.exe" %rootPath%\scripts\download-electron\download-electron.js

:: Copy electron release
xcopy /i /e /y "%cachePath%\artefacts\electron" "%buildPath%\framework" >nul 2>nul

:: Copy resources
rmdir /s /q "%buildPath%\resources" >nul 2>nul
xcopy /i /e /y "%rootPath%\resources" "%buildPath%\resources" >nul 2>nul

:: Copy launcher
copy /y "%rootPath%\scripts\launcher\launcher.cmd" "%rootPath%\build\openpkw.cmd" >nul 2>nul
