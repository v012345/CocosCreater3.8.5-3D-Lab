import { _decorator, Component, Enum, Node, Sprite, Tween, tween } from 'cc';
import { StickerType } from '../EnumDefine';
const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends Component {
    @property({
        type: Enum(StickerType),
        displayName: 'Sticker Type'
    })
    stickerType: StickerType = StickerType.Null;
    progressbarTween: Tween | null = null;
    start() {

    }
    setProgressBar(value: number) {
        const sp = this.node.getChildByPath("Main/Info/ProgressBar").getComponent(Sprite);
        this.progressbarTween?.stop();
        sp.fillRange = value;
    }
    startProgressBar(callBack: Function, useTime: number = 0.5) {
        const sp = this.node.getChildByPath("Main/Info/ProgressBar").getComponent(Sprite);
        this.progressbarTween?.stop();
        this.progressbarTween = tween(sp)
            .to(useTime, { fillRange: 1 })
            .call(() => {
                callBack();
            })
            .start();
    }

    update(deltaTime: number) {

    }
}


