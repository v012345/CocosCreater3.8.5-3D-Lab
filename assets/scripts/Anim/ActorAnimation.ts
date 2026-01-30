import { _decorator, Component, Node } from 'cc';
import { AnimationEvent } from './AnimationEvent';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimation')
export class ActorAnimation extends Component {
    /** 攻击动作开始 */
    public onStartAttackAction = new AnimationEvent();
    /** 攻击 */
    public onAttackAction = new AnimationEvent();
    /** 攻击动作结束 */
    public onAttackEndAction = new AnimationEvent();

    /** 主角技能动作开始 */
    public onStartSkillAction = new AnimationEvent();
    /** 主角技能攻击 */
    public onSkillAction = new AnimationEvent();
    /** 主角技能动作结束 */
    public onSkillEndAction = new AnimationEvent();
    /** 显示技能特效 */
    public onShowSkillEffectAction = new AnimationEvent();

    /** 攻击动作开始 */
    onStartAttack() {
        this.onStartAttackAction.invoke();
    }
    /** 攻击 */
    onAttack() {
        this.onAttackAction.invoke();
    }
    /** 攻击动作结束 */
    onAttackEnd() {
        this.onAttackEndAction.invoke();
    }



    /** 主角技能动作开始 */
    onStartSkill() {
        this.onStartSkillAction.invoke();
    }
    /** 主角技能攻击 */
    onSkill() {
        this.onSkillAction.invoke();
    }
    /** 主角技能动作结束 */
    onSkillEnd() {
        this.onSkillEndAction.invoke();
    }

    /** 显示技能特效 */
    onShowSkillEffect() {
        this.onShowSkillEffectAction.invoke();
    }
}


