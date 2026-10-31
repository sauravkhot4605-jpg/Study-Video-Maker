---
name: Animation clock boundaries
description: A browser timing boundary that can crash lesson previews on their first frame.
---

Clamp animation time deltas and timeline-derived array indices to nonnegative values.

**Why:** A queued requestAnimationFrame timestamp can predate a performance.now() value captured during initialization. A negative first-frame delta caused an invalid caption index and stopped the preview.

**How to apply:** Treat the first frame and exact timeline boundaries as valid inputs whenever changing lesson preview or export timing; do not assume elapsed time is positive.

When AI narration is enabled, use decoded audio duration and the audio clock for scene progression, including caption and illustration timing. Do not apply the silent-preview scene-duration cap to spoken lessons.

**Why:** Speech length varies, and a word-count estimate or fixed cap can cut off narration or make the video drift away from the voice.

**How to apply:** Include the audio track in exported recordings, preserve the last spoken word, and report audio-generation failures instead of silently producing a voice-enabled video without speech.

Treat narration-text cue positions as approximate teaching-step timing, not word-level audio alignment.

**Why:** Character positions estimate reading progress but generated speech can pause or vary its pace. Seeking before audio is prepared also starts with an estimated duration.

**How to apply:** Preserve normalized step positions until the actual audio duration is known, and use real audio timestamps if promising exact spoken-word synchronization.

When a saved lesson gains scenes, extend its narration cache and invalidate previously rendered video; prepare independent scene voice clips with a bounded parallel worker pool.

**Why:** The user wants narration and animation together without a long wait; an old cache or export can omit newly added scenes, while unbounded audio requests can overload the service.

**How to apply:** Keep the scene timeline tied to decoded audio, generate voice clips in small batches, and refresh cached audio and downloads when lesson content changes.
