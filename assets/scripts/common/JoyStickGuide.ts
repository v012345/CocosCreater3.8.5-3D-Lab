import { _decorator, Component, game, Node } from 'cc';
import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('JoyStickGuide')
export class JoyStickGuide extends Component {

    /**圆点 */
    private Pole: Node = null;
    /**底板 */
    private Dish: Node = null;
    /**字 */
    private DRAG: Node = null;

    private _visible = false;
    private _nextTime = 100;
    protected start() {

        this.Pole = this.node.getChildByName("Pole");
        this.Dish = this.node.getChildByName("Dish");
        this.DRAG = this.node.getChildByName("DRAG");

        this.Pole.active = false;
        this.Dish.active = false;
        this.DRAG.active = false;
    }
    protected update(deltaTime: number) {
        if (GameGlobal.isFightPause || GameGlobal.isGuidePause) {
            if (this._visible) {
                this._visible = false;
                this.Pole.active = false;
                this.Dish.active = false;
                this.DRAG.active = false;
            }
        } else if (GameGlobal.joyStick.showFirstGuide) {
            if (!this._visible) {
                this._visible = true;
                this.Pole.active = true;
                this.Dish.active = true;
                this.DRAG.active = true;
            }
        } else if (GameGlobal.cameraMoving || GameGlobal.joyStick.isMoving || GameGlobal.joyStick.isPressing || !GameGlobal.joyStick.joyStickCanTouch || GameGlobal.isGameEnd || GameGlobal.isPlayEndScene) {
            this._nextTime = game.totalTime + 4000;
            if (this._visible) {
                this._visible = false;
                this.Pole.active = false;
                this.Dish.active = false;
                this.DRAG.active = false;
            }
        } else {
            if (game.totalTime >= this._nextTime) {
                if (!this._visible) {
                    this._visible = true;
                    this.Pole.active = true;
                    this.Dish.active = true;
                    this.DRAG.active = true;
                }
            }
        }
    }

}


