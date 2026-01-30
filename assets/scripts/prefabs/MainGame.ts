import { _decorator, Component, EventTouch, Input, Node, UITransform, Vec3 } from 'cc';
import { GameGlobal } from '../GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('MainGame')
export class MainGame extends Component {
    @property(Node)
    joyStick: Node;
    @property(Node)
    UILayer: Node;
    start() {
        this.UILayer.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.UILayer.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.UILayer.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.UILayer.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.joyStick.active = false;
    }

    public onTouchStart(event: EventTouch) {



        this.joyStick.active = true;
        let pos_touch = event.getUILocation();    // 触摸点坐标@UI世界坐标系
        let uiTransform = this.UILayer.getComponent(UITransform);
        let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(pos_touch.x, pos_touch.y, 0));
        this.joyStick.setPosition(pos_nodeSpace);
    }

    public onTouchMove(event: EventTouch) {


        this.joyStick.active = true;
        let pos_touch = event.getUILocation();    // 触摸点坐标@UI世界坐标系
        let uiTransform = this.joyStick.getComponent(UITransform);
        let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(pos_touch.x, pos_touch.y, 0));
        // 判断极限位置
        let len = pos_nodeSpace.length();   // 自身坐标系的坐标
        let uiTransform2 = this.joyStick.getChildByName("Dish").getComponent(UITransform);  // 活动范围
        let maxLen = uiTransform2.width * 0.4;
        let ratio = len / maxLen;
        if (ratio > 1) {
            pos_nodeSpace.divide(new Vec3(ratio, ratio, 1));
        }
        this.joyStick.getChildByName("Pole").setPosition(pos_nodeSpace);
        GameGlobal.mainActor.move(pos_nodeSpace.normalize());

    }

    public onTouchEnd(event: EventTouch) {

        this.joyStick.active = false;
        this.joyStick.getChildByName("Pole").setPosition(Vec3.ZERO);
        GameGlobal.mainActor.stopMove();

    }


    update(deltaTime: number) {

    }
}


