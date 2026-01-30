import { _decorator, CharacterController, Component, instantiate, Node, Prefab, Quat, SkeletalAnimation, Vec3 } from 'cc';
import { Bag } from './tools/Bag';
import { GameGlobal } from './GameGlobal';
import { AnimDefine, StateDefine } from './EnumDefine';
import { ActorAnimation } from './Anim/ActorAnimation';
const { ccclass, property } = _decorator;

@ccclass('MainActor')
export class MainActor extends Component {
    /** 金币背包 */
    @property(Bag)
    bagCoin: Bag<Component>;
    @property(Prefab)
    coinPrefab: Prefab;
    characterController: CharacterController;
    moveDir: Vec3 = new Vec3(0, 0, 0);
    isMoving: boolean = false;
    currAnim: AnimDefine = AnimDefine.Null;
    currState: StateDefine = StateDefine.Null;
    @property(Node)
    animNode: Node;
    anim: SkeletalAnimation | null = null;
    animEvent: ActorAnimation | null = null;  // 动画事件处理
    start() {
        GameGlobal.mainActor = this;
        this.getCoinPile();
        this.characterController = this.node.getComponent(CharacterController);
        this.anim = this.animNode?.getComponent(SkeletalAnimation);
        if (this.anim) {
            this.animEvent = this.animNode.getComponent(ActorAnimation);
        }
        this.changeActorState(StateDefine.Idle);
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
        this.animPlay(AnimDefine.Idle);
    }
    private onMoveState(deltaTime: number) {
        this.performMovement(deltaTime);
        this.updateRotation();
        this.animPlay(AnimDefine.Move);

    }
    private updateRotation() {
        let targetRotation = new Quat();
        Quat.fromViewUp(targetRotation, this.moveDir, Vec3.UP);
        this.node.setRotation(targetRotation);
    }

    private performMovement(deltaTime: number) {
        let speed = 5;
        let dir = new Vec3();
        Vec3.multiplyScalar(dir, this.moveDir, speed * deltaTime);
        this.characterController.move(dir);

        // GameGlobal.cameraControl.cameraFollow();
    }

    move(dir: Vec3) {
        this.moveDir = new Vec3(-dir.x, dir.z, dir.y);
        this.moveDir.normalize();
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

    animPlay(name: AnimDefine) {
        if (this.currAnim === name) {
            return;
        }
        this.currAnim = name;
        this.anim?.crossFade(name);
    }


    private enterState(state: StateDefine, oldState: StateDefine | string) {

    }


    private exitState(state: StateDefine | string) {

    }
}


