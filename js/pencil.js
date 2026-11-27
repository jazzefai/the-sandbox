/* Pencil sounds for the notebook moments.
   Filling in a bubble makes soft pencil shading followed by a warm wooden note;
   checking a box makes two soft strokes and a slightly brighter note. Calm, low and brief.
   The sound is generated in the browser, so there are no audio files.
   A "Pencil sound" switch above the first notebook sheet on each page turns it on or off,
   and each person's choice is remembered in this browser. */
(function (S) {
  'use strict';
  const KEY = 'sandbox.v1.pencilSound';
  const isOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } };
  let ctx = null;
  let paper = null;   // soft "brown" noise: warmer and gentler than white noise
  let out = null;     // master level, kept low and smoothed by a compressor
  const NOTES = [392.0, 440.0, 523.25, 587.33, 659.25]; // G A C D E: a calm pentatonic scale
  let lastNote = -1;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      paper = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = paper.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = last * 3.5;
      }
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -24; comp.ratio.value = 3;
      out = ctx.createGain();
      out.gain.value = 0.9;
      out.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Pencil shading: gentle strokes of soft noise with the harsh top end removed. */
  function shading(t, dur, strokes, vol) {
    const src = ctx.createBufferSource();
    src.buffer = paper;
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass'; low.frequency.value = 1500; low.Q.value = 0.4;
    const high = ctx.createBiquadFilter();
    high.type = 'highpass'; high.frequency.value = 220;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    const seg = dur / strokes;
    for (let i = 0; i < strokes; i++) {
      const s0 = t + i * seg;
      const peak = vol * (0.75 + Math.random() * 0.25);
      gain.gain.linearRampToValueAtTime(peak, s0 + seg * 0.45);
      gain.gain.linearRampToValueAtTime(vol * 0.18, s0 + seg);
    }
    gain.gain.linearRampToValueAtTime(0.0001, t + dur + 0.06);
    src.connect(low).connect(high).connect(gain).connect(out);
    src.start(t, Math.random());
    src.stop(t + dur + 0.1);
  }

  /* A soft wooden chime: a warm fundamental with a faint, quickly fading overtone. */
  function chime(t, freq, vol) {
    const tone = ctx.createOscillator();
    tone.type = 'sine'; tone.frequency.value = freq;
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine'; shimmer.frequency.value = freq * 3.98;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * 0.18, t + 0.006);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    const soften = ctx.createBiquadFilter();
    soften.type = 'lowpass'; soften.frequency.value = 2400;
    tone.connect(g1).connect(soften);
    shimmer.connect(g2).connect(soften);
    soften.connect(out);
    tone.start(t); shimmer.start(t);
    tone.stop(t + 1.2); shimmer.stop(t + 0.3);
  }
  function nextNote(offset) {
    let i;
    do { i = Math.floor(Math.random() * NOTES.length); } while (i === lastNote && NOTES.length > 1);
    lastNote = i;
    return NOTES[Math.min(NOTES.length - 1, i + (offset || 0))];
  }

  S.pencil = {
    /* Filling in a bubble: six soft strokes, then a warm note as it completes. */
    fill() {
      if (!isOn() || !audio()) return;
      const t = ctx.currentTime + 0.01;
      shading(t, 0.34, 6, 0.05);
      chime(t + 0.3, nextNote(), 0.06);
    },
    /* A check mark: two quick strokes and a slightly brighter note. */
    check() {
      if (!isOn() || !audio()) return;
      const t = ctx.currentTime + 0.01;
      shading(t, 0.12, 1, 0.045);
      shading(t + 0.13, 0.16, 1, 0.05);
      chime(t + 0.28, nextNote(1), 0.055);
    }
  };

  /* Any answer chosen on a notebook page — by click, tap or keyboard. */
  document.addEventListener('change', (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.checked || !input.closest('.notebook')) return;
    if (input.type === 'radio') S.pencil.fill();
    else if (input.type === 'checkbox') S.pencil.check();
  });

  /* The on/off switch, placed above the first notebook sheet on the page. */
  function syncToggles() {
    S.$$(document, '.pencil-toggle').forEach((b) => {
      b.setAttribute('aria-pressed', String(isOn()));
      b.textContent = isOn() ? '✎ Pencil sound on' : '✎ Pencil sound off';
    });
  }
  function addToggle(root) {
    if (!root || S.$(root, '.pencil-toggle')) return;
    const first = S.$$(root, '.notebook').find((n) => !n.parentElement.closest('.notebook'));
    if (!first) return;
    const row = document.createElement('p');
    row.className = 'pencil-toggle-row';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pencil-toggle';
    b.addEventListener('click', () => {
      try { localStorage.setItem(KEY, isOn() ? 'off' : 'on'); } catch (e) { /* ignore */ }
      syncToggles();
      if (isOn()) S.pencil.fill();
      S.announce(isOn() ? 'Pencil sound on.' : 'Pencil sound off.');
    });
    row.appendChild(b);
    first.before(row);
    syncToggles();
  }
  const main = document.getElementById('main');
  if (main) {
    new MutationObserver(() => addToggle(main)).observe(main, { childList: true });
    addToggle(main);
  }
})(window.Sandbox);
