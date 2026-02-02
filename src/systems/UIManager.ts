export class UIManager {
    private _container!: HTMLElement;
    private _scoreElement!: HTMLElement;
    private _bestScoreElement!: HTMLElement;
    private _overlay!: HTMLElement;
    private _titleElement!: HTMLElement;
    private _subtitleElement!: HTMLElement;

    constructor() {
        this._createUI();
    }

    private _createUI(): void {
        // Main Container
        this._container = document.createElement("div");
        this._container.id = "game-ui";
        this._container.style.position = "absolute";
        this._container.style.top = "0";
        this._container.style.left = "0";
        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.pointerEvents = "none"; // Let clicks pass through to game when playing
        this._container.style.fontFamily = "'Courier New', Courier, monospace";
        this._container.style.userSelect = "none";
        document.body.appendChild(this._container);

        // HUD (Top Right)
        const hud = document.createElement("div");
        hud.style.position = "absolute";
        hud.style.top = "20px";
        hud.style.right = "20px";
        hud.style.textAlign = "right";
        hud.style.color = "white";
        hud.style.textShadow = "2px 2px 0 #000";

        this._scoreElement = document.createElement("div");
        this._scoreElement.style.fontSize = "24px";
        this._scoreElement.innerText = "DIST: 0";

        this._bestScoreElement = document.createElement("div");
        this._bestScoreElement.style.fontSize = "16px";
        this._bestScoreElement.style.color = "#aaa";
        this._bestScoreElement.innerText = "BEST: 0";

        hud.appendChild(this._scoreElement);
        hud.appendChild(this._bestScoreElement);
        this._container.appendChild(hud);

        // Overlay (Start / Pause / Game Over)
        this._overlay = document.createElement("div");
        this._overlay.style.position = "absolute";
        this._overlay.style.top = "0";
        this._overlay.style.left = "0";
        this._overlay.style.width = "100%";
        this._overlay.style.height = "100%";
        this._overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        this._overlay.style.display = "flex";
        this._overlay.style.flexDirection = "column";
        this._overlay.style.justifyContent = "center";
        this._overlay.style.alignItems = "center";
        this._overlay.style.color = "#FFD700"; // Gold
        this._overlay.style.textShadow = "0 0 10px #FF4500"; // Orange glow

        this._titleElement = document.createElement("h1");
        this._titleElement.style.fontSize = "64px";
        this._titleElement.style.margin = "0 0 20px 0";
        this._titleElement.innerText = "SISYPHUS";

        this._subtitleElement = document.createElement("div");
        this._subtitleElement.style.fontSize = "24px";
        this._subtitleElement.style.color = "white";
        this._subtitleElement.style.animation = "blink 1s infinite";
        this._subtitleElement.innerText = "PRESS ANY KEY TO START";

        // Add blink animation style
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        this._overlay.appendChild(this._titleElement);
        this._overlay.appendChild(this._subtitleElement);
        this._container.appendChild(this._overlay);
    }

    public updateHUD(score: number, bestScore: number): void {
        this._scoreElement.innerText = `DIST: ${Math.floor(score)}`;
        this._bestScoreElement.innerText = `BEST: ${bestScore}`;
    }

    public showStartScreen(): void {
        this._overlay.style.display = "flex";
        this._titleElement.innerText = "SISYPHUS";
        this._subtitleElement.innerText = "PRESS ANY KEY TO START";
        this._container.style.pointerEvents = "auto";
    }

    public showHUD(): void {
        this._overlay.style.display = "none";
        this._container.style.pointerEvents = "none";
    }

    public showPauseMenu(): void {
        this._overlay.style.display = "flex";
        this._titleElement.innerText = "PAUSED";
        this._subtitleElement.innerText = "PRESS ESC TO RESUME";
        this._container.style.pointerEvents = "auto";
    }

    public showGameOver(score: number): void {
        this._overlay.style.display = "flex";
        this._titleElement.innerText = "CRUSHED";
        this._subtitleElement.innerHTML = `FINAL DISTANCE: ${Math.floor(score)}<br><span style='font-size:16px; color:#aaa'>PRESS ENTER TO RESTART</span>`;
        this._container.style.pointerEvents = "auto";
    }
}
