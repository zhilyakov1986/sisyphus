import { Mesh, MeshBuilder, Scene, Vector3, StandardMaterial, Color3, ParticleSystem, Texture } from "babylonjs";
import { InputManager } from "../systems/InputManager";

export class Player {
    public mesh!: Mesh;
    private _scene: Scene;
    private _input: InputManager;
    private _dustParticles!: ParticleSystem;

    // Humanoid Parts
    private _head!: Mesh;
    private _body!: Mesh;
    private _leftArm!: Mesh;
    private _rightArm!: Mesh;
    private _leftLeg!: Mesh;
    private _rightLeg!: Mesh;

    // Animation
    private _runTime: number = 0;

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
    // If we use pivot at feet (ground level), _groundY should be 0.

    constructor(scene: Scene, input: InputManager) {
        this._scene = scene;
        this._input = input;

        this._createPlayerMesh();
        this._createShieldMesh(); // Create shield visual
        this._createDustParticles();
    }

    private _createShieldMesh(): void {
        this._shieldMesh = MeshBuilder.CreateSphere("shieldVisual", { diameter: 2.0 }, this._scene);
        this._shieldMesh.parent = this.mesh;
        this._shieldMesh.position.y = 1.0; // Center around body
        this._shieldMesh.scaling = new Vector3(1, 1.2, 1); // Oval

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
        // Parent Mesh (Invisible box for physics/position)
        this.mesh = MeshBuilder.CreateBox("player", { height: 2, width: 1, depth: 1 }, this._scene);
        this.mesh.position.y = 1.0;
        this.mesh.isVisible = false;

        // Materials
        const skinMat = new StandardMaterial("skinMat", this._scene);
        skinMat.diffuseColor = new Color3(1, 0.8, 0.6); // Peach

        const tunicMat = new StandardMaterial("tunicMat", this._scene);
        tunicMat.diffuseColor = new Color3(0.95, 0.95, 0.9); // White/Cream Tunic

        // Head (Sphere)
        this._head = MeshBuilder.CreateSphere("head", { diameter: 0.5, segments: 16 }, this._scene);
        this._head.parent = this.mesh;
        this._head.position.y = 0.8;
        this._head.material = skinMat;

        // Body (Oval Sphere - Tunic)
        // Ideally a slightly flattened sphere
        this._body = MeshBuilder.CreateSphere("body", { diameterX: 0.9, diameterY: 0.85, diameterZ: 0.7, segments: 16 }, this._scene);
        this._body.parent = this.mesh;
        this._body.position.y = 0.15; // Slightly lower center gravity
        this._body.material = tunicMat;

        // Arms (Cylinders - Skin)
        // Cylinder height matches Box height (Y axis)
        this._leftArm = MeshBuilder.CreateCylinder("leftArm", { height: 0.6, diameter: 0.22, tessellation: 12 }, this._scene);
        this._leftArm.parent = this.mesh;
        this._leftArm.setPivotPoint(new Vector3(0, 0.25, 0));
        this._leftArm.position.x = -0.55;
        this._leftArm.position.y = 0.2;
        this._leftArm.material = skinMat;

        this._rightArm = MeshBuilder.CreateCylinder("rightArm", { height: 0.6, diameter: 0.22, tessellation: 12 }, this._scene);
        this._rightArm.parent = this.mesh;
        this._rightArm.setPivotPoint(new Vector3(0, 0.25, 0));
        this._rightArm.position.x = 0.55;
        this._rightArm.position.y = 0.2;
        this._rightArm.material = skinMat;

        // Legs (Cylinders - Bare Legs)
        this._leftLeg = MeshBuilder.CreateCylinder("leftLeg", { height: 0.6, diameter: 0.28, tessellation: 12 }, this._scene);
        this._leftLeg.parent = this.mesh;
        this._leftLeg.setPivotPoint(new Vector3(0, 0.3, 0));
        this._leftLeg.position.x = -0.25;
        this._leftLeg.position.y = -0.6;
        this._leftLeg.material = skinMat;

        this._rightLeg = MeshBuilder.CreateCylinder("rightLeg", { height: 0.6, diameter: 0.28, tessellation: 12 }, this._scene);
        this._rightLeg.parent = this.mesh;
        this._rightLeg.setPivotPoint(new Vector3(0, 0.3, 0));
        this._rightLeg.position.x = 0.25;
        this._rightLeg.position.y = -0.6;
        this._rightLeg.material = skinMat;
    }

    private _createDustParticles(): void {
        this._dustParticles = new ParticleSystem("dust", 100, this._scene);
        this._dustParticles.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this._scene);
        this._dustParticles.emitter = this.mesh;
        this._dustParticles.minEmitBox = new Vector3(-0.5, -1.0, -0.5); // Emit from feet (bottom of box)
        this._dustParticles.maxEmitBox = new Vector3(0.5, -1.0, 0.5);
        this._dustParticles.color1 = new Color3(0.5, 0.5, 0.5).toColor4();
        this._dustParticles.color2 = new Color3(0.2, 0.2, 0.2).toColor4();
        this._dustParticles.colorDead = new Color3(0, 0, 0).toColor4(0);
        this._dustParticles.minSize = 0.1;
        this._dustParticles.maxSize = 0.5;
        this._dustParticles.minLifeTime = 0.3;
        this._dustParticles.maxLifeTime = 1.0;
        this._dustParticles.emitRate = 50;
        this._dustParticles.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this._dustParticles.gravity = new Vector3(0, 0.5, -10);
        this._dustParticles.direction1 = new Vector3(-1, 2, -5);
        this._dustParticles.direction2 = new Vector3(1, 2, -5);
        this._dustParticles.minEmitPower = 1;
        this._dustParticles.maxEmitPower = 3;

        this._dustParticles.start();
    }

    public update(deltaTime: number): void {
        this._handleLaneMovement(deltaTime);
        this._handleJump(deltaTime);

        if (!this._isJumping) {
            // Run Cycle
            this._runTime += deltaTime * 15; // Animation speed

            // Simple Sine Wave Animation
            const armAngle = Math.sin(this._runTime) * 0.8;
            const legAngle = Math.sin(this._runTime) * 1.0;

            this._leftArm.rotation.x = armAngle;
            this._rightArm.rotation.x = -armAngle;

            this._leftLeg.rotation.x = -legAngle;
            this._rightLeg.rotation.x = legAngle;

            if (!this._dustParticles.isStarted()) this._dustParticles.start();
        } else {
            // Jump Pose
            this._leftArm.rotation.x = -2.5;
            this._rightArm.rotation.x = -2.5;
            this._leftLeg.rotation.x = -0.5;
            this._rightLeg.rotation.x = 0.5;

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

            // Ground is at y = 1.0 (Centre of mesh) ??
            // Wait, logic check:
            // _createPlayerMesh sets y = 1.0. 
            // If we jump, y>1.0.
            // Gravity pulls down.
            // If y <= 1.0, Reset.

            if (this.mesh.position.y <= 1.0) {
                this.mesh.position.y = 1.0;
                this._isJumping = false;
                this._verticalVelocity = 0;
            }
        }
    }
}
