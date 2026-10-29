import type { StudyLessonScene } from '@workspace/api-client-react';
import { drawWaterCycle } from './scenes/water-cycle';
import { drawPlantGrowth } from './scenes/plant-growth';
import { drawFraction } from './scenes/fraction';
import { drawReactionWater } from './scenes/reaction-water';

export type Visual =
  | { kind: 'general'; notice?: string }
  | { kind: 'water-cycle' | 'plant-growth' | 'reaction-water' }
  | { kind: 'fraction'; numerator: number; denominator: number };

export const VISUAL_LABELS: Record<Visual['kind'], string> = {
  general: 'Concept diagram',
  'water-cycle': 'Water cycle illustration',
  'plant-growth': 'Seed germination illustration',
  fraction: 'Fraction model',
  'reaction-water': 'Water-formation reaction model',
};

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);

/** Resolves a scene's specialised illustration safely. Unknown or missing => general. */
export function resolveVisual(scene: StudyLessonScene | undefined): Visual {
  const a = scene?.animation;
  const kind = a?.illustration;
  if (!kind || kind === 'general') return { kind: 'general' };
  if (kind === 'water-cycle' || kind === 'plant-growth' || kind === 'reaction-water') return { kind };
  if (kind === 'fraction') {
    const f = a?.fraction;
    if (f && isInt(f.numerator) && isInt(f.denominator) && f.denominator >= 1 && f.denominator <= 12 && f.numerator >= 0 && f.numerator <= f.denominator) {
      return { kind: 'fraction', numerator: f.numerator, denominator: f.denominator };
    }
    return { kind: 'general', notice: 'This scene\u2019s saved fraction values are missing or invalid, so a general diagram is shown instead of a fraction model.' };
  }
  return { kind: 'general' };
}

export function drawVisual(c: CanvasRenderingContext2D, v: Visual, t: number, duration: number) {
  if (v.kind === 'water-cycle') drawWaterCycle(c, t, duration);
  else if (v.kind === 'plant-growth') drawPlantGrowth(c, t, duration);
  else if (v.kind === 'reaction-water') drawReactionWater(c, t, duration);
  else if (v.kind === 'fraction') drawFraction(c, t, duration, v.numerator, v.denominator);
}
