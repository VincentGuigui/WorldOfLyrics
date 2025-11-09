export class Pose {
    private _rotation: quat;
    private _position: vec3;
    
    constructor(rotation: quat, position: vec3) {
        this._rotation = rotation;
        this._position = position;
    }
    
    public get rotation(): quat {
        return this._rotation;
    }
    
    public get position(): vec3 {
        return this._position;
    }
    
    public set rotation(value: quat) {
        this._rotation = value;
    }
    
    public set position(value: vec3) {
        this._position = value;
    }

    public static fromTransform(transform: Transform): Pose {
        return new Pose(transform.getWorldRotation(), transform.getWorldPosition());
    }
}