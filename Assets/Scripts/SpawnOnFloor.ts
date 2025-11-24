import { LSTween } from "LSTween.lspkg/LSTween";
import Easing from "LSTween.lspkg/TweenJS/Easing";
import { MyWorldQueryHitResult, MyWorldQueryHitSubscriberRegistration, MyWorldQueryHitTest } from "./MyWorldQueryHitTest";
const SIK = require("SpectaclesInteractionKit.lspkg/SIK").SIK
const EPSILON = 0.01

@component
export class SpawnOnFloor extends BaseScriptComponent {
    @input
    worldHitTest: MyWorldQueryHitTest
    registration: MyWorldQueryHitSubscriberRegistration

    @input
    targetObject: SceneObject

    onAwake() {
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this))
        this.createEvent("OnEnableEvent").bind(this.onEnable.bind(this))
        this.createEvent("OnDisableEvent").bind(this.onDisable.bind(this))
        this.registration = new MyWorldQueryHitSubscriberRegistration(true, false, false, this.onHit.bind(this))
    }

    onEnable() {
        if (this.worldHitTest != null) {
            console.log("Register SpawnOnFloor")
            this.worldHitTest.register(this.registration)
        }
    }

    onDisable() {
        if (this.worldHitTest != null) {
            console.log("Unregister SpawnOnFloor and scale to 0")
            this.worldHitTest.unregister(this.registration)
            this.targetObject.getTransform().setWorldScale(vec3.zero())
        }
    }

    onUpdate() {
    }

    onHit(results: MyWorldQueryHitResult) {
        if (results == null) {
        } else {
            this.spawnObject(results)
        }
    }

    spawnObject(results: MyWorldQueryHitResult) {
        var tr = this.targetObject.getTransform()
        tr.setWorldPosition(results.currentHitPosition)
        tr.setWorldRotation(results.currentHitRotationParrallelToGround)
        LSTween.scaleFromToLocal(this.targetObject.getTransform(), vec3.zero(), vec3.one(), 2000).easing(Easing.Elastic.InOut).start()
        this.targetObject.enabled = true
        if (this.worldHitTest != null) {
            console.log("Unregister SpawnOnFloor")
            this.worldHitTest.unregister(this.registration)
        }
    }
}
