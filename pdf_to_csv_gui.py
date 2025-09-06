#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PDF to CSV Converter GUI
医療用語PDFからCSV変換 - GUIバージョン

このプログラムはPDFファイルから医療用語を抽出し、
タイピング練習用のCSVファイルに変換するGUIアプリケーションです。

使用方法:
    python3 pdf_to_csv_gui.py

依存関係:
    pip install PyPDF2 pykakasi tkinter
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
import queue
from pathlib import Path
import sys
import os

# pdf_to_csv.pyからMedicalTermExtractorクラスをインポート
try:
    from pdf_to_csv import MedicalTermExtractor
except ImportError:
    print("pdf_to_csv.pyが見つかりません。同じディレクトリに配置してください。")
    sys.exit(1)


class PDFConverterGUI:
    """PDF to CSV変換GUIアプリケーション"""
    
    def __init__(self, root):
        """初期化"""
        self.root = root
        self.root.title("医療用語 PDF → CSV 変換ツール")
        self.root.geometry("800x600")
        self.root.minsize(600, 400)
        
        # アイコン設定（可能な場合）
        try:
            self.root.iconbitmap('medical_icon.ico')
        except:
            pass
        
        # キューとスレッド管理
        self.queue = queue.Queue()
        self.processing = False
        
        # 医療用語抽出器
        self.extractor = None
        
        # UI作成
        self.create_widgets()
        self.setup_layout()
        
        # キューチェック開始
        self.check_queue()

    def create_widgets(self):
        """ウィジェット作成"""
        # メインフレーム
        self.main_frame = ttk.Frame(self.root, padding="10")
        
        # タイトル
        self.title_label = ttk.Label(
            self.main_frame,
            text="医療用語 PDF → CSV 変換ツール",
            font=("Arial", 16, "bold")
        )
        
        # ファイル選択フレーム
        self.file_frame = ttk.LabelFrame(self.main_frame, text="📁 ファイル選択", padding="10")
        
        # 入力ファイル
        self.input_label = ttk.Label(self.file_frame, text="入力PDFファイル:")
        self.input_var = tk.StringVar()
        self.input_entry = ttk.Entry(self.file_frame, textvariable=self.input_var, width=50)
        self.input_button = ttk.Button(self.file_frame, text="参照...", command=self.select_input_file)
        
        # 出力ファイル
        self.output_label = ttk.Label(self.file_frame, text="出力CSVファイル:")
        self.output_var = tk.StringVar()
        self.output_entry = ttk.Entry(self.file_frame, textvariable=self.output_var, width=50)
        self.output_button = ttk.Button(self.file_frame, text="参照...", command=self.select_output_file)
        
        # オプションフレーム
        self.options_frame = ttk.LabelFrame(self.main_frame, text="⚙️ オプション", padding="10")
        
        # 最小文字数
        self.min_length_label = ttk.Label(self.options_frame, text="最小文字数:")
        self.min_length_var = tk.StringVar(value="2")
        self.min_length_entry = ttk.Entry(self.options_frame, textvariable=self.min_length_var, width=10)
        
        # 最大文字数
        self.max_length_label = ttk.Label(self.options_frame, text="最大文字数:")
        self.max_length_var = tk.StringVar(value="10")
        self.max_length_entry = ttk.Entry(self.options_frame, textvariable=self.max_length_var, width=10)
        
        # 重複除去
        self.unique_var = tk.BooleanVar(value=True)
        self.unique_check = ttk.Checkbutton(self.options_frame, text="重複用語を除去", variable=self.unique_var)
        
        # ソート
        self.sort_var = tk.BooleanVar(value=True)
        self.sort_check = ttk.Checkbutton(self.options_frame, text="文字数順にソート", variable=self.sort_var)
        
        # 実行ボタンフレーム
        self.button_frame = ttk.Frame(self.main_frame)
        self.convert_button = ttk.Button(
            self.button_frame,
            text="変換開始",
            command=self.start_conversion,
            style="Accent.TButton"
        )
        self.clear_button = ttk.Button(self.button_frame, text="🗑️ クリア", command=self.clear_all)
        
        # プログレスバー
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            self.main_frame,
            variable=self.progress_var,
            maximum=100,
            mode='determinate'
        )
        
        # ログフレーム
        self.log_frame = ttk.LabelFrame(self.main_frame, text="📋 変換ログ", padding="10")
        self.log_text = scrolledtext.ScrolledText(
            self.log_frame,
            height=10,
            width=70,
            wrap=tk.WORD,
            state=tk.DISABLED
        )
        
        # 結果フレーム
        self.result_frame = ttk.LabelFrame(self.main_frame, text="📊 変換結果", padding="10")
        self.result_text = scrolledtext.ScrolledText(
            self.result_frame,
            height=8,
            width=70,
            wrap=tk.WORD,
            state=tk.DISABLED
        )

    def setup_layout(self):
        """レイアウト設定"""
        # メインフレーム
        self.main_frame.grid(row=0, column=0, sticky="nsew")
        
        # グリッド重み設定
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        self.main_frame.columnconfigure(0, weight=1)
        
        # タイトル
        self.title_label.grid(row=0, column=0, pady=(0, 20))
        
        # ファイル選択フレーム
        self.file_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        self.file_frame.columnconfigure(1, weight=1)
        
        # 入力ファイル
        self.input_label.grid(row=0, column=0, sticky="w", pady=(0, 5))
        self.input_entry.grid(row=0, column=1, sticky="ew", padx=(10, 5), pady=(0, 5))
        self.input_button.grid(row=0, column=2, pady=(0, 5))
        
        # 出力ファイル
        self.output_label.grid(row=1, column=0, sticky="w")
        self.output_entry.grid(row=1, column=1, sticky="ew", padx=(10, 5))
        self.output_button.grid(row=1, column=2)
        
        # オプションフレーム
        self.options_frame.grid(row=2, column=0, sticky="ew", pady=(0, 10))
        
        # オプション配置
        self.min_length_label.grid(row=0, column=0, sticky="w")
        self.min_length_entry.grid(row=0, column=1, padx=(5, 20))
        self.max_length_label.grid(row=0, column=2, sticky="w")
        self.max_length_entry.grid(row=0, column=3, padx=(5, 20))
        self.unique_check.grid(row=1, column=0, columnspan=2, sticky="w", pady=(5, 0))
        self.sort_check.grid(row=1, column=2, columnspan=2, sticky="w", pady=(5, 0))
        
        # ボタンフレーム
        self.button_frame.grid(row=3, column=0, pady=(0, 10))
        self.convert_button.grid(row=0, column=0, padx=(0, 10))
        self.clear_button.grid(row=0, column=1)
        
        # プログレスバー
        self.progress_bar.grid(row=4, column=0, sticky="ew", pady=(0, 10))
        
        # ログフレーム
        self.log_frame.grid(row=5, column=0, sticky="ew", pady=(0, 10))
        self.log_frame.columnconfigure(0, weight=1)
        self.log_text.grid(row=0, column=0, sticky="nsew")
        
        # 結果フレーム
        self.result_frame.grid(row=6, column=0, sticky="ew")
        self.result_frame.columnconfigure(0, weight=1)
        self.result_text.grid(row=0, column=0, sticky="nsew")
        
        # 行の重み設定
        self.main_frame.rowconfigure(5, weight=1)
        self.main_frame.rowconfigure(6, weight=1)

    def select_input_file(self):
        """入力ファイル選択"""
        filename = filedialog.askopenfilename(
            title="入力PDFファイルを選択",
            filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
        )
        if filename:
            self.input_var.set(filename)
            # 出力ファイル名を自動生成
            if not self.output_var.get():
                output_path = Path(filename).with_suffix('.csv')
                self.output_var.set(str(output_path))

    def select_output_file(self):
        """出力ファイル選択"""
        filename = filedialog.asksaveasfilename(
            title="出力CSVファイルを選択",
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        if filename:
            self.output_var.set(filename)

    def log_message(self, message):
        """ログメッセージ表示"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.root.update_idletasks()

    def show_result(self, result_text):
        """結果表示"""
        self.result_text.config(state=tk.NORMAL)
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, result_text)
        self.result_text.config(state=tk.DISABLED)

    def clear_all(self):
        """全てをクリア"""
        self.input_var.set("")
        self.output_var.set("")
        self.progress_var.set(0)
        
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        
        self.result_text.config(state=tk.NORMAL)
        self.result_text.delete(1.0, tk.END)
        self.result_text.config(state=tk.DISABLED)

    def validate_inputs(self):
        """入力値検証"""
        if not self.input_var.get():
            messagebox.showerror("エラー", "入力PDFファイルを選択してください")
            return False
        
        if not Path(self.input_var.get()).exists():
            messagebox.showerror("エラー", "入力ファイルが見つかりません")
            return False
        
        if not self.output_var.get():
            messagebox.showerror("エラー", "出力CSVファイルを指定してください")
            return False
        
        try:
            min_length = int(self.min_length_var.get())
            max_length = int(self.max_length_var.get())
            if min_length < 1 or max_length < min_length:
                raise ValueError()
        except ValueError:
            messagebox.showerror("エラー", "文字数の設定が正しくありません")
            return False
        
        return True

    def start_conversion(self):
        """変換開始"""
        if self.processing:
            messagebox.showwarning("警告", "変換処理中です。しばらくお待ちください。")
            return
        
        if not self.validate_inputs():
            return
        
        self.processing = True
        self.convert_button.config(state=tk.DISABLED)
        self.progress_var.set(0)
        
        # バックグラウンドで変換実行
        thread = threading.Thread(target=self.convert_pdf_worker)
        thread.daemon = True
        thread.start()

    def convert_pdf_worker(self):
        """変換ワーカー（別スレッド）"""
        try:
            # プログレス更新
            self.queue.put(("progress", 10))
            self.queue.put(("log", "変換準備中..."))
            
            # 医療用語抽出器初期化
            if not self.extractor:
                self.extractor = MedicalTermExtractor()
            
            self.queue.put(("progress", 20))
            self.queue.put(("log", "PDFファイルを読み込み中..."))
            
            # PDFからテキスト抽出
            text = self.extractor.extract_text_from_pdf(self.input_var.get())
            if not text:
                self.queue.put(("error", "PDFからテキストを抽出できませんでした"))
                return
            
            self.queue.put(("progress", 50))
            self.queue.put(("log", "医療用語を抽出中..."))
            
            # 医療用語抽出
            medical_terms = self.extractor.extract_medical_terms(text)
            if not medical_terms:
                self.queue.put(("error", "医療用語が見つかりませんでした"))
                return
            
            # オプション適用
            min_length = int(self.min_length_var.get())
            max_length = int(self.max_length_var.get())
            
            # 文字数フィルタリング
            filtered_terms = [
                term for term in medical_terms
                if min_length <= len(term) <= max_length
            ]
            
            # 重複除去
            if self.unique_var.get():
                filtered_terms = list(set(filtered_terms))
            
            self.queue.put(("progress", 70))
            self.queue.put(("log", f"{len(filtered_terms)}個の医療用語を抽出"))
            self.queue.put(("log", "CSVデータを作成中..."))
            
            # CSVデータ作成
            csv_data = self.extractor.create_csv_data(filtered_terms)
            
            # ソート
            if self.sort_var.get():
                csv_data.sort(key=lambda x: len(x['romaji']))
            
            self.queue.put(("progress", 90))
            self.queue.put(("log", "CSVファイルを保存中..."))
            
            # CSVファイル保存
            self.extractor.save_to_csv(csv_data, self.output_var.get())
            
            self.queue.put(("progress", 100))
            self.queue.put(("log", "変換完了!"))
            
            # 結果表示用データ作成
            result_text = f"変換結果サマリー\n"
            result_text += f"=" * 30 + "\n"
            result_text += f"入力ファイル: {Path(self.input_var.get()).name}\n"
            result_text += f"出力ファイル: {Path(self.output_var.get()).name}\n"
            result_text += f"抽出された用語数: {len(csv_data)}\n\n"
            result_text += f"抽出された医療用語（最初の10個）:\n"
            for i, data in enumerate(csv_data[:10]):
                result_text += f"{i+1:2d}. {data['japanese']} ({data['reading']}) -> {data['romaji']}\n"
            
            if len(csv_data) > 10:
                result_text += f"... 他 {len(csv_data) - 10} 個\n"
            
            self.queue.put(("result", result_text))
            self.queue.put(("success", "変換が正常に完了しました"))
            
        except Exception as e:
            self.queue.put(("error", f"変換エラー: {str(e)}"))
        finally:
            self.queue.put(("finish", None))

    def check_queue(self):
        """キューをチェックしてUIを更新"""
        try:
            while True:
                msg_type, data = self.queue.get_nowait()
                
                if msg_type == "progress":
                    self.progress_var.set(data)
                elif msg_type == "log":
                    self.log_message(data)
                elif msg_type == "result":
                    self.show_result(data)
                elif msg_type == "error":
                    self.log_message(f"エラー: {data}")
                    messagebox.showerror("エラー", data)
                elif msg_type == "success":
                    messagebox.showinfo("完了", data)
                elif msg_type == "finish":
                    self.processing = False
                    self.convert_button.config(state=tk.NORMAL)
                    
        except queue.Empty:
            pass
        
        # 定期的にチェック
        self.root.after(100, self.check_queue)


def main():
    """メイン関数"""
    # 依存関係チェック
    try:
        import PyPDF2
        import pykakasi
    except ImportError as e:
        messagebox.showerror(
            "依存関係エラー",
            f"必要なライブラリがインストールされていません: {e}\n\n"
            "以下のコマンドでインストールしてください:\n"
            "pip install PyPDF2 pykakasi"
        )
        return
    
    # GUI起動
    root = tk.Tk()
    app = PDFConverterGUI(root)
    
    # 終了処理
    def on_closing():
        if app.processing:
            if messagebox.askokcancel("終了確認", "変換処理中です。終了しますか？"):
                root.destroy()
        else:
            root.destroy()
    
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()


if __name__ == "__main__":
    main()
