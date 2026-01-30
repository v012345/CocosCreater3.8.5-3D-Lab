import { _decorator, Component, Enum, Node } from 'cc';
import { ColliderTypeEnum, StickerType } from '../EnumDefine';
const { ccclass, property } = _decorator;

@ccclass('ColliderType')
export class ColliderType extends Component {
    @property({
        type: Enum(ColliderTypeEnum),
        displayName: 'Collider Type'
    })
    colliderType: ColliderTypeEnum = ColliderTypeEnum.Null;
}


