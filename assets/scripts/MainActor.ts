import { _decorator, CharacterController, Collider, Component, instantiate, ITriggerEvent, Node, Prefab, Quat, SkeletalAnimation, tween, Vec3 } from 'cc';
import { Bag } from './tools/Bag';
import { GameGlobal } from './GameGlobal';
import { AnimDefine, ColliderTypeEnum, StateDefine } from './EnumDefine';
import { ActorAnimation } from './Anim/ActorAnimation';
import { ColliderType } from './components/ColliderType';
import { Sticker } from './prefabs/Sticker';
import { Utils } from './tools/Utils';
const { ccclass, property } = _decorator;

@ccclass('MainActor')
export class MainActor extends Component {
    @property(Collider)
    collider: Collider;
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
    @property(Node)
    griffinAnimNode: Node;
    riderAnim: SkeletalAnimation | null = null;
    griffinAnim: SkeletalAnimation | null = null;
    animEvent: ActorAnimation | null = null;  // 动画事件处理
    isMounted: boolean = false; // 是否骑乘状态
    start() {
        GameGlobal.mainActor = this;
        this.getCoinPile();
        this.characterController = this.node.getComponent(CharacterController);
        this.riderAnim = this.animNode?.getComponent(SkeletalAnimation);
        if (this.riderAnim) {
            this.animEvent = this.animNode.getComponent(ActorAnimation);
        }
        this.griffinAnim = this.griffinAnimNode?.getComponent(SkeletalAnimation);
        this.changeActorState(StateDefine.Idle);
        this.griffinAnim.crossFade(AnimDefine.Idle);
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.on('onTriggerStay', this.onTriggerStay, this);
        this.collider.on('onTriggerExit', this.onTriggerExit, this);
    }
    onTriggerEnter(event: ITriggerEvent) {
        let colliderType = event.otherCollider.node.getComponent(ColliderType);
        if (!colliderType) {
            return;
        }
        if (colliderType.colliderType == ColliderTypeEnum.Mount) {
            if (!this.isMounted) this.onStartRideLion(event.otherCollider.node);
        }
        // console.log("触发碰撞", colliderType.colliderType);
    }
    rideGriffin() {
        this.isMounted = true;
        let oWorldPos = this.griffinAnimNode.worldPosition.clone()
        this.griffinAnimNode.setParent(this.node);
        this.griffinAnimNode.worldPosition = oWorldPos;
    }
    private onStartRideLion(stickerNode?: Node) {
        let sticker = stickerNode?.getComponent(Sticker);
        sticker.startProgressBar(() => {



            const wro = this.griffinAnimNode.eulerAngles.clone();
            let startPos = this.node.worldPosition.clone();
            let targetPos = this.griffinAnimNode.worldPosition.clone().add(new Vec3(0, 1, 0));
            let offsetPos = new Vec3(0, 5, 0);
            let controlPos = Utils.calcControlPos(startPos, targetPos, offsetPos);
            Utils.nodeMoving(this.node, startPos, controlPos, targetPos, 0.5, 0, () => {
                this.riderAnim.crossFade(AnimDefine.RideIdle);
                this.griffinAnim.crossFade(AnimDefine.Idle);
                this.rideGriffin();
            });
            tween(this.node)
                .to(0.3, { eulerAngles: wro })
                .call(() => {

                })
                .start();



        }, 0.5);
        // const sp = this.rideDiTie.getChildByPath("diTieLayer/info/fill").getComponent(Sprite);
        // this.rideDiTieTween?.stop();
        // this.rideDiTieTween = tween(sp)
        //     .to(0.5, { fillRange: 1 })
        //     .call(() => {
        //         this.onRideLion();
        //     })
        //     .start();
    }

    onTriggerStay(event: ITriggerEvent) {
        // console.log("持续碰撞", event);
    }
    onTriggerExit(event: ITriggerEvent) {
        let colliderType = event.otherCollider.node.getComponent(ColliderType);
        if (!colliderType) {
            return;
        }
        if (colliderType.colliderType == ColliderTypeEnum.Mount) {
            event.otherCollider.node.getComponent(Sticker).setProgressBar(0);
        }
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
        // this.riderAnimPlay(AnimDefine.Idle);
        if (this.isMounted) {
            this.riderAnimPlay(AnimDefine.MountIdle);
        } else {
            this.riderAnimPlay(AnimDefine.Idle);
        }
    }
    private onMoveState(deltaTime: number) {
        this.performMovement(deltaTime);
        this.updateRotation();
        if (this.isMounted) {
            this.riderAnimPlay(AnimDefine.MountMove);
        } else {
            this.riderAnimPlay(AnimDefine.Move);
        }

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

    riderAnimPlay(name: AnimDefine) {
        if (this.currAnim === name) {
            return;
        }
        this.currAnim = name;
        this.riderAnim?.crossFade(name);
    }


    private enterState(state: StateDefine, oldState: StateDefine | string) {

    }


    private exitState(state: StateDefine | string) {

    }
}


