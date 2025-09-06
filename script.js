/**
 * CSV管理クラス
 * CSVファイルから医療用語データを読み込み・管理する
 */
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
        this.timeLimit = 60; // 60秒
        this.timerInterval = null;
        this.remainingTime = this.timeLimit;
        this.score = 0;
        this.totalTyped = 0;
        this.correctTyped = 0;
        this.termsCompleted = 0;
        
        this.csvManager = new CSVManager();
        this.medicalTerms = [];
        this.shuffledTerms = [];
        
        this.initializeElements();
        this.bindEvents();
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
            errorArea: document.getElementById('errorArea')
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
     * 医療用語データを読み込む
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
        
        this.shuffledTerms = this.shuffleArray([...this.medicalTerms]);
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
    startGame() {
        if (this.medicalTerms.length === 0) {
            alert('医療用語データが読み込まれていません。');
            return;
        }

        this.isGameActive = true;
        this.startTime = Date.now();
        this.remainingTime = this.timeLimit;
        this.score = 0;
        this.totalTyped = 0;
        this.correctTyped = 0;
        this.termsCompleted = 0;
        this.currentTermIndex = 0;
        this.currentInput = '';
        
        this.shuffledTerms = this.shuffleArray([...this.medicalTerms]);
        
        this.elements.startBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.inputField.disabled = false;
        this.elements.inputField.focus();
        this.elements.gameOver.style.display = 'none';
        
        this.displayCurrentTerm();
        this.startTimer();
        this.updateStats();
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
     * 入力ハンドラ
     * @param {Event} e - 入力イベント
     */
    handleInput(e) {
        if (!this.isGameActive) return;
        
        this.currentInput = e.target.value;
        this.totalTyped = Math.max(this.totalTyped, this.currentInput.length);
        this.updateTargetDisplay();
        this.updateStats();
        
        const currentTerm = this.shuffledTerms[this.currentTermIndex];
        if (this.currentInput === currentTerm.romaji) {
            this.completeTerm();
        }
    }

    /**
     * キーダウンハンドラ
     * @param {Event} e - キーダウンイベント
     */
    handleKeyDown(e) {
        if (!this.isGameActive) return;
        
        // Enterキーで次の問題に進む（正解している場合のみ）
        if (e.key === 'Enter') {
            const currentTerm = this.shuffledTerms[this.currentTermIndex];
            if (this.currentInput === currentTerm.romaji) {
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
     * 次の用語に進む
     */
    nextTerm() {
        this.currentTermIndex = (this.currentTermIndex + 1) % this.shuffledTerms.length;
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
     * 統計情報の更新
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
