export class ScoreManager {
    private _score: number = 0;
    private _bestScore: number = 0;

    // UI Elements
    private _scoreElement!: HTMLElement;
    private _bestScoreElement!: HTMLElement;
    private _container!: HTMLElement;

    constructor() {
        this._loadBestScore();
        this._createUI();
    }

    private _loadBestScore(): void {
        const saved = localStorage.getItem("sisyphus_best_score");
        this._bestScore = saved ? parseInt(saved) : 0;
    }

    private _saveBestScore(): void {
        if (this._score > this._bestScore) {
            this._bestScore = Math.floor(this._score);
            localStorage.setItem("sisyphus_best_score", this._bestScore.toString());
            this._updateUI();
        }
    }

    private _createUI(): void {
        this._container = document.createElement("div");
        this._container.style.position = "absolute";
        this._container.style.top = "20px";
        this._container.style.right = "20px";
        this._container.style.color = "white";
        this._container.style.fontFamily = "monospace";
        this._container.style.fontSize = "24px";
        this._container.style.textAlign = "right";
        this._container.style.pointerEvents = "none";
        this._container.style.textShadow = "2px 2px 0 #000";

        this._scoreElement = document.createElement("div");
        this._bestScoreElement = document.createElement("div");
        this._bestScoreElement.style.fontSize = "16px";
        this._bestScoreElement.style.color = "#aaa";

        this._container.appendChild(this._scoreElement);
        this._container.appendChild(this._bestScoreElement);
        document.body.appendChild(this._container);

        this._updateUI();
    }

    private _updateUI(): void {
        this._scoreElement.innerText = `DIST: ${Math.floor(this._score)}`;
        this._bestScoreElement.innerText = `BEST: ${this._bestScore}`;
    }

    public addScore(amount: number): void {
        this._score += amount;
        this._checkBestScore();
        this._updateUI();
    }

    // Check periodically or only on game over? Let's check always for live update
    private _checkBestScore(): void {
        if (this._score > this._bestScore) {
            this._bestScore = Math.floor(this._score);
            // Don't spam localStorage every frame, save on Game Over usually, 
            // but for simple UI update we can set the prop.
        }
    }

    public get currentScore(): number {
        return Math.floor(this._score);
    }

    public save(): void {
        this._saveBestScore();
    }

    public reset(): void {
        this._score = 0;
        this._updateUI();
    }
}
