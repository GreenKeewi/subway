# Subway stop and bridge repair evidence — 2026-10-16 UTC

These tests use the local release source in cloud Chromium. Direct public-origin validation is blocked; see `public-browser.json` (`net::ERR_TUNNEL_CONNECTION_FAILED`) and `public-curl.txt` (CONNECT HTTP403 from Envoy). No proxy or browser-policy workaround was used. Exact Pages deployment success is checked separately after publication.

- `unit-final.txt`: 22 tests pass. Existing quick/full assisted service, all signals, manual guide, door safety, grades and low-frame-rate timing remain covered. New cases exercise Bowery at 648, 658, 659, 659.1 and 680 m with stationary/moving trains; assist stops or recovers rather than accelerating away. Manual recovery stays explicit. Metre/kilometre formatting is checked.
- Deck geometry tests raycast the top and underside at multiple offsets in every 80 m section, including grades and river spans. Adjacent chunks share exact edge vertices. Each support is ray-tested to meet the underside and its ground footing without a gap; river spans stay clear; underside bracing attaches within the frame.
- `repairs-browser.json`: normal-animation native-key fixtures verify stopped Bowery overshoots at 648/658 and braking/recovery beyond 659. All use declared initial train-state setup without simulation stepping. Essential text, countdown and BRAKE NOW cue fit at 1366×768, 1024×650, 683×384 and 390×844 after canvas resize settles. Coach text is at least 14 px; distance 30–34 px; braking action 16–17 px. The 683×384 ten-row result fixture retains replay, and native PageDown scrolls Help.
- Full-scene bridge captures show river, graded approach and canal crossings. For underside views only, the local browser harness exposes scene/renderer references through request instrumentation and uses a diagnostic camera. Production files are unmodified by that harness. Capture quality is locked to tier 0 for these geometry views. Exterior and HUD captures are actual rendered gameplay with declared position fixtures, not evidence of driving the whole route.
- `performance.json`: same 1730 m exterior fixture, cloud software renderer. Sharp view 408 calls / 172168 triangles; automatic quality 210 calls / 84602 triangles. Pausing produces zero GPU draws; viewport resize requests exactly one. These measurements do not establish physical Chromebook performance.
- `manual-full.json`: fresh native-key normal-animation Full Borough Line completed in 707.52 simulation / 707.45 wall seconds. All ten stops on marker, all three signals clear, 1500 points, 100% comfort, zero assist/recovery/overspeed/emergency/safety penalty/JavaScript errors. Native replay passed. `manual-complete.png` shows its actual result.
- `source-hashes.json`: SHA256 fingerprints of release runtime files.

Portable browser commands (Node, Playwright and Chromium required):

```sh
python3 -m http.server 8203 --bind 127.0.0.1
SUBWAY_URL=http://127.0.0.1:8203/ QA_OUTPUT_DIR=/tmp/subway-checks node tests/repairs-browser.cjs
SUBWAY_URL=http://127.0.0.1:8203/ QA_OUTPUT_DIR=/tmp/subway-checks node tests/manual-full.cjs
```

The manual script uses native digital keys and read-only guide telemetry at normal animation speed; it does not write train state, enable assist or step simulation. The long manual service exercises the repaired service simulation and HUD; final bridge/bracing and result typography are checked separately by the targeted browser fixture. No physical-device, speaker-listening or Wi-Fi claim is made.
