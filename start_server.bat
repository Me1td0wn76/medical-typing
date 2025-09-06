@echo off 
chcp 65001 > nul 
echo 医療用語タイピング練習アプリを起動中... 
set PORT=8000 
:check_port 
netstat -an | find ": " > nul 
if %errorLevel% equ 0 ( 
    set /a PORT+=1 
    goto check_port 
) 
echo ポート %PORT% で起動します 
echo Node.jsサーバーを使用します 
npx http-server -p %PORT% -c-1 
if %errorLevel% neq 0 ( 
    python -m http.server %PORT% 
) 
echo サーバーを停止しました 
pause 
