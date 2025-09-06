@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

REM 医療用語PDF to CSV変換ツール - Windows用セットアップ
REM 使用方法: setup_windows.bat

echo.
echo ┌─────────────────────────────────────────────────┐
echo │     医療用語タイピング練習アプリ              │
echo │     Windows セットアップスクリプト              │
echo └─────────────────────────────────────────────────┘
echo.

REM 管理者権限チェック
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 管理者権限で実行してください
    echo PowerShellを管理者として実行し、以下を実行してください:
    echo    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    pause
    exit /b 1
)

REM Python の確認
echo 🔍 Python3の確認中...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Pythonがインストールされていません
    echo 以下のURLからPythonをダウンロードしてインストールしてください:
    echo    https://www.python.org/downloads/
    echo    "Add Python to PATH" にチェックを入れてください
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo %%i が見つかりました
)

REM pip の確認
echo pipの確認中...
pip --version >nul 2>&1
if %errorLevel% neq 0 (
    echo pipが利用できません
    echo Pythonを再インストールしてください（"Add Python to PATH" を有効に）
    pause
    exit /b 1
) else (
    echo pipが利用可能です
)

REM 必要なPythonパッケージのインストール
echo.
echo 必要なPythonパッケージをインストール中...

echo   - PyPDF2をインストール中...
pip install PyPDF2
if %errorLevel% neq 0 (
    echo PyPDF2のインストールに失敗しました
    pause
    exit /b 1
)
echo PyPDF2のインストール完了

echo   - pykakasiをインストール中...
pip install pykakasi
if %errorLevel% neq 0 (
    echo pykakasiのインストールに失敗しました
    pause
    exit /b 1
)
echo pykakasiのインストール完了

REM 追加パッケージのインストール確認
echo.
set /p install_extra="📦 追加パッケージをインストールしますか？ (pandas, openpyxl, requests) [y/N]: "
if /i "!install_extra!"=="y" (
    echo 📦 追加パッケージをインストール中...
    pip install pandas openpyxl requests
    if !errorLevel! equ 0 (
        echo 追加パッケージのインストール完了
    ) else (
        echo 一部の追加パッケージのインストールに失敗しましたが、基本機能は使用可能です
    )
)

REM Node.js の確認（HTTPサーバー用）
echo.
echo Node.jsの確認中...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.jsが見つかりません
    echo 以下のURLからNode.jsをダウンロードしてインストールすることをお勧めします:
    echo    https://nodejs.org/
    set nodejs_available=false
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i が見つかりました
    set nodejs_available=true
)

REM プロジェクトディレクトリの確認
echo.
echo プロジェクトディレクトリ: %CD%
if not exist "index.html" (
    echo index.htmlが見つかりません
    echo このスクリプトは医療用語タイピングアプリのディレクトリで実行してください
    pause
    exit /b 1
)

REM バッチファイル作成
echo.
echo 🔧 便利なバッチファイルを作成中...

REM PDF変換バッチファイル
echo @echo off > convert_pdf.bat
echo chcp 65001 ^> nul >> convert_pdf.bat
echo if "%%~1"=="" ( >> convert_pdf.bat
echo     echo 使用方法: convert_pdf.bat input.pdf [output.csv] >> convert_pdf.bat
echo     echo 例: convert_pdf.bat medical_book.pdf medical_terms.csv >> convert_pdf.bat
echo     pause >> convert_pdf.bat
echo     exit /b 1 >> convert_pdf.bat
echo ^) >> convert_pdf.bat
echo set output=%%~2 >> convert_pdf.bat
echo if "%%output%%"=="" set output=%%~n1.csv >> convert_pdf.bat
echo echo 🔄 PDF変換を開始します... >> convert_pdf.bat
echo python pdf_to_csv.py "%%~1" "%%output%%" >> convert_pdf.bat
echo if %%errorLevel%% equ 0 ( >> convert_pdf.bat
echo     echo 変換完了: %%output%% >> convert_pdf.bat
echo ^) else ( >> convert_pdf.bat
echo     echo 変換に失敗しました >> convert_pdf.bat
echo ^) >> convert_pdf.bat
echo pause >> convert_pdf.bat

echo convert_pdf.bat を作成しました

REM PDF GUI起動バッチファイル
echo @echo off > start_pdf_gui.bat
echo chcp 65001 ^> nul >> start_pdf_gui.bat
echo echo PDF変換GUIを起動中... >> start_pdf_gui.bat
echo python pdf_to_csv_gui.py >> start_pdf_gui.bat
echo if %%errorLevel%% neq 0 ( >> start_pdf_gui.bat
echo     echo GUI起動に失敗しました >> start_pdf_gui.bat
echo     pause >> start_pdf_gui.bat
echo ^) >> start_pdf_gui.bat

echo start_pdf_gui.bat を作成しました

REM Webサーバー起動バッチファイル
echo @echo off > start_server.bat
echo chcp 65001 ^> nul >> start_server.bat
echo echo 医療用語タイピング練習アプリを起動中... >> start_server.bat
echo set PORT=8000 >> start_server.bat
echo :check_port >> start_server.bat
echo netstat -an ^| find ":%PORT% " ^> nul >> start_server.bat
echo if %%errorLevel%% equ 0 ( >> start_server.bat
echo     set /a PORT+=1 >> start_server.bat
echo     goto check_port >> start_server.bat
echo ^) >> start_server.bat
echo echo ポート %%PORT%% で起動します >> start_server.bat
if "!nodejs_available!"=="true" (
    echo echo Node.jsサーバーを使用します >> start_server.bat
    echo npx http-server -p %%PORT%% -c-1 >> start_server.bat
    echo if %%errorLevel%% neq 0 ( >> start_server.bat
) else (
    echo echo Pythonサーバーを使用します >> start_server.bat
)
echo     python -m http.server %%PORT%% >> start_server.bat
if "!nodejs_available!"=="true" (
    echo ^) >> start_server.bat
)
echo echo サーバーを停止しました >> start_server.bat
echo pause >> start_server.bat

echo start_server.bat を作成しました

REM インストール確認
echo.
echo インストール確認を実行中...
python -c "import PyPDF2, pykakasi; print('✅ PyPDF2: OK'); print('✅ pykakasi: OK'); print('🎉 すべての依存関係が正常にインストールされました!')" 2>nul
if %errorLevel% neq 0 (
    echo インストール確認に失敗しました
    echo Pythonパッケージの再インストールを試してください
    pause
    exit /b 1
)

REM デスクトップショートカット作成（オプション）
echo.
set /p create_shortcut="デスクトップショートカットを作成しますか？ [y/N]: "
if /i "!create_shortcut!"=="y" (
    echo Set oWS = WScript.CreateObject("WScript.Shell"^) > create_shortcut.vbs
    echo sLinkFile = "%USERPROFILE%\Desktop\医療用語タイピング.lnk" >> create_shortcut.vbs
    echo Set oLink = oWS.CreateShortcut(sLinkFile^) >> create_shortcut.vbs
    echo oLink.TargetPath = "%CD%\start_server.bat" >> create_shortcut.vbs
    echo oLink.WorkingDirectory = "%CD%" >> create_shortcut.vbs
    echo oLink.Description = "医療用語タイピング練習アプリ" >> create_shortcut.vbs
    echo oLink.Save >> create_shortcut.vbs
    
    cscript create_shortcut.vbs >nul 2>&1
    del create_shortcut.vbs >nul 2>&1
    
    if exist "%USERPROFILE%\Desktop\医療用語タイピング.lnk" (
        echo デスクトップショートカットを作成しました
    ) else (
        echo ショートカット作成に失敗しましたが、アプリは正常に動作します
    )
)

REM セットアップ完了
echo.
echo セットアップが完了しました！
echo.
echo ┌─────────────────────────────────────────────────┐
echo │ 使用方法                                     │
echo ├─────────────────────────────────────────────────┤
echo │ タイピング練習アプリ:                       │
echo │   start_server.bat をダブルクリック             │
echo │                                                 │
echo │ PDF変換（コマンドライン）:                  │
echo │   convert_pdf.bat input.pdf output.csv         │
echo │                                                 │
echo │ PDF変換（GUI）:                            │
echo │   start_pdf_gui.bat をダブルクリック            │
echo └─────────────────────────────────────────────────┘
echo.
echo ヒント:
echo   - PDFファイルは日本語テキストが含まれている必要があります
echo   - 生成されたCSVファイルはタイピングアプリで読み込み可能です
echo   - ファイアウォールの警告が出た場合は「アクセスを許可する」を選択してください
echo.

REM 自動起動確認
set /p auto_start="今すぐタイピング練習アプリを起動しますか？ [y/N]: "
if /i "!auto_start!"=="y" (
    echo アプリを起動中...
    start start_server.bat
    timeout /t 3 /nobreak >nul
    echo ブラウザで http://localhost:8000 にアクセスしてください
)

echo.
echo セットアップスクリプトが完了しました！
pause
