import { LSTween } from 'LSTween.lspkg/LSTween'
import { LyricsData } from './LyricsData'
import { LYRICS_STOP, LYRICS_STOP_DIRTY, LYRICS_WAITING, LYRICS_PAUSE } from './LyricsStates'
import { LyricsSubscriber } from './LyricsSubscriber'
import { findAllComponentsInChildren } from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils"
import WorldCameraFinderProvider from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider'
import Easing from 'LSTween.lspkg/TweenJS/Easing'

@component
export class LyricsDistributor extends LyricsSubscriber {
    @input
    lyricsOffset: 0
    @input
    parentObject: SceneObject
    alreadySet = false
    lyricsText: Text[] = []

    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this))
    }

    onStart() {
        var texts = findAllComponentsInChildren(this.sceneObject, "Component.Text")
        texts.forEach(text => {
            this.lyricsText.push(text as Text)
        });

    }

    override setLyrics(lyrics: LyricsData, current: number, template: Text) {
        return
    }

    setLyricsOnce(lyrics: LyricsData, current: number, template: Text) {
        if (this.alreadySet) {
            return
        }
        this.alreadySet = true
        var wordsToDistribute: string[] = []
        if (current == LYRICS_STOP || current == LYRICS_WAITING) {
            for (let i = 0; i < this.lyricsText.length; i++) {
                wordsToDistribute.push("")
            }
        }
        else {
            while (wordsToDistribute.length < this.lyricsText.length) {
                var lyric = this.findLyric(lyrics, current);
                if (lyric == "") {
                    for (let i = wordsToDistribute.length; i < this.lyricsText.length; i++) {
                        wordsToDistribute.push('')
                    }
                    break;
                }
                var words = lyric.split(' ')
                words.forEach(word => {
                    if (wordsToDistribute.length < this.lyricsText.length)
                        wordsToDistribute.push(word)
                });
                current++
            }
        }
        for (let i = 0; i < this.lyricsText.length; i++) {
            this.lyricsText[i].textFill = template.textFill
            this.lyricsText[i].text = wordsToDistribute[i];
        }
    }

    override setEnable(enable:boolean) {
        super.setEnable(true)
        var i = 0
        var danceDuration = 8000
        var transitionDuration = 2000
        var stepDuration = transitionDuration / this.sceneObject.children.length
        this.sceneObject.children.forEach(element => {
            LSTween.moveOffset(element.getTransform(), new vec3(0, 0, 0.6), 2 * stepDuration)
                .delay(stepDuration * i)
                .easing(Easing.Elastic.Out)
                .start().onComplete(() => {
                    LSTween.moveOffset(element.getTransform(), new vec3(0, 0, -0.6), stepDuration)
                        .delay(danceDuration)
                        .easing(Easing.Elastic.In) 
                        .start()
                })
            i++
        });
        LSTween.rawTween(transitionDuration).delay(danceDuration + transitionDuration)
            .onComplete(() => {
                this.reset()
            }).start()
    }

    reset() {
        this.alreadySet = false
        this.parentObject.enabled = false
    }
}
