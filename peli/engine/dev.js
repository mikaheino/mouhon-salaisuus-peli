// Mouhon salaisuus -- Moottori: testaajan rajapinta (?testi).
"use strict";
// ---------------------------------------------------------------- testaajan rajapinta (?testi)
// Sokkotestin nopeutus (17.10.): yksi kutsu = yksi pelaajan toiminto, ja vastaus on vain se,
// minkä pelaaja näkisi: ruutu, näkyvien kohteiden nimet, tavarat, keskusteluvaihtoehdot ja
// uudet repliikit. Ei pelin tilaa, ei lippuja, ei ratkaisuja.
if (TEST) {
  let seen = 0;
  const visible = () => { const s = room(); if (!s || overlay) return [];
    const out = s.spots.filter((p) => !(p.hidden && p.hidden())).map((p) => p.name);
    if (QUIZ_AREA?.[st.scene] && st.flags[quizFlag()]) for (const k of KEYS) out.push(`numero ${k}`);
    return out; };
  const view = () => { const el = document.getElementById("loki"), all = el ? el.textContent.split("\n").filter(Boolean) : [];
    const lines = all.slice(seen); seen = all.length;
    const form = GAME.endFormId && document.getElementById(GAME.endFormId);
    return { ruutu: room()?.title ?? "(välianimaatio)", kohteet: visible(), tavarat: st.inv.map((k) => ITEMS[k].name),
      vaihtoehdot: $game.classList.contains("talking") ? [...$dlg.children].map((b) => b.textContent) : null,
      lomake: form ? form.innerText.slice(0, 400) : null, uudet_repliikit: lines, mouho_iq: document.getElementById("iq")?.textContent }; };
  const settle = async () => { const t0 = performance.now(); let calm = 0;
    while (performance.now() - t0 < 60000) { await new Promise((r) => setTimeout(r, 60)); skip?.();      // repliikit ovat jo lokissa: ei odoteta niitä
      if ($game.classList.contains("talking") || (GAME.endFormId && document.getElementById(GAME.endFormId))) { calm += 60; if (calm > 300) break; continue; }
      if (!busy && !skip && !overlay && !title && !st.path.length && !onArrive) { calm += 60; if (calm > 400) break; } else calm = 0; }
    return view(); };
  const findSpot = (name) => { const s = room(), n = name.toLowerCase();
    return s?.spots.find((p) => !(p.hidden && p.hidden()) && p.name.toLowerCase() === n) ?? s?.spots.find((p) => !(p.hidden && p.hidden()) && p.name.toLowerCase().includes(n)); };
  const findItem = (name) => { const n = name.toLowerCase(); return st.inv.find((k) => ITEMS[k].name.toLowerCase() === n) ?? st.inv.find((k) => ITEMS[k].name.toLowerCase().includes(n)); };
  window.mouho = {
    ohje: "mouho.katso() | mouho.tee(verbi, kohde[, esine]) | mouho.valitse(n) | mouho.vihje() | mouho.aloita(). Verbit: " + VERBS.join(", "),
    katso: () => view(),
    aloita: async () => { if (title) cv.dispatchEvent(new MouseEvent("click", { clientX: 1, clientY: 1 })); while (skip || busy || overlay) { skip?.(); await new Promise((r) => setTimeout(r, 80)); } return settle(); },
    async tee(verbi, kohde, esine) {
      if (busy && !$game.classList.contains("talking")) await settle();
      if ($game.classList.contains("talking")) return { virhe: "Keskustelu on kesken: valitse vaihtoehto.", ...view() };
      const m = /^numero (\d)$/.exec(kohde ?? "");
      if (m) { const A = QUIZ_AREA[st.scene], y = (A.y0 + A.y1) / 2, [a, b] = A.edges(y), i = KEYS.indexOf(m[1]);
        place(a + (i + .5) / 10 * (b - a), y); room().onStop?.(st.x, st.y); return settle(); }
      if (esine && !findItem(esine) && findItem(kohde)) [kohde, esine] = [esine, kohde];       // kumpi tahansa järjestys
      if (esine) { const k = findItem(esine); if (!k) return { virhe: `Tavaroissa ei ole: ${esine} (muoto: tee Käytä <kohde> <esine>)`, ...view() };
        const p = findSpot(kohde); if (!p) { const k2 = findItem(kohde); if (!k2) return { virhe: `Ei näkyvissä: ${kohde}`, ...view() }; first = k; act(verbi, k2); return settle(); }
        first = k; act(verbi, p); return settle(); }
      const p = findSpot(kohde);
      if (p) { first = null; act(verbi, p); return settle(); }
      const k = findItem(kohde); if (k) { first = null; act(verbi, k); return settle(); }
      return { virhe: `Ei näkyvissä: ${kohde}`, ...view() }; },
    async valitse(n) { const b = $dlg.children[n - 1]; if (!$game.classList.contains("talking") || !b) return { virhe: "Ei vaihtoehtoja", ...view() };
      await new Promise((r) => setTimeout(r, 380)); b.click(); return settle(); },
    async vihje() { hint?.(); return settle(); },
    // Kosketustesti (tools/mobile.mjs, backlog 13): odota rauhoittumista ja kerro, mihin kohtaan sivulla napautetaan.
    odota: () => settle(),
    kohta(nimi) { const R = cv.getBoundingClientRect(), k = R.width / W, at = (x, y) => ({ x: R.left + (x + camOff()) * k, y: R.top + y * k });
      const m = /^numero (\d)$/.exec(nimi);
      const top = (x, y) => { const q = at(x, y); return document.elementFromPoint(q.x, q.y) === cv; };     // ei nuolen tai muun napin alla
      // Askel kohti kuvan ulkopuolella olevaa kohdetta: näkyvä lattian kohta reunan lähellä, jossa ei ole kohdetta.
      const step = (dir) => { const [v0, v1] = viewRange();
        for (let i = 6; i < 80; i += 3) for (let d = 0; d < H; d += 2) for (const y of [st.y + d, st.y - d]) { const x = (dir < 0 ? v0 + i : v1 - i) - camOff();
          if (y > 0 && y < H - 1 && polys().some((q) => inPoly(x, y, q)) && !(TOUCH ? spotNear : spotsAt)(x, y) && !onSelf(x, y, 4) && top(x, y)) return at(x, y); }
        return at(st.x, st.y); };
      if (m) { const A = QUIZ_AREA[st.scene], y = (A.y0 + A.y1) / 2, [a, b] = A.edges(y), x = a + (KEYS.indexOf(m[1]) + .5) / 10 * (b - a), [v0, v1] = viewRange(), sx = x + camOff();
        const ohi = sx < v0 + 3 ? -1 : sx > v1 - 3 ? 1 : 0; return { ...at(x, y), lattia: true, ohi, askel: ohi && step(ohi) }; }
      const p = findSpot(nimi);
      // Napautuskohta: lähin keskipistettä oleva piste, jossa spotsAt osuu juuri tähän kohteeseen (päällekkäiset kohteet).
      // Vain kuvassa näkyvä osa kelpaa (vierivä rivi ja pystyasennon zoomi, viewRange); muuten ohi = suunta.
      if (p) { let cx = p.x + p.w / 2, cy = p.y + p.h / 2, bd = 1e9; const [v0, v1] = viewRange(), vis = (x) => x + camOff() > v0 + 3 && x + camOff() < v1 - 3;
        for (let y = p.y + 1; y < p.y + p.h; y += 2) for (let x = p.x + 1; x < p.x + p.w; x += 2) { const d = Math.hypot(x - (p.x + p.w / 2), y - (p.y + p.h / 2));
          if (d < bd && vis(x) && spotsAt(x, y) === p && top(x, y)) { bd = d; cx = x; cy = y; } }
        const sx = cx + camOff(), pos = at(cx, cy);
        const ohi = bd < 1e9 ? 0 : sx < (v0 + v1) / 2 ? -1 : 1;
        return { ...pos, exit: !!p.exit, floor: !!p.floor, ohi, askel: ohi && step(ohi) }; }
      const i = findItem(nimi); if (i) { const b = $inv.children[st.inv.indexOf(i)].getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, esine: true }; }
      return null; },
  };
}

// ---------------------------------------------------------------- aloituskohdat ja esikatselut
// Sisältö ilmoittaa: defineStart(nimi, fn) -- ?alku=nimi asettaa tilan ja vie suoraan kohtaukseen;
// definePreview(nimi, fn) -- ?nayta=nimi piirtää yhden näkymän paikallaan kuvakaappausta varten
// (fn saa osoitteen parametrit). Moottori lukee osoitteen ja kutsuu oikeaa sivun latauduttua.
const STARTS = {}, PREVIEWS = {};
const defineStart = (name, fn) => (STARTS[name] = fn), definePreview = (name, fn) => (PREVIEWS[name] = fn);
addEventListener("load", () => {
  const Q = new URLSearchParams(location.search), a = Q.get("alku"), n = Q.get("nayta");
  if (a && STARTS[a]) setTimeout(() => { title = false; STARTS[a](Q); renderVerbs(); renderInv(); renderIq(); setSentence(); }, 200);
  if (n && PREVIEWS[n]) setTimeout(() => { title = false; PREVIEWS[n](Q); renderVerbs(); renderInv(); }, 300);
});
