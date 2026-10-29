import type { StudyLesson, StudyLessonScene, StudySceneAnimation } from '@workspace/api-client-react';
import { drawIcon } from './icons';
import { drawVisual, resolveVisual } from './illustration';

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

function layoutPoints(layout: Plan['layout'], n: number, t: number): Pt[] {
  const cx = 640; const cy = 360;
  if (layout === 'cycle') return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { x: cx + Math.cos(a) * 250, y: cy + Math.sin(a) * 130 }; });
  if (layout === 'orbit') {
    return Array.from({ length: n }, (_, i) => {
      if (i === 0) return { x: cx, y: cy };
      const a = t * 0.25 + ((i - 1) / (n - 1)) * Math.PI * 2;
      return { x: cx + Math.cos(a) * 300, y: cy + Math.sin(a) * 125 };
    });
  }
  if (layout === 'comparison') {
    const left = Math.ceil(n / 2);
    return Array.from({ length: n }, (_, i) => {
      const side = i < left ? 0 : 1; const idx = side ? i - left : i; const count = side ? n - left : left;
      return { x: side ? 920 : 360, y: cy + (idx - (count - 1) / 2) * 120 };
    });
  }
  const span = 960; const step = n > 1 ? span / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => ({ x: 160 + i * step, y: cy + Math.sin(t * 1.2 + i) * 6 + (i % 2 ? 22 : -22) }));
}

function drawConnector(c: CanvasRenderingContext2D, a: Pt, b: Pt, t: number, progress: number, curve: number, color: string) {
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * curve; const my = (a.y + b.y) / 2 + (b.x - a.x) * curve;
  const at = (k: number) => ({ x: (1 - k) ** 2 * a.x + 2 * (1 - k) * k * mx + k * k * b.x, y: (1 - k) ** 2 * a.y + 2 * (1 - k) * k * my + k * k * b.y });
  const startK = 0.2; const endK = 0.8; const drawn = startK + (endK - startK) * progress;
  c.save();
  c.strokeStyle = 'rgba(244,242,232,.35)'; c.lineWidth = 3; c.setLineDash([8, 10]); c.lineDashOffset = -t * 30;
  c.beginPath();
  for (let k = startK; k <= drawn; k += 0.02) { const p = at(k); if (k === startK) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); }
  c.stroke(); c.setLineDash([]);
  if (progress >= 1) {
    const tip = at(endK); const prev = at(endK - 0.03); const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    c.fillStyle = 'rgba(244,242,232,.6)'; c.beginPath(); c.moveTo(tip.x, tip.y); c.lineTo(tip.x - Math.cos(ang - 0.45) * 14, tip.y - Math.sin(ang - 0.45) * 14); c.lineTo(tip.x - Math.cos(ang + 0.45) * 14, tip.y - Math.sin(ang + 0.45) * 14); c.closePath(); c.fill();
    for (let i = 0; i < 3; i += 1) {
      const k = startK + (((t * 0.45 + i / 3) % 1) * (endK - startK));
      const p = at(k); c.fillStyle = color; c.globalAlpha = 0.9;
      c.beginPath(); c.arc(p.x, p.y, 5 + Math.sin(t * 4 + i) * 1.5, 0, Math.PI * 2); c.fill();
    }
  }
  c.restore();
}

function drawNode(c: CanvasRenderingContext2D, p: Pt, label: string, icon: Plan['nodes'][number]['icon'], color: string, appear: number, t: number, radius: number, active: boolean) {
  if (appear <= 0) return;
  const k = ease(appear);
  c.save(); c.globalAlpha = k; c.translate(p.x, p.y + (1 - k) * 30); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
  if (active) { c.strokeStyle = color; c.globalAlpha = k * (0.35 + 0.25 * Math.sin(t * 3)); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, radius + 14 + Math.sin(t * 3) * 4, 0, Math.PI * 2); c.stroke(); c.globalAlpha = k; }
  c.fillStyle = 'rgba(244,242,232,.1)'; c.beginPath(); c.arc(0, 0, radius, 0, Math.PI * 2); c.fill();
  c.strokeStyle = color; c.lineWidth = 2.5; c.stroke();
  drawIcon(c, icon, radius * 0.62, t, color);
  c.font = '700 20px Manrope, sans-serif'; c.textAlign = 'center'; c.fillStyle = C.cream;
  const lines = wrap(c, label, 200).slice(0, 2);
  lines.forEach((line, i) => {
    const w = c.measureText(line).width;
    c.fillStyle = 'rgba(23,60,58,.72)'; c.fillRect(-w / 2 - 8, radius + 14 + i * 24, w + 16, 24);
    c.fillStyle = C.cream; c.fillText(line, 0, radius + 32 + i * 24);
  });
  c.restore();
}

function drawDiagram(c: CanvasRenderingContext2D, plan: Plan, t: number, duration: number) {
  const n = plan.nodes.length;
  const stagger = Math.min(1.4, (duration * 0.45) / n);
  const reveal = (i: number) => (t - 0.5 - i * stagger) / 0.7;
  const pts = layoutPoints(plan.layout, n, t);
  const activeIdx = Math.floor((t / Math.max(1, duration)) * n) % n;
  const radius = n >= 5 ? 50 : 58;

  if (plan.layout === 'orbit') {
    c.save(); c.strokeStyle = 'rgba(195,217,202,.22)'; c.lineWidth = 2; c.setLineDash([4, 10]); c.lineDashOffset = t * 20;
    c.beginPath(); c.ellipse(640, 360, 300, 125, 0, 0, Math.PI * 2); c.stroke(); c.restore();
    for (let i = 0; i < 18; i += 1) {
      const p = (t * 0.35 + i / 18) % 1; const a = i * 2.4;
      c.fillStyle = NODE_COLORS[i % 5]; c.globalAlpha = (1 - p) * Math.min(1, ease(reveal(0)));
      c.beginPath(); c.arc(640 + Math.cos(a) * p * 280, 360 + Math.sin(a) * p * 120, 3, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    for (let i = 1; i < n; i += 1) drawConnector(c, pts[0], pts[i], t, ease(reveal(i)), 0, NODE_COLORS[i % 5]);
  } else if (plan.layout === 'comparison') {
    const left = Math.ceil(n / 2);
    c.save(); c.strokeStyle = 'rgba(244,242,232,.25)'; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(640, 190); c.lineTo(640, 540); c.stroke(); c.restore();
    c.save(); c.translate(640, 365); c.rotate(Math.sin(t * 1.1) * 0.08);
    c.fillStyle = C.gold; c.fillRect(-120, -3, 240, 6);
    c.beginPath(); c.arc(-120, 14, 14 + Math.sin(t * 1.1) * 3, 0, Math.PI * 2); c.arc(120, 14, 14 - Math.sin(t * 1.1) * 3, 0, Math.PI * 2); c.fill();
    c.restore();
    c.fillStyle = C.ink; c.beginPath(); c.arc(640, 365, 26, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 2; c.stroke();
    c.font = '800 18px Manrope, sans-serif'; c.textAlign = 'center'; c.fillStyle = C.gold; c.fillText('VS', 640, 371);
    for (let i = 0; i < left - 1; i += 1) drawConnector(c, pts[i], pts[i + 1], t, ease(reveal(i + 1)), 0.15, NODE_COLORS[i % 5]);
    for (let i = left; i < n - 1; i += 1) drawConnector(c, pts[i], pts[i + 1], t, ease(reveal(i + 1)), -0.15, NODE_COLORS[i % 5]);
  } else {
    const closed = plan.layout === 'cycle';
    const links = closed ? n : n - 1;
    for (let i = 0; i < links; i += 1) {
      const target = (i + 1) % n;
      drawConnector(c, pts[i], pts[target], t, ease(reveal(closed && target === 0 ? n - 0.2 : target)), closed ? 0.18 : 0.08, NODE_COLORS[i % 5]);
    }
    if (closed) {
      c.save(); c.translate(640, 360); c.rotate(t * 0.5); c.strokeStyle = 'rgba(231,197,104,.4)'; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, 34, 0, Math.PI * 1.5); c.stroke(); c.restore();
    }
  }
  plan.nodes.forEach((node, i) => drawNode(c, pts[i], node.label, node.icon, NODE_COLORS[i % 5], reveal(i), t + i, plan.layout === 'orbit' && i === 0 ? radius + 10 : radius, i === activeIdx && reveal(n - 1) > 1));
}

export type FrameInput = { lesson: StudyLesson; sceneIndex: number; sceneTime: number };

export function drawFrame(c: CanvasRenderingContext2D, { lesson, sceneIndex, sceneTime }: FrameInput) {
  const scene = lesson.scenes[sceneIndex] || lesson.scenes[0];
  const duration = sceneDuration(scene);
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
  if (visual.kind === 'general') drawDiagram(c, plan, t, duration);
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
