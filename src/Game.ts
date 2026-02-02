import { SceneManager } from "./components/SceneManager";
import { InputManager } from "./systems/InputManager";
import { Player } from "./components/Player";
import { Ground } from "./components/Ground";
import { ObstacleManager } from "./systems/ObstacleManager";
import { Boulder } from "./components/Boulder";
import { ScoreManager } from "./systems/ScoreManager";
import { UIManager } from "./systems/UIManager";
import { SceneryManager } from "./systems/SceneryManager";
import { Engine, TransformNode } from "babylonjs";

const GameState = {
    START: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAMEOVER: 3
} as const;

type GameState = typeof GameState[keyof typeof GameState];

export class Game {
    private _sceneManager: SceneManager;
    private _inputManager: InputManager;
    private _player: Player;
    private _ground: Ground;
    private _obstacleManager: ObstacleManager;
    private _boulder: Boulder;
    private _scoreManager: ScoreManager;
    private _uiManager: UIManager;
    private _sceneryManager: SceneryManager;
    private _engine: Engine;

    // World Root for Slope
    private _worldRoot: TransformNode;

    // Game State
    private _state: GameState = GameState.START;
    private _boulderDistance: number = 15; // Starting distance
    private _minDistance: number = 3; // Game Over distance
    private _maxDistance: number = 15;
    private _recoveryRate: number = 1; // Distance regained per second
    private _penalty: number = 5; // Distance lost per hit

    // Difficulty
    private _totalTime: number = 0;
    private _speedMultiplier: number = 1.0;
    private _difficultyInterval: number = 20; // Increase speed every 20s

    // FX
    private _shakeIntensity: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this._sceneManager = new SceneManager(canvas);
        this._engine = this._sceneManager.engine;

        // Setup World Root (Slope)
        this._worldRoot = new TransformNode("worldRoot", this._sceneManager.scene);
        this._worldRoot.rotation.x = Math.PI / 8; // Tilt world DOWN (Downhill)

        // Systems
        this._inputManager = new InputManager();
        this._scoreManager = new ScoreManager();
        this._uiManager = new UIManager();

        // Components (Parented to World Root)
        this._ground = new Ground(this._sceneManager.scene);
        this._ground.mesh.parent = this._worldRoot;

        this._player = new Player(this._sceneManager.scene, this._inputManager);
        this._player.mesh.parent = this._worldRoot;

        this._boulder = new Boulder(this._sceneManager.scene);
        this._boulder.mesh.parent = this._worldRoot;

        // Obstacles (Pass worldRoot)
        this._obstacleManager = new ObstacleManager(this._sceneManager.scene, Ground.WORLD_SPEED, this._worldRoot);
        this._sceneryManager = new SceneryManager(this._sceneManager.scene, Ground.WORLD_SPEED, this._worldRoot);

        // Initial UI State
        this._uiManager.showStartScreen();
        this._uiManager.updateHUD(0, this._scoreManager.bestScore);

        // Listen for global keys for state management (Start/Pause)
        window.addEventListener("keydown", (e) => this._handleGlobalInput(e));
    }

    private _handleGlobalInput(e: KeyboardEvent): void {
        if (this._state === GameState.START) {
            this._startGame();
        } else if (this._state === GameState.PLAYING) {
            if (e.key === "Escape") {
                this._pauseGame();
            }
        } else if (this._state === GameState.PAUSED) {
            if (e.key === "Escape") {
                this._resumeGame();
            }
        } else if (this._state === GameState.GAMEOVER) {
            if (e.key === "Enter") {
                location.reload();
            }
        }
    }

    private _startGame(): void {
        this._state = GameState.PLAYING;
        this._uiManager.showHUD();
    }

    private _pauseGame(): void {
        this._state = GameState.PAUSED;
        this._uiManager.showPauseMenu();
    }

    private _resumeGame(): void {
        this._state = GameState.PLAYING;
        this._uiManager.showHUD();
    }

    public start(): void {
        this._engine.runRenderLoop(() => {
            // Clamp deltaTime to max 0.1s (100ms) to prevent huge steps on startup/lag
            const deltaTime = Math.min(this._engine.getDeltaTime() / 1000, 0.1);

            if (this._state === GameState.PLAYING) {
                this.update(deltaTime);
            }

            this._sceneManager.scene.render();
        });
    }

    private update(deltaTime: number): void {
        this._inputManager.update();
        this._player.update(deltaTime);

        // Difficulty Scaling
        this._totalTime += deltaTime;
        // Increase speed by 2.5% every 20 seconds
        const difficultyStage = Math.floor(this._totalTime / this._difficultyInterval);
        this._speedMultiplier = 1.0 + (difficultyStage * 0.025);

        // Score based on distance (speed * time)
        const frameDistance = (Ground.WORLD_SPEED * this._speedMultiplier) * deltaTime;
        this._scoreManager.addScore(frameDistance);
        this._uiManager.updateHUD(this._scoreManager.currentScore, this._scoreManager.bestScore);

        this._ground.update(deltaTime, this._speedMultiplier);

        // Boulder Logic
        // Recover distance slowly
        this._boulderDistance = Math.min(this._maxDistance, this._boulderDistance + this._recoveryRate * deltaTime);

        // Check Game Over
        if (this._boulderDistance <= this._minDistance) {
            this._gameOver();
        }

        // Pass calculated world speed (Base * Multiplier) to Boulder
        const currentWorldSpeed = Ground.WORLD_SPEED * this._speedMultiplier;
        this._boulder.update(deltaTime, this._boulderDistance, currentWorldSpeed);

        this._obstacleManager.update(deltaTime, this._player, () => {
            this._onObstacleHit();
        }, this._speedMultiplier);

        this._sceneryManager.update(deltaTime, this._speedMultiplier);

        // Camera Shake Logic
        if (this._shakeIntensity > 0) {
            const shakeAmount = this._shakeIntensity;
            const xOffset = (Math.random() - 0.5) * shakeAmount;
            const yOffset = (Math.random() - 0.5) * shakeAmount;

            // Apply simple target offset
            if (this._sceneManager.scene.activeCamera) {
                // @ts-ignore - target exists on ArcRotateCamera
                this._sceneManager.scene.activeCamera.target.x = xOffset;
                // @ts-ignore
                this._sceneManager.scene.activeCamera.target.y = yOffset;
            }

            // Decay
            this._shakeIntensity -= deltaTime * 3; // Decay faster
            if (this._shakeIntensity < 0) {
                this._shakeIntensity = 0;
                if (this._sceneManager.scene.activeCamera) {
                    // @ts-ignore
                    this._sceneManager.scene.activeCamera.target.x = 0;
                    // @ts-ignore
                    this._sceneManager.scene.activeCamera.target.y = 0;
                }
            }
        }
    }

    private _onObstacleHit(): void {
        console.log(`Stumble! Distance: ${this._boulderDistance}`);
        this._boulderDistance -= this._penalty;

        // Trigger Shake
        this._shakeIntensity = 1.5;
    }

    private _gameOver(): void {
        this._state = GameState.GAMEOVER;
        this._scoreManager.save();
        this._uiManager.showGameOver(this._scoreManager.currentScore);
    }
}
