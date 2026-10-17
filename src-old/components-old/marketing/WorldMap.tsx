

import { useEffect, useRef } from 'react';
import MAP from '@/lib/world-dots.json';
import { ROUTES } from '@/lib/site';

// Dot map: studies travel between any two cities (question out in lilac, answer back in yellow).
// Local-payout markets glow. Pauses when off screen or the tab is hidden; 30 fps on phones.
type MapData = { w: number; h: number; names: string[]; ids: string[]; dots: number[]; cities: Record<string, [number, number]> };
const M = MAP as unknown as MapData;
const LIVE = ['566'], NEXT = ['288', '404'];
const stOf = (id: string) => (LIVE.includes(id) ? 'live' : NEXT.includes(id) ? 'next' : 'open');
const INFO = {
  live: ['Local payouts live', '#f0c93a', 'Run studies here or take part. Participants are paid locally.'],
  next: ['Local payouts opening next', '#f0c93a', 'Run studies here or take part. Local payouts are coming soon.'],
  open: ['Open to everyone', '#b4a7f5', 'Run studies here or take part from here.']
} as const;

export default function WorldMap() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current!, stage = stageRef.current!, tip = tipRef.current!, wrapEl = wrapRef.current!;
    const ctx = cv.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 720px)').matches, fps = small ? 30 : 60;
    const N = M.dots.length / 3, cst = M.ids.map(stOf);
    const C = M.cities, names = Object.keys(C), hubs = ['Lagos', 'Abuja', 'Accra', 'Nairobi'].filter(h => C[h]);
    let W = 0, H = 0, s = 1, hov = -1, pinned = false, onScreen = true, last = 0, raf = 0;

    const size = () => { const r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); s = W / M.w; };
    const bz = (a: number[], b: number[], k: number) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.28, u = 1 - k; return [u * u * a[0] + 2 * u * k * mx + k * k * b[0], u * u * a[1] + 2 * u * k * my + k * k * b[1]]; };
    const glow = (x: number, y: number, R: number, rgb: string, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill(); };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    type St = { a: string; b: string; born: number; dur: number };
    const newStudy = (born: number): St => { let a: string, b: string; do { a = names[Math.floor(rnd() * names.length)]; b = rnd() < 0.5 ? hubs[Math.floor(rnd() * hubs.length)] : names[Math.floor(rnd() * names.length)]; } while (a === b || Math.hypot(C[a][0] - C[b][0], C[a][1] - C[b][1]) < 40); if (rnd() < 0.5) [a, b] = [b, a]; return { a, b, born, dur: 3.6 + rnd() * 2 }; };
    let studies = Array.from({ length: 9 }, (_, i) => newStudy(-i * 0.7));

    const frame = (now: number) => {
      const t = now / 1000, r = Math.max(1, 2.3 * s), sc = Math.max(s, 0.55);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const x = M.dots[i * 3] * s, y = M.dots[i * 3 + 1] * s, c = M.dots[i * 3 + 2], st = cst[c], h = c === hov;
        ctx.beginPath();
        if (st === 'next' && !h) { ctx.arc(x, y, r * 0.8, 0, 6.283); ctx.strokeStyle = '#f0c93a'; ctx.lineWidth = Math.max(1, r * 0.5); ctx.stroke(); continue; }
        ctx.arc(x, y, h ? r * 1.3 : st === 'live' ? r * 1.15 : r, 0, 6.283);
        ctx.fillStyle = h ? (st === 'open' ? '#d9d1ff' : '#ffe17a') : st === 'live' ? '#f0c93a' : 'rgba(196,186,240,.30)';
        ctx.fill();
      }
      if (!reduced) studies = studies.map(x => (t - x.born > x.dur ? newStudy(t) : x));
      studies.forEach(x => {
        const A = C[x.a].map(v => v * s), B = C[x.b].map(v => v * s), ph = reduced ? 0.3 : Math.max(0, (t - x.born) / x.dur), fade = Math.sin(Math.PI * Math.min(1, ph));
        ctx.beginPath(); for (let q = 0; q <= 40; q++) { const p = bz(A, B, q / 40); if (q) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
        ctx.strokeStyle = `rgba(217,209,255,${0.26 * fade})`; ctx.lineWidth = 1; ctx.stroke();
        if (ph < 0.5) { const p = bz(A, B, ph * 2); glow(p[0], p[1], 6.5 * sc, '217,209,255', 0.95 * fade); }
        else { const p = bz(A, B, 1 - (ph - 0.5) * 2); glow(p[0], p[1], 7.5 * sc, '255,225,122', fade); }
        if (ph > 0.47 && ph < 0.56) glow(B[0], B[1], 14 * sc, '217,209,255', 0.5);
      });
      ([['Lagos', 1], ['Accra', 0], ['Nairobi', 0]] as const).forEach(([n, live], j) => { if (!C[n]) return; const p = C[n].map(v => v * s), k = reduced ? 0.5 : (t * 0.5 + j * 0.33) % 1; ctx.strokeStyle = `rgba(240,201,58,${(live ? 0.7 : 0.38) * (1 - k)})`; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(p[0], p[1], 4 + k * (live ? 26 : 15) * sc, 0, 6.283); ctx.stroke(); });
    };
    const loop = (now: number) => { if (!onScreen || document.hidden || reduced) return; if (now - last >= 1000 / fps - 2) { last = now; frame(now); } raf = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(raf); if (!reduced && onScreen && !document.hidden) raf = requestAnimationFrame(loop); };
    const pick = (mx: number, my: number) => { let best = -1, bd = (9 * Math.max(s, 0.55)) ** 2; for (let i = 0; i < N; i++) { const dx = M.dots[i * 3] * s - mx, dy = M.dots[i * 3 + 1] * s - my, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = M.dots[i * 3 + 2]; } } return best; };
    const place = (mx: number, my: number) => { tip.style.left = Math.min(Math.max(mx, 130), wrapEl.clientWidth - 130) + 'px'; tip.style.top = Math.max(my, 120) + 'px'; };
    const show = (c: number, mx = 0, my = 0) => {
      hov = c; if (reduced || !onScreen) frame(performance.now());
      if (c < 0) { tip.classList.remove('show'); return; }
      const [t, col, p] = INFO[cst[c] as keyof typeof INFO];
      tip.innerHTML = `<span class="st"><i style="background:${col}"></i>${t}</span><b>${M.names[c]}</b><p>${p}</p><a href="${ROUTES.researcherSignup}">Start a study →</a> <a href="${ROUTES.participantSignup}" style="margin-left:12px">Take part →</a>`;
      place(mx, my); tip.classList.add('show');
    };
    const rel = (e: PointerEvent | MouseEvent) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'touch' || pinned) return; const [x, y] = rel(e), c = pick(x, y); if (c !== hov) show(c, x, y); else if (c >= 0) place(x, y); };
    const onLeave = () => { if (!pinned) show(-1); };
    const onClick = (e: MouseEvent) => { const [x, y] = rel(e), c = pick(x, y); pinned = c >= 0; show(c, x, y); };
    const onDoc = (e: MouseEvent) => { if (!wrapEl.contains(e.target as Node)) { pinned = false; show(-1); } };
    const onResize = () => { size(); frame(performance.now()); };
    cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave); cv.addEventListener('click', onClick);
    document.addEventListener('click', onDoc); window.addEventListener('resize', onResize); document.addEventListener('visibilitychange', start);
    size(); frame(performance.now()); start();
    const io = new IntersectionObserver(([e]) => { const was = onScreen; onScreen = e.isIntersecting; if (onScreen && !was) start(); });
    io.observe(stage);
    return () => { cancelAnimationFrame(raf); io.disconnect(); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); cv.removeEventListener('click', onClick); document.removeEventListener('click', onDoc); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', start); };
  }, []);

  return (
    <div className="stage-wrap" ref={wrapRef}>
      <div className="stage" ref={stageRef}>
        <canvas ref={canvasRef} role="img" aria-label="World map. Studies travel between countries in every direction, questions out and answers back. Local payouts are live in Nigeria, with Ghana and Kenya next." />
      </div>
      <div className="tip" ref={tipRef} role="status" aria-live="polite" />
      <div className="caption" aria-hidden="true">
        <span className="q"><i style={{ background: '#d9d1ff' }} />questions out</span>
        <span className="a"><i style={{ background: '#f0c93a' }} />answers back</span>
        <span><i style={{ background: '#f0c93a', boxShadow: '0 0 8px #f0c93a' }} />local payouts: Nigeria</span>
        <span><i style={{ boxShadow: 'inset 0 0 0 2px #f0c93a' }} />next: Ghana, Kenya</span>
      </div>
    </div>
  );
}
