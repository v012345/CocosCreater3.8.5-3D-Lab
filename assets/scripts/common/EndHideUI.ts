import { _decorator, Component, Node, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EndHideUI')
export class EndHideUI extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    play() {
        let opacity = this.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.addComponent(UIOpacity);
        }
        tween(opacity).to(0.2, { opacity: 0 }).start();
    }
}


