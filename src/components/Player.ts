import { Mesh, MeshBuilder, Scene, Vector3, StandardMaterial, Color3, ParticleSystem, Texture } from "babylonjs";
import { InputManager } from "../systems/InputManager";

export class Player {
    public mesh!: Mesh;
    private _scene: Scene;
    private _input: InputManager;
    private _dustParticles!: ParticleSystem;

    // Shield
    private _hasShield: boolean = false;
    private _shieldMesh!: Mesh;

    // Lanes
    private _currentLane: number = 0; // -1 (Left), 0 (Center), 1 (Right)
    private _laneWidth: number = 3;
    private _targetX: number = 0;

    // Jump
    private _isJumping: boolean = false;
    private _jumpForce: number = 15;
    private _gravity: number = -80;
    private _verticalVelocity: number = 0;
    private _groundY: number = 0.5; // Half of player height

    constructor(scene: Scene, input: InputManager) {
        this._scene = scene;
        this._input = input;

        this._createPlayerMesh();
        this._createShieldMesh(); // Create shield visual
        this._createDustParticles();
    }

    private _createShieldMesh(): void {
        this._shieldMesh = MeshBuilder.CreateSphere("shieldVisual", { diameter: 1.5 }, this._scene);
        this._shieldMesh.parent = this.mesh; // Attach to player

        const mat = new StandardMaterial("shieldMat", this._scene);
        mat.diffuseColor = new Color3(0, 1, 1);
        mat.alpha = 0.4;
        this._shieldMesh.material = mat;

        this._shieldMesh.isVisible = false; // Hidden by default
    }

    public grantShield(): void {
        this._hasShield = true;
        this._shieldMesh.isVisible = true;
    }

    public absorbHit(): boolean {
        if (this._hasShield) {
            this._hasShield = false;
            this._shieldMesh.isVisible = false;
            return true; // Hit absorbed
        }
        return false; // Took damage
    }

    private _createPlayerMesh(): void {
        this.mesh = MeshBuilder.CreateSphere("player", { diameter: 1 }, this._scene);
        this.mesh.position.y = this._groundY;

        const mat = new StandardMaterial("playerMat", this._scene);
        mat.diffuseColor = new Color3(1, 0.5, 0); // Orange
        this.mesh.material = mat;
    }

    private _createDustParticles(): void {
        this._dustParticles = new ParticleSystem("dust", 100, this._scene);
        this._dustParticles.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this._scene);
        this._dustParticles.emitter = this.mesh;
        this._dustParticles.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
        this._dustParticles.maxEmitBox = new Vector3(0.5, -0.5, 0.5);
        this._dustParticles.color1 = new Color3(0.5, 0.5, 0.5).toColor4();
        this._dustParticles.color2 = new Color3(0.2, 0.2, 0.2).toColor4();
        this._dustParticles.colorDead = new Color3(0, 0, 0).toColor4(0);
        this._dustParticles.minSize = 0.1;
        this._dustParticles.maxSize = 0.5;
        this._dustParticles.minLifeTime = 0.3;
        this._dustParticles.maxLifeTime = 1.0;
        this._dustParticles.emitRate = 50;
        this._dustParticles.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this._dustParticles.gravity = new Vector3(0, 0.5, -10); // "Wind" blowing it back
        this._dustParticles.direction1 = new Vector3(-1, 2, -5);
        this._dustParticles.direction2 = new Vector3(1, 2, -5);
        this._dustParticles.minEmitPower = 1;
        this._dustParticles.maxEmitPower = 3;

        this._dustParticles.start();
    }

    public update(deltaTime: number): void {
        this._handleLaneMovement(deltaTime);
        this._handleJump(deltaTime);

        // Bobbing animation
        if (!this._isJumping) {
            this.mesh.position.y = this._groundY + Math.abs(Math.sin(Date.now() * 0.01) * 0.1);
            if (!this._dustParticles.isStarted()) this._dustParticles.start();
        } else {
            // Stop emitting dust in air
            if (this._dustParticles.isStarted()) this._dustParticles.stop();
        }
    }

    private _handleLaneMovement(deltaTime: number): void {
        if (this._input.moveLeft) {
            this._currentLane = Math.max(-1, this._currentLane - 1);
        }
        if (this._input.moveRight) {
            this._currentLane = Math.min(1, this._currentLane + 1);
        }

        this._targetX = this._currentLane * -this._laneWidth;

        // Smooth Lerp
        this.mesh.position.x = Vector3.Lerp(
            this.mesh.position,
            new Vector3(this._targetX, this.mesh.position.y, this.mesh.position.z),
            10 * deltaTime
        ).x;
    }

    private _handleJump(deltaTime: number): void {
        // Simple manual gravity physics for control
        if (this._input.jump && !this._isJumping) {
            this._verticalVelocity = this._jumpForce;
            this._isJumping = true;
        }

        if (this._isJumping) {
            this.mesh.position.y += this._verticalVelocity * deltaTime;
            this._verticalVelocity += this._gravity * deltaTime;

            if (this.mesh.position.y <= this._groundY) {
                this.mesh.position.y = this._groundY;
                this._isJumping = false;
                this._verticalVelocity = 0;
            }
        }
    }
}
