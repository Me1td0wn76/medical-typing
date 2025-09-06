@echo off 
chcp 65001 > nul 
echo PDF変換GUIを起動中... 
python pdf_to_csv_gui.py 
if %errorLevel% neq 0 ( 
    echo GUI起動に失敗しました 
    pause 
) 
