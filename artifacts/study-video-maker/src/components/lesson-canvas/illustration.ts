import type { StudyLessonScene } from '@workspace/api-client-react';
import { drawWaterCycle } from './scenes/water-cycle';
import { drawPlantGrowth } from './scenes/plant-growth';
import { drawFraction } from './scenes/fraction';
import { drawReactionWater } from './scenes/reaction-water';
import { drawPercentage } from './scenes/percentage';
import type { TeachingState } from './teaching';

export type Visual =
  | { kind: 'general'; notice?: string }
  | { kind: 'water-cycle' | 'plant-growth' | 'reaction-water' }
  | { kind: 'fraction'; numerator: number; denominator: number }
  | { kind: 'percentage'; base: number; rate: number };

export const VISUAL_LABELS: Record<Visual['kind'], string> = {
  general: 'Concept diagram',
  'water-cycle': 'Water cycle illustration',
  'plant-growth': 'Seed germination illustration',
  fraction: 'Fraction model',
  percentage: 'Worked percentage example',
  'reaction-water': 'Water-formation reaction model',
};

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

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
  if (kind === 'percentage') {
    const p = a?.percentage;
    if (p && isNum(p.base) && isNum(p.rate) && p.base >= 0.01 && p.base <= 1e9 && p.rate >= 0 && p.rate <= 100) {
      return { kind: 'percentage', base: p.base, rate: p.rate };
    }
    return { kind: 'general', notice: 'This scene\u2019s saved percentage values are missing or invalid, so a general diagram is shown instead of a percentage model.' };
  }
  return { kind: 'general' };
}

export function drawVisual(c: CanvasRenderingContext2D, v: Visual, t: number, duration: number, state?: TeachingState) {
  if (v.kind === 'water-cycle') drawWaterCycle(c, t, duration);
  else if (v.kind === 'plant-growth') drawPlantGrowth(c, t, duration);
  else if (v.kind === 'reaction-water') drawReactionWater(c, t, duration);
  else if (v.kind === 'fraction') drawFraction(c, t, duration, v.numerator, v.denominator);
  else if (v.kind === 'percentage' && state) drawPercentage(c, t, v.base, v.rate, state);
}
