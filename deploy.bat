@echo off
REM لإخفاء الأوامر نفسها وجعل المخرجات أنظف

echo.
echo Pulling latest changes from GitHub...
git pull
REM (احتياطي) سحب أي تغييرات قد تكون حدثت على GitHub لضمان التوافق

echo.
echo Adding all modified files...
git add .
REM إضافة كل التغييرات التي قمت بها

echo.
set /p commitMessage="Enter a short description for your update: "
REM يطلب منك إدخال رسالة الوصف ويحفظها في متغير

echo.
echo Committing changes...
git commit -m "%commitMessage%"
REM حفظ التغييرات مع استخدام الرسالة التي أدخلتها

echo.
echo Pushing changes to GitHub...
git push
REM رفع كل شيء إلى GitHub

echo.
echo Update pushed successfully! Vercel will now deploy.
pause
REM إظهار رسالة نجاح وإيقاف النافذة مؤقتاً لتقرأها