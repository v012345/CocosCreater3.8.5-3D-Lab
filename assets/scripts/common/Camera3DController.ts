import { _decorator, Camera, Component, EventMouse, EventTouch, Input, input, Node, Quat, v3, Vec3 } from 'cc';
import { DEBUG } from 'cc/env';
const { ccclass, property } = _decorator;

const P1_targetPos = new Vec3();
const P1_distPos = new Vec3();
const P1_offset = new Vec3();

@ccclass('Camera3DController')
export class Camera3DController extends Component {
    @property(Node)
    target: Node = null;
    mainCamera: Camera;
    distance: number = 10;

    direction: Vec3 = v3()

    tempQuat: Quat = new Quat();
    protected onLoad(): void {
        this.mainCamera = this.getComponent(Camera);
    }
    start() {
        this.resize();

        if (!DEBUG) {
            this.scheduleOnce(() => {
                this.enabled = false;
            })
        }
    }
    resize() {
        Vec3.subtract(this.direction, this.target.getWorldPosition(), this.node.getWorldPosition())
        this.distance = this.direction.length();
        this.direction.normalize()

        this.initCamera()
    }

    initCamera() {
        const targetPos = this.target.getWorldPosition().clone();

        const desPos = v3();
        Vec3.subtract(desPos, targetPos, Vec3.multiplyScalar(v3(), this.direction, this.distance));

        this.node.setWorldPosition(desPos);
        this.node.lookAt(targetPos);
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }
    private onMouseWheel(evt: EventMouse) {
        const scrollY = evt.getScrollY();
        if (scrollY > 0) {
            if (this.distance > 0) {
                this.distance -= 0.3;
            }
        } else if (scrollY < 0) {
            this.distance += 0.3;
        }
    }
    onTouchMove(event: EventTouch) {
        const delta = event.getDelta()

        // 水平方向旋转
        const axis: Vec3 = Vec3.UP;
        const rad = -delta.x * 1e-2;

        Quat.fromAxisAngle(this.tempQuat, axis, rad);
        Vec3.transformQuat(this.direction, this.direction, this.tempQuat)
        this.direction.normalize()


        // 垂直方向旋转
        const axis2: Vec3 = v3()
        const rad2 = delta.y * 1e-2;

        Vec3.cross(axis2, this.direction, Vec3.UP)
        Quat.fromAxisAngle(this.tempQuat, axis2, rad2)
        Vec3.transformQuat(this.direction, this.direction, this.tempQuat)

        this.direction.normalize()
    }

    protected update(dt: number): void {
        this.target.getWorldPosition(P1_targetPos)

        Vec3.multiplyScalar(P1_offset, this.direction, this.distance);
        Vec3.subtract(P1_distPos, P1_targetPos, P1_offset);
        this.node.setWorldPosition(P1_distPos)
        this.node.lookAt(P1_targetPos)
    }
}


