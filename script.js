/**
 * 難易度管理クラス
 * ゲームの難易度設定を管理
 */
class DifficultyManager {
    constructor() {
        this.presets = {
            easy: {
                timeLimit: 120,
                termCount: 8,
                showHints: true,
                name: '初級',
                description: 'ゆっくり練習したい方向け'
            },
            normal: {
                timeLimit: 60,
                termCount: 10,
                showHints: true,
                name: '中級',
                description: '標準的な練習'
            },
            hard: {
                timeLimit: 45,
                termCount: 12,
                showHints: false,
                name: '上級',
                description: '集中力が必要'
            },
            expert: {
                timeLimit: 30,
                termCount: 15,
                showHints: false,
                name: 'エキスパート',
                description: '最高難易度'
            }
        };
        
        this.currentSettings = { ...this.presets.normal };
    }

    /**
     * プリセット難易度を設定
     * @param {string} level - 難易度レベル
     */
    setPreset(level) {
        if (this.presets[level]) {
            this.currentSettings = { ...this.presets[level] };
            this.updateUI();
        }
    }

    /**
     * カスタム設定を適用
     * @param {Object} settings - カスタム設定
     */
    setCustom(settings) {
        this.currentSettings = {
            timeLimit: settings.timeLimit || 60,
            termCount: settings.termCount || 10,
            showHints: settings.showHints !== undefined ? settings.showHints : true,
            name: 'カスタム',
            description: 'ユーザー設定'
        };
    }

    /**
     * 現在の設定を取得
     * @returns {Object} 現在の難易度設定
     */
    getCurrentSettings() {
        return { ...this.currentSettings };
    }

    /**
     * UIを現在の設定に更新
     */
    updateUI() {
        const timeLimitInput = document.getElementById('timeLimit');
        const termCountInput = document.getElementById('termCount');
        const showHintsInput = document.getElementById('showHints');

        if (timeLimitInput) timeLimitInput.value = this.currentSettings.timeLimit;
        if (termCountInput) termCountInput.value = this.currentSettings.termCount;
        if (showHintsInput) showHintsInput.checked = this.currentSettings.showHints;
    }

    /**
     * 難易度に応じて用語をフィルタリング
     * @param {Array} terms - 全用語配列
     * @returns {Array} フィルタリングされた用語配列
     */
    filterTermsByDifficulty(terms) {
        const settings = this.getCurrentSettings();
        
        // 難易度に応じて用語を選択
        let filteredTerms = [...terms];
        
        if (settings.name === '初級') {
            // 簡単な用語（短い用語を優先）
            filteredTerms = terms.filter(term => 
                term.romaji && term.romaji.length <= 8
            ).sort((a, b) => a.romaji.length - b.romaji.length);
        } else if (settings.name === '上級' || settings.name === 'エキスパート') {
            // 難しい用語（長い用語を優先）
            filteredTerms = terms.filter(term => 
                term.romaji && term.romaji.length >= 6
            ).sort((a, b) => b.romaji.length - a.romaji.length);
        }
        
        // 指定された問題数に制限
        return filteredTerms.slice(0, Math.min(settings.termCount, filteredTerms.length));
    }
}

/**
 * ローマ字入力パターン管理クラス
 * 複数の入力方式（nn/n', shu/syu, cha/tya等）に対応
 */
class RomajiPatterns {
    constructor() {
        // 複数の入力パターンを定義
        this.patterns = {
            'ん': ['nn', "n'", 'xn'],
            'しゃ': ['sha', 'sya'],
            'しゅ': ['shu', 'syu'],
            'しょ': ['sho', 'syo'],
            'ちゃ': ['cha', 'tya'],
            'ちゅ': ['chu', 'tyu'],
            'ちょ': ['cho', 'tyo'],
            'じゃ': ['ja', 'jya', 'zya'],
            'じゅ': ['ju', 'jyu', 'zyu'],
            'じょ': ['jo', 'jyo', 'zyo'],
            'ふぁ': ['fa', 'fwa'],
            'ふぃ': ['fi', 'fwi'],
            'ふぇ': ['fe', 'fwe'],
            'ふぉ': ['fo', 'fwo'],
            'つ': ['tu', 'tsu'],
            'づ': ['du', 'dzu'],
            'を': ['wo', 'o'],
            'ー': ['-', '^']
        };
    }

    /**
     * ひらがなテキストからすべての可能なローマ字パターンを生成
     * @param {string} hiragana - ひらがなテキスト
     * @returns {Array} 可能なローマ字パターンの配列
     */
    generateAllPatterns(hiragana) {
        const result = [];
        
        // 基本のローマ字変換
        const baseRomaji = this.hiraganaToRomaji(hiragana);
        result.push(baseRomaji);
        
        // パターン置換
        for (const [hira, patterns] of Object.entries(this.patterns)) {
            if (hiragana.includes(hira)) {
                patterns.forEach(pattern => {
                    const converted = baseRomaji.replace(
                        new RegExp(this.hiraganaToRomaji(hira), 'g'), 
                        pattern
                    );
                    if (!result.includes(converted)) {
                        result.push(converted);
                    }
                });
            }
        }
        
        return result;
    }

    /**
     * 基本的なひらがな→ローマ字変換
     * @param {string} hiragana - ひらがなテキスト
     * @returns {string} ローマ字テキスト
     */
    hiraganaToRomaji(hiragana) {
        const table = {
            'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
            'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
            'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
            'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
            'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
            'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
            'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
            'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
            'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
            'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
            'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
            'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
            'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
            'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
            'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
            'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': '',
            'ー': '-'
        };

        let result = '';
        let i = 0;
        
        while (i < hiragana.length) {
            let found = false;
            
            // 2文字の組み合わせをチェック
            if (i < hiragana.length - 1) {
                const twoChar = hiragana.substr(i, 2);
                if (table[twoChar]) {
                    result += table[twoChar];
                    i += 2;
                    found = true;
                }
            }
            
            // 1文字をチェック
            if (!found) {
                const oneChar = hiragana[i];
                if (table[oneChar]) {
                    result += table[oneChar];
                } else {
                    result += oneChar; // 変換できない場合はそのまま
                }
                i++;
            }
        }
        
        return result;
    }

    /**
     * 入力されたローマ字が正解のパターンのいずれかに一致するかチェック
     * @param {string} input - 入力されたローマ字
     * @param {string} reading - ひらがな読み
     * @returns {boolean} 一致するかどうか
     */
    isValidInput(input, reading) {
        const patterns = this.generateAllPatterns(reading);
        return patterns.includes(input.toLowerCase());
    }

    /**
     * 部分入力が正しい方向に進んでいるかチェック
     * @param {string} input - 部分入力
     * @param {string} reading - ひらがな読み
     * @returns {boolean} 正しい方向に進んでいるか
     */
    isPartiallyCorrect(input, reading) {
        const patterns = this.generateAllPatterns(reading);
        return patterns.some(pattern => pattern.startsWith(input.toLowerCase()));
    }
}
class CSVManager {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    /**
     * CSVテキストをパースして配列に変換
     * @param {string} csvText - CSV形式のテキスト
     * @returns {Array} パースされたデータ配列
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const item = {};
                headers.forEach((header, index) => {
                    item[header.trim()] = values[index].trim();
                });
                data.push(item);
            }
        }

        return data;
    }

    /**
     * CSV行をパースする（カンマ区切りを正しく処理）
     * @param {string} line - CSV行
     * @returns {Array} パースされた値の配列
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * CSVファイルを読み込む
     * @param {string} filePath - CSVファイルのパス
     * @returns {Promise<Array>} 読み込まれたデータ
     */
    async loadFromFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            this.isLoaded = true;
            return this.data;
        } catch (error) {
            console.error('CSV読み込みエラー:', error);
            throw error;
        }
    }

    /**
     * ファイル入力からCSVを読み込む
     * @param {File} file - ファイルオブジェクト
     * @returns {Promise<Array>} 読み込まれたデータ
     */
    async loadFromFileInput(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;
                    this.data = this.parseCSV(csvText);
                    this.isLoaded = true;
                    resolve(this.data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * データを取得
     * @returns {Array} 医療用語データ
     */
    getData() {
        return this.data;
    }

    /**
     * データの読み込み状態を確認
     * @returns {boolean} 読み込み済みかどうか
     */
    isDataLoaded() {
        return this.isLoaded;
    }
}

// デフォルトの医療用語データ（CSVが読み込めない場合のフォールバック）
const defaultMedicalTerms = [
    {
        japanese: "心電図",
        reading: "しんでんず",
        romaji: "shindenzu",
        meaning: "心臓の電気的活動を記録する検査"
    },
    {
        japanese: "血圧",
        reading: "けつあつ",
        romaji: "ketsuatsu",
        meaning: "血管内の圧力"
    },
    {
        japanese: "脳梗塞",
        reading: "のうこうそく",
        romaji: "noukousoku",
        meaning: "脳血管が詰まって起こる病気"
    },
    {
        japanese: "糖尿病",
        reading: "とうにょうびょう",
        romaji: "tounyoubyou",
        meaning: "血糖値が慢性的に高い状態"
    },
    {
        japanese: "肺炎",
        reading: "はいえん",
        romaji: "haien",
        meaning: "肺の炎症性疾患"
    }
];

/**
 * タイピングゲームメインクラス
 * ゲームの状態管理とロジックを担当
 */
class TypingGame {
    constructor() {
        this.currentTermIndex = 0;
        this.currentInput = '';
        this.isGameActive = false;
        this.startTime = null;
        this.timeLimit = 60; // デフォルト値（難易度設定で変更される）
        this.timerInterval = null;
        this.remainingTime = this.timeLimit;
        this.score = 0;
        this.totalTyped = 0;
        this.correctTyped = 0;
        this.termsCompleted = 0;
        
        this.csvManager = new CSVManager();
        this.romajiPatterns = new RomajiPatterns(); // ローマ字パターン管理
        this.difficultyManager = new DifficultyManager(); // 難易度管理
        this.medicalTerms = [];
        this.shuffledTerms = [];
        
        this.initializeElements();
        this.bindEvents();
        this.setupDifficultyEvents();
        this.loadMedicalTerms();
    }

    /**
     * DOM要素を初期化
     */
    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            nextBtn: document.getElementById('nextBtn'),
            restartBtn: document.getElementById('restartBtn'),
            inputField: document.getElementById('inputField'),
            targetText: document.getElementById('targetText'),
            termJapanese: document.getElementById('termJapanese'),
            termReading: document.getElementById('termReading'),
            termMeaning: document.getElementById('termMeaning'),
            score: document.getElementById('score'),
            wpm: document.getElementById('wpm'),
            accuracy: document.getElementById('accuracy'),
            timer: document.getElementById('timer'),
            progressFill: document.getElementById('progressFill'),
            gameOver: document.getElementById('gameOver'),
            finalStats: document.getElementById('finalStats'),
            questionArea: document.getElementById('questionArea'),
            typingArea: document.getElementById('typingArea'),
            csvFileInput: document.getElementById('csvFileInput'),
            loadingArea: document.getElementById('loadingArea'),
            errorArea: document.getElementById('errorArea'),
            // 難易度設定要素
            difficultyLevel: document.getElementById('difficultyLevel'),
            timeLimit: document.getElementById('timeLimit'),
            termCount: document.getElementById('termCount'),
            showHints: document.getElementById('showHints')
        };
    }

    /**
     * イベントリスナーを設定
     */
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.nextBtn.addEventListener('click', () => this.nextTerm());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.inputField.addEventListener('input', (e) => this.handleInput(e));
        this.elements.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // CSVファイル読み込み
        if (this.elements.csvFileInput) {
            this.elements.csvFileInput.addEventListener('change', (e) => this.handleFileInput(e));
        }
    }

    /**
     * 難易度設定のイベントリスナーを設定
     */
    setupDifficultyEvents() {
        // 難易度レベル変更
        if (this.elements.difficultyLevel) {
            this.elements.difficultyLevel.addEventListener('change', (e) => {
                if (e.target.value !== 'custom') {
                    this.difficultyManager.setPreset(e.target.value);
                    this.applyDifficultySettings();
                }
            });
        }

        // カスタム設定変更
        const customInputs = [this.elements.timeLimit, this.elements.termCount, this.elements.showHints];
        customInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.elements.difficultyLevel.value = 'custom';
                    this.difficultyManager.setCustom({
                        timeLimit: parseInt(this.elements.timeLimit.value),
                        termCount: parseInt(this.elements.termCount.value),
                        showHints: this.elements.showHints.checked
                    });
                    this.applyDifficultySettings();
                });
            }
        });
    }

    /**
     * 難易度設定を適用
     */
    applyDifficultySettings() {
        const settings = this.difficultyManager.getCurrentSettings();
        
        // 時間制限を更新
        this.timeLimit = settings.timeLimit;
        this.remainingTime = settings.timeLimit;
        this.elements.timer.textContent = settings.timeLimit;
        
        // ヒント表示を制御
        if (settings.showHints) {
            this.elements.termReading.style.display = 'block';
            this.elements.termMeaning.style.display = 'block';
        } else {
            this.elements.termReading.style.display = 'none';
            this.elements.termMeaning.style.display = 'none';
        }
        
        // 用語をフィルタリング
        if (this.medicalTerms.length > 0) {
            this.shuffledTerms = this.difficultyManager.filterTermsByDifficulty(this.medicalTerms);
            this.shuffledTerms = this.shuffleArray(this.shuffledTerms);
            this.currentTermIndex = 0;
            this.displayCurrentTerm();
        }
    }

    /**
     * 医療用語データを読み込む（難易度設定対応）
     */
    async loadMedicalTerms() {
        this.showLoading(true);
        
        try {
            // まずCSVファイルから読み込みを試行
            const csvData = await this.csvManager.loadFromFile('./medical-terms.csv');
            this.medicalTerms = csvData;
            this.showError(false);
        } catch (error) {
            console.warn('CSV読み込み失敗、デフォルトデータを使用:', error);
            // CSV読み込み失敗時はデフォルトデータを使用
            this.medicalTerms = defaultMedicalTerms;
            this.showError(true, 'CSVファイルが見つかりません。デフォルトの用語を使用します。');
        }
        
        // 初期難易度設定を適用
        this.applyDifficultySettings();
        
        this.showLoading(false);
        this.displayCurrentTerm();
    }

    /**
     * ファイル入力ハンドラ
     * @param {Event} event - ファイル入力イベント
     */
    async handleFileInput(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError(true, 'CSVファイルを選択してください。');
            return;
        }

        this.showLoading(true);
        
        try {
            const data = await this.csvManager.loadFromFileInput(file);
            this.medicalTerms = data;
            this.shuffledTerms = this.shuffleArray([...this.medicalTerms]);
            this.showError(false);
            this.displayCurrentTerm();
            alert(`${data.length}個の医療用語を読み込みました。`);
        } catch (error) {
            console.error('ファイル読み込みエラー:', error);
            this.showError(true, 'ファイルの読み込みに失敗しました。CSV形式を確認してください。');
        }
        
        this.showLoading(false);
    }

    /**
     * ローディング表示制御
     * @param {boolean} show - 表示するかどうか
     */
    showLoading(show) {
        if (this.elements.loadingArea) {
            this.elements.loadingArea.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * エラー表示制御
     * @param {boolean} show - 表示するかどうか
     * @param {string} message - エラーメッセージ
     */
    showError(show, message = '') {
        if (this.elements.errorArea) {
            this.elements.errorArea.style.display = show ? 'block' : 'none';
            if (show && message) {
                this.elements.errorArea.textContent = message;
            }
        }
    }

    /**
     * 配列をシャッフルする
     * @param {Array} array - シャッフルする配列
     * @returns {Array} シャッフルされた配列
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * ゲーム開始
     */
    /**
     * ゲーム開始（難易度設定対応）
     */
    startGame() {
        if (this.medicalTerms.length === 0) {
            alert('医療用語データが読み込まれていません。');
            return;
        }

        // 現在の難易度設定を適用
        this.applyDifficultySettings();

        this.isGameActive = true;
        this.startTime = Date.now();
        this.remainingTime = this.timeLimit;
        this.score = 0;
        this.totalTyped = 0;
        this.correctTyped = 0;
        this.termsCompleted = 0;
        this.currentTermIndex = 0;
        this.currentInput = '';
        
        // 難易度に応じて用語をフィルタリング
        this.shuffledTerms = this.difficultyManager.filterTermsByDifficulty(this.medicalTerms);
        this.shuffledTerms = this.shuffleArray(this.shuffledTerms);
        
        this.elements.startBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.inputField.disabled = false;
        this.elements.inputField.focus();
        this.elements.gameOver.style.display = 'none';
        
        this.displayCurrentTerm();
        this.startTimer();
        this.updateStats();
        
        console.log(`ゲーム開始: ${this.difficultyManager.getCurrentSettings().name}難易度, ${this.timeLimit}秒, ${this.shuffledTerms.length}問題`);
    }

    /**
     * タイマー開始
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.elements.timer.textContent = this.remainingTime;
            
            if (this.remainingTime <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * ゲーム終了
     */
    endGame() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        
        this.elements.inputField.disabled = true;
        this.elements.gameOver.style.display = 'block';
        this.elements.questionArea.style.display = 'none';
        this.elements.typingArea.style.display = 'none';
        
        this.displayFinalStats();
    }

    /**
     * 最終統計表示
     */
    displayFinalStats() {
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        const wpm = Math.round((this.correctTyped / 5) / (elapsedTime / 60));
        const accuracy = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
        
        this.elements.finalStats.innerHTML = `
            <div class="final-stat">
                <div class="final-stat-value">${this.score}</div>
                <div class="final-stat-label">最終スコア</div>
            </div>
            <div class="final-stat">
                <div class="final-stat-value">${this.termsCompleted}</div>
                <div class="final-stat-label">完了した用語</div>
            </div>
            <div class="final-stat">
                <div class="final-stat-value">${wpm}</div>
                <div class="final-stat-label">WPM</div>
            </div>
            <div class="final-stat">
                <div class="final-stat-value">${accuracy}%</div>
                <div class="final-stat-label">正確率</div>
            </div>
        `;
    }

    /**
     * ゲームリスタート
     */
    restartGame() {
        clearInterval(this.timerInterval);
        this.currentTermIndex = 0;
        this.currentInput = '';
        this.elements.inputField.value = '';
        this.elements.inputField.disabled = true;
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameOver.style.display = 'none';
        this.elements.questionArea.style.display = 'block';
        this.elements.typingArea.style.display = 'block';
        this.elements.timer.textContent = this.timeLimit;
        this.elements.progressFill.style.width = '0%';
        this.displayCurrentTerm();
        this.updateStats();
    }

    /**
     * 入力ハンドラ（複数ローマ字パターン対応）
     * @param {Event} e - 入力イベント
     */
    handleInput(e) {
        if (!this.isGameActive) return;
        
        this.currentInput = e.target.value;
        this.totalTyped = Math.max(this.totalTyped, this.currentInput.length);
        
        const currentTerm = this.shuffledTerms[this.currentTermIndex];
        
        // 複数のローマ字パターンをチェック
        if (this.romajiPatterns.isValidInput(this.currentInput, currentTerm.reading)) {
            // 完全一致 - 正解
            this.completeTerm();
            return;
        }
        
        // 部分入力チェック
        if (this.romajiPatterns.isPartiallyCorrect(this.currentInput, currentTerm.reading)) {
            // 正しい方向に進んでいる - 緑色表示
            e.target.style.backgroundColor = '#e8f5e8';
            e.target.style.borderColor = '#28a745';
        } else {
            // 間違った入力 - 赤色表示
            e.target.style.backgroundColor = '#ffeaea';
            e.target.style.borderColor = '#dc3545';
        }
        
        this.updateTargetDisplay();
        this.updateStats();
    }

    /**
     * キーダウンハンドラ（複数ローマ字パターン対応）
     * @param {Event} e - キーダウンイベント
     */
    handleKeyDown(e) {
        if (!this.isGameActive) return;
        
        // Enterキーで次の問題に進む（正解している場合のみ）
        if (e.key === 'Enter') {
            const currentTerm = this.shuffledTerms[this.currentTermIndex];
            if (this.romajiPatterns.isValidInput(this.currentInput, currentTerm.reading)) {
                this.completeTerm();
            }
        }
    }

    /**
     * 用語完了処理
     */
    completeTerm() {
        const currentTerm = this.shuffledTerms[this.currentTermIndex];
        this.score += currentTerm.romaji.length * 10;
        this.correctTyped += currentTerm.romaji.length;
        this.termsCompleted++;
        
        // 次の問題に進む
        setTimeout(() => {
            this.nextTerm();
        }, 500);
    }

    /**
     * 次の用語に進む（問題数制限対応）
     */
    nextTerm() {
        this.currentTermIndex++;
        
        // 問題数上限チェック
        const settings = this.difficultyManager.getCurrentSettings();
        if (this.currentTermIndex >= this.shuffledTerms.length || 
            this.termsCompleted >= settings.termCount) {
            this.endGame();
            return;
        }
        
        this.currentInput = '';
        this.elements.inputField.value = '';
        this.displayCurrentTerm();
        this.updateStats();
        
        if (this.isGameActive) {
            this.elements.inputField.focus();
        }
    }

    /**
     * 現在の用語を表示
     */
    /**
     * 現在の用語を表示（複数ローマ字パターン対応）
     */
    displayCurrentTerm() {
        if (this.shuffledTerms.length === 0) {
            this.elements.termJapanese.textContent = 'データを読み込み中...';
            this.elements.termReading.textContent = '';
            this.elements.termMeaning.textContent = '';
            this.elements.targetText.textContent = '';
            return;
        }

        const currentTerm = this.shuffledTerms[this.currentTermIndex];
        this.elements.termJapanese.textContent = currentTerm.japanese;
        this.elements.termReading.textContent = currentTerm.reading;
        this.elements.termMeaning.textContent = currentTerm.meaning;
        
        // 複数のローマ字パターンを表示
        const patterns = this.romajiPatterns.generateAllPatterns(currentTerm.reading);
        const mainPattern = currentTerm.romaji || patterns[0];
        const additionalPatterns = patterns.filter(p => p !== mainPattern);
        
        let displayText = mainPattern;
        if (additionalPatterns.length > 0) {
            displayText += ` (または: ${additionalPatterns.join(', ')})`;
        }
        this.elements.targetText.textContent = displayText;
        
        this.updateTargetDisplay();
    }

    /**
     * ターゲットテキストの表示更新
     */
    updateTargetDisplay() {
        if (this.shuffledTerms.length === 0) return;

        const currentTerm = this.shuffledTerms[this.currentTermIndex];
        const target = currentTerm.romaji;
        let displayHTML = '';
        
        for (let i = 0; i < target.length; i++) {
            const char = target[i];
            let className = '';
            
            if (i < this.currentInput.length) {
                if (this.currentInput[i] === char) {
                    className = 'char-correct';
                } else {
                    className = 'char-incorrect';
                }
            } else if (i === this.currentInput.length) {
                className = 'char-current';
            }
            
            displayHTML += `<span class="${className}">${char}</span>`;
        }
        
        this.elements.targetText.innerHTML = displayHTML;
        
        // プログレスバーの更新
        const progress = (this.currentInput.length / target.length) * 100;
        this.elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
    }

    /**
     * 統計情報の更新（難易度対応進捗表示）
     */
    updateStats() {
        this.elements.score.textContent = this.score;
        
        if (this.isGameActive && this.startTime) {
            const elapsedTime = (Date.now() - this.startTime) / 1000;
            const wpm = Math.round((this.correctTyped / 5) / (elapsedTime / 60)) || 0;
            this.elements.wpm.textContent = wpm;
            
            const accuracy = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
            this.elements.accuracy.textContent = accuracy;
        }
        
        // 問題進捗をプログレスバーに表示
        const settings = this.difficultyManager.getCurrentSettings();
        const totalProblems = Math.min(settings.termCount, this.shuffledTerms.length);
        const completedProblems = this.termsCompleted;
        const progressPercentage = (completedProblems / totalProblems) * 100;
        
        // プログレスバーに進捗を反映（時間ベースと問題数ベースの両方を考慮）
        const timeProgress = ((this.timeLimit - this.remainingTime) / this.timeLimit) * 100;
        const overallProgress = Math.max(progressPercentage, timeProgress);
        this.elements.progressFill.style.width = `${Math.min(overallProgress, 100)}%`;
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    new TypingGame();
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    // F5キーでリロードを防ぐ
    if (e.key === 'F5') {
        e.preventDefault();
    }
    
    // Escキーでゲームリセット
    if (e.key === 'Escape') {
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn.style.display !== 'none') {
            restartBtn.click();
        }
    }
});
