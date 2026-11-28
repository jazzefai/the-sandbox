/* Peeling Pavement — the organizer's own Claude-made experiment, running as 01's opening scene.
   Adapted from the original artifact: the control panel and readout are removed; it plays its
   peel cycle on its own, pauses when scrolled away or when the tab is hidden, and draws a single
   still frame for people who turn off motion. S.pavement(canvas, { offsetY }) returns
   { play, pause, playing }. It stops for good once its canvas leaves the page. */
(function (Sb) {
  'use strict';
  Sb.pavement = function (cvs, opts) {
    opts = opts || {};
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const S = {
      yaw: 34, elev: 18, dist: 18, H: 2.4, span: 4.3,
      twist: 1, sway: 0.9, scatter: 0.25, visc: 0.35, swell: 0.4, splash: 0.6, drips: 0.5,
      shadows: true, sunAz: 215, sunAlt: 38, soft: 0.35, dark: 0.5
    };
    const P = 0.6, GAP = 0.014, PITCH = P + GAP, TH = 0.06, NL = 30, NW = 3;
    const L = NL * PITCH, FLOAT = TH * 0.15, ABOVE = TH / 2 + FLOAT;
    const PERIOD = 12, NEAR = 0.2, R0 = 9.4, R1 = 13;

    /* ---------- math ---------- */
    const rad = (d) => d * Math.PI / 180;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const smoother = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
    const rot = (a, b, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [add(mul(a, c), mul(b, s)), sub(mul(b, c), mul(a, s))]; };
    function hash(i, j) {
      let h = Math.imul(i * 374761393 + j * 668265263 + 1013904223, 1274126177);
      h ^= h >>> 13; h = Math.imul(h, 1103515245); h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }

    /* ---------- palette ---------- */
    const TONE = [184, 181, 173], UNDER = [152, 141, 121], DEEP = [62, 68, 74], SKY = [212, 217, 217];
    function tone(i, j) {
      const v = (hash(i, j) - 0.5) * 16;
      const w = hash(j + 101, i - 57) > 0.93;
      return w ? [TONE[0] + 4 + v, TONE[1] - 2 + v, TONE[2] - 12 + v] : [TONE[0] + v, TONE[1] + v, TONE[2] + v * 1.1];
    }
    function under(i, j) { const v = (hash(i - 31, j + 17) - 0.5) * 18; return [UNDER[0] + v, UNDER[1] + v, UNDER[2] + v * 0.8]; }
    const rgb = (c, k) => `rgb(${clamp(c[0] * k, 0, 255) | 0},${clamp(c[1] * k, 0, 255) | 0},${clamp(c[2] * k, 0, 255) | 0})`;
    function sunDir() { const a = rad(S.sunAz), e = rad(S.sunAlt); return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)]; }
    const shade = (n, Ld) => 0.5 + 0.42 * Math.max(0, dot(n, Ld)) + 0.12 * (n[1] * 0.5 + 0.5);
    function liquidCol(n, p, cam, Ld) {
      const v = norm(sub(cam.pos, p)), nv = Math.max(0, dot(n, v));
      const fr = Math.min(1, 0.08 + 0.85 * Math.pow(1 - nv, 4));
      const R = sub(mul(n, 2 * dot(n, v)), v);
      const sp = Math.pow(Math.max(0, dot(R, Ld)), 70) * 140;
      return rgb([DEEP[0] + (SKY[0] - DEEP[0]) * fr + sp, DEEP[1] + (SKY[1] - DEEP[1]) * fr + sp, DEEP[2] + (SKY[2] - DEEP[2]) * fr + sp], 1);
    }

    /* ---------- the liquid ---------- */
    let A = 1, time = 0, phase = 0.4, RX = 1.5, RZ = 1.1;
    const LQ = { t: 0, A: 1, c: 2.6, k: 3.4, damp: 0.8, w: 1.8, ts: 1, amp: 0.1 };
    const ripples = [], drops = [];
    function setLQ(t) {
      const v = S.visc;
      LQ.t = t; LQ.A = A;
      LQ.c = 3.4 - 2.2 * v; LQ.k = 4.2 - 2.4 * v; LQ.damp = 0.35 + 1.4 * v; LQ.w = 1.3 + 1.4 * v;
      LQ.ts = 1.2 - 0.8 * v; LQ.amp = 0.22 * S.swell;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i], age = Math.max(0, t - r.t0);
        r.front = LQ.c * age; r.a = r.amp * Math.exp(-age * LQ.damp);
        if (r.a < 0.002) ripples.splice(i, 1);
      }
    }
    function addRipple(x, z, amp) {
      if (amp < 0.003) return;
      ripples.push({ x, z, amp, t0: time, front: 0, a: amp });
      if (ripples.length > 48) {
        let mi = 0; for (let i = 1; i < ripples.length; i++) if (ripples[i].a < ripples[mi].a) mi = i;
        ripples.splice(mi, 1);
      }
    }
    function liquidH(x, z) {
      const t = LQ.t * LQ.ts;
      let y = LQ.amp * (0.5 * Math.sin(0.9 * x + 0.4 * z - 1.1 * t) + 0.33 * Math.sin(-0.5 * x + 1.1 * z - 0.9 * t + 1.3) + 0.17 * Math.sin(1.7 * x - 1.3 * z - 1.7 * t + 0.7));
      if (LQ.A > 0) {
        if (Math.abs(x) < L / 2 + 1) y -= 0.16 * LQ.A * Math.exp(-z * z / 0.6) * smooth(L / 2 + 1, L / 2 - 0.5, Math.abs(x));
        const ex = Math.max(0, Math.abs(x) - RX), ez = Math.max(0, Math.abs(z) - RZ);
        y += 0.14 * LQ.A * Math.exp(-(ex * ex + ez * ez) / 0.5);
      }
      const w = LQ.w, w3 = 3 * w, k = LQ.k;
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i], dx = x - r.x, dz = z - r.z, d = Math.sqrt(dx * dx + dz * dz), u = d - r.front;
        if (u > w3 || u < -w3) continue;
        y += r.a * Math.exp(-u * u / (w * w)) * Math.cos(k * u) / Math.sqrt(1 + d * 0.8);
      }
      return y;
    }

    /* ---------- canvas ---------- */
    const ctx = cvs.getContext('2d');
    const scv = document.createElement('canvas'), sctx = scv.getContext('2d');
    const hasFilter = typeof ctx.filter === 'string';
    let W = 1, H = 1, dirty = true;
    function resize() {
      const r = cvs.getBoundingClientRect(), dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
      cvs.width = W; cvs.height = H;
      scv.width = Math.ceil(W / 2); scv.height = Math.ceil(H / 2);
      dirty = true;
    }
    const ro = new ResizeObserver(resize); ro.observe(cvs);

    function makeCam() {
      const tgt = [0, S.span * 0.42 + 0.3, 0];
      const y = rad(S.yaw), e = rad(S.elev);
      const pos = [S.dist * Math.cos(e) * Math.sin(y), tgt[1] + S.dist * Math.sin(e), S.dist * Math.cos(e) * Math.cos(y)];
      const f = norm(sub(tgt, pos));
      const r = norm(cross(f, [0, 1, 0]));
      const u = cross(r, f);
      const narrow = W / H < 0.9;
      const focal = (H / 2) / Math.tan(rad(narrow ? 58 : 38) / 2);
      return { pos, f, r, u, focal, cx: W / 2, cy: H * (opts.offsetY || 0.52) };
    }
    function clipNear(pts) {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], ain = a[2] >= NEAR, bin = b[2] >= NEAR;
        if (ain) out.push(a);
        if (ain !== bin) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]); }
      }
      return out;
    }
    function toScreen(cam, pts) {
      let cp = pts.map((p) => { const d = sub(p, cam.pos); return [dot(d, cam.r), dot(d, cam.u), dot(d, cam.f)]; });
      if (cp.some((q) => q[2] < NEAR)) { cp = clipNear(cp); if (cp.length < 3) return null; }
      return cp.map((q) => [cam.cx + q[0] / q[2] * cam.focal, cam.cy - q[1] / q[2] * cam.focal]);
    }
    function path(g, s) { g.beginPath(); g.moveTo(s[0][0], s[0][1]); for (let i = 1; i < s.length; i++) g.lineTo(s[i][0], s[i][1]); g.closePath(); }

    /* ---------- ground grid ---------- */
    const NC = Math.ceil(R1 / PITCH) + 1, VB = 2 * NC + 2;
    const vIdx = (a, b) => (a + NC) * VB + (b + NC);
    const NV = (2 * NC + 1) * VB;
    const VX = new Float64Array(NV), VZ = new Float64Array(NV), hv = new Float64Array(NV);
    const sx = new Float64Array(NV), sy = new Float64Array(NV), sz = new Float64Array(NV);
    const used = new Uint8Array(NV);
    const cells = [];
    for (let i = -NC; i < NC; i++) for (let j = -NC; j <= NC; j++) {
      const cx = (i + 0.5) * PITCH, cz = j * PITCH, r = Math.hypot(cx, cz);
      if (r > R1) continue;
      const q = [vIdx(i, j), vIdx(i + 1, j), vIdx(i + 1, j + 1), vIdx(i, j + 1)];
      q.forEach((k) => { used[k] = 1; });
      cells.push({ i, j, cx, cz, r, q, alpha: 1 - smooth(R0, R1, r), trench: i >= -NL / 2 && i < NL / 2 && Math.abs(j) <= 1,
        tone: tone(i, j), ph1: hash(i + 7, j - 3) * 6.283, ph2: hash(i - 5, j + 9) * 6.283, d: 0 });
    }
    const usedList = [];
    for (let a = -NC; a <= NC; a++) for (let b = -NC; b <= NC + 1; b++) {
      const k = vIdx(a, b); VX[k] = a * PITCH; VZ[k] = (b - 0.5) * PITCH; if (used[k]) usedList.push(k);
    }

    /* ---------- the letter R: 18 pixels, five layers deep = 90 slabs ---------- */
    const GLYPH = ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'];
    const LAYERS = 5, DEPTH = 0.42;
    const SLABS = (() => {
      const pix = [];
      GLYPH.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') pix.push({ c, r: GLYPH.length - 1 - r }); }));
      const targets = [];
      for (let d = 0; d < LAYERS; d++) for (const q of pix) targets.push({ c: q.c, r: q.r, d });
      targets.sort((a, b) => (a.c * LAYERS + a.d) - (b.c * LAYERS + b.d) || a.r - b.r);
      const out = [];
      let n = 0;
      for (let k = 0; k < NL; k++) for (let j = -1; j <= 1; j++) {
        const tg = targets[n++];
        out.push({ k, j, c: tg.c, r: tg.r, d: tg.d, delay: tg.r / 6 * 0.75 + hash(k, j + 40) * 0.25,
          h1: hash(k + 3, j), h2: hash(k, j + 19), h3: hash(k - 8, j - 2), prev: 1,
          tone: tone(k - NL / 2, j), under: under(k, j) });
      }
      return out;
    })();
    const rotAxis = (v, k, a) => { const c = Math.cos(a), s = Math.sin(a), kv = cross(k, v), d = dot(k, v) * (1 - c); return [v[0] * c + kv[0] * s + k[0] * d, v[1] * c + kv[1] * s + k[1] * d, v[2] * c + kv[2] * s + k[2] * d]; };
    function buildStrip(G, t) {
      const pix = S.span / GLYPH.length, ts = LQ.ts;
      RX = 2.5 * pix; RZ = (LAYERS - 1) / 2 * DEPTH + 0.3;
      const tiles = [];
      SLABS.forEach((sl, i) => {
        const p = clamp((G * 1.6 - sl.delay) / 0.6, 0, 1);
        const gx = (sl.k - NL / 2 + 0.5) * PITCH, gz = sl.j * PITCH;
        const g0 = [gx, liquidH(gx, gz) + FLOAT, gz];
        if (sl.prev > 0 && p <= 0) {
          const amp = S.splash * (0.6 + Math.min(1, S.span / 5));
          addRipple(gx, gz, 0.045 * amp);
          if (S.splash > 0) for (let q = 0; q < 3; q++) {
            const a = Math.random() * 6.283, sp = (0.3 + Math.random() * 0.7) * (1 - 0.5 * S.visc);
            drops.push({ x: gx, y: 0.05, z: gz, vx: Math.cos(a) * sp, vy: (1.2 + Math.random() * 2) * amp * (1 - 0.45 * S.visc), vz: Math.sin(a) * sp, r: 0.022 + Math.random() * 0.025 });
          }
        } else if (sl.prev <= 0 && p > 0) addRipple(gx, gz, 0.018 * S.splash);
        sl.prev = p;
        if (p <= 0) { tiles.push({ c: g0, T: [1, 0, 0], B: [0, 0, 1], N: [0, 1, 0], tone: sl.tone, under: sl.under, air: false }); return; }
        const tg = [(sl.c - 2) * pix, sl.r * pix + pix / 2 + 0.05, (sl.d - (LAYERS - 1) / 2) * DEPTH];
        const mid = [(g0[0] + tg[0]) / 2 + (sl.h1 - 0.5) * S.sway * 2, Math.max(g0[1], tg[1]) + S.H * (0.6 + 0.4 * sl.h2), (g0[2] + tg[2]) / 2 + (sl.h2 - 0.5) * S.sway * 3];
        const u = p, iu = 1 - u, arc = 4 * u * iu;
        let c = [0, 1, 2].map((ax) => iu * iu * g0[ax] + 2 * iu * u * mid[ax] + u * u * tg[ax]);
        const tan = norm([0, 1, 2].map((ax) => 2 * iu * (mid[ax] - g0[ax]) + 2 * u * (tg[ax] - mid[ax])));
        let T = [1, 0, 0], B = [0, 0, 1], N = [0, 1, 0];
        [N, B] = rot(N, B, Math.PI / 2 * smoother(u));
        const psi = 2 * Math.PI * S.twist * arc * (sl.h3 > 0.5 ? 1 : -1) + arc * 0.15 * Math.sin(t * 1.4 * ts + i);
        T = rotAxis(T, tan, psi); B = rotAxis(B, tan, psi); N = rotAxis(N, tan, psi);
        const sc = S.scatter * (0.5 + 1.5 * arc);
        if (sc > 0) {
          const yaw = (hash(sl.k, sl.j + 11) - 0.5) * 0.35 * sc + 0.05 * sc * Math.sin(t * 1.7 + i);
          const roll = (hash(sl.k + 5, sl.j - 3) - 0.5) * 0.35 * sc + 0.05 * sc * Math.sin(t * 1.9 + i * 0.7);
          [T, B] = rot(T, B, yaw);
          [N, B] = rot(N, B, roll);
          c = add(c, mul(N, (hash(sl.k, sl.j * 3 + 1) - 0.5) * 0.16 * sc));
        }
        tiles.push({ c, T, B, N, tone: sl.tone, under: sl.under, air: true });
      });
      return tiles;
    }
    function corners(t) {
      const a = P / 2, h = TH / 2, C = t.c, T = t.T, B = t.B, N = t.N;
      const v = (sa, sb, sn) => [C[0] + T[0] * a * sa + B[0] * a * sb + N[0] * h * sn, C[1] + T[1] * a * sa + B[1] * a * sb + N[1] * h * sn, C[2] + T[2] * a * sa + B[2] * a * sb + N[2] * h * sn];
      return [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1), v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1)];
    }
    function hull(pts) {
      pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      lo.pop(); up.pop(); return lo.concat(up);
    }
    function drawFloating(cam, Ld, c, T, B, N, col) {
      const a = P / 2, h = TH / 2, proud = ABOVE;
      const top = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sa, sb]) => [c[0] + T[0] * a * sa + B[0] * a * sb + N[0] * h, c[1] + T[1] * a * sa + B[1] * a * sb + N[1] * h, c[2] + T[2] * a * sa + B[2] * a * sb + N[2] * h]);
      const sides = [[0, 1, mul(B, -1)], [1, 2, T], [2, 3, B], [3, 0, mul(T, -1)]];
      for (const [i0, i1, n] of sides) {
        const mid = mul(add(top[i0], top[i1]), 0.5);
        if (dot(n, sub(cam.pos, mid)) <= 0) continue;
        const s = toScreen(cam, [top[i0], top[i1], sub(top[i1], mul(N, proud)), sub(top[i0], mul(N, proud))]); if (!s) continue;
        ctx.fillStyle = rgb(col, shade(n, Ld) * 0.86); path(ctx, s); ctx.fill();
      }
      const s = toScreen(cam, top); if (!s) return;
      ctx.fillStyle = rgb(col, shade(N, Ld)); path(ctx, s); ctx.fill();
    }

    /* ---------- drops ---------- */
    function spawnDrops(dt, tiles) {
      if (S.drips <= 0 || A < 0.15 || drops.length > 260) return;
      const air = tiles.filter((t) => t.air && t.c[1] > 0.5); if (!air.length) return;
      let n = 34 * S.drips * (1.1 - 0.7 * S.visc) * A * air.length / 90 * dt;
      while (n > 0) {
        if (Math.random() < Math.min(1, n)) {
          const tl = air[Math.random() * air.length | 0];
          const p = add(add(add(tl.c, mul(tl.T, (Math.random() - 0.5) * P * 0.8)), mul(tl.B, (Math.random() - 0.5) * P * 0.8)), mul(tl.N, tl.N[1] > 0 ? -TH / 2 : TH / 2));
          drops.push({ x: p[0], y: p[1], z: p[2], vx: (Math.random() - 0.5) * 0.3, vy: -0.2, vz: (Math.random() - 0.5) * 0.3, r: 0.028 + 0.035 * S.visc + Math.random() * 0.015 });
        }
        n -= 1;
      }
    }
    function updateDrops(dt) {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy -= 9.8 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
        if (d.vy < 0 && d.y <= liquidH(d.x, d.z)) {
          addRipple(d.x, d.z, 0.028 * S.splash * (d.r / 0.045) * Math.min(1.5, -d.vy / 5));
          drops.splice(i, 1);
        }
      }
    }

    /* ---------- frame ---------- */
    function render(tiles, t) {
      const cam = makeCam(), Ld = sunDir();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';
      const { pos, r: cr, u: cu, f: cf, focal, cx, cy } = cam;
      for (const k of usedList) {
        const x = VX[k], z = VZ[k], y = hv[k] = liquidH(x, z);
        const dx = x - pos[0], dy = y - pos[1], dz = z - pos[2];
        const zc = dx * cf[0] + dy * cf[1] + dz * cf[2];
        sz[k] = zc;
        if (zc >= NEAR) { sx[k] = cx + (dx * cr[0] + dy * cr[1] + dz * cr[2]) / zc * focal; sy[k] = cy - (dx * cu[0] + dy * cu[1] + dz * cu[2]) / zc * focal; }
      }
      for (const c of cells) c.d = (c.cx - pos[0]) * cf[0] - pos[1] * cf[1] + (c.cz - pos[2]) * cf[2];
      cells.sort((a, b) => b.d - a.d);
      ctx.lineWidth = 1.2;
      for (const c of cells) {
        const q = c.q;
        const h00 = hv[q[0]], h10 = hv[q[1]], h11 = hv[q[2]], h01 = hv[q[3]];
        c.hc = (h00 + h10 + h11 + h01) / 4;
        c.gx = ((h10 + h11) - (h00 + h01)) / (2 * PITCH);
        c.gz = ((h01 + h11) - (h00 + h10)) / (2 * PITCH);
        let s;
        if (sz[q[0]] >= NEAR && sz[q[1]] >= NEAR && sz[q[2]] >= NEAR && sz[q[3]] >= NEAR) s = q.map((k) => [sx[k], sy[k]]);
        else { s = toScreen(cam, q.map((k) => [VX[k], hv[k], VZ[k]])); if (!s) continue; }
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = ctx.strokeStyle = liquidCol(norm([-c.gx, 1, -c.gz]), [c.cx, c.hc, c.cz], cam, Ld);
        path(ctx, s); ctx.fill(); ctx.stroke();
      }
      const bob = (0.25 + S.swell) * (1.2 - 0.6 * S.visc), ts = LQ.ts;
      const floats = [];
      for (const c of cells) if (!c.trench) floats.push(c);
      const bedded = tiles.filter((tl) => !tl.air).map((tl) => ({ tl, d: dot(sub(tl.c, pos), cf) }));
      const items = floats.concat(bedded).sort((a, b) => b.d - a.d);
      for (const it of items) {
        if (it.tl) { ctx.globalAlpha = 1; drawFloating(cam, Ld, it.tl.c, it.tl.T, it.tl.B, it.tl.N, it.tl.tone); continue; }
        const c = it;
        if (c.hc === undefined) continue;
        const gx = c.gx + 0.03 * bob * Math.sin(t * 1.3 * ts + c.ph1), gz = c.gz + 0.03 * bob * Math.sin(t * 1.1 * ts + c.ph2);
        const N = norm([-gx, 1, -gz]), T = norm([1, gx, 0]), B = norm(cross(T, N));
        const y = c.hc + FLOAT + 0.008 * bob * Math.sin(t * 1.7 * ts + c.ph1 + c.ph2);
        ctx.globalAlpha = c.alpha;
        drawFloating(cam, Ld, [c.cx, y, c.cz], T, B, N, c.tone);
      }
      ctx.globalAlpha = 1;
      const airborne = tiles.filter((tl) => tl.air);
      if (S.shadows && S.dark > 0 && airborne.length) {
        sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, scv.width, scv.height);
        sctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
        sctx.fillStyle = 'rgb(22,28,36)';
        for (const tl of airborne) {
          const g2 = corners(tl).map((p) => { const y = Math.max(0, p[1]); return [p[0] - Ld[0] * y / Ld[1], p[2] - Ld[2] * y / Ld[1]]; });
          const hl = hull(g2); if (hl.length < 3) continue;
          let mx = 0, mz = 0; for (const q of hl) { mx += q[0]; mz += q[1]; }
          const fade = 1 - smooth(R0 - 1, R1, Math.hypot(mx / hl.length, mz / hl.length)); if (fade <= 0) continue;
          const s = toScreen(cam, hl.map((q) => [q[0], 0, q[1]])); if (!s) continue;
          sctx.globalAlpha = fade; path(sctx, s); sctx.fill();
        }
        sctx.globalAlpha = 1;
        ctx.save();
        ctx.globalAlpha = S.dark;
        if (hasFilter) { const bpx = S.soft * focal / S.dist * 0.55; ctx.filter = bpx > 0.3 ? `blur(${bpx.toFixed(1)}px)` : 'none'; }
        ctx.drawImage(scv, 0, 0, W, H);
        ctx.restore();
      }
      const order = airborne.map((tl) => ({ tl, d: dot(sub(tl.c, pos), cf) }));
      for (const dr of drops) order.push({ dr, d: (dr.x - pos[0]) * cf[0] + (dr.y - pos[1]) * cf[1] + (dr.z - pos[2]) * cf[2] });
      order.sort((a, b) => b.d - a.d);
      ctx.lineCap = 'round';
      for (const o of order) {
        if (o.dr) {
          const d = o.dr, sp = Math.hypot(d.vx, d.vy, d.vz), tail = Math.min(0.35, 0.015 + sp * 0.03);
          const head = [d.x, d.y, d.z], back = [d.x - d.vx / (sp || 1) * tail, d.y - d.vy / (sp || 1) * tail, d.z - d.vz / (sp || 1) * tail];
          if (o.d < NEAR + 0.5) continue;
          const s = toScreen(cam, [head, back, head]); if (!s) continue;
          const wpx = Math.max(1.2, d.r * 2 * focal / o.d);
          ctx.strokeStyle = rgb(DEEP, 1.15); ctx.lineWidth = wpx;
          ctx.beginPath(); ctx.moveTo(s[1][0], s[1][1]); ctx.lineTo(s[0][0], s[0][1]); ctx.stroke();
          ctx.fillStyle = 'rgba(225,230,230,0.8)';
          ctx.beginPath(); ctx.arc(s[0][0] - wpx * 0.15, s[0][1] - wpx * 0.15, Math.max(0.6, wpx * 0.18), 0, 6.283); ctx.fill();
          continue;
        }
        const tl = o.tl, p = corners(tl);
        const faces = [
          [[p[0], p[1], p[2], p[3]], tl.N, tl.tone],
          [[p[4], p[5], p[6], p[7]], mul(tl.N, -1), tl.under],
          [[p[0], p[1], p[5], p[4]], mul(tl.B, -1), null],
          [[p[3], p[2], p[6], p[7]], tl.B, null],
          [[p[1], p[2], p[6], p[5]], tl.T, null],
          [[p[0], p[3], p[7], p[4]], mul(tl.T, -1), null]
        ];
        for (const [pts, n, col] of faces) {
          const c = mul(add(pts[0], pts[2]), 0.5);
          if (dot(n, sub(pos, c)) <= 0) continue;
          const s = toScreen(cam, pts); if (!s) continue;
          const base = col || [tl.tone[0] * 0.9, tl.tone[1] * 0.9, tl.tone[2] * 0.88];
          ctx.fillStyle = ctx.strokeStyle = rgb(base, shade(n, Ld));
          ctx.lineWidth = 0.8; path(ctx, s); ctx.fill(); ctx.stroke();
        }
      }
    }

    /* ---------- peel cycle: slow peel, hold, then a falling slap ---------- */
    function cycle(ph) {
      ph = ((ph % 1) + 1) % 1;
      if (ph < 0.08) return 0;
      if (ph < 0.4) return smoother((ph - 0.08) / 0.32);
      if (ph < 0.64) return 1;
      if (ph < 0.8) { const x = (ph - 0.64) / 0.16; return 1 - x * x; }
      return 0;
    }

    /* ---------- playback: on only while visible, never for reduced motion unless asked ---------- */
    let wantPlay = !reduce, inView = true, pageVisible = !document.hidden, raf = 0, last = 0, alive = true;
    const running = () => wantPlay && inView && pageVisible;
    function frame(now) {
      raf = 0;
      if (!cvs.isConnected) { stop(); return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (running()) { phase = (phase + dt / PERIOD) % 1; A = cycle(phase); time += dt; dirty = true; }
      if (dirty && W > 1) {
        setLQ(time);
        const tiles = buildStrip(A, time);
        if (running()) { updateDrops(dt); spawnDrops(dt, tiles); }
        render(tiles, time);
        dirty = false;
      }
      if (running() || dirty) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && alive) { last = 0; raf = requestAnimationFrame(frame); } }
    const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; kick(); }, { threshold: 0.05 });
    io.observe(cvs);
    const onVis = () => { pageVisible = !document.hidden; kick(); };
    document.addEventListener('visibilitychange', onVis);
    const ro2 = new ResizeObserver(() => kick()); ro2.observe(cvs);
    function stop() {
      alive = false; if (raf) cancelAnimationFrame(raf); raf = 0;
      io.disconnect(); ro.disconnect(); ro2.disconnect(); document.removeEventListener('visibilitychange', onVis);
    }
    kick();
    return {
      play() { wantPlay = true; kick(); },
      pause() { wantPlay = false; },
      playing: () => wantPlay
    };
  };
})(window.Sandbox);
