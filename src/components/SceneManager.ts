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
        // Bright Outdoor Lighting: "Sunny Day"

        // Fill Light (Sky Ambient)
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        hemiLight.intensity = 0.6; // Brighter ambient
        hemiLight.diffuse = new Color3(0.8, 0.9, 1.0); // Sky Blue/White
        hemiLight.groundColor = new Color3(0.2, 0.3, 0.1); // Greenish bounce from grass

        // Key Light (Sun)
        const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, 1), this._scene);
        dirLight.position = new Vector3(20, 20, -20);
        dirLight.intensity = 2.0; // Bright Sun
        dirLight.diffuse = new Color3(1.0, 1.0, 0.9); // Warm White Sun
        dirLight.specular = new Color3(0.4, 0.4, 0.3); // Less intense specular
    }

    private _setupFog(): void {
        this._scene.fogMode = Scene.FOGMODE_LINEAR;
        this._scene.fogColor = new Color3(0.5, 0.7, 0.9); // Sky Blue Fog
        this._scene.fogStart = 20.0;
        this._scene.fogEnd = 80.0; // Further visibility
        this._scene.clearColor = this._scene.fogColor.toColor4();
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get engine(): Engine {
        return this._engine;
    }
}
