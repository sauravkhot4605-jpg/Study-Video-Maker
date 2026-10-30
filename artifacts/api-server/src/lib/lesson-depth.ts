import type { StudyLesson } from "@workspace/api-zod";

export const lessonDepthInstructions = `
Teach for understanding, not just recall or a list of facts. Start with the smallest prerequisite the learner needs, define new terms before using them, and explain the mechanism or reasoning behind each important claim.
Across the spoken lesson, build a coherent sequence: foundations -> why/how -> worked example -> transfer or practice -> explained recap. In short lessons combine related stages into 3–4 scenes without dropping the reasoning. In longer lessons add meaningful comparisons, a second application, limitations and counterexamples, not repeated definitions or motivational filler.
For the worked example, state what is given and what is being asked, show each intermediate operation or inference, explain WHY each step is valid, then interpret and check the answer. Quantitative examples must have consistent arithmetic, units and assumptions. For history, civics or other conceptual subjects, use an evidence-based scenario or comparison rather than forcing a numerical problem.
Correct at least one plausible misconception with a concrete contrast. State the limits of any analogy, rule or simplified model. Do not turn correlation into causation or treat a simplified model as a complete account.
Include a transfer question with the reasoning behind its answer in the spoken narration. The explanation, worked example and misconception must be taught in the VIDEO, not only in the learning guide.
Return a complete learningGuide containing: learningObjectives (2–5 observable outcomes), prerequisites (0–5 brief reminders), whyItWorks (2–4 substantive causal/reasoning paragraphs), workedExample {question, steps:[{action,reason}] (2–6 justified steps), answer}, misconceptions:[{mistake,correction}] (1–3), and practiceQuestions:[{question,hint,answer,explanation}] (2–4, including one new application). Each practice explanation must justify the answer; do not merely repeat it. Keep guide examples and answers consistent with what is actually taught in the narration.
All guide values must use the selected lesson language. Example words/sentences for a language-learning lesson retain the language being studied.
For pasted or scanned source text, preserve its meaning and distinguish illustrative examples from facts in the source. If the text is too thin to support a broad explanation, narrow the objectives and state that limitation rather than inventing facts. Never invent references, official exam questions, current statistics, research findings or a claim that the lesson was fact-checked.
Before returning, check factual consistency, arithmetic, objective coverage, guide/narration agreement and that each animation depicts the relationship being explained.
`;

export function spokenWordTarget(duration: "short" | "standard" | "detailed") {
  return { short: "360–480", standard: "720–960", detailed: "1200–1440" }[duration];
}

export function narratedWordCount(lesson: StudyLesson) {
  return lesson.scenes.reduce((n, scene) => n + scene.narration.trim().split(/\s+/u).filter(Boolean).length, 0);
}

/** Structural depth guard, not a claim that AI-generated facts have been verified. */
export function lessonDepthIssues(lesson: StudyLesson, duration: "short" | "standard" | "detailed"): string[] {
  const issues: string[] = [];
  if (!lesson.learningGuide) issues.push("Include the complete learningGuide with justified worked steps, misconceptions and explained practice answers.");
  const words = narratedWordCount(lesson);
  const minimum = { short: 260, standard: 560, detailed: 950 }[duration];
  if (words < minimum) issues.push(`The spoken narration has only ${words} words. Expand it to at least ${minimum} words with reasoning, intermediate example steps, misconception correction and application. Do not add repetition, empty introductions or filler.`);
  if (lesson.scenes.some((scene) => !scene.animation?.teachingSteps?.length)) {
    issues.push("Include ordered teachingSteps in every scene, with verbatim narrationCue excerpts.");
  }
  return issues;
}
