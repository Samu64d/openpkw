::
:: launcher.cmd
::

@echo off
setlocal enableextensions

:: Set variables
set rootPath=%~dp0

if "%rootPath:~-1%" == "\" (
	set rootPath=%rootPath:~0,-1%
)

:: Start electron
start "" "%rootPath%\framework\electron.exe" ./lib/Main.cjs
