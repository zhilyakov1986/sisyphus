import { SceneManager } from "./components/SceneManager";
import { InputManager } from "./systems/InputManager";
import { Player } from "./components/Player";
import { Ground } from "./components/Ground";
import { ObstacleManager } from "./systems/ObstacleManager";
import { Boulder } from "./components/Boulder";
import { Engine } from "babylonjs";

export class Game {
    private _sceneManager: SceneManager;
    private _inputManager: InputManager;
    private _player: Player;
    private _ground: Ground;
    private _obstacleManager: ObstacleManager;
    private _boulder: Boulder;
    private _engine: Engine;

    // Game State
    private _isGameOver: boolean = false;
    private _boulderDistance: number = 15; // Starting distance
    private _minDistance: number = 3; // Game Over distance
    private _maxDistance: number = 15;
    private _recoveryRate: number = 1; // Distance regained per second
    private _penalty: number = 5; // Distance lost per hit

    constructor(canvas: HTMLCanvasElement) {
        this._sceneManager = new SceneManager(canvas);
        this._engine = this._sceneManager.engine;

        // Systems
        this._inputManager = new InputManager(this._sceneManager.scene);

        // Components
        this._ground = new Ground(this._sceneManager.scene);
        this._player = new Player(this._sceneManager.scene, this._inputManager);
        this._boulder = new Boulder(this._sceneManager.scene);

        // Obstacles
        this._obstacleManager = new ObstacleManager(this._sceneManager.scene, Ground.WORLD_SPEED);
    }

    public start(): void {
        this._engine.runRenderLoop(() => {
            if (this._isGameOver) return;

            // Clamp deltaTime to max 0.1s (100ms) to prevent huge steps on startup/lag
            const deltaTime = Math.min(this._engine.getDeltaTime() / 1000, 0.1);

            this.update(deltaTime);
            this._sceneManager.scene.render();
        });
    }

    private update(deltaTime: number): void {
        this._inputManager.update();
        this._player.update(deltaTime);
        this._ground.update(deltaTime);

        // Boulder Logic
        // Recover distance slowly
        this._boulderDistance = Math.min(this._maxDistance, this._boulderDistance + this._recoveryRate * deltaTime);

        // Check Game Over
        if (this._boulderDistance <= this._minDistance) {
            this._gameOver();
        }

        this._boulder.update(deltaTime, this._boulderDistance, Ground.WORLD_SPEED);

        this._obstacleManager.update(deltaTime, this._player, () => {
            this._onObstacleHit();
        });
    }

    private _onObstacleHit(): void {
        console.log(`Stumble! Distance: ${this._boulderDistance}`);
        this._boulderDistance -= this._penalty;
    }

    private _gameOver(): void {
        this._isGameOver = true;
        console.log("GAME OVER");
        // alert("GAME OVER! The Boulder Caught You.");
        // location.reload();
    }
}
