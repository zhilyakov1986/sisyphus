import { Mesh, MeshBuilder, Scene, Vector3, StandardMaterial, Color3, ParticleSystem, Texture, TransformNode } from "babylonjs";
import { InputManager } from "../systems/InputManager";

export class Player {
    public mesh!: Mesh;
    private _scene: Scene;
    private _input: InputManager;
    private _dustParticles!: ParticleSystem;

    // Humanoid Parts
    private _head!: Mesh;
    private _body!: Mesh;

    // Arms (Joints + Meshes)
    private _leftArmJoint!: TransformNode;
    private _rightArmJoint!: TransformNode;
    private _leftArm!: Mesh;
    private _rightArm!: Mesh;

    // Legs (Joints + Meshes)
    private _leftLegJoint!: TransformNode;
    private _rightLegJoint!: TransformNode;
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

        const sashMat = new StandardMaterial("sashMat", this._scene);
        sashMat.diffuseColor = new Color3(0.8, 0.2, 0.2); // Royal Red Sash

        const hairMat = new StandardMaterial("hairMat", this._scene);
        hairMat.diffuseColor = new Color3(0.3, 0.2, 0.1); // Dark Brown Hair/Beard

        const wreathMat = new StandardMaterial("wreathMat", this._scene);
        wreathMat.diffuseColor = new Color3(0.2, 0.6, 0.2); // Green Laurel

        const eyeWhiteMat = new StandardMaterial("eyeWhiteMat", this._scene);
        eyeWhiteMat.diffuseColor = new Color3(1, 1, 1);

        const eyePupilMat = new StandardMaterial("eyePupilMat", this._scene);
        eyePupilMat.diffuseColor = new Color3(0, 0, 0);

        const leatherMat = new StandardMaterial("leatherMat", this._scene);
        leatherMat.diffuseColor = new Color3(0.4, 0.2, 0.1); // Leather Belt/Sandals

        // --- HEAD ---
        this._head = MeshBuilder.CreateSphere("head", { diameter: 0.5, segments: 16 }, this._scene);
        this._head.parent = this.mesh;
        this._head.position.y = 0.8;
        this._head.material = skinMat;

        // Laurel Wreath
        const wreath = MeshBuilder.CreateTorus("wreath", { diameter: 0.52, thickness: 0.08, tessellation: 16 }, this._scene);
        wreath.parent = this._head;
        wreath.position.y = 0.15;
        wreath.rotation.x = -0.2; // Tilted slightly back
        wreath.material = wreathMat;

        // Ears
        const leftEar = MeshBuilder.CreateSphere("leftEar", { diameter: 0.12, segments: 4 }, this._scene);
        leftEar.parent = this._head;
        leftEar.position = new Vector3(-0.24, 0, 0);
        leftEar.material = skinMat;

        const rightEar = MeshBuilder.CreateSphere("rightEar", { diameter: 0.12, segments: 4 }, this._scene);
        rightEar.parent = this._head;
        rightEar.position = new Vector3(0.24, 0, 0);
        rightEar.material = skinMat;

        // Eyes
        const leftEye = MeshBuilder.CreateSphere("leftEye", { diameter: 0.12, segments: 8 }, this._scene);
        leftEye.parent = this._head;
        leftEye.position = new Vector3(-0.1, 0.05, 0.2); // Front-Left
        leftEye.material = eyeWhiteMat;

        const leftPupil = MeshBuilder.CreateSphere("leftPupil", { diameter: 0.05, segments: 4 }, this._scene);
        leftPupil.parent = leftEye;
        leftPupil.position.z = 0.05;
        leftPupil.material = eyePupilMat;

        const rightEye = MeshBuilder.CreateSphere("rightEye", { diameter: 0.12, segments: 8 }, this._scene);
        rightEye.parent = this._head;
        rightEye.position = new Vector3(0.1, 0.05, 0.2);
        rightEye.material = eyeWhiteMat;

        const rightPupil = MeshBuilder.CreateSphere("rightPupil", { diameter: 0.05, segments: 4 }, this._scene);
        rightPupil.parent = rightEye;
        rightPupil.position.z = 0.05;
        rightPupil.material = eyePupilMat;

        // Eyebrows
        const leftBrow = MeshBuilder.CreateBox("leftBrow", { width: 0.12, height: 0.03, depth: 0.02 }, this._scene);
        leftBrow.parent = this._head;
        leftBrow.position = new Vector3(-0.1, 0.15, 0.22);
        leftBrow.rotation.z = 0.2; // Angry/Determined
        leftBrow.material = hairMat;

        const rightBrow = MeshBuilder.CreateBox("rightBrow", { width: 0.12, height: 0.03, depth: 0.02 }, this._scene);
        rightBrow.parent = this._head;
        rightBrow.position = new Vector3(0.1, 0.15, 0.22);
        rightBrow.rotation.z = -0.2;
        rightBrow.material = hairMat;

        // Beard
        const beardCenter = MeshBuilder.CreateSphere("beardCenter", { diameterX: 0.25, diameterY: 0.3, diameterZ: 0.2, segments: 8 }, this._scene);
        beardCenter.parent = this._head;
        beardCenter.position = new Vector3(0, -0.15, 0.2);
        beardCenter.material = hairMat;

        // Nose
        const nose = MeshBuilder.CreateSphere("nose", { diameter: 0.08, segments: 4 }, this._scene);
        nose.parent = this._head;
        nose.position = new Vector3(0, 0, 0.25);
        nose.material = skinMat;

        // --- BODY ---
        this._body = MeshBuilder.CreateSphere("body", { diameterX: 0.9, diameterY: 0.85, diameterZ: 0.7, segments: 16 }, this._scene);
        this._body.parent = this.mesh;
        this._body.position.y = 0.15;
        this._body.material = tunicMat;

        // Toga Sash (Diagonal Torus slice or rotated cylinder... Torus is better)
        const sash = MeshBuilder.CreateTorus("sash", { diameter: 0.92, thickness: 0.15, tessellation: 16 }, this._scene);
        sash.parent = this._body;
        sash.rotation.z = Math.PI / 4; // Diagonal
        sash.position.y = 0.05;
        sash.scaling.y = 1.0;
        sash.material = sashMat;

        // Belt
        const belt = MeshBuilder.CreateTorus("belt", { diameter: 0.88, thickness: 0.1, tessellation: 16 }, this._scene);
        belt.parent = this._body;
        belt.position.y = -0.1; // Waist level
        belt.scaling.z = 0.8;
        belt.material = leatherMat;

        // --- ARMS ---
        // Shoulders (Deltoids) - Increased size slightly
        const leftShoulder = MeshBuilder.CreateSphere("leftShoulder", { diameter: 0.4, segments: 12 }, this._scene);
        leftShoulder.parent = this.mesh;
        leftShoulder.position = new Vector3(-0.45, 0.25, 0);
        leftShoulder.material = skinMat;

        const rightShoulder = MeshBuilder.CreateSphere("rightShoulder", { diameter: 0.4, segments: 12 }, this._scene);
        rightShoulder.parent = this.mesh;
        rightShoulder.position = new Vector3(0.45, 0.25, 0);
        rightShoulder.material = skinMat;

        // Left Arm Joint (Pivot at shoulder center)
        this._leftArmJoint = new TransformNode("leftArmJoint", this._scene);
        this._leftArmJoint.parent = this.mesh;
        this._leftArmJoint.position = new Vector3(-0.45, 0.25, 0); // Exactly at shoulder

        // Left Arm Mesh (Tapered)
        this._leftArm = MeshBuilder.CreateCylinder("leftArm", { height: 0.6, diameterTop: 0.28, diameterBottom: 0.15, tessellation: 12 }, this._scene);
        this._leftArm.parent = this._leftArmJoint;
        this._leftArm.position.y = -0.3; // Hang down from joint
        this._leftArm.material = skinMat;

        const leftHand = MeshBuilder.CreateSphere("leftHand", { diameter: 0.2, segments: 8 }, this._scene);
        leftHand.parent = this._leftArm;
        leftHand.position.y = -0.3; // At bottom of arm
        leftHand.material = skinMat;

        // Right Arm Joint
        this._rightArmJoint = new TransformNode("rightArmJoint", this._scene);
        this._rightArmJoint.parent = this.mesh;
        this._rightArmJoint.position = new Vector3(0.45, 0.25, 0);

        // Right Arm Mesh (Tapered)
        this._rightArm = MeshBuilder.CreateCylinder("rightArm", { height: 0.6, diameterTop: 0.28, diameterBottom: 0.15, tessellation: 12 }, this._scene);
        this._rightArm.parent = this._rightArmJoint;
        this._rightArm.position.y = -0.3;
        this._rightArm.material = skinMat;

        const rightHand = MeshBuilder.CreateSphere("rightHand", { diameter: 0.2, segments: 8 }, this._scene);
        rightHand.parent = this._rightArm;
        rightHand.position.y = -0.3;
        rightHand.material = skinMat;

        // --- LEGS ---
        // Hip Joints (Hidden inside body/tunic, but pivotal)
        this._leftLegJoint = new TransformNode("leftLegJoint", this._scene);
        this._leftLegJoint.parent = this.mesh;
        this._leftLegJoint.position = new Vector3(-0.25, -0.3, 0); // Hip position

        this._leftLeg = MeshBuilder.CreateCylinder("leftLeg", { height: 0.6, diameterTop: 0.32, diameterBottom: 0.18, tessellation: 12 }, this._scene);
        this._leftLeg.parent = this._leftLegJoint;
        this._leftLeg.position.y = -0.3; // Hang down
        this._leftLeg.material = skinMat;

        // Rounded Thigh Top (to look like it connects)
        const leftThighTop = MeshBuilder.CreateSphere("leftThighTop", { diameter: 0.32, segments: 8 }, this._scene);
        leftThighTop.parent = this._leftLeg;
        leftThighTop.position.y = 0.3;
        leftThighTop.material = skinMat;

        // Detailed Sandal (Left)
        const leftSandalBase = MeshBuilder.CreateBox("leftSandalBase", { width: 0.26, height: 0.05, depth: 0.45 }, this._scene);
        leftSandalBase.parent = this._leftLeg;
        leftSandalBase.position = new Vector3(0, -0.3, 0.05); // Bottom of tapered leg
        leftSandalBase.material = leatherMat;

        const leftSandalStrap = MeshBuilder.CreateTorus("leftSandalStrap", { diameter: 0.29, thickness: 0.05, tessellation: 8 }, this._scene);
        leftSandalStrap.parent = leftSandalBase;
        leftSandalStrap.position.y = 0.05; // On top of base
        leftSandalStrap.material = leatherMat;

        this._rightLegJoint = new TransformNode("rightLegJoint", this._scene);
        this._rightLegJoint.parent = this.mesh;
        this._rightLegJoint.position = new Vector3(0.25, -0.3, 0);

        this._rightLeg = MeshBuilder.CreateCylinder("rightLeg", { height: 0.6, diameterTop: 0.32, diameterBottom: 0.18, tessellation: 12 }, this._scene);
        this._rightLeg.parent = this._rightLegJoint;
        this._rightLeg.position.y = -0.3;
        this._rightLeg.material = skinMat;

        // Rounded Thigh Top
        const rightThighTop = MeshBuilder.CreateSphere("rightThighTop", { diameter: 0.32, segments: 8 }, this._scene);
        rightThighTop.parent = this._rightLeg;
        rightThighTop.position.y = 0.3;
        rightThighTop.material = skinMat;

        // Detailed Sandal (Right)
        const rightSandalBase = MeshBuilder.CreateBox("rightSandalBase", { width: 0.26, height: 0.05, depth: 0.45 }, this._scene);
        rightSandalBase.parent = this._rightLeg;
        rightSandalBase.position = new Vector3(0, -0.3, 0.05);
        rightSandalBase.material = leatherMat;

        const rightSandalStrap = MeshBuilder.CreateTorus("rightSandalStrap", { diameter: 0.29, thickness: 0.05, tessellation: 8 }, this._scene);
        rightSandalStrap.parent = rightSandalBase;
        rightSandalStrap.position.y = 0.05;
        rightSandalStrap.material = leatherMat;
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

            this._leftArmJoint.rotation.x = armAngle;
            this._rightArmJoint.rotation.x = -armAngle;

            this._leftLegJoint.rotation.x = -legAngle;
            this._rightLegJoint.rotation.x = legAngle;

            if (!this._dustParticles.isStarted()) this._dustParticles.start();
        } else {
            // Jump Pose
            this._leftArmJoint.rotation.x = -2.5;
            this._rightArmJoint.rotation.x = -2.5;
            this._leftLegJoint.rotation.x = -0.5;
            this._rightLegJoint.rotation.x = 0.5;

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
