// Mouhon salaisuus -- Moottori: kuvaefektit ja taustaelämä (25.10.).
"use strict";
// Monkey Island 2:n (SCUMM v5, mk2_reference/) huonedatasta: 73 % huoneista on z-tasot, puolessa
// skaalaus, keskimäärin kuusi huoneskriptiä taustaelämälle (ohikulkijat, liekit, vesi) ja huoneiden
// välillä iiris- ja laatikkosiirtymät. Tässä samat keinot pienenä:
//   * transition(kind, dir)  iiris, häivytys tai laatikko; go() avaa uuden ruudun itse (room.enterFx)
//   * shake(ms, amp), flash(c, ms)  tärinä ja välähdys kohtauksiin (pamahdus, putoaminen)
//   * room.light  pimeä ruutu valonlähteineen, Bayer-ditheröitynä VGA-tapaan
//   * weather(kind, t)  sade, lumi, pöly ja leijuvat hiukkaset tilattomasti ajasta t
//   * closeUp(draw)  lähikuva esineestä tai kyltistä repliikkien ajaksi
//   * cyc(cols, i, t, ms)  väriensiirto (color cycling): neonit, vesi, taulut
//   * flock(name, birds, t)  maassa nokkivat linnut, jotka pyrähtävät pelaajan lähestyessä
//   * room.extras  vaeltavat sivuhahmot reittiä pitkin (tilattomia, piirtyvät syvyysjärjestyksessä)
const FX = { tr: null, shake: null, flash: null };
const NOFX = (TEST && !new URLSearchParams(location.search).has("efektit")) || new URLSearchParams(location.search).has("nayta");   // testi (paitsi &efektit) ja esikatselukuvat ilman siirtymiä

// ---------------------------------------------------------------- siirtymät
// dir "out" peittää kuvan, "in" paljastaa sen. Iiris keskittyy pelaajaan (tai cx, cy).
function transition(kind = "iris", dir = "out", ms = 520, cx, cy) {
  if (NOFX || !kind) return Promise.resolve();
  return new Promise((res) => { FX.tr = { kind, dir, ms, t0: performance.now(), cx, cy, res }; });
}
async function goFx(scene, x, keep, y, kind = "iris") { await transition(kind, "out"); go(scene, x, keep, y, kind); }
// Häivytyksen 17 tasoa 4 x 4 -Bayer-kuvioina: koko ruudun täyttö yhdellä fillRectillä.
const FADE = [];
function fadePat(k) { if (FADE[k]) return FADE[k]; const c = document.createElement("canvas"); c.width = c.height = 4; const x = c.getContext("2d"); x.fillStyle = "#000";
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (BAYER[j * 4 + i] < k / 16) x.fillRect(i, j, 1, 1);
  return (FADE[k] = main.createPattern(c, "repeat")); }
function drawTransition(t) {
  const T = FX.tr; if (!T) return;
  let k = Math.min(1, (t - T.t0) / T.ms); const cover = T.dir === "out" ? k : 1 - k;   // 0 = näkyvissä, 1 = musta
  g.save(); g.setTransform(PXS, 0, 0, PXS, 0, 0); g.fillStyle = "#000";
  if (T.kind === "fade") { g.fillStyle = fadePat(Math.round(cover * 16)); g.fillRect(0, 0, W, H); }
  else if (T.kind === "box") { const bw = Math.round(W / 2 * (1 - cover)), bh = Math.round(H / 2 * (1 - cover));   // MI2:n laatikko kutistuu kohti keskustaa
    r(0, 0, W, H / 2 - bh, "#000"); r(0, H / 2 + bh, W, H / 2 - bh + 1, "#000"); r(0, 0, W / 2 - bw, H, "#000"); r(W / 2 + bw, 0, W / 2 - bw + 1, H, "#000"); }
  else { const cx = T.cx ?? st.x + camOff(), cy = T.cy ?? st.y - 20 * depth(st.y), R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * (1 - cover);
    // porrastettu ympyrä 2 px:n riveinä (pikselitaidetta, ei sileää reunaa)
    for (let y = 0; y < H; y += 2) { const d = y + 1 - cy, hw = R > Math.abs(d) ? Math.round(Math.sqrt(R * R - d * d)) : -1;
      if (hw < 0) r(0, y, W, 2, "#000"); else { r(0, y, Math.max(0, cx - hw), 2, "#000"); r(cx + hw, y, W, 2, "#000"); } } }
  g.restore();
  if (k >= 1) { FX.tr = T.dir === "out" ? { ...T, hold: true } : null; if (!T.done) { T.done = true; T.res(); } }
  if (T.hold) r(0, 0, W, H, "#000");
}

// ---------------------------------------------------------------- tärinä ja välähdys
function shake(ms = 420, amp = 3) { if (!NOFX) FX.shake = { t0: performance.now(), ms, amp }; return sleep(ms); }
function flash(c = "#fff8e0", ms = 220) { if (!NOFX) FX.flash = { t0: performance.now(), ms, c }; }
function fxBegin(t) {       // koko kuvan siirto tärinässä; fxEnd palauttaa
  const S = FX.shake; g.save(); if (!S) return; const k = (t - S.t0) / S.ms; if (k >= 1) { FX.shake = null; return; }
  const a = S.amp * (1 - k); g.translate(Math.round((Math.random() * 2 - 1) * a), Math.round((Math.random() * 2 - 1) * a));
}
function fxEnd(t) {
  g.restore(); const F = FX.flash;
  if (FX.close) { const C = FX.close, k = ease((t - C.t0) / 240), sc = .55 + .45 * k;     // lähikuva ponnahtaa esiin himmennetyn ruudun päälle
    g.fillStyle = fadePat(Math.round(k * 8)); g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, H / 2 + 4); g.scale(sc, sc); g.translate(-W / 2, -H / 2 - 4); C.draw(t); g.restore(); }
  if (F) { const k = (t - F.t0) / F.ms; if (k >= 1) FX.flash = null; else { g.globalAlpha = (1 - k) * .85; r(0, 0, W, H, F.c); g.globalAlpha = 1; } }
  drawTransition(t);
}

// ---------------------------------------------------------------- lähikuvat
// MI2:n tapaan esine, kirje tai kyltti näytetään isona kuvana ruudun päällä, ja repliikit kulkevat
// sen päällä. closeUp(draw) palauttaa sulkijan; showClose(draw, fn) pitää kuvan fn:n ajan.
function closeUp(draw) { const C = { draw, t0: performance.now() }; FX.close = C; logLine("[lähikuva]"); return () => { if (FX.close === C) FX.close = null; }; }
async function showClose(draw, fn) { const done = closeUp(draw); try { await fn(); } finally { done(); } }

// ---------------------------------------------------------------- valaistus
// room.light = { amb: [r, g, b, a], lights: (t) => [[x, y, säde, voima 0..1], ...], player: säde }
// Pimeys lasketaan 320 x 136 -kuvaksi pikseleittäin: valo heikkenee neliöllisesti, ja tummuus
// porrastetaan neljään tasoon Bayer-kuviolla, jolloin valokehät ovat ditheröityjä renkaita
// kuten VGA-peleissä eivätkä sileitä liukuja. Kuva piirtyy 2x:nä teräväreunaisena.
const LIGHT = { c: null, img: null };
function drawLight(L, t) {
  if (!LIGHT.c) { LIGHT.c = document.createElement("canvas"); LIGHT.c.width = W; LIGHT.c.height = H; LIGHT.x = LIGHT.c.getContext("2d"); LIGHT.img = LIGHT.x.createImageData(W, H);
    LIGHT.d32 = new Uint32Array(LIGHT.img.data.buffer); LIGHT.lit = new Float32Array(W * H); }
  const [ar, ag, ab, aa] = L.amb ?? [8, 6, 24, .62], src = [...(L.lights?.(t) ?? [])], d32 = LIGHT.d32, lit = LIGHT.lit;
  if (L.player) src.push([st.x, st.y - 22 * depth(st.y), L.player * depth(st.y), 1]);
  // 25.10.: 9,6 ms -> pohja yhdellä täytöllä (täysi pimeys ei riipu ditheristä), valot vain rajauslaatikoissaan
  const px32 = (lv) => (((255 * aa * lv / 4) & 255) << 24 | ab << 16 | ag << 8 | ar) >>> 0, LV = [0, 1, 2, 3, 4].map(px32);
  d32.fill(LV[4]); lit.fill(0);
  const box = (lx, ly, rad) => [Math.max(0, Math.floor(lx - rad)), Math.min(W - 1, Math.ceil(lx + rad)), Math.max(0, Math.floor(ly - rad)), Math.min(H - 1, Math.ceil(ly + rad))];
  for (const [lx, ly, rad, pw = 1] of src) { if (pw <= 0) continue; const [x0, x1, y0, y1] = box(lx, ly, rad), r2 = 1 / (rad * rad);
    for (let y = y0; y <= y1; y++) { const dy = (y - ly) * (y - ly), o = y * W; for (let x = x0; x <= x1; x++) { const q = ((x - lx) * (x - lx) + dy) * r2; if (q < 1) { const v = (1 - q) * pw; if (v > lit[o + x]) lit[o + x] = v; } } } }
  for (const [lx, ly, rad, pw = 1] of src) { if (pw <= 0) continue; const [x0, x1, y0, y1] = box(lx, ly, rad);
    for (let y = y0; y <= y1; y++) { const o = y * W, bj = (y & 3) * 4; for (let x = x0; x <= x1; x++) { const v = lit[o + x]; if (v > 0) d32[o + x] = LV[Math.min(4, Math.floor((1 - v) * 4 + BAYER[bj + (x & 3)]))]; } } }
  LIGHT.x.putImageData(LIGHT.img, 0, 0); g.drawImage(LIGHT.c, 0, 0);
  for (const [lx, ly, rad, pw = 1, rgb] of src) if (rgb && pw > 0) glow(lx, ly, rad * .5, rgb, .18 * pw);   // värillinen kajo valon ytimeen
}
// Liekin lepatus valonlähteen voimaksi: tasainen perusvalo ja kaksi eri tahtiin huojuvaa siniaaltoa.
const flicker = (t, ph = 0) => .86 + .08 * Math.sin(t / 90 + ph) + .06 * Math.sin(t / 37 + ph * 3);

// ---------------------------------------------------------------- sää ja hiukkaset
// Tilaton: hiukkasen i paikka lasketaan ajasta, joten sama funktio toimii naapuriruuduissa ja
// esikatselukuvissa. opts: n (määrä), y0..y1 (korkeusvyö), c (väri), wind (vaakaliike).
const hsh = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function weather(kind, t, { n = 60, y0 = 0, y1 = H, c, wind = 0, x0 = 0, x1 = W } = {}) {
  const s = t / 1000, ww = x1 - x0, hh = y1 - y0;
  for (let i = 0; i < n; i++) {
    const a = hsh(i, 1), b = hsh(i, 2), sp = .6 + hsh(i, 3) * .8;
    if (kind === "rain") { const y = y0 + (b * hh + s * 190 * sp) % hh, x = x0 + ((a * ww + (y - y0) * (wind || .25)) % ww + ww) % ww;
      r(x, y, 1, 3 + sp * 2, c ?? "rgba(170,190,230,.55)"); }
    else if (kind === "snow") { const y = y0 + (b * hh + s * 16 * sp) % hh, x = x0 + ((a * ww + Math.sin(s * 1.3 + i) * 5 + s * wind) % ww + ww) % ww;
      r(x, y, sp > 1.1 ? 2 : 1, sp > 1.1 ? 2 : 1, c ?? "#e8ecf8"); }
    else if (kind === "dust") { const x = x0 + ((a * ww + s * (wind || 14) * sp) % ww + ww) % ww, y = y0 + b * hh + Math.sin(s * .9 + i) * 3;    // tuulen kuljettama pöly
      px(x, y, c ?? "rgba(236,204,150,.7)"); if (sp > 1.2) px(x - 1, y, "rgba(236,204,150,.35)"); }
    else if (kind === "motes") { const x = x0 + a * ww + Math.sin(s * .5 + i * 2) * 6, y = y0 + ((b * hh - s * 3 * sp) % hh + hh) % hh;   // valokeilassa leijuva pöly
      if (Math.sin(s * 2 + i) > -.3) px(x, y, c ?? "rgba(255,240,200,.8)"); }
  }
}

// ---------------------------------------------------------------- parvi
// Linnut nokkivat maassa ja pyrähtävät lentoon, kun pelaaja tulee lähelle; palaavat liitäen, kun
// pelaaja on kauempana. birds = [[x, y], ...] kotipaikat; tila FLOCKS-taulussa nimen mukaan.
const FLOCKS = {};
function flock(name, birds, t, { R = 28, c = "#8c8c9c", d = "#5c5c6c", away = 7000 } = {}) {
  const F = FLOCKS[name] ??= { t0: -1e9, dir: 1 }, cx = birds.reduce((a, b) => a + b[0], 0) / birds.length, cy = birds.reduce((a, b) => a + b[1], 0) / birds.length;
  const near = !NOFX && Math.hypot(st.x - cx, (st.y - cy) * 1.5) < R; let u = t - F.t0;     // esikatselukuvissa linnut pysyvät maassa
  if (near && u >= away + 1600) { F.t0 = t; F.dir = st.x < cx ? 1 : -1; u = 0; if (!TEST) [0, 60, 130].forEach((ms) => setTimeout(() => beep(1500 + ms * 3, 40, "triangle", .018), ms)); }
  else if (near && u >= away) { F.t0 = t - 2000; u = 2000; }                 // pelaaja yhä lähellä: pysyvät poissa
  birds.forEach(([hx, hy], i) => {
    const v = u - i * 90, flap = Math.floor(t / 80 + i) % 2;
    const air = (x, y) => { r(x, y, 3, 2, c); px(x - 1, y - 1 - flap * 2, c); px(x - 2, y - 2 + flap * 3, d); px(x + 3, y - 1 - flap * 2, c); px(x + 4, y - 2 + flap * 3, d); };
    if (v >= 0 && v < 2000) { const k = v / 2000; air(Math.round(hx + F.dir * k * 170 + Math.sin(k * 9 + i) * 3), Math.round(hy - k * k * 120 - k * 18)); }
    else if (v >= away && v < away + 1600) { const k = (v - away) / 1600, q = 1 - k; air(Math.round(hx - F.dir * q * 130), Math.round(hy - q * q * 90)); }
    else if (v < 0 || v >= away + 1600) { const hop = Math.max(0, Math.sin(t / 260 + i * 1.3)) * 1.5, pk = Math.floor(t / 300 + i * 2) % 7 === 0;   // nokkii
      r(hx, hy - hop, 4, 3, c); px(hx + 4, hy - hop + (pk ? 2 : 0), d); px(hx - 1, hy - hop + 1, d); }
  });
}

// ---------------------------------------------------------------- väriensiirto
// cyc(["#a", "#b", "#c"], i, t, 120): kohdan i väri, kun paletti kiertää 120 ms:n välein
// (SCUMMin CYCL-lohko: vesi, neonit, lamput ilman piirron muutosta).
const cyc = (cols, i, t, ms = 140) => cols[((i + Math.floor(t / ms)) % cols.length + cols.length) % cols.length];

// ---------------------------------------------------------------- vaeltavat sivuhahmot
// room.extras = [{ path: [[x, y], ...], speed: px/s, wait: ms päätepisteissä, draw: (x, y, t, { moving, dir, back, sc }) }]
// Kulkija kulkee reitin edestakaisin ja seisahtaa päissä; paikka lasketaan ajasta (ei tilaa).
// hidden: () => true piilottaa (esim. kohtauksen ajaksi).
function extraPos(e, t) {
  const P = e.path, seg = []; let len = 0;
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], (P[i][1] - P[i - 1][1]) * 1.5); seg.push(l); len += l; }
  const tGo = len / (e.speed ?? 22) * 1000, wait = e.wait ?? 1500, per = 2 * (tGo + wait), u = ((t + (e.ph ?? 0)) % per + per) % per;
  const back = u >= tGo + wait, v = back ? u - tGo - wait : u;
  if (v >= tGo) { const [x, y] = back ? P[0] : P[P.length - 1]; return { x, y, moving: false, dir: e.face ?? 1, away: false }; }
  let d = (back ? 1 - v / tGo : v / tGo) * len;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, d / seg[i]) : 0, [ax, ay] = P[i], [bx, by] = P[i + 1];
    const dx = (bx - ax) * (back ? -1 : 1), dy = (by - ay) * (back ? -1 : 1);
    return { x: lerp(ax, bx, k), y: lerp(ay, by, k), moving: true, dir: dx < 0 ? -1 : 1, away: dy < 0 && Math.abs(dy) * 1.5 > Math.abs(dx) }; } d -= seg[i]; }
}
const extrasOf = (s, t) => (s.extras ?? []).filter((e) => !e.hidden?.()).map((e) => { const p = extraPos(e, t);
  return { y: p.y, draw: () => { const sc = depth(p.y); e.draw(p.x, p.y, t, { moving: p.moving, dir: p.dir, back: p.away, sc }); } }; });
