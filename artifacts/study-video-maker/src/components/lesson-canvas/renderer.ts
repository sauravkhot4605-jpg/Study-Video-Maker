import type { StudyLesson, StudyLessonScene, StudySceneAnimation } from '@workspace/api-client-react';
import { drawIcon } from './icons';
import { drawVisual, resolveVisual } from './illustration';
import { localizedContext } from './language';
import { teachingState, type TeachingState } from './teaching';

export const WIDTH = 1280;
export const HEIGHT = 720;

const C = { bg1: '#173c3a', bg2: '#285956', cream: '#f4f2e8', gold: '#e7c568', coral: '#ef8968', sage: '#9dc0ad', mist: '#c3d9ca', ink: '#173c3a' };
const NODE_COLORS = [C.gold, C.coral, C.sage, '#b9d4e3', '#e6b8d0'];

export function sceneDuration(scene: StudyLessonScene) {
  const words = scene.narration.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(6, Math.min(45, words / 2.5));
}

type Plan = StudySceneAnimation & { legacy: boolean };

export function scenePlan(scene: StudyLessonScene): Plan {
  if (scene.animation && scene.animation.nodes?.length >= 2) return { ...scene.animation, nodes: scene.animation.nodes.slice(0, 5), legacy: false };
  const nodes: StudySceneAnimation['nodes'] = [{ label: clip(scene.title, 28), icon: 'book' }];
  if (scene.keyTerm) nodes.push({ label: clip(scene.keyTerm, 28), icon: 'lightbulb' });
  nodes.push({ label: 'Understanding', icon: 'person' });
  return { layout: 'flow', nodes, caption: 'Generic concept steps. Regenerate this lesson for a topic-specific diagram.', legacy: true };
}

function clip(text: string, n: number) { return text.length > n ? `${text.slice(0, n - 1).trimEnd()}...` : text; }
const ease = (x: number) => { const k = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - k, 3); };

function wrap(c: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (c.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Splits narration into short caption chunks so the full narration is shown progressively. */
export function captionChunks(narration: string) {
  const words = narration.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 14) chunks.push(words.slice(i, i + 14).join(' '));
  return chunks.length ? chunks : [''];
}

type Pt = { x: number; y: number };

/** Fixed, time-independent geometry: no orbiting or bobbing. */
function layoutPoints(layout: Plan['layout'], n: number): Pt[] {
  const cx = 640; const cy = 380;
  if (layout === 'cycle') return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { x: cx + Math.cos(a) * 270, y: cy + Math.sin(a) * 95 }; });
  if (layout === 'orbit') {
    return Array.from({ length: n }, (_, i) => {
      if (i === 0) return { x: cx, y: cy };
      if (n <= 3) return { x: i === 1 ? 300 : 980, y: cy };
      const corners = [{ x: 300, y: 285 }, { x: 980, y: 285 }, { x: 980, y: 475 }, { x: 300, y: 475 }];
      return corners[i - 1];
    });
  }
  if (layout === 'comparison') {
    const left = Math.ceil(n / 2);
    return Array.from({ length: n }, (_, i) => {
      const side = i < left ? 0 : 1; const idx = side ? i - left : i; const count = side ? n - left : left;
      return { x: side ? 920 : 360, y: cy + (idx - (count - 1) / 2) * 112 };
    });
  }
  const span = 960; const step = n > 1 ? span / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => ({ x: 160 + i * step, y: cy - 10 + (i % 2 ? 18 : -18) }));
}

function drawArrow(c: CanvasRenderingContext2D, a: Pt, b: Pt, progress: number, curve: number, color: string, head: boolean) {
  if (progress <= 0) return;
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * curve; const my = (a.y + b.y) / 2 + (b.x - a.x) * curve;
  const at = (k: number) => ({ x: (1 - k) ** 2 * a.x + 2 * (1 - k) * k * mx + k * k * b.x, y: (1 - k) ** 2 * a.y + 2 * (1 - k) * k * my + k * k * b.y });
  const startK = 0.22; const endK = 0.78; const drawn = startK + (endK - startK) * progress;
  c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath();
  for (let k = startK; k <= drawn + 1e-6; k += 0.02) { const p = at(Math.min(k, drawn)); if (k === startK) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); }
  c.stroke();
  if (head && progress >= 1) {
    const tip = at(endK); const prev = at(endK - 0.03); const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    c.beginPath(); c.moveTo(tip.x, tip.y); c.lineTo(tip.x - Math.cos(ang - 0.45) * 14, tip.y - Math.sin(ang - 0.45) * 14); c.lineTo(tip.x - Math.cos(ang + 0.45) * 14, tip.y - Math.sin(ang + 0.45) * 14); c.closePath(); c.fill();
  }
  c.restore();
}

function drawNode(c: CanvasRenderingContext2D, p: Pt, label: string, icon: Plan['nodes'][number]['icon'], color: string, appear: number, radius: number, state: 'current' | 'past' | 'idle', num: number, compact = false) {
  if (appear <= 0) return;
  const k = ease(appear);
  const dim = state === 'current' ? 1 : 0.5;
  c.save(); c.globalAlpha = k * dim; c.translate(p.x, p.y + (1 - k) * 20);
  if (state === 'current') { c.fillStyle = 'rgba(231,197,104,.16)'; c.beginPath(); c.arc(0, 0, radius + 12, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, radius + 12, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = state === 'current' ? 'rgba(244,242,232,.16)' : 'rgba(244,242,232,.07)'; c.beginPath(); c.arc(0, 0, radius, 0, Math.PI * 2); c.fill();
  c.strokeStyle = color; c.lineWidth = state === 'current' ? 3.5 : 2; c.stroke();
  drawIcon(c, icon, radius * 0.62, 0, color);
  c.fillStyle = state === 'current' ? C.gold : 'rgba(244,242,232,.4)'; c.beginPath(); c.arc(-radius * 0.72, -radius * 0.72, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = C.ink; c.font = '800 13px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(String(num), -radius * 0.72, -radius * 0.72 + 5);
  c.font = '700 19px Manrope, sans-serif';
  c.textAlign = compact ? 'left' : 'center';
  const lines = wrap(c, label, 210).slice(0, 2);
  lines.forEach((line, i) => {
    const w = c.measureText(line).width;
    const x = compact ? radius + 20 : 0;
    const y = compact ? -4 + i * 24 : radius + 28 + i * 24;
    c.fillStyle = 'rgba(14,38,36,.85)'; c.fillRect(compact ? x - 8 : -w / 2 - 8, y - 18, w + 16, 24);
    c.fillStyle = C.cream; c.fillText(line, x, y);
  });
  c.restore();
}

/** Numbered sequence tracker + current step title/detail band (y 166..232). */
function drawStepBand(c: CanvasRenderingContext2D, st: TeachingState) {
  const n = st.steps.length;
  c.save();
  c.fillStyle = 'rgba(14,38,36,.55)'; c.beginPath(); c.roundRect(70, 166, 1140, 66, 16); c.fill();
  for (let i = 0; i < n; i += 1) {
    const x = 100 + i * 32; const on = i === st.index; const done = i < st.index;
    c.fillStyle = on ? C.gold : done ? 'rgba(157,192,173,.85)' : 'rgba(244,242,232,.15)';
    c.beginPath(); c.arc(x, 199, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = on || done ? C.ink : C.cream; c.font = '800 13px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), x, 204);
  }
  const tx = 100 + n * 32; const tw = 1190 - tx;
  c.textAlign = 'left'; c.fillStyle = C.cream; c.font = '800 21px Manrope, sans-serif';
  wrap(c, st.step.title, tw).slice(0, 1).forEach((l) => c.fillText(l, tx, 194));
  c.fillStyle = C.mist; c.font = '500 16px "DM Sans", sans-serif';
  const d = wrap(c, st.step.detail, tw);
  c.fillText(d.length > 1 ? `${d[0]}...` : d[0] ?? '', tx, 218);
  // in-step progress hairline
  c.fillStyle = 'rgba(231,197,104,.7)'; c.fillRect(tx, 226, tw * st.progress, 2);
  c.restore();
}

function drawDiagram(c: CanvasRenderingContext2D, plan: Plan, st: TeachingState, t: number, duration: number) {
  const n = plan.nodes.length;
  const clampIdx = (i: number) => Math.max(0, Math.min(n - 1, Math.round(Number.isFinite(i) ? i : 0)));
  // Reveal time (seconds) per node: first teaching step that focuses it; else proportional.
  const revealAt = plan.nodes.map((_, i) => {
    const s = st.steps.findIndex((step) => clampIdx(step.nodeIndex) === i);
    return s >= 0 ? st.starts[s] * duration : (i / n) * duration * 0.9;
  });
  revealAt[0] = Math.min(revealAt[0], 0);
  const current = clampIdx(st.step.nodeIndex);
  // A reviewed step is paused just after its cue. Its teaching node must already
  // be visible there, rather than waiting for a delayed entrance animation.
  const reveal = (i: number) => t < revealAt[i] ? 0 : 0.65 + (t - revealAt[i]) / 0.45;
  const pts = layoutPoints(plan.layout, n);
  const radius = n >= 5 ? 44 : 50;
  const line = 'rgba(244,242,232,.55)';

  if (plan.layout === 'orbit') {
    for (let i = 1; i < n; i += 1) drawArrow(c, pts[0], pts[i], ease(reveal(i)), 0, i === current ? C.gold : 'rgba(195,217,202,.4)', false);
  } else if (plan.layout === 'comparison') {
    c.save(); c.strokeStyle = 'rgba(244,242,232,.25)'; c.setLineDash([6, 8]); c.lineWidth = 2; c.beginPath(); c.moveTo(640, 250); c.lineTo(640, 500); c.stroke(); c.restore();
    c.fillStyle = C.ink; c.beginPath(); c.arc(640, 375, 24, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 2; c.stroke();
    c.font = '800 16px Manrope, sans-serif'; c.textAlign = 'center'; c.fillStyle = C.gold; c.fillText('VS', 640, 381);
  } else {
    const closed = plan.layout === 'cycle';
    const links = closed ? n : n - 1;
    for (let i = 0; i < links; i += 1) {
      const target = (i + 1) % n;
      const prog = closed && target === 0 ? ease(reveal(n - 1) - 1) : ease(reveal(target));
      drawArrow(c, pts[i], pts[target], prog, closed ? 0.18 : 0.06, target === current ? C.gold : line, true);
    }
  }
  plan.nodes.forEach((node, i) => drawNode(c, pts[i], node.label, node.icon, NODE_COLORS[i % 5], reveal(i), plan.layout === 'comparison' ? 32 : plan.layout === 'orbit' ? (i === 0 ? 50 : 40) : radius, i === current ? 'current' : revealAt[i] <= t ? 'past' : 'idle', i + 1, plan.layout === 'comparison'));
}

export type FrameInput = { lesson: StudyLesson; sceneIndex: number; sceneTime: number; durationOverride?: number };

export function drawFrame(c: CanvasRenderingContext2D, { lesson, sceneIndex, sceneTime, durationOverride }: FrameInput) {
  c = localizedContext(c, lesson.language);
  const scene = lesson.scenes[sceneIndex] || lesson.scenes[0];
  const duration = Math.max(0.1, durationOverride ?? sceneDuration(scene));
  const t = Math.max(0, Number.isFinite(sceneTime) ? sceneTime : 0);
  const g = c.createLinearGradient(0, 0, WIDTH, HEIGHT);
  g.addColorStop(0, C.bg1); g.addColorStop(1, C.bg2);
  c.fillStyle = g; c.fillRect(0, 0, WIDTH, HEIGHT);
  c.save(); c.globalAlpha = 0.08; c.strokeStyle = C.mist;
  for (let x = 40; x < WIDTH; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, HEIGHT); c.stroke(); }
  c.restore();

  const fade = ease(t / 0.6);
  c.save(); c.globalAlpha = fade; c.translate((1 - fade) * 40, 0);

  c.textAlign = 'left';
  c.fillStyle = C.mist; c.font = '700 15px "DM Sans", sans-serif';
  c.fillText(`STUDYLOOM  /  SCENE ${String(sceneIndex + 1).padStart(2, '0')} OF ${String(lesson.scenes.length).padStart(2, '0')}`, 70, 62);
  c.fillStyle = C.cream; c.font = '800 38px Manrope, sans-serif';
  wrap(c, scene.title, 1000).slice(0, 1).forEach((line) => c.fillText(line, 70, 112));

  const plan = scenePlan(scene);
  c.font = '600 18px "DM Sans", sans-serif'; c.fillStyle = plan.legacy ? C.coral : C.gold;
  const capLines = wrap(c, plan.caption, 1100).slice(0, 1);
  const capAlpha = ease((t - 1) / 0.8);
  c.globalAlpha = fade * capAlpha; capLines.forEach((line) => c.fillText(line, 70, 150)); c.globalAlpha = fade;

  const visual = resolveVisual(scene);
  if (visual.kind === 'general') {
    const st = teachingState(scene, t, duration);
    drawStepBand(c, st);
    drawDiagram(c, plan, st, t, duration);
    if (visual.notice) { c.font = '600 14px "DM Sans", sans-serif'; c.fillStyle = C.coral; c.textAlign = 'left'; wrap(c, visual.notice, 1100).slice(0, 1).forEach((l) => c.fillText(l, 70, 570)); }
  } else if (visual.kind === 'percentage') drawVisual(c, visual, t, duration, teachingState(scene, t, duration));
  else drawVisual(c, visual, t, duration);
  c.restore();

  // progressive captions
  const chunks = captionChunks(scene.narration);
  const idx = Math.max(0, Math.min(chunks.length - 1, Math.floor((t / duration) * chunks.length)));
  const local = (t / duration) * chunks.length - idx;
  c.save();
  c.font = '500 22px "DM Sans", sans-serif';
  const lines = wrap(c, chunks[idx], 1040).slice(0, 2);
  const boxH = 24 + lines.length * 30;
  c.fillStyle = 'rgba(14,38,36,.82)'; c.beginPath(); c.roundRect(90, 668 - boxH, 1100, boxH, 14); c.fill();
  c.globalAlpha = ease(local * 6);
  c.fillStyle = C.cream; c.textAlign = 'center';
  lines.forEach((line, i) => c.fillText(line, 640, 668 - boxH + 38 + i * 30));
  c.restore();

  const total = lesson.scenes.length;
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(90, 690, 1100, 4);
  c.fillStyle = C.gold; c.fillRect(90, 690, 1100 * ((sceneIndex + Math.min(1, t / duration)) / total), 4);
}
