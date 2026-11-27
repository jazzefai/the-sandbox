/* The Sandbox — core utilities, storage, clipboard and shared components.
   Plain scripts (no modules) so the site also opens from a local file. */
(function () {
  'use strict';
  const S = (window.Sandbox = { views: {} });

  /* ---------- Challenge index (participant-facing labels from the spec) ---------- */
  S.CHALLENGES = [
    { id: '01', title: 'Can I Be Predicted?', medium: 'Claude', verb: 'Investigate intelligence',
      question: 'How predictable am I?', tech: true },
    { id: '02', title: 'Lost in Translation', medium: 'Canva AI', verb: 'Investigate perception',
      question: 'Do others see what I see?', tech: true },
    { id: '03', title: 'The Evidence Is Lying', medium: 'Microsoft Copilot', verb: 'Investigate persuasion',
      question: 'How easily can I be persuaded?', tech: true },
    { id: '04', title: 'Rig the Game', medium: 'Lovable', verb: 'Investigate human behavior',
      question: 'What makes people behave the way they do?', tech: true },
    { id: '05', title: 'The Impossible Object', medium: 'Human imagination', verb: 'Investigate possibility',
      question: "What could exist that doesn't?", tagline: 'An invitation to invent.', tech: false },
    { id: '06', title: 'Who Made the Rules?', medium: 'Human imagination', verb: 'Investigate necessity',
      question: "What exists that doesn't have to?", tagline: 'An invitation to reinvent.', tech: false }
  ];
  S.byId = (id) => S.CHALLENGES.find((c) => c.id === id);

  /* ---------- Small helpers ---------- */
  S.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.$ = (root, sel) => root.querySelector(sel);
  S.$$ = (root, sel) => Array.from(root.querySelectorAll(sel));
  S.announce = (msg) => {
    const a = document.getElementById('announcer');
    if (!a) return;
    a.textContent = '';
    setTimeout(() => { a.textContent = msg; }, 30);
  };
  S.reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Local storage (no personal data leaves the browser) ---------- */
  const PREFIX = 'sandbox.v1.';
  let storageOK = true;
  try { localStorage.setItem(PREFIX + '_t', '1'); localStorage.removeItem(PREFIX + '_t'); }
  catch (e) { storageOK = false; }
  S.storageOK = () => storageOK;

  S.store = function (id, defaults) {
    const key = PREFIX + id;
    const clone = (o) => JSON.parse(JSON.stringify(o));
    let data = clone(defaults);
    if (storageOK) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && typeof saved === 'object') data = Object.assign(data, saved);
      } catch (e) { /* corrupt entry: start fresh */ }
    }
    return {
      data,
      save() {
        if (!storageOK) return;
        try { localStorage.setItem(key, JSON.stringify(data)); }
        catch (e) { storageOK = false; S.showStorageWarning(); }
      },
      clear() {
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
      }
    };
  };
  S.hasSaved = (id) => { try { return !!localStorage.getItem(PREFIX + id); } catch (e) { return false; } };
  S.clearAll = () => {
    try {
      Object.keys(localStorage).filter((k) => k.indexOf(PREFIX) === 0).forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  };
  S.showStorageWarning = () => {
    const main = document.getElementById('main');
    if (!main || S.$(main, '.storage-warning')) return;
    const p = document.createElement('p');
    p.className = 'storage-warning';
    p.setAttribute('role', 'note');
    p.textContent = 'This browser is not letting the Sandbox save your answers (private browsing or storage is turned off). Everything still works, but your answers will disappear if you leave or reload this page.';
    main.prepend(p);
  };

  /* ---------- Clipboard ---------- */
  S.forceCopyFail = /[?&]copyfail\b/.test(location.search); // testing aid
  S.copyText = async function (text) {
    if (S.forceCopyFail) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through to legacy path */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return !!ok;
    } catch (e) { return false; }
  };

  /* Prompt block: shows the exact text that will be copied, plus a copy button.
     opts: { for: 'Claude', label: 'Copy my experiment prompt', note } */
  S.promptTpl = function (id, opts) {
    return `
    <div class="prompt" data-copy="${id}">
      <div class="prompt-head">
        <span class="prompt-for">${opts.for ? 'Prompt · for ' + S.esc(opts.for) : 'Text to copy'}</span>
        <button type="button" class="btn btn-copy" data-copy-btn aria-describedby="${id}-hint ${id}-status">
          <span aria-hidden="true" class="copy-glyph">⧉</span> ${S.esc(opts.label)}
        </button>
      </div>
      ${opts.note ? `<p class="prompt-note">${opts.note}</p>` : ''}
      <pre class="prompt-text" data-copy-preview tabindex="0" aria-label="Prompt text"></pre>
      <p class="prompt-hint" id="${id}-hint" data-copy-hint></p>
      <p class="prompt-status" id="${id}-status" role="status" aria-live="polite" data-copy-status></p>
      <div class="copy-fallback" hidden>
        <label>Your browser blocked automatic copying. The text below is selected — press <kbd>Ctrl</kbd>+<kbd>C</kbd> (or <kbd>⌘</kbd>+<kbd>C</kbd> on a Mac) to copy it.
          <textarea readonly rows="6"></textarea>
        </label>
      </div>
    </div>`;
  };

  /* Wire a prompt block. Returns refresh() to call whenever inputs change. */
  S.bindPrompt = function (root, id, cfg) {
    const el = S.$(root, `[data-copy="${id}"]`);
    if (!el) return () => {};
    const btn = S.$(el, '[data-copy-btn]');
    const pre = S.$(el, '[data-copy-preview]');
    const hint = S.$(el, '[data-copy-hint]');
    const status = S.$(el, '[data-copy-status]');
    const fb = S.$(el, '.copy-fallback');
    const ta = S.$(el, '.copy-fallback textarea');
    const enabled = cfg.enabled || (() => true);
    const preview = cfg.preview || cfg.getText;
    let timer;
    function refresh() {
      const ok = enabled();
      btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
      el.classList.toggle('is-locked', !ok);
      hint.textContent = ok ? '' : (typeof cfg.disabledHint === 'function' ? cfg.disabledHint() : (cfg.disabledHint || ''));
      pre.textContent = preview();
      if (!fb.hidden) ta.value = cfg.getText();
    }
    btn.addEventListener('click', async () => {
      if (!enabled()) {
        status.textContent = hint.textContent || 'Not ready to copy yet.';
        return;
      }
      const text = cfg.getText();
      const ok = await S.copyText(text);
      clearTimeout(timer);
      if (ok) {
        fb.hidden = true;
        el.classList.add('is-copied');
        status.textContent = cfg.copiedMsg || 'Copied. Paste it where the instructions say.';
        timer = setTimeout(() => { el.classList.remove('is-copied'); status.textContent = ''; }, 4000);
        if (cfg.onCopy) cfg.onCopy();
      } else {
        fb.hidden = false;
        ta.value = text;
        ta.focus();
        ta.select();
        status.textContent = 'Automatic copying was blocked. The text is selected in the box below so you can copy it yourself.';
      }
    });
    refresh();
    return refresh;
  };

  /* External platform callout: always clearly marked as leaving the Sandbox. */
  S.externalTpl = function (o) {
    return `
    <aside class="external" aria-label="Leaves the Sandbox: ${S.esc(o.platform)}">
      <p class="external-tag"><span aria-hidden="true">↗</span> Leaves the Sandbox · happens in ${S.esc(o.platform)}</p>
      ${o.lead ? `<p class="external-lead">${o.lead}</p>` : ''}
      <p><a class="btn btn-external" href="${S.esc(o.url)}" target="_blank" rel="noopener noreferrer">Open ${S.esc(o.platform)}<span class="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a>
      <span class="external-url">${S.esc(o.url)}</span></p>
      <p class="external-access"><strong>Access:</strong> ${o.access}</p>
    </aside>`;
  };

  /* Radio group (values are option indexes). */
  S.radiosTpl = function (name, legend, options, selected, o) {
    o = o || {};
    return `
    <fieldset class="choices ${o.cls || ''}" ${o.attrs || ''}>
      <legend>${legend}</legend>
      ${o.hint ? `<p class="hint">${o.hint}</p>` : ''}
      <div class="choices-list">
      ${options.map((opt, i) => `
        <label class="choice">
          <input type="radio" name="${name}" value="${i}" ${selected === i ? 'checked' : ''}>
          <span class="choice-mark" aria-hidden="true"></span>
          <span class="choice-text">${S.esc(opt)}</span>
        </label>`).join('')}
      </div>
    </fieldset>`;
  };

  S.checksTpl = function (name, legend, items, checked, o) {
    o = o || {};
    return `
    <fieldset class="checks ${o.cls || ''}">
      <legend>${legend}</legend>
      ${o.hint ? `<p class="hint">${o.hint}</p>` : ''}
      <div class="checks-list">
      ${items.map((it, i) => {
        const label = typeof it === 'string' ? it : it.label;
        const desc = typeof it === 'string' ? '' : it.desc;
        return `
        <label class="check">
          <input type="checkbox" name="${name}" value="${i}" ${checked && checked[i] ? 'checked' : ''}>
          <span class="check-mark" aria-hidden="true"></span>
          <span class="check-text"><span class="check-label">${S.esc(label)}</span>${desc ? `<span class="check-desc"> — ${S.esc(desc)}</span>` : ''}</span>
        </label>`;
      }).join('')}
      </div>
    </fieldset>`;
  };

  /* Progressive disclosure: sections with data-step="n" are revealed as the
     participant chooses to continue. Nothing is ever marked incomplete. */
  S.stepTpl = function (n, title, body, o) {
    o = o || {};
    return `
    <section class="step ${o.cls || ''}" data-step="${n}" aria-labelledby="step-${n}-h">
      <p class="step-num">${o.label || 'Step ' + n}${o.optional ? ' <span class="tag">optional</span>' : ''}</p>
      <h2 id="step-${n}-h" tabindex="-1">${title}</h2>
      ${body}
    </section>`;
  };
  S.nextTpl = function (n, label) {
    return `<p class="next-wrap" data-next-wrap="${n}"><button type="button" class="btn btn-next" data-next="${n}">${label} <span aria-hidden="true">→</span></button></p>`;
  };
  /* Bind data-next buttons. visible(n) lets a challenge gate a continue button. */
  S.bindSteps = function (root, st, save, visible) {
    function update() {
      S.$$(root, '[data-step]').forEach((sec) => { sec.hidden = Number(sec.dataset.step) > st.step; });
      S.$$(root, '[data-next-wrap]').forEach((w) => {
        const n = Number(w.dataset.nextWrap);
        w.hidden = n <= st.step || n > st.step + 1 || (visible ? !visible(n) : false);
      });
    }
    S.$$(root, '[data-next]').forEach((b) => b.addEventListener('click', () => {
      const n = Number(b.dataset.next);
      st.step = Math.max(st.step, n);
      save();
      update();
      const h = S.$(root, `#step-${n}-h`);
      if (h) { h.focus({ preventScroll: true }); h.scrollIntoView({ behavior: S.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
    }));
    update();
    return update;
  };

  /* Challenge page frame */
  S.shellTpl = function (id, body) {
    const c = S.byId(id);
    const idx = S.CHALLENGES.indexOf(c);
    const others = S.CHALLENGES.filter((x) => x.id !== id);
    return `
    <article class="challenge" aria-labelledby="ch-title">
      <header class="ch-head">
        <p class="ch-meta"><span class="ch-num">${c.id}</span><span class="ch-medium">${S.esc(c.medium)} · ${S.esc(c.verb)}</span></p>
        <h1 id="ch-title" tabindex="-1"><span class="ch-title">${S.esc(c.title)}</span>
          <span class="ch-question">${S.esc(c.question)}</span></h1>
        ${c.tagline ? `<p class="ch-tagline">${S.esc(c.tagline)}</p>` : ''}
      </header>
      <div class="ch-body">${body}</div>
      <footer class="ch-foot">
        <div class="ch-leave">
          <p>Leave whenever you like — nothing here is ever marked finished or unfinished. Your answers stay in this browser only.</p>
          <p><button type="button" class="btn btn-quiet" data-clear>Clear my answers for this invitation</button></p>
        </div>
        <nav class="ch-others" aria-label="Other invitations">
          <p class="ch-others-h">Wander elsewhere</p>
          <ul>
            ${others.map((o) => `<li><a href="#/${o.id}"><span class="o-num" aria-hidden="true"><span>#</span><span>${o.id}</span></span><span class="o-title">${S.esc(o.title)}<span class="index-arrow" aria-hidden="true">↗</span></span></a></li>`).join('')}
            <li><a href="#/exchange"><span class="o-num" aria-hidden="true"><span>///</span></span><span class="o-title">Discovery Exchange<span class="index-arrow" aria-hidden="true">↗</span></span></a></li>
          </ul>
        </nav>
      </footer>
    </article>`;
  };
  S.bindClear = function (root, store, rerender) {
    const b = S.$(root, '[data-clear]');
    if (!b) return;
    b.addEventListener('click', () => {
      if (!window.confirm('Clear your answers for this invitation on this device? This cannot be undone.')) return;
      store.clear();
      rerender();
      S.announce('Your answers for this invitation were cleared.');
    });
  };

  S.listTpl = (items, cls) => `<ul class="${cls || 'plain-list'}">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  S.questionsTpl = (items) => `
    <aside class="questions" aria-label="Questions worth chasing">
      <p class="questions-h">Questions worth chasing <span class="tag">if you like</span></p>
      ${S.listTpl(items.map(S.esc))}
    </aside>`;
})();
