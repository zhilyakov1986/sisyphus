import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3 } from "babylonjs";

export const ObstacleType = {
    WALL: 0,
    BARRIER: 1,
    SPIKE: 2
} as const;

export type ObstacleType = typeof ObstacleType[keyof typeof ObstacleType];

export class Obstacle {
    public mesh: Mesh;
    public type: ObstacleType;
    public active: boolean = true;
    private _scene: Scene;

    constructor(scene: Scene, type: ObstacleType, startZ: number, laneX: number) {
        this._scene = scene;
        this.type = type;
        this.mesh = this._createMesh(type);
        this.reset(startZ, laneX);
    }

    private _createMesh(type: ObstacleType): Mesh {
        let rootMesh: Mesh;
        const mat = new StandardMaterial("obsMat", this._scene);

        if (type === ObstacleType.WALL) {
            // WALL -> GREEK COLUMN
            // Invisible Collision Box
            rootMesh = MeshBuilder.CreateBox("columnRoot", { width: 1.5, height: 4, depth: 1.5 }, this._scene);
            rootMesh.isVisible = false; // Collision only
            rootMesh.position.y = 2; // Center of 4 height is 2

            // Visuals
            const marbleMat = new StandardMaterial("marbleMat", this._scene);
            marbleMat.diffuseColor = new Color3(0.9, 0.9, 0.9);

            // Base
            const base = MeshBuilder.CreateCylinder("base", { diameter: 1.4, height: 0.4 }, this._scene);
            base.parent = rootMesh;
            base.position.y = -1.8; // Relative to center (2) -> 0.2
            base.material = marbleMat;

            // Shaft
            const shaft = MeshBuilder.CreateCylinder("shaft", { diameter: 1.0, height: 3.2, tessellation: 16 }, this._scene);
            shaft.parent = rootMesh;
            shaft.position.y = 0;
            shaft.material = marbleMat;

            // Capital (top)
            const capital = MeshBuilder.CreateBox("capital", { width: 1.4, depth: 1.4, height: 0.4 }, this._scene);
            capital.parent = rootMesh;
            capital.position.y = 1.8;
            capital.material = marbleMat;

            mat.diffuseColor = Color3.Red(); // Fallback for root if made visible
        } else if (type === ObstacleType.BARRIER) {
            // BARRIER -> WOODEN HURDLE
            // Invisible Collision Box
            rootMesh = MeshBuilder.CreateBox("hurdleRoot", { width: 2.5, height: 1, depth: 0.5 }, this._scene);
            rootMesh.isVisible = false;
            rootMesh.position.y = 0.5;

            // Visuals
            const woodMat = new StandardMaterial("woodMat", this._scene);
            woodMat.diffuseColor = new Color3(0.6, 0.4, 0.2); // Brown

            // Left Post
            const leftPost = MeshBuilder.CreateCylinder("postL", { diameter: 0.2, height: 1.2 }, this._scene);
            leftPost.parent = rootMesh;
            leftPost.position.x = -1.0;
            leftPost.material = woodMat;

            // Right Post
            const rightPost = MeshBuilder.CreateCylinder("postR", { diameter: 0.2, height: 1.2 }, this._scene);
            rightPost.parent = rootMesh;
            rightPost.position.x = 1.0;
            rightPost.material = woodMat;

            // Plank
            const plank = MeshBuilder.CreateBox("plank", { width: 2.4, height: 0.3, depth: 0.1 }, this._scene);
            plank.parent = rootMesh;
            plank.position.y = 0.3; // Near top
            plank.material = woodMat;

            mat.diffuseColor = Color3.Purple();
        } else {
            // SPIKE -> SPIKE TRAP CLUSTER
            // Invisible Collision Box (Smaller to require precise hit?) 
            // Or same size. Let's keep it fair.
            rootMesh = MeshBuilder.CreateBox("spikeRoot", { width: 1.5, height: 0.8, depth: 1.5 }, this._scene);
            rootMesh.isVisible = false;
            rootMesh.position.y = 0.4;

            // Visuals
            const metalMat = new StandardMaterial("metalMat", this._scene);
            metalMat.diffuseColor = new Color3(0.4, 0.4, 0.5); // Blue-ish Grey

            // Cluster of 3 spikes
            const positions = [
                { x: 0, z: 0 },
                { x: -0.4, z: -0.4 },
                { x: 0.4, z: 0.4 }
            ];

            positions.forEach((pos, idx) => {
                const spike = MeshBuilder.CreateCylinder("spike" + idx, {
                    diameterTop: 0,
                    diameterBottom: 0.5,
                    height: 1.2,
                    tessellation: 4
                }, this._scene);
                spike.parent = rootMesh;
                spike.position.x = pos.x;
                spike.position.z = pos.z;
                spike.position.y = -0.2; // Adjust vertical pos relative to root center (0.4) so base is at 0
                // Root Y=0.4. Height/2=0.4. Bottom is at 0.
                // Spike Height 1.2. Half=0.6. 
                // To have spike base at 0, Center must be at 0.6.
                // Relative P: 0.6 - 0.4 = +0.2?
                // Wait. Root is at (0, 0.4, 0).
                // Child at (0, y, 0) -> World (0, 0.4+y, 0).
                // We want World Y = 0.6 (Center of spike).
                // 0.4 + y = 0.6 => y = 0.2.
                spike.position.y = 0.2;
                spike.material = metalMat;
            });

            mat.diffuseColor = new Color3(0.5, 0, 0);
        }

        rootMesh.material = mat;
        return rootMesh;
    }

    public reset(startZ: number, laneX: number): void {
        this.mesh.position.x = laneX;
        this.mesh.position.z = startZ;
        this.activate();
    }

    public activate(): void {
        this.active = true;
        this.mesh.setEnabled(true);
    }

    public deactivate(): void {
        this.active = false;
        this.mesh.setEnabled(false);
    }

    public update(deltaTime: number, speed: number): void {
        if (!this.active) return;
        this.mesh.position.z -= speed * deltaTime;
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
