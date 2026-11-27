/* Pencil sounds for the notebook moments.
   Circling an answer makes a short pencil scratch; ticking a box makes two quick strokes.
   The sound is generated in the browser (filtered noise), so there are no audio files.
   A "Pencil sound" switch above the first notebook sheet on each page turns it on or off,
   and each person's choice is remembered in this browser. */
(function (S) {
  'use strict';
  const KEY = 'sandbox.v1.pencilSound';
  const isOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } };
  let ctx = null;
  let noise = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* One pencil stroke: grainy noise through a band-pass filter, with a wobbling level
     so it sounds like graphite dragging over paper fibres. */
  function stroke(t, dur, freq, vol) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass'; band.Q.value = 0.9;
    band.frequency.setValueAtTime(freq, t);
    band.frequency.linearRampToValueAtTime(freq * 1.25, t + dur * 0.5);
    band.frequency.linearRampToValueAtTime(freq * 0.9, t + dur);
    const high = ctx.createBiquadFilter();
    high.type = 'highpass'; high.frequency.value = 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    const steps = Math.max(4, Math.round(dur / 0.03));
    for (let i = 1; i < steps; i++) gain.gain.linearRampToValueAtTime(vol * (0.5 + Math.random() * 0.5), t + (dur * i) / steps);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(band).connect(high).connect(gain).connect(ctx.destination);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  S.pencil = {
    circle() {
      if (!isOn() || !audio()) return;
      stroke(ctx.currentTime + 0.01, 0.36, 3200, 0.09);
    },
    tick() {
      if (!isOn() || !audio()) return;
      const t = ctx.currentTime + 0.01;
      stroke(t, 0.07, 3800, 0.08);
      stroke(t + 0.1, 0.13, 3400, 0.09);
    }
  };

  /* Any answer chosen on a notebook page — by click, tap or keyboard. */
  document.addEventListener('change', (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.checked || !input.closest('.notebook')) return;
    if (input.type === 'radio') S.pencil.circle();
    else if (input.type === 'checkbox') S.pencil.tick();
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
      if (isOn()) S.pencil.circle();
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
