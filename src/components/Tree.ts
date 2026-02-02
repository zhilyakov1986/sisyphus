import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, Vector3 } from "babylonjs";

export class Tree {
    public mesh: Mesh;
    public active: boolean = true;
    private _scene: Scene;

    constructor(scene: Scene, startZ: number, xPos: number) {
        this._scene = scene;
        this.mesh = this._createMesh();
        this.reset(startZ, xPos);
    }

    private _createMesh(): Mesh {
        // Root (Invisible)
        const root = MeshBuilder.CreateBox("treeRoot", { width: 1, height: 1, depth: 1 }, this._scene);
        root.isVisible = false;

        // Visuals
        // Material
        const trunkMat = new StandardMaterial("trunkMat", this._scene);
        trunkMat.diffuseColor = new Color3(0.4, 0.3, 0.2); // Brown

        const leaveMat = new StandardMaterial("leaveMat", this._scene);
        leaveMat.diffuseColor = new Color3(0.1, 0.6, 0.2); // Dark Green

        // Trunk
        const trunk = MeshBuilder.CreateCylinder("trunk", { diameter: 0.5, height: 1.5 }, this._scene);
        trunk.parent = root;
        trunk.position.y = 0.75; // Base at 0
        trunk.material = trunkMat;

        // Foliage (Cone) - 2 levels for "pine" look
        const bottomFoliage = MeshBuilder.CreateCylinder("foliageBot", { diameterTop: 0.5, diameterBottom: 2, height: 2, tessellation: 6 }, this._scene);
        bottomFoliage.parent = root;
        bottomFoliage.position.y = 2.0;
        bottomFoliage.material = leaveMat;

        const topFoliage = MeshBuilder.CreateCylinder("foliageTop", { diameterTop: 0, diameterBottom: 1.5, height: 1.5, tessellation: 6 }, this._scene);
        topFoliage.parent = root;
        topFoliage.position.y = 3.0; // Overlapping slightly
        topFoliage.material = leaveMat;

        return root;
    }

    public reset(startZ: number, xPos: number): void {
        this.mesh.position.x = xPos;
        this.mesh.position.z = startZ;

        // Random slight scaling for variety
        const scale = 0.8 + Math.random() * 0.4;
        this.mesh.scaling = new Vector3(scale, scale, scale);

        // Random Y rotation
        this.mesh.rotation.y = Math.random() * Math.PI * 2;

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
