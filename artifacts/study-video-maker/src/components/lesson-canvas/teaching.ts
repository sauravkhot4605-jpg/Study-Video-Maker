import type { StudyLessonScene, StudyTeachingStep } from '@workspace/api-client-react';

export type TeachingState = {
  steps: StudyTeachingStep[];
  starts: number[];
  index: number;
  step: StudyTeachingStep;
  progress: number;
  visualProgress: number;
};
const cache = new WeakMap<StudyLessonScene, { steps: StudyTeachingStep[]; starts: number[] }>();

function planFor(scene: StudyLessonScene) {
  const cached = cache.get(scene);
  if (cached) return cached;
  const nodes = scene.animation?.nodes ?? [];
  const supplied = scene.animation?.teachingSteps;
  const steps: StudyTeachingStep[] = supplied?.length
    ? supplied.slice(0, 5)
    : nodes.map((node, nodeIndex) => ({
      title: node.label,
      detail: scene.animation?.caption || scene.visualCue,
      nodeIndex,
      narrationCue: '',
    }));
  if (!steps.length) steps.push({ title: scene.title, detail: scene.visualCue, nodeIndex: 0, narrationCue: '' });
  const narration = scene.narration.toLocaleLowerCase();
  let previousPosition = -1;
  const positions = steps.map((step, index) => {
    if (index === 0) return 0;
    const cue = step.narrationCue.trim().toLocaleLowerCase();
    const position = cue ? narration.indexOf(cue, Math.max(0, previousPosition + 1)) : -1;
    if (position > previousPosition && position > 0) {
      previousPosition = position;
      return position / Math.max(1, narration.length);
    }
    return index / steps.length;
  });
  // Phrase positions estimate reading progress, not word-level forced alignment.
  // If cues are missing/out of order, use a predictable ordered teaching sequence.
  const valid = positions.every((p, i) => Number.isFinite(p) && p >= 0 && p < 1 && (!i || p > positions[i - 1]));
  const starts = valid ? positions : steps.map((_, i) => i / steps.length);
  const value = { steps, starts };
  cache.set(scene, value);
  return value;
}

export function teachingState(scene: StudyLessonScene, time: number, duration: number): TeachingState {
  const { steps, starts } = planFor(scene);
  const safeDuration = Number.isFinite(duration) ? Math.max(0.1, duration) : 0.1;
  const ratio = Math.max(0, Math.min(1, (Number.isFinite(time) ? time : 0) / safeDuration));
  let index = 0;
  while (index + 1 < starts.length && ratio >= starts[index + 1]) index += 1;
  const end = starts[index + 1] ?? 1;
  const progress = Math.max(0, Math.min(1, (ratio - starts[index]) / Math.max(0.001, end - starts[index])));
  return { steps, starts, index, step: steps[index], progress, visualProgress: (index + progress) / steps.length };
}
