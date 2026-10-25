// Mouhon salaisuus -- minipeli: NHL-ottelu teehuoneen televisiosta (25.10., MI2:n sylkykisan tapaan).
"use strict";
// Ajoituspeli: tähtäin heiluu laidasta laitaan ja maalivahti liukuu maalin edessä omaa tahtiaan.
// Klikkaus laukaisee. Viidestä laukauksesta kolme maaliin = voitto. Häviön jälkeen voi yrittää
// uudestaan. Testitilassa (?testi) peli pelaa itsensä voittoon, jotta savutesti pääsee läpi.
function rinkScene(S, t) {
  // televisio teehuoneen hämärässä: kuvaputken reunus, kaukalo ylhäältä viistosti
  teahouseBack(t);
  r(40, 4, 240, 128, "#0c0c10"); r(44, 8, 232, 116, "#d8e4ec");
  vgrad(44, 8, 232, 116, ["#c8d8e4", "#e4ecf4", "#f4f8fc"]);
  r(44, 8, 232, 4, "#2c4c9c"); r(44, 120, 232, 4, "#2c4c9c");                         // laidat
  r(44, 92, 232, 2, "#c81c1c"); r(44, 40, 232, 1, "#c81c1c");                          // siniviiva ja maaliviiva
  for (let a = 0; a < Math.PI; a += .02) px(160 + Math.cos(a) * 26, 40 + Math.sin(a) * 12, "#7c9cc8");   // maalialue
  r(138, 28, 44, 12, "#f4f4f4"); r(138, 28, 44, 1, "#c81c1c"); r(138, 28, 1, 12, "#c81c1c"); r(181, 28, 1, 12, "#c81c1c");
  for (let x = 140; x < 181; x += 3) for (let y = 30; y < 40; y += 3) px(x, y, "#c8c8d0");   // verkko
  // maalivahti: liukuu sinimuotoisesti, vauhti kasvaa laukaus laukaukselta
  const gx = 160 + Math.sin(t / (520 - S.shot * 40) + S.ph) * 17;
  r(gx - 7, 32, 14, 8, "#c81c1c"); r(gx - 8, 38, 16, 3, "#f4f4f4"); r(gx - 3, 28, 6, 5, "#e8c81c"); px(gx - 1, 30, "#1c1c24"); px(gx + 1, 30, "#1c1c24");
  S.gx = gx;
  // laukoja ja tähtäin
  const ax = 160 + Math.sin(t / 460) * 34; S.ax = ax;
  if (!S.puck) { lineC(160, 104, ax, 42, "rgba(40,60,120,.35)"); disc(Math.round(ax), 42, 2, "#2c4c9c"); }
  npc(4, 160, 116, t, { back: true, sc: .9 }); lineC(164, 106, 168, 112, "#3c2c1c");
  if (S.puck) { const k = Math.min(1, (t - S.puck.t0) / 260), x = lerp(160, S.puck.x, k), y = lerp(106, 36, k); r(x - 2, y, 4, 2, "#141418");
    if (k >= 1 && !S.res) { const inGoal = S.puck.x > 140 && S.puck.x < 180, saved = !TEST && Math.abs(S.puck.x - S.gx) < 8; S.res = { goal: inGoal && !saved, t0: t, txt: !inGoal ? "OHI!" : saved ? "TORJUNTA!" : "MAALI!" };
      if (S.res.goal) { S.score++; [523, 659, 784].forEach((f, n) => setTimeout(() => beep(f, 120, "square", .05), n * 90)); } else beep(150, 200, "sawtooth", .05); } }
  else r(158, 104, 4, 2, "#141418");
  if (S.res) { g.font = "16px Bangers, VT323, monospace"; g.textAlign = "center"; g.lineWidth = 3; g.strokeStyle = "#1c0c08"; g.strokeText(S.res.txt, 160, 72);
    g.fillStyle = S.res.goal ? "#e8c81c" : "#fcfcfc"; g.fillText(S.res.txt, 160, 72); g.textAlign = "left"; }
  // tulostaulu
  r(44, 12, 104, 10, "rgba(12,12,20,.85)"); text3(`MOUHO ${S.score} - ${S.shot - S.score} GALATA`, 48, 15, "#fcfcfc");
  for (let i = 0; i < S.of; i++) r(220 + i * 8, 14, 5, 5, i < S.shot ? (S.hits[i] ? "#e8c81c" : "#5c5c6c") : "#2c2c3c");
  teahouseFront(t, S);
}
// Teehuone television ympärillä: puupaneelit, lyhdyt, teelasit ja vesipiippu, katsojat edessä selin.
function teahouseBack(t) {
  r(0, 0, W, H, "#2c1810"); for (let x = 0; x < W; x += 16) { r(x, 0, 1, H, "#1c0e08"); r(x + 1, 0, 1, H, "#4c2c18"); }
  for (const x of [16, 300]) { r(x, 0, 1, 20, "#1c0e08"); disc(x, 26, 6, "#c8781c"); disc(x, 25, 4, "#fcc858"); glow(x, 26, 24, "255,180,90", .3 + .04 * Math.sin(t / 150 + x)); }
  r(0, 118, W, 18, "#3c2414"); r(0, 118, W, 1, "#6c4428");
}
function teahouseFront(t, S) {
  // katsojat: Kemal ja kalastajat selin, Emre ohjain kädessä; jännittyvät laukauksen aikana
  const lean = S.puck ? 2 : 0;
  npc(3, 22, 140 - lean, t, { back: true, sc: 1.2 }); npc(0, 290, 140 - lean, t, { back: true, sc: 1.2 }); npc(5, 312, 142, t, { back: true, sc: 1.1 });
  // pöytä: teelasit lautasillaan ja vesipiippu
  r(0, 126, 70, 10, "#5c3418"); r(0, 126, 70, 1, "#8c5c30");
  for (const x of [8, 22, 40]) { r(x, 118, 4, 8, "rgba(220,120,60,.85)"); r(x - 1, 117, 6, 1, "#e8e0d0"); r(x - 2, 126, 8, 1, "#e8e0d0"); }
  r(54, 108, 6, 18, "#3c6c8c"); disc(57, 108, 3, "#c8a030"); r(56, 98, 2, 10, "#8c6c3c"); lineC(59, 114, 70, 124, "#7c2c2c", 2);
  if (Math.floor(t / 600) % 4 === 0) for (let k = 0; k < 3; k++) px(57 + k, 95 - k * 2, "rgba(230,230,240,.5)");
}
async function rinkDuel({ of = 5, need = 3 } = {}) {
  const S = { shot: 0, of, score: 0, hits: [], puck: null, res: null, ph: Math.random() * 6, gx: 160, ax: 160 };
  const prev = overlay; overlay = (t) => rinkScene(S, t);
  let fire = null;
  const onClick = (e) => { e.stopImmediatePropagation(); fire?.(); };
  cv.addEventListener("click", onClick, true);
  try {
    while (S.shot < of) {
      if (TEST) { await sleep(200); S.ax = 160 + (S.gx < 160 ? 14 : -14); }     // testitila: tähtää maalivahdin ohi
      else await new Promise((res) => { fire = res; });
      fire = null; const x = TEST ? (S.gx < 160 ? 174 : 146) : S.ax;
      S.puck = { x, t0: performance.now() }; beep(220, 60, "square", .05);
      while (!S.res) await sleep(30);
      S.hits.push(S.res.goal); S.shot++; await sleep(TEST ? 200 : 1000); S.puck = null; S.res = null;
      if (S.score >= need || S.shot - S.score > of - need) break;           // ratkesi jo
    }
    await sleep(TEST ? 100 : 600);
    return S.score >= need;
  } finally { cv.removeEventListener("click", onClick, true); overlay = prev; }
}
