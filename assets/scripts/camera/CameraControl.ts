import { _decorator, Component, Node, Vec3, Enum, screen, tween, Camera, Quat, Tween } from 'cc';
import { CameraFollow } from './CameraFollow';
const { ccclass, property } = _decorator;
enum CameraUpdatePhase {
    Update = 0,
    LateUpdate = 1,
}
@ccclass('CameraControl')
export class CameraControl extends Component {
    _oldUpdate: any;
    _oldLateUpdate: any;
    _hackedComponent: Component;
    _objectPos: Vec3 = new Vec3();
    _objectRotation: Vec3 = new Vec3();
    _targetPos: Vec3 = new Vec3();

    @property(Node)
    followObject_: Node;

    public set followObject(v: Node) {
        let cameraFollow = v.getComponent(CameraFollow)
        if (cameraFollow) {
            cameraFollow.destroy()
        }
        cameraFollow = v.addComponent(CameraFollow);
        this.followObject_ = v;
        this._oldUpdate = (cameraFollow as any).update;
        this._oldLateUpdate = (cameraFollow as any).lateUpdate;
        (cameraFollow as any).update = (dt: number) => {
            if (this.updatePhase == CameraUpdatePhase.Update) {
                this._cameraFollow(dt);
            }
            this._oldUpdate.call(this._hackedComponent, dt);
        }
        (cameraFollow as any).lateUpdate = (dt: number) => {
            if (this.updatePhase == CameraUpdatePhase.LateUpdate) {
                this._cameraFollow(dt);
            }
            this._oldLateUpdate.call(this._hackedComponent, dt);
        }
    }

    public get followObject(): Node {
        return this.followObject_
    }


    @property({
        type: Enum(CameraUpdatePhase),
        displayName: 'Use Which to Update Camera'
    })
    updatePhase: CameraUpdatePhase = CameraUpdatePhase.Update;

    @property(Vec3)
    offset = new Vec3(0, 208.576676, -145.237413);

    onLoad() {

    }


    start() {
        if (this.followObject_) {
            this.followObject = this.followObject_
            this._cameraFollow(-1)
        }
    }

    _cameraFollow(deltaTime: number) {
        this._objectPos = this.followObject.worldPosition.clone();
        this.followObject.worldRotation.getEulerAngles(this._objectRotation);
        Vec3.add(this._targetPos, this._objectPos, this.offset);
        if (deltaTime >= 0) {
            Vec3.lerp(this._targetPos, this.node.position, this._targetPos, deltaTime * 4);
        }
        this.node.setPosition(this._targetPos);
        this.node.lookAt(this._objectPos);
    }

    cameraShock() {
        let pos = this.node.position.clone();
        tween(this.node)
            .to(.1, { position: new Vec3(pos.x - 1, pos.y, pos.z) })
            .to(.1, { position: new Vec3(pos.x + 1, pos.y, pos.z) })
            .to(.1, { position: new Vec3(pos.x - .5, pos.y, pos.z) })
            .to(.1, { position: new Vec3(pos.x + .5, pos.y, pos.z) })
            .to(.1, { position: pos })
            .start();
    }

}