---
name: Lesson animation safety
description: Why generated lesson visuals use constrained animation plans rather than executable AI code.
---

Use validated, constrained animation plans for AI lesson visuals; do not execute JavaScript, HTML, or SVG supplied by the model.

**Why:** Students can supply arbitrary scanned or pasted material, which must remain untrusted. Structured plans allow topic-specific motion without turning study content into executable code.

**How to apply:** Extend the supported diagram vocabulary when richer visuals are needed, and keep the same renderer for preview and exported video so they do not diverge.
