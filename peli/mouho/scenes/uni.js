// Mouhon salaisuus -- uni lennolla Istanbuliin (25.10., Monkey Island 2:n unijakson tapaan).
"use strict";
// MI2:ssa Guybrush näkee unta luurankovanhemmistaan, ja uni opettaa vihjeen myöhempään. Täällä Jussi
// nukahtaa koneessa ja näkee unta jäsenpyramidistaan: kaikki kysyvät "mitä me saamme?", pyramidi
// keikahtaa ylösalaisin ja muuttuu kaavioksi. Jussi ei ymmärrä sitä vielä -- loppu lunastaa sen.
function cabinDraw(t, sleepy) {
  // lähikuva ikkunapaikalta: kaareva ikkuna pilvineen, sininen niskatuki ja Jussi nukkumassa pää ikkunaa vasten
  vgrad(0, 0, W, H, ["#d8d4cc", "#c8c4bc", "#b4b0a8"]); dither(0, 100, W, 36, "#b4b0a8", "#a8a49c", .3);
  r(28, 14, 92, 84, "#8c8a84"); r(30, 16, 88, 80, "#9c9a94");
  g.save(); g.beginPath(); g.ellipse(74, 56, 38, 34, 0, 0, 7); g.clip();
  vgrad(30, 16, 88, 80, ["#3c7cd0", "#7cb4ec", "#c8e0f8", "#f4f8fc"]);
  for (let k = 0; k < 5; k++) { const cx = 20 + ((t / (30 + k * 6) + k * 37) % 130), cy = 50 + k * 8; disc(Math.round(cx), cy, 6 + k, "#fcfcfc"); disc(Math.round(cx + 8), cy + 2, 5 + k, "#eef2f8"); disc(Math.round(cx - 6), cy + 3, 4 + k, "#e0e8f4"); }
  g.restore(); g.strokeStyle = "#6c6a64"; g.lineWidth = 2; g.beginPath(); g.ellipse(74, 56, 38, 34, 0, 0, 7); g.stroke();
  r(150, 20, 70, 110, "#2c4c8c"); r(150, 20, 70, 4, "#4c6cac"); r(156, 22, 58, 12, "#e8e4dc"); r(156, 22, 58, 2, "#ffffff");   // istuin ja niskatyyny
  fillPoly([[136, 136], [140, 112], [160, 102], [204, 102], [224, 112], [228, 136]], "#c8a460");                        // hartiat, SaiPa-kaulus ja paidan laskos
  fillPoly([[204, 102], [224, 112], [228, 136], [214, 136]], "#a88440"); r(164, 100, 36, 6, "#fcd41c"); r(178, 106, 6, 30, "#a88440");
  const img = faceImg("jussi", "world", sleepy ? { blink: true } : {}), k = 2.4, tilt = sleepy ? -.28 + Math.sin(t / 1600) * .04 : 0;
  g.save(); g.imageSmoothingEnabled = false; g.translate(182, 104); g.rotate(tilt); g.scale(k, k);
  g.drawImage(img, -img.width / PXS / 2, -img.height / PXS + 2, img.width / PXS, img.height / PXS); g.restore();
  if (sleepy) for (let q0 = 0; q0 < 3; q0++) { const q = ((t / 1400 + q0 / 3) % 1); text3("Z", 214 + q * 22 + q0 * 2, 50 - q * 30, `rgba(60,60,90,${1 - q})`, 2 + (q0 % 2)); }
  else { const tw = text3w("TURVAVYÖ"); r(262, 30, tw + 8, 14, "#1c1c24"); text3("TURVAVYÖ", 266, 35, "#fcd41c"); }          // laskeutumisen merkkivalo
}
function dreamDraw(t, flip) {
  // unen taivas: kiertävät väriraidat (fx.js cyc) ja tähtiä
  const C = ["#2c1450", "#3c1c5c", "#5c2c7c", "#7c3488", "#8c3c8c", "#7c3488", "#5c2c7c", "#3c1c5c"];
  for (let y = 0; y < H; y += 2) { const a = cyc(C, y >> 3, t, 220), b = cyc(C, (y >> 3) + 1, t, 220); for (let x = 0; x < W; x += 2) r(x, y, 2, 2, bay(x >> 1, y >> 1) < ((y >> 1) & 3) / 4 ? b : a); }
  for (let k = 0; k < 20; k++) px((k * 73) % W, (k * 37) % 90, (Math.floor(t / 300) + k) % 3 ? "#fcf0c8" : "#8c6cac");
  // pyramidi päistä: 1 + 2 + 4 + 8, Jussi huipulla; flip 0..1 kääntää sen ylösalaisin. Rivit ovat
  // erillään ja jokainen pää on alarivin parin keskellä (25.10.: hahmot olivat päällekkäin), joten
  // käännettynä rivien väleihin piirtyvät viivat tekevät siitä turnauskaavion.
  const P = DREAM_PYR, cy = (P.y0 - 3 * P.dy - P.fig + P.y0) / 2, alpha = flip > .5 ? Math.min(1, (flip - .5) * 4) : 0;
  const sq = 1 - .45 * Math.sin(flip * Math.PI);           // kääntyessä pienempi: leveä pyramidi ei karkaa ruudun ylä- ja alareunan yli
  g.save(); g.translate(160, cy); g.rotate(flip * Math.PI); g.scale(sq, sq); g.translate(-160, -cy);
  if (alpha) { g.globalAlpha = alpha; for (let row = 3; row > 0; row--) {        // viivat parin päälaelta rivien väliin
    const top = P.y0 - (3 - row) * P.dy - P.fig, gap = top - (P.dy - P.fig) / 2;
    for (let i = 0; i < 2 ** row; i += 2) { const xa = dreamX(row, i), xb = dreamX(row, i + 1);
      lineC(xa, top, xa, gap, "#fcf0c8"); lineC(xb, top, xb, gap, "#fcf0c8"); lineC(xa, gap, xb, gap, "#fcf0c8"); } }
    g.globalAlpha = 1; }
  for (let row = 0; row < 4; row++) { const y = P.y0 - (3 - row) * P.dy;
    for (let i = 0; i < 2 ** row; i++) { const x = dreamX(row, i);
      if (row === 0) jussi(x, y, 1, 0, {}, .5); else npc((i + row * 3) % 6, x, y, t, { sc: .5, talking: Math.floor(t / 400 + i) % 3 === 0 }); } }
  g.restore();
}
const DREAM_PYR = { y0: 134, dy: 27, fig: 23, dx: 20 };      // alarivin jalat, rivien väli, hahmon korkeus, alarivin väli
const dreamX = (row, i) => 160 + (i - (2 ** row - 1) / 2) * DREAM_PYR.dx * 2 ** (3 - row);
async function flightDream() {
  const T0 = performance.now(); let phase = "cabin", flipT = 0, wake = false;
  overlay = (t) => {
    if (phase === "cabin") cabinDraw(t, !wake);
    else dreamDraw(t, flipT ? ease((performance.now() - flipT) / 1400) : 0);
  };
  callSpk = { jussi: { x: 175, y: 48, c: "#c8a460" } };     // kupla pään yläpuolelle, ei kasvojen päälle
  await say("Jossain Mustanmeren yllä. Matkustaja Markkanen on nukahtanut ennen kuin turvavyövalo ehti sammua.", "muu");
  await transition("fade", "out"); phase = "dream"; FX.tr = null; transition("fade", "in");
  // Jussi huipulla (pää y ~30), kuoro vasemmalta ylhäältä rivien yläpuolelta (25.10.: kuplat hahmojen päällä)
  callSpk = { jussi: { x: 160, y: 30, c: "#c8a460" }, kuoro: { x: 60, y: 40, c: "#d8c8f0" } };
  await say("Huipulla! Minä olen huipulla! Jokainen tuo kaksi uutta, ja he kaksi uutta!");
  await say("Mitä me saamme? Mitä me saamme? Mitä me saamme?", "kuoro");
  await say("Te saatte... tuota... huipun! Eikun... minut!");
  shake(900, 3); await say("Mitä me saamme? MITÄ ME SAAMME?", "kuoro");
  flipT = performance.now(); beep(330, 300, "triangle", .05); setTimeout(() => beep(220, 400, "triangle", .05), 300); await sleep(1600);
  await say("Pyramidi keikahtaa ylösalaisin. Ja yhtäkkiä se näyttää joltain aivan muulta.", "muu");
  callSpk = { jussi: { x: 262, y: 112, c: "#c8a460" } };     // käännetyn kaavion sivulle
  await say("Hetkinen, tämähän on kuin...");
  flash("#ffffff", 300); await transition("fade", "out"); phase = "cabin"; wake = true; FX.tr = null; transition("fade", "in");
  callSpk = { jussi: { x: 175, y: 48, c: "#c8a460" } };
  await say("Hyvät matkustajat, olemme laskeutumassa Istanbuliin. Kiitos, että lensitte kanssamme.", "muu");
  await say("Mikä uni. Ylösalaisin käännetty pyramidi... Ei. Ei se tarkoita mitään. Pyramidi on pyramidi.");
  callSpk = null; overlay = null;
}
