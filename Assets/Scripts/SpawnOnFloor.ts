import { LSTween } from "LSTween.lspkg/LSTween";
import Easing from "LSTween.lspkg/TweenJS/Easing";
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
const WorldQueryModule = require("LensStudio:WorldQueryModule")
const SIK = require("SpectaclesInteractionKit.lspkg/SIK").SIK
const EPSILON = 0.01

@component
export class SpawnOnFloor extends BaseScriptComponent {
    private camera = WorldCameraFinderProvider.getInstance();
    private primaryInteractor
    private hitTestSession: HitTestSession
    private currentHitPosition: vec3
    private currentHitRotation: quat

    @input
    targetObject: SceneObject

    onAwake() {
           // create new hit session
        this.hitTestSession = this.createHitTestSession(false)
          this.createEvent("UpdateEvent").bind(() => { this.onUpdate() })

    }

    createHitTestSession(filterEnabled) {
        // create hit test session with options
        var options = HitTestSessionOptions.create()
        options.filter = filterEnabled

        var session = WorldQueryModule.createHitTestSessionWithOptions(options)
        return session
    }

    onUpdate() {
        if (!this.targetObject.enabled) {
            var cameraLookAt = this.camera.back()
            // display if look at the floor on the left
            if (cameraLookAt.angleTo(vec3.down()) > 40 * MathUtils.DegToRad
                && cameraLookAt.angleTo(vec3.down()) < 50 * MathUtils.DegToRad
                && cameraLookAt.angleTo(vec3.right()) > 40 * MathUtils.DegToRad
                && cameraLookAt.angleTo(vec3.right()) < 50 * MathUtils.DegToRad) {

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
                }
            }
        }
    }

    spawnObject() {
        var tr = this.targetObject.getTransform()
        tr.setWorldPosition(this.currentHitPosition)
        tr.setWorldRotation(this.currentHitRotation)
        LSTween.scaleFromToLocal(this.targetObject.getTransform(), vec3.zero(), vec3.one(), 2000).easing(Easing.Elastic.InOut).start()
        this.targetObject.enabled = true
    }

    onHitTestResult(results) {
        if (results === null) {
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
                this.currentHitPosition = hitPosition
                this.currentHitRotation = toRotation
                this.spawnObject()
            } else {
            }
        }
    }
}
