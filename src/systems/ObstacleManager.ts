import { Scene } from "babylonjs";
import { Obstacle, ObstacleType } from "../components/Obstacle";
import { Player } from "../components/Player";

export class ObstacleManager {
    private _scene: Scene;
    private _obstacles: Obstacle[] = [];
    private _spawnTimer: number = 0;
    private _spawnInterval: number = 1.5; // Seconds between spawns
    private _gameSpeed: number; // World units per second

    // Config
    private _laneWidth: number = 3;
    private _spawnZ: number = 50; // Spawn distance ahead
    private _despawnZ: number = -10; // Behind camera

    constructor(scene: Scene, gameSpeed: number) {
        this._scene = scene;
        this._gameSpeed = gameSpeed;
    }

    public update(deltaTime: number, player: Player, onObstacleHit: () => void): void {
        this._spawnTimer += deltaTime;

        // Spawning
        if (this._spawnTimer >= this._spawnInterval) {
            this._spawnObstacle();
            this._spawnTimer = 0;
        }

        // Movement & Cleanup & Collision
        for (let i = this._obstacles.length - 1; i >= 0; i--) {
            const obs = this._obstacles[i];
            obs.update(deltaTime, this._gameSpeed);

            // Access public mesh properly initialized in Obstacle constructor
            // Ensure world matrices are updated for accurate intersection after position change
            obs.mesh.computeWorldMatrix(true);
            player.mesh.computeWorldMatrix(true);

            if (obs.mesh.intersectsMesh(player.mesh, true)) {
                onObstacleHit();
                // Dispose immediately on hit to prevent multi-counting
                obs.dispose();
                this._obstacles.splice(i, 1);
                continue;
            }

            if (obs.mesh.position.z < this._despawnZ) {
                obs.dispose();
                this._obstacles.splice(i, 1);
            }
        }
    }

    private _spawnObstacle(): void {
        const lanes = [-1, 0, 1];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const posX = randomLane * -this._laneWidth; // Account for the -1 inversion in Player.ts

        const type = Math.random() > 0.5 ? ObstacleType.WALL : ObstacleType.BARRIER;

        const obstacle = new Obstacle(this._scene, type, this._spawnZ, posX);
        this._obstacles.push(obstacle);
    }
}
