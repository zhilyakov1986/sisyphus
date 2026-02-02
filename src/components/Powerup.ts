import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3 } from "babylonjs";

export const PowerupType = {
    SHIELD: 0
} as const;

export type PowerupType = typeof PowerupType[keyof typeof PowerupType];

export class Powerup {
    public mesh: Mesh;
    public type: PowerupType;
    public active: boolean = true;
    private _scene: Scene;

    constructor(scene: Scene, type: PowerupType, startZ: number, laneX: number) {
        this._scene = scene;
        this.type = type;
        this.mesh = this._createMesh(type);
        this.reset(startZ, laneX);
    }

    private _createMesh(type: PowerupType): Mesh {
        let mesh: Mesh;
        const mat = new StandardMaterial("powerupMat", this._scene);

        if (type === PowerupType.SHIELD) {
            // Floating diamond
            mesh = MeshBuilder.CreatePolyhedron("shield", { type: 1, size: 0.5 }, this._scene);
            mesh.position.y = 1.0;
            mat.diffuseColor = new Color3(0, 1, 1); // Cyan
            mat.emissiveColor = new Color3(0, 0.5, 1);
            mat.alpha = 0.8;
        } else {
            mesh = MeshBuilder.CreateBox("default", { size: 0.5 }, this._scene);
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

        // Spin animation
        this.mesh.rotation.y += 2 * deltaTime;
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
