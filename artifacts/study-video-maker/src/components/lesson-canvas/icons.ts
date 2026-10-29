import type { StudySceneAnimationNodesItemIcon } from '@workspace/api-client-react';

export type IconName = StudySceneAnimationNodesItemIcon;

const INK = '#173c3a';

/** Draws an animated vector icon centred at (0,0) with radius s. Caller translates. */
export function drawIcon(c: CanvasRenderingContext2D, icon: IconName, s: number, t: number, color: string) {
  c.save();
  c.fillStyle = color;
  c.strokeStyle = color;
  c.lineWidth = Math.max(2, s * 0.09);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  switch (icon) {
    case 'sun': {
      c.rotate(t * 0.6);
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const len = s * (0.78 + 0.12 * Math.sin(t * 3 + i));
        c.beginPath();
        c.moveTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55);
        c.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        c.stroke();
      }
      c.beginPath(); c.arc(0, 0, s * 0.4, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'water': {
      const bob = Math.sin(t * 2) * s * 0.06;
      c.beginPath();
      c.moveTo(0, -s * 0.8 + bob);
      c.bezierCurveTo(s * 0.55, -s * 0.15 + bob, s * 0.55, s * 0.55 + bob, 0, s * 0.55 + bob);
      c.bezierCurveTo(-s * 0.55, s * 0.55 + bob, -s * 0.55, -s * 0.15 + bob, 0, -s * 0.8 + bob);
      c.fill();
      c.globalAlpha = 0.5;
      const r = ((t * 0.8) % 1);
      c.beginPath(); c.ellipse(0, s * 0.78, s * (0.3 + r * 0.5), s * (0.08 + r * 0.1), 0, 0, Math.PI * 2); c.globalAlpha = 0.6 * (1 - r); c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = INK; c.globalAlpha = 0.35;
      c.beginPath(); c.ellipse(-s * 0.18, s * 0.12 + bob, s * 0.08, s * 0.16, -0.4, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'plant': {
      const sway = Math.sin(t * 1.6) * 0.12;
      c.beginPath(); c.moveTo(-s * 0.45, s * 0.75); c.lineTo(s * 0.45, s * 0.75); c.stroke();
      c.rotate(sway);
      c.beginPath(); c.moveTo(0, s * 0.75); c.quadraticCurveTo(s * 0.1, 0, 0, -s * 0.55); c.stroke();
      const leaf = (dir: number, y: number, k: number) => {
        c.save(); c.translate(0, y); c.rotate(dir * (0.6 + Math.sin(t * 2 + y) * 0.1)); c.scale(k, k);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dir * s * 0.35, -s * 0.35, dir * s * 0.7, 0); c.quadraticCurveTo(dir * s * 0.35, s * 0.2, 0, 0); c.fill(); c.restore();
      };
      leaf(1, s * 0.15, 1); leaf(-1, -s * 0.15, 0.85); leaf(1, -s * 0.5, 0.6);
      break;
    }
    case 'molecule': {
      c.rotate(t * 0.5);
      const pts = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55]; });
      pts.forEach(([x, y]) => { c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); c.stroke(); });
      c.beginPath(); c.arc(0, 0, s * 0.27, 0, Math.PI * 2); c.fill();
      pts.forEach(([x, y], i) => { c.beginPath(); c.arc(x, y, s * (0.18 + 0.03 * Math.sin(t * 3 + i)), 0, Math.PI * 2); c.fill(); });
      break;
    }
    case 'planet': {
      c.beginPath(); c.arc(0, 0, s * 0.42, 0, Math.PI * 2); c.fill();
      c.save(); c.rotate(-0.35); c.beginPath(); c.ellipse(0, 0, s * 0.82, s * 0.2, 0, 0, Math.PI * 2); c.stroke(); c.restore();
      const a = t * 1.3;
      c.beginPath(); c.arc(Math.cos(a) * s * 0.8, Math.sin(a) * s * 0.55, s * 0.1, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'person': {
      const nod = Math.sin(t * 2) * s * 0.04;
      c.beginPath(); c.arc(0, -s * 0.38 + nod, s * 0.25, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(-s * 0.55, s * 0.75); c.quadraticCurveTo(-s * 0.55, s * 0.02, 0, s * 0.02); c.quadraticCurveTo(s * 0.55, s * 0.02, s * 0.55, s * 0.75); c.closePath(); c.fill();
      break;
    }
    case 'book': {
      c.beginPath(); c.moveTo(0, -s * 0.45); c.lineTo(-s * 0.75, -s * 0.55); c.lineTo(-s * 0.75, s * 0.5); c.lineTo(0, s * 0.6); c.lineTo(s * 0.75, s * 0.5); c.lineTo(s * 0.75, -s * 0.55); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(0, -s * 0.45); c.lineTo(0, s * 0.6); c.stroke();
      const flip = (Math.sin(t * 1.5) + 1) / 2;
      c.globalAlpha = 0.85;
      c.beginPath(); c.moveTo(0, -s * 0.45); c.lineTo(s * 0.75 * (1 - 2 * flip), -s * 0.55 - Math.sin(flip * Math.PI) * s * 0.2); c.lineTo(s * 0.75 * (1 - 2 * flip), s * 0.5 - Math.sin(flip * Math.PI) * s * 0.2); c.lineTo(0, s * 0.6); c.closePath(); c.fill();
      break;
    }
    case 'energy': {
      c.globalAlpha = 0.75 + 0.25 * Math.sin(t * 9);
      c.beginPath(); c.moveTo(s * 0.15, -s * 0.85); c.lineTo(-s * 0.45, s * 0.1); c.lineTo(-s * 0.02, s * 0.1); c.lineTo(-s * 0.18, s * 0.85); c.lineTo(s * 0.48, -s * 0.15); c.lineTo(s * 0.05, -s * 0.15); c.closePath(); c.fill();
      break;
    }
    case 'number': {
      c.font = `800 ${Math.round(s * 0.62)}px Manrope, sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const n = Math.floor(t * 1.2) % 9;
      c.fillText(`${n + 1}+${(n * 3) % 9 + 1}`, 0, -s * 0.12);
      c.beginPath(); c.moveTo(-s * 0.55, s * 0.32); c.lineTo(s * 0.55 * Math.min(1, (t * 1.2) % 1 * 1.6), s * 0.32); c.stroke();
      break;
    }
    case 'cloud': {
      c.translate(Math.sin(t * 0.9) * s * 0.12, 0);
      c.beginPath();
      c.arc(-s * 0.35, s * 0.1, s * 0.3, 0, Math.PI * 2); c.arc(0, -s * 0.12, s * 0.4, 0, Math.PI * 2); c.arc(s * 0.38, s * 0.1, s * 0.3, 0, Math.PI * 2);
      c.rect(-s * 0.35, s * 0.05, s * 0.73, s * 0.35); c.fill();
      for (let i = 0; i < 3; i += 1) {
        const p = (t * 1.4 + i / 3) % 1;
        c.globalAlpha = 1 - p;
        c.beginPath(); c.moveTo(-s * 0.3 + i * s * 0.3, s * (0.55 + p * 0.3)); c.lineTo(-s * 0.34 + i * s * 0.3, s * (0.68 + p * 0.3)); c.stroke();
      }
      break;
    }
    case 'cell': {
      c.beginPath();
      for (let i = 0; i <= 40; i += 1) {
        const a = (i / 40) * Math.PI * 2;
        const r = s * (0.75 + 0.06 * Math.sin(a * 5 + t * 2));
        const x = Math.cos(a) * r; const y = Math.sin(a) * r * 0.82;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      c.beginPath(); c.arc(Math.sin(t) * s * 0.06, 0, s * 0.26, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.6;
      [0, 2, 4].forEach((k) => { const a = t * 0.7 + k; c.beginPath(); c.arc(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.38, s * 0.07, 0, Math.PI * 2); c.fill(); });
      break;
    }
    case 'gear': {
      c.rotate(t * 0.9);
      c.beginPath();
      const teeth = 8;
      for (let i = 0; i < teeth * 2; i += 1) {
        const a = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? s * 0.78 : s * 0.58;
        c.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r);
        c.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r);
      }
      c.closePath(); c.fill();
      c.fillStyle = INK; c.beginPath(); c.arc(0, 0, s * 0.22, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'lightbulb': {
      const glow = 0.5 + 0.5 * Math.sin(t * 2.5);
      c.globalAlpha = 0.35 + glow * 0.5;
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 + (i - 2) * 0.5;
        c.beginPath(); c.moveTo(Math.cos(a) * s * 0.6, -s * 0.15 + Math.sin(a) * s * 0.6); c.lineTo(Math.cos(a) * s * 0.85, -s * 0.15 + Math.sin(a) * s * 0.85); c.stroke();
      }
      c.globalAlpha = 1;
      c.beginPath(); c.arc(0, -s * 0.15, s * 0.42, Math.PI * 0.8, Math.PI * 2.2); c.lineTo(s * 0.18, s * 0.42); c.lineTo(-s * 0.18, s * 0.42); c.closePath(); c.fill();
      c.fillRect(-s * 0.2, s * 0.5, s * 0.4, s * 0.08); c.fillRect(-s * 0.15, s * 0.64, s * 0.3, s * 0.08);
      break;
    }
    case 'atom': {
      for (let i = 0; i < 3; i += 1) {
        c.save(); c.rotate((i * Math.PI) / 3);
        c.beginPath(); c.ellipse(0, 0, s * 0.82, s * 0.28, 0, 0, Math.PI * 2); c.stroke();
        const a = t * (1.6 + i * 0.4) + i * 2;
        c.beginPath(); c.arc(Math.cos(a) * s * 0.82, Math.sin(a) * s * 0.28, s * 0.09, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      c.beginPath(); c.arc(0, 0, s * 0.16, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'heart': {
      const beat = 1 + 0.1 * Math.max(0, Math.sin(t * 6)) ;
      c.scale(beat, beat);
      c.beginPath(); c.moveTo(0, s * 0.7);
      c.bezierCurveTo(-s * 0.9, 0, -s * 0.55, -s * 0.75, 0, -s * 0.3);
      c.bezierCurveTo(s * 0.55, -s * 0.75, s * 0.9, 0, 0, s * 0.7);
      c.fill();
      break;
    }
  }
  c.restore();
}
