import { _decorator, Component, Enum, Node } from 'cc';
import { ColliderType } from '../EnumDefine';
const { ccclass, property } = _decorator;

@ccclass('ColliderWithType')
export class ColliderWithType extends Component {
    @property({
        type: Enum(ColliderType),
        displayName: 'Collider Type'
    })
    ColliderType: ColliderType = ColliderType.Null;
    start() {

    }

    update(deltaTime: number) {

    }
}


