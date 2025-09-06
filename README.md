# 医療用語タイピング練習アプリ

HTMLとJavaScriptのみで作成された医療用語のタイピング練習アプリケーションです。CSVファイルから用語を読み込みます。

## ファイル構成

```
medical-typing/
├── index.html                    # メインHTMLファイル
├── script.js                     # JavaScriptロジック（コメント付き）
├── styles.css                    # CSSスタイルシート
├── medical-terms.csv             # 医療用語データ（30語収録）
├── setup.sh                     # Ubuntu用セットアップスクリプト
├── pdf_to_csv.py                # PDF→CSV変換プログラム
├── pdf_to_csv_gui.py            # PDF変換GUI版
├── install_pdf_converter.sh      # PDF変換ツール用セットアップ
└── README.md                    # このファイル
```

## Ubuntu でのセットアップ

### 自動セットアップ（推奨）

```bash
# ファイルを実行可能にする
chmod +x setup.sh

# セットアップスクリプトを実行
./setup.sh
```

セットアップスクリプトが以下を自動で行います：
- 必要なパッケージのインストール（Python3, Node.js, Git, Webブラウザ）
- プロジェクトディレクトリの作成
- サーバー起動スクリプトの生成
- デスクトップショートカットの作成
- ファイアウォール設定の提案

### 手動セットアップ

1. **必要な依存関係をインストール:**
```bash
sudo apt update
sudo apt install -y python3 nodejs firefox git
```

2. **プロジェクトディレクトリを作成:**
```bash
mkdir -p ~/medical-typing
cd ~/medical-typing
```

3. **ファイルをコピー:**
```bash
# すべてのファイル（index.html, script.js, styles.css, medical-terms.csv）を
# プロジェクトディレクトリにコピーしてください
```

## アプリの起動

### Python3のHTTPサーバーを使用（推奨）

```bash
cd ~/medical-typing
python3 -m http.server 8000
```

### Node.jsのHTTPサーバーを使用

```bash
cd ~/medical-typing
npx http-server -p 8000
```

### ブラウザでアクセス

ブラウザで以下のURLにアクセスしてください：
```
http://localhost:8000
```

## CSVファイルでの用語管理

### CSVファイル形式

```csv
japanese,reading,romaji,meaning
心電図,しんでんず,shindenzu,心臓の電気的活動を記録する検査
血圧,けつあつ,ketsuatsu,血管内の圧力
```

### 列の説明

- **japanese**: 漢字表記の医療用語
- **reading**: ひらがなでの読み方
- **romaji**: ローマ字表記（タイピング対象）
- **meaning**: 用語の意味・説明

### カスタムCSVファイルの追加

1. 上記の形式でCSVファイルを作成
2. アプリの「カスタムCSVファイルを読み込む」ボタンから読み込み
3. 新しい用語でタイピング練習が可能

## アプリの使用方法

### 基本操作

1. **ゲーム開始**: 「ゲーム開始」ボタンをクリック
2. **タイピング**: 表示されたローマ字を正確に入力
3. **次の問題**: 正解すると自動的に次の問題へ進む
4. **ゲーム終了**: 60秒経過で終了、統計が表示される

### 機能

- **60秒間のタイムアタック**
- **リアルタイム統計表示** (WPM, 正確率, スコア)
- **文字単位の正誤判定** (色分け表示)
- **プログレスバー** (現在の入力進捗)
- **問題のランダム表示**
- **CSV読み込み機能**

### 表示される統計

- **スコア**: 正確に入力した文字数 × 10
- **WPM**: Words Per Minute (1分間あたりの単語数)
- **正確率**: 正しく入力した文字の割合
- **完了した用語数**: 制限時間内に完了した用語の数

## 収録されている医療用語（30語）

- 心電図、血圧、脳梗塞、糖尿病、肺炎
- 高血圧、心筋梗塞、胃潰瘍、腎不全、白血病
- 骨折、手術、注射、診断、治療
- 薬物療法、麻酔、感染症、アレルギー、リハビリテーション
- 放射線治療、化学療法、内視鏡、超音波検査、血液検査
- 尿検査、生検、病理診断、免疫療法、遺伝子治療

## 技術的詳細

### 使用技術

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **データ**: CSV形式
- **サーバー**: Python3 http.server または Node.js http-server

### ブラウザ対応

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### コードの特徴

- **モジュラー設計**: CSVManager クラスとTypingGame クラスに分離
- **詳細なコメント**: すべての関数にJSDocコメント付き
- **エラーハンドリング**: CSVファイル読み込み失敗時のフォールバック
- **レスポンシブデザイン**: 様々な画面サイズに対応

## カスタマイズ

### 制限時間の変更

`script.js` の `timeLimit` 変数を変更：

```javascript
this.timeLimit = 120; // 120秒に変更
```

### スコア計算の変更

`completeTerm()` メソッド内のスコア計算を変更：

```javascript
this.score += currentTerm.romaji.length * 20; // 1文字20点に変更
```

### CSS スタイルの変更

`styles.css` ファイルを編集してデザインをカスタマイズ可能。

## PDF to CSV 変換機能

PDFファイルから医療用語を自動抽出してCSVファイルに変換する機能を搭載しています。

### セットアップ

#### 自動セットアップ
```bash
# メインのセットアップ時にPDF変換機能も選択
./setup.sh

# または個別にPDF変換機能のみセットアップ
chmod +x install_pdf_converter.sh
./install_pdf_converter.sh
```

#### 手動セットアップ
```bash
# 必要なPythonライブラリをインストール
pip3 install PyPDF2 pykakasi

# GUI版を使用する場合は追加でtkinterをインストール
sudo apt install python3-tk
```

### 使用方法

#### コマンドライン版
```bash
# 基本的な使用方法
python3 pdf_to_csv.py input.pdf output.csv

# 例：医療教科書から用語を抽出
python3 pdf_to_csv.py medical_textbook.pdf my_medical_terms.csv

# ヘルプ表示
python3 pdf_to_csv.py --help
```

#### GUI版
```bash
# GUI版を起動
python3 pdf_to_csv_gui.py
```

### 機能

#### 医療用語自動抽出
- **パターンマッチング**: ～症、～病、～炎、～検査などの医療用語パターンを認識
- **辞書ベース抽出**: 内蔵の医療用語辞書から既知の用語を抽出
- **漢字ベース抽出**: 医療関連漢字を含む語を抽出

#### 自動変換機能
- **ひらがな変換**: 漢字からひらがな読みを自動生成
- **ローマ字変換**: ひらがなからローマ字を自動生成
- **意味付与**: 既知の用語には詳細な意味を付与

#### 出力オプション
- **重複除去**: 同じ用語の重複を自動除去
- **文字数フィルタ**: 最小・最大文字数での絞り込み
- **ソート機能**: 文字数順または五十音順でソート

### 対応ファイル形式

#### 入力
- **PDF**: テキスト化可能なPDFファイル
- **推奨**: 医療教科書、論文、診療ガイドライン等

#### 出力
- **CSV**: タイピング練習アプリで使用可能な形式
- **フォーマット**: japanese,reading,romaji,meaning

### 抽出される医療用語の例

```csv
japanese,reading,romaji,meaning
心不全,しんふぜん,shinfuzen,心臓のポンプ機能低下による病気
急性心筋梗塞,きゅうせいしんきんこうそく,kyuuseishinkinkousoku,心筋への血流が急激に遮断される疾患
糖尿病性腎症,とうにょうびょうせいじんしょう,tounyoubyouseijinshou,糖尿病による腎臓の合併症
```

### GUI版の特徴

- **ドラッグ&ドロップ**: ファイル選択が簡単
- **リアルタイム進捗**: 変換の進行状況を表示
- **プレビュー機能**: 抽出結果をその場で確認
- **オプション設定**: 文字数フィルタや重複除去の設定
- **エラーハンドリング**: 分かりやすいエラーメッセージ

### 高度な使用方法

#### カスタム医療用語辞書の追加
`pdf_to_csv.py`の`medical_dictionary`を編集：

```python
self.medical_dictionary = {
    '新しい用語': '新しい用語の説明',
    # ... 既存の辞書 ...
}
```

#### 抽出パターンのカスタマイズ
`medical_patterns`配列を編集：

```python
self.medical_patterns = [
    r'[一-龯]+症候群$',  # 症候群パターンを追加
    # ... 既存のパターン ...
]
```

## トラブルシューティング

### よくある問題

1. **CSVファイルが読み込めない**
   - ファイル形式がUTF-8であることを確認
   - カンマ区切りの形式になっているか確認
   - ヘッダー行が正しいか確認

2. **サーバーが起動しない**
   - ポート8000が使用中の場合、別のポートを使用
   - Python3またはNode.jsがインストールされているか確認

3. **ブラウザでアクセスできない**
   - ローカルホスト以外からアクセスする場合は、適切なIPアドレスを使用
   - ファイアウォールの設定を確認

### ログの確認

ブラウザの開発者ツール（F12）のコンソールでエラーを確認できます。

## pdfをcsvに変換する方法
### 必要なツール
- Python 3.x
- pandas ライブラリ
- tabula-py ライブラリ
### 手順
1. pdf_to_csv.py を起動し、pdfのサンプルファイルを用意する
[厚生労働省のpdfサンプル]https://numatatone.gunma.med.or.jp/renkei/wp/wp-content/uploads/2024/08/20240806_glossary-of-technical-terms.pdf

# 終わりに
今回は、医療用語を練習するためのwebアプリを作成してみました。
即興で作成したので、コードの品質はあまり高くないですが、基本的な機能は備えています。
医療用語の抽出やCSV変換機能も搭載しているので、ぜひ活用してみてください。
以上、YAMAでした。
