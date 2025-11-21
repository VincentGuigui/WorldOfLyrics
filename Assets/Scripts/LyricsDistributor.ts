import { LSTween } from 'LSTween.lspkg/LSTween'
import { LyricsData } from './LyricsData'
import { LyricsSubscriber } from './LyricsSubscriber'
import { findAllComponentsInChildren } from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils"
import WorldCameraFinderProvider from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider'

@component
export class LyricsDistributor extends LyricsSubscriber {

    @input
    lyricsOffset: 0

    _lyricsText: Text[] = []
    private _camera = WorldCameraFinderProvider.getInstance();

    onAwake() {
        var texts = findAllComponentsInChildren(this.sceneObject, "Component.Text")
        texts.forEach(text => {
            this._lyricsText.push(text as Text)
        });
    }

    findTexts(parent: SceneObject = undefined) {
        if (parent == undefined) {
            parent = this.sceneObject;
        }
        for (const component of parent.getComponents("Component.Text") as Text[]) {
            const text = component as Text
            console.log("found text", text)
            this._lyricsText.push(text)
        }
        console.log(this._lyricsText[0])
        // Recursively check children
        for (var i = 0; i < parent.children.length; i++) {
            this.findTexts(parent.children[i]);
        }
    }

    override setLyrics(lyrics: LyricsData, current: number, template: Text) {
        return
    }

    setLyricsOnce(lyrics: LyricsData, current: number, template: Text) {
        var wordsToDistribute: string[] = []
        console.log("setLyricsOnce", this._lyricsText.length)
        while (wordsToDistribute.length < this._lyricsText.length) {
            var lyric = this.findLyric(lyrics, current);
            if (lyric == "") {
                for (let i = wordsToDistribute.length; i < this._lyricsText.length; i++) {
                    wordsToDistribute.push('')
                }
                break;
            }
            var words = lyric.split(' ')
            words.forEach(word => {
                if (wordsToDistribute.length < this._lyricsText.length)
                    wordsToDistribute.push(word)
            });
            current++
        }
        for (let i = 0; i < wordsToDistribute.length - 1; i++) {
            this._lyricsText[i].textFill = template.textFill
            this._lyricsText[i].text = wordsToDistribute[i];
        }
        //var cameraRot = this._camera.getTransform().getWorldRotation()
        /*this.sceneObject.getTransform().setWorldPosition(
            this._camera.getWorldPosition().add(cameraRot.toEulerAngles().normalize().uniformScale(100)))*/
        //LSTween.rotateFromToWorldInDegrees(this.sceneObject.children[0].getTransform(), new vec3(-10, 0, 0), new vec3(0, 0, 0), 2000)
        const delayedEvent = this.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(() => {
            this.hide()
        });
        delayedEvent.reset(8);
    }

    hide() {
        /*LSTween.rotateFromToWorldInDegrees(this.sceneObject.children[0].getTransform(), new vec3(0, 0, 0), new vec3(-10, 0, 0), 2000)
            .onComplete(() => {
                this.sceneObject.enabled = false;
            })
                */
    }

}
