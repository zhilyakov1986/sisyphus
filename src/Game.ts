import { SceneManager } from "./components/SceneManager";
import { InputManager } from "./systems/InputManager";
import { Player } from "./components/Player";
import { Ground } from "./components/Ground";
import { ObstacleManager } from "./systems/ObstacleManager";
import { Engine } from "babylonjs";

export class Game {
    private _sceneManager: SceneManager;
    private _inputManager: InputManager;
    private _player: Player;
    private _ground: Ground;
    private _obstacleManager: ObstacleManager;
    private _engine: Engine;

    constructor(canvas: HTMLCanvasElement) {
        this._sceneManager = new SceneManager(canvas);
        this._engine = this._sceneManager.engine;

        // Systems
        this._inputManager = new InputManager(this._sceneManager.scene);

        // Components
        this._ground = new Ground(this._sceneManager.scene);
        this._player = new Player(this._sceneManager.scene, this._inputManager);

        // Obstacles
        this._obstacleManager = new ObstacleManager(this._sceneManager.scene, Ground.WORLD_SPEED);
    }

    public start(): void {
        this._engine.runRenderLoop(() => {
            const deltaTime = this._engine.getDeltaTime() / 1000;

            this.update(deltaTime);
            this._sceneManager.scene.render();
        });
    }

    private update(deltaTime: number): void {
        this._inputManager.update();
        this._player.update(deltaTime);
        this._ground.update(deltaTime);
        this._obstacleManager.update(deltaTime, this._player);
    }
}
