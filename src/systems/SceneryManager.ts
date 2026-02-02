import { Scene, TransformNode } from "babylonjs";
import { Tree } from "../components/Tree";
import { ObjectPool } from "./ObjectPool";

export class SceneryManager {
    private _scene: Scene;
    private _activeTrees: Tree[] = [];
    private _treePool: ObjectPool<Tree>;

    private _spawnTimer: number = 0;
    private _spawnInterval: number = 0.05; // Very Frequent trees (High Density)
    private _gameSpeed: number;

    private _spawnZ: number = 60; // Further ahead
    private _despawnZ: number = -15;

    constructor(scene: Scene, gameSpeed: number, worldRoot: TransformNode) {
        this._scene = scene;
        this._gameSpeed = gameSpeed;

        this._treePool = new ObjectPool<Tree>(
            () => {
                const t = new Tree(this._scene, -999, 0);
                t.mesh.parent = worldRoot;
                t.deactivate();
                return t;
            },
            () => { },
            150 // Large Pool size for dense forest
        );
    }

    public update(deltaTime: number, speedMultiplier: number): void {
        this._spawnTimer += deltaTime;
        const currentInterval = this._spawnInterval / speedMultiplier;

        if (this._spawnTimer >= currentInterval) {
            // Spawn multiple trees per tick for density
            this._spawnTree();
            this._spawnTree();
            this._spawnTimer = 0;
        }

        const currentSpeed = this._gameSpeed * speedMultiplier;

        for (let i = this._activeTrees.length - 1; i >= 0; i--) {
            const tree = this._activeTrees[i];
            tree.update(deltaTime, currentSpeed);

            if (tree.mesh.position.z < this._despawnZ) {
                this._returnToPool(tree);
                this._activeTrees.splice(i, 1);
            }
        }
    }

    private _spawnTree(): void {
        const tree = this._treePool.get();

        // Random side: Left (-1) or Right (1)
        const side = Math.random() < 0.5 ? -1 : 1;

        // Random distance from center (8 to 50) - Wide spread
        const offset = 8 + Math.random() * 42;
        const xPos = side * offset;

        // Add slight random variation to Z so they don't form perfect lines
        const zOffset = (Math.random() - 0.5) * 5;

        tree.reset(this._spawnZ + zOffset, xPos);

        // Random scale for variety
        const scale = 0.8 + Math.random() * 0.7; // 0.8 to 1.5
        tree.mesh.scaling.setAll(scale);

        this._activeTrees.push(tree);
    }

    private _returnToPool(tree: Tree): void {
        tree.deactivate();
        this._treePool.return(tree);
    }
}
