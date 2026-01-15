import { game } from "cc";
import { AudioManager } from "./AudioManager";

export class AudioCDWrapper {
    private static cdCaches: { [key: string]: number } = {}
    /**
     * 播放音效
     * @param name 
     */
    public static soundPlay(name: string, cd = 0, volumeScale = 1) {
        if (AudioCDWrapper.cdIsOk(name)) {
            AudioCDWrapper.setNextPlayTime(name, cd);
            AudioManager.soundPlay(name, volumeScale);
        }
    }
    public static audioPlay(name: string, cd = 0, loop = false, volumeScale?: number) {
        if (AudioCDWrapper.cdIsOk(name)) {
            AudioCDWrapper.setNextPlayTime(name, cd);
            AudioManager.audioPlay(name, loop, volumeScale);
        };
    }
    private static cdIsOk(name: string) {
        let nextPlayTime = AudioCDWrapper.cdCaches[name];
        if (nextPlayTime == undefined) {
            nextPlayTime = 0;
        }
        return game.totalTime > nextPlayTime;
    }
    private static setNextPlayTime(name: string, cd: number) {
        AudioCDWrapper.cdCaches[name] = game.totalTime + cd * 1000;
    }
}