/* ===== Zvuky, hlas ===== */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'sine', vol = .14, when = 0, slide) {
  const a = ac(); if (!a) return; const t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
}
/* Vlastný zvuk Bystríka: mäkké „drevené“ tóny (marimba) a zvučka */
function mar(f, when = 0, vol = .15, d = .45) { tone(f, d, 'sine', vol, when); tone(f * 4, d * .16, 'sine', vol * .3, when); tone(f * 2.01, d * .38, 'triangle', vol * .1, when); }
const JINGLE = [[392, 0], [659, .13], [587, .26], [784, .46]];
const SFX = {
  tap: () => mar(880, 0, .05, .08), pop: () => mar(587, 0, .1, .16),
  ok: () => { mar(659, 0, .14, .3); mar(784, .09, .14, .42); },
  no: () => { mar(220, 0, .12, .32); mar(196, .12, .12, .45); }, flip: () => mar(523, 0, .08, .14),
  match: () => [587, 659, 784].forEach((f, i) => mar(f, i * .08, .12, .3)),
  jingle: () => { JINGLE.forEach(([f, t]) => mar(f, t, .15, .5)); [523, 659, 784].forEach(f => mar(f, .72, .09, .9)); tone(131, .7, 'sine', .1, .72); },
  level: () => { JINGLE.forEach(([f, t]) => mar(f, t, .15, .5)); [1046, 1318, 1568].forEach((f, i) => mar(f, .66 + i * .1, .11, .6)); tone(131, .9, 'sine', .1, .66); },
  star: i => mar([659, 784, 988][i] || 659 + i * 150, 0, .13, .35), tick: () => tone(1200, .03, 'sine', .03),
  whoosh: () => tone(200, .25, 'sine', .06, 0, 1200), gift: () => [392, 523, 659, 784, 1046].forEach((f, i) => mar(f, i * .07, .12, .35)),
  balloon: () => { mar(988, 0, .08, .1); tone(700, .07, 'sine', .05, 0, 240); }, coin: () => { mar(1175, 0, .07, .15); mar(1568, .07, .07, .32); }
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
    speechSynthesis.cancel(); if (!VOICES.length) loadVoices();
    let t = text;
    if (lang === 'sk-SK') t = t.replace(/ · /g, ' krát ').replace(/ : /g, ' delené ').replace(/ − /g, ' mínus ').replace(/ \+ /g, ' plus ').replace(/ = \?/g, ' sa rovná koľko?').replace(/_/g, ' ').replace(/[„“"]/g, '');
    const v = pickVoice(lang);
    const parts = t.match(/[^.!?…]+[.!?…]*/g) || [t];
    const us = [];
    parts.forEach(seg => { const x = seg.trim(); if (!x) return; const u = new SpeechSynthesisUtterance(x); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang; u.rate = lang === 'sk-SK' ? .85 : .8; u.pitch = 1.05; us.push(u); });
    const talk = on => document.querySelectorAll('.obbear,.tutbear,.herobear').forEach(e => e.classList.toggle('talking', on));
    if (us.length) { us[0].onstart = () => talk(true); const last = us[us.length - 1]; last.onend = last.onerror = () => talk(false); }
    us.forEach(u => speechSynthesis.speak(u));
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

