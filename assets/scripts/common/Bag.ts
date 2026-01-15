import { _decorator, CCFloat, CCInteger, Component, Node, tween, Vec3 } from 'cc';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

export interface IBagSpecialCallback {
    resetBeforeJelly?: () => void;
    resetBeforeSort?: () => void;
}

export interface IBagItemFlyAni<T extends Component> {
    process(item: T, startPos: Vec3, endPos: Vec3, ratio: number, isAdd: boolean): void;
}

export class BagDefaultFlyAni<T extends Component> implements IBagItemFlyAni<T> {
    bezierCtrlDir: Node | Vec3;

    private _ctrlPos = new Vec3();
    private _outPos = new Vec3();
    private _middlePos = new Vec3();
    process(item: T, startPos: Vec3, endPos: Vec3, ratio: number, isAdd: boolean): void {
        this.getBezierCtrlPos(this._ctrlPos, startPos, endPos);
        Utils.bezierCurve(ratio, startPos, this._ctrlPos, endPos, this._outPos);
        item.node.setWorldPosition(this._outPos);
    }
    getBezierCtrlPos(out: Vec3, startPos: Vec3, endPos: Vec3) {
        this._middlePos.set(startPos);
        this._middlePos.add(endPos);
        this._middlePos.multiplyScalar(0.5);


        if (this.bezierCtrlDir) {
            if (this.bezierCtrlDir instanceof Node) {
                out.set(this._middlePos);
                out.subtract(this.bezierCtrlDir.worldPosition);
            } else {
                out.set(this.bezierCtrlDir);
            }
            out.normalize();
        } else {
            out.set(Vec3.UP);
        }
        
        out.multiplyScalar(Math.max(2, Vec3.distance(startPos, endPos)));
        out.add(this._middlePos);
        return out;
    }
}


export type BagSpecialParam = {
    noJelly?: boolean;
}

@ccclass('Bag')
export class Bag<T extends Component> extends Component {
    @property({ type: CCInteger, min: 1, step: 1 })
    maxX = 1;
    @property({ type: CCInteger, min: 1, step: 1 })
    maxZ = 1;
    @property({ type: CCFloat })
    xSep = 0.1;
    @property({ type: CCFloat })
    zSep = 0.1;
    @property({ type: CCFloat })
    ySep = 0.1;
    @property
    useSpeed = false;
    @property({ type: CCFloat, visible: function (this: Bag<T>) { return !this.useSpeed } })
    flyToBagTime = 0.2;
    @property({ type: CCFloat, visible: function (this: Bag<T>) { return !this.useSpeed } })
    leavingBagTime = 0.2;
    @property({ type: CCFloat, visible: function (this: Bag<T>) { return this.useSpeed } })
    flyToBagSpeed = 25;
    @property({ type: CCFloat, visible: function (this: Bag<T>) { return this.useSpeed } })
    leavingBagSpeed = 25;

    @property(Node)
    bagNode?: Node;
    @property({ type: CCInteger, min: 1, step: 1 })
    maxShowStackNum = 999999;

    items: (T & IBagSpecialCallback)[] = [];
    flyingToBag: T[] = [];
    leavingFromBag: T[] = [];

    defaultFlyAni = new BagDefaultFlyAni<T>();

    implFlyAni: IBagItemFlyAni<T>

    changeNotifyFun: (val: number) => void;

    start() {
        if (this.bagNode == undefined) {
            this.bagNode = this.node;
        }
    }

    getFreePos() {
        return this.getBagPos(this.flyingToBag.length + this.items.length);
    }
    getBagPos(arrIndex: number): [number, number, number] {
        const LAY_NUM = this.maxX * this.maxZ;
        if (arrIndex >= this.maxShowStackNum - 1) {
            arrIndex = this.maxShowStackNum - 1;
        }
        let yIndex = Math.floor(arrIndex / LAY_NUM);
        let index = arrIndex % LAY_NUM;
        let xIndex = index % this.maxX;
        let zIndex = Math.floor(index / this.maxX);
        return [xIndex * this.xSep, yIndex * this.ySep, zIndex * this.zSep];
    }
    setBagPos(node: Node, arrIndex: number) {
        let pos = this.getBagPos(arrIndex);
        node.setPosition(...pos);
    }
    canAdd() {
        if (this.items.length + this.flyingToBag.length >= this.maxShowStackNum) {
            return false;
        }
        return true;
    }
    add(item: T & IBagSpecialCallback, completeCall?: (success: boolean) => void, param?: BagSpecialParam) {
        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.items.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }

        let endLocalPos = new Vec3(...this.getFreePos());

        this.flyingToBag.push(item);

        let startPos = new Vec3(item.node.worldPosition);

        let endPos = new Vec3();

        const countEndPos = () => Vec3.transformMat4(endPos, endLocalPos, this.bagNode.worldMatrix);
        countEndPos();

        let costTime: number;
        if (this.useSpeed) {
            costTime = Vec3.distance(startPos, endPos) / this.flyToBagSpeed;
        } else {
            costTime = this.flyToBagTime;
        }

        const ani = this.implFlyAni ? this.implFlyAni : this.defaultFlyAni;

        tween({ v: 0 })
            .to(costTime, { v: 1 }, {
                onUpdate: o => {
                    countEndPos();
                    ani.process(item, startPos, endPos, o.v, true);
                }
            })
            .call(() => {

                let index = this.items.indexOf(item);
                if (index == -1) {
                    this.items.push(item);
                    this.changeNotifyFun?.(1);
                }

                index = this.flyingToBag.indexOf(item);
                if (index != -1) this.flyingToBag.splice(index, 1);

                item.node.setParent(this.bagNode, true);

                this.sortBag();
                if (param == null || !param.noJelly) {
                    item.resetBeforeJelly && item.resetBeforeJelly();
                    Utils.jellyEffect(item.node, item.node.scale.x);
                }
                completeCall && completeCall(true);
            })
            .start();
    }

    remove(item: T & { resetBeforeJelly?: () => void }, flyToNode: Node, completeCall?: (success: boolean) => void, param?: BagSpecialParam) {
        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.items.indexOf(item);
        if (index == -1) {
            completeCall && completeCall(false);
            return;
        }
        this.items.splice(index, 1);
        this.changeNotifyFun?.(-1);
        this.sortBag();
        this.leavingFromBag.push(item);

        let startPos = new Vec3(item.node.worldPosition);
        let endPos = new Vec3();

        const countEndPos = () => endPos.set(flyToNode.worldPosition);

        countEndPos();

        let costTime: number;
        if (this.useSpeed) {
            costTime = Vec3.distance(startPos, endPos) / this.leavingBagSpeed;
        } else {
            costTime = this.leavingBagTime;
        }

        const ani = this.implFlyAni ? this.implFlyAni : this.defaultFlyAni;

        tween({ v: 0 })
            .to(costTime, { v: 1 }, {
                onUpdate: o => {
                    countEndPos();
                    ani.process(item, startPos, endPos, o.v, false);
                }
            })
            .call(() => {

                let index = this.leavingFromBag.indexOf(item);
                if (index != -1) this.leavingFromBag.splice(index, 1);

                if (param == null || !param.noJelly) {
                    item.resetBeforeJelly && item.resetBeforeJelly();
                    Utils.jellyEffect(item.node, item.node.scale.x);
                }
                completeCall && completeCall(true);
            })
            .start();
    }
    directAdd(item: T) {
        let index = this.items.indexOf(item);
        if (index != -1) {
            return;
        }
        this.items.push(item);
        this.changeNotifyFun?.(1);
        this.sortBag();
    }
    directRemove(item: T) {
        let index = this.items.indexOf(item);
        if (index == -1) {
            return;
        }
        this.items.splice(index, 1);
        this.changeNotifyFun?.(-1);
        this.sortBag();
    }
    lastItem() {
        if (this.bagIsEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }
    sortBag() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].resetBeforeSort && this.items[i].resetBeforeSort();
            this.setBagPos(this.items[i].node, i);
        }
    }
    bagIsEmpty() {
        return this.items.length == 0;
    }
}


