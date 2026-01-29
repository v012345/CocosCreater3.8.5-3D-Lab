import { _decorator, Component, Node, randomRange, tween, Vec3 } from 'cc';
import { IBagSpecialCallback } from './tools/Bag';

const { ccclass, property } = _decorator;

@ccclass('CoinItem')
export class CoinItem extends Component implements IBagSpecialCallback {
    /** 是否掉落完成 */
    isDropComplete = false;
    /** 是否被收集 */
    isCollected = false;
    resetBeforeJelly() {
        this.node.setScale(1, 1, 1);
    }
    resetBeforeSort() {
        this.node.setScale(1, 1, 1);
    }

    update(deltaTime: number) {

    }
}


