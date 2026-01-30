import { EventTarget } from "cc";

export class AnimationEvent<TCallback extends (...args: any[]) => any = () => void> {
    /** 订阅动画事件 */
    public subscribe(callback: TCallback, thisArg?: any) {
        this._eventTarget.on('', callback, thisArg);
    }

    /** 取消订阅动画事件 */
    public unsubscribe(callback: TCallback, thisArg?: any) {
        this._eventTarget.off('', callback, thisArg);
    }

    /** 触发动画事件 */
    public invoke(...args: Parameters<TCallback>) {
        this._eventTarget.emit('', ...args);
    }

    private _eventTarget = new EventTarget();
}