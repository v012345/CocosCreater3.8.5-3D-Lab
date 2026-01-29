import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { Bag } from './tools/Bag';
const { ccclass, property } = _decorator;

@ccclass('MainActor')
export class MainActor extends Component {
    /** 金币背包 */
    @property(Bag)
    bagCoin: Bag<Component>;
    @property(Prefab)
    coinPrefab: Prefab;
    start() {
        this.getCoinPile();
    }

    update(deltaTime: number) {

    }
    private getCoinPile() {
        // 获取金币堆

        let coin = instantiate(this.coinPrefab);
        this.bagCoin.add(coin.getComponent(Component), 5, (isSuccess) => {
            if (isSuccess) {
                console.log("金币添加成功");
            }
        })
        this.scheduleOnce(() => {
            this.getCoinPile();
        }, 2);
    }
}


