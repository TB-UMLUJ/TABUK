@echo off
REM #############################################################
REM #   This script simplifies updating your live website.      #
REM #   It adds, commits, and pushes your changes to GitHub,    #
REM #   which then triggers an automatic deployment on Vercel.  #
REM #############################################################

echo.
echo Pulling latest changes from GitHub...
git pull

echo.
echo Adding all modified files...
git add .

echo.
set /p commitMessage="Enter a short description for your update (e.g., 'updated text'): "

echo.
echo Committing changes...
git commit -m "%commitMessage%"

echo.
echo Pushing changes to GitHub...
git push

echo.
echo =======================================================
echo  Update pushed successfully! 
echo  Vercel will now start deploying the new version.
echo  Your site will be updated in about a minute.
echo =======================================================
echo.
pause