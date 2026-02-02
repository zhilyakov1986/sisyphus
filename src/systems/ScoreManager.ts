export class ScoreManager {
    private _score: number = 0;
    private _bestScore: number = 0;

    constructor() {
        this._loadBestScore();
    }

    private _loadBestScore(): void {
        const saved = localStorage.getItem("sisyphus_best_score");
        this._bestScore = saved ? parseInt(saved) : 0;
    }

    private _saveBestScore(): void {
        if (this._score > this._bestScore) {
            this._bestScore = Math.floor(this._score);
            localStorage.setItem("sisyphus_best_score", this._bestScore.toString());
        }
    }

    public addScore(amount: number): void {
        this._score += amount;
        this._checkBestScore();
    }

    private _checkBestScore(): void {
        if (this._score > this._bestScore) {
            this._bestScore = Math.floor(this._score);
        }
    }

    public get currentScore(): number {
        return Math.floor(this._score);
    }

    public get bestScore(): number {
        return this._bestScore;
    }

    public save(): void {
        this._saveBestScore();
    }

    public reset(): void {
        this._score = 0;
    }
}
