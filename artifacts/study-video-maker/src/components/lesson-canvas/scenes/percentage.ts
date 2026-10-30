import type { TeachingState } from '../teaching';
import { P, clamp01, ease } from './common';

/** Deterministic percentage math, never trusting an AI-supplied answer. */
export function percentResult(base: number, rate: number) {
  const value = (base * rate) / 100;
  const rounded = value > 0 && value < 0.01 ? Number(value.toPrecision(3)) : Math.round(value * 100) / 100;
  const exact = Math.abs(value - rounded) <= Number.EPSILON * Math.max(1, Math.abs(value)) * 4;
  return { value, rounded, exact };
}

export function fmtNum(n: number) {
  return String(n);
}

function wrap(c: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []; let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (c.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

type Phase = 'whole' | 'rate' | 'result';
function phaseOf(s: TeachingState): { phase: Phase; k: number } {
  const n = s.steps.length; const last = n - 1;
  if (s.index === 0) return { phase: 'whole', k: s.progress };
  if (n >= 3) return s.index === last ? { phase: 'result', k: s.progress } : { phase: 'rate', k: (s.index - 1 + s.progress) / Math.max(1, last - 1) };
  return s.progress < 0.5 ? { phase: 'rate', k: s.progress * 2 } : { phase: 'result', k: (s.progress - 0.5) * 2 };
}

export function drawPercentage(c: CanvasRenderingContext2D, t: number, base: number, rate: number, s: TeachingState) {
  const { phase, k } = phaseOf(s);
  const shown = phase === 'whole' ? 0 : phase === 'rate' ? rate * ease(k * 1.4) : rate;
  const res = percentResult(base, rate);
  const intro = ease(t / 0.8);

  // Panel
  c.save(); c.globalAlpha = intro;
  c.fillStyle = 'rgba(14,38,36,.45)'; c.beginPath(); c.roundRect(70, 168, 1140, 404, 22); c.fill();

  // 10x10 grid
  const cell = 34; const gx = 110; const gy = 196;
  for (let i = 0; i < 100; i += 1) {
    const x = gx + (i % 10) * cell; const y = gy + Math.floor(i / 10) * cell;
    c.fillStyle = 'rgba(244,242,232,.08)'; c.fillRect(x + 2, y + 2, cell - 4, cell - 4);
    const fill = clamp01(shown - i);
    if (fill > 0) { c.fillStyle = P.coral; c.fillRect(x + 2, y + 2, (cell - 4) * fill, cell - 4); }
    c.strokeStyle = phase === 'whole' ? 'rgba(231,197,104,.55)' : 'rgba(195,217,202,.3)'; c.lineWidth = 1; c.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
  }
  c.strokeStyle = P.gold; c.lineWidth = phase === 'whole' ? 3 : 1.5; c.strokeRect(gx, gy, cell * 10, cell * 10);
  c.font = '700 17px "DM Sans", sans-serif'; c.fillStyle = P.mist; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillText('100 equal parts', gx + cell * 5, gy + cell * 10 + 26);

  // Right column
  const rx = 500; const rw = 680;
  // tracker
  s.steps.forEach((_, i) => {
    const x = rx + 14 + i * 34; const on = i === s.index; const done = i < s.index;
    c.fillStyle = on ? P.gold : done ? 'rgba(157,192,173,.8)' : 'rgba(244,242,232,.15)';
    c.beginPath(); c.arc(x, 210, 13, 0, Math.PI * 2); c.fill();
    c.fillStyle = on || done ? P.ink : P.cream; c.font = '800 14px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), x, 215);
  });
  c.textAlign = 'left';
  c.fillStyle = P.cream; c.font = '800 24px Manrope, sans-serif';
  wrap(c, s.step.title, rw).slice(0, 1).forEach((l) => c.fillText(l, rx, 258));
  c.fillStyle = P.mist; c.font = '500 18px "DM Sans", sans-serif';
  wrap(c, s.step.detail, rw).slice(0, 2).forEach((l, i) => c.fillText(l, rx, 286 + i * 24));

  // Facts rows
  const row = (y: number, label: string, value: string, color: string, alpha: number, big = false) => {
    if (alpha <= 0) return;
    c.save(); c.globalAlpha = intro * clamp01(alpha);
    c.fillStyle = 'rgba(14,38,36,.7)'; c.beginPath(); c.roundRect(rx, y, rw, big ? 62 : 48, 14); c.fill();
    c.strokeStyle = color; c.lineWidth = 2; c.stroke();
    c.fillStyle = P.mist; c.font = '700 16px "DM Sans", sans-serif'; c.textAlign = 'left'; c.fillText(label, rx + 18, y + (big ? 38 : 31));
    c.fillStyle = color; c.font = `800 ${big ? 28 : 22}px Manrope, sans-serif`; c.textAlign = 'right';
    c.fillText(value, rx + rw - 18, y + (big ? 41 : 32), rw - 220);
    c.restore();
  };
  row(340, 'The whole', fmtNum(base), P.gold, 1);
  row(396, 'Rate', `${fmtNum(rate)}%`, P.coral, phase === 'whole' ? 0.35 : 1);
  if (phase === 'result') {
    row(452, 'Formula', `${fmtNum(base)} × ${fmtNum(rate)} ÷ 100`, P.sage, ease(k * 3));
    const ans = `${res.exact ? '=' : '≈'} ${fmtNum(res.rounded)}`;
    row(506, 'Answer', ans, P.gold, ease(k * 3 - 0.8), true);
  }
  c.restore();
}
