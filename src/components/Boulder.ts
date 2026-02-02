import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, DynamicTexture } from "babylonjs";

export class Boulder {
    public mesh!: Mesh;
    private _scene: Scene;

    // Visuals
    private _radius: number = 2.5; // Big enough to look scary compared to player (radius 0.5)

    constructor(scene: Scene) {
        this._scene = scene;
        this._createBoulder();
    }

    private _createBoulder(): void {
        // Use Sphere for a rounder look (User Request)
        this.mesh = MeshBuilder.CreateSphere("boulder", {
            diameter: this._radius * 2,
            segments: 16
        }, this._scene);

        this.mesh.position.y = this._radius; // Sit on ground

        const mat = new StandardMaterial("boulderMat", this._scene);

        // Generate Procedural Noise Texture
        const noiseTexture = this._createNoiseTexture();
        mat.diffuseTexture = noiseTexture;
        mat.bumpTexture = noiseTexture; // Reusing noise as bump map (works simply for roughness)

        mat.diffuseColor = new Color3(0.6, 0.6, 0.6); // Base Grey
        mat.specularColor = new Color3(0.1, 0.1, 0.1);
        this.mesh.material = mat;
    }

    private _createNoiseTexture(): DynamicTexture {
        const size = 512;
        const texture = new DynamicTexture("boulderNoise", size, this._scene, false);
        const ctx = texture.getContext() as CanvasRenderingContext2D;

        // Simple Noise Generation
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Random value 0-255
            const val = Math.floor(Math.random() * 255);
            // Greyscale
            data[i] = val;     // R
            data[i + 1] = val; // G
            data[i + 2] = val; // B
            data[i + 3] = 255; // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
        texture.update();
        return texture;
    }

    public update(deltaTime: number, distance: number, worldSpeed: number): void {
        // Position is relative to Player (at 0).
        // Since Player runs +Z, and Boulder is behind, Boulder Z = PlayerZ - Distance.
        // Wait, Player Visual X is changing, but Z is static 0? 
        // Yes, Player.ts keeps Z static. 
        // So Boulder Z = PlayerZ (0) + Distance? 
        // Camera is at +Z looking back.
        // If Player runs towards Camera (+Z), Boulder is BEHIND player (negative Z).
        // So Boulder Z = PlayerZ - Distance (if distance is positive).
        // wait.
        // Camera: (0, 5, 20) looking at (0,0,0).
        // Player: (0, 0.5, 0).
        // Player runs Forward (visually). Does "Forward" mean towards +Z or -Z?
        // Sprint 1 findings: Ground grid moves DOWN/TOWARDS CAMERA?
        // Let's check Ground.ts update: `vOffset -= textureSpeed`
        // If vOffset decreases, texture moves "down" usually?
        // If texture moves "down" (towards -Z visually on floor), it looks like we are moving "up" (+Z).
        // So Player simulates moving +Z (Towards Camera).
        // So Boulder (Behind) should be at -Z (Negative Z).

        // HOWEVER.
        // If I run towards the camera (Crash Bandicoot chase), the Boulder is BEHIND me (Further -Z).
        // Correct.
        // So Boulder.z = -distance.

        this.mesh.position.z = -distance;

        // Roll FORWARD (towards +Z)? 
        // Axis: X axis.
        // Positive rotation on X rolls "forward" towards +Z?
        this.mesh.rotation.x += (worldSpeed / this._radius) * deltaTime;
    }
}
