import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Bag } from './tools/Bag';
import { GameGlobal } from './GameGlobal';
import { StateDefine } from './EnumDefine';
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
    currState: StateDefine = StateDefine.Idle;
    start() {
        GameGlobal.mainActor = this;
        this.getCoinPile();
    }

    update(deltaTime: number) {
        this.updateStateMachine(deltaTime);
    }
    updateStateMachine(deltaTime: number) {
        if (this.isMoving) {
            this.changeActorState(StateDefine.Move);
        } else {
            this.changeActorState(StateDefine.Idle);
        }
        switch (this.currState) {
            case StateDefine.Idle:
                this.onIdleState(deltaTime);
                break;
            case StateDefine.Move:
                this.onMoveState(deltaTime);
                break;
        }
    }
    private onIdleState(deltaTime: number) {

    }
    private onMoveState(deltaTime: number) {

        this.performMovement(deltaTime);

    }

    private performMovement(deltaTime: number) {

        // Vec3.multiplyScalar(this.dir, this.moveDir, this.speed * deltaTime);
        // this.characterController.move(this.dir);

        // GameGlobal.cameraControl.cameraFollow();
    }

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
    private changeActorState(newState: StateDefine) {
        if (this.currState === newState) {
            return;
        }
        this.exitState(this.currState);
        const oldState = this.currState;
        this.currState = newState;
        this.enterState(newState, oldState);
    }


    private enterState(state: StateDefine, oldState: StateDefine | string) {

    }


    private exitState(state: StateDefine | string) {

    }
}


