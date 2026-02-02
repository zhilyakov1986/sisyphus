import { Scene } from "babylonjs";
import { Obstacle, ObstacleType } from "../components/Obstacle";
import { Player } from "../components/Player";
import { ObjectPool } from "./ObjectPool";

export class ObstacleManager {
    private _scene: Scene;
    private _activeObstacles: Obstacle[] = [];
    private _spawnTimer: number = 0;
    private _spawnInterval: number = 1.5;
    private _gameSpeed: number;

    // Pools
    private _wallPool: ObjectPool<Obstacle>;
    private _barrierPool: ObjectPool<Obstacle>;

    // Config
    private _laneWidth: number = 3;
    private _spawnZ: number = 50;
    private _despawnZ: number = -10;

    constructor(scene: Scene, gameSpeed: number) {
        this._scene = scene;
        this._gameSpeed = gameSpeed;

        // Initialize Pools
        this._wallPool = new ObjectPool<Obstacle>(
            () => {
                const o = new Obstacle(this._scene, ObstacleType.WALL, -999, 0);
                o.deactivate();
                return o;
            },
            () => { }, // We manually reset in spawn
            10 // Start with 10 walls
        );

        this._barrierPool = new ObjectPool<Obstacle>(
            () => {
                const o = new Obstacle(this._scene, ObstacleType.BARRIER, -999, 0);
                o.deactivate();
                return o;
            },
            () => { },
            10
        );
    }

    public update(deltaTime: number, player: Player, onObstacleHit: () => void, speedMultiplier: number): void {
        this._spawnTimer += deltaTime;
        const currentInterval = this._spawnInterval / speedMultiplier;

        if (this._spawnTimer >= currentInterval) {
            this._spawnObstacle();
            this._spawnTimer = 0;
        }

        const currentSpeed = this._gameSpeed * speedMultiplier;

        for (let i = this._activeObstacles.length - 1; i >= 0; i--) {
            const obs = this._activeObstacles[i];
            obs.update(deltaTime, currentSpeed);

            obs.mesh.computeWorldMatrix(true);
            player.mesh.computeWorldMatrix(true);

            if (obs.mesh.intersectsMesh(player.mesh, true)) {
                onObstacleHit();
                this._returnToPool(obs);
                this._activeObstacles.splice(i, 1);
                continue;
            }

            if (obs.mesh.position.z < this._despawnZ) {
                this._returnToPool(obs);
                this._activeObstacles.splice(i, 1);
            }
        }
    }

    private _spawnObstacle(): void {
        const lanes = [-1, 0, 1];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const posX = randomLane * -this._laneWidth;

        const type = Math.random() > 0.5 ? ObstacleType.WALL : ObstacleType.BARRIER;
        let obstacle: Obstacle;

        if (type === ObstacleType.WALL) {
            obstacle = this._wallPool.get();
        } else {
            obstacle = this._barrierPool.get();
        }

        obstacle.reset(this._spawnZ, posX);
        this._activeObstacles.push(obstacle);
    }

    private _returnToPool(obs: Obstacle): void {
        obs.deactivate();
        if (obs.type === ObstacleType.WALL) {
            this._wallPool.return(obs);
        } else {
            this._barrierPool.return(obs);
        }
    }
}
