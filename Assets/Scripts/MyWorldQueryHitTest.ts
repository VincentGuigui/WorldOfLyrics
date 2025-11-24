import { InteractorTriggerType } from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

// import required modules
const WorldQueryModule = require("LensStudio:WorldQueryModule")
const SIK = require("SpectaclesInteractionKit.lspkg/SIK").SIK
const EPSILON = 0.01

@component
export class MyWorldQueryHitTest extends BaseScriptComponent {

    private primaryInteractor
    private hitTestSession: HitTestSession

    private camera = WorldCameraFinderProvider.getInstance()
    public currentHitPosition: vec3
    public currentHitRotation: quat
    public currentHitRotationParrallelToGround: quat

    @input
    surfaceClassification = false

    @input
    filter = false

    subscribers: MyWorldQueryHitSubscriberRegistration[] = []

    onAwake() {
        // create update event
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this))
    }

    isRegistered(registration: MyWorldQueryHitSubscriberRegistration): boolean {
        return this.subscribers.indexOf(registration) > -1

    }
    register(registration: MyWorldQueryHitSubscriberRegistration) {
        if (!this.isRegistered(registration)) {
            this.subscribers.push(registration)

        }
    }

    unregister(registration: MyWorldQueryHitSubscriberRegistration) {
        var index = this.subscribers.indexOf(registration)
        if (index > -1)
            this.subscribers.splice(index, 1)
    }

    private createHitTestSession() {
        // create hit test session with options
        var options = HitTestSessionOptions.create()
        options.filter = this.filter
        this.hitTestSession = WorldQueryModule.createHitTestSessionWithOptions(options)
    }

    private stopHitTestSession() {
        this.hitTestSession.stop()
        this.hitTestSession = null
    }

    onUpdate() {
        if (this.subscribers.length > 0 && this.hitTestSession == null) {
            this.createHitTestSession()
        }
        if (this.subscribers.length == 0 && this.hitTestSession != null) {
            this.stopHitTestSession()
            return
        }
        if (this.hitTestSession == null) {
            return
        }
        var needHand = this.subscribers.find((sub) => { return sub.handHit })
        if (needHand) {
            this.primaryInteractor = SIK.InteractionManager.getTargetingInteractors().shift()
            if (this.primaryInteractor &&
                this.primaryInteractor.isActive() &&
                this.primaryInteractor.isTargeting()
            ) {
                const rayStart = new vec3(this.primaryInteractor.startPoint.x, this.primaryInteractor.startPoint.y, this.primaryInteractor.startPoint.z + 30)
                const rayEnd = this.primaryInteractor.endPoint
                this.hitTestSession.hitTest(rayStart, rayEnd, this.onHandHitTestResult.bind(this))
            }
            else {
                this.onHandHitTestResult(null)
            }
        }
        else {
            const rayStart = this.camera.getWorldPosition()
            const rayEnd = this.camera.getForwardPosition(300, false)
            this.hitTestSession.hitTest(rayStart, rayEnd, this.onGazeHitTestResult.bind(this))
        }
    }

    onHitTestResultCore(results: WorldQueryHitTestResult, handHit: boolean) {
        var subs = this.subscribers.filter((sub, index, arr) => { return sub.handHit == handHit })
        if (results == null) {
            subs.forEach(sub => { sub.hitCallback(null) })
            return
        }

        var placeholderSubs = subs.filter((sub, index, arr) => { return sub.receivePlaceholder })
        var triggeredSubs = subs.filter((sub, index, arr) => { return sub.receiveTrigger })
        // get hit information
        const hitPosition: vec3 = results.position
        const hitNormal: vec3 = results.normal
        var lookDirection
        // identifying the direction the object should look at based on the normal of the hit location.
        // horizontal
        if (1 - Math.abs(hitNormal.normalize().dot(vec3.up())) < EPSILON) {
            lookDirection = this.camera.forward()
            var worldHitResult = new MyWorldQueryHitResult()
            worldHitResult.handHit = handHit
            worldHitResult.triggered = false
            worldHitResult.currentHitPosition = hitPosition
            worldHitResult.currentHitRotation = quat.lookAt(lookDirection, hitNormal)
            lookDirection.y = 0
            worldHitResult.currentHitRotationParrallelToGround = quat.lookAt(lookDirection, hitNormal)
            placeholderSubs.forEach(sub => { sub.hitCallback(worldHitResult) })
            if (triggeredSubs.length > 0)
                if (
                    this.primaryInteractor.previousTrigger !== InteractorTriggerType.None &&
                    this.primaryInteractor.currentTrigger === InteractorTriggerType.None
                ) {
                    console.log("click")
                    worldHitResult.triggered = true
                    triggeredSubs.forEach(sub => { sub.hitCallback(worldHitResult) })
                }
        }
    }

    onGazeHitTestResult(results: WorldQueryHitTestResult) {
        this.onHitTestResultCore(results, false);
    }

    onHandHitTestResult(results: WorldQueryHitTestResult) {
        this.onHitTestResultCore(results, true);
    }
}

export class MyWorldQueryHitSubscriberRegistration {
    receivePlaceholder: boolean
    receiveTrigger: boolean
    handHit: boolean
    hitCallback: (results: MyWorldQueryHitResult) => void
    constructor(receivePlaceholder: boolean, receiveTrigger: boolean, handHit: boolean, hitCallback: (results: MyWorldQueryHitResult)=>void) {
        this.receivePlaceholder = receivePlaceholder
        this.receiveTrigger = receiveTrigger
        this.handHit = handHit
        this.hitCallback = hitCallback
    }
}

export class MyWorldQueryHitResult {
    rawResults: MyWorldQueryHitResult
    public handHit: boolean
    public triggered: boolean
    public currentHitPosition: vec3
    public currentHitRotation: quat
    public currentHitRotationParrallelToGround: quat
}

