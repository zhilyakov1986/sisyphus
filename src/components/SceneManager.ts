import { Engine, Scene, Vector3, HemisphericLight, DirectionalLight, Color3, ArcRotateCamera } from "babylonjs";

export class SceneManager {
    private _engine: Engine;
    private _scene: Scene;
    private _camera!: ArcRotateCamera;

    constructor(canvas: HTMLCanvasElement) {
        this._engine = new Engine(canvas, true);
        this._scene = new Scene(this._engine);

        // Basic Scene Setup
        this._createCamera();
        this._createLights();
        this._setupFog();

        // Handle window resize
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private _createCamera(): void {
        this._camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), this._scene);
        this._camera.attachControl(this._engine.getRenderingCanvas(), true);
        this._camera.inputs.clear(); // Remove default controls
    }

    private _createLights(): void {
        // Dramatic Lighting: "Underworld"

        // Fill Light (Dark Blue/Grey ambient)
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        hemiLight.intensity = 0.3;
        hemiLight.diffuse = new Color3(0.2, 0.2, 0.3); // Cool dark ambient
        hemiLight.groundColor = new Color3(0.1, 0.1, 0.1);

        // Key Light (Warm Orange Directional)
        // Coming from "front-left" or "behind visual"? 
        // If player runs towards camera, light should probably illuminate their face?
        // Let's put it top-right-front.
        const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, 1), this._scene);
        dirLight.position = new Vector3(20, 20, -20);
        dirLight.intensity = 1.2;
        dirLight.diffuse = new Color3(1.0, 0.6, 0.3); // Orange/Fire
        dirLight.specular = new Color3(1.0, 0.8, 0.6);

        // Enable Shadows
        // const shadowGenerator = new ShadowGenerator(1024, dirLight);
        // shadowGenerator.useBlurExponentialShadowMap = true;
        // shadowGenerator.blurKernel = 32;
        // To make everything cast shadows, we need to add meshes to it. 
        // Since we create meshes elsewhere, we might need to expose the shadow generator or light.
        // For now, let's stick to lighting + Fog. Use standard shadows later if needed.
    }

    private _setupFog(): void {
        this._scene.fogMode = Scene.FOGMODE_LINEAR;
        this._scene.fogColor = new Color3(0.1, 0.1, 0.15); // Dark Grey/Blue
        this._scene.fogStart = 20.0;
        this._scene.fogEnd = 60.0;
        this._scene.clearColor = this._scene.fogColor.toColor4();
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get engine(): Engine {
        return this._engine;
    }
}
