import { Scene, TransformNode } from "babylonjs";
import { Obstacle, ObstacleType } from "../components/Obstacle";
import { Powerup, PowerupType } from "../components/Powerup";
import { Player } from "../components/Player";
import { ObjectPool } from "./ObjectPool";

export class ObstacleManager {
    private _scene: Scene;
    private _activeObstacles: Obstacle[] = [];
    private _activePowerups: Powerup[] = [];

    private _spawnTimer: number = 0;
    private _spawnInterval: number = 1.5;
    private _gameSpeed: number;

    // Pools
    private _wallPool: ObjectPool<Obstacle>;
    private _barrierPool: ObjectPool<Obstacle>;
    private _spikePool: ObjectPool<Obstacle>;
    private _powerupPool: ObjectPool<Powerup>;

    // Config
    private _laneWidth: number = 3;
    private _spawnZ: number = 50;
    private _despawnZ: number = -10;

    constructor(scene: Scene, gameSpeed: number, worldRoot: TransformNode) {
        this._scene = scene;
        this._gameSpeed = gameSpeed;

        // Initialize Obstacle Pools
        this._wallPool = new ObjectPool<Obstacle>(
            () => {
                const o = new Obstacle(this._scene, ObstacleType.WALL, -999, 0);
                o.mesh.parent = worldRoot;
                o.deactivate();
                return o;
            },
            () => { },
            10
        );

        this._barrierPool = new ObjectPool<Obstacle>(
            () => {
                const o = new Obstacle(this._scene, ObstacleType.BARRIER, -999, 0);
                o.mesh.parent = worldRoot;
                o.deactivate();
                return o;
            },
            () => { },
            10
        );

        this._spikePool = new ObjectPool<Obstacle>(
            () => {
                const o = new Obstacle(this._scene, ObstacleType.SPIKE, -999, 0);
                o.mesh.parent = worldRoot;
                o.deactivate();
                return o;
            },
            () => { },
            10
        );

        // Powerup Pool
        this._powerupPool = new ObjectPool<Powerup>(
            () => {
                const p = new Powerup(this._scene, PowerupType.SHIELD, -999, 0);
                p.mesh.parent = worldRoot;
                p.deactivate();
                return p;
            },
            () => { },
            5
        );
    }

    public update(deltaTime: number, player: Player, onObstacleHit: () => void, speedMultiplier: number): void {
        this._spawnTimer += deltaTime;
        const currentInterval = this._spawnInterval / speedMultiplier;

        if (this._spawnTimer >= currentInterval) {
            this._spawnObject();
            this._spawnTimer = 0;
        }

        const currentSpeed = this._gameSpeed * speedMultiplier;

        // Update Obstacles
        for (let i = this._activeObstacles.length - 1; i >= 0; i--) {
            const obs = this._activeObstacles[i];
            obs.update(deltaTime, currentSpeed);

            obs.mesh.computeWorldMatrix(true);
            player.mesh.computeWorldMatrix(true);

            if (obs.mesh.intersectsMesh(player.mesh, true)) {
                // Check if shield absorbs hits
                if (player.absorbHit()) {
                    console.log("Shield absorbed hit!");
                } else {
                    onObstacleHit();
                }

                this._returnObstacleToPool(obs);
                this._activeObstacles.splice(i, 1);
                continue;
            }

            if (obs.mesh.position.z < this._despawnZ) {
                this._returnObstacleToPool(obs);
                this._activeObstacles.splice(i, 1);
            }
        }

        // Update Powerups
        for (let i = this._activePowerups.length - 1; i >= 0; i--) {
            const p = this._activePowerups[i];
            p.update(deltaTime, currentSpeed);

            p.mesh.computeWorldMatrix(true);
            player.mesh.computeWorldMatrix(true);

            if (p.mesh.intersectsMesh(player.mesh, true)) {
                if (p.type === PowerupType.SHIELD) {
                    player.grantShield();
                    console.log("Shield powerup collected!");
                }
                this._returnPowerupToPool(p);
                this._activePowerups.splice(i, 1);
                continue;
            }

            if (p.mesh.position.z < this._despawnZ) {
                this._returnPowerupToPool(p);
                this._activePowerups.splice(i, 1);
            }
        }
    }

    private _spawnObject(): void {
        const lanes = [-1, 0, 1];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const posX = randomLane * -this._laneWidth;

        const rand = Math.random();
        if (rand < 0.1) {
            // Spawn Powerup
            const powerup = this._powerupPool.get();
            powerup.reset(this._spawnZ, posX);
            this._activePowerups.push(powerup);
        } else {
            // Spawn Obstacle
            const typeRand = Math.random();
            let obstacle: Obstacle;

            if (typeRand < 0.33) {
                obstacle = this._wallPool.get();
            } else if (typeRand < 0.66) {
                obstacle = this._barrierPool.get();
            } else {
                obstacle = this._spikePool.get();
            }

            obstacle.reset(this._spawnZ, posX);
            this._activeObstacles.push(obstacle);
        }
    }

    private _returnObstacleToPool(obs: Obstacle): void {
        obs.deactivate();
        if (obs.type === ObstacleType.WALL) {
            this._wallPool.return(obs);
        } else if (obs.type === ObstacleType.BARRIER) {
            this._barrierPool.return(obs);
        } else {
            this._spikePool.return(obs);
        }
    }

    private _returnPowerupToPool(p: Powerup): void {
        p.deactivate();
        this._powerupPool.return(p);
    }
}
