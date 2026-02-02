import { ActionManager, ExecuteCodeAction, Scene } from "babylonjs";

export class InputManager {
    private _inputMap: { [key: string]: boolean } = {};
    private _scene: Scene;

    // Actions
    public jump: boolean = false;
    public moveLeft: boolean = false;
    public moveRight: boolean = false;

    // To prevent continuous triggering for lane changes
    private _leftPressed: boolean = false;
    private _rightPressed: boolean = false;
    private _jumpPressed: boolean = false;

    constructor(scene: Scene) {
        this._scene = scene;
        this._scene.actionManager = new ActionManager(this._scene);

        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this._inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this._inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }));
    }

    public update(): void {
        const leftKey = this._inputMap["a"] || this._inputMap["arrowleft"];
        const rightKey = this._inputMap["d"] || this._inputMap["arrowright"];
        const jumpKey = this._inputMap[" "] || this._inputMap["arrowup"] || this._inputMap["w"];

        // Single trigger for lane change
        if (leftKey && !this._leftPressed) {
            this.moveLeft = true;
            this._leftPressed = true;
        } else {
            this.moveLeft = false;
        }
        if (!leftKey) this._leftPressed = false;

        if (rightKey && !this._rightPressed) {
            this.moveRight = true;
            this._rightPressed = true;
        } else {
            this.moveRight = false;
        }
        if (!rightKey) this._rightPressed = false;

        // Single trigger for jump
        if (jumpKey && !this._jumpPressed) {
            this.jump = true;
            this._jumpPressed = true;
        } else {
            this.jump = false;
        }
        if (!jumpKey) this._jumpPressed = false;
    }
}
