@echo off
REM Todo API 测试脚本 (Windows 版本)

set BASE_URL=http://localhost:3000/api

echo =========================================
echo   Todo API 测试脚本
echo =========================================
echo.

:menu
echo.
echo 请选择测试:
echo 1) 获取待办列表
echo 2) 获取所有标签
echo 3) 创建待办事项
echo q) 退出
echo.
set /p choice="请输入选项: "

if "%choice%"=="1" goto get_todos
if "%choice%"=="2" goto get_tags
if "%choice%"=="3" goto create_todo
if "%choice%"=="q" goto end
if "%choice%"=="Q" goto end

echo 无效选项
pause
goto menu

:get_todos
echo.
echo 获取待办列表...
curl -s "%BASE_URL%/todos?page=1&pageSize=5"
echo.
pause
goto menu

:get_tags
echo.
echo 获取所有标签...
curl -s "%BASE_URL%/todos?action=tags"
echo.
pause
goto menu

:create_todo
echo.
echo 创建待办事项...
curl -s -X POST "%BASE_URL%/todos" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"测试任务 - 来自批处理\", \"priority\": \"high\", \"tags\": [\"批处理测试\", \"API\"]}"
echo.
pause
goto menu

:end
echo 再见！
