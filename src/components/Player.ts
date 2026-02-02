import { Mesh, MeshBuilder, Scene, Vector3, StandardMaterial, Color3 } from "babylonjs";
import { InputManager } from "../systems/InputManager";

export class Player {
    public mesh!: Mesh;
    private _scene: Scene;
    private _input: InputManager;

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
    }

    private _createPlayerMesh(): void {
        this.mesh = MeshBuilder.CreateSphere("player", { diameter: 1 }, this._scene);
        this.mesh.position.y = this._groundY;

        const mat = new StandardMaterial("playerMat", this._scene);
        mat.diffuseColor = new Color3(1, 0.5, 0); // Orange
        this.mesh.material = mat;
    }

    public update(deltaTime: number): void {
        this._handleLaneMovement(deltaTime);
        this._handleJump(deltaTime);

        // Bobbing animation
        if (!this._isJumping) {
            this.mesh.position.y = this._groundY + Math.abs(Math.sin(Date.now() * 0.01) * 0.1);
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
