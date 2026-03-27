@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% --version >nul 2>&1
if errorlevel 1 (
   echo Git not found at default location. Assuming it's in PATH.
   set GIT=git
)

%GIT% init
%GIT% config user.name "Holy Architect"
%GIT% config user.email "architect@holybreath.ai"
%GIT% add .
%GIT% commit -m "Initial commit"
