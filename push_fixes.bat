@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% --version >nul 2>&1
if errorlevel 1 (
   set GIT=git
)

%GIT% add .
%GIT% commit -m "Fix Vercel deploy: Safe Firebase & Global Error Boundaries"
%GIT% push
