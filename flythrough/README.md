# Fly the Fair — scroll-scrubbed drone flythrough

Standalone promo page: as the visitor scrolls, a drone flight over the 2025 fair
plays forward/backward under their finger — one continuous take from the night
skyline through the midway, food rows, the lagoon, the rodeo, and back out to
the wheel, ending on a Get Tickets CTA.

Not linked from the site nav; shareable directly at
`https://quinto55.github.io/Coastal-Carolina-Fair-/flythrough/`.

## How it works

- `assets/scrub-engine.js` (vanilla JS, no dependencies) maps scroll position to
  `video.currentTime` across an ordered chain of clips, loading each clip as a
  Blob so scrubbing works on any static host (no byte-range support needed).
- Six **legs** are real DJI drone footage (1080p re-encodes, `crf 20`, GOP 8):

  | Leg | Source | Trim | Scene |
  |-----|--------|------|-------|
  | 1 | DJI_0455 | 15.0–25.0s | Skyline approach |
  | 2 | DJI_0453 | 23.0–34.0s | Midway sweep |
  | 3 | DJI_0453 | 34.0–40.0s | Games & food rows |
  | 4 | DJI_0449 | 44.5–55.5s | Lagoon & rides |
  | 5 | DJI_0460 | 2.0–12.0s (60→30fps) | Rodeo arena |
  | 6 | DJI_0458 | 0.0–10.0s | Finale skyline |

- Four **bridges** (`b12`, `b34`, `b45`, `b56`) are LTX-2.5 generations
  (`lightricks/ltx-2.5/image-to-video/fast` on fal, 1080p/24fps) conditioned on
  the *actual last frame* of one leg (`image_url`) and *actual first frame* of
  the next (`end_image_url`), so every seam is frame-locked. Legs 2→3 need no
  bridge — they're consecutive frames of one continuous take (`connectors[1] =
  null`).
- Bridges are **immersive FPV moves** (EMC drone-flight style), not high
  repositioning hops: b12 (10s) dives down *into* the midway between the ride
  towers; b34 (8s) skims low along the food-stall canopies; b45 (8s) races
  low across the fairground past tents and trailers; b56 (10s) arcs *around*
  the ferris wheel — spokes passing close — before pulling away to the finale
  skyline. `connScroll: 0.95` gives them scroll room.
- Bridge prompts must include: *"The view changes only through the camera's own
  continuous flight — no dissolve, no fade, no morphing"* — without it LTX
  cross-dissolves between distant endpoints instead of flying. Describe the
  intermediate content concretely (what sweeps beneath/beside the camera) to
  steer the flight path.
- b12, b45 and b56 are rendered on the **`/pro`** endpoint: the fast tier melts
  the ferris wheel's spoke geometry on close passes; pro keeps structures solid
  (keep the wheel at a middle distance and ask for "crisp, clean straight
  geometry"). b45's prompt ends with a slow, nearly stationary hover so the
  camera's velocity matches the real rodeo footage at the seam; `crossfade:
  0.18` widens the seam dissolve.

## Regenerating

1. Cut legs + extract seam frames: see trims above (ffmpeg `-ss/-t`, scale to
   1920×1080, `unsharp=5:5:0.4`, `-g 8 -sc_threshold 0 -movflags +faststart`).
2. Upload seam PNGs to fal storage, run LTX with the params above (~$1/bridge).
3. Re-encode bridge output with the same ffmpeg settings for uniform quality.
4. Posters in `assets/img/` are each leg's first frame (`-q:v 3` JPEG).

Preview locally: `python3 -m http.server` in this folder (blob loading makes
scrubbing work even without byte-range support).

## The film (`fly-the-fair.mp4`)

Standalone 96s hit-play version of the same flight (1080p24, AAC score). Not
referenced by any page — the site is unchanged. Assembly: the ten clips
concatenated at 24fps, 1s fade-in / 1.2s fade-out, title + end cards rendered
with PIL in Alfa Slab One (`card_title.png` / `card_end.png` overlays with
alpha fades), and an instrumental score generated with MiniMax Music 3 on fal
(~79s Americana folk take, splice-extended to 96s with a 3s acrossfade at
0:52→0:32 — verified inaudible), loudnorm -16 LUFS, 1.5s/4s audio fades.
