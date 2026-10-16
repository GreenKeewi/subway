# Borough Line

A self-contained, keyboard-first 3D subway driving game. Drive a fictional NYC-inspired local from Canal Street through the Bowery tunnel, up to the East River elevated line and Queens Terminal. No backend, account, CDN, microphone or camera.

## Play

Serve this directory as static files (`python3 -m http.server 8203`) and open `http://localhost:8203/`. ES modules need an HTTP server. The published project uses GitHub Pages.

- **Up / W:** advance the combined power/brake handle toward power.
- **Down / S:** move the handle through coast into brake.
- **Space:** emergency brake.
- **D:** open/close the platform-side doors. **Q / E:** left/right door request; the safety interlock refuses the wrong side.
- **A:** optional driving assist. Any driving key overrides it.
- **C:** cab/exterior view. **M:** sound. **H:** help. **P / Escape:** pause.
- **R:** recover to the next platform after a missed stop; applies a score penalty.
- **Tab / Shift+Tab / Enter:** all menus and navigation. Every game screen includes a keyboard-accessible All games link.

Stop at the orange marker, open doors, allow at least four seconds for boarding, then close to continue. A red signal protects the tunnel exit: stop and wait six seconds for the route to clear. The five-stop service takes approximately five minutes with driving assist. The timetable is forgiving and does not end the service for being late.

## Architecture and verification

`sim.js` is a deterministic pure simulation with no rendering dependency. `main.js` provides the Three.js scene, DOM HUD/menu controls, synthesized motor sound, and a fixed 60Hz simulation loop. Static scenery is merged by material and spatial section. Three.js r180 and its utility are vendored locally under the included MIT license. All graphics/textures are procedural and original.

Run `npm test` for the simulation checks. `node tests/browser-smoke.cjs` runs a real Chromium smoke flow using Playwright when installed, and writes screenshots under `evidence/`.

`window.__subway` exposes state, simulation and deterministic advance hooks for browser QA. These local debug hooks are single-player only. Screenshots taken using state setup are evidence of the live renderer and interface, not a claim that the whole trip was driven manually.

This is an approachable arcade simulation, not an operational rail training tool. The route, stations, liveries and signal logic are fictional.
