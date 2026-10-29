---
name: Animation clock boundaries
description: A browser timing boundary that can crash lesson previews on their first frame.
---

Clamp animation time deltas and timeline-derived array indices to nonnegative values.

**Why:** A queued requestAnimationFrame timestamp can predate a performance.now() value captured during initialization. A negative first-frame delta caused an invalid caption index and stopped the preview.

**How to apply:** Treat the first frame and exact timeline boundaries as valid inputs whenever changing lesson preview or export timing; do not assume elapsed time is positive.
