@echo off 
chcp 65001 > nul 
if "%~1"=="" ( 
    echo 使用方法: convert_pdf.bat input.pdf [output.csv] 
    echo 例: convert_pdf.bat medical_book.pdf medical_terms.csv 
    pause 
    exit /b 1 
) 
set output=%~2 
if "%output%"=="" set output=%~n1.csv 
echo 🔄 PDF変換を開始します... 
python pdf_to_csv.py "%~1" "%output%" 
if %errorLevel% equ 0 ( 
    echo 変換完了: %output% 
) else ( 
    echo 変換に失敗しました 
) 
pause 
