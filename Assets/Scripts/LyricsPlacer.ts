@component
export class LyricsPlacer extends BaseScriptComponent {

    @input
    private Thinking:SceneObject = undefined
    @input
    private Singing:SceneObject = undefined
    @input
    private Floor:SceneObject = undefined
    @input
    private Wall:SceneObject = undefined
    @input
    private Signage:SceneObject = undefined
    @input
    private Sky:SceneObject = undefined
    
    onAwake() {

    }
}
