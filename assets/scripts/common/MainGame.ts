import { _decorator, Button, Camera, Component, EventTouch, input, Input, Node, ResolutionPolicy, screen, tween, UIOpacity, view, Animation } from 'cc';
import { DEBUG } from 'cc/env';
import { AudioManager } from './AudioManager';
import { EndHideUI } from './EndHideUI';
import { GameGlobal } from './GameGlobal';
import { Language } from './Language';
import { PlatForm, PlayableSDK } from './PlayableSDK';
import { UIAdjust, UIAdjustType } from './UIAdjust';
import { v3 } from 'cc';
import { ParticleSystem } from 'cc';
import { Utils } from './Utils';
import { AudioCDWrapper } from './AudioCDWrapper';
import { DiTieNames, RoomNames } from '../Def';
import { game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainGame')
export class MainGame extends Component {
    @property(Node)
    logo: Node;
    @property(Camera)
    mainCamera: Camera;
    @property(Camera)
    uiCamera: Camera;
    @property(Node)
    playNowBtn: Node;
    @property(Node)
    TipRoot: Node;
    @property(Node)
    ageNode: Node;
    @property(Node)
    yiJiNode: Node;
    @property(Node)
    erJiNode: Node;
    @property(Node)
    erJiParNode: Node;
    @property(Node)
    warningBlink: Node;
    @property(Node)
    redScreen: Node;
    @property(Node)
    fullNode: Node;

    onLoad() {
        GameGlobal.mainGame = this;
        GameGlobal.mainCamera = this.mainCamera;
        this.warningBlink.active = false;
        this.redScreen.active = false;
        this.fullNode.active = this.isShowFulled;

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        // this.scheduleOnce(() => {
        //     let comps = director.getScene().getComponentsInChildren(MeshRenderer);
        //     comps.forEach(v => {
        //         if (v.shadowCastingMode == MeshRenderer.ShadowCastingMode.OFF) {
        //             console.warn(v.node.getPathInHierarchy());
        //         }
        //     })
        // }, 5);
    }
    private autoHideFullTime = -1;
    private isShowFulled = false;
    showFull() {
        this.autoHideFullTime = game.totalTime + 500;
        if (this.isShowFulled) {
            return;
        }
        this.isShowFulled = true;
        this.fullNode.active = true;
    }
    hideFull() {
        if (!this.isShowFulled) {
            return;
        }
        this.autoHideFullTime = -1;
        this.isShowFulled = false;
        this.fullNode.active = false;
    }
    protected update(dt: number): void {
        if (this.autoHideFullTime == -1) {
            return;
        }
        if (game.totalTime >= this.autoHideFullTime) {
            this.autoHideFullTime = -1;
            this.hideFull();
        }
    }
    start() {
        view.on("canvas-resize", this.resize, this);
        this.scheduleOnce(this.resize);

        this.playNowBtn.on(Button.EventType.CLICK, this.onPlayNowBtnTap, this);

        if (this.playNowBtn) {
            switch (PlayableSDK.platform) {
                case PlatForm.Google:
                case PlatForm.Wechat:
                    // this.playNowBtn.active = false;
                    break;
            }
        }
        this.ageNode.active = Language.getLanguageCode() == "ru";
        Promise.all([
            Language.initASync(null),
        ]).then(() => {
            this.scheduleOnce(() => {
                GameGlobal.isGameStart = true;
                GameGlobal.crowd.isGameStart = true;
                // GameGlobal.enmey.isGameStart = true;
                GameGlobal.queuebuyer.isGameStart = true;
                GameGlobal.fight.startRun();
                GameGlobal.guide.startRun();
                this.scheduleOnce(() => {
                    this.erJiNode.active = this.erJiParNode.active = false;
                    this.yiJiNode.active = true;
                    //@ts-ignore
                    if (window.setLoadingProgress) {
                        //@ts-ignore
                        window.setLoadingProgress(100);
                    }
                    // GameGlobal.guide.startRun();
                })
            });
        })
        // PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.WIRE_FRAME;
    }
    playRedScreen() {
        AudioCDWrapper.soundPlay("jingbao");
        this.redScreen.active = true;
        let uiOpacity = this.redScreen.getComponent(UIOpacity);
        uiOpacity.opacity = 0;
        tween(uiOpacity).to(0.3, { opacity: 255 }).start();
        this.redScreen.getComponentsInChildren(Animation).forEach(v => v.play());
    }
    stopRedScreen() {
        let uiOpacity = this.redScreen.getComponent(UIOpacity);
        tween(uiOpacity)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.redScreen.active = false;
            })
            .start();
    }
    playWarming() {
        AudioCDWrapper.soundPlay("jingbao");
        this.warningBlink.active = true;
        let uiOpacity = this.warningBlink.getComponent(UIOpacity);
        uiOpacity.opacity = 0;
        tween(uiOpacity).to(0.3, { opacity: 255 }).start();
        this.warningBlink.getComponentsInChildren(Animation).forEach(v => v.play());
    }
    stopWraming() {
        let uiOpacity = this.warningBlink.getComponent(UIOpacity);
        tween(uiOpacity)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.warningBlink.active = false;
            })
            .start();
    }
    resize(e?) {
        if (screen.windowSize.height > screen.windowSize.width) {
            let ratio = screen.windowSize.height / screen.windowSize.width;
            let isRect = ratio >= 1 && ratio <= 1.77;
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);

            GameGlobal.viewScale = screen.windowSize.width / view.getDesignResolutionSize().width;
            GameGlobal.realHeight = screen.windowSize.height / GameGlobal.viewScale;
            GameGlobal.realWidth = view.getDesignResolutionSize().width;
            console.log('resize 竖屏', GameGlobal.viewScale, GameGlobal.realWidth, GameGlobal.realHeight, screen.windowSize.width, screen.windowSize.height, ratio);

            GameGlobal.isShu = true;

            this.node.getComponentsInChildren(UIAdjust).forEach(v => {
                if (isRect) {
                    v.type = UIAdjustType.方块竖屏;
                } else {
                    v.type = UIAdjustType.竖屏;
                }
                v.updateImpl();
            })

        } else {
            let ratio = screen.windowSize.width / screen.windowSize.height;
            let isRect = ratio >= 1 && ratio <= 1.77;
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);

            GameGlobal.viewScale = screen.windowSize.height / view.getDesignResolutionSize().height;
            GameGlobal.realHeight = view.getDesignResolutionSize().height;
            GameGlobal.realWidth = screen.windowSize.width / GameGlobal.viewScale;
            console.log('resize 横屏', GameGlobal.viewScale, GameGlobal.realWidth, GameGlobal.realHeight, screen.windowSize.width, screen.windowSize.height, ratio);
            GameGlobal.isShu = false;

            this.node.getComponentsInChildren(UIAdjust).forEach(v => {
                if (isRect) {
                    v.type = UIAdjustType.方块横屏;
                } else {
                    v.type = UIAdjustType.横屏;
                }
                v.updateImpl();
            })
        }
        GameGlobal.cameraControl.cameraOnLoad();
    }

    isFirst: boolean = true;
    onTouchStart(event: EventTouch) {

        if (this.isFirst) {
            if (!DEBUG) {
                AudioManager.musicPlay("bgm", true);
            }
            this.isFirst = false;
        }
    }

    onPlayNowBtnTap() {
        if (DEBUG) {
            this.onEnd();
            // if (GameGlobal.crowd.curRoom == GameGlobal.room.rooms[RoomNames.ROOM1]) {
            //     GameGlobal.diTie.dities[DiTieNames.ROOM2].funcCall();
            // } else if (GameGlobal.crowd.curRoom == GameGlobal.room.rooms[RoomNames.ROOM2]) {
            //     GameGlobal.diTie.dities[DiTieNames.ROOM3].funcCall();
            // }
        } else {
            console.log("onPlayNowBtnTap");
            this.jump();
            this.onEnd();
        }
    }


    isVerB() {
        if (DEBUG) {
            return true
        }
        return PlayableSDK.getGameConfs("IsVerB") == "1";
    }

    jump() {
        console.log("通关跳转商店");
        PlayableSDK.download();
    }
    hideUI() {
        this.node.getComponentsInChildren(EndHideUI).forEach(v => {
            let opacity = v.getComponent(UIOpacity);
            if (!opacity) {
                opacity = v.addComponent(UIOpacity);
            }
            tween(opacity).to(0.2, { opacity: 0 }).start();
        })
    }
    onEnd() {
        if (GameGlobal.isGameEnd) {
            return;
        }
        AudioCDWrapper.soundPlay("shengji", 0.1);
        AudioCDWrapper.soundPlay("jianzhushengji", 0.1);
        GameGlobal.cameraControl.cameraShock();
        GameGlobal.isGameEnd = true;

        GameGlobal.queuebuyer.onEnd();
        AudioManager.musicStop();
        this.hideUI();
        GameGlobal.actor.onEnd();
        GameGlobal.enmey.onEnd();
        GameGlobal.wall.onEnd();
        GameGlobal.turret.onEnd();

        GameGlobal.cameraControl.toEndCamera(() => {
            tween(this.yiJiNode)
                .to(0.2, { position: v3(0, -3, 0) })
                .start();

            this.erJiNode.active = this.erJiParNode.active = true;
            Utils.jellyEffectY(this.erJiNode, 1, () => {
                this.scheduleOnce(() => {
                    GameGlobal.endCard.showWin();
                }, 1);
            });
            this.erJiParNode.getComponentsInChildren(ParticleSystem).forEach(v => v.play());
        });
    }
}