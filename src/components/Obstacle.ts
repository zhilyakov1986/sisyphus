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
        let mesh: Mesh;
        const mat = new StandardMaterial("obsMat", this._scene);

        if (type === ObstacleType.WALL) {
            mesh = MeshBuilder.CreateBox("wall", { width: 2, height: 3, depth: 1 }, this._scene);
            mesh.position.y = 1.5;
            mat.diffuseColor = Color3.Red();
        } else if (type === ObstacleType.BARRIER) {
            mesh = MeshBuilder.CreateBox("barrier", { width: 2.5, height: 1, depth: 0.5 }, this._scene);
            mesh.position.y = 0.5;
            mat.diffuseColor = Color3.Purple();
        } else {
            // SPIKE - Pyramid
            mesh = MeshBuilder.CreateCylinder("spike", { diameterTop: 0, diameterBottom: 1.5, height: 1.5, tessellation: 4 }, this._scene);
            mesh.position.y = 0.75;
            mat.diffuseColor = new Color3(0.5, 0, 0); // Dark Red
        }

        mesh.material = mat;
        return mesh;
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
