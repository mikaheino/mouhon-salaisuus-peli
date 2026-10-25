// Mouhon salaisuus -- Moottori: kosketusnäyttö (backlog 13, 25.10.).
"use strict";
// ---------------------------------------------------------------- kosketustila
// Puhelimessa ei ole hiirtä kohteen päällä (lauserivi) eikä oikeaa painiketta (oletustoiminto), ja
// verbilista vie tilaa. Kosketustilassa kohteen napautus avaa toimintovalikon (nimi ja verbit,
// oletustoiminto korostettuna), lattian napautus kävelee ja uloskäynti vie suoraan. Tavaran napautus
// avaa saman valikon; Käytä/Anna valitsee esineen, ja seuraava napautus osuu kohteeseen.
// Päälle (pointer: coarse) tai ?mobiili, pois ?mobiili=0. Asettelu: index.html, html.touch.
const TOUCH = (() => { const q = new URLSearchParams(location.search).get("mobiili");
  // Myös sovellusten sisäiset selaimet (WhatsApp, Slack, LinkedIn): kosketuspisteet tai ei hiiren osoitinta.
  return q === null ? matchMedia("(pointer: coarse)").matches || matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0 : q !== "0"; })();
if (TOUCH) document.documentElement.classList.add("touch");
// Napautuksen väljyys pienten kohteiden ympärillä (CSS-pikseleinä; lattiakohteet vain tarkasti).
const TAP_SLOP = 14;
const tapSlop = () => TAP_SLOP / (cv.getBoundingClientRect().width / W);
function spotNear(x, y) {
  const hit = spotsAt(x, y); if (hit) return hit;
  const s = room(), r = tapSlop(); let best = null, bd = r;
  for (const p of s?.spots ?? []) { if ((p.hidden && p.hidden()) || p.floor) continue;
    const d = Math.hypot(Math.max(p.x - x, 0, x - (p.x + p.w)), Math.max(p.y - y, 0, y - (p.y + p.h))); if (d < bd) { bd = d; best = p; } }
  return best;
}
const SELF = { self: true };
// Ruudun napautus kävelytilassa: valikko kohteelle tai pelaajalle itselleen, muuten tavallinen klikkaus.
function touchMenu(x, y, e) {
  const o = spotNear(x, y);
  if (o && !o.floor && !o.exit) { openMenu(o, e.clientX, e.clientY); return true; }
  if (!o && GAME.text.self?.length && onSelf(x, y, tapSlop() / 2)) { openMenu(SELF, e.clientX, e.clientY); return true; }
  return false;
}
// Tavaran napautus: valikko; valitun esineen napautus uudestaan perii valinnan (tai ajaa esineen oman verbin).
function touchItem(k, el) {
  if (first && first !== k) return false;              // esine esineeseen: tavallinen polku
  if (first === k) { if (ITEMS[k][verb]) return false; first = null; verb = "Kävele"; renderVerbs(); renderInv(); setSentence(); return true; }
  const b = el.getBoundingClientRect(); openMenu(k, b.left + b.width / 2, b.top + b.height / 2); return true;
}

const $back = document.createElement("div"), $menu = document.createElement("div");
$back.id = "tapback"; $menu.id = "tapmenu"; $back.hidden = $menu.hidden = true;
// Taustan napautus vain sulkee valikon (ei kävelyä, ei repliikin ohitusta, ei ulos sivulle).
$back.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); });
$back.addEventListener("contextmenu", (e) => e.preventDefault());
document.body.append($back, $menu);
function closeMenu() { $back.hidden = $menu.hidden = true; if (!first) setSentence(); }
function openMenu(t, px, py) {
  const name = t === SELF ? GAME.playerName ?? "itseäsi" : nameOf(t), dv = t === SELF ? "Katso" : defVerb(t);
  const verbs = t === SELF ? ["Katso"] : VERBS;
  const head = document.createElement("div"); head.className = "nm"; head.textContent = name;
  const grid = document.createElement("div"); grid.className = "vb";
  grid.append(...verbs.map((v) => { const b = document.createElement("button"); b.textContent = v; if (v === dv) b.className = "def";
    b.onclick = (e) => { e.stopPropagation(); closeMenu(); if (busy) return; run(t, v); }; return b; }));
  $menu.replaceChildren(head, grid); $back.hidden = $menu.hidden = false;
  $sent.textContent = `${dv} ${name}`;
  // Valikko napautuskohdan viereen, kokonaan näkyviin.
  const m = $menu.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
  $menu.style.left = Math.max(6, Math.min(vw - m.width - 6, px - m.width / 2)) + "px";
  $menu.style.top = Math.max(6, Math.min(vh - m.height - 6, py - m.height - 18 > 6 ? py - m.height - 18 : py + 18)) + "px";
}
function run(t, v) {
  if (t === SELF) return lookSelf();
  if (typeof t === "string") { verb = v; act(v, t); if ((v !== "Käytä" && v !== "Anna") || !first) verb = "Kävele"; renderVerbs(); setSentence(); return; }
  act(v, t); verb = "Kävele"; renderVerbs();
}

// ---------------------------------------------------------------- reunasiirtymät
// Desktopilla huoneen edges.vasen/oikea aukeaa klikkaamalla kuvan viereen mustalle (page.js); puhelimessa
// kuva täyttää leveyden, joten reunoille tulee nuolet.
if (TOUCH) {
  const mk = (side, txt) => { const b = document.createElement("button"); b.className = `edge ${side}`; b.textContent = txt; b.hidden = true; b.setAttribute("aria-label", side === "vasen" ? "Vasemmalle" : "Oikealle");
    b.addEventListener("click", (e) => { e.stopPropagation(); if (busy || overlay || !room()?.edges?.[side]) return;
      if (OUT.on) { OUT.on = false; place(...OUT.exit); } room().edges[side](); });
    document.getElementById("stage").append(b); return b; };
  const arrows = [["vasen", mk("vasen", "‹")], ["oikea", mk("oikea", "›")]];
  // Nuoli vain, kun huoneen reuna on kuvassa (vierivä rivi ja pystyasennon zoomi): muuten se peittäisi kohteita.
  const edgeSeen = (side) => { const [v0, v1] = viewRange(), e = side === "vasen" ? camOff() : W + camOff(); return e > v0 - 2 && e < v1 + 2; };
  const tick = () => { for (const [side, b] of arrows) { const show = !title && !overlay && !busy && !!room()?.edges?.[side] && edgeSeen(side); if (b.hidden === show) b.hidden = !show; } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

// Vaaka-asennon valikkonappi (index.html): Vihje, Tallenna, Lataa ja Musiikki; sulkeutuu seuraavasta napautuksesta.
{ const m = document.getElementById("mnu"), h = m?.closest(".hint");
  m?.addEventListener("click", (e) => { e.stopPropagation(); h.classList.toggle("open"); });
  document.addEventListener("click", (e) => { if (h?.classList.contains("open") && e.target !== m) h.classList.remove("open"); }, true); }

// ---------------------------------------------------------------- pystyasennon zoomi
// Pystyssä koko kenttä leveänä olisi vain ~160 px korkea (käyttäjä 25.10.: "kaikki on edelleen todella pientä").
// Kamera zoomaa: ikkuna (#stage) on korkeampi, kuva (#view) ikkunaa leveämpi ja liukuu Jussin tai puhuvan
// hahmon mukaan. Välianimaatiot, lähikuvat ja puhelut näytetään kokonaisina. Napautukset osuvat oikein,
// koska stagePos lukee kankaan todellisen paikan; kuplat rajataan näkyvään osaan (viewRange, talk.js).
const ZOOM = { on: false, x: 0, scene: null, snap: true };
const $stage = document.getElementById("stage"), $view = document.getElementById("view"), PORTRAIT = matchMedia("(orientation: portrait)");
function zoomFocus() {            // kohdistus kuvan x:nä (0..W)
  const npc = speaking && speaking !== GAME.playerId ? room()?.actors?.find((a) => a.id === speaking && !a.hidden?.()) : null;
  return (npc ? npc.x : st.x) + camOff();
}
const zoomOff = (win, view) => Math.max(0, Math.min(view - win, zoomFocus() * view / W - win / 2));
// Näkyvä osa kuvan x-koordinaatteina; kupla asettuu sen mukaan, minne kamera on menossa.
function viewRange() { if (!ZOOM.on) return [0, W]; const win = $stage.clientWidth, view = $view.clientWidth, k = view / W, o = zoomOff(win, view); return [o / k, (o + win) / k]; }
if (TOUCH) {
  const zoomTick = () => {
    const want = PORTRAIT.matches && !title && !overlay && !FX.close && !callSpk && !!room();
    if (want !== ZOOM.on) { ZOOM.on = want; document.documentElement.classList.toggle("zoom", want); ZOOM.snap = true; }
    if (want) { const win = $stage.clientWidth, view = $view.clientWidth, o = zoomOff(win, view);
      ZOOM.x = ZOOM.snap || st.scene !== ZOOM.scene ? o : ZOOM.x + (o - ZOOM.x) * .12; ZOOM.scene = st.scene; ZOOM.snap = false;
      $view.style.setProperty("--zx", -Math.round(ZOOM.x) + "px"); }
    requestAnimationFrame(zoomTick); };
  requestAnimationFrame(zoomTick);
}
