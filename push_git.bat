@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% --version >nul 2>&1
if errorlevel 1 (
   set GIT=git
)

%GIT% remote add origin https://github.com/sergey0451-qwer/holly-breath.git
%GIT% branch -M main
%GIT% push -u origin main
