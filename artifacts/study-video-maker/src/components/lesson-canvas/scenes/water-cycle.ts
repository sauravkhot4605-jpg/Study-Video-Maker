import { P, R, arrow, clipRegion, cloud, ease, frame, lerp, stage, sun, tag } from './common';

/** Water cycle landscape: sea, sun, evaporation, condensation, precipitation, collection. */
export function drawWaterCycle(c: CanvasRenderingContext2D, t: number, duration: number) {
  const p = t / Math.max(1, duration);
  const sEvap = stage(p, 0.04, 0.14); const sCond = stage(p, 0.26, 0.14); const sRain = stage(p, 0.48, 0.12); const sColl = stage(p, 0.66, 0.12);
  const bottom = R.y + R.h;
  const sky = c.createLinearGradient(0, R.y, 0, bottom);
  sky.addColorStop(0, '#2f6a6a'); sky.addColorStop(1, '#5e9a92');
  frame(c, sky);
  c.save(); clipRegion(c);

  sun(c, 170, 245, 36, t, ease(t / 1));

  // Mountain on right with snowcap
  c.fillStyle = '#3c6f5f'; c.beginPath(); c.moveTo(700, bottom); c.lineTo(930, 300); c.lineTo(1040, 380); c.lineTo(1120, 330); c.lineTo(1230, bottom); c.closePath(); c.fill();
  c.fillStyle = '#2e5a4e'; c.beginPath(); c.moveTo(780, bottom); c.lineTo(930, 300); c.lineTo(960, bottom); c.closePath(); c.fill();
  c.fillStyle = P.cream; c.beginPath(); c.moveTo(930, 300); c.lineTo(905, 335); c.lineTo(922, 330); c.lineTo(935, 342); c.lineTo(955, 318); c.closePath(); c.fill();
  // Land strip
  c.fillStyle = '#4f7f62'; c.beginPath(); c.moveTo(560, bottom); c.quadraticCurveTo(640, 490, 780, 480); c.lineTo(1230, 470); c.lineTo(1230, bottom); c.closePath(); c.fill();

  // Sea with waves
  const seaTop = 488;
  c.fillStyle = '#1f5f73'; c.beginPath(); c.moveTo(R.x, bottom); c.lineTo(R.x, seaTop);
  for (let x = R.x; x <= 640; x += 10) c.lineTo(x, seaTop + Math.sin(x * 0.04 + t * 2) * 4);
  c.quadraticCurveTo(620, 520, 600, bottom); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(244,242,232,.35)'; c.lineWidth = 2;
  for (let row = 0; row < 3; row += 1) { c.beginPath(); for (let x = R.x + 20; x < 560; x += 8) { const y = seaTop + 22 + row * 22 + Math.sin(x * 0.05 + t * 1.6 + row) * 3; if (x === R.x + 20) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }

  // Evaporation vapour wisps rising from sea
  if (sEvap > 0) {
    c.save();
    for (let i = 0; i < 14; i += 1) {
      const k = (t * 0.22 + i / 14) % 1;
      const x0 = 160 + (i % 7) * 55;
      const x = x0 + Math.sin(k * 8 + i) * 12 + k * 120;
      const y = lerp(seaTop - 6, 270, k);
      c.globalAlpha = sEvap * Math.sin(k * Math.PI) * 0.8;
      c.strokeStyle = P.cream; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 10, x, y - 20); c.stroke();
    }
    c.restore();
    arrow(c, 330, 460, 420, 300, P.gold, sEvap, t);
  }

  // Condensation: droplets gather into cloud
  const cloudX = lerp(500, lerp(560, 860, ease(sRain)), 1);
  const cloudS = 30 + 60 * ease(sCond);
  const grey = sRain > 0 ? 'rgba(190,205,205,.97)' : 'rgba(244,242,232,.95)';
  if (sCond > 0) {
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2 + t * 0.4; const d = lerp(150, 20, ease(sCond));
      c.globalAlpha = 0.8 * (1 - ease(sCond) * 0.7); c.fillStyle = P.cream;
      c.beginPath(); c.arc(cloudX + Math.cos(a) * d, 250 + Math.sin(a) * d * 0.45, 4, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = ease(sCond); cloud(c, cloudX + Math.sin(t * 0.5) * 6, 250, cloudS, grey); c.globalAlpha = 1;
  }

  // Precipitation
  if (sRain > 0) {
    c.save(); c.strokeStyle = P.sky; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 26; i += 1) {
      const k = (t * 0.9 + i * 0.137) % 1; const x = cloudX - 70 + (i * 37) % 140 - k * 14; const y = lerp(285, 430, k);
      c.globalAlpha = sRain * (1 - k * 0.4); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + 16); c.stroke();
    }
    c.restore();
  }

  // Collection: river runs down mountain to sea, lake forms
  if (sColl > 0) {
    c.save(); c.globalAlpha = ease(sColl);
    c.strokeStyle = '#6fb3c6'; c.lineWidth = 10; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(930, 360); c.quadraticCurveTo(870, 430, 780, 490); c.quadraticCurveTo(700, 530, 600, 520); c.stroke();
    c.strokeStyle = 'rgba(244,242,232,.6)'; c.lineWidth = 3; c.setLineDash([6, 14]); c.lineDashOffset = -t * 40; c.stroke(); c.setLineDash([]);
    c.restore();
    arrow(c, 760, 515, 640, 535, P.sky, sColl, t);
  }
  c.restore();

  tag(c, 'Evaporation', 300, 340, sEvap, P.gold, 1);
  tag(c, 'Condensation', cloudX, 196, sCond, P.cream, 2);
  tag(c, 'Precipitation', cloudX + 150, 370, sRain, P.sky, 3);
  tag(c, 'Collection', 860, 540, sColl, P.sage, 4);
  tag(c, 'Sun heats the sea', 170, 310, ease(t / 1.2) * (1 - sCond * 0.6), P.gold);
}
