import { Sprite, Vec3, tween, v3, Node, screen, Layers, MobilityMode, UITransform, resources, SpriteFrame, Texture2D, ImageAsset, UIOpacity, RenderTexture, gfx, Camera, Pool, ParticleSystem, Animation } from "cc";
import { GameGlobal } from "../GameGlobal";
const pv3 = new Pool<Vec3>(() => v3(), 5);

export class Utils {
    public static getUIPos(node3d: Node, nodeUi: Node): Vec3 {
        return GameGlobal.mainCamera3D.convertToUINode(node3d.getWorldPosition(), nodeUi);
    }

    public static randomRange(min, max) {
        let d = max - min;
        return min + Math.random() * d;
    }

    public static randomPos(pos, rang) {
        let x = pos.x - rang / 2 + Math.random() * rang;
        let y = pos.y - rang / 2 + Math.random() * rang;
        return new Vec3(x, y, 0);
    }

    public static createSprite(path) {
        let node = new Node();
        node.layer = Layers.Enum.UI_2D;
        node.mobility = MobilityMode.Static;
        let t = node.addComponent(UITransform);
        let sp: Sprite = node.addComponent(Sprite);
        sp.sizeMode = Sprite.SizeMode.TRIMMED;
        sp.type = Sprite.Type.SIMPLE;
        sp.trim = true;
        // Utils.setSpriteFrame(node, path);
        let img = resources.get(path + '/spriteFrame', SpriteFrame);
        if (img) {
            sp.spriteFrame = img;
        }
        return node;
    }

    public static setSpriteFrame(node, path, callback?) {
        let sp = node.getComponent(Sprite);
        let img = resources.get(path);
        if (img) {
            if (img instanceof SpriteFrame) {
                sp.spriteFrame = img;
                callback && callback();
            } else if (img instanceof ImageAsset) {
                const tex = new Texture2D();
                tex.image = img;
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = tex;
                sp.spriteFrame = spriteFrame;
            }
        } else {
            resources.load(path, SpriteFrame, (err, res) => {
                sp.spriteFrame = res;
                callback && callback();
            });
        }
    }

    /** 贝塞尔曲线移动节点 
     * @param node 节点
     * @param from 起点
     * @param middlePos 中间点
     * @param to 终点
     * @param tweenDuration 动画时长
     * @param delay 延迟时间
     * @param callback 回调
     */
    public static nodeMoving(node: Node, from: Vec3, middlePos: Vec3, to: Vec3, tweenDuration: number, delay: number, callback?) {
        //计算贝塞尔曲线坐标函数
        let twoBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            let z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
            return new Vec3(x, y, z);
        };
        tween(node.worldPosition)
            .delay(delay)
            .to(tweenDuration, to, {
                onUpdate: (target: Vec3, ratio: number) => {
                    node.worldPosition = twoBezier(ratio, from, middlePos, to);
                },
                onComplete: (target) => {
                    callback && callback();
                }
            })
            .start();
    }


    /** 果冻效果
     * @param node 节点
     * @param s 缩放比例
     * @param callback 回调
     */
    public static jellyEffect(node: Node, s, callback?) {
        node.setScale(Vec3.ZERO);
        tween(node)
            .to(0.15, { scale: v3(1 * s, 1 * s, 1 * s) })
            .to(.06, { scale: v3(1.4 * s, 0.53 * s, 1.4 * s) })
            .to(.12, { scale: v3(0.8 * s, 1.2 * s, 0.8 * s) })
            .to(.07, { scale: v3(1.2 * s, 0.7 * s, 1.2 * s) })
            .to(.07, { scale: v3(0.85 * s, 1.1 * s, 0.85 * s) })
            .to(.07, { scale: v3(1 * s, 1 * s, 1 * s) })
            .call(() => {
                callback && callback();
            })
            .start();
    }

    /** 果冻效果2(z轴不变)
     * @param node 节点
     * @param s 缩放比例
     * @param callback 回调
     */
    public static jellyEffect2(node: Node, s, callback?) {
        node.setScale(Vec3.ZERO);

        tween(node)
            .to(0.15, { scale: v3(1 * s, 1 * s, 1 * s) })
            .to(.06, { scale: v3(1.4 * s, 0.53 * s, 1 * s) })
            .to(.12, { scale: v3(0.8 * s, 1.2 * s, 1 * s) })
            .to(.07, { scale: v3(1.2 * s, 0.7 * s, 1 * s) })
            .to(.07, { scale: v3(.85 * s, 1.1 * s, 1 * s) })
            .to(.07, { scale: v3(1 * s, 1 * s, 1 * s) })
            .call(() => {
                callback && callback();
            })
            .start();
    }

    /** 果冻效果3(x,z轴不变)
     * @param node 节点
     * @param s 缩放比例
     * @param callback 回调
     */
    public static jellyEffect3(node: Node, s, callback?) {
        node.setScale(Vec3.ZERO);

        tween(node)
            .to(0.15, { scale: v3(1 * s, 1 * s, 1 * s) })
            .to(.06, { scale: v3(1 * s, 0.73 * s, 1 * s) })
            .to(.12, { scale: v3(1 * s, 1.2 * s, 1 * s) })
            // .to(.07, { scale: v3(1 * s, 0.7 * s, 1 * s) })
            // .to(.07, { scale: v3(1 * s, 1.1 * s, 1 * s) })
            .to(.07, { scale: v3(1 * s, 1 * s, 1 * s) })
            .call(() => {
                callback && callback();
            })
            .start();
    }


    /** Q弹效果 */
    public static qTanEffect(node: Node, t, callback?) {
        tween(node)
            .to(.03, { scale: v3(1.1 * t, 0.83 * t, 1.1 * t) })
            .to(.03, { scale: v3(1.2 * t, 1.2 * t, 1.2 * t) })
            .to(.03, { scale: v3(1 * t, 1 * t, 1 * t) })
            .call(() => {
                callback && callback();
            })
            .start();
    }

    /** 呼吸效果 */
    public static breathEffect(node: Node) {
        tween(node).repeatForever(
            tween(node)
                .by(0.8, { scale: v3(0.05, 0.05, 0) }, { easing: 'quadInOut' })
                .by(0.8, { scale: v3(-0.05, -0.05, 0) }, { easing: 'quadInOut' })
        ).start();
    }

    public static breathLight(node: Node) {
        let op = node.getComponent(UIOpacity);
        op.opacity = 0;
        node.active = true;
        tween(op).repeatForever(
            tween(op)
                .to(0.25, { opacity: 255 }, { easing: 'quadInOut' })
                .to(0.25, { opacity: 0 }, { easing: 'quadInOut' })
                .to(0.35, { opacity: 255 }, { easing: 'quadInOut' })
                .to(0.35, { opacity: 0 }, { easing: 'quadInOut' })
            // .delay(0.5)
        ).start();
    }

    // 脉动
    public static pulsationEffect(node: Node) {
        tween(node).repeatForever(
            tween(node)
                .by(0.25, { scale: v3(0.05, 0.05, 0) }, { easing: 'sineOut' })
                .by(0.25, { scale: v3(-0.05, -0.05, 0) }, { easing: 'sineOut' })
                .by(0.35, { scale: v3(0.14, 0.14, 0) }, { easing: 'sineOut' })
                .by(0.35, { scale: v3(-0.14, -0.14, 0) }, { easing: 'sineIn' })
                .delay(0.5)
        ).start();
    }

    public static floatEffect(node: Node, delay, delayCall) {
        tween(node)
            .delay(delay)
            .call(() => { delayCall && delayCall() })
            .by(0.2, { position: v3(0, 10, 0) }, { easing: 'quadOut' })
            .by(0.2, { position: v3(0, -10, 0) }, { easing: 'quadIn' })
            .start();
    }

    public static buildingAppear(node: Node, delay, callBack?) {
        let sc = node.getScale().clone();
        node.setScale(0, 0);
        tween(node)
            .delay(delay)
            .to(0.15, { scale: v3(1.3 * sc.x, 1.3 * sc.y, 1) }, { easing: 'sineInOut' })
            .to(0.1, { scale: v3(1 * sc.x, 1 * sc.y, 1) }, { easing: 'sineOutIn' })
            .call(() => { callBack && callBack() })
            .start();
    }

    public static delayCall(node, delay, callBack) {
        tween(node)
            .delay(delay)
            .call(() => { callBack && callBack() })
            .start();
    }

    /**
     * 获取指定范围内的随机整数
     * @param min 随机数的最小值（包含）
     * @param max 随机数的最大值（包含）
     * @returns 返回min到max之间的随机整数
     */
    public static getRandomInt(min, max) {
        // 生成随机数并调整范围
        max = min - .5 + Math.random() * (max - min + 1);
        // 四舍五入取整并返回结果
        return Math.round(max)
    }

    /**
     * 获取指定范围内的随机浮点数
     * @param min 随机数的最小值（包含）
     * @param max 随机数的最大值（包含）
     * @returns 返回min到max之间的随机浮点数
     */
    public static getRandomFloat(min, max) {
        // 生成随机数并调整范围
        max = min - .5 + Math.random() * (max - min + 1);
        return max;
    }


    public static createRenderTexture(resolutionScale: number, numOfColors: number = 1): RenderTexture {
        let texture = new RenderTexture();
        let size = screen.windowSize;
        let dpr = Math.min(1.5, screen.devicePixelRatio);
        let width = size.width * dpr * resolutionScale;
        let height = size.height * dpr * resolutionScale;
        let ratio = width / height;
        if (width > 2048) {
            width = 2048;
            height = width / ratio;
        }
        if (height > 2048) {
            height = 2048;
            width = height * ratio;
        }

        let colors = [];
        for (let i = 0; i < numOfColors; ++i) {
            colors.push(new gfx.ColorAttachment(gfx.Format.RGBA8));
        }

        texture.reset({
            width: width, height: height,
            passInfo: new gfx.RenderPassInfo(
                colors, new gfx.DepthStencilAttachment(gfx.Format.DEPTH_STENCIL),
            )
        });

        texture.setFilters(Texture2D.Filter.LINEAR, Texture2D.Filter.LINEAR);
        texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_BORDER, Texture2D.WrapMode.CLAMP_TO_BORDER);

        return texture;
    }
    public static countPlaneSquaredDis(posA: Vec3, posB: Vec3) {
        const pA = pv3.alloc();
        const pB = pv3.alloc();

        pA.set(posA.x, 0, posA.z);
        pB.set(posB.x, 0, posB.z);

        let dis = Vec3.squaredDistance(pA, pB);

        pv3.free(pA);
        pv3.free(pB);

        return dis;
    }

    public static syncCameraParameters(current: Camera, target: Camera) {
        current.fov = target.fov;
        current.near = target.near;
        current.far = target.far;
        current.orthoHeight = target.orthoHeight;
    }

    public static syncCameraTransform(current: Camera, target: Camera) {
        current.node.worldPosition = target.node.worldPosition;
        current.node.worldScale = target.node.worldScale;
        current.node.worldRotation = target.node.worldRotation;
    }


    // 二阶贝塞尔曲线
    public static bezierCurve(t: number, p1: Vec3, cp: Vec3, p2: Vec3, out: Vec3) {
        out.x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        out.y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        out.z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
    }

    // 二阶贝塞尔曲线
    public static bezierCurve2(t: number, p1: Vec3, cp: Vec3, p2: Vec3, out: Vec3) {
        out.x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        out.y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        out.z = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.z;
    }

    /** 获取矩形区域内的随机位置 */
    public static randomPosInRect(num: number, centerPos: Vec3, wRang: number, hRang: number, intervalR): Vec3[] {
        let row = Math.floor(hRang / intervalR);
        let col = Math.floor(wRang / intervalR);
        let end = row * col;
        if (num > end) return null;

        let ids = Utils.randomUniqueNumbers(0, end, num);
        let r, c, result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            r = Math.floor(id / col);
            c = id - col * r;
            result.push(new Vec3(centerPos.x - wRang / 2 + c * intervalR, centerPos.y, centerPos.z - hRang / 2 + r * intervalR));
        }

        return result;
    }


    public static randomUniqueNumbers(start, end, count): number[] {
        const numbers = Array.from(Array(end - start + 1).keys(), (x) => x + start);
        const result = [];
        for (let i = 0; i < count; i++) {
            if (numbers.length <= 0) {
                break;
            }
            const index = Math.floor(Math.random() * numbers.length);
            result.push(numbers[index]);
            numbers.splice(index, 1);
        }
        return result;
    }

    /** 随机四边形内的一个点
     * @param p1 四边形第一个顶点
     * @param p2 四边形第二个顶点
     * @param p3 四边形第三个顶点
     * @param p4 四边形第四个顶点
     * @returns 四边形内的随机点
     */
    public static getRandomPosInRect(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3): Vec3 {
        // 将四边形分成两个三角形：triangle1(p1, p2, p3) 和 triangle2(p1, p3, p4)
        // 计算两个三角形的面积，用于按比例选择三角形
        let area1 = Utils.getTriangleArea(p1, p2, p3);
        let area2 = Utils.getTriangleArea(p1, p3, p4);
        let totalArea = area1 + area2;

        // 根据面积比例随机选择一个三角形
        let randomValue = Math.random() * totalArea;

        if (randomValue < area1) {
            // 在第一个三角形内生成随机点
            return Utils.getRandomPosInTriangle(p1, p2, p3);
        } else {
            // 在第二个三角形内生成随机点
            return Utils.getRandomPosInTriangle(p1, p3, p4);
        }
    }

    /** 计算三角形面积
     * @param p1 三角形第一个顶点
     * @param p2 三角形第二个顶点
     * @param p3 三角形第三个顶点
     * @returns 三角形面积
     */
    private static getTriangleArea(p1: Vec3, p2: Vec3, p3: Vec3): number {
        // 使用叉积计算三角形面积
        let v1 = new Vec3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        let v2 = new Vec3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

        // 叉积的模长的一半就是三角形面积
        let crossX = v1.y * v2.z - v1.z * v2.y;
        let crossY = v1.z * v2.x - v1.x * v2.z;
        let crossZ = v1.x * v2.y - v1.y * v2.x;

        return Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
    }

    /** 在三角形内随机生成一个点
     * @param p1 三角形第一个顶点
     * @param p2 三角形第二个顶点
     * @param p3 三角形第三个顶点
     * @returns 三角形内的随机点
     */
    private static getRandomPosInTriangle(p1: Vec3, p2: Vec3, p3: Vec3): Vec3 {
        // 生成两个随机数
        let r1 = Math.random();
        let r2 = Math.random();

        // 如果超出三角形范围，则镜像回来，确保均匀分布
        if (r1 + r2 > 1) {
            r1 = 1 - r1;
            r2 = 1 - r2;
        }

        // 计算三角形内的随机点：p1 + r1*(p2-p1) + r2*(p3-p1)
        return new Vec3(
            p1.x + r1 * (p2.x - p1.x) + r2 * (p3.x - p1.x),
            p1.y + r1 * (p2.y - p1.y) + r2 * (p3.y - p1.y),
            p1.z + r1 * (p2.z - p1.z) + r2 * (p3.z - p1.z)
        );
    }

    public static clickEffect(node: Node) {
        tween(node)
            .by(0.25, { scale: v3(-0.2, -0.2, 0) }, { easing: 'quadOut' })
            .by(0.25, { scale: v3(0.2, 0.2, 0) }, { easing: 'quadOut' })
            .start()
    }


    /** 获取圆环上的随机位置
     * @param centerPos 中心位置
     * @param radius1 内圈半径
     * @param radius2 外圈半径
     * @returns 圆环上的随机位置
     */
    public static getRandomPosOnCircle(centerPos: Vec3, radius1: number, radius2: number) {
        let angle = Math.random() * 2 * Math.PI;
        let radius = Math.random() * (radius2 - radius1) + radius1;
        let pos = new Vec3(0, 0, 0);
        pos.x = centerPos.x + radius * Math.cos(angle);
        pos.z = centerPos.z + radius * Math.sin(angle);
        return pos;
    }
    /** 播放特效 */
    public static playEffect(effNode: Node, playAnim: boolean = false) {
        effNode.active = true;
        let parArr = effNode.getComponentsInChildren(ParticleSystem);
        for (let i = 0; i < parArr.length; i++) {
            parArr[i]?.play();
        }
        if (playAnim) {
            let animArr = effNode.getComponentsInChildren(Animation);
            for (let i = 0; i < animArr.length; i++) {
                animArr[i]?.play();
            }
        }
    }

    /**
  * 调用这个方法即可触发“建造完成”弹跳缩放效果
  */
    public playPopTween(target: Node, originalScale: Vec3, callback?: Function) {
        // 记录原始缩放（假设节点在 x、y、z 上缩放一致，若不一致可分别记录）

        // 先设置一个较小的初始缩放，强调瞬间弹出感
        const startScale = 0.25;
        target.setScale(new Vec3(
            originalScale.x * startScale,
            originalScale.y * startScale,
            originalScale.z * startScale
        ));

        // 构造 Q 弹化的缩放序列
        tween(target)
            .to(0.18, { scale: originalScale.clone().multiplyScalar(1.20) }, { easing: 'backOut' })   // 冲出到 >1
            .to(0.10, { scale: originalScale.clone().multiplyScalar(0.94) }, { easing: 'sineInOut' }) // 回落到 <1
            .to(0.42, { scale: originalScale }, { easing: 'elasticOut' })                             // 弹性回归 1
            .call(() => {
                if (callback) {
                    callback();
                }
            })
            .start();
    }

    /** 计算贝塞尔曲线控制点 */
    public static calcControlPos(startPos: Vec3, targetPos: Vec3, offsetPos: Vec3) {
        let controlPos = new Vec3();
        Vec3.add(controlPos, startPos, targetPos);
        controlPos.multiplyScalar(0.5);
        controlPos.add(offsetPos);
        return controlPos;
    }
}