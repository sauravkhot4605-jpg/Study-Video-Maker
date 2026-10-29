export const P = { cream: '#f4f2e8', gold: '#e7c568', coral: '#ef8968', sage: '#9dc0ad', mist: '#c3d9ca', ink: '#173c3a', deep: '#0e2624', sky: '#b9d4e3' };

/** Illustration region: keeps clear of header (<160) and caption box (>580). */
export const R = { x: 70, y: 168, w: 1140, h: 404 };

export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0..1 progress of a stage starting at fraction `start` of the scene, lasting `len`. */
export const stage = (p: number, start: number, len: number) => clamp01((p - start) / len);

export function frame(c: CanvasRenderingContext2D, fill: string | CanvasGradient) {
  c.save(); c.beginPath(); c.roundRect(R.x, R.y, R.w, R.h, 22); c.fillStyle = fill; c.fill(); c.restore();
}

export function clipRegion(c: CanvasRenderingContext2D) { c.beginPath(); c.roundRect(R.x, R.y, R.w, R.h, 22); c.clip(); }

/** Readable pill label with optional step number. */
export function tag(c: CanvasRenderingContext2D, text: string, x: number, y: number, alpha: number, color = P.gold, step?: number, align: 'left' | 'center' = 'center') {
  if (alpha <= 0) return;
  c.save(); c.globalAlpha = clamp01(alpha);
  c.font = '800 19px Manrope, sans-serif';
  const tw = c.measureText(text).width; const badge = step ? 30 : 0;
  const w = tw + 26 + badge; const h = 36;
  const left = align === 'center' ? x - w / 2 : x;
  const lift = (1 - ease(alpha)) * 10;
  c.fillStyle = 'rgba(14,38,36,.86)'; c.beginPath(); c.roundRect(left, y - h / 2 + lift, w, h, 18); c.fill();
  c.strokeStyle = color; c.lineWidth = 2; c.stroke();
  if (step) {
    c.fillStyle = color; c.beginPath(); c.arc(left + 20, y + lift, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = P.ink; c.font = '800 14px Manrope, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(step), left + 20, y + lift + 1);
    c.font = '800 19px Manrope, sans-serif';
  }
  c.fillStyle = P.cream; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(text, left + 13 + badge, y + lift + 1);
  c.restore();
}

export function arrow(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, alpha: number, t: number) {
  if (alpha <= 0) return;
  c.save(); c.globalAlpha = clamp01(alpha); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 3.5; c.lineCap = 'round';
  c.setLineDash([10, 8]); c.lineDashOffset = -t * 28;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
  const a = Math.atan2(y2 - y1, x2 - x1);
  c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(a - 0.5) * 16, y2 - Math.sin(a - 0.5) * 16); c.lineTo(x2 - Math.cos(a + 0.5) * 16, y2 - Math.sin(a + 0.5) * 16); c.closePath(); c.fill();
  c.restore();
}

export function cloud(c: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) {
  c.save(); c.fillStyle = fill; c.beginPath();
  c.arc(x - s * 0.55, y + s * 0.1, s * 0.38, 0, Math.PI * 2);
  c.arc(x - s * 0.1, y - s * 0.18, s * 0.5, 0, Math.PI * 2);
  c.arc(x + s * 0.45, y, s * 0.42, 0, Math.PI * 2);
  c.roundRect(x - s * 0.9, y, s * 1.75, s * 0.42, s * 0.2);
  c.fill(); c.restore();
}

export function sun(c: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, alpha = 1) {
  c.save(); c.globalAlpha = clamp01(alpha); c.translate(x, y);
  const g = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.2); g.addColorStop(0, 'rgba(231,197,104,.55)'); g.addColorStop(1, 'rgba(231,197,104,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 2.2, 0, Math.PI * 2); c.fill();
  c.rotate(t * 0.25); c.strokeStyle = P.gold; c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 12; i += 1) { const a = (i / 12) * Math.PI * 2; const l = r * (1.35 + 0.12 * Math.sin(t * 2 + i)); c.beginPath(); c.moveTo(Math.cos(a) * r * 1.12, Math.sin(a) * r * 1.12); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke(); }
  c.fillStyle = P.gold; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.restore();
}

export function note(c: CanvasRenderingContext2D, text: string, x: number, y: number, alpha: number, align: CanvasTextAlign = 'left') {
  if (alpha <= 0) return;
  c.save(); c.globalAlpha = clamp01(alpha); c.font = '600 17px "DM Sans", sans-serif'; c.fillStyle = P.mist; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(text, x, y); c.restore();
}
