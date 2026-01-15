import { _decorator, Color, Component, instantiate, Label, math, Node, ParticleSystem2D, Pool, Prefab, tween, Tween, UIOpacity, v3, Vec3 } from 'cc';
import { GameGlobal } from './GameGlobal';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

const pv3 = new Pool<Vec3>(() => v3(), 20);

enum PropNumberType {
    Gold = "Gold",
}

@ccclass('PropNumber')
export class PropNumber extends Component {
    @property(Color)
    increaseColor = Color.GREEN.clone();
    @property(Color)
    reduceColor = Color.RED.clone();
    @property
    changeScale = new Vec3(1.3, 1.3, 1);

    @property(Prefab)
    propPrefab: Prefab;
    @property(Node)
    flyCreatePos: Node;
    @property(ParticleSystem2D)
    getPropPar: ParticleSystem2D;
    @property(Label)
    lab: Label;
    @property(Node)
    lightNode: Node;

    private getPropParIsPlaying = false;
    private realPropNum = 0;
    private defaultScale: Vec3;
    private defaultColor: Color;
    private lightUIOpacity: UIOpacity;


    onLoad() {
        switch (this.node.name) {
            case PropNumberType.Gold:
                GameGlobal.goldBar = this;
                break;
        }
        this.defaultColor = this.lab.color.clone();
        this.defaultScale = this.lab.node.getScale();
        this.getComponent(UIOpacity).opacity = 0;
        this.lightUIOpacity = this.lightNode.getComponent(UIOpacity);
        this.lightUIOpacity.opacity = 0;
    }


    protected start() {
        switch (this.node.name) {
            case PropNumberType.Gold:
                this.realPropNum = GameGlobal.actor.moneyNum();
                break;
        }
        this.lab.string = `${this.realPropNum}`;
        this.scheduleOnce(() => {
            tween(this.getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();
        }, 1);
    }
    playGetPropPar() {
        if (this.getPropParIsPlaying) {
            return;
        }
        this.getPropParIsPlaying = true;
        tween(this.lightUIOpacity)
            .to(this.getPropPar.duration, { opacity: 255 })
            .to(0.2, { opacity: 0 }).start();

        this.getPropPar.resetSystem();
        this.scheduleOnce(() => {
            this.getPropParIsPlaying = false;
        }, this.getPropPar.duration)
    }
    public addNum(num: number) {
        this.playGetPropPar();
        this.changeNum(Math.abs(num));
    }

    public subNum(num: number) {
        this.changeNum(-Math.abs(num));
    }
    private playLabScaleChange(t: number) {
        let startScaleTime = Math.min(t, 0.05);
        let endScaleTime = Math.min(t, 0.05);

        Tween.stopAllByTarget(this.lab.node);

        tween(this.lab.node)
            .to(startScaleTime, { scale: this.changeScale })
            .delay(t - startScaleTime - endScaleTime)
            .to(endScaleTime, { scale: this.defaultScale })
            .start();
    }
    private playLabColorChange(t: number, oldNum: number, newNum: number) {
        if (newNum > oldNum) {
            this.lab.color = this.increaseColor;
        } else if (newNum < oldNum) {
            this.lab.color = this.reduceColor;
        }
    }
    private _changeNumTweenObj: { v: number };
    public changeNum(num: number) {
        let oldNum = this.realPropNum;
        this.realPropNum += num;
        if (this.realPropNum < 0) this.realPropNum = 0;

        let t = Math.abs(num) * 0.01;
        if (this._changeNumTweenObj) {
            Tween.stopAllByTarget(this._changeNumTweenObj);
        }
        this.playLabScaleChange(t);
        this.playLabColorChange(t, oldNum, this.realPropNum);

        this._changeNumTweenObj = { v: oldNum };
        tween(this._changeNumTweenObj)
            .to(t, { v: this.realPropNum }, {
                progress: (start, end, current, ratio) => {
                    let newValue = math.lerp(start, end, ratio);
                    this.lab.string = `${Math.round(newValue)}`;
                    return newValue;
                },
            })
            .call(() => {
                this.lab.color = this.defaultColor;
                this._changeNumTweenObj = null;
            })
            .start();
    }

    private flyPropMinScale = v3(0.2, 0.2, 0.2);
    private flyPropMaxScale = v3(1, 1, 1);
    flyPropToUI(sceneNode: Node, callback?: (money: Node) => void, delay = 0) {
        let moneyContainer = this.flyCreatePos;

        const moneyNodeStartUIPos = pv3.alloc();
        let endUIPos = new Vec3();

        GameGlobal.mainCamera.convertToUINode(sceneNode.worldPosition, moneyContainer, moneyNodeStartUIPos);

        let moneyNode = instantiate(this.propPrefab);
        moneyNode.setParent(moneyContainer);

        moneyNode.setPosition(moneyNodeStartUIPos);
        moneyNode.setScale(this.flyPropMinScale);

        tween(moneyNode)
            .delay(delay / 1000)
            .to(0.5, { position: endUIPos, scale: this.flyPropMaxScale })
            .call(() => {
                callback && callback(moneyNode);
            })
            .start();

        pv3.free(moneyNodeStartUIPos);
    }
    private flyPropMidScale = v3(1.5, 1.5, 1.5);
    flyPropTo3DScene(toSceneNode: Node, callback?: (propNode: Node) => void) {
        let propContainer = this.flyCreatePos;
        let startUIPos = v3(0, 0, 0);

        let moneyNode = instantiate(this.propPrefab);
        moneyNode.setParent(propContainer);
        moneyNode.setScale(this.flyPropMaxScale);

        moneyNode.setPosition(startUIPos);



        let ctrlPos = new Vec3();
        let tempVec3 = new Vec3();
        let distPos = new Vec3();


        tween({ v: 0 })
            .to(0.2, { v: 1 }, {
                onUpdate: t => {
                    GameGlobal.mainCamera.convertToUINode(toSceneNode.worldPosition, propContainer, distPos);
                    distPos.z = 0;//2d

                    if (t.v <= 0.5) {
                        Vec3.lerp(tempVec3, this.flyPropMaxScale, this.flyPropMidScale, t.v / 0.5);
                    } else {
                        Vec3.lerp(tempVec3, this.flyPropMidScale, this.flyPropMinScale, (t.v - 0.5) / 0.5);
                    }
                    moneyNode.setScale(tempVec3);

                    ctrlPos.set(startUIPos);
                    ctrlPos.add(distPos);
                    if (GameGlobal.isShu) {
                        ctrlPos.multiplyScalar(0.3);
                        ctrlPos.x -= 200;
                    } else {
                        ctrlPos.multiplyScalar(0.7);
                        ctrlPos.y += 200;
                    }

                    Utils.bezierCurve(t.v, startUIPos, ctrlPos, distPos, tempVec3);
                    moneyNode.setPosition(tempVec3);
                }
            })
            .call(() => {
                callback && callback(moneyNode);
            })
            .start();
    }

    public getRealNum() {
        return this.realPropNum;
    }
}