/* Mouhon salaisuus Amiga 1200:lle emuloituna (backlog 6, vaihe 3).
   Kone: SAE (Scripted Amiga Emulator), A1200 (AGA, 68020), 2 Mt chip + 4 Mt fast, levyasema DF0.
   Käynnistys kuten oikealla koneella: virta päälle ilman levyä -> ROMin käynnistysruutu ("aseta levy")
   -> levy mouho.adf asemaan -> Kickstart käynnistää levyn -> s/startup-sequence -> peli.
   Kickstart: käyttäjän oma ROM (valittu tiedosto, muistetaan IndexedDB:ssä; tai palvelimen rom/kick.rom)
   tai vapaa AROS-ROM (rom/aros-amiga-m68k-*.bin).
   Osoiterivin valinnat: ?levy=heti (levy asemassa jo käynnistyessä), ?viive=<s> (levy asemaan, oletus 5),
   ?nopeus=aito (levyasema oikean nopeuksinen, oletus nopea), ?hiiri=nayta (ei hiiren kaappausta; testit), ?aani=0, ?rom=aros (ohita oma ROM). */
"use strict";
var sae = null, cfg = null;
var mouho = { phase: "init", romName: "", diskIn: false, insertFrame: 0, error: null };

function param(n, d) { var m = new RegExp("[?&]" + n + "=([^&]*)").exec(location.search); return m ? decodeURIComponent(m[1]) : d; }
function $(id) { return document.getElementById(id); }
function status(s) { $("status").textContent = s; }
function frames() { return typeof SAEV_Events_vsync_counter == "number" ? SAEV_Events_vsync_counter : 0; }

/* SAE tunnistaa ROMit CRC32:lla (sama algoritmi kuin SAE:n esimerkeissä) */
var crcTable = (function () {
  var t = new Uint32Array(256);
  for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = ((c >>> 1) ^ (c & 1 ? 0xedb88320 : 0)) >>> 0; t[n] = c; }
  return t;
})();
function crc32(u8) { var c = 0xffffffff; for (var i = 0; i < u8.length; i++) c = (c >>> 8) ^ crcTable[(c ^ u8[i]) & 0xff]; return (c ^ 0xffffffff) >>> 0; }

/* SAE:n tiedostot ovat binäärimerkkijonoja (kuten index.js:n lataus) */
function binString(u8) { var s = ""; for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return s; }
async function fetchBytes(url) {
  var r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status + " " + url);
  return new Uint8Array(await r.arrayBuffer());
}
function setFile(dst, name, u8) {
  dst.clr(); dst.name = name; dst.data = binString(u8); dst.size = u8.length; dst.crc32 = crc32(u8);
}

/* ------------------------------------------------ oma Kickstart: IndexedDB (vain tässä selaimessa) */
function idb() {
  return new Promise(function (ok, fail) {
    var q = indexedDB.open("mouho-amiga", 1);
    q.onupgradeneeded = function () { q.result.createObjectStore("rom"); };
    q.onsuccess = function () { ok(q.result); };
    q.onerror = function () { fail(q.error); };
  });
}
async function romGet() {
  try {
    var db = await idb();
    return await new Promise(function (ok) { var q = db.transaction("rom").objectStore("rom").get("kick"); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; });
  } catch (e) { return null; }
}
async function romPut(v) {
  var db = await idb();
  await new Promise(function (ok, fail) {
    var t = db.transaction("rom", "readwrite");
    if (v) t.objectStore("rom").put(v, "kick"); else t.objectStore("rom").delete("kick");
    t.oncomplete = ok; t.onerror = function () { fail(t.error); };
  });
}
/* Kickstart-tiedoston tarkistus: 256 tai 512 kt, alussa $1111 tai $1114 (ROMin hyppykäsky) */
function romLooksValid(u8) {
  return (u8.length == 262144 || u8.length == 524288) && u8[0] == 0x11 && (u8[1] == 0x11 || u8[1] == 0x14);
}

async function chooseRom() {
  if (param("rom", "") != "aros") {
    var own = await romGet();
    if (own && own.data) return { name: own.name, data: own.data, own: true };
    try {
      var k = await fetchBytes("rom/kick.rom");
      if (romLooksValid(k)) return { name: "kick.rom", data: k, own: true };
    } catch (e) { /* ei omaa ROMia palvelimella */ }
  }
  return { name: "AROS", aros: true };
}

/* ------------------------------------------------ käynnistys */
async function init() {
  sae = new ScriptedAmigaEmulator();
  cfg = sae.getConfig();
  sae.setModel(SAEC_Model_A1200, 0);
  cfg.memory.chipSize = 2 << 20;
  cfg.memory.z2FastSize = 4 << 20;       /* AROS haluaa fast-muistia; peli toimii myös ilman */
  cfg.video.id = "screen";
  cfg.video.hresolution = SAEC_Config_Video_HResolution_HiRes;
  cfg.video.vresolution = SAEC_Config_Video_VResolution_Double;
  cfg.video.size_win.width = SAEC_Video_DEF_AMIGA_WIDTH << 1;
  cfg.video.size_win.height = SAEC_Video_DEF_AMIGA_HEIGHT << 1;
  cfg.video.cursor = param("hiiri", "") == "nayta" ? SAEC_Config_Video_Cursor_Show : SAEC_Config_Video_Cursor_Lock;
  cfg.video.pauseInBackground = false;
  /* ääni herää ensimmäisestä napsautuksesta (selaimen sääntö); ?aani=0 ilman ääntä */
  cfg.audio.mode = param("aani", "1") == "0" ? SAEC_Config_Audio_Mode_Off : SAEC_Config_Audio_Mode_On;
  /* levyasema oletuksena nopeana (lataus ~13 s AROSilla), ?nopeus=aito kuten oikea asema (~27 s) */
  cfg.floppy.speed = param("nopeus", "") == "aito" ? SAEC_Config_Floppy_Speed_Original : SAEC_Config_Floppy_Speed_Turbo;
  cfg.floppy.drive[0].type = SAEC_Config_Floppy_Type_35_DD;
  for (var d = 1; d < 4; d++) cfg.floppy.drive[d].type = SAEC_Config_Floppy_Type_None;
  cfg.hook.led.power = function (on) { $("led-power").classList.toggle("on", !!on); };
  cfg.hook.led.df = function (unit, disabled, cyl, side, rw) {
    if (unit) return;
    $("led-df0").classList.toggle("on", !disabled && rw > 0);
    $("df0-track").textContent = disabled ? "–" : String(cyl);
  };
  /* moottori kirjoittaa käynnistyessään sarjaporttiin "MOUHO AGA" (mouho.s: serputs) */
  cfg.serial.enabled = true;
  mouho.serial = "";
  cfg.hook.serial.put = function (c) {
    mouho.serial = (mouho.serial + String.fromCharCode(c & 0xff)).slice(-200);
    if (!mouho.loaded && /MOUHO AGA/.test(mouho.serial)) { mouho.loaded = true; mouho.serial = ""; status("Peli käynnissä. Napsauta ruutua, niin hiiri siirtyy Amigalle."); }
  };
  cfg.hook.serial.get = function () { return -1; };
  cfg.hook.log.error = function (err, msg) { fail("Emulaattorin virhe " + err + (msg ? ": " + msg : "")); };

  var rom = await chooseRom();
  if (rom.aros) {
    setFile(cfg.memory.rom, "aros-amiga-m68k-rom.bin", await fetchBytes("rom/aros-amiga-m68k-rom.bin"));
    setFile(cfg.memory.extRom, "aros-amiga-m68k-ext.bin", await fetchBytes("rom/aros-amiga-m68k-ext.bin"));
    $("rom-name").textContent = "vapaa AROS-ROM";
  } else {
    setFile(cfg.memory.rom, rom.name, rom.data);
    cfg.memory.extRom.clr();
    $("rom-name").textContent = "oma ROM " + rom.name + " (CRC " + crc32(rom.data).toString(16) + ")";
    $("btn-aros").hidden = false;
  }
  mouho.romName = rom.name;

  var disk = await fetchBytes("mouho.adf");
  var now = param("levy", "") == "heti";
  if (now) { setFile(cfg.floppy.drive[0].file, "mouho.adf", disk); mouho.diskIn = true; }
  else cfg.floppy.drive[0].file.clr();
  mouho.disk = disk;

  var err = await sae.start();
  if (err == SAEE_Audio_RequiresWebAudio) {     /* ei Web Audiota (esim. päätteetön selain): ilman ääntä */
    cfg.audio.mode = SAEC_Config_Audio_Mode_Off;
    err = await sae.start();
  }
  if (err != SAEE_None) return fail("Käynnistys epäonnistui (" + err + ")");
  mouho.phase = "running";
  mouho.audio = cfg.audio.mode != SAEC_Config_Audio_Mode_Off;
  status(now ? "Käynnistetään levyltä…" : "Kickstart käynnistyy, ei levyä asemassa…");
  if (!now) {
    mouho.insertFrame = Math.round(+param("viive", "5") * 50);   /* PAL: 50 ruutua sekunnissa */
    var timer = setInterval(function () {
      if (mouho.diskIn) return clearInterval(timer);
      if (frames() >= mouho.insertFrame) { clearInterval(timer); insertDisk(); }
    }, 100);
  }
  updateDiskButton();
}

function insertDisk() {
  setFile(cfg.floppy.drive[0].file, "mouho.adf", mouho.disk);
  sae.insert(0);
  mouho.diskIn = true; mouho.loaded = false;
  status("Levy asemassa: Mouhon salaisuus latautuu…");
  updateDiskButton();
}
function ejectDisk() {
  sae.eject(0);
  cfg.floppy.drive[0].file.clr();
  mouho.diskIn = false;
  status("Levy poistettu.");
  updateDiskButton();
}
function updateDiskButton() { $("btn-disk").textContent = mouho.diskIn ? "Poista levy" : "Aseta levy"; }

function fail(msg) {
  mouho.error = msg; mouho.phase = "error";
  status(msg);
  var c = $("cover"); c.hidden = false; c.innerHTML = "<p>" + msg.replace(/</g, "&lt;") + "</p>";
}

window.addEventListener("load", function () {
  $("btn-disk").onclick = function () { if (mouho.phase == "running") (mouho.diskIn ? ejectDisk : insertDisk)(); };
  $("btn-reset").onclick = function () { if (mouho.phase == "running") { sae.reset(true); mouho.loaded = false; status("Uudelleenkäynnistys…"); } };
  $("rom-file").onchange = async function (e) {
    var f = e.target.files[0]; if (!f) return;
    var u8 = new Uint8Array(await f.arrayBuffer());
    if (!romLooksValid(u8)) { status("Tiedosto " + f.name + " ei näytä Kickstart-ROMilta (256/512 kt)."); return; }
    await romPut({ name: f.name, data: u8 });
    location.reload();
  };
  $("btn-aros").onclick = async function () { await romPut(null); location.search = "?rom=aros"; };
  init().catch(function (e) { fail(String(e && e.message || e)); });
});
