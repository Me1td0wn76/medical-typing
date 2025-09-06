# 📄 PDF to CSV 変換 クイックガイド

医療用語が含まれたPDFファイルからタイピング練習用のCSVファイルを作成する方法

## 🚀 クイックスタート

### Windows
```batch
# セットアップ（初回のみ）
setup_windows.bat

# PDF変換（コマンドライン）
convert_pdf.bat medical_textbook.pdf medical_terms.csv

# PDF変換（GUI）
start_pdf_gui.bat
```

### Ubuntu/Linux
```bash
# セットアップ（初回のみ）
chmod +x install_pdf_converter.sh
./install_pdf_converter.sh

# PDF変換（コマンドライン）
python3 pdf_to_csv.py medical_textbook.pdf medical_terms.csv

# PDF変換（GUI）
python3 pdf_to_csv_gui.py
```

## 📋 変換できるPDFの例

### 適している
- ✅ 医療教科書のPDF
- ✅ 医学論文のPDF
- ✅ 診療ガイドラインのPDF
- ✅ 医療用語集のPDF
- ✅ 病院の資料のPDF

### 適さない
- ❌ 画像のみのPDF（スキャンしただけのもの）
- ❌ 英語のみのPDF
- ❌ 医療用語が含まれていないPDF

## 🔧 変換オプション

### コマンドライン版
```bash
# 基本的な変換
python3 pdf_to_csv.py input.pdf output.csv

# ヘルプ表示
python3 pdf_to_csv.py --help
```

### GUI版の設定
- **最小文字数**: 抽出する用語の最小文字数（デフォルト: 2）
- **最大文字数**: 抽出する用語の最大文字数（デフォルト: 10）
- **重複除去**: 同じ用語の重複を除去（推奨: ON）
- **ソート**: 文字数順にソート（推奨: ON）

## 📤 出力形式

変換されたCSVファイルは以下の形式になります：

```csv
japanese,reading,romaji,meaning
心電図,しんでんず,shindenzu,心臓の電気的活動を記録する検査
血圧,けつあつ,ketsuatsu,血管内の圧力
脳梗塞,のうこうそく,noukousoku,脳血管が詰まって起こる病気
```

## 🎯 抽出される用語の例

### 病名
- 糖尿病 → とうにょうびょう → tounyoubyou
- 高血圧 → こうけつあつ → kouketsuatsu
- 肺炎 → はいえん → haien

### 検査
- 血液検査 → けつえきけんさ → ketsueki-kensa
- 尿検査 → にょうけんさ → nyou-kensa
- 超音波検査 → ちょうおんぱけんさ → chouonpa-kensa

### 治療
- 薬物療法 → やくぶつりょうほう → yakubutsu-ryouhou
- 手術 → しゅじゅつ → shujutsu
- リハビリテーション → りはびりてーしょん → rihabiri-teshon

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. 「No module named 'PyPDF2'」エラー
```bash
pip install PyPDF2 pykakasi
```

#### 2. 「文字化けする」
- PDFがUTF-8エンコーディングでない可能性
- 別のPDFで試してみてください

#### 3. 「用語が抽出されない」
- PDFに日本語の医療用語が含まれているか確認
- テキスト化可能なPDFか確認（画像のみのPDFは不可）

#### 4. 「GUI起動エラー」
```bash
# Ubuntu
sudo apt install python3-tk

# Windows
# Python再インストール時に「tcl/tk and IDLE」にチェック
```

## 💡 使用のコツ

### 高品質な変換のために
1. **テキスト化可能なPDF**を使用する
2. **日本語の医療用語**が豊富なPDFを選ぶ
3. **複数のPDF**から用語を抽出して統合する
4. **生成されたCSV**を手動で確認・編集する

### 効率的な作業手順
1. 医療関連のPDFを収集
2. バッチで複数ファイルを変換
3. 生成されたCSVファイルを統合
4. 重複除去と品質チェック
5. タイピング練習アプリで使用

## 📚 参考になるPDF源

### 無料で利用可能
- 厚生労働省の医療ガイドライン
- 医学会の診療指針
- 大学の公開講義資料
- 医療機関の患者向け資料

### 注意事項
- 著作権を尊重してください
- 個人的な学習目的での使用に留めてください
- 商用利用前には必ず権利者の許可を得てください

## 🔄 CSVファイルの活用

作成したCSVファイルは以下で使用できます：

1. **医療用語タイピング練習アプリ**
   - ファイル読み込み機能で直接使用可能

2. **Excel/Googleスプレッドシート**
   - 用語リストの管理・編集

3. **他のタイピングソフト**
   - 形式を変換して使用

4. **単語帳アプリ**
   - 暗記用データとして活用
