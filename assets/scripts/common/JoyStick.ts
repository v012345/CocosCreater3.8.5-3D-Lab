import { _decorator, ccenum, CCFloat, Component, EventTouch, Input, input, math, Node, UITransform, v3, Vec3 } from 'cc';
import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

enum JoyStickType {
    TYPE_2D,
    TYPE_3D,
}
ccenum(JoyStickType);

@ccclass('JoyStick')
export class JoyStick extends Component {
    /**底板 */
    @property(Node)
    Dish: Node;
    /**圆点 */
    @property(Node)
    Pole: Node;

    @property({ type: JoyStickType })
    Type: JoyStickType = JoyStickType.TYPE_2D;

    @property({
        type: CCFloat, visible: function () {
            return this.Type
        }
    })
    RotateDegAxisY = 0;
    /**是否进入移动状态*/
    isMoving = false;
    /**是否按下*/
    isPressing = false;
    /**移动方向*/
    moveDir = new Vec3();
    /**摇杆是否可操作 update里会自动更新*/
    joyStickCanTouch = true;

    showFirstGuide = true;
    private tempMoveDir = new Vec3();

    protected onLoad(): void {
        GameGlobal.joyStick = this;
        this.Pole.active = false;
        this.Dish.active = false;
    }
    protected start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected update() {
        if (!GameGlobal.isGameEnd && GameGlobal.isGameStart && !GameGlobal.isPlayEndScene) {
            this.joyStickCanTouch = true;
        } else {
            this.joyStickCanTouch = false;
        }
    }
    private onTouchStart(event: EventTouch) {
        if (!this.joyStickCanTouch) {
            this.onTouchEnd();
            return;
        }
        this.Pole.active = true;
        this.Dish.active = true;
        let touchPos = event.getUILocation();
        let uiTransform = GameGlobal.mainGame.getComponent(UITransform);
        let nodePos = uiTransform.convertToNodeSpaceAR(touchPos.toVec3());
        this.node.setPosition(nodePos);
        this.isPressing = true;
        this.showFirstGuide = false;
    }

    private onTouchMove(event: EventTouch) {
        if (!this.joyStickCanTouch) {
            this.onTouchEnd();
            return;
        }
        this.Pole.active = true;
        this.Dish.active = true;

        let touchPos = event.getUILocation();
        let nodeTransform = this.node.getComponent(UITransform);
        let nodePos = nodeTransform.convertToNodeSpaceAR(touchPos.toVec3());
        let dishTransform = this.Dish.getComponent(UITransform);  // 活动范围
        let len = nodePos.length();
        let maxLen = dishTransform.width * 0.3;
        let radio = len / maxLen;
        if (radio > 1) {
            nodePos.divide(v3(radio, radio, 1));
        }
        this.Pole.setPosition(nodePos);
        this.moveDir = nodePos.normalize();
        if (this.Type == JoyStickType.TYPE_3D) { //3d需要转换坐标 并且支持旋转Y轴
            this.tempMoveDir.set(this.moveDir.x, this.moveDir.z, -this.moveDir.y);
            Vec3.rotateY(this.moveDir, this.tempMoveDir, Vec3.ZERO, math.toRadian(this.RotateDegAxisY));
        }
        this.isMoving = true;
        this.isPressing = true;
    }

    private onTouchEnd() {
        this.isMoving = false;
        this.isPressing = false;
        Vec3.zero(this.moveDir);
        this.Pole.setPosition(Vec3.ZERO);
        this.Pole.active = false;
        this.Dish.active = false;
    }

}


