## Quick orientation — WorldOfLyrics (Lens Studio)

This repo is a Snapchat Lens Studio project (open `WorldOfLyrics.esproj`). Key assets live under `Assets/`.

High level
- Lens Studio project: the editor is Lens Studio (no single-node build pipeline). Edit assets/scripts and open the project in Lens Studio for live preview.
- Assets partitioning: `Assets/Scripts/` (ts/js controllers), `Assets/Music/` (audio, .lrc/.srt/transcripts, Musics.json), `Assets/UI/` (button images), `Assets/Materials/` and `Scene.scene` (scene layout).
- Lens packages: `Packages/` contains `SpectaclesInteractionKit.lspkg` and `SpectaclesUIKit.lspkg` — these are Lens Studio packages, not npm modules.

Important code flows & examples (search these names when editing):
- Music + UI controller: `Assets/Scripts/ReadLRC.js` is the main lyrics controller. It implements `parseEnhancedLRC(lrc)` which returns a sorted array of {time, text} used to render lyrics frames.
  - Example: controller advances `currentLyricIndex` and shows `script.lyricsText.text` (see `updateLyricDisplay()` in `ReadLRC.js`).
- Audio / toggle: `Assets/Scripts/PlayMusic.ts` creates an `AudioComponent` and exposes `playPause()`, `next()`, `previous()` and `updateCoverFlow()` methods. It uses `ToggleButton` from the SpectaclesInteractionKit.
- Cover list source: `Assets/Music/Musics.json` and the hardcoded `musicsList` arrays in `PlayMusic.ts` / `ReadMusicsList.js` drive cover images and titles. Update `Musics.json` (or the arrays) when adding tracks.
- Hand-follow UI: `Assets/Scripts/HandFollower.ts` uses `SpectaclesInteractionKit` hand providers (HandInputData, TrackedHand). Look for `tryShowHandMenu(...)` and `VectorUtils.scalar3(...)` to understand placement/rotation logic.

Project-specific conventions
- Mixed TS and JS: both `.ts` and `.js` scripts are present. Lens Studio runs JavaScript assets. Edit `.js` files for instant behavior in Lens Studio. If you change `.ts`, transpile to `.js` (the repo includes `tsconfig.json` but no npm scripts).
  - Typical flow: `ts -> tsc` produces JS output; if you don't have a local toolchain, open the `.ts` in an editor and copy the compiled JS into the `.js` controller file used by Lens Studio.
- UI wiring: Scene objects reference Script Components in the inspector. Many scripts expect `@input` references (see top of `ReadLRC.js` and `PlayMusic.ts`). When changing inputs, update the Scene in Lens Studio.

Developer workflows (how to build/test/debug)
- Open project: Launch Lens Studio, choose `Open Project` and open `WorldOfLyrics.esproj` or the project folder.
- Run & debug: Use Lens Studio Preview window or send to device via the Lens Studio “Preview on Device” workflow. Use the Lens Studio Console (or `print` / `console.log`) to inspect logs.
- TypeScript: If you want to compile `.ts` files locally, install TypeScript and run the compiler with the included config. Example (optional):
  - Install locally: `npm install --save-dev typescript` (if you add package.json)
  - Compile: `npx tsc -p tsconfig.json`
  - Then copy/sync the resulting `.js` into `Assets/Scripts/` if necessary (Lens Studio reads the JS file).
- No automated tests: there are no unit test harnesses in the repo. Manual verification is done inside Lens Studio.

Integration points & gotchas
- Lens Studio packages: `Packages/*.lspkg` must remain available to Lens Studio. Do not try to treat them as npm packages.
- Audio behavior: `PlayMusic.ts` sets `Audio.PlaybackMode.LowLatency` and creates an `AudioComponent` at runtime. Changing audio routing or component lifecycle can affect playback on different devices.
- Lyrics parsing: `ReadLRC.js` contains a custom, tolerant parser `parseEnhancedLRC()` that supports multiple timestamp formats and inline timestamps — prefer reusing it for lyric-related changes rather than replacing with a naive parser.
- UI geometry: HandFollower uses tracked hand knuckle transforms. When moving UI or changing anchor points, verify the `angle` check and world position math in `tryShowHandMenu()`.

What to look for when changing behavior
- If you change inputs (`@input`) or component names, re-open Lens Studio and rewire the ScriptComponent properties in the Scene — missing inputs are the most common runtime issue.
- When adding new music tracks: add audio files under `Assets/Music/`, add metadata (cover image) and update `Musics.json` or the in-script `musicsList`.
- Prefer minimal changes to `Scene.scene` in the editor. If you need structural scene edits, document them in a small CHANGELOG entry.

If anything in this file is unclear or you want more details (example: exact tsc output path, preferred TypeScript -> JS copy workflow, or a short example of wiring the Play button in the Scene), tell me which part to expand and I will update this file.

References (quick links inside the repo):
- `Assets/Scripts/ReadLRC.js` — lyrics parsing & main controller
- `Assets/Scripts/PlayMusic.ts` — audio component + UI hooks
- `Assets/Scripts/ReadMusicsList.js` — simple cover-list helper
- `Assets/Scripts/HandFollower.ts`, `Assets/Scripts/VectorUtils.ts` — hand follow behaviour
- `WorldOfLyrics.esproj` — Lens Studio project file

#mention read all the typescripts and markdown files in the folder C:\dev_factory\XR\Snapchat\Spectacles-Sample