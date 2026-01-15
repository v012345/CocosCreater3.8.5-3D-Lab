import { _decorator, ccenum, Component, Vec3, Widget } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;


export enum UIAdjustType {
    横屏 = "横屏", 竖屏 = "竖屏",
    方块竖屏 = "方块竖屏",
    方块横屏 = "方块横屏"
}
ccenum(UIAdjustType)

export type UIAdjustConfig = {
    position: Vec3;
    scale: Vec3;

    //左
    isAlignLeft: boolean;
    isAbsoluteLeft: boolean;
    leftPx: number;
    leftPencent: number;

    //右
    isAlignRight: boolean;
    isAbsoluteRight: boolean;
    rightPx: number;
    rightPencent: number;

    //水平中
    isAlignHorizontalCenter: boolean;
    isAbsoluteHorizonalCenter: boolean;
    horizonalCenterPx: number;
    horizonalCenterPencent: number;

    //上
    isAlignTop: boolean;
    isAbsoluteTop: boolean;
    topPx: number;
    topPencent: number;
    //下
    isAlignBottom: boolean;
    isAbsoluteBottom: boolean;
    bottomPx: number;
    bottomPencent: number;
}
function createUIAdjustConfig() {
    let obj = <UIAdjustConfig>{};
    obj.position = new Vec3();
    obj.scale = new Vec3();
    return obj;
}

@ccclass('UIAdjust')
@executeInEditMode(true)
export class UIAdjust extends Component {
    @property({ type: UIAdjustType })
    type = UIAdjustType.横屏;

    @property
    saveAttr = "{}";

    private _widget: Widget;
    private _type: UIAdjustType
    private _saveAttrObj: { [key: string]: UIAdjustConfig } = {};
    private _isFirstUpdate = true;

    start() {

        this._saveAttrObj = JSON.parse(this.saveAttr);

        this._widget = this.getComponent(Widget);
        this._type = this.type;
        this.updateView();
    }
    // resetInEditor(): void {
    //     if (EDITOR) {
    //         //第一次添加读取属性
    //         for (let type = UIAdjustType.BEGIN + 1; type < UIAdjustType.MAX; type++) {

    //             for (let i = 0; i < this.confs.length; i++) {
    //                 if (this.confs[i].type == type) {
    //                     this.node2conf(this.confs[i]);
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }

    private updateView() {
        this.conf2node();
    }
    private saveConf() {
        this.saveAttr = JSON.stringify(this._saveAttrObj);
    }
    node2conf(conf?: UIAdjustConfig) {
        if (!conf) {
            conf = this.getCurConf();
        }
        if (!conf) {
            this._saveAttrObj[this._type] = conf = createUIAdjustConfig();
        }
        this.node.getPosition(conf.position);
        this.node.getScale(conf.scale);
        if (!this._widget) {
            this.saveConf();
            return;
        }
        let isAlign = this._widget.isAlignTop;
        conf.isAlignTop = isAlign;
        let isAbsolute = this._widget.isAbsoluteTop;
        conf.isAbsoluteTop = isAbsolute;
        if (isAlign) {
            if (isAbsolute) {
                conf.topPx = this._widget.top;
            } else {
                conf.topPencent = this._widget.top;
            }
        }

        isAlign = this._widget.isAlignLeft;
        conf.isAlignLeft = isAlign;
        isAbsolute = this._widget.isAbsoluteLeft;
        conf.isAbsoluteLeft = isAbsolute;
        if (isAlign) {
            if (isAbsolute) {
                conf.leftPx = this._widget.left;
            } else {
                conf.leftPencent = this._widget.left;
            }
        }

        isAlign = this._widget.isAlignBottom;
        conf.isAlignBottom = isAlign;
        isAbsolute = this._widget.isAbsoluteBottom;
        conf.isAbsoluteBottom = isAbsolute;
        if (isAlign) {
            if (isAbsolute) {
                conf.bottomPx = this._widget.bottom;
            } else {
                conf.bottomPencent = this._widget.bottom;
            }
        }
        isAlign = this._widget.isAlignRight;
        conf.isAlignRight = isAlign;
        isAbsolute = this._widget.isAbsoluteRight;
        conf.isAbsoluteRight = isAbsolute;
        if (isAlign) {
            if (isAbsolute) {
                conf.rightPx = this._widget.right;
            } else {
                conf.rightPencent = this._widget.right;
            }
        }

        isAlign = this._widget.isAlignHorizontalCenter;
        conf.isAlignHorizontalCenter = isAlign;

        isAbsolute = this._widget.isAbsoluteHorizontalCenter;
        conf.isAbsoluteHorizonalCenter = isAbsolute;

        if (isAlign) {
            if (isAbsolute) {
                conf.horizonalCenterPx = this._widget.horizontalCenter;
            } else {
                conf.horizonalCenterPencent = this._widget.horizontalCenter;
            }
        }
        this.saveConf();
    }
    conf2node() {
        let curConf = this.getCurConf();
        if (!curConf) {
            // console.log(this.node.getPathInHierarchy() + " conf2node curConf", curConf);
            return;
        }
        this.node.setPosition(curConf.position);
        this.node.setScale(curConf.scale);
        if (!this._widget) {
            // console.log(this.node.getPathInHierarchy() + " conf2node widget", this.widget);
            return;
        }
        this._widget.isAlignTop = curConf.isAlignTop;
        this._widget.isAbsoluteTop = curConf.isAbsoluteTop;
        if (curConf.isAlignTop) {
            if (curConf.isAbsoluteTop) {
                this._widget.top = curConf.topPx;
            } else {
                this._widget.top = curConf.topPencent;
            }
        }

        this._widget.isAlignRight = curConf.isAlignRight;
        this._widget.isAbsoluteRight = curConf.isAbsoluteRight;
        if (curConf.isAlignRight) {
            if (curConf.isAbsoluteRight) {
                this._widget.right = curConf.rightPx;
            } else {
                this._widget.right = curConf.rightPencent;
            }
        }

        this._widget.isAlignBottom = curConf.isAlignBottom;
        this._widget.isAbsoluteBottom = curConf.isAbsoluteBottom;
        if (curConf.isAlignBottom) {
            if (curConf.isAbsoluteBottom) {
                this._widget.bottom = curConf.bottomPx;
            } else {
                this._widget.bottom = curConf.bottomPencent;
            }
        }

        this._widget.isAlignLeft = curConf.isAlignLeft;
        this._widget.isAbsoluteLeft = curConf.isAbsoluteLeft;
        if (curConf.isAlignLeft) {
            if (curConf.isAbsoluteLeft) {
                this._widget.left = curConf.leftPx;
            } else {
                this._widget.left = curConf.leftPencent;
            }
        }

        this._widget.isAlignHorizontalCenter = curConf.isAlignHorizontalCenter;
        this._widget.isAbsoluteHorizontalCenter = curConf.isAbsoluteHorizonalCenter;

        if (curConf.isAlignHorizontalCenter) {
            if (curConf.isAbsoluteHorizonalCenter) {
                this._widget.horizontalCenter = curConf.horizonalCenterPx;
            } else {
                this._widget.horizontalCenter = curConf.horizonalCenterPencent;
            }
        }
    }
    getCurConf() {
        return this._saveAttrObj[this._type];
    }
    update(deltaTime: number) {
        this.updateImpl();
    }
    updateImpl() {
        if (EDITOR) {
            //编辑器模式下自动检测组件
            this._widget = this.getComponent(Widget);
        }
        if (this._type != this.type || this._isFirstUpdate) {
            this._isFirstUpdate = false;
            this._type = this.type;
            this.conf2node();
            // console.log(" conf2node:", this.node.getPathInHierarchy());
            if (EDITOR) {
                //编辑器下自动修改子节点类型
                let comps = this.node.getComponentsInChildren(UIAdjust);
                for (let i = 0; i < comps.length; i++) {
                    comps[i].type = this.type;
                }
            }
            return;
        }
        if (EDITOR) {
            //编辑器模式同步属性
            this.node2conf();
        }
    }
}


