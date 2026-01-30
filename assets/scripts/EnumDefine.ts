/**
 * 角色状态
 */
export enum StateDefine {
    Null = "null",
    Idle = "idle",
    Attack = "attack",
    MoveAttack = "moveAttack",
    Move = "move",
    Patrol = "patrol",
    Die = "die",
    /** 闪避 */
    Dodge = "dodge",
    /** 技能攻击 */
    SkillAttack = "skillAttack",
}
/** 角色动画 */
export enum AnimDefine {
    Null = "null",
    /** 待机 */
    Idle = "idle",
    /** 移动 */
    Move = "move",
    /** 攻击 */
    Attack = "attack",
    /** 移动攻击 */
    MoveAttack = "moveAttack",
    /** 击退 */
    Knockback = "knockback",
    /** 闪避 */
    SkillDodge = "skillDodge",
    /** 技能攻击 */
    SkillAttack = "skillAttack",
    /** 死亡 */
    Die = "die",
    /** boss普通攻击 */
    BossNormalAttack = "bossNormalAttack",
    /** boss1技能攻击 */
    BossSkill1Attack = "bossSkill1Attack",
    /** boss2技能攻击 */
    BossSkill2Attack = "bossSkill2Attack",
    /** boss3技能攻击 */
    BossSkill3Attack = "bossSkill3Attack",
    /** 士兵待机 */
    SoldierIdle = "soldierIdle",
    /** 士兵移动 */
    SoldierMove = "soldierMove",
    /** 士兵攻击 */
    SoldierAttack = "soldierAttack",
    /** 士兵死亡 */
    SoldierDie = "soldierDie",
    /** 骑待机 */
    RideIdle = "rideIdle",
    /** 骑攻击 */
    RideAttack = "rideAttack",
    /** 骑死亡 */
    RideDie = "rideDie",
    /** 空中待机 */
    AirIdle = "airIdle",
    /** 空中移动 */
    AirMove = "airMove",
    /** 工作 */
    Work = "work",
    /** 出场 */
    Appear = "appear",
    /** 站立待机 */
    StandIdle = "standIdle",
}

/** 角色阵营 */
export enum GroupDefine {
    /** 敌人 */
    T = 'T',
    /** 自己 */
    B = 'B'
}

/** 音效类型 */
export enum SoundType {

    /** 收拿物品 */
    收拿物品 = 'item',
    /** 枪攻击 */
    枪攻击 = 'qiangAtk',
    /** 金币音效 */
    金币 = 'coin',
    /** 箭攻击 */
    箭攻击 = 'jianAtk',
}

export enum StickerType { // 贴纸类型
    Null = "Null", // 无
    Mount = "Mount", // 骑
    Dismount = "Dismount", // 下马
    CollectFeather = "CollectFeather", // 收集羽毛
}

