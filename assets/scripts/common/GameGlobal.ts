import { Camera } from 'cc';
import { Actor } from '../avatar/Actor';
import { CameraControl } from './CameraControl';
import { JoyStick } from './JoyStick';
import { MainGame } from "./MainGame";
import { PropNumber } from './PropNumber';
import { EndCard } from '../EndCard';
import { QueueBuyerManager } from '../avatar/QueueBuyerManager';
import { PoliceCamera } from '../avatar/PoliceCamera';
import { DiTieManager } from '../ditie/DiTieManager';
import { RoomManager } from '../room/RoomManager';
import { MoneyManager } from '../money/MoneyManager';
import { CrowdManager } from '../crowd/CrowdManager';
import { EnemyManager } from '../enemy/EnemyManager';
import { WallManager } from '../wall/WallManager';
import { TurretManager } from '../turret/TurretManager';
import { FightManager } from '../FightManager';
import { RestaurantManager } from '../restaurant/RestaurantManager';
import { GuideManager } from '../guide/GuideManager';

export class GameGlobal {
    static mainCamera: Camera;
    static cameraMoving = false;
    static isShu = false;
    static realWidth = 720;
    static realHeight = 720;
    static viewScale: number = 1;
    static isGameEnd = false;
    static isGameStart = false;

    static isFightPause = false;
    static isGuidePause = false;
    static isPlayEndScene = false;
    static actor: Actor;
    static cameraControl: CameraControl;
    static joyStick: JoyStick;
    static mainGame: MainGame;
    static goldBar: PropNumber;
    static endCard: EndCard;
    static queuebuyer: QueueBuyerManager;
    static policeCamera: PoliceCamera;
    static diTie: DiTieManager;
    static room: RoomManager;
    static money: MoneyManager;
    static crowd: CrowdManager;
    static enmey: EnemyManager;
    static wall: WallManager;
    static turret: TurretManager;
    static fight: FightManager;
    static restaurant: RestaurantManager;
    static guide: GuideManager;
}

window["G"] = GameGlobal;