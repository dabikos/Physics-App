@echo off
chcp 65001 >nul
echo Checking git status...
git --no-pager status

echo.
echo Removing unused files...
rmdir /s /q "Chat" 2>nul
rmdir /s /q "Storage" 2>nul
del /f /q "model.patch" 2>nul
del /f /q "tests\__init__.py" 2>nul

echo.
echo Adding changes to git...
git add -A

echo.
echo Creating commit...
git commit -m "Clean up unused files and directories" -m "- Remove Chat/ directory (1.6 MB chat logs)" -m "- Remove Storage/ directory (7.0 MB unused video)" -m "- Remove model.patch (historical patch file)" -m "- Remove tests/__init__.py (empty file)" -m "" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo Done!
git --no-pager log -1 --stat

pause
