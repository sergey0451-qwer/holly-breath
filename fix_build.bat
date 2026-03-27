@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% --version >nul 2>&1
if errorlevel 1 (
   set GIT=git
)

%GIT% add .
%GIT% commit -m "Fix ChordEngine import for Vercel build"
%GIT% push
