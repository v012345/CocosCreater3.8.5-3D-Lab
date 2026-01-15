import { _decorator, ccenum, CCFloat, Component, Vec3 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

const UPDATE_INTERVAL = 0.2;
const P1_OFFSET = new Vec3();

export enum BagSortDir {
    X = "X", Y = "Y", Z = "Z"
}
ccenum(BagSortDir)


@ccclass('BagSort')
@executeInEditMode(true)
export class BagSort extends Component {
    @property({ type: BagSortDir })
    dir: BagSortDir = BagSortDir.Z;
    @property
    reverse = false;
    @property
    offset = new Vec3();
    @property({ type: [CCFloat] })
    widths: number[] = [];
    start() {
    }
    private _lastUpdateTime = 0;
    update(deltaTime: number) {
        this._lastUpdateTime += deltaTime;
        if (this._lastUpdateTime >= UPDATE_INTERVAL) {
            this._lastUpdateTime -= UPDATE_INTERVAL;
        } else {
            return;
        }

        P1_OFFSET.set(this.offset);

        let childs = this.node.children;
        for (let i = 0, l = this.widths.length; i < l; i++) {
            const bag = childs[i];
            if (bag == null) break;
            if (bag.children.length == 0) continue;

            const HALF_OFFSET = (this.reverse ? -this.widths[i] : this.widths[i]) / 2;

            if (this.dir == BagSortDir.X) {
                P1_OFFSET.x += HALF_OFFSET;
            } else {
                P1_OFFSET.x = bag.position.x;
            }
            if (this.dir == BagSortDir.Y) {
                P1_OFFSET.y += HALF_OFFSET;
            } else {
                P1_OFFSET.y = bag.position.y;
            }
            if (this.dir == BagSortDir.Z) {
                P1_OFFSET.z -= HALF_OFFSET;
            } else {
                P1_OFFSET.z = bag.position.z;
            }
            bag.setPosition(P1_OFFSET);

            if (this.dir == BagSortDir.X) {
                P1_OFFSET.x += HALF_OFFSET;
            }
            if (this.dir == BagSortDir.Y) {
                P1_OFFSET.y += HALF_OFFSET;
            }
            if (this.dir == BagSortDir.Z) {
                P1_OFFSET.z -= HALF_OFFSET;
            }
        }
    }
}


