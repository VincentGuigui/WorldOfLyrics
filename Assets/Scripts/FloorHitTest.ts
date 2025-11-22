import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

// import required modules
const WorldQueryModule = require("LensStudio:WorldQueryModule")
const SIK = require("SpectaclesInteractionKit.lspkg/SIK").SIK
const EPSILON = 0.01

@component
export class FloorHitTest extends BaseScriptComponent {

    private primaryInteractor
    private hitTestSession: HitTestSession
    private hitOK = false

    private camera = WorldCameraFinderProvider.getInstance()
    private currentHitPosition: vec3
    private currentHitRotation: quat

    @input
    targetObject: SceneObject
    @input
    @allowUndefined
    placeholder: SceneObject

    onAwake() {
        // create new hit session
        this.hitTestSession = this.createHitTestSession(false)
        if (!this.targetObject) {
            print("Please set Target Object input")
            return
        }
        // create update event
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this))
        this.createEvent("TapEvent").bind(this.onTapEvent.bind(this))
    }


    createHitTestSession(filterEnabled) {
        // create hit test session with options
        var options = HitTestSessionOptions.create()
        options.filter = filterEnabled

        var session = WorldQueryModule.createHitTestSessionWithOptions(options)
        return session
    }

    onHitTestResult(results) {
        if (results === null) {
            this.hitOK = false
        } else {
            // get hit information
            const hitPosition: vec3 = results.position
            const hitNormal: vec3 = results.normal

            var lookDirection
            //identifying the direction the object should look at based on the normal of the hit location.
            // flat
            if (1 - Math.abs(hitNormal.normalize().dot(vec3.up())) < EPSILON) {
                lookDirection = this.camera.forward()
                lookDirection.y = 0
                const toRotation = quat.lookAt(lookDirection, hitNormal)
                //set position and rotation
                this.hitOK = true
                this.currentHitPosition = hitPosition
                this.currentHitRotation = toRotation
                if (this.targetObject.enabled) {
                    if (this.placeholder) {
                        this.placeholder.enabled = false
                    }
                } else if (this.placeholder) {
                    this.spawnObject(this.placeholder)
                }
            } else {
                // vertical
                // lookDirection = hitNormal.cross(vec3.up())
                this.hitOK = false
                if (this.placeholder) {
                    this.placeholder.enabled = false
                }
            }
        }
    }

    onTapEvent() {
        if (this.hitOK) {
            this.spawnObject(this.targetObject)
        }
    }

    spawnObject(object: SceneObject) {
        var tr = this.targetObject.getTransform()
        tr.setWorldPosition(this.currentHitPosition)
        tr.setWorldRotation(this.currentHitRotation)
        this.targetObject.enabled = true
    }

    onUpdate() {
        this.primaryInteractor = SIK.InteractionManager.getTargetingInteractors().shift()
        if (this.primaryInteractor &&
            this.primaryInteractor.isActive() &&
            this.primaryInteractor.isTargeting()
        ) {
            const rayStartOffset = new vec3(this.primaryInteractor.startPoint.x, this.primaryInteractor.startPoint.y, this.primaryInteractor.startPoint.z + 30)
            const rayStart = rayStartOffset
            const rayEnd = this.primaryInteractor.endPoint
            this.hitTestSession.hitTest(rayStart, rayEnd, this.onHitTestResult.bind(this))
        } else {
            this.targetObject.enabled = false
            if (this.placeholder)
                this.placeholder.enabled = false
        }
    }
}
