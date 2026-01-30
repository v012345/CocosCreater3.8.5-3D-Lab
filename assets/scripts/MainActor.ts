import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Bag } from './tools/Bag';
import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('MainActor')
export class MainActor extends Component {
    /** 金币背包 */
    @property(Bag)
    bagCoin: Bag<Component>;
    @property(Prefab)
    coinPrefab: Prefab;
    moveDir: Vec3 = new Vec3(0, 0, 0);
    isMoving: boolean = false;
    start() {
        GameGlobal.mainActor = this;
        this.getCoinPile();
    }

    update(deltaTime: number) {
        this.updateStateMachine(deltaTime);
    }
    updateStateMachine(deltaTime: number) {
        // 状态机更新逻辑
    };
    /**
 * 设置角色移动
 * @param dir 移动方向
 */
    move(dir: Vec3) {

        this.moveDir = new Vec3(dir.x, dir.z, -dir.y);
        this.moveDir.normalize();
        console.log("移动方向：", this.moveDir);
        this.isMoving = true;
    }
    stopMove() {
        this.isMoving = false;
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


