import { P, R, arrow, clamp01, ease, easeInOut, frame, lerp, note, stage, tag } from './common';

type A = { el: 'H' | 'O'; from: [number, number]; mid: [number, number]; to: [number, number] };

// Six atoms conserved: 4 H, 2 O. Same objects move from reactants to products.
const ATOMS: A[] = [
  { el: 'H', from: [230, 300], mid: [520, 260], to: [850, 300] },
  { el: 'H', from: [300, 300], mid: [560, 330], to: [960, 300] },
  { el: 'H', from: [230, 450], mid: [520, 470], to: [850, 470] },
  { el: 'H', from: [300, 450], mid: [580, 420], to: [960, 470] },
  { el: 'O', from: [430, 340], mid: [660, 300], to: [905, 360] },
  { el: 'O', from: [430, 420], mid: [660, 440], to: [905, 530] },
];
const OLD_BONDS: [number, number, number][] = [[0, 1, 1], [2, 3, 1], [4, 5, 2]];
const NEW_BONDS: [number, number][] = [[4, 0], [4, 1], [5, 2], [5, 3]];
const COL = { H: '#f4f2e8', O: '#ef8968' };

export function drawReactionWater(c: CanvasRenderingContext2D, t: number, duration: number) {
  const p = t / Math.max(1, duration);
  const sIntro = stage(p, 0.02, 0.12);
  const sBreak = stage(p, 0.3, 0.14);
  const sJoin = stage(p, 0.46, 0.2);
  frame(c, 'rgba(244,242,232,.06)');

  // Equation strip
  c.save(); c.textAlign = 'center'; c.font = '800 30px Manrope, sans-serif'; c.fillStyle = P.cream; c.globalAlpha = ease(sIntro);
  c.fillText('2 H\u2082  +  O\u2082   \u2192   2 H\u2082O', 640, 212); c.restore();

  const pos = ATOMS.map((a) => {
    const k1 = easeInOut(sBreak); const k2 = easeInOut(sJoin);
    const wob = Math.sin(t * 2 + a.from[0]) * 3 * (1 - k2 * 0.6);
    const x = sJoin > 0 ? lerp(a.mid[0], a.to[0], k2) : lerp(a.from[0], a.mid[0], k1);
    const y = sJoin > 0 ? lerp(a.mid[1], a.to[1], k2) : lerp(a.from[1], a.mid[1], k1);
    return [x, y + wob] as [number, number];
  });

  const bond = (i: number, j: number, alpha: number, order = 1) => {
    if (alpha <= 0) return;
    const [x1, y1] = pos[i]; const [x2, y2] = pos[j]; const ang = Math.atan2(y2 - y1, x2 - x1); const nx = -Math.sin(ang) * 5; const ny = Math.cos(ang) * 5;
    c.save(); c.globalAlpha = clamp01(alpha); c.strokeStyle = P.gold; c.lineWidth = 6; c.lineCap = 'round';
    const offs = order === 2 ? [-1, 1] : [0];
    offs.forEach((o) => { c.beginPath(); c.moveTo(x1 + nx * o, y1 + ny * o); c.lineTo(x2 + nx * o, y2 + ny * o); c.stroke(); });
    c.restore();
  };
  OLD_BONDS.forEach(([i, j, o]) => bond(i, j, ease(sIntro) * (1 - ease(sBreak * 1.4)), o));
  NEW_BONDS.forEach(([i, j]) => bond(i, j, ease((sJoin - 0.6) / 0.4)));

  ATOMS.forEach((a, i) => {
    const [x, y] = pos[i]; const r = a.el === 'O' ? 34 : 24;
    c.save(); c.globalAlpha = ease((t - 0.2 - i * 0.12) / 0.6);
    c.fillStyle = COL[a.el]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = P.ink; c.lineWidth = 3; c.stroke();
    c.fillStyle = P.ink; c.font = `800 ${a.el === 'O' ? 26 : 20}px Manrope, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(a.el, x, y + 1);
    c.restore();
  });

  const reactA = ease(sIntro) * (1 - ease(sBreak));
  tag(c, '2 H\u2082 molecules', 265, 535, reactA, P.cream);
  tag(c, '1 O\u2082 molecule', 450, 260, reactA, P.coral);
  tag(c, 'Bonds break', 600, 540, sBreak * (1 - ease(sJoin)), P.gold, 1);
  tag(c, 'Atoms rearrange', 600, 540, ease(sJoin) * (1 - stage(p, 0.7, 0.05)), P.gold, 2);
  tag(c, '2 H\u2082O molecules', 1080, 400, stage(p, 0.66, 0.08), P.sage, 3);
  arrow(c, 560, 380, 760, 400, P.mist, ease(sJoin) * 0.5, t);

  // Legend and conservation
  const lg = ease(sIntro);
  c.save(); c.globalAlpha = lg; c.fillStyle = 'rgba(14,38,36,.8)'; c.beginPath(); c.roundRect(R.x + 18, R.y + 16, 230, 64, 12); c.fill();
  c.font = '700 16px "DM Sans", sans-serif'; c.textBaseline = 'middle';
  c.fillStyle = COL.H; c.beginPath(); c.arc(R.x + 40, R.y + 36, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = P.cream; c.fillText('H  hydrogen atom', R.x + 58, R.y + 37);
  c.fillStyle = COL.O; c.beginPath(); c.arc(R.x + 40, R.y + 60, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = P.cream; c.fillText('O  oxygen atom', R.x + 58, R.y + 61);
  c.restore();
  note(c, 'Atoms are conserved: 4 H and 2 O before, 4 H and 2 O after.', 1190, R.y + 40, ease(stage(p, 0.72, 0.08)), 'right');
  note(c, 'Schematic model only, not lab instructions.', 1190, R.y + R.h - 18, lg * 0.8, 'right');
}
