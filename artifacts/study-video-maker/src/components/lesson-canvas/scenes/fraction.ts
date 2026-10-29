import { P, R, clamp01, ease, frame, note, stage, tag } from './common';

/** Equal-parts fraction: circle split into `den` equal sectors, `num` highlighted one by one. */
export function drawFraction(c: CanvasRenderingContext2D, t: number, duration: number, num: number, den: number) {
  const p = t / Math.max(1, duration);
  const split = stage(p, 0.04, 0.16);
  const fillStage = stage(p, 0.24, 0.42);
  const shown = num === 0 ? 0 : Math.min(num, Math.floor(fillStage * num + 0.0001) + (fillStage > 0 ? 1 : 0));
  const finalK = stage(p, 0.68, 0.1);
  frame(c, 'rgba(244,242,232,.06)');

  const cx = 380; const cy = 372; const r = 165;
  c.save();
  // whole circle
  c.fillStyle = 'rgba(244,242,232,.10)'; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < den; i += 1) {
    const a0 = -Math.PI / 2 + (i / den) * Math.PI * 2; const a1 = a0 + (Math.PI * 2) / den;
    const lit = i < shown;
    const fresh = lit && i === shown - 1 && fillStage < 1 ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
    const mid = (a0 + a1) / 2; const pop = lit ? 6 + fresh * 6 : 0;
    c.save(); c.translate(Math.cos(mid) * pop, Math.sin(mid) * pop);
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a1); c.closePath();
    c.fillStyle = lit ? P.gold : 'rgba(244,242,232,.08)'; c.fill();
    c.strokeStyle = P.cream; c.globalAlpha = 0.25 + 0.75 * ease(split); c.lineWidth = 3; c.stroke(); c.globalAlpha = 1;
    if (lit && den <= 12) {
      c.fillStyle = P.ink; c.font = '800 18px Manrope, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(String(i + 1), cx + Math.cos(mid) * r * 0.68, cy + Math.sin(mid) * r * 0.68);
    }
    c.restore();
  }
  c.strokeStyle = P.cream; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.restore();

  // Bar model under explanation
  const bx = 640; const by = 470; const bw = 520; const bh = 44; const cell = bw / den;
  for (let i = 0; i < den; i += 1) {
    c.fillStyle = i < shown ? P.gold : 'rgba(244,242,232,.1)';
    c.globalAlpha = ease(split); c.fillRect(bx + i * cell + 2, by, cell - 4, bh);
  }
  c.globalAlpha = 1; c.strokeStyle = P.cream; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);

  // Big numeric fraction (always the exact values)
  c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const fx = 720;
  c.fillStyle = P.gold; c.font = '800 76px Manrope, sans-serif'; c.fillText(String(num), fx, 270);
  c.fillStyle = P.cream; c.fillRect(fx - 60, 290, 120, 6);
  c.font = '800 76px Manrope, sans-serif'; c.fillText(String(den), fx, 372);
  c.textAlign = 'left'; c.font = '700 20px "DM Sans", sans-serif';
  c.fillStyle = P.gold; c.fillText(`numerator: ${num} part${num === 1 ? '' : 's'} counted`, 820, 252);
  c.fillStyle = P.cream; c.fillText(`denominator: ${den} equal part${den === 1 ? '' : 's'}`, 820, 352);
  c.restore();

  const counter = `${shown} of ${den} equal parts shaded`;
  tag(c, counter, bx + bw / 2, 425, ease(split), P.gold);
  let meaning = `Every part is the same size, so ${num}/${den} means ${num} of ${den} equal parts.`;
  if (num === 0) meaning = `No parts shaded: 0/${den} equals 0.`;
  else if (num === den) meaning = `All ${den} parts shaded: ${num}/${den} is one whole.`;
  note(c, meaning, bx, 540, clamp01(finalK));
}
