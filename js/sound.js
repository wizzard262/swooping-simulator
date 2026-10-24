'use strict';
// ---------------------------------------------------------------------------
// Sound, all made in code with Web Audio (no files): effects for everything that happens (the
// swoop's afterburner, poops, cans, the cast's calls and cries), rain and thunder in a storm, and
// a background of breeze, cicadas and now and then a far-off didgeridoo. It starts on the first
// key press or touch (browsers need that); M or the speaker icon mutes it, and that's remembered.
// ---------------------------------------------------------------------------
const Sound = (() => {
  let ac = null, master = null, noise = null, muted = false, hicT = 1, cicadaT = 6, didgT = 8, burner = null, slinger = null, drunkEcho = null, wasSwooping = false, wasFlung = false, rain = null;
  try { muted = localStorage.getItem('swoopMuted') === '1'; } catch (e) { /* storage blocked: default on */ }

  function start() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ac.destination);
    drunkEcho = echoSend();
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    breeze();
    burner = afterburnerRoar();
    slinger = slingshotRoar();
    rain = ac.createGain(); rain.gain.value = 0; rain.connect(master);   // rain, faded up in a storm
    const rs = ac.createBufferSource(), rf = ac.createBiquadFilter();
    rs.buffer = noise; rs.loop = true; rf.type = 'bandpass'; rf.frequency.value = 2800; rf.Q.value = 0.5;
    rs.connect(rf); rf.connect(rain); rs.start();
    updateIcon();
  }

  // The swoop's afterburner: a roaring rush of noise over a low rumble, flickering, always
  // running and faded up and down with the swoop
  function afterburnerRoar() {
    const out = ac.createGain(); out.gain.value = 0; out.connect(master);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter();
    s.buffer = noise; s.loop = true; f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 0.8;
    const crackle = ac.createGain(); crackle.gain.value = 0.8;
    const fl = ac.createOscillator(), flg = ac.createGain(); fl.type = 'sawtooth'; fl.frequency.value = 17; flg.gain.value = 0.25;
    fl.connect(flg); flg.connect(crackle.gain);
    s.connect(f); f.connect(crackle); crackle.connect(out);
    const rumble = ac.createOscillator(), rf = ac.createBiquadFilter(), rg = ac.createGain();
    rumble.type = 'sawtooth'; rumble.frequency.value = 48; rf.type = 'lowpass'; rf.frequency.value = 160; rg.gain.value = 0.6;
    rumble.connect(rf); rf.connect(rg); rg.connect(out);
    s.start(); fl.start(); rumble.start();
    return { out, filter: f };
  }
  // Flung out of the SOLAR-SLINGSHOT!!!!: the afterburner's coarser big brother. Lower, distorted
  // noise chopped up by a slow square-wave stutter, over a deep growling square-wave rumble
  function slingshotRoar() {
    const out = ac.createGain(); out.gain.value = 0; out.connect(master);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), grit = ac.createWaveShaper();
    s.buffer = noise; s.loop = true; f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 1.4;
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 6); }   // hard-driven: gritty
    grit.curve = curve;
    const chop = ac.createGain(); chop.gain.value = 0.7;
    const st = ac.createOscillator(), stg = ac.createGain(); st.type = 'square'; st.frequency.value = 9; stg.gain.value = 0.35;
    st.connect(stg); stg.connect(chop.gain);
    s.connect(f); f.connect(grit); grit.connect(chop); chop.connect(out);
    const growl = ac.createOscillator(), gf = ac.createBiquadFilter(), gg = ac.createGain();
    growl.type = 'square'; growl.frequency.value = 31; gf.type = 'lowpass'; gf.frequency.value = 130; gg.gain.value = 0.7;
    growl.connect(gf); gf.connect(gg); gg.connect(out);
    s.start(); st.start(); growl.start();
    return { out };
  }
  // Drunk: everything echoes. A copy of all the sound goes round a delay that feeds back on itself
  // (each repeat a bit duller and quieter), faded in while he's drunk
  function echoSend() {
    const delay = ac.createDelay(1), fb = ac.createGain(), tone = ac.createBiquadFilter(), wet = ac.createGain();
    delay.delayTime.value = 0.27; fb.gain.value = 0.45; tone.type = 'lowpass'; tone.frequency.value = 2200; wet.gain.value = 0;
    master.connect(delay); delay.connect(tone); tone.connect(fb); fb.connect(delay);
    tone.connect(wet); wet.connect(ac.destination);
    return wet;
  }
  // The burner lighting: a deep whoomp
  function ignite() {
    const t = now();
    burst(t, 0.35, 'lowpass', 500, 1, 0.5);
    tone('sine', 110, 38, t, 0.3, 0.45);
  }

  // Building blocks
  const now = () => ac.currentTime;
  function env(gain, t, attack, hold, release, peak) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.setValueAtTime(peak, t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  }
  // A note sliding from f0 to f1, rising in attack seconds then dying away over dur (returns the oscillator)
  function tone(type, f0, f1, t, dur, peak, dest = master, attack = 0.005) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, attack, 0, dur, peak);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  // Wobble an oscillator's pitch, rate times a second by depth Hz (returns the depth, to ramp it)
  function vibrato(o, rate, depth, t, dur) {
    const v = ac.createOscillator(), g = ac.createGain();
    v.frequency.value = rate; g.gain.value = depth;
    v.connect(g); g.connect(o.frequency); v.start(t); v.stop(t + dur + 0.05);
    return g.gain;
  }
  function burst(t, dur, filterType, freq, q, peak, dest = master) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    env(g, t, 0.004, 0, dur, peak);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  // Background: a breeze that comes and goes (looping filtered noise with slow wobbles)
  function breeze() {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; s.loop = true; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0.05;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.03;
    const lfo2 = ac.createOscillator(), lg2 = ac.createGain(); lfo2.frequency.value = 0.05; lg2.gain.value = 250;
    lfo.connect(lg); lg.connect(g.gain); lfo2.connect(lg2); lg2.connect(f.frequency);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(); lfo.start(); lfo2.start();
  }
  // Cicadas: a pulsing high buzz that swells up and dies away
  function cicadas() {
    const t = now(), len = 4 + Math.random() * 3;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), pulse = ac.createGain(), g = ac.createGain();
    s.buffer = noise; s.loop = true; f.type = 'bandpass'; f.frequency.value = 4800 + Math.random() * 800; f.Q.value = 9;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.type = 'square'; lfo.frequency.value = 38 + Math.random() * 10; lg.gain.value = 0.5;
    pulse.gain.value = 0.5; lfo.connect(lg); lg.connect(pulse.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + len * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f); f.connect(pulse); pulse.connect(g); g.connect(master);
    s.start(t); lfo.start(t); s.stop(t + len + 0.1); lfo.stop(t + len + 0.1);
  }
  // A didgeridoo, far off, built the way a real one makes its sound:
  // - lips buzzing (a pulse rich in harmonics) into a long tube: the tube is a delay line fed
  //   back on itself, so it rings at its own resonances and colours the buzz like wood does
  // - the player's mouth shaping "wo-wow-wow" on each beat (two formants sweeping up and back)
  // - breath hissing through it, a quick sniff in now and then (circular breathing)
  // - a voice humming into it now and then (the "dingo howl"), the odd overtone toot, and the
  //   pitch wandering slightly as the lips loosen and tighten
  // It fades in, plays for 10 to 15 seconds and fades out.
  const VOWELS = { oo: [300, 800], oh: [480, 950], ah: [760, 1250] };
  let lipWave = null;
  function didgeridoo() {
    const t0 = now(), f = 62 + Math.random() * 10, step = 0.15 + Math.random() * 0.04;
    const steps = 66 + Math.floor(Math.random() * 30), len = steps * step, fade = 2.5;
    if (!lipWave) {
      const n = 60, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = 1 / Math.pow(k, 0.65);
      lipWave = ac.createPeriodicWave(re, im);
    }
    const out = ac.createGain();
    out.gain.setValueAtTime(0.0001, t0); out.gain.exponentialRampToValueAtTime(0.22, t0 + fade);
    out.gain.setValueAtTime(0.22, t0 + len - fade); out.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    const distance = ac.createBiquadFilter(); distance.type = 'lowpass'; distance.frequency.value = 3000;
    distance.connect(out); out.connect(master);
    const accent = ac.createGain(); accent.gain.value = 0.6; accent.connect(distance);
    const mouth = ac.createGain(); mouth.gain.value = 1;             // everything goes through the mouth shapes

    // The tube: a delay of one period fed back through a gentle lowpass
    const tube = ac.createDelay(0.1), loop = ac.createGain(), damp = ac.createBiquadFilter();
    tube.delayTime.value = 1 / f; loop.gain.value = 0.72; damp.type = 'lowpass'; damp.frequency.value = 1600;
    tube.connect(damp); damp.connect(loop); loop.connect(tube);
    const lips = ac.createOscillator(); lips.setPeriodicWave(lipWave); lips.frequency.value = f;
    const lipsG = ac.createGain(); lipsG.gain.value = 0.35;
    lips.connect(lipsG); lipsG.connect(tube); lipsG.connect(mouth); tube.connect(mouth);

    // Breath through the tube, and the voice
    const breath = ac.createBufferSource(), bf = ac.createBiquadFilter(), bgain = ac.createGain();
    breath.buffer = noise; breath.loop = true; bf.type = 'bandpass'; bf.frequency.value = 1600; bf.Q.value = 0.8; bgain.gain.value = 0.05;
    breath.connect(bf); bf.connect(bgain); bgain.connect(mouth);
    const voice = ac.createOscillator(), vg = ac.createGain(); voice.type = 'sawtooth'; voice.frequency.value = f * 2.5; vg.gain.value = 0;
    voice.connect(vg); vg.connect(tube);

    // The mouth: a low body plus two formants that make the wow
    const body = ac.createBiquadFilter(); body.type = 'lowpass'; body.frequency.value = 240;
    const bodyG = ac.createGain(); bodyG.gain.value = 0.5; mouth.connect(body); body.connect(bodyG); bodyG.connect(accent);
    const formants = [[6, 1.3], [10, 1.0]].map(([q, level]) => {
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
      const g = ac.createGain(); g.gain.value = level;
      mouth.connect(bp); bp.connect(g); g.connect(accent);
      return bp;
    });

    const pattern = [];
    for (let i = 0; i < 8; i++) pattern.push({ open: i % 4 === 0 ? 1 : i % 2 ? 0.55 + Math.random() * 0.45 : Math.random() < 0.3 ? 0 : 0.85, hit: i % 4 === 0 ? 1 : i % 2 ? 0.6 : 0.8 });
    for (let i = 0; i < steps; i++) {
      const t = t0 + i * step, p = pattern[i % 8], open = Math.random() < 0.1 ? Math.random() : p.open;
      const w = VOWELS.oo, wide = VOWELS[open > 0.8 ? 'ah' : 'oh'];
      formants.forEach((b, k) => {
        b.frequency.setTargetAtTime(w[k], t, 0.015);
        b.frequency.setTargetAtTime(w[k] + (wide[k] - w[k]) * open, t + step * 0.22, 0.045);
      });
      accent.gain.setTargetAtTime(p.hit, t, 0.012);
      accent.gain.setTargetAtTime(p.hit * 0.65, t + step * 0.5, 0.05);
      bgain.gain.setTargetAtTime(0.03 + 0.05 * p.hit, t, 0.02);          // breath pushes with the beat
      const pf = f * (1 + (Math.random() - 0.5) * 0.02);                // lips loosen and tighten
      lips.frequency.setTargetAtTime(pf, t, 0.08); tube.delayTime.setTargetAtTime(1 / pf, t, 0.08);
      if (i % 24 === 23) {                                               // a sniff in through the nose
        accent.gain.setTargetAtTime(0.12, t, 0.01);
        burst(t, 0.14, 'bandpass', 2500, 0.8, 0.06, distance);
      }
      if (i % 32 === 12 && Math.random() < 0.7) {                        // the voice howls for a moment
        voice.frequency.setValueAtTime(f * 2.2, t);
        voice.frequency.linearRampToValueAtTime(f * 3.1, t + step * 3);
        vg.gain.setTargetAtTime(0.12, t, 0.05); vg.gain.setTargetAtTime(0, t + step * 4, 0.08);
      }
      if (Math.random() < 0.04 && i > 8 && i < steps - 8) {              // an overtone toot
        lips.frequency.setTargetAtTime(f * 2.6, t, 0.02); tube.delayTime.setTargetAtTime(1 / (f * 2.6), t, 0.02);
        lips.frequency.setTargetAtTime(f, t + step * 2.5, 0.03); tube.delayTime.setTargetAtTime(1 / f, t + step * 2.5, 0.03);
      }
    }
    const end = t0 + len + 0.1;
    lips.start(t0); breath.start(t0); voice.start(t0);
    lips.stop(end); breath.stop(end); voice.stop(end);
  }

  // Effects
  function plop() { const t = now(); tone('sine', 700, 180, t, 0.09, 0.25); }
  function splosh() {
    const t = now();
    burst(t, 0.28, 'lowpass', 900, 1, 0.45);
    tone('sine', 140, 60, t, 0.12, 0.35);
    burst(t + 0.03, 0.12, 'bandpass', 2500, 2, 0.1);
  }
  // A ringing partial: a sine that starts at once and dies away exponentially
  function ring(f, t, decay, peak, dest = master) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + decay + 0.05);
  }
  // An aluminium can: a hollow, crinkly tonk (thin metal rattling) rather than a ring
  function canHit(t, level) {
    burst(t, 0.035, 'bandpass', 1800 + Math.random() * 1600, 1.2, 0.35 * level);     // crinkle
    burst(t, 0.06, 'bandpass', 700 + Math.random() * 300, 4, 0.25 * level);          // hollow body
    ring(350 + Math.random() * 200, t, 0.06, 0.08 * level);
    ring(2400 + Math.random() * 1200, t, 0.03, 0.02 * level);
  }
  // ...and it bounces: two or three quick, quieter hits
  function can(level = 1) {
    let t = now() + Math.random() * 0.015, l = level;
    for (let k = 0, n = 2 + Math.floor(Math.random() * 2); k <= n; k++) { canHit(t, l); t += 0.07 + Math.random() * 0.07; l *= 0.45; }
  }
  // The kangaroo knocked over: a cartoon "doiiinggg", a twangy note bending up with a spring wobble
  function boing() {
    const t = now(), len = 0.95;
    for (const [type, mul, peak] of [['triangle', 1, 0.22], ['sine', 2, 0.08]]) {
      const spring = vibrato(tone(type, 170 * mul, 330 * mul, t, len, peak, master, 0.01), 13, 90 * mul, t, len);
      spring.setValueAtTime(90 * mul, t); spring.exponentialRampToValueAtTime(2 * mul, t + len);   // the wobble settles
    }
  }
  // A magpie's carol: a run of rich, warbling, fluting notes that slide about, sometimes two
  // at once (magpies can sing two notes together), about 2 seconds long
  function carol() {
    const t0 = now(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.connect(master);
    let t = t0;
    const scale = [740, 880, 990, 1180, 1320, 1480, 1760, 1980];
    for (let i = 0; i < 11; i++) {
      const dur = 0.09 + Math.random() * 0.16, f = pick(Math.random, scale), f2 = f * (0.85 + Math.random() * 0.35);
      for (const [mul, peak] of Math.random() < 0.3 ? [[1, 0.08], [1.5, 0.04]] : [[1, 0.1]])
        vibrato(tone('sine', f * mul, f2 * mul, t, dur, peak, lp, 0.02), 28 + Math.random() * 20, f * 0.03, t, dur);   // with a gurgle
      t += dur + Math.random() * 0.06;
      if (t > t0 + 1.9) break;
    }
  }
  // The magpie screaming: a harsh, shrill squawk sliding down, with a rasp in it
  function scream(pitch = 1, level = 1, delay = 0) {
    const t = now() + delay, len = 0.75;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 1.2; bp.connect(master);
    for (const [type, mul, peak] of [['sawtooth', 1, 0.16], ['square', 1.5, 0.06]])
      vibrato(tone(type, 1500 * mul * pitch, 650 * mul * pitch, t, len, peak * level, bp, 0.03), 22, 60 * mul, t, len);
    burst(t, len * 0.8, 'bandpass', 3000, 1, 0.08 * level);
  }
  // Hot plate: a fierce sizzle that dies away, with a few spits
  function sizzle() {
    const t = now();
    burst(t, 0.9, 'highpass', 3500, 0.7, 0.35);
    for (let i = 0; i < 6; i++) burst(t + Math.random() * 0.6, 0.03, 'bandpass', 5000, 3, 0.25);
  }
  // A kookaburra's laugh: a few low chuckles, building to a loud, raucous, screeching
  // "ha-ha-HA-HA-HA" (harsh, rasping notes that chirp down, faster and higher, a second
  // voice joining in), then tailing off into chuckles again. About 2.5 seconds.
  let rasp = null, laughOut = null;   // laughOut: the laugh playing now, so it can be hushed
  function laugh() {
    if (!rasp) {                                                     // a hard clip that makes the notes harsh and screechy
      rasp = new Float32Array(256);
      for (let i = 0; i < 256; i++) { const x = i / 128 - 1; rasp[i] = Math.tanh(x * 6) * 0.9; }
    }
    const out = ac.createGain(); out.gain.value = 0.5;
    const shaper = ac.createWaveShaper(); shaper.curve = rasp;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    shaper.connect(bp); bp.connect(out); out.connect(master); laughOut = out;
    const syllable = (t, f, len, peak) => {
      tone('sawtooth', f * 1.35, f * 0.7, t, len, peak, shaper, 0.008);   // each "ha" chirps down
      burst(t, len * 0.8, 'bandpass', f * 2, 2, peak * 0.5, out);       // breathy rasp
    };
    let t = now();
    for (let i = 0; i < 5; i++, t += 0.16) syllable(t, 520 + i * 30, 0.1, 0.25);                 // low chuckles
    for (let i = 0; i < 16; i++) {                                                              // the screeching laugh
      const k = Math.sin(i / 15 * Math.PI), f = 1000 + k * 1100 + Math.random() * 120;
      syllable(t, f, 0.075, 0.45 + 0.35 * k);
      if (i % 2 && k > 0.4) syllable(t + 0.035, f * 1.18, 0.06, 0.35 * k);                      // a second bird joining in
      t += 0.085 - k * 0.015;
    }
    for (let i = 0; i < 4; i++, t += 0.15) syllable(t, 700 - i * 60, 0.1, 0.25);                // tailing off
  }
  // Fade out the laugh (he's gone off screen)
  function hushLaugh() {
    if (!laughOut) return;
    const t = now(), g = laughOut.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + 0.08);
    laughOut = null;
  }
  // Magpie chicks begging: thin, high cheeps from three of them
  function cheep() {
    const t = now();
    for (let i = 0; i < 6; i++) {
      const f = 2600 + Math.random() * 900;
      tone('sine', f, f * 1.35, t + i * 0.09 + Math.random() * 0.04, 0.06, 0.06, master, 0.01);
    }
  }
  // The game complete: a brassy fanfare, ta-ta-ta-TAAA, with a held chord at the end
  function fanfare() {
    const t = now(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(master);
    const brass = (f, at, dur, peak) => vibrato(tone('sawtooth', f, f, t + at, dur, peak, lp, 0.02), 5.5, f * 0.008, t + at, dur);
    [[523, 0], [523, 0.16], [523, 0.32], [659, 0.48], [587, 0.78], [659, 0.94]].forEach(([f, at]) => brass(f, at, 0.14, 0.12));
    for (const [f, peak] of [[784, 0.12], [988, 0.07], [1175, 0.05], [392, 0.08]]) brass(f, 1.12, 1.6, peak);   // the big finish
  }
  // A bicycle bell: ring-ring
  function bell() {
    const t = now();
    for (const at of [0, 0.18]) for (const [f, p] of [[2600, 0.09], [3900, 0.04]]) ring(f, t + at, 0.5, p);
  }
  // A cyclist's "Oi!": a voice sliding from "o" to "i"
  function oi() {
    const t = now(), mouth = ac.createGain();
    for (const [a, b, q] of [[520, 300, 6], [900, 2200, 8]]) {        // two formants sliding from "o" to "i"
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
      bp.frequency.setValueAtTime(a, t); bp.frequency.linearRampToValueAtTime(b, t + 0.35);
      mouth.connect(bp); bp.connect(master);
    }
    tone('sawtooth', 170, 130, t, 0.4, 0.25, mouth, 0.03);
  }
  // Thunder: a deep crack and a long rolling rumble
  function thunder() {
    const t = now();
    burst(t, 0.25, 'lowpass', 900, 0.7, 0.5);
    for (let i = 0; i < 5; i++) burst(t + 0.1 + i * 0.35 + Math.random() * 0.2, 1.4, 'lowpass', 160 + Math.random() * 80, 0.7, 0.5 - i * 0.07);
  }
  // Cockatoos: harsh, screeching squawks
  function screech() {
    const t0 = now();
    for (let i = 0; i < 4; i++) {
      const t = t0 + i * 0.22 + Math.random() * 0.1, f = 1700 + Math.random() * 700;
      tone('sawtooth', f, f * 0.7, t, 0.22, 0.05);
      burst(t, 0.2, 'bandpass', 3000, 1.5, 0.12);
    }
  }
  // The drop bear: a deep, rasping growl and a thump
  function growl() {
    const t = now(), o = ac.createOscillator(), g = ac.createGain(), am = ac.createOscillator(), ag = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(70, t + 0.9);
    am.frequency.value = 23; ag.gain.value = 0.15; am.connect(ag); ag.connect(g.gain);
    lp.type = 'lowpass'; lp.frequency.value = 500;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); am.start(t); o.stop(t + 1); am.stop(t + 1);
    burst(t + 0.25, 0.2, 'lowpass', 220, 0.7, 0.6);
  }
  function hic() {
    const t = now();
    tone('square', 280, 720, t, 0.07, 0.07);
    burst(t, 0.06, 'bandpass', 1200, 3, 0.12);
  }
  // The Hills Hoist: a rusty squeal copied from a recording of a real squeaky gate. A reedy note
  // about 830 Hz that steps up to 870 Hz and swells, with a short, high squeak (about 3,400 Hz)
  // at the start. Each voice is one oscillator carrying the gate's overtones at their measured
  // loudness (dB below the note: the quieter first part and the louder second part), its pitch
  // shaken fast and unevenly (the scrape: metal gripping and slipping) and its level roughened
  const SQUEAL_TONES = { first: [0, -5, -19, -10, -15, -17, -26, -38, -35, -43], loud: [0, -13, -14, -11, -20, -20, -32, -40, -45, -50] };
  const squealWaves = {};
  function squealWave(name) {
    if (!squealWaves[name]) {
      const db = SQUEAL_TONES[name], re = new Float32Array(db.length + 1), im = new Float32Array(db.length + 1);
      db.forEach((d, k) => { im[k + 1] = Math.pow(10, d / 20); });
      squealWaves[name] = ac.createPeriodicWave(re, im);
    }
    return squealWaves[name];
  }
  // A curve through [where 0..1, value] points, straight lines between them
  function shape(points, n = 120) {
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1); let j = 1;
      while (j < points.length - 1 && points[j][0] < k) j++;
      const [k0, v0] = points[j - 1], [k1, v1] = points[j], u = Math.min(1, Math.max(0, (k - k0) / (k1 - k0 || 1)));
      c[i] = v0 + (v1 - v0) * u;
    }
    return c;
  }
  const flipPts = pts => pts.map(([k, v]) => [1 - k, v]).reverse();
  // Noise that wanders at up to cutoff times a second, scaled by gain
  function wander(t, len, cutoff, gain) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; s.loop = true; f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 0.7; g.gain.value = gain;
    s.connect(f); f.connect(g); s.start(t, Math.random()); s.stop(t + len + 0.05);
    return g;
  }
  function squealVoice(t, len, { pitch, amp, table = 'first', scrape = 8, rough = 0.25, grit = 0.02, peak = 0.12 }) {
    const g = ac.createGain(), r = ac.createGain();
    g.gain.value = 0; g.gain.setValueCurveAtTime(shape(amp).map(v => v * peak), t, len);
    r.gain.value = 1 - rough; wander(t, len, 90, rough * 15).connect(r.gain);
    g.connect(r); r.connect(master);
    const o = ac.createOscillator(); o.setPeriodicWave(squealWave(table));
    o.frequency.setValueCurveAtTime(shape(pitch), t, len);
    wander(t, len, 130, scrape * 20).connect(o.frequency);            // the scrape
    o.connect(g); o.start(t); o.stop(t + len + 0.05);
    if (grit) burst(t, len, 'bandpass', 3800, 0.8, grit * 10, g);       // a gritty hiss under it
  }
  // One squeal, len seconds; each one bends the other way, like a gate swung back and forth
  let squealUp = false;
  function squeal(t, len) {
    squealUp = !squealUp;
    const p = [[0, 780], [0.22, 830], [0.38, 822], [0.5, 832], [0.53, 832], [0.56, 865], [0.62, 870], [1, 874]];
    squealVoice(t, len * 0.53, { pitch: (squealUp ? p : flipPts(p)).filter(([k]) => k <= 0.53).map(([k, f]) => [k / 0.53, f]), amp: [[0, 0], [0.1, 0.25], [0.5, 0.6], [0.85, 1], [1, 0.1]] });
    squealVoice(t + len * 0.52, len * 0.48, { pitch: [[0, 860], [0.15, 870], [1, 874]], amp: [[0, 0.1], [0.45, 1], [0.8, 0.8], [0.9, 0.3], [1, 0]], table: 'loud', peak: 0.16, scrape: 3, rough: 0.05, grit: 0.005 });
    const c = len * 0.2, f = 3390;                                     // the high squeak, sounding with the low note
    squealVoice(t + len * 0.1, c, { pitch: [[0, f * 0.97], [0.4, f * 1.01], [1, f]], amp: [[0, 0], [0.15, 1], [0.7, 0.8], [1, 0]], table: 'loud', scrape: 25, peak: 0.07, grit: 0 });
  }
  const SQUEAL_LEN = 1.9;
  function creak() { squeal(now(), SQUEAL_LEN); }                     // riding round on it
  // WHIPPER-SNIPPER!: six quick squeals, each a little longer apart as it slows
  function whirl() {
    let t = now(), gap = 0.32;
    for (let i = 0; i < 6; i++) { squeal(t, Math.min(SQUEAL_LEN, gap * 0.9)); t += gap; gap *= 1.22; }
  }
  // Background events and hiccups, timed from the game loop
  function tick(dt) {
    if (!ac) return;
    const orbit = SLING.t > 0 ? slingProgress() : 0;                  // whipping round the sun: the roar builds all the way round
    burner.out.gain.setTargetAtTime(muted ? 0 : Math.max(blur * 0.32, SLING.t > 0 ? 0.08 + 0.3 * orbit : 0), now(), 0.06);   // roar follows the swoop
    burner.filter.frequency.setTargetAtTime(600 + blur * 900, now(), 0.1);
    const fast = bird.swooping || SLING.out > 0;                       // a swoop, or flung out of the SOLAR-SLINGSHOT!!!!
    if (fast && !wasSwooping && !muted) ignite();
    wasSwooping = fast;
    const flung = SLING.out > 0;                                       // the slingshot's own coarse roar, fading as he slows
    slinger.out.gain.setTargetAtTime(muted ? 0 : flung ? 0.2 + 0.3 * SLING.out / SLING_OUT : SLING.t > 0 ? 0.03 + 0.47 * orbit * orbit : 0, now(), 0.05);
    if (flung && !wasFlung && !muted) { ignite(); tone('sawtooth', 70, 28, now(), 0.6, 0.35); }   // a bigger, rougher whoomp
    wasFlung = flung;
    rain.gain.setTargetAtTime(muted ? 0 : stormDark() * 0.16, now(), 0.3);
    drunkEcho.gain.setTargetAtTime(muted ? 0 : 0.6 * drunkLevel(), now(), 0.2);   // drunk: echoing
    if (muted) return;
    cicadaT -= dt;
    if (cicadaT <= 0) { cicadas(); cicadaT = 9 + Math.random() * 8; }
    didgT -= dt;
    if (didgT <= 0) { didgeridoo(); didgT = 25 + Math.random() * 25; }
    if (bird.drunk > 0) { hicT -= dt; if (hicT <= 0) { hic(); hicT = 1.2 + Math.random() * 1.4; } }
    else hicT = 0.6;
  }

  function toggle() {
    start();
    muted = !muted;
    try { localStorage.setItem('swoopMuted', muted ? '1' : '0'); } catch (e) { /* not remembered */ }
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.8, now(), 0.05);
    updateIcon();
  }
  function updateIcon() {
    const b = document.getElementById('sound');
    b.classList.toggle('off', muted);
    b.title = muted ? 'Sound off (M)' : 'Sound on (M)';
  }
  // The effects only play once sound has started and while it's on
  const effects = { plop, splosh, can, boing, carol, sizzle, scream, laugh, hushLaugh, cheep, fanfare, didgeridoo, bell, oi, thunder, screech, growl, creak, whirl };
  const safe = fn => (...a) => { if (ac && !muted) fn(...a); };
  return { start, toggle, tick, updateIcon, isMuted: () => muted, ...Object.fromEntries(Object.entries(effects).map(([name, fn]) => [name, safe(fn)])) };
})();
