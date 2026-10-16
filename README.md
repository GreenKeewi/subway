# Borough Line

A self-contained, keyboard-first 3D subway driving game. Choose the Quick Local (five stops, 2.8 km, about five minutes) or the Full Borough Line (ten stops, 7.1 km, about twelve minutes). Start below Canal Street, cross the East River, then continue through Museum Row and Jackson Square to Woodside Yard, Meadows Park and Astoria Quay. No backend, account, CDN, microphone or camera.

## Play

Serve this directory as static files (`python3 -m http.server 8203`) and open `http://localhost:8203/`. ES modules need an HTTP server. The published project uses GitHub Pages.

- **Up / W:** advance the combined power/brake handle toward power.
- **Down / S:** move the handle through coast into brake.
- **Z:** coast immediately. Releasing Up/Down holds the current handle setting.
- **Space:** emergency brake.
- **D:** open/close the platform-side doors. **Q / E:** left/right door request; the safety interlock refuses the wrong side.
- **A:** optional driving assist. Any driving key overrides it.
- **C:** cab/exterior view. **M:** sound. **H:** help. **P / Escape:** pause.
- **R:** recover to the next platform after a missed stop; applies a score penalty.
- **Tab / Shift+Tab / Enter:** all menus and navigation. Every game screen includes a keyboard-accessible All games link.

Stop at the orange marker, open doors, allow at least four seconds for boarding, then close to continue. A red signal protects the tunnel exit: stop and wait six seconds for the route to clear. The Quick Local finishes at Queens Terminal. The Full Borough Line continues to Astoria Quay and includes three protected signal stops. Choose a service using the native radio buttons before starting; arrow keys change the selected service when that control has focus. The full route and timetable are available in Help and Pause. The timetable is forgiving and does not end the service for being late.

## Architecture and verification

`sim.js` is a deterministic pure simulation with no rendering dependency. `main.js` provides the Three.js scene, DOM HUD/menu controls, synthesized motor sound, and a fixed 60Hz simulation loop that follows elapsed wall time down to 2 FPS. Longer stalls are capped at 30 simulation steps, and pause/restart reset the frame clock. Slow devices automatically lower resolution and view distance. Static scenery is merged by material and spatial section. Three.js r180 and its utility are vendored locally under the included MIT license. All graphics/textures are procedural and original.

Run `npm test` for the simulation checks. `node tests/browser-smoke.cjs` runs a real Chromium smoke flow using Playwright when installed, and writes screenshots under `evidence/`.

`window.__subway` exposes state, simulation and deterministic advance hooks for browser QA. These local debug hooks are single-player only. Screenshots taken using state setup are evidence of the live renderer and interface, not a claim that the whole trip was driven manually.

This is an approachable arcade simulation, not an operational rail training tool. The route, stations, liveries and signal logic are fictional.

## Polish verification

The driving guide shows speed-dependent braking cues, platform side, signal distance and a forgiving timetable. End-of-shift grades reward precise stops and passenger comfort, with separate local personal bests for manual and assisted runs. Ordinary service braking carries no comfort penalty; emergency braking and sustained overspeed do. All audio sources, including chimes, use one mute/pause master and one-shot nodes disconnect on completion.

Authored details include masonry blocks, fire escapes, rooftop water tanks, traffic/crosswalks, station maps/exits, a truss river crossing, and steel elevated supports. Fixed train parts are merged per car and moving doors are instanced. The renderer holds its last frame while paused or finished. Unsupported WebGL shows a keyboard-accessible recovery screen; GPU context loss pauses the train until restoration.

Independent normal-rAF keyboard tests completed an all-manual five-stop service in 285.98 simulation / 288.11 wall seconds, without assist, recovery or simulation-advance hooks; all stops, the red signal, and comfort grading passed. No physical Chromebook or hardware-speaker listening validation is claimed.

## Extended line verification

Both route lengths use the same service simulation, with route-specific station counts, grades and saved bests. The long route does not finish at the quick terminus. Its geography includes a second underground district, open storage yard with sidings and work trains, park/pond, canal crossing and arched waterfront terminal. Rail sleepers are instanced in 400 m sections; fixed scenery remains batched by material and 200 m spatial section. Speed restriction boards and advance coach warnings appear before lower limits.

`npm test` covers both service lengths, all three signals, restart, manual override, low-FPS timing, stop/door safety, grades, advance speed warnings and a keyboard-style controller following the precision guide. `tests/extended-browser.cjs` verifies native keyboard route selection and restart, renderer landmark fixtures, and deterministic full-route completion. `tests/ui-checks.cjs` checks short-screen keyboard navigation, help scrolling and both route details. `tests/performance-check.cjs` compares the same exterior fixture across render settings and checks that pause stops GPU draws while resize requests one refresh. Landmark screenshots use explicitly documented simulation setup and full-resolution capture; actual normal-rAF service evidence is reported separately by QA.

Independent normal-rAF full-line playtests completed every station and all three signals: manual driving took 718.92 simulation / 720.55 wall seconds, with ten stops on the marker, 1,500 points, 100% comfort and no assist, recovery, overspeed, safety penalty or JavaScript error. The assisted run took 700.10 simulation / 700.91 wall seconds with the same perfect-stop result. Full results keep the achievement and replay controls visible while the keyboard-focusable stop report scrolls independently. `tests/final-visual.cjs` checks that layout at 1024×600 and 683×384, native report scrolling/replay, and the raised yard chase fixture.

## Published independent full-service evidence

The latest independent normal-animation keyboard run completed the Full Borough Line in 717.17 simulation / 719.98 wall seconds: all ten stops on the marker, all three protected signals cleared, 1,500 points and 100% comfort. Assist stayed off; there was no recovery, safety penalty, overspeed, emergency brake or JavaScript error. The automated driver used native digital keys and read the production precision guide; it did not write train state or advance simulation time. The [published raw report](https://greenkeewi.github.io/games/verification/reports/current/subway-qa.json) identifies the tested runtime and method. This README update leaves the tested runtime unchanged. Live-origin cloud requests remain proxy-blocked; exact repository hashes and Pages jobs are separate evidence in the hub release manifest.
