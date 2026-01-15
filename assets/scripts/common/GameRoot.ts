import { _decorator, Component, AudioSource, director } from 'cc';
import { AudioManager } from './AudioManager';
import { PlayableSDK } from './PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {

    @property(AudioSource)
    private _audioSource: AudioSource = null!;

    onLoad() {
        this._audioSource = this.getComponent(AudioSource)!;
        // assert(audioSource);
        director.addPersistRootNode(this.node);

        PlayableSDK.adapter();
        PlayableSDK.gameReady();

        // init AudioManager
        AudioManager.init(this._audioSource, this.node);

        let enableAudio = (e) => {
            console.log('AudioManager.resume');
            AudioManager.firstClick = true;
            AudioManager.resume();
        }

        // document.addEventListener('mouseup', enableAudio, {capture: true, once: true});
        // document.addEventListener('touchend', enableAudio, {capture: true, once: true});
        document.addEventListener('mousedown', enableAudio, { capture: true, once: true });
        document.addEventListener('touchstart', enableAudio, { capture: true, once: true });
    }


}