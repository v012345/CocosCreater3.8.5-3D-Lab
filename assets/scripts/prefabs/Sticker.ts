import { _decorator, Component, Enum, Node } from 'cc';
import { StickerType } from '../EnumDefine';
const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends Component {
    @property({
        type: Enum(StickerType),
        displayName: 'Sticker Type'
    })
    StickerType: StickerType = StickerType.Null;
    start() {

    }

    update(deltaTime: number) {

    }
}


