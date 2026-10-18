@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ChatGPT 6.1 sol MV - 1080p 60 FPS Export

rem Put this CMD beside package.json, then double-click it on Windows.
pushd "%~dp0"
if errorlevel 1 goto folder_error
if not exist "package.json" goto wrong_folder

echo ============================================================
echo   world.execute(me); - ChatGPT Edition
echo   Model: ChatGPT 6.1 sol
echo   Export: 1920 x 1080 / 60 FPS / H.264 + AAC
echo ============================================================
echo.
echo This may take a long time. Keep this window open.
echo The MV contains flashing images (about 2:33 - 3:17).
echo.

where node >nul 2>&1
if errorlevel 1 goto no_node
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" >nul 2>&1
if errorlevel 1 goto no_node
where npm.cmd >nul 2>&1
if errorlevel 1 goto no_npm

if exist "node_modules\playwright-core\package.json" goto deps_ready
echo [1/3] Installing project dependencies on first run...
call npm ci
if errorlevel 1 goto install_failed
goto deps_checked
:deps_ready
echo [1/3] Dependencies are present.
:deps_checked

echo.
echo [2/3] Checking audio and lyric files...
node -e "const fs=require('fs'), c=require('./config.json'); for(const k of ['audio','lrc']) if(!fs.existsSync(c.paths[k])) {console.error('Missing '+k+': '+c.paths[k]); process.exitCode=1;}"
if errorlevel 1 goto missing_media
call npm run lyrics
if errorlevel 1 goto bad_lyrics

if not exist "out\preview_1080p60.mp4" goto output_ready
echo.
echo WARNING: out\preview_1080p60.mp4 already exists.
choice /C YN /M "Overwrite this file"
if errorlevel 2 goto canceled
:output_ready

echo.
echo [3/3] Rendering the full 1080p60 MP4...
call npm run export:preview
if errorlevel 1 goto export_failed

echo.
echo ============================================================
echo   EXPORT COMPLETED SUCCESSFULLY
echo   File: %CD%\out\preview_1080p60.mp4
echo ============================================================
goto finish

:wrong_folder
echo ERROR: Place this CMD inside the MV project folder, next to package.json.
goto failed
:folder_error
echo ERROR: Cannot enter the folder containing this CMD.
goto failed
:no_node
echo ERROR: Node.js 20 or newer is required.
echo Install it from https://nodejs.org/ , then double-click this CMD again.
goto failed
:no_npm
echo ERROR: npm is missing. Reinstall Node.js with npm included.
goto failed
:install_failed
echo ERROR: Could not install project dependencies. Check the messages above.
goto failed
:missing_media
echo ERROR: Audio or lyric file is missing from the project.
goto failed
:bad_lyrics
echo ERROR: Lyric alignment failed. Check the messages above.
goto failed
:export_failed
echo ERROR: Rendering failed. Make sure Chrome or Edge and ffmpeg are available.
echo See the messages above for details.
goto failed
:canceled
echo Export canceled. Your previous video was not overwritten.
goto finish
:failed
echo.
echo Please resolve the error and run this CMD again.
:finish
popd
echo.
pause
endlocal
