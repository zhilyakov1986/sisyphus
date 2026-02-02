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

        // Handle window resize
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private _createCamera(): void {
        // Camera facing the player (Front View)
        // Alpha: -Math.PI / 2 (Behind), Math.PI / 2 (Front)
        // We want front view, looking at the player who runs towards camera? 
        // Or player runs away from camera?
        // Requirement: "The camera faces the player from the front." 
        // "The player dodges obstacles... while the world streams toward them"
        // This implies the player is running TOWARDS the screen (Crash Bandicoot style boulder levels).
        // So the camera should be in front of the player, looking back at them.

        this._camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), this._scene);
        this._camera.attachControl(this._engine.getRenderingCanvas(), true);

        // Lock camera
        this._camera.inputs.clear(); // Remove default controls
    }

    private _createLights(): void {
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        hemiLight.intensity = 0.6;
        hemiLight.diffuse = new Color3(0.9, 0.9, 1);
        hemiLight.groundColor = new Color3(0.1, 0.1, 0.1);

        const dirLight = new DirectionalLight("dirLight", new Vector3(0, -1, -1), this._scene);
        dirLight.position = new Vector3(0, 20, 20);
        dirLight.intensity = 0.8;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get engine(): Engine {
        return this._engine;
    }
}
