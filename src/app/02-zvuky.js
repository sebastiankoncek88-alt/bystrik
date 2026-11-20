/* ===== Zvuky, hlas ===== */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state !== 'running') { try { AC.resume(); } catch (e) { } } return AC; }
/* iPhone: zvuk musí odomknúť ťuknutie (synchronne) a bez „playback“ ho stlmí prepínač tichého režimu */
let SAYQ = [], TTSOK = false;
/* iPhone: reč sa odomkne len prvým ťuknutím – prázdna tichá veta */
function ttsUnlock() { if (TTSOK || !('speechSynthesis' in window)) return; TTSOK = true; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { } }
function audioUnlock() {
  ttsUnlock();
  try { if (navigator.audioSession && !(typeof RD !== 'undefined' && RD && RD.recording)) navigator.audioSession.type = 'playback'; } catch (e) { }
  const a = ac(); if (!a) return;
  try { const b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch (e) { }
}
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, audioUnlock, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && AC && AC.state !== 'running') { try { AC.resume(); } catch (e) { } } });
function tone(f, d, type = 'sine', vol = .14, when = 0, slide) {
  const a = ac(); if (!a) return; if (a.state !== 'running') { try { a.resume().then(() => tone(f, d, type, vol, when, slide)).catch(() => { }); } catch (e) { } return; } const t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
}
/* Vlastný zvuk Bystríka: mäkké „drevené“ tóny (marimba) a zvučka */
/* Zvuk Bystríka 2.0: kalimba / zvonček (mäkký úder + jasný alikvót) a bublinky */
function mar(f, when = 0, vol = .15, d = .45) { tone(f, d, 'sine', vol, when, f * .985); tone(f * 3.98, d * .22, 'sine', vol * .22, when); tone(f * 2.76, d * .3, 'sine', vol * .12, when); }
function bub(f1, f2, when = 0, vol = .08, d = .12) { tone(f1, d, 'sine', vol, when, f2); }
function air(d = .3, vol = .05, when = 0, f1 = 600, f2 = 2400) {
  const a = ac(); if (!a || a.state !== 'running') return; const t = a.currentTime + when;
  try { const n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + d * .3); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(bp).connect(g).connect(a.destination); s.start(t); s.stop(t + d + .02); } catch (e) { }
}
const JINGLE = [[523, 0], [659, .11], [784, .22], [1047, .36]];
/* Bystríkove pesničky (vlastné jednoduché melódie): [tón, dĺžka v dobách], 0 = pauza */
const TN = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880 };
const TUNES = [
  { bpm: 150, bass: ['C4', 'G4', 'A4', 'F4'], n: 'C5 1 E5 1 G5 2 E5 1 G5 1 A5 2 G5 1 E5 1 C5 1 D5 1 E5 4 F5 1 E5 1 D5 2 G5 1 F5 1 E5 2 D5 1 C5 1 D5 1 E5 1 C5 4' },
  { bpm: 132, bass: ['F4', 'C4', 'G4', 'C4'], n: 'A4 1 C5 1 F5 2 E5 1 D5 1 C5 2 D5 1 E5 1 F5 1 G5 1 A5 4 G5 1 F5 1 E5 2 D5 1 E5 1 F5 2 C5 2 A4 2 F4 4' },
  { bpm: 168, bass: ['G4', 'D4', 'E4', 'C4'], n: 'G4 1 G4 1 D5 1 D5 1 E5 1 E5 1 D5 2 C5 1 C5 1 B4 1 B4 1 A4 1 A4 1 G4 2 D5 1 D5 1 C5 1 C5 1 B4 1 B4 1 A4 2 G4 4' }
];
let TUNE_I = 0, TUNE_UNTIL = 0;
function playTune(i) {
  if (Date.now() < TUNE_UNTIL) return; const tu = TUNES[i == null ? (TUNE_I++ % TUNES.length) : i]; const beat = 60 / tu.bpm; const parts = tu.n.split(' '); let t = .05;
  try {
    for (let k = 0; k < parts.length; k += 2) { const f = TN[parts[k]], d = +parts[k + 1] * beat; if (f) mar(f, t, .11, Math.max(.25, d * 1.4)); t += d; }
    for (let b = 0, bt = .05; bt < t; b++, bt += beat * 2) { const f = TN[tu.bass[Math.floor(b / 2) % tu.bass.length]] / 2; tone(f, beat * 1.6, 'triangle', .07, bt); if (b % 2) tone(1800, .03, 'square', .012, bt + beat); }
  } catch (e) { }
  TUNE_UNTIL = Date.now() + t * 1000;
}
const SFX = {
  tap: () => bub(520, 980, 0, .07, .07), pop: () => { bub(420, 1100, 0, .1, .11); mar(1319, .05, .04, .18); },
  ok: () => { mar(1047, 0, .13, .35); mar(1319, .07, .12, .4); mar(1568, .14, .12, .55); },
  no: () => { tone(330, .18, 'triangle', .09, 0, 300); tone(262, .26, 'triangle', .09, .14, 230); },
  flip: () => { air(.12, .05, 0, 1200, 3000); bub(600, 900, 0, .04, .06); },
  match: () => [784, 988, 1175, 1568].forEach((f, i) => mar(f, i * .07, .11, .35)),
  jingle: () => { JINGLE.forEach(([f, t]) => mar(f, t, .14, .55)); [1047, 1319, 1568].forEach(f => mar(f, .56, .07, 1)); tone(131, .8, 'sine', .08, .56); },
  level: () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => mar(f, i * .07, .13, .5)); air(.6, .04, .3, 2000, 6000); tone(131, 1, 'sine', .08, .45); },
  star: i => { mar([1047, 1319, 1568][i] || 1047 + i * 200, 0, .13, .45); air(.25, .03, 0, 3000, 7000); }, tick: () => tone(1500, .025, 'sine', .03),
  whoosh: () => air(.32, .06, 0, 500, 3200), gift: () => { [784, 988, 1175, 1568, 2093].forEach((f, i) => mar(f, i * .06, .1, .4)); air(.5, .04, .1, 1500, 6000); },
  nav: () => { bub(380, 760, 0, .06, .09); bub(560, 1120, .06, .05, .09); },
  back: () => { bub(760, 380, 0, .05, .1); },
  purr: () => { tone(90, .6, 'sawtooth', .02, 0, 76); tone(100, .55, 'triangle', .03, .05, 86); mar(1175, .15, .05, .35); mar(1568, .28, .04, .35); },
  yum: () => { bub(300, 700, 0, .1, .1); bub(340, 820, .14, .1, .1); mar(1319, .28, .08, .3); },
  chest: () => { air(.5, .05, 0, 300, 2400); [1047, 1319, 1568, 2093, 2637].forEach((f, i) => mar(f, .38 + i * .06, .09, .5)); },
  mic: () => { mar(1175, 0, .07, .15); mar(1568, .07, .07, .22); },
  balloon: () => { air(.09, .09, 0, 2500, 800); bub(900, 300, 0, .06, .08); }, coin: () => { mar(1568, 0, .07, .18); mar(2093, .06, .07, .35); }
};

let JINGLED = false;
document.addEventListener('pointerdown', () => { if (JINGLED) return; JINGLED = true; setTimeout(() => sfx('jingle'), 60); }, true);
function sfx(n, a) { if (!DATA.settings.sound) return; try { SFX[n](a); } catch (e) { } }
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices() || []; } catch (e) { } }
if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { } }
function pickVoice(lang) { const l = lang.slice(0, 2).toLowerCase(); const by = x => VOICES.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(x)); const list = by(l); const best = list.find(v => /google|natural|enhanced|premium|laura/i.test(v.name)) || list[0]; return best || (l === 'sk' ? by('cs')[0] : null); }
const slovakVoice = () => { loadVoices(); const v = pickVoice('sk-SK'); return v ? ((v.lang || '').toLowerCase().startsWith('sk') ? 'sk' : 'cs') : null; };
function say(text, lang = 'sk-SK') {
  if (!DATA.settings.voice || !('speechSynthesis' in window)) return;
  try {
    const busy = speechSynthesis.speaking || speechSynthesis.pending; if (busy) speechSynthesis.cancel(); if (!VOICES.length) loadVoices();
    let t = text;
    if (lang === 'sk-SK') t = t.replace(/ · /g, ' krát ').replace(/ : /g, ' delené ').replace(/ − /g, ' mínus ').replace(/ \+ /g, ' plus ').replace(/ = \?/g, ' sa rovná koľko?').replace(/_/g, ' ').replace(/[„“"]/g, '');
    const v = pickVoice(lang);
    const parts = t.match(/[^.!?…]+[.!?…]*/g) || [t];
    const us = [];
    parts.forEach(seg => { const x = seg.trim(); if (!x) return; const u = new SpeechSynthesisUtterance(x); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang; u.rate = lang === 'sk-SK' ? .85 : .8; u.pitch = 1.05; us.push(u); });
    const talk = on => document.querySelectorAll('.obbear,.tutbear,.herobear').forEach(e => e.classList.toggle('talking', on));
    if (us.length) { us[0].onstart = () => talk(true); const last = us[us.length - 1]; last.onend = last.onerror = () => talk(false); }
    /* iPhone: drž odkazy (inak sa reč preruší) a po cancel() chvíľu počkaj, inak Safari vetu zahodí */
    SAYQ = us; const run = () => { try { if (speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { } us.forEach(u => speechSynthesis.speak(u)); };
    if (busy) setTimeout(run, 140); else run();
  } catch (e) { }
}
function sayOld(text, lang = 'sk-SK') {
  if (!DATA.settings.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const t = text.replace(/ · /g, ' krát ').replace(/ : /g, ' delené ').replace(/ − /g, ' mínus ').replace(/ \+ /g, ' plus ').replace(/ = \?/g, ' sa rovná koľko?').replace(/_/g, ' ');
    const u = new SpeechSynthesisUtterance(lang === 'sk-SK' ? t : text); u.lang = lang; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith(lang.slice(0, 2))); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
}

