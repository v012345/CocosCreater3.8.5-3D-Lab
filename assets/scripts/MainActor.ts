import { _decorator, Component, Node } from 'cc';
import { Bag } from './tools/Bag';
const { ccclass, property } = _decorator;

@ccclass('MainActor')
export class MainActor extends Component {
    /** 金币背包 */
    @property(Bag)
    bagCoin: Bag<Component>;

    start() {

    }

    update(deltaTime: number) {

    }
}


