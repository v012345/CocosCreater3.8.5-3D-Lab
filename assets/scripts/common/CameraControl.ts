import { _decorator, Camera, Component, director, math, Node, screen, Tween, tween, v3, Vec3 } from 'cc';
import { DEBUG } from 'cc/env';
import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

const DEBUG_SET_PATH = () => {
    if (!DEBUG) {
        return;
    }
    // console.log("添加debug路径属性")
    const setDebugAttr = (target: Node | Component) => {
        target["__路径:"] = (target instanceof Node) ? target.getPathInHierarchy() : target.node.getPathInHierarchy();
        target["__名字:"] = target.name;
    }
    const walkChildren = (node: Node) => {
        if (node) {
            setDebugAttr(node);

            for (let component of node.components) {
                setDebugAttr(component);
            }

            for (let el of node.children) {
                walkChildren(el);
            }
        }
    }
    walkChildren(director.getScene());
    setTimeout(() => {
        DEBUG_SET_PATH();
    }, 0);
}

@ccclass('CameraControl')
export class CameraControl extends Component {
    @property(Node)
    cameraRoot: Node;
    @property(Camera)
    initCamera: Camera;
    private endCameraOffset = new Vec3();
    @property
    private _screenOffsetPosV = v3(57.64, 81.34, 81.618);
    @property
    public get screenOffsetPosV() {
        return this._screenOffsetPosV;
    }
    public set screenOffsetPosV(value) {
        this._screenOffsetPosV = value;
        this.cameraOnLoad();
    }
    @property
    private _screenOffsetPosH = v3(44.34, 62.14, 63.018);
    @property
    public get screenOffsetPosH() {
        return this._screenOffsetPosH;
    }
    public set screenOffsetPosH(value) {
        this._screenOffsetPosH = value;
        this.cameraOnLoad();
    }
    @property
    private _euler = v3(-38.9, 35.1, 0);
    @property
    public get euler() {
        return this._euler;
    }
    public set euler(value) {
        this._euler = value;
        this.cameraOnLoad();
    }

    @property
    private _fovV = 60;
    // private __fovV = 100;
    @property
    public get fovV() {
        return this._fovV;
    }
    public set fovV(value) {
        this._fovV = value;
        this.cameraOnLoad();
    }

    @property
    private _fovH = 45;
    // private __fovH = 100;
    @property
    public get fovH() {
        return this._fovH;
    }
    public set fovH(value) {
        this._fovH = value;
        this.cameraOnLoad();
    }

    initFightFov = -30;


    tou: Node;
    private isShake = false;
    onLoad() {
        GameGlobal.cameraControl = this;
    }


    start() {
        // DEBUG_SET_PATH();
        // this.tou = this.getDefaultTou();
        this.tou = GameGlobal.fight.cameraFocusNode;
        GameGlobal.cameraMoving = true;
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                this.initCamera.node.active = false;
            })
        })
    }
    getDefaultTou() {
        return GameGlobal.actor.node.getChildByName("Tou");
    }
    cameraOnLoad() {
        this.node.setRotationFromEuler(this.euler);
        this.node.getComponent(Camera).fov = this.getFinalFov();
        this.cameraFollow();
    }
    private __getFinalOffsetV3 = new Vec3();
    getFinalOffset() {
        this.__getFinalOffsetV3.set(GameGlobal.isShu ? this.screenOffsetPosV : this.screenOffsetPosH);
        if (this.isEndCamera) {
            this.__getFinalOffsetV3.add(this.endCameraOffset);
        }
        return this.__getFinalOffsetV3;
    }
    getFinalFov() {
        if (GameGlobal.isShu) {
            return this.fovV + this.initFightFov;
        } else {
            return this.fovH + this.initFightFov;
        }
    }
    cameraFollow() {
        this.node.setRotationFromEuler(this.euler);

        let actorPos = this.tou.worldPosition;
        let pos = new Vec3();
        Vec3.add(pos, actorPos, this.getFinalOffset());
        this.node.setPosition(pos);
    }

    getCameraMoveTime(pos1: Vec3, pos2: Vec3) {
        //t=s/v
        return Vec3.distance(pos1, pos2) / 8;
    }
    private isEndCamera = false;
    toEndCamera(callfunc?: () => void) {
        if (this.isEndCamera) {
            return;
        }
        this.isEndCamera = true;

        let startPos = this.node.worldPosition.clone();
        let endPos = this.node.forward.clone().negative();
        endPos.multiplyScalar(10);
        endPos.add(startPos);

        Vec3.subtract(this.endCameraOffset, endPos, startPos);


        const time = 0.4 * this.getCameraMoveTime(startPos, endPos);
        tween(this.node)
            .to(time, { worldPosition: endPos })
            .call(() => {
                callfunc?.();
            })
            .start();
    }
    cameraFocus(targetNode: Node, callback?: () => void, speed = 0.4) {
        if (GameGlobal.cameraMoving) {
            return;
        }

        GameGlobal.cameraMoving = true;
        let initPos = this.node.worldPosition.clone();
        let targetPos = targetNode.worldPosition.clone();
        let targetPos2 = new Vec3(0, 0, 0);
        Vec3.add(targetPos2, targetPos, this.getFinalOffset());
        Tween.stopAllByTarget(this.node);

        const time = speed * this.getCameraMoveTime(initPos, targetPos2);

        tween(this.node)
            .to(time, { worldPosition: targetPos2 })
            .call(() => {
                this.tou = targetNode;
                GameGlobal.cameraMoving = false;
                callback && callback();
            })
            .start();
        let finalFov = this.getFinalFov();
        let camera = this.node.getComponent(Camera);
        if (camera.fov != finalFov) {
            tween(camera).to(time * 0.5, { fov: finalFov }).start();
        }
    }
    cameraShock(small = false) {
        if (this.isShake) {
            return;
        }
        this.isShake = true;

        let scope: number;
        if (small) {
            scope = 0.05;
        } else {
            scope = 0.5;
        }

        tween(this.cameraRoot)
            .by(.07, { position: v3(-scope, 0, 0) })
            .by(.07, { position: v3(scope, 0, 0) })
            .by(.07, { position: v3(0, -scope, 0) })
            .by(.07, { position: v3(0, scope, 0) })
            .by(.07, { position: Vec3.ZERO })
            .call(() => {
                this.isShake = false;
            })
            .start();
    }
}