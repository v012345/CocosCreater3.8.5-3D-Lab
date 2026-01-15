import { _decorator, Component, Mat4, Mesh, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StaticBatch')
export class StaticBatch extends Component {
    @property({ type: MeshRenderer.ShadowCastingMode })
    protected castShadow = MeshRenderer.ShadowCastingMode.ON;
    @property({ type: MeshRenderer.ShadowReceivingMode })
    protected receiveShadow = MeshRenderer.ShadowReceivingMode.ON;

    saveStaticNode: Node;
    protected start(): void {
        let models = this.node.getComponentsInChildren(MeshRenderer);

        if (!models.length) {
            return;
        }

        this.saveStaticNode = new Node(`${this.node.name}_StaticBatch1`);

        // === 按材质分组 ===
        const materialGroups = new Map<string, MeshRenderer[]>();
        for (const m of models) {
            if (!m.node.activeInHierarchy) continue;
            const mats = m.sharedMaterials;
            if (!mats) continue;
            let key: string = "";
            for (let mat of mats) {
                key += (mat.uuid || mat.name) + "_";
            }
            if (key.length <= 0) continue;
            if (!materialGroups.has(key)) materialGroups.set(key, []);
            materialGroups.get(key)!.push(m);
        }

        const rootWorldMatInv = new Mat4();
        this.node.getWorldMatrix(rootWorldMatInv);
        Mat4.invert(rootWorldMatInv, rootWorldMatInv);

        let groupIndex = 0;
        const worldMat = new Mat4();
        for (const [_, renderers] of materialGroups) {
            const batchedMesh = new Mesh();

            for (const comp of renderers) {
                comp.node.getWorldMatrix(worldMat);
                Mat4.multiply(worldMat, rootWorldMatInv, worldMat);
                batchedMesh.merge(comp.mesh!, worldMat);
                comp.enabled = false;
            }
            const mergedNode = new Node(`MergedGroup_${groupIndex++}`);
            mergedNode.setParent(this.saveStaticNode);

            const mergedRenderer = mergedNode.addComponent(MeshRenderer);
            mergedRenderer.mesh = batchedMesh;
            let mats = renderers[0].sharedMaterials;
            for (let i = 0; i < mats.length; i++) {
                mergedRenderer.setSharedMaterial(mats[i], i);
            }
            mergedRenderer.node.name = `MergedGroup_${groupIndex++}`;
            mergedRenderer.shadowCastingMode = this.castShadow;
            mergedRenderer.receiveShadow = this.receiveShadow;
        }

        for (const comp of models) {
            comp.node.active = false;
        }
        this.saveStaticNode.setParent(this.node);
    }
}