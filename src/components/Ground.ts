import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, DynamicTexture, Texture } from "babylonjs";

export class Ground {
    public mesh!: Mesh;
    private _scene: Scene;
    private _material!: StandardMaterial;

    // World Speed Simulation
    // 0.5 texture offset speed * 5 (ratio of height/vScale) = 2.5 units/sec approximately
    // Let's define World Unit Speed and derive texture speed.
    // If World Speed = 20 units/sec.
    // Texture repeats every 5 units.
    // Texture speed = 20 / 5 = 4 offset/sec.

    public static readonly ITEM_HEIGHT = 100;
    public static readonly V_SCALE = 20;
    public static readonly WORLD_SPEED = 30; // 30 units per second

    constructor(scene: Scene) {
        this._scene = scene;
        this._createGround();
    }

    private _createGround(): void {
        const width = 20;
        const height = Ground.ITEM_HEIGHT;

        this.mesh = MeshBuilder.CreateGround("ground", { width: width, height: height }, this._scene);
        this.mesh.position.z = 10;

        this._material = new StandardMaterial("groundMat", this._scene);
        this._material.diffuseColor = new Color3(0.8, 0.8, 0.8);
        this._material.specularColor = new Color3(0, 0, 0);

        // Create a procedural grid texture using DynamicTexture
        const textureSize = 512;
        const texture = new DynamicTexture("gridTexture", textureSize, this._scene, true);
        const ctx = texture.getContext();

        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, textureSize, textureSize);

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 5;
        const gridSize = 8;
        const step = textureSize / gridSize;

        for (let i = 0; i <= gridSize; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * step, 0);
            ctx.lineTo(i * step, textureSize);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * step);
            ctx.lineTo(textureSize, i * step);
            ctx.stroke();
        }

        texture.update();
        texture.uScale = 4;
        texture.vScale = Ground.V_SCALE;

        this._material.diffuseTexture = texture;
        this.mesh.material = this._material;
    }

    public update(deltaTime: number, speedMultiplier: number): void {
        if (this._material.diffuseTexture) {
            // Speed (offset/sec) = WorldSpeed / (Height / VScale)
            // Apply speed multiplier
            const finalSpeed = (Ground.WORLD_SPEED * speedMultiplier);
            const textureSpeed = finalSpeed / (Ground.ITEM_HEIGHT / Ground.V_SCALE);
            (this._material.diffuseTexture as Texture).vOffset -= textureSpeed * deltaTime;
        }
    }
}
