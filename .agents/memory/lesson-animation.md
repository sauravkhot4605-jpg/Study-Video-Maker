---
name: Lesson animation safety
description: Why generated lesson visuals use constrained animation plans rather than executable AI code.
---

Use validated, constrained animation plans for AI lesson visuals; do not execute JavaScript, HTML, or SVG supplied by the model.

**Why:** Students can supply arbitrary scanned or pasted material, which must remain untrusted. Structured plans allow topic-specific motion without turning study content into executable code.

**How to apply:** Extend the supported diagram vocabulary when richer visuals are needed, and keep the same renderer for preview and exported video so they do not diverge.

Specialized illustrations must match the actual concept and quantities in the narration; retain general diagrams for unsupported topics instead of forcing a loosely related illustration.

**Why:** A visually convincing but mismatched science or mathematics model can teach incorrect relationships. In particular, a fixed reaction model is not a general chemical-reaction simulator.

**How to apply:** Constrain template selection in the generation prompt, validate numerical parameters, and describe specialized models honestly.

Use schema-constrained AI output for lesson generation rather than relying on a prompt to preserve internal animation identifiers.

**Why:** During multilingual generation, prompt-only JSON output repeatedly produced unsupported icon identifiers even when instructed to keep enum values in English. Translate teaching content, not renderer identifiers.

**How to apply:** Keep strict structured-output constraints aligned with the API schema. Where strict output represents optional fields as null, normalize only those optional fields back to omission; retain meaningful nullable values such as absent key terms.
