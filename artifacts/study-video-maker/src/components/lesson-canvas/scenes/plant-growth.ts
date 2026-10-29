import { P, R, arrow, clipRegion, ease, frame, lerp, note, stage, sun, tag } from './common';

/** Germination sequence: seed cross-section in soil, roots, shoot, first leaves. Not photosynthesis. */
export function drawPlantGrowth(c: CanvasRenderingContext2D, t: number, duration: number) {
  const p = t / Math.max(1, duration);
  const sWater = stage(p, 0.04, 0.16); const sRoot = stage(p, 0.22, 0.2); const sShoot = stage(p, 0.42, 0.2); const sLeaf = stage(p, 0.62, 0.18);
  const ground = 360; const bottom = R.y + R.h;
  const sky = c.createLinearGradient(0, R.y, 0, ground); sky.addColorStop(0, '#3b7470'); sky.addColorStop(1, '#6aa196');
  frame(c, sky);
  c.save(); clipRegion(c);
  sun(c, 1100, 225, 30, t, 0.35 + 0.65 * ease(sShoot));

  // Soil cross-section with strata
  const soil = c.createLinearGradient(0, ground, 0, bottom); soil.addColorStop(0, '#6b4f3a'); soil.addColorStop(1, '#3f2e24');
  c.fillStyle = soil; c.fillRect(R.x, ground, R.w, bottom - ground);
  c.fillStyle = '#4f7f62'; c.fillRect(R.x, ground - 6, R.w, 10);
  c.fillStyle = 'rgba(244,242,232,.12)';
  for (let i = 0; i < 60; i += 1) { c.beginPath(); c.arc(R.x + ((i * 97) % R.w), ground + 20 + ((i * 53) % (bottom - ground - 30)), 2 + (i % 3), 0, Math.PI * 2); c.fill(); }

  // Rain/water seeping toward seed
  const sx = 640; const sy = 450;
  if (sWater > 0) {
    c.fillStyle = P.sky;
    for (let i = 0; i < 10; i += 1) {
      const k = (t * 0.45 + i / 10) % 1; const x = sx - 160 + (i % 5) * 80 + Math.sin(k * 6 + i) * 8; const y = lerp(ground + 8, sy - 10, k);
      const tx = lerp(x, sx, k * k);
      c.globalAlpha = sWater * Math.sin(k * Math.PI);
      c.beginPath(); c.ellipse(tx, y, 4, 6, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }

  // Roots
  if (sRoot > 0) {
    const r = ease(sRoot);
    c.strokeStyle = '#efe3c4'; c.lineCap = 'round';
    c.lineWidth = 6; c.beginPath(); c.moveTo(sx, sy + 20); c.bezierCurveTo(sx + 8, sy + 50, sx - 6, sy + 70, sx + 2, sy + 20 + 100 * r); c.stroke();
    c.lineWidth = 3;
    [[-1, 0.35], [1, 0.5], [-1, 0.65], [1, 0.8]].forEach(([d, at], i) => {
      const k = stage(r, at - 0.15, 0.4); if (k <= 0) return;
      const y0 = sy + 20 + 100 * at; c.beginPath(); c.moveTo(sx, y0); c.quadraticCurveTo(sx + d * 30 * k, y0 + 6, sx + d * (50 + i * 6) * k, y0 + 22 * k); c.stroke();
    });
  }

  // Shoot pushing up through soil
  const stemTop = lerp(sy - 20, ground - 150, ease(sShoot));
  const sway = Math.sin(t * 1.3) * 6 * ease(sLeaf);
  if (sShoot > 0) {
    c.strokeStyle = '#8fc27a'; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx, sy - 20); c.quadraticCurveTo(sx - 14, (sy + stemTop) / 2, sx + sway, stemTop); c.stroke();
    if (sLeaf <= 0) { // hook-shaped tip before leaves open
      c.beginPath(); c.arc(sx + sway - 8, stemTop, 8, 0, Math.PI, true); c.stroke();
    }
  }
  if (sLeaf > 0) {
    const k = ease(sLeaf);
    const leaf = (dir: number, size: number, y: number) => {
      c.save(); c.translate(sx + sway, y); c.rotate(dir * (1.3 - 0.8 * k) + Math.sin(t * 1.6) * 0.05); c.scale(k, k);
      c.fillStyle = '#9fd38a'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dir * size * 0.5, -size * 0.55, dir * size, -size * 0.1); c.quadraticCurveTo(dir * size * 0.5, size * 0.25, 0, 0); c.fill();
      c.strokeStyle = '#5e9a5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(dir * size * 0.85, -size * 0.12); c.stroke();
      c.restore();
    };
    leaf(-1, 80, stemTop + 4); leaf(1, 80, stemTop + 4);
  }

  // Seed cross-section (on top of roots/shoot base)
  const swell = 1 + 0.18 * ease(sWater);
  c.save(); c.translate(sx, sy); c.scale(swell, swell);
  c.fillStyle = '#c99a5b'; c.beginPath(); c.ellipse(0, 0, 46, 32, -0.2, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#7a5530'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#f0d9a0'; c.beginPath(); c.ellipse(-6, 2, 34, 22, -0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b6d58b'; c.beginPath(); c.ellipse(16, -4, 10, 14, 0.3, 0, Math.PI * 2); c.fill();
  if (sRoot > 0) { c.strokeStyle = P.coral; c.lineWidth = 3; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(-40, -14); c.lineTo(-10, -30); c.stroke(); c.setLineDash([]); }
  c.restore();
  c.restore();

  // Labels placed in clear space, connected by arrows
  tag(c, 'Seed coat', 380, 420, ease(t / 1.2), P.gold);
  arrow(c, 450, 425, 586, 446, P.gold, ease(t / 1.2) * 0.8, t);
  tag(c, 'Stored food', 380, 470, ease((t - 0.8) / 1.2), P.cream);
  tag(c, 'Seed absorbs water and swells', 300, 210, sWater, P.sky, 1, 'left');
  tag(c, 'Root grows down', 820, 540, sRoot, P.cream, 2);
  tag(c, 'Shoot grows up', 840, 300, sShoot * (1 - ease(sLeaf)), P.sage, 3);
  tag(c, 'First leaves open', 860, 250, sLeaf, '#9fd38a', 4);
  note(c, 'Germination: the seed uses its stored food to start growing.', R.x + 24, R.y + R.h - 20, ease(sLeaf));
}
