// Mouhon salaisuus -- kehyskertomus ja lukujen otsikkoruudut (25.10., Monkey Island 2:n tapaan).
"use strict";
// MI2 alkaa Guybrushin roikkuessa köydessä ja kertoessa Elainelle, miten siihen päädyttiin, ja
// jakautuu osiin otsikkoruuduin ("Part One: The Largo Embargo"). Täällä Jussi kertoo tarinansa
// Mouhon hallitukselle haastattelussa myöhäissyksyllä: peli alkaa siitä (coldOpen), hallitus kommentoi
// lukujen välissä, ja loppukohtaus palaa samaan huoneeseen (scenes/loppu.js).
const CHAPTERS = {
  1: { num: "I", title: "Pyramidi Kisapuistossa", art: () => kisaDraw(0),
    frame: [["muu", "Hallitus: \"Lappeenrantaan? Suoraan Liigan toimistosta?\""], ["jussi", "Suorinta tietä. Melkein kirjaimellisesti."]] },
  2: { num: "II", title: "Basaarin kumppanit", art: () => basaariDraw(0),
    frame: [["muu", "Hallitus: \"Hetkinen. Lensitte Istanbuliin ennen haastattelua?\""], ["jussi", "Proaktiivisuutta. Jouko sanoi niin. Tavallaan."]] },
  3: { num: "III", title: "Kappadokian temppeli", art: () => { kallioDraw(0); temppeliDrawCard(); },
    frame: [["muu", "Hallitus: \"Ja Istanbulista luolaan.\""], ["jussi", "Turnaus tarvitsi palkinnon. Luolassa oli palkinto. Logiikka on aukoton."]] },
  4: { num: "IV", title: "Mouho-ilta", art: mouhoInFull,
    frame: [["muu", "Hallitus: \"Ja sitten tulitte tänne.\""], ["jussi", "Ja sitten tulin tänne. Mutta en yksin."]] },
};
// Osa III:n kuvaan temppelin suun kajo vahvemmaksi (kallion ovi vasemmalla).
function temppeliDrawCard() { glow(32, 80, 40, "255,150,60", .35); }
// Otsikkoruutu: luvun kuva himmennettynä, nauha ja otsikko; hallituksen välikommentti kuplina.
function chapterDraw(C, t, t0) {
  const k = ease((t - t0) / 900);
  g.drawImage(paintBg(`luku_${C.num}`, C.art), 0, 0);
  g.fillStyle = `rgba(8,6,18,${.25 + .6 * (1 - k)})`; g.fillRect(0, 0, W, H);
  const y = 70 + Math.round((1 - k) * 12);
  g.globalAlpha = k; r(0, y - 4, W, 34, "rgba(10,8,20,.82)"); r(0, y - 5, W, 1, "#e8c81c"); r(0, y + 30, W, 1, "#e8c81c");
  g.textAlign = "center"; g.font = "10px VT323, monospace"; g.fillStyle = "#e8c81c"; g.fillText(`OSA ${C.num}`, W / 2, y + 5);
  g.font = "20px Bangers, VT323, monospace"; g.lineWidth = 3; g.strokeStyle = "#1c0c08"; g.strokeText(C.title, W / 2, y + 25);
  g.fillStyle = "#fcf0c8"; g.fillText(C.title, W / 2, y + 25); g.textAlign = "left"; g.globalAlpha = 1;
}
async function chapter(n) {
  const C = CHAPTERS[n]; if (!C || st.flags[`luku${n}`]) return; st.flags[`luku${n}`] = true;
  const prev = overlay, t0 = performance.now(); logLine(`== Osa ${C.num}: ${C.title}`);
  overlay = (t) => chapterDraw(C, t, t0); await sleep(1400);
  callSpk = { jussi: { x: 200, y: 40, c: "#c8a460" } };
  for (const [who, text] of C.frame) await say(text, who);
  callSpk = null; await sleep(500); overlay = prev;
}

// Kylmä aloitus: Mouho-ilta myöhäissyksyllä, haastattelu alkaa, ja Jussi alkaa kertoa.
async function coldOpen() {
  overlay = (t) => { mouhoInDraw(t); boardTable(t); shadow(176, 128, 7); jussi(176, 128, 1, 0, {}); };      // Jussi kääntyy hallitukseen päin
  callSpk = { jussi: { x: 176, y: 78, c: "#c8a460" } };
  await say("Helsinki, myöhäissyksy. Kaivokatu 10, neljäs kerros. Mouho-ilta, jossa haetaan Mouho 2027:n toiminnanjohtajaa.", "muu");
  await say("Hallitus: \"Toiminnanjohtajan haastattelu. Hakija Markkanen. Hakemuksessanne on... aika paljon liitteitä.\"", "muu");
  await say("Hallitus: \"Kertokaa omin sanoin: miten te päädyitte tänne?\"", "muu");
  await say("Se on pitkä tarina. Siinä on basaari, temppeli, haamu ja yksi viisikymppinen.");
  await say("Kaikki alkoi kuukausi sitten. Liigan toimistossa.");
  callSpk = null; await transition("fade", "out"); overlay = null; FX.tr = null; transition("fade", "in");
}
