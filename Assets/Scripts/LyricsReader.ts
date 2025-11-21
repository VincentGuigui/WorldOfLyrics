import WorldCameraFinderProvider from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider'
import { LyricsData } from './LyricsData'
import { LyricsSubscriber } from './LyricsSubscriber'
import { Song } from './Song'
import { findAllScriptComponentsInChildren, findScriptComponentInChildren } from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils"
import { LyricsDistributor } from './LyricsDistributor'
import { LYRICS_STOP, LYRICS_STOP_DIRTY, LYRICS_WAITING, LYRICS_PAUSE  } from './LyricsStates'

@component
export class LyricsReader extends BaseScriptComponent {

    private textTemplate: Text
    @input
    private Head: SceneObject = undefined
    @input
    private Hand: SceneObject = undefined
    @input
    private Thinking: SceneObject = undefined
    @input
    private Singing: SceneObject = undefined
    @input
    private Floor: SceneObject = undefined
    @input
    private Wall: SceneObject = undefined
    @input
    private Signage: SceneObject = undefined
    @input
    private Sky: SceneObject = undefined

    private _camera = WorldCameraFinderProvider.getInstance();
 
    @input
    lyricsLocations: SceneObject[]
    private _lyricsSubscribers: LyricsSubscriber[] = []
    private _lyrics: LyricsData = undefined
    private _startTime: number = 0
    private _currentPosition: number = 0
    private _currentLine = LYRICS_STOP_DIRTY
    private _headAlreadyVisible = false
    private _state = "stopped";

    onAwake() {
        this.registerSubscribers();
        this.textTemplate = this.sceneObject.getComponent("Component.Text")
        this.createEvent("UpdateEvent").bind(() => {
            this.update();
        })
    }

    setSong(song: Song) {
        this._lyrics = song.lyrics
        console.log("LyricsData", song.title, song.lyrics.timed.line.length, "lines")
    }

    registerSubscribers() {
        this.lyricsLocations.forEach(location => {
            var subs = findAllScriptComponentsInChildren(location, LyricsSubscriber)
            subs.forEach(sub => {
                this._lyricsSubscribers.push(sub)
            });
        })
    }

    update() {
        var headIsVisible = this.Head.isEnabledInHierarchy
        if (!headIsVisible) {
            this._headAlreadyVisible = false
        }
        if (headIsVisible && !this._headAlreadyVisible) {
            this._headAlreadyVisible = true
            var split = Math.random() > 0.5
            this.Singing.enabled = split
            this.Thinking.enabled = !split
        }
        // display Hand if no Head visible
        this.Hand.enabled = !headIsVisible;

        // display floor if look at the floor
        if (/*!this.Floor.enabled && */this._camera.back().angleTo(vec3.down()) < 35 * MathUtils.DegToRad) {
            this.Floor.enabled = true;
            var distributor = this.Floor.getComponent("ScriptComponent") as LyricsDistributor
            distributor.setLyricsOnce(this._lyrics, this.getLyricsIndex(), this.textTemplate)
        }
        if (this._state == "playing") {
            this.propagateLyrics(this.getLyricsIndex())
        } else if (this._state == "paused") {
            this.propagateLyrics(LYRICS_PAUSE)
        } else if (this._state == "stopped") {
            this.propagateLyrics(LYRICS_STOP)
        }
    }

    getLyricsIndex() {
        this._currentPosition = getTime() - this._startTime
        if (this._currentPosition < this._lyrics.timed.line[0].begin)
            return LYRICS_WAITING
        else {
            for (var l = 0; l < this._lyrics.timed.line.length; l++) {
                var line = this._lyrics.timed.line[l]
                if (line.begin < this._currentPosition && this._currentPosition < line.end) {
                    return l
                }
            }
        }
        return LYRICS_STOP
    }


    propagateLyrics(current: number) {
        if (current != this._currentLine) {
            this._currentLine = current

            this._lyricsSubscribers.forEach(lyricsSubscriber => {
                if (lyricsSubscriber as LyricsSubscriber) {
                    lyricsSubscriber.setLyrics(this._lyrics, current, this.textTemplate)
                }
            });
        }
    }

    play() {
        if (this._state == "stopped")
            this._startTime = getTime();
        else if (this._state == "paused")
            this._startTime = getTime() - this._currentPosition
        this._state = "playing"
    }

    pause() {
        this._state = "paused"
        this.Singing.enabled = false
        this.Thinking.enabled = false
        this.Hand.enabled = false
    }

    stop() {
        this._state = "stopped"
        this._startTime = 0
        this._currentLine = LYRICS_STOP_DIRTY
        this.propagateLyrics(LYRICS_STOP)
        this.Singing.enabled = false
        this.Thinking.enabled = false
        this.Hand.enabled = false
       //this.Floor.enabled = false
    }
}
