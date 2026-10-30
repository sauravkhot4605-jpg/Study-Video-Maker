---
name: Learner intent and topic knowledge
description: Why lesson scope must be clarified and reviewed independently from a student's study stage.
---

Separate school/study stage, learning goal and self-reported topic knowledge. Do not assume an adult is advanced or a school student is new to a topic.

**Why:** The user reported that the app misunderstood what students wanted to learn and the level of knowledge to present.

**How to apply:** Ask for the goal, familiarity, specific focus and already-understood material. Treat these as self-reports, not a tested mastery score, and let students review the starting point, objectives and scope before video generation.

Ambiguity must be represented explicitly rather than relying only on a prompt saying “ask when unsure.”

**Why:** Live planning silently chose financial/simple interest for the bare topic “Interest,” despite an instruction to clarify ambiguous terms. A confident-looking plan was not evidence that the meaning had been established.

**How to apply:** Collect the meanings still possible after context/clarification and require student clarification while multiple meanings remain. Do not ask again about a meaning already resolved. Invalidate the plan when learning needs change, and use the same approved scope for narration and saved lesson context.

Keep planning and full lesson generation as separate explicit student actions.

**Why:** Students should be able to correct an unsuitable plan without accidentally generating a video or spending generation credits on the wrong lesson.

**How to apply:** Typed, scanned and syllabus inputs must share the intent-review flow; preserve the approved plan if generation fails so a retry does not require planning again.

The structured learning-plan request should use the reliable general-purpose model, not the compact model that previously returned empty replies.

**Why:** Repeated live requests using the compact model returned no structured content and took 26–50 seconds to fail; the general-purpose model returned a validated plan in about 5 seconds.

**How to apply:** Keep the learning-plan model aligned with the proven general-purpose generation model unless the replacement passes live response-schema and latency checks. When content is missing, log response metadata only, not learner input.
