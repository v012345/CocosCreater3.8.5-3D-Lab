import { _decorator, Camera, Component, EventHandler, Node, Quat, Vec3 } from 'cc';
import { GameGlobal } from './GameGlobal';
const { ccclass, property, type } = _decorator;

/**
 * @en The component that converts 3D node coordinates to UI node coordinates.
 * It mainly provides the converted world coordinates after mapping and the perspective ratio of the simulated perspective camera.
 * @zh 3D 节点坐标转换到 UI 节点坐标组件
 * 主要提供映射后的转换世界坐标以及模拟透视相机远近比。
 */
@ccclass('UITracker')
export class UITracker extends Component {
    /**
     * @en
     * Target node.
     *
     * @zh
     * 目标对象。
     */
    @type(Node)
    get target(): Node | null {
        return this._target;
    }

    set target(value) {
        if (this._target === value) {
            return;
        }

        this._target = value;
        this._checkCanMove();
    }

    /**
     * @en
     * The 3D camera representing the original coordinate system.
     *
     * @zh
     * 照射相机。
     */
    @type(Camera)
    get camera(): Camera | null {
        return this._camera;
    }

    set camera(value) {
        if (this._camera === value) {
            return;
        }

        this._camera = value;
        this._checkCanMove();
    }

    /**
     * @en
     * Whether to scale the converted 2d node's size according to the distance between the camera and the 3d node.
     *
     * @zh
     * 是否是缩放映射。
     */
    @property
    get useScale(): boolean {
        return this._useScale;
    }

    set useScale(value) {
        if (this._useScale === value) {
            return;
        }

        this._useScale = value;
    }

    /**
     * @en
     * The distance from the camera for displaying the 2d node in normal size.
     *
     * @zh
     * 距相机多少距离为正常显示计算大小。
     */
    @property
    get distance(): number {
        return this._distance;
    }

    set distance(value) {
        if (this._distance === value) {
            return;
        }

        this._distance = value;
    }

    /**
     * @en
     * Event callback after coordinates synchronization.
     * The first parameter of the callback is the mapped local coordinate in UI camera.
     * The second parameter is the distance scale of the 3d node from the 3d camera viewport.
     *
     * @zh
     * 映射数据事件。回调的第一个参数是映射后的本地坐标，第二个是距相机距离比。
     */
    // @type([EventHandler])
    // public syncEvents: EventHandler[] = [];
    @property(Node)
    protected _target: Node = null;
    @property(Camera)
    protected _camera: Camera = null;
    @property
    protected _useScale = false;
    @property
    protected _distance = 10;

    protected _transformPos = new Vec3();
    protected _viewPos = new Vec3();
    protected _canMove = true;
    // protected _lastWPos = new Vec3();
    // protected _lastCameraPos = new Vec3();

    protected QuatZero: Quat = new Quat();

    public onEnable(): void {
        this._checkCanMove();
        this._update(); //修复如果相机移动中 显示这个组件 图标会跳一下(就是因为此时还没更新 直到下一帧前才会更新成对的位置)
    }
    protected start(): void {
        if (this._camera == null) {
            this._camera = GameGlobal.mainCamera;
        }
    }

    public lateUpdate(): void {
        this._update();
    }

    private _update() {
        if (!this._canMove || !this.camera) {
            return;
        }
        this.node.setWorldRotation(this.QuatZero);

        const wPos = this._target.worldPosition;
        const camera = this._camera;
        // if (this._lastWPos.equals(wPos, 0.000001) && this._lastCameraPos.equals(camera.node.worldPosition, 0.000001)) {// 
        //     return;
        // }

        // this._lastWPos.set(wPos);
        // this._lastCameraPos.set(camera.node.worldPosition);
        // [HACK]
        camera.camera.update();
        camera.convertToUINode(wPos, this.node.parent!, this._transformPos);
        this.node.setPosition(this._transformPos);

        if (this._useScale) {
            Vec3.transformMat4(this._viewPos, this._target.worldPosition, camera.camera.matView);
            const ratio = this._distance / Math.abs(this._viewPos.z);
            this.node.setScale(ratio, ratio, 1);
        }
    }
    // public refreshPos() {
    //     this._lastWPos.set(0, 0, 0)
    //     this._lastCameraPos.set(0, 0, 0)
    // }


    protected _checkCanMove(): void {
        this._canMove = !!(this._camera && this._camera.camera && this._target);
    }
}
