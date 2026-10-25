// Mouhon salaisuus -- lähikuvat (moottorin closeUp, 25.10.): ilmoitus, kirje ja lentolippu isona.
"use strict";
// Monkey Island 2 näyttää kartanpalat ja kirjeet lähikuvina; täällä samoin paperit, joita Jussi
// lukee. Kuvat ovat ruudun koordinaateissa (320 x 136), keskellä, ja yläreunaan jää tilaa tekstille.
function paperSheet(x, y, w, h, base, shade) {          // repaleinen paperi varjoineen, kulmassa taitos
  r(x + 3, y + 3, w, h, "rgba(0,0,0,.45)"); r(x, y, w, h, base); dither(x, y + h - 10, w, 10, base, shade, .25);
  for (let i = 0; i < w; i += 3) { if ((i * 7) % 5 < 2) px(x + i, y, shade); if ((i * 3) % 7 < 2) px(x + i, y + h - 1, shade); }
  fillPoly([[x + w - 9, y], [x + w, y + 9], [x + w - 9, y + 9]], shade); r(x + w - 9, y, 1, 9, "rgba(0,0,0,.18)");
}
const textC = (s, cx, y, c, sc = 1) => text3(s, Math.round(cx - text3w(s, sc) / 2), y, c, sc);
function adCloseUp(t) {
  const x = 74, y = 22, w = 172, h = 108;
  paperSheet(x, y, w, h, "#ece0bc", "#c8b890");
  for (const [nx, c] of [[x + 6, "#c81c1c"], [x + w - 14, "#2c7cc8"]]) { disc(nx, y + 5, 2, c); px(nx - 1, y + 4, "#fcfcfc"); }   // nastat
  r(x + 6, y + 10, w - 12, 15, "#c81c1c"); r(x + 6, y + 24, w - 12, 1, "#8c1010");
  const L = PIXFACES.mouho_logo.logo, img = faceCache["logo|mouho"] ??= renderPix(L, { over: true }), lw = L.w / PXS * .5, lh = L.h / PXS * .5;
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(img, x + 10, y + 12 - 1, lw * 11 / lh, 11); g.restore();
  text3("MOUHO HAKEE", x + 30, y + 13, "#fce8c8", 2);
  textC("TOIMINNANJOHTAJAA", x + w / 2, y + 30, "#c81c1c", 2);
  text3("TEHTÄVÄT:", x + 12, y + 46, "#3c3020");
  ["MOUHO 2027 -TURNAUS", "JÄSENTEN HANKINTA", "TARJOILU"].forEach((s, i) => { r(x + 14, y + 55 + i * 8, 2, 2, "#c81c1c"); text3(s, x + 20, y + 54 + i * 8, "#3c3020"); });
  r(x + 10, y + 80, w - 20, 1, "#c8b890");
  textC("HAASTATTELUT MOUHO-ILLASSA", x + w / 2, y + 84, "#3c3020"); textC("KAIVOKATU 10, 20.11.", x + w / 2, y + 91, "#3c3020");
  r(x + 30, y + 98, w - 60, 7, "#2c7c2c"); textC("OSALLISTUMINEN ILMAISTA!", x + w / 2, y + 99, "#d8f4c8");
  if (st.flags.pyramid) { g.save(); g.globalAlpha = .9; for (let k = 0; k < 3; k++) lineC(x + w - 40 + k * 6, y + 70 - k * 9, x + w - 16 - k * 6, y + 70 - k * 9, "#2c2cb8"); g.restore(); }   // Jussin kuulakärkipyramidi kulmassa
}
function letterCloseUp(t) {
  const x = 82, y = 20, w = 156, h = 110;
  paperSheet(x, y, w, h, "#f4eedc", "#d8ccb0");
  r(x + 2, y + 2, w - 4, 1, "#d8a830"); r(x + 2, y + h - 3, w - 4, 1, "#d8a830"); r(x + 2, y + 2, 1, h - 4, "#d8a830"); r(x + w - 3, y + 2, 1, h - 4, "#d8a830");   // kultareuna
  textC("MOUHO GLOBAL PARTNERS", x + w / 2, y + 8, "#8c6c1c"); textC("ISTANBUL - LAPPEENRANTA", x + w / 2, y + 15, "#a89060");
  r(x + 30, y + 22, w - 60, 1, "#d8a830");
  text3("ARVOISA HERRA MARKKANEN!", x + 10, y + 30, "#2c2440");
  // käsinkirjoitettu teksti aaltoviivoina: luettava repliikissä, kuvassa vain käsiala
  seed = 41; for (let row = 0; row < 6; row++) { const yy = y + 42 + row * 8, len = row === 5 ? 60 : w - 24 - (row % 2) * 10;
    for (let i = 0; i < len; i++) { if (rnd() < .12) { i += 2; continue; } px(x + 10 + i, yy + Math.round(Math.sin((i + row * 5) / 1.6) * 1.2), "#3c3c8c"); } }
  // allekirjoitus ja sinetti
  for (let i = 0; i < 40; i++) px(x + w - 56 + i, y + 96 + Math.round(Math.sin(i / 3) * 2 + (i > 30 ? (i - 30) * -.5 : 0)), "#2c2c7c");
  disc(x + 22, y + 96, 7, "#a81c1c", "#6c1010"); text3("M", x + 21, y + 94, "#e8a0a0");
}
function ticketCloseUp(t) {
  const x = 60, y = 34, w = 200, h = 74;
  r(x + 3, y + 3, w, h, "rgba(0,0,0,.45)"); r(x, y, w, h, "#f4f4ec"); r(x, y, w, 14, "#1c3c8c"); r(x + 150, y, 1, h, "#9c9cac");
  for (let j = y + 2; j < y + h; j += 4) r(x + 150, j, 1, 2, "#f4f4ec");                                          // repäisyviiva
  text3("BOARDING PASS / TARKASTUSKORTTI", x + 6, y + 5, "#fcfcfc");
  text3("MATKUSTAJA", x + 8, y + 20, "#8c8c9c"); text3("MARKKANEN/JUSSI", x + 8, y + 27, "#1c1c2c");
  text3("LPP", x + 8, y + 40, "#1c3c8c", 3); text3(">", x + 50, y + 44, "#c81c1c", 2); text3("IST", x + 66, y + 40, "#1c3c8c", 3);
  text3("PORTTI 1", x + 112, y + 20, "#8c8c9c"); text3("21.40", x + 112, y + 27, "#1c1c2c");
  text3("YKSISUUNTAINEN", x + 8, y + 62, "#c81c1c");
  seed = 9; for (let i = 0; i < 40; i++) { const bw = 1 + ((rnd() * 2) | 0); r(x + 156 + i, y + 22, bw, 34, rnd() > .45 ? "#1c1c2c" : "#f4f4ec"); i += bw - 1; }   // viivakoodi
  text3("1A", x + 162, y + 60, "#1c1c2c", 2);
}
// Kuvien rajat ruudun koordinaateissa: savutesti (tools/smoke.mjs kuvat) tarkistaa, ettei teksti osu niihin.
adCloseUp.box = [74, 22, 172, 108]; letterCloseUp.box = [82, 20, 156, 110]; ticketCloseUp.box = [60, 34, 200, 74];
