import { _decorator, CCFloat, CCInteger, Component, Mat4, Node, Quat, Tween, tween, Vec3 } from 'cc';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

/**
 * 背包特殊回调接口
 * 用于在背包操作前执行特定的重置逻辑
 */
export interface IBagSpecialCallback {
    /** 果冻效果前的重置回调 */
    resetBeforeJelly?: () => void;
    /** 排序前的重置回调 */
    resetBeforeSort?: () => void;
}

/**
 * 背包系统组件
 * 支持3D布局的物品容器，提供飞入飞出动画效果
 * 泛型T必须继承自Component，用于存储各种类型的物品组件
 */
@ccclass('Bag')
export class Bag<T extends Component> extends Component {
    @property({ type: CCInteger, min: 1, step: 1, tooltip: "背包列数" })
    private col: number = 1;

    @property({ type: CCInteger, min: 1, step: 1, tooltip: "背包行数" })
    private row: number = 1;

    @property({ type: CCFloat, tooltip: "列间距" })
    private colSep: number = 0.1;                     // 列间距

    @property({ type: CCFloat, tooltip: "行间距" })
    private rowSep: number = 0.1;                     // 行间距

    @property({ type: CCFloat, tooltip: "层间距" })
    private layerSep: number = 0.1;                   // 层间距

    @property({ type: CCFloat, tooltip: "飞入背包时间" })
    private flyToBagTime: number = 0.2;

    @property({ type: CCFloat, tooltip: "离开背包时间" })
    private leavingBagTime: number = 0.2;

    @property({ type: Node, tooltip: "背包容器节点，如果为空则使用当前节点" })
    private bagNode?: Node;                   // 背包容器节点，如果为空则使用当前节点

    @property({ type: CCInteger, min: 1, step: 1, tooltip: "最大显示物品堆叠数量" })
    private maxShowStackNum: number = 999999;         // 最大显示物品堆叠数量

    @property({ tooltip: "保存位置的偏移量" })
    private saveOffset: Vec3 = new Vec3(0, 0, 0);   // 保存位置的偏移量

    private items: (T & IBagSpecialCallback)[] = [];     // 当前背包中的物品数组
    private flyingToBag: T[] = [];                       // 正在飞向背包的物品数组
    private leavingFromBag: T[] = [];                    // 正在离开背包的物品数组

    /**
     * 组件启动时初始化背包节点
     */
    start() {
        if (this.bagNode == undefined) {
            this.bagNode = this.node;    // 如果未设置背包节点，使用当前节点
        }
    }

    /**
     * 获取下一个空闲位置的坐标
     * @returns 返回空闲位置的3D坐标
     */
    private getFreePos() {
        return this.getBagPos(this.flyingToBag.length + this.items.length);
    }

    /**
     * 根据数组索引计算背包中的3D位置
     * @param arrIndex 数组索引
     * @returns 返回[x, y, z]坐标数组
     */
    private getBagPos(arrIndex: number): [number, number, number] {
        const LAY_NUM = this.col * this.row;    // 每层的物品数量
        if (arrIndex >= this.maxShowStackNum - 1) {
            arrIndex = this.maxShowStackNum - 1;    // 限制在最大显示数量内
        }
        let layIndex = Math.floor(arrIndex / LAY_NUM);    // 计算层级索引
        let index = arrIndex % LAY_NUM;                   // 计算层内索引
        let colIndex = index % this.col;                  // 计算列索引
        let rowIndex = Math.floor(index / this.col);      // 计算行索引
        return [
            colIndex * this.colSep + this.saveOffset.x,    // X坐标：列索引 * 列间距 + 偏移
            layIndex * this.layerSep + this.saveOffset.y,  // Y坐标：层索引 * 层间距 + 偏移
            rowIndex * this.rowSep + this.saveOffset.z     // Z坐标：行索引 * 行间距 + 偏移
        ];
    }

    /**
     * 设置节点在背包中的位置
     * @param node 要设置位置的节点
     * @param arrIndex 数组索引
     */
    private setBagPos(node: Node, arrIndex: number) {
        let pos = this.getBagPos(arrIndex);    // 获取3D位置坐标
        node.setPosition(...pos);              // 设置节点位置
    }

    /**
     * 检查是否可以添加新物品
     * @returns 如果可以添加返回true，否则返回false
     */
    public canAdd() {
        if (this.items.length + this.flyingToBag.length >= this.maxShowStackNum) {
            return false;    // 超过最大显示数量
        }
        return true;
    }
    /**
     * 添加物品到背包，带有飞入动画效果
     * @param item 要添加的物品组件
     * @param middleY 中间Y轴偏移量
     * @param completeCall 完成回调，参数为操作是否成功
     */
    public add(item: T & IBagSpecialCallback, middleY: number, completeCall?: (success: boolean) => void) {
        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);    // 物品正在离开背包，添加失败
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);    // 物品已在飞向背包列表中，添加失败
            return;
        }
        index = this.items.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);    // 物品已在背包中，添加失败
            return;
        }

        let endLocalPos = new Vec3(...this.getFreePos());    // 获取目标本地位置

        this.flyingToBag.push(item);    // 将物品加入飞向背包列表
        let startPos = new Vec3(item.node.worldPosition);    // 起始世界位置
        let ctrlPos = new Vec3();                             // 贝塞尔曲线控制点
        let endPos = new Vec3();                              // 结束世界位置
        let tmpPos = new Vec3();                              // 临时位置变量

        // 位置更新函数，实时计算贝塞尔曲线控制点
        let updatePos = () => {
            Vec3.transformMat4(endPos, endLocalPos, this.bagNode?.worldMatrix || new Mat4());    // 转换为世界坐标
            Vec3.zero(ctrlPos);
            ctrlPos.add(startPos);
            ctrlPos.add(endPos);
            ctrlPos.multiplyScalar(0.5);    // 计算中点
            ctrlPos.y += middleY;                 // 向上偏移形成抛物线
        }
        let startRotation = new Quat(item.node.worldRotation);
        let tempRotation = new Quat();
        // 创建飞入动画缓动
        tween({ v: 0 })
            .to(this.flyToBagTime, { v: 1 }, {
                onUpdate: o => {
                    if (!item?.isValid) { return; }
                    updatePos();    // 更新位置
                    Utils.bezierCurve(o.v, startPos, ctrlPos, endPos, tmpPos);    // 贝塞尔曲线插值
                    item?.node?.setWorldPosition(tmpPos);                           // 设置世界位置
                    Quat.slerp(tempRotation, startRotation, this.bagNode.worldRotation, o.v);
                    item.node.setWorldRotation(tempRotation);// 设置世界位置
                }
            })
            .call(() => {
                if (!item?.isValid) { return; }
                // 动画完成后的处理
                let index = this.items.indexOf(item);
                if (index == -1) this.items.push(item);    // 添加到背包物品列表

                index = this.flyingToBag.indexOf(item);
                if (index != -1) this.flyingToBag.splice(index, 1);    // 从飞行列表中移除

                item.node.setParent(this.bagNode, true);    // 设置父节点为背包节点

                item.node.setRotationFromEuler(0, 0, 0);    // 重置旋转

                this.sortBag();    // 重新排列背包

                item.resetBeforeJelly && item.resetBeforeJelly();           // 执行果冻效果前的重置
                Utils.jellyEffect(item.node, item.node.scale.x);            // 播放果冻弹性效果
                completeCall && completeCall(true);                         // 调用成功回调
            })
            .start();
    }

    /**
     * 从背包中移除物品，带有飞出动画效果
     * @param item 要移除的物品组件
     * @param flyToNode 物品飞向的目标节点
     * @param middleY 中间Y轴偏移量
     * @param completeCall 完成回调，参数为操作是否成功
     * @param jelly 是否播放果冻效果，默认为true
     * @param offset 控制点的偏移量，可选
     */
    public remove(item: T & { resetBeforeJelly?: () => void }, flyToNode: Node, middleY: number, completeCall?: (success: boolean) => void, jelly = true, offset?: Vec3) {
        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);    // 物品已在离开列表中，移除失败
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);    // 物品正在飞向背包，移除失败
            return;
        }
        index = this.items.indexOf(item);
        if (index == -1) {
            completeCall && completeCall(false);    // 物品不在背包中，移除失败
            return;
        }

        this.items.splice(index, 1);         // 从背包物品列表中移除
        this.sortBag();                      // 重新排列背包
        this.leavingFromBag.push(item);      // 加入离开背包列表

        let startPos = new Vec3(item.node.worldPosition);    // 起始世界位置
        let ctrlPos = new Vec3();                             // 贝塞尔曲线控制点
        let endPos = new Vec3();                              // 结束世界位置
        let tmpPos = new Vec3();                              // 临时位置变量

        // 位置更新函数，实时计算贝塞尔曲线控制点
        let updatePos = () => {
            if (!flyToNode?.isValid) { return; }
            endPos.set(flyToNode.worldPosition);    // 获取目标节点世界位置
            Vec3.zero(ctrlPos);
            ctrlPos.add(startPos);
            ctrlPos.add(endPos);
            ctrlPos.multiplyScalar(0.5);             // 计算中点
            ctrlPos.y += middleY;                          // 向上偏移形成抛物线
            if (offset) {                            // 如果有偏移量
                ctrlPos.x += offset.x;
                ctrlPos.y += offset.y;
                ctrlPos.z += offset.z;
            }
        }
        let startRotation = new Quat(item.node.worldRotation);
        let tempRotation = new Quat();
        // 创建飞出动画缓动
        tween({ v: 0 })
            .to(this.leavingBagTime, { v: 1 }, {
                onUpdate: o => {
                    updatePos();    // 更新位置
                    Utils.bezierCurve(o.v, startPos, ctrlPos, endPos, tmpPos);    // 贝塞尔曲线插值
                    item?.node?.setWorldPosition(tmpPos);                           // 设置世界位置
                    Quat.slerp(tempRotation, startRotation, flyToNode.worldRotation, o.v);
                    item.node.setWorldRotation(tempRotation);
                }
            })
            .call(() => {
                if (!item?.isValid) { return; }
                // 动画完成后的处理
                let index = this.leavingFromBag.indexOf(item);
                if (index != -1) this.leavingFromBag.splice(index, 1);    // 从离开列表中移除

                if (jelly) {                                                    // 如果启用果冻效果
                    item.resetBeforeJelly && item.resetBeforeJelly();           // 执行果冻效果前的重置
                    Utils.jellyEffect(item.node, item.node.scale.x);            // 播放果冻弹性效果
                }
                completeCall && completeCall(true);                             // 调用成功回调
            })
            .start();
    }
    /**
     * 直接添加物品到背包（无动画）
     * @param item 要添加的物品组件
     */
    public directAdd(item: T) {
        let index = this.items.indexOf(item);
        if (index != -1) {
            return;    // 物品已存在，直接返回
        }
        this.items.push(item);    // 添加到背包物品列表
        this.sortBag();           // 重新排列背包
    }

    /**
     * 直接从背包移除物品（无动画）
     * @param item 要移除的物品组件
     */
    public directRemove(item: T & IBagSpecialCallback) {
        Tween.stopAllByTarget(item.node);
        item.resetBeforeJelly && item.resetBeforeJelly();
        let index = this.items.indexOf(item);
        if (index == -1) {
            return;    // 物品不存在，直接返回
        }
        this.items.splice(index, 1);    // 从背包物品列表中移除
        this.sortBag();                 // 重新排列背包
    }

    /**
     * 获取背包中的最后一个物品
     * @returns 返回最后一个物品，如果背包为空则返回null
     */
    public lastItem() {
        if (this.bagIsEmpty()) {
            return null;    // 背包为空
        }
        return this.items[this.items.length - 1];    // 返回最后一个物品
    }

    /**
     * 重新排列背包中所有物品的位置
     * 会调用每个物品的resetBeforeSort回调
     */
    public sortBag() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].resetBeforeSort && this.items[i].resetBeforeSort();    // 执行排序前的重置
            this.setBagPos(this.items[i].node, i);                              // 设置新位置
        }
    }

    /**
     * 检查背包是否为空
     * @returns 如果背包为空返回true，否则返回false
     */
    public bagIsEmpty() {
        return this.items.length == 0;    // 检查物品数组长度
    }

    /**
     * 获取背包中的物品数量
     * @returns 返回背包中的物品数量
     */
    public getBagItemCount() {
        return this.items.length;    // 返回背包中的物品数量
    }
}


