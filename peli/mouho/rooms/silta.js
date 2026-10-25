// Mouhon salaisuus -- Galatan silta, Istanbul: kalastaja Kemal ja Bosporin kiekko (25.10.).
"use strict";
// Monkey Island 2:n tapaan valinnainen sivupolku, jossa on havaintopulma (lokit vievät syötin aina
// samassa kohdassa), keskustelu (Kemalin legenda) ja kännykkäkikka (Kuukkeli-haku: haukan huuto).
// Palkinto: Bosporin kiekko vuoden 1954 jäätyneeltä salmelta, jolla Mouho-illan turnaus aloitetaan,
// ja kalastajat jäseniksi. Portin vasemmasta reunasta; takaisin oikeasta reunasta.
const KEMAL_TIP = [242, 58], GULLS = [[166, 91], [174, 90], [182, 91], [190, 90], [272, 91], [280, 90]];
function siltaFar() {
  // Galatan rinne salmen takana: talot porrastettuina rinteeseen, ikkunat syttyneinä, torni harjalla
  const H1 = "#3c1c40", H2 = "#4c2448", H3 = "#5c2c50";
  fillPoly([[0, 62], [0, 40], [50, 36], [118, 24], [160, 32], [200, 44], [230, 50], [320, 52], [320, 62]], H1);
  seed = 51; for (let k = 0; k < 70; k++) { const x = (rnd() * 300) | 0, top = 62 - (x < 200 ? 28 - Math.abs(x - 118) / 6 : 14) + rnd() * 18, w = 6 + ((rnd() * 8) | 0), h = 62 - top;
    if (h < 3) continue; r(x, top, w, h, rnd() < .5 ? H2 : H3); r(x, top, w, 1, "#7c3c5c");
    for (let wy = top + 2; wy < 60; wy += 4) for (let wx = x + 1; wx < x + w - 1; wx += 3) if (rnd() < .3) px(wx, wy, rnd() < .7 ? "#fcc858" : "#f08c48"); }
  // Galatan torni: lieriö, kivinauhat, ikkunarivi ja kartiokatto
  const tx = 118; r(tx - 8, 14, 16, 22, "#5c2c48"); r(tx - 8, 14, 3, 22, "#7c4058"); r(tx + 5, 14, 3, 22, "#3c1c34");
  for (const y of [22, 29]) r(tx - 8, y, 16, 1, "#3c1c34");
  r(tx - 9, 11, 18, 3, "#7c4058"); r(tx - 9, 13, 18, 1, "#3c1c34"); for (let x = tx - 7; x < tx + 8; x += 3) { r(x, 15, 1, 3, "#fcc858"); px(x, 25, "#f08c48"); }
  tri(tx - 9, 1, 18, 10, "#3c1c34"); for (let j = 3; j < 10; j++) px(tx - 1 - (j >> 1), 1 + j, "#5c2c48"); r(tx, 0, 1, 2, "#e8c81c");
  // vesi: syvenevä violetti, auringonlaskun heijastus oikealla
  vgrad(0, 62, W, 32, ["#6c3058", "#4c2a5c", "#382a5c", "#2c2650"]);
  for (let y = 63; y < 94; y++) for (let x = 210; x < 300; x++) { const e = Math.abs(x - 255) / (45 - (y - 62) * .6); if (e < 1 && bay(x, y) < (1 - e) * .45) px(x, y, (y & 1) ? "#e8844c" : "#c85c4c"); }
}
function siltaDeck() {
  // takakaide (y 88-99), kansi ja kiveys; lyhtypylväät
  for (let x = 0; x < W; x += 9) { r(x, 88, 2, 11, "#2c2434"); px(x, 88, "#8c7c8c"); }
  r(0, 88, W, 2, "#5c5068"); r(0, 88, W, 1, "#a898a8"); r(0, 95, W, 1, "#4c4058");
  vgrad(0, 99, W, H - 99, ["#5c4c5c", "#6c5868", "#7c6474", "#86707c"]);
  for (let y = 103, k = 0; y < H; y += 4 + (k++ >> 1)) { r(0, y, W, 1, "#5c4c5c"); for (let x = (k % 2) * 7; x < W; x += 14 + k) r(x, y - 3, 1, 3, "#5c4c5c"); }
  r(0, 99, W, 1, "#3c3044"); r(0, 100, W, 1, "#9c8894");
  for (let x = 0; x < W; x++) if (bay(x, 101) < .5) px(x, 101, "#4c3c50");                        // kaiteen varjo
  for (const y of [124, 131]) { r(0, y, W, 1, "#3c3044"); r(0, y - 1, W, 1, "#b8a8b4"); }        // raitiotien kiskot
  for (let x = 4; x < W; x += 11) r(x, 122, 4, 11, "rgba(40,30,48,.35)");                          // ratapölkyt kiveyksen alla
  for (const x of [34, 150, 296]) { r(x, 58, 2, 41, "#2c2434"); r(x, 58, 1, 41, "#6c5c6c"); r(x - 3, 54, 8, 4, "#3c3044"); r(x - 2, 55, 6, 2, "#fce070"); }
}
function siltaWater(t) {        // väriensiirto (fx.js cyc): kimallus kiertää heijastusten läpi
  const C = ["#e8a06c", "#b0606c", "#6c3c6c", "#46305c", "#6c3c6c", "#b0606c"];
  for (let y = 64; y < 92; y += 3) for (let x = (y * 7) % 13; x < W; x += 13) { const c = cyc(C, (x >> 3) + y, t, 170); if (c === C[3]) continue; r(x, y, 3 + (y > 80 ? 2 : 0), 1, c); }
}
function siltaFerry(t) {        // vanha höyrylautta ylittää salmen hitaasti
  const x = Math.round(((t / 1000) * 5) % 440) - 60, y = 74;
  r(x, y + 5, 36, 3, "rgba(255,255,255,.12)"); r(x, y, 34, 5, "#ece8e0"); r(x, y + 4, 34, 1, "#2c2434"); r(x + 6, y - 5, 20, 5, "#d8d4cc");
  for (let k = 0; k < 6; k++) r(x + 8 + k * 3, y - 4, 2, 2, "#fcc858");
  r(x + 15, y - 11, 4, 6, "#1c1c24"); r(x + 15, y - 9, 4, 1, "#ece8e0");
  for (let k = 0; k < 4; k++) { const q = ((t / 900 + k / 4) % 1); px(x + 16 - q * 14, y - 13 - q * 8, `rgba(220,210,220,${.6 * (1 - q)})`); px(x + 17 - q * 14, y - 13 - q * 8, `rgba(220,210,220,${.4 * (1 - q)})`); }
}
// Muut kalastajat selin katsojaan kaiteella, vavat salmen yllä
function siltaFishers(t) {
  for (const [x, v, tip] of [[62, 0, [88, 50]], [116, 5, [132, 46]]]) {
    lineC(x + 3, 84, tip[0], tip[1], "#3c2c24"); lineC(tip[0], tip[1], tip[0] + 2, 86, "rgba(230,230,240,.35)");
    npc(v, x, 101, t, { back: true }); r(x + 8, 96, 6, 5, "#6c7c8c"); r(x + 8, 96, 6, 1, "#9cacbc");
  }
}
// Kemal ja hänen siimansa. Ennen haukkaa: kahdeksan sekunnin kierto, jossa lokki sukeltaa syötin
// perään ja Kemal kelaa siiman ylös -- painona roikkuu musta kiekko.
function kemalLine(t) {
  const f = st.flags, [tx, ty] = KEMAL_TIP; let end = 86, gull = null;
  if (!f.gullsGone) { const u = t % 8000;
    if (u < 2000) end = 86;
    else if (u < 3000) { const k = (u - 2000) / 1000; gull = [lerp(180, tx + 2, k), lerp(88, 84, Math.sin(k * Math.PI / 2))]; }
    else if (u < 3600) { const k = (u - 3000) / 600; gull = [tx + 2 + k * 30, 84 - k * 30]; }
    if (u >= 3000 && u < 6400) end = Math.max(64, 86 - (u - 3000) / 60);       // kelataan ylös
    if (u >= 6400) end = 64 + Math.min(22, (u - 6400) / 40); }
  if (f.catchT) { const k = Math.min(1, (performance.now() - f.catchT) / 1600); end = 86 - k * 22;
    if (k < 1) { const fx = tx + 1, fy = end + 2; r(fx - 3, fy, 7, 3, "#c8d4e0"); px(fx + 4, fy + 1, "#8c9cac"); px(fx - 3, fy, "#ffffff"); } }   // hopeinen kala
  lineC(tx, ty, tx + 1, end, "rgba(236,236,244,.5)");
  if (!f.puckGiven && end < 84) { r(tx - 2, end, 6, 3, "#141418"); r(tx - 2, end, 6, 1, "#3c3c44"); }       // kiekko painona
  if (gull) { const [gx, gy] = gull, up = Math.floor(t / 80) % 2; r(gx, gy, 4, 2, "#ece8f0"); px(gx - 1, gy - 1 - up, "#ece8f0"); px(gx - 2, gy - 2 + up * 2, "#8c8c9c"); px(gx + 4, gy - 1 - up, "#ece8f0"); px(gx + 5, gy - 2 + up * 2, "#8c8c9c"); }
}
function kemalDraw(t, talking) {
  lineC(220, 86, KEMAL_TIP[0], KEMAL_TIP[1], "#4c3424"); px(KEMAL_TIP[0], KEMAL_TIP[1], "#c8a46c");
  npc(3, 214, 104, t, { talking, dir: 1 }); r(207, 100, 7, 4, "#5c6c7c"); r(207, 100, 7, 1, "#8c9cac");    // syöttiämpäri
}
function siltaDraw(t) {
  g.drawImage(paintBg("silta_sky", () => basaariSky(false)), 0, 0);
  BAZ_CLOUDS.forEach((b, k) => drift(`baz_cloud${k}`, b[5], (w) => bazCloudBand(w, b, k), t));
  g.drawImage(paintBg("silta_far", siltaFar), 0, 0);
  siltaWater(t); siltaFerry(t);
  g.drawImage(paintBg("silta_deck", siltaDeck), 0, 0);
  for (const x of [34, 150, 296]) glow(x + 1, 57, 16, "255,200,110", .3 + .04 * Math.sin(t / 200 + x));
  kemalLine(t);
  if (!st.flags.gullsGone) flock("silta", GULLS, t, { c: "#ece8f0", d: "#8c8c9c", R: 24 });
  // kyltti portille päin
  r(306, 104, 2, 20, "#2c2434"); r(298, 98, 20, 8, "#1c4c8c"); r(298, 98, 20, 1, "#5c8cc8"); text3("CARSI", 299, 100, "#fcfcfc");
}
// Istanbulin kartta (MI2:n saarikarttojen tapaan): Jussi kulkee pisteenä kujia pitkin portilta sillalle.
const IST_ROUTE = [[214, 104], [200, 92], [176, 88], [160, 76], [138, 70], [118, 62], [118, 40]];      // basaarin portti -> Galatan silta
function istMapBg() {
  r(0, 0, W, H, "#e8d8b0"); dither(0, 0, W, H, "#e8d8b0", "#dcc89c", .25);                       // vanha paperi
  fillPoly([[0, 0], [320, 0], [320, 30], [200, 40], [150, 56], [120, 62], [60, 58], [0, 50]], "#9cb8c8");   // Kultainen sarvi ja Bosporinsalmi
  fillPoly([[240, 0], [320, 0], [320, 136], [292, 136], [270, 80], [256, 40]], "#9cb8c8");
  for (let y = 4; y < 60; y += 6) for (let x = (y * 3) % 11; x < W; x += 22) if (y < 50 - x / 20 || x > 262) r(x, y, 5, 1, "#88a4b8");
  fillPoly([[0, 0], [250, 0], [236, 10], [150, 16], [60, 14], [0, 12]], "#dcc89c");             // Galatan ranta pohjoisessa
  r(116, 2, 5, 9, "#a87c5c"); tri(115, -3, 7, 5, "#6c4c3c"); text3("TORNI", 124, 4, "#3c2c24");
  r(116, 14, 4, 46, "#6c5c4c"); r(116, 14, 1, 46, "#8c7c6c"); for (let y = 16; y < 58; y += 4) px(118, y, "#a89c8c");   // silta salmen yli
  text3("GALATAN SILTA", 124, 34, "#3c2c24");
  for (const [x, y] of [[60, 30], [200, 24]]) { r(x, y, 10, 3, "#f4f0e8"); r(x + 3, y - 3, 3, 3, "#3c3c44"); }            // laivat
  { const cx = 290, cy = 112; lineC(cx, cy - 10, cx, cy + 10, "#3c2c24"); lineC(cx - 10, cy, cx + 10, cy, "#3c2c24"); text3("N", cx - 1, cy - 17, "#3c2c24"); disc(cx, cy, 2, "#8c2c2c"); }   // ilmansuunnat
  for (let x = 0; x < W; x += 4) { px(x, 0, "#8c7c5c"); px(x, H - 1, "#8c7c5c"); } for (let y = 0; y < H; y += 4) { px(0, y, "#8c7c5c"); px(W - 1, y, "#8c7c5c"); }
  for (const [x, y] of [[170, 96], [196, 108], [150, 104], [130, 88], [220, 120]]) { r(x - 6, y - 3, 12, 6, "#c8a878"); r(x - 6, y - 3, 12, 1, "#a8885c"); }   // korttelit
  r(206, 98, 22, 14, "#b8784c"); r(206, 98, 22, 2, "#d8986c"); text3("BASAARI", 198, 114, "#3c2c24");
  disc(150, 120, 6, "#a87c5c"); r(149, 108, 2, 6, "#a87c5c"); text3("MOSKEIJA", 132, 128, "#3c2c24");
  for (let i = 1; i < IST_ROUTE.length; i++) { const [a, b] = IST_ROUTE[i - 1], [c, d] = IST_ROUTE[i]; for (let k = 0; k < 1; k += .08) if ((k * 12 | 0) % 2 === 0) px(lerp(a, c, k), lerp(b, d, k), "#8c2c2c"); }
  r(4, 4, 70, 11, "#3c2c24"); text3("ISTANBUL", 8, 7, "#e8d8b0");
}
async function istMapWalk(back) {
  const T0 = performance.now(), dur = TEST ? 300 : 2200, P = back ? [...IST_ROUTE].reverse() : IST_ROUTE;
  overlay = () => { g.drawImage(paintBg("istMap", istMapBg), 0, 0);
    const k = Math.min(1, (performance.now() - T0) / dur) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(k)), q = k - i;
    const x = lerp(P[i][0], P[i + 1][0], q), y = lerp(P[i][1], P[i + 1][1], q), hop = Math.floor(performance.now() / 150) % 2;
    r(x - 1, y - 4 - hop, 3, 4, "#c8a460"); r(x - 1, y - 6 - hop, 3, 2, "#f0b890"); px(x, y - 1, "#3c2c1c"); };
  await sleep(dur + 200); overlay = null;
}
const toSilta = () => script(async () => { await walkTo(2, Math.max(st.y, 110)); await istMapWalk(false); go("silta", 312, true, 122); await walkTo(270, 122);
  if (!st.flags.siltaSeen) { st.flags.siltaSeen = true; await say("Galatan silta. Kalastajia kaide täynnä, ja jokaisella vapa salmen yllä. Ja lokkeja. Paljon lokkeja."); } });
const fromSilta = () => script(async () => { await walkTo(318, st.y); await istMapWalk(true); go("portti", 6, true, 124); await walkTo(40, 124); });

defineRoom("silta", {
  title: "Galatan silta, Istanbul", scale: [96, 136, 0.78, 1.08], start: 122,
  walk: [[[0, 104], [320, 104], [320, 136], [0, 136]]],
  draw: siltaDraw,
  props: [{ y: 101, draw: siltaFishers }],
  actors: [{ id: "kemal", x: 214, y: 104, h: 44, color: "#f0d8a0", draw: (t, talking) => kemalDraw(t, talking) }],
  edges: { oikea: () => fromSilta() },
  spots: [
    { id: "kemal", name: "Kemal", actor: true, x: 206, y: 74, w: 16, h: 30, at: 196, aty: 110,
      Katso: () => say(st.flags.puckGiven ? "Kemal hymyilee siimansa päässä. Hän on saanut jo kolme kalaa. Ja yhden uuden jäsenen." : "Vanha viiksekäs kalastaja liivissään. Hän tuijottaa siimaansa kuin se olisi velkaa hänelle jotain. Siiman päässä roikkuu jotain mustaa ja litteää."),
      Puhu: () => kemalTalk(),
      Anna: (it) => it === "kebab" ? say("Kiitos, mutta minä syön vasta, kun nappaa. Niin on sovittu kalojen kanssa.", "kemal") : say("Ei kiitos. Tarvitsen vain kalan. Yhdenkin.", "kemal") },
    { id: "lokit", name: "lokit", hidden: () => st.flags.gullsGone, x: 160, y: 82, w: 128, h: 12, at: 176, aty: 108,
      Katso: () => say(st.flags.kemalWhy ? "Lokit väistävät minua, mutta palaavat heti. Pitäisi saada ne lähtemään lopullisesti. Kemal sanoi, että ne pelkäävät vain haukkaa." : "Lokkeja kaide täynnä. Ne tuijottavat Kemalin syöttiämpäriä kuin maalivahdit kiekkoa."),
      Poimi: () => say("Lokit eivät halua tulla poimituiksi. Ne haluavat poimia itse."),
      Puhu: () => say("Kshh! ...Ne katsovat minua. Minä katson niitä. Ne voittavat."),
      "Käytä:puhelin": () => hawkCry(), "Anna:kebab": () => say("Jos annan lokeille kebabin, ne tulevat huomenna takaisin kymmenen kaverin kanssa."),
      "Käytä:kebab": () => say("Jos annan lokeille kebabin, ne tulevat huomenna takaisin kymmenen kaverin kanssa.") },
    { id: "kalastajat", name: "kalastajat", x: 52, y: 74, w: 80, h: 28, at: 90, aty: 110,
      Katso: () => say("Kalastajat seisovat selin maailmaan. Siimat ovat salmessa, ajatukset jossain Bosporin pohjassa."),
      Puhu: () => say(st.flags.puckGiven ? "\"Kemal sai kalan! Ja me liitymme sinun Mouhoosi. Pelaamme iltaisin NHL:ää teehuoneessa.\"" : "\"Puhu Kemalille. Hän on ollut täällä kauimmin. Ja hänellä on huonoin onni.\"", "muu") },
    { id: "torni", name: "Galatan torni", x: 108, y: 0, w: 16, h: 34,
      Katso: () => say("Galatan torni rinteen harjalla. Sieltä näkee koko kaupungin. Ja koko kaupunki näkee sen.") },
    { id: "lautta", name: "lautta", x: 0, y: 64, w: 320, h: 18,
      Katso: () => say("Vanha höyrylautta kyntää salmen poikki. Se ei kiirehdi. Istanbulissa ei kiirehditä, paitsi liikenteessä.") },
    { id: "portille", name: "takaisin portille", x: 300, y: 96, w: 20, h: 40, at: 316, aty: 122, exit: true,
      Katso: () => say("Tuolla on Suuren basaarin portti."), Kävele: () => fromSilta(), Käytä: () => fromSilta() },
  ],
});
// Kemal: miksi ei nappaa, mikä paino siimassa on ja ehto kiekolle.
function kemalTalk() {
  return script(async () => {
    while (true) { const f = st.flags, opts = [];
      if (f.kalastajat) { await say("Kalaa riittää, ystäväni. Ja Mouho-iltaan tullaan koko sillan voimin.", "kemal"); return; }
      if (f.puckGiven) { const p2 = ["Pelataan se NHL-ottelu Emreä vastaan.", "Myöhemmin."][await choose(["Pelataan se NHL-ottelu Emreä vastaan.", "Myöhemmin."])]; await say(p2);
        return p2.startsWith("Pelataan") ? teahouseMatch() : undefined; }
      if (!f.kemalWhy) opts.push("Nappaako?");
      if (!f.kemalLegend) opts.push("Mikä tuo musta paino siimassa on?");
      if (f.kemalLegend && !f.kemalDeal) opts.push("Saisinko sen kiekon? Mouhon turnaus tarvitsee aloituskiekon.");
      opts.push("Näkemiin.");
      const pick = opts[await choose(opts)]; await say(pick);
      if (pick.startsWith("Nappaako")) { f.kemalWhy = true;
        await say("Ei koko päivänä. Joka kerta kun syötti menee veteen, lokki sukeltaa perään. Katso itse.", "kemal");
        await say("Ennen sillalla kävi haukkamies. Silloin lokit pysyivät loitolla. Nyt ne omistavat tämän sillan.", "kemal"); }
      else if (pick.startsWith("Mikä")) { f.kemalLegend = true;
        await say("Tämä? Helmikuussa 1954 Bosporinsalmi jäätyi. Jäälautat ajelehtivat Mustaltamereltä asti.", "kemal");
        await say("Suomalaisen rahtilaivan merimiehet hyppäsivät jäälautalle ja pelasivat jääkiekkoa. Koko silta katsoi.", "kemal");
        await say("Keväällä isäni löysi kiekon verkostaan. Siitä asti se on ollut onnenpainoni.", "kemal");
        await say("Suomalainen kiekko Bosporin pohjalta. Tämä on merkki. Tämä on aloituskiekko."); }
      else if (pick.startsWith("Saisinko")) { f.kemalDeal = true;
        await say("Onnenpainoni? Ilman sitä en saa kalaa.", "kemal");
        await say("...Toisaalta en saa kalaa sen kanssakaan. Sanotaan näin: jos tänään nappaa, onni on minussa eikä painossa. Silloin kiekko on sinun.", "kemal"); }
      else return; }
  });
}
// Kännykkä lokkeihin: Kuukkeli-haku haukan huudosta (kirjoitettu tietysti vähän väärin).
async function hawkCry() {
  const f = st.flags;
  if (!f.kemalWhy) return say("Kenelle soittaisin? Lokit eivät vastaa puhelimeen. Kysytään ensin Kemalilta, mikä täällä on ongelma.");
  await kuukkeli("lokit pois sillalta haukka ääni, onko?", "Tarkoititko: haukan huuto", [["Haukan huuto (ääni) - toista", "0:04. Lokit vihaavat tätä."],
    ["Miten lokit saa pois?", "1 203 vastausta. Paras: \"Haukka.\""], ["Haukkamies Galatan sillalla", "...jäi eläkkeelle vuonna 1998."]], (t) => { siltaDraw(t); r(0, 0, W, H, "rgba(10,8,20,.55)"); });
  overlay = null; callSpk = null;
  await say("Toistan. Täysillä.");
  [2600, 2300, 2500, 1900, 1600].forEach((fq, n) => setTimeout(() => beep(fq, 140, "sawtooth", .05), n * 120));
  FLOCKS.silta = { t0: performance.now(), dir: -1 }; await sleep(900);         // parvi pyrähtää (fx.js flock)
  f.gullsGone = true; iq("lokit", 5); await say("KIIIAAA! ...Lokit lähtevät. Kaikki. Kohti Aasiaa.", "muu");
  await say("Haukka? Haukkamies on palannut!", "kemal");
  await say("Kemal laskee syötin veteen. Kukaan ei sukella perään.", "muu");
  f.catchT = performance.now(); await sleep(1700);
  await say("NAPPAA! Kala! Ensimmäinen koko päivänä!", "kemal");
  if (!f.kemalLegend) { f.kemalLegend = true; await say("Ja tämä musta paino siimassa? Bosporin kiekko vuodelta 1954, kun salmi jäätyi. Onnenpainoni.", "kemal"); }
  await say("Onni ei ollut painossa. Se oli minussa koko ajan. Ja lokeissa.", "kemal");
  await say("Ota tämä, ystäväni. Bosporin kiekko. Suomalainen kiekko palaa suomalaiselle.", "kemal");
  f.puckGiven = true; f.catchT = 0; give("kiekko"); iq("kiekko", 5);
  await say("Mouhon turnaus? NHL? Me pelaamme sitä iltaisin sillan alakerran teehuoneessa.", "kemal");
  await say("Kalastajat liittyvät kyllä. Mutta ensin sinun pitää voittaa veljenpoikani Emre. Hän ei ole hävinnyt sitten lokkien saapumisen.", "kemal");
}
// Teehuoneen NHL-ottelu Emreä vastaan (minipeli.js): voitto tuo kalastajat Mouhoon.
async function teahouseMatch() {
  const f = st.flags;
  await say("Sillan alakerran teehuone. Teelasit kilisevät, ja nurkassa hehkuu televisio. Emre nostaa ohjaimen.", "muu");
  await say("Viisi laukausta. Kolme maalia, niin kalastajat ovat sinun. Ammu, kun tähtäin on maalivahdin ohi.", "kemal");
  const won = await rinkDuel({ of: 5, need: 3 });
  if (!won) { await say("Emre virnistää ja kaataa lisää teetä. \"Uusiksi, suomalainen?\"", "muu"); return say("Tähtäin heiluu, maalivahti liukuu. Pitää laukaista, kun ne ovat eri puolilla."); }
  f.kalastajat = true; f.recruits = (f.recruits ?? 0) + 4; iq("emre", 5);
  await say("Emre laskee ohjaimen. \"Hyvä peli.\" Koko teehuone taputtaa.", "muu");
  await say("Galatan sillan kalastajat liittyvät Mouhoon! Neljä uutta jäsentä. Ja kaikki osaavat jo pelata.");
}
