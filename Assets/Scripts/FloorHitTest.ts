import { InteractorTriggerType } from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import { MyWorldQueryHitTest, MyWorldQueryHitResult, MyWorldQueryHitSubscriberRegistration } from "./MyWorldQueryHitTest"
import { findScriptComponentInChildren } from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils"
import { LyricsSubscriber } from "./LyricsSubscriber"
import { LyricsDistributor } from "./LyricsDistributor"

// import required modules
const WorldQueryModule = require("LensStudio:WorldQueryModule")
const SIK = require("SpectaclesInteractionKit.lspkg/SIK").SIK
const EPSILON = 0.01

@component
export class FloorHitTest extends BaseScriptComponent {

    @input
    worldHitTest: MyWorldQueryHitTest
    registration: MyWorldQueryHitSubscriberRegistration
    @input
    targetObject: SceneObject
    @input
    @allowUndefined
    placeholder: SceneObject
    @input
    @allowUndefined
    notified: LyricsSubscriber

    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this))
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this))
        this.createEvent("OnEnableEvent").bind(this.onEnable.bind(this))
        this.createEvent("OnDisableEvent").bind(this.onDisable.bind(this))
        this.registration = new MyWorldQueryHitSubscriberRegistration(true, true, true, this.onHit.bind(this))
    }

    onStart() {
    }

    onEnable() {
        if (this.worldHitTest != null) {
            this.worldHitTest.register(this.registration)
        }
    }

    onDisable() {
        if (this.worldHitTest != null) {
            this.worldHitTest.unregister(this.registration)
        }
    }

    onHit(results: MyWorldQueryHitResult) {
        if (results == null) {
            if (this.placeholder) {
                this.placeholder.enabled = false
            }
        } else {

            if (results.triggered) {
                if (this.targetObject.enabled == false) {
                    // Called when a trigger ends
                    this.spawnObject(this.targetObject, results)
                    this.notified.setEnable(true)
                }
            }
            if (this.placeholder) {
                this.placeholder.enabled = this.targetObject.enabled == false
                if (this.placeholder.enabled) {
                    this.spawnObject(this.placeholder, results)
                }
            }
        }
    }

    spawnObject(object: SceneObject, results: MyWorldQueryHitResult) {
        var tr = object.getTransform()
        tr.setWorldPosition(results.currentHitPosition)
        tr.setWorldRotation(results.currentHitRotationParrallelToGround)
        object.enabled = true
    }

    onUpdate() {
    }
}
