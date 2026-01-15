import { _decorator, Component, Enum, Node } from 'cc';
import { PlatForm, PlayableSDK } from './PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('PlatFormHide')
export class PlatFormHide extends Component {

    @property({ type: Enum(PlatForm), displayName: "需要特殊处理的渠道" })
    platForm: PlatForm = PlatForm.Google;

    @property({ type: [Node], displayName: "需要特殊处理的渠道下隐藏的节点" })
    hideNodes: Node[] = [];

    start() {
        if (this.platForm == PlayableSDK.platform) {
            this.hideNodes.forEach(node => {
                node.active = false;
            })
            this.node.active = false;
        }
    }
}


