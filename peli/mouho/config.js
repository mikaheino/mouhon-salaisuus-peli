"use strict";
// Mouhon salaisuus -- pelin asetukset moottorille (engine.js GAME): pelattava hahmo, tekstit ja
// oivalluspisteet. Ladataan sisällön ensimmäisenä, koska ruudut ja kohtaukset nojaavat näihin.
GAME.player = (x, y, dir, frame, st, sc, back) => jussi(x, y, dir, frame, st, sc, back);
GAME.playerId = "jussi";
GAME.saveKey = "mouho-2026-save-v3";   // v3 (17.10.): uusi juoni, vanhat tallennukset eivät sovi
GAME.endFormId = "mouho2027";          // Mouho 2027 -ilmoittautuminen pelin lopussa
GAME.endFormApi = null;   // liiga-sovelluksen reitti; staattisessa nettiversiossa (tools/dist.mjs) null: ei lomaketta
GAME.iqLabel = "Mouho-IQ";
GAME.iconSize = [48, 32];         // tavarakuvakkeet tuplatarkkoina (palaute 24.10.: "kökköjä")
GAME.iconOutline = "#1a1426";     // sarjakuvamainen ääriviiva kaikkiin kuvakkeisiin
GAME.iqMax = 151;   // kaikkien iq()-pisteiden summa (huoneet, kohtaukset, INTERVIEW, ulkona), tarkistettu 23.10.; +15 Galatan silta ja teehuone 25.10.
const IQ_MAX = GAME.iqMax;
GAME.text.generic = { Poimi: "En voi ottaa sitä.", Avaa: "Se ei aukea.", Sulje: "Se ei sulkeudu.", Työnnä: "Se ei liiku.", Vedä: "Se ei liiku.", Puhu: "Se ei vastaa. Hyvä niin.", Käytä: "En keksi, miten.", Anna: "Ei kiitos.", Katso: "Ei mitään erikoista." };
GAME.text.cannot = "Ei, se ei toimi noin.";
// Esine esineeseen ilman omaa yhdistelmää (moottorin input.js)
GAME.text.combine = ["Yhdistän ne mielessäni. Tulos: kaksi erillistä esinettä.", "Ne eivät sovi yhteen. Kuin kaksi maalivahtia samassa maalissa.",
  "Jos teippaan nämä yhteen, saan teipatun sotkun.", "Ei. Edes Mouhon turnauksessa ei pelata tällä yhdistelmällä."];
GAME.enterFx = "iris";            // uusi ruutu aukeaa iiriksenä pelaajan ympäriltä (MI2:n tapaan, engine/fx.js)
GAME.text.unknown = "Hmm.";
GAME.text.self = ["Jussi Markkanen. Proaktiivinen. Paita vähän ryppyinen, mutta katse eteenpäin.", "Tuleva toiminnanjohtaja. Tai ainakin hakija. Tai ainakin mies, joka on lukenut ilmoituksen.",
  "Kengännauhat kiinni, kaavio taskussa. Kaikki on hallinnassa.", "Komea. Ja nöyrä. Erityisesti nöyrä."];
// Kävely kuvan ulkopuolelle sivulle (moottorin page-osa): kommentit puolen mukaan
GAME.text.outside = { vasen: ["Tämä ei ole enää {ruutu}. Tämä on reunaa.", "Vasemmalla ei ole mitään. Ei edes mainoksia."],
  oikea: ["Oikealla on pelkkää mustaa. Kuin otteluohjelman tyhjät viikot.", "Täältä ei pääse Istanbuliin. Tarkistin."],
  alla: ["Verbien alla. Tänne putoavat sanat, joita kukaan ei käytä.", "Seison tavaralistan alla. Jos jotain putoaa, se osuu minuun."],
  ylla: ["Täällä ylhäällä on vain selaimen kulma. Ja se on tyhjä.", "Vielä vähän ylemmäs, niin olen välilehdissä."],
  kaikki: ["Nyt ollaan väärässä paikassa.", "Tänne ei piirretty mitään. Kävelen silti.", "Pimeää. Täällä ei ole edes kävelyalueita.", "Jos joku kysyy, olin koko ajan pelissä."] };
GAME.text.back = "Takaisin pikseleihin. Täällä on sentään tehtävälista.";
