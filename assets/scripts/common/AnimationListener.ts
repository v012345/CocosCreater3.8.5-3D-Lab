import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

declare module "cc" {
    interface SkeletalAnimation {
        /**
         * 事件派发器
        */
        $dispatcher: AnimationListener;
        /**
         * 动画轴里派发事件
         */
        event(param: string): void;
    }
}
if (!SkeletalAnimation.prototype.event) {
    SkeletalAnimation.prototype.event = function (this: SkeletalAnimation, param: string) {
        this.$dispatcher?.onEvent(this, param);
    }
}

@ccclass('AnimationListener')
export class AnimationListener extends Component {
    @property({ type: Component, displayName: "实现IAnimationTarget的事件接受对象", tooltip: "实现IAnimationTarget的事件接受对象" })
    targetAvatar: IAnimationTarget & Component;

    protected onLoad(): void {
        let anis = this.getComponentsInChildren(SkeletalAnimation);
        anis.forEach(v => {
            v.$dispatcher = this;
        })
    }
    onEvent(ani: SkeletalAnimation, param: string) {
        if (this.targetAvatar) {
            if (this.targetAvatar.onAniEvent) {
                this.targetAvatar.onAniEvent(ani, param);
            } else {
                console.warn(this.targetAvatar.node.getPathInHierarchy() + " should implement IAnimationTarget");
            }
        }
    }
}

export interface IAnimationTarget {
    onAniEvent(ani: SkeletalAnimation, param: string): void;
}
