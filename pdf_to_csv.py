#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PDF to CSV Converter for Medical Terms
医療用語PDFからCSV変換プログラム

このプログラムはPDFファイルから医療用語を抽出し、
タイピング練習用のCSVファイルに変換します。

使用方法:
    python3 pdf_to_csv.py input.pdf output.csv

依存関係:
    pip install PyPDF2 pykakasi
"""

import argparse
import csv
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional, Tuple

try:
    import PyPDF2
except ImportError:
    print("PyPDF2がインストールされていません。")
    print("以下のコマンドでインストールしてください:")
    print("   pip install PyPDF2")
    sys.exit(1)

try:
    import pykakasi
except ImportError:
    print("pykakasiがインストールされていません。")
    print("以下のコマンドでインストールしてください:")
    print("   pip install pykakasi")
    sys.exit(1)


class MedicalTermExtractor:
    """医療用語抽出クラス"""
    
    def __init__(self):
        """初期化"""
        # pykakasiの設定（漢字→ひらがな変換用）
        self.kks = pykakasi.kakasi()
        self.kks.setMode('H', 'a')  # ひらがな→ローマ字
        self.kks.setMode('K', 'a')  # カタカナ→ローマ字
        self.kks.setMode('J', 'H')  # 漢字→ひらがな
        self.conv = self.kks.getConverter()
        
        # 医療用語のパターン（拡張可能）
        self.medical_patterns = [
            # 病名パターン
            r'[一-龯]+症$',          # ～症で終わる
            r'[一-龯]+病$',          # ～病で終わる
            r'[一-龯]+炎$',          # ～炎で終わる
            r'[一-龯]+癌$',          # ～癌で終わる
            r'[一-龯]+腫$',          # ～腫で終わる
            r'[一-龯]+梗塞$',        # ～梗塞で終わる
            r'[一-龯]+不全$',        # ～不全で終わる
            r'[一-龯]+障害$',        # ～障害で終わる
            
            # 検査・治療パターン
            r'[一-龯]+検査$',        # ～検査で終わる
            r'[一-龯]+療法$',        # ～療法で終わる
            r'[一-龯]+治療$',        # ～治療で終わる
            r'[一-龯]+手術$',        # ～手術で終わる
            r'[一-龯]+診断$',        # ～診断で終わる
            
            # 解剖学用語
            r'[一-龯]+筋$',          # ～筋で終わる
            r'[一-龯]+骨$',          # ～骨で終わる
            r'[一-龯]+神経$',        # ～神経で終わる
            r'[一-龯]+血管$',        # ～血管で終わる
            r'[一-龯]+腺$',          # ～腺で終わる
            
            # 薬物・医療機器
            r'[一-龯]+薬$',          # ～薬で終わる
            r'[一-龯]+剤$',          # ～剤で終わる
            r'[一-龯]+器$',          # ～器で終わる
            r'[一-龯]+装置$',        # ～装置で終わる
        ]
        
        # 医療用語の辞書（意味付き）- 拡張可能
        self.medical_dictionary = {
            '心電図': '心臓の電気的活動を記録する検査',
            '血圧': '血管内の圧力',
            '脳梗塞': '脳血管が詰まって起こる病気',
            '糖尿病': '血糖値が慢性的に高い状態',
            '肺炎': '肺の炎症性疾患',
            '高血圧': '血圧が正常値より高い状態',
            '心筋梗塞': '心筋への血流が止まる病気',
            '胃潰瘍': '胃壁に潰瘍ができる病気',
            '腎不全': '腎臓の機能が低下した状態',
            '白血病': '血液のがんの一種',
            '骨折': '骨が折れること',
            '手術': '医学的処置として体を切開すること',
            '注射': '薬液を体内に注入すること',
            '診断': '病気を調べて判定すること',
            '治療': '病気やけがを治すこと',
            '薬物療法': '薬を使った治療法',
            '麻酔': '痛みを感じなくする処置',
            '感染症': '病原体による病気',
            'アレルギー': '免疫システムの過剰反応',
            'リハビリテーション': '機能回復のための訓練',
            '放射線治療': '放射線を使った治療法',
            '化学療法': '抗がん剤を使った治療',
            '内視鏡': '体内を観察する医療機器',
            '超音波検査': '音波を使った検査',
            '血液検査': '血液成分を調べる検査',
            '尿検査': '尿成分を調べる検査',
            '生検': '組織の一部を取って調べる検査',
            '病理診断': '組織や細胞を顕微鏡で調べる診断',
            '免疫療法': '免疫力を利用した治療法',
            '遺伝子治療': '遺伝子を使った治療法',
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        PDFファイルからテキストを抽出
        
        Args:
            pdf_path (str): PDFファイルのパス
            
        Returns:
            str: 抽出されたテキスト
        """
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                print(f"PDFファイルを読み込み中: {pdf_path}")
                print(f"ページ数: {len(pdf_reader.pages)}")
                
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text()
                    text += page_text + "\n"
                    print(f"⏳ ページ {page_num}/{len(pdf_reader.pages)} 処理中...")
                
                print("PDFテキスト抽出完了")
                return text
                
        except Exception as e:
            print(f"❌ PDFファイルの読み込みエラー: {e}")
            return ""

    def extract_medical_terms(self, text: str) -> List[str]:
        """
        テキストから医療用語を抽出
        
        Args:
            text (str): 抽出対象のテキスト
            
        Returns:
            List[str]: 抽出された医療用語のリスト
        """
        medical_terms = set()
        
        # 改行と余分な空白を除去
        text = re.sub(r'\s+', ' ', text.strip())
        
        print("医療用語を抽出中...")
        
        # パターンマッチングで医療用語を抽出
        for pattern in self.medical_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) >= 2:  # 2文字以上の用語のみ
                    medical_terms.add(match)
        
        # 辞書にある既知の医療用語を抽出
        for term in self.medical_dictionary.keys():
            if term in text:
                medical_terms.add(term)
        
        # 一般的な医療用語の文字パターンで追加抽出
        # （例：心、肺、肝、腎、脳、血、骨、筋、神経など医療関連漢字を含む語）
        medical_chars = ['心', '肺', '肝', '腎', '脳', '血', '骨', '筋', '神', '医', '薬', '病', '症', '癌', '腫']
        for char in medical_chars:
            pattern = f'[一-龯]*{char}[一-龯]*'
            matches = re.findall(pattern, text)
            for match in matches:
                if 2 <= len(match) <= 10:  # 適切な長さの用語のみ
                    medical_terms.add(match)
        
        result = list(medical_terms)
        print(f"{len(result)}個の医療用語を抽出しました")
        
        return result

    def convert_to_romaji(self, japanese_text: str) -> str:
        """
        日本語をローマ字に変換
        
        Args:
            japanese_text (str): 日本語テキスト
            
        Returns:
            str: ローマ字変換結果
        """
        try:
            result = self.conv.do(japanese_text)
            # 特殊文字の置換
            romaji = result.replace(' ', '').replace('-', '').lower()
            return romaji
        except Exception:
            # 変換に失敗した場合は元のテキストを返す
            return japanese_text.lower()

    def get_reading(self, japanese_text: str) -> str:
        """
        漢字をひらがな読みに変換
        
        Args:
            japanese_text (str): 日本語テキスト
            
        Returns:
            str: ひらがな読み
        """
        try:
            # 漢字→ひらがな変換用の設定
            kks_reading = pykakasi.kakasi()
            kks_reading.setMode('J', 'H')  # 漢字→ひらがな
            kks_reading.setMode('K', 'H')  # カタカナ→ひらがな
            conv_reading = kks_reading.getConverter()
            
            result = conv_reading.do(japanese_text)
            return result.replace(' ', '')
        except Exception:
            return japanese_text

    def get_meaning(self, term: str) -> str:
        """
        医療用語の意味を取得
        
        Args:
            term (str): 医療用語
            
        Returns:
            str: 用語の意味
        """
        if term in self.medical_dictionary:
            return self.medical_dictionary[term]
        
        # 辞書にない場合は簡単な意味を生成
        if term.endswith('症'):
            return f"{term[:-1]}に関連する症状や病気"
        elif term.endswith('病'):
            return f"{term[:-1]}に関連する疾患"
        elif term.endswith('炎'):
            return f"{term[:-1]}の炎症"
        elif term.endswith('検査'):
            return f"{term[:-2]}を調べる検査"
        elif term.endswith('療法'):
            return f"{term[:-2]}を用いた治療法"
        elif term.endswith('治療'):
            return f"{term[:-2]}による治療"
        else:
            return f"{term}に関する医療用語"

    def create_csv_data(self, medical_terms: List[str]) -> List[Dict[str, str]]:
        """
        医療用語リストからCSVデータを作成
        
        Args:
            medical_terms (List[str]): 医療用語のリスト
            
        Returns:
            List[Dict[str, str]]: CSVデータ
        """
        csv_data = []
        
        print("CSVデータを作成中...")
        
        for term in medical_terms:
            reading = self.get_reading(term)
            romaji = self.convert_to_romaji(reading)
            meaning = self.get_meaning(term)
            
            csv_data.append({
                'japanese': term,
                'reading': reading,
                'romaji': romaji,
                'meaning': meaning
            })
            
            print(f"  ✓ {term} -> {reading} -> {romaji}")
        
        # ローマ字の長さでソート（短い順）
        csv_data.sort(key=lambda x: len(x['romaji']))
        
        return csv_data

    def save_to_csv(self, csv_data: List[Dict[str, str]], output_path: str):
        """
        CSVファイルに保存
        
        Args:
            csv_data (List[Dict[str, str]]): CSVデータ
            output_path (str): 出力ファイルパス
        """
        try:
            with open(output_path, 'w', encoding='utf-8', newline='') as csvfile:
                fieldnames = ['japanese', 'reading', 'romaji', 'meaning']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(csv_data)
            
            print(f"CSVファイルを保存しました: {output_path}")
            print(f"登録された用語数: {len(csv_data)}")
            
        except Exception as e:
            print(f"CSVファイルの保存エラー: {e}")

    def process_pdf(self, pdf_path: str, output_path: str):
        """
        PDFファイルを処理してCSVに変換
        
        Args:
            pdf_path (str): 入力PDFファイルのパス
            output_path (str): 出力CSVファイルのパス
        """
        print("PDF to CSV 変換を開始します...\n")
        
        # PDFからテキスト抽出
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            print("PDFからテキストを抽出できませんでした")
            return
        
        # 医療用語抽出
        medical_terms = self.extract_medical_terms(text)
        if not medical_terms:
            print("医療用語が見つかりませんでした")
            return
        
        # CSVデータ作成
        csv_data = self.create_csv_data(medical_terms)
        
        # CSVファイル保存
        self.save_to_csv(csv_data, output_path)
        
        print("\n変換完了!")
        print(f"出力ファイル: {output_path}")


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(
        description="PDFから医療用語を抽出してCSVに変換",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  python3 pdf_to_csv.py medical_textbook.pdf medical_terms.csv
  python3 pdf_to_csv.py --help

CSVフォーマット:
  japanese,reading,romaji,meaning
  心電図,しんでんず,shindenzu,心臓の電気的活動を記録する検査

必要な依存関係:
  pip install PyPDF2 pykakasi
        """
    )
    
    parser.add_argument(
        'input_pdf',
        help='入力PDFファイルのパス'
    )
    
    parser.add_argument(
        'output_csv',
        nargs='?',
        default='extracted_medical_terms.csv',
        help='出力CSVファイルのパス (デフォルト: extracted_medical_terms.csv)'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='PDF to CSV Converter for Medical Terms v1.0'
    )
    
    args = parser.parse_args()
    
    # ファイル存在確認
    if not Path(args.input_pdf).exists():
        print(f"入力ファイルが見つかりません: {args.input_pdf}")
        sys.exit(1)
    
    # 拡張子確認
    if not args.input_pdf.lower().endswith('.pdf'):
        print("入力ファイルはPDFファイルである必要があります")
        sys.exit(1)
    
    # 変換実行
    extractor = MedicalTermExtractor()
    extractor.process_pdf(args.input_pdf, args.output_csv)


if __name__ == "__main__":
    main()
