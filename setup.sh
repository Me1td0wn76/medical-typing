#!/bin/bash

# 医療用語タイピング練習アプリ セットアップスクリプト for Ubuntu
# 実行方法: chmod +x setup.sh && ./setup.sh

set -e  # エラー時にスクリプトを停止

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プログレスバー表示
show_progress() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# ウェルカムメッセージ
echo -e "${GREEN}"
cat << "EOF"
┌─────────────────────────────────────────────────┐
│     医療用語タイピング練習アプリ                   │
│     Ubuntu セットアップスクリプト                 │
└─────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

# 前提条件チェック
log_info "前提条件をチェックしています..."

# Ubuntu バージョンチェック
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "ubuntu" ]]; then
        log_success "Ubuntu $VERSION_ID を検出しました"
    else
        log_warning "Ubuntu以外のOS ($ID) を検出しました。続行しますが、問題が発生する可能性があります。"
    fi
else
    log_warning "OS情報を取得できませんでした。続行します。"
fi

# インターネット接続チェック
log_info "インターネット接続をチェックしています..."
if ping -c 1 google.com &> /dev/null; then
    log_success "インターネット接続が確認されました"
else
    log_error "インターネット接続がありません。パッケージのインストールに問題が発生する可能性があります。"
fi

# パッケージリストの更新
log_info "パッケージリストを更新しています..."
sudo apt update &
show_progress $!
log_success "パッケージリストの更新が完了しました"

# 必要なパッケージのインストール
log_info "必要なパッケージをインストールしています..."

# Python3とpipのインストール
if ! command -v python3 &> /dev/null; then
    log_info "Python3をインストールしています..."
    sudo apt install -y python3 python3-pip &
    show_progress $!
    log_success "Python3のインストールが完了しました"
else
    log_success "Python3は既にインストール済みです ($(python3 --version))"
fi

# Node.js (簡易HTTPサーバー用)
if ! command -v node &> /dev/null; then
    log_info "Node.jsをインストールしています..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &
    show_progress $!
    sudo apt-get install -y nodejs &
    show_progress $!
    log_success "Node.jsのインストールが完了しました"
else
    log_success "Node.jsは既にインストール済みです ($(node --version))"
fi

# git (バージョン管理用、オプション)
if ! command -v git &> /dev/null; then
    log_info "Gitをインストールしています..."
    sudo apt install -y git &
    show_progress $!
    log_success "Gitのインストールが完了しました"
else
    log_success "Gitは既にインストール済みです ($(git --version))"
fi

# Webブラウザのチェックとインストール
if ! command -v firefox &> /dev/null && ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    log_info "Webブラウザが見つかりません。Firefoxをインストールしています..."
    sudo apt install -y firefox &
    show_progress $!
    log_success "Firefoxのインストールが完了しました"
else
    log_success "Webブラウザが利用可能です"
fi

# プロジェクトディレクトリの設定
PROJECT_DIR="$HOME/medical-typing"
log_info "プロジェクトディレクトリを設定しています: $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    log_warning "ディレクトリ $PROJECT_DIR は既に存在します"
    read -p "上書きしますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
        log_info "既存のディレクトリを削除しました"
    else
        log_info "セットアップを中止します"
        exit 1
    fi
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
log_success "プロジェクトディレクトリが作成されました"

# ファイルのダウンロード/作成（既存のファイルがない場合）
if [ ! -f "index.html" ] || [ ! -f "script.js" ] || [ ! -f "styles.css" ] || [ ! -f "medical-terms.csv" ]; then
    log_warning "アプリケーションファイルが見つかりません"
    log_info "GitHubリポジトリまたは既存のファイルからコピーしてください"
    
    # サンプルファイルの作成
    cat > README.md << 'EOREADME'
# 医療用語タイピング練習アプリ

## ファイル構成
- index.html: メインHTMLファイル
- script.js: JavaScriptロジック
- styles.css: CSSスタイル
- medical-terms.csv: 医療用語データ

## 起動方法
1. 簡易HTTPサーバーを起動:
   ```bash
   python3 -m http.server 8000
   ```
   または
   ```bash
   npx http-server
   ```

2. ブラウザで http://localhost:8000 にアクセス

## CSVファイル形式
japanese,reading,romaji,meaning
心電図,しんでんず,shindenzu,心臓の電気的活動を記録する検査
EOREADME

    log_info "README.mdファイルを作成しました"
fi

# 権限設定
chmod 755 "$PROJECT_DIR"
chmod 644 "$PROJECT_DIR"/*.* 2>/dev/null || true

# HTTPサーバー起動スクリプトの作成
cat > start_server.sh << 'EOSERVER'
#!/bin/bash

echo "医療用語タイピング練習アプリを起動しています..."

# ポート番号を確認
PORT=8000
while netstat -tuln | grep ":$PORT " > /dev/null; do
    PORT=$((PORT + 1))
done

echo "ポート $PORT で起動します"

# Python3のHTTPサーバーを起動
if command -v python3 &> /dev/null; then
    echo "Python3 HTTPサーバーを起動中..."
    python3 -m http.server $PORT
elif command -v npx &> /dev/null; then
    echo "Node.js HTTPサーバーを起動中..."
    npx http-server -p $PORT
else
    echo "HTTPサーバーを起動できません。Python3またはNode.jsをインストールしてください。"
    exit 1
fi
EOSERVER

chmod +x start_server.sh
log_success "サーバー起動スクリプト (start_server.sh) を作成しました"

# デスクトップショートカット作成
if [ -d "$HOME/Desktop" ]; then
    cat > "$HOME/Desktop/medical-typing.desktop" << EODESKTOP
[Desktop Entry]
Version=1.0
Type=Application
Name=医療用語タイピング練習
Comment=医療用語タイピング練習アプリ
Exec=bash -c "cd '$PROJECT_DIR' && ./start_server.sh"
Icon=applications-office
Terminal=true
Categories=Education;
EODESKTOP
    
    chmod +x "$HOME/Desktop/medical-typing.desktop"
    log_success "デスクトップショートカットを作成しました"
fi

# ファイアウォール設定（必要に応じて）
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        log_info "ファイアウォールが有効です。ポート8000-8010を開放しますか？"
        read -p "開放しますか？ (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow 8000:8010/tcp
            log_success "ポート8000-8010を開放しました"
        fi
    fi
fi

# セットアップ完了メッセージ
echo
log_success "セットアップが完了しました！"
echo
echo -e "${GREEN}次の手順でアプリを起動してください:${NC}"
echo
echo -e "${YELLOW}1. プロジェクトディレクトリに移動:${NC}"
echo "   cd $PROJECT_DIR"
echo
echo -e "${YELLOW}2. サーバーを起動:${NC}"
echo "   ./start_server.sh"
echo
echo -e "${YELLOW}3. ブラウザでアクセス:${NC}"
echo "   http://localhost:8000"
echo
echo -e "${BLUE}プロジェクトディレクトリ: $PROJECT_DIR${NC}"
echo -e "${BLUE}使用方法: cat README.md${NC}"
echo

# 自動起動確認
read -p "今すぐアプリを起動しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "アプリを起動しています..."
    ./start_server.sh
fi

log_success "セットアップスクリプトの実行が完了しました！"
