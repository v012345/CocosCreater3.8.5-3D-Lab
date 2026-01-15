import { assetManager, AudioClip, AudioSource, game, Game, math, Node, sys, Vec3, view } from "cc";

declare var window;

class AudioItem {
    audioSource: AudioSource;
    playing: boolean;
    loop: boolean;
    duration: number;
    startTime: number;
}

export class AudioManager {
    private static _audioSource?: AudioSource;
    private static _cachedAudioClipMap: Record<string, AudioClip> = {};
    private static clipMapNum: Record<string, number> = {};

    private static audioSourceMap: Record<string, AudioItem> = {};
    private static rootNode: Node;

    private static basePath = 'audio/';

    public static musicEnable: boolean = true;
    public static soundEnable: boolean = true;
    public static volume: number = 1;

    public static firstClick = false;

    private static minDis: number = 5;
    private static maxDis: number = 10;


    // init AudioManager in GameRoot component.
    public static init(audioSource: AudioSource, node?) {
        AudioManager._audioSource = audioSource;
        AudioManager.rootNode = node;
        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.playing && item.audioSource.stop();
        }
        AudioManager.audioSourceMap = {};

        if ('volumeSwitch' in window && window.volumeSwitch !== void 0) {
            console.log('Init AudioManager volumeSwitch', window.volumeSwitch);
            AudioManager.musicEnable = !!window.volumeSwitch;
            AudioManager.soundEnable = !!window.volumeSwitch;
        }
        if (window.__PLATFORM == 'Ironsource') {
            //Ironsource 平台音量
            var vs = window.volumeAudio;
            if (vs <= 0) {
                AudioManager.volume = 0;
                AudioManager.musicEnable = false;
                AudioManager.soundEnable = false;
            } else if (typeof vs == 'number') {
                AudioManager.volume = vs;
            }
        }
        console.log('Init AudioManager:', AudioManager.musicEnable, AudioManager.volume);

        game.on(Game.EVENT_HIDE, function () {
            AudioManager.pause();
        });
        game.on(Game.EVENT_SHOW, function () {
            AudioManager.resume();
        });

        view.on("audioVolumeChange", AudioManager.audioVolumeChange, this);
    }

    public static audioVolumeChange(e) {
        // console.log('audioVolumeChange event.', e)
        let last = AudioManager.musicEnable;
        AudioManager.musicEnable = e;
        AudioManager.soundEnable = e;
        if (last && !e) {
            AudioManager.pause();
        } else if (!last && e) {
            AudioManager.resume();
        }
        // this.isPlatformPlay = e, t.mute = !e
    }

    public static resume() {
        if (!AudioManager.musicEnable) {
            return;
        }
        const audioSource = AudioManager._audioSource!;
        audioSource.play();

        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.playing && (item.loop || game.totalTime - item.startTime < item.duration - 500) && item.audioSource.play();
        }
    }

    public static pause() {
        const audioSource = AudioManager._audioSource!;
        audioSource.pause();

        for (let name in AudioManager.audioSourceMap) {
            const item = AudioManager.audioSourceMap[name];
            item && item.audioSource.pause();
        }
    }


    /**
     * 播放音频（限制数量）
     * @param name 音频名
     * @param volumeScale 音量大小，默认为1
     * @param limitNum 限制同时播放的最大数量,默认为0不限制数量
     * @returns 
     */
    public static soundPlay(name: string, volumeScale = 1, limitNum: number = 0) {
        if (!AudioManager.soundEnable || !AudioManager.firstClick) {
            return;
        }

        const audioSource = AudioManager._audioSource!;

        let path = AudioManager.basePath + name;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        let clipMapNum = AudioManager.clipMapNum[path];
        if (cachedAudioClip) {
            if (limitNum == 0) {
                audioSource.playOneShot(cachedAudioClip, volumeScale);
            } else {
                if (clipMapNum >= limitNum) return;
                audioSource.playOneShot(cachedAudioClip, volumeScale);
                AudioManager.clipMapNum[path]++;
                setTimeout(() => {
                    AudioManager.clipMapNum[path]--;
                }, cachedAudioClip.getDuration() * 1000);
            }
        } else {
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                AudioManager.clipMapNum[path] = 0;
                audioSource.playOneShot(clip, volumeScale);
            });
        }
    }


    /**
     * 播放音效(限制距离,离主角近声音大，远声音小，类似点音源)
     * @param name 音频名
     * @param volumeScale 音量大小，默认为1
     * @param isGameOverPlay 是否在游戏结束后播放，默认不播放（胜利、失败音效播放）
     * @param soundPlayNode 播放音频的点
     * @param actorNode 传入主角
     * @returns 
     */
    public static soundPlayCheckDis(name: string, volumeScale = 1, soundPlayNode: Node, actorNode: Node) {
        if (!AudioManager.soundEnable || !AudioManager.firstClick) {
            return;
        }


        let pos = soundPlayNode.worldPosition.clone();
        let pos2 = actorNode.worldPosition.clone();
        let dis = Vec3.distance(pos, pos2);
        let scale: number = 1;
        if (dis < this.minDis) {    //小于最小距离，音频不做处理
            scale = 1;
        } else if (dis > this.minDis && dis <= this.maxDis) {   //大于最小距离，小于最大距离，音频递减
            scale = 1 / (dis - this.minDis);
        } else if (dis > this.maxDis) {     //大于最大距离，音频消失
            scale = 0;
        }
        math.clamp01(scale);


        const audioSource = AudioManager._audioSource!;

        let path = AudioManager.basePath + name;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        if (cachedAudioClip) {
            audioSource.playOneShot(cachedAudioClip, volumeScale);
        } else {
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                audioSource.playOneShot(clip, volumeScale);
            });
        }
    }


    /**
     * 播放背景音乐
     * @param {Boolean} loop 是否循环播放
     */
    public static musicPlay(name: string, loop: boolean) {
        const audioSource = AudioManager._audioSource!;
        if (audioSource.playing) {
            // audioSource.stop();
            return;
        }
        audioSource.loop = loop;

        let path = AudioManager.basePath + name;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        if (cachedAudioClip) {
            audioSource.clip = cachedAudioClip;
            if (AudioManager.musicEnable) {
                audioSource.play();
            }
            if (!AudioManager.firstClick) {
                audioSource.pause();
            }
        } else {
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                audioSource.clip = clip;

                if (AudioManager.musicEnable) {
                    audioSource.play();
                }
                if (!AudioManager.firstClick) {
                    audioSource.pause();
                }
            });
        }
    }

    public static musicStop() {
        const audioSource = AudioManager._audioSource!;
        audioSource.stop();
    }

    public static audioPlay(name, loop = false, volumeScale?: number) {
        if (!AudioManager.rootNode) {
            return;
        }

        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (!item) {
            const as = AudioManager.rootNode.addComponent(AudioSource);
            item = AudioManager.audioSourceMap[name] = { audioSource: as, playing: true, startTime: game.totalTime, loop: loop, duration: 0 };

            let path = AudioManager.basePath + name;
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                as.clip = clip;
                if (loop) {
                    as.loop = true;
                }
                as.volume = volumeScale && !isNaN(volumeScale) ? AudioManager.volume * volumeScale : AudioManager.volume;
                item.duration = as.duration * 1000;
                if (AudioManager.soundEnable) {
                    as.play();
                    item.startTime = game.totalTime;
                }
                if (!AudioManager.firstClick) {
                    as.pause();
                }
            });
        } else {
            const as = item.audioSource;
            if (loop) {
                as.loop = true;
            }
            item.loop = loop;

            as.volume = volumeScale && !isNaN(volumeScale) ? AudioManager.volume * volumeScale : AudioManager.volume;
            item.duration = as.duration * 1000;
            if (!as.playing && AudioManager.firstClick && AudioManager.soundEnable) {
                as.play();
                item.startTime = game.totalTime;
            }
        }
    }

    public static audioStop(name) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.playing = false;
            item.audioSource.stop();
        }
    }

    public static audioPause(name) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.playing = false;
            item.audioSource.pause();
        }
    }

    public static audioVolume(name, volumeScale: number = 1) {
        let item: AudioItem = AudioManager.audioSourceMap[name];
        if (item) {
            item.audioSource.volume = AudioManager.volume * volumeScale;
        }
    }


    // 设置音乐音量
    public static musicVolumeSet(v: number) {
        const audioSource = AudioManager._audioSource!;
        audioSource.volume = v;
        AudioManager.volume = v;
        sys.localStorage.setItem("volume", String(v));
    }

    public static musicEnableSet(enable: boolean) {
        const audioSource = AudioManager._audioSource!;
        AudioManager.musicEnable = enable;
        sys.localStorage.setItem("musicEnable", enable ? "1" : "0");
        if (enable) {
            if (!audioSource.playing) {
                audioSource.play();
            }
        } else {
            if (audioSource.playing) {
                audioSource.stop();
            }
        }
    }

    public static soundEnableSet(enable: boolean) {
        const audioSource = AudioManager._audioSource!;
        AudioManager.soundEnable = enable;
        sys.localStorage.setItem("soundEnable", enable ? "1" : "0");
    }
}