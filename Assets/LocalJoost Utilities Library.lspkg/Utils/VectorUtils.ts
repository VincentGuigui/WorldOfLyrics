export class VectorUtils {
    static scalar3(x: number): vec3 {
        return new vec3(x, x, x);
    }
        /**
     * Calculates the signed angle between two vectors around an axis
     * @param from Starting vector
     * @param to Target vector
     * @param axis Reference axis to determine sign
     * @returns Signed angle in degrees
     */
    public static getSignedAngle(from: vec3, to: vec3, axis: vec3): number {
        // Get the unsigned angle
        from = from.normalize();
        to = to.normalize();
        const unsignedAngle = Math.acos(Math.min(1, Math.max(-1, from.dot(to)))) * (180 / Math.PI);

        // Determine the sign using the cross product and axis
        const cross = from.cross(to);
        const sign = Math.sign(cross.dot(axis));

        return unsignedAngle * sign;
    }
}