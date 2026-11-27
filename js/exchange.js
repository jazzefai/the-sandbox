/* Discovery Exchange — optional. Prepare an invitation into your discovery, then show it
   in person: full screen, with a QR code when there's something to open. Nothing is sent
   anywhere; it stays in this browser. */
(function (S) {
  'use strict';
  const KINDS = ['An experiment', 'A surprising observation', 'An original invention', "A question I'm still investigating", 'A playable prototype', 'A visual creation', 'A reimagined system'];
  const shortLink = (l) => l.replace(/^https?:\/\//, '').replace(/\/$/, '');
  function qrFor(link) {
    try { return `<div class="ex-qr">${S.qrSvg(link, 'QR code that opens ' + link)}</div>`; }
    catch (e) { return '<p class="warn">This link is too long for a QR code — people can follow the link instead.</p>'; }
  }

  S.views.exchange = function render(root) {
    const store = S.store('exchange', { kind: null, from: '', title: '', show: '', invite: '', link: '' });
    const st = store.data;
    const save = () => store.save();
    const linkOK = () => !st.link.trim() || /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(st.link.trim());
    const link = () => (st.link.trim() && linkOK() ? st.link.trim() : '');
    const hasContent = () => !!(st.title.trim() || st.show.trim() || st.invite.trim() || link());

    root.innerHTML = `
      <article class="exchange" aria-labelledby="ex-h">
        <header class="ch-head">
          <p class="ch-meta"><span class="ch-num">↔</span><span class="ch-medium">Optional · whenever you're ready</span></p>
          <h1 id="ex-h" tabindex="-1"><span class="ch-title">Discovery Exchange</span>
          <span class="ch-question">Don't present a product. Invite someone into a discovery.</span></h1>
        </header>
        <ol class="ex-steps" aria-label="How sharing works">
          <li><span class="ex-step-n" aria-hidden="true">01</span><span><strong>Prepare it here.</strong> A title, a question for the people you show, and a link if you made something they can open. It stays on this device.</span></li>
          <li><span class="ex-step-n" aria-hidden="true">02</span><span><strong>Show it full screen.</strong> Your title, your question, and a QR code big enough to scan from across a table.</span></li>
          <li><span class="ex-step-n" aria-hidden="true">03</span><span><strong>Find two people.</strong> Let them try it before you explain anything. Then swap.</span></li>
        </ol>
        <div class="ch-body exchange-grid">
          <form class="ex-form notebook" novalidate data-form>
            ${S.radiosTpl('kind', 'What are you bringing?', KINDS, st.kind, { cls: 'inline-choices wrap' })}
            <div class="field">
              <label for="ex-from">Where it came from <span class="tag">optional</span></label>
              <select id="ex-from">
                <option value="">—</option>
                ${S.CHALLENGES.map((c) => `<option ${st.from === c.id + ' · ' + c.title ? 'selected' : ''}>${c.id} · ${S.esc(c.title)}</option>`).join('')}
                <option ${st.from === 'Somewhere else entirely' ? 'selected' : ''}>Somewhere else entirely</option>
              </select>
            </div>
            <div class="field"><label for="ex-title">Call it something</label><input id="ex-title" type="text" maxlength="120" value="${S.esc(st.title)}" autocomplete="off"></div>
            <div class="field"><label for="ex-invite">What would you like someone else to try, guess, or tell you?</label><textarea id="ex-invite" rows="3" maxlength="1000">${S.esc(st.invite)}</textarea></div>
            <div class="field"><label for="ex-show">What did you find, make, or notice? <span class="tag">optional</span></label><textarea id="ex-show" rows="4" maxlength="2000" aria-describedby="ex-show-hint">${S.esc(st.show)}</textarea><p class="hint" id="ex-show-hint">A note for yourself. It's not on the full-screen view, so people can try it before you explain.</p></div>
            <div class="field">
              <label for="ex-link">A link others can open <span class="tag">optional</span></label>
              <input id="ex-link" type="url" inputmode="url" maxlength="500" placeholder="https://…" value="${S.esc(st.link)}" aria-describedby="ex-link-hint ex-link-err">
              <p class="hint" id="ex-link-hint">Your Lovable experiment, your Canva image — anything people can open on their phones. You'll get a QR code. In Lovable, publish or share the project first; in Canva, use Share and set it so anyone with the link can view. Scan your own code to check it works on a phone.</p>
              <p class="warn" id="ex-link-err" aria-live="polite" data-linkerr></p>
            </div>
            <p class="hint">Nothing to link? That's fine — an invention, a rule you rewrote, a question you're still chasing are all worth showing.</p>
          </form>
          <div class="ex-preview">
            <p class="hint">Preview</p>
            <div class="ex-card" data-card aria-live="polite"></div>
            <p class="ex-actions">
              <button type="button" class="btn btn-primary" data-show aria-describedby="ex-show-msg">Show full screen</button>
            </p>
            <p class="prompt-hint" id="ex-show-msg" data-showmsg></p>
            <p><button type="button" class="btn btn-quiet" data-printcard>Print it</button>
               <button type="button" class="btn btn-quiet" data-clear>Start over</button></p>
          </div>
        </div>
      </article>`;

    const $ = (sel) => S.$(root, sel);
    const card = $('[data-card]');
    function linkBlock(big) {
      return `
        <div class="ex-linkblock ${big ? 'is-big' : ''}">
          ${qrFor(link())}
          <div>
            <p class="ex-scan">Scan to open on your phone, or follow the link:</p>
            <p class="ex-link"><a href="${S.esc(link())}">${S.esc(shortLink(link()))}</a></p>
          </div>
        </div>`;
    }
    function update() {
      $('[data-linkerr]').textContent = linkOK() ? '' : 'That doesn\'t look like a web link. It should start with https:// — or leave it blank.';
      $('#ex-link').setAttribute('aria-invalid', linkOK() ? 'false' : 'true');
      card.innerHTML = hasContent() ? `
        ${st.kind !== null ? `<p class="ex-kind">${S.esc(KINDS[st.kind])}</p>` : ''}
        <p class="ex-title">${S.esc(st.title.trim() || 'Untitled discovery')}</p>
        ${st.from ? `<p class="ex-from">from ${S.esc(st.from)}</p>` : ''}
        ${st.invite.trim() ? `<p class="ex-invite">${S.esc(st.invite.trim())}</p>` : ''}
        ${link() ? linkBlock() : ''}
        ${st.show.trim() ? `<p class="ex-body ex-note"><span class="ex-scan">Your note</span><br>${S.esc(st.show.trim())}</p>` : ''}` :
        '<p class="ex-empty">Start anywhere on the left. Every field is optional.</p>';
      const ready = hasContent() && linkOK();
      $('[data-show]').setAttribute('aria-disabled', ready ? 'false' : 'true');
      $('[data-showmsg]').textContent = !hasContent() ? 'Write something first.' : !linkOK() ? 'Fix the link (it should start with https://) or clear it.' : '';
    }

    function showFull() {
      const ov = document.createElement('div');
      ov.className = 'ex-full';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-modal', 'true');
      ov.setAttribute('aria-label', 'Your invitation, full screen');
      ov.innerHTML = `
        <div class="ex-full-inner">
          ${st.kind !== null ? `<p class="ex-kind">${S.esc(KINDS[st.kind])}</p>` : ''}
          <p class="ex-full-title">${S.esc(st.title.trim() || 'Untitled discovery')}</p>
          ${st.invite.trim() ? `<p class="ex-invite">${S.esc(st.invite.trim())}</p>` : ''}
          ${link() ? linkBlock(true) : ''}
          <p><button type="button" class="btn" data-close>Close <span class="hint">(Esc)</span></button></p>
        </div>`;
      const prev = document.activeElement;
      const key = (e) => {
        if (e.key === 'Escape') { close(); return; }
        if (e.key !== 'Tab') return;
        const f = S.$$(ov, 'a[href], button');
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      };
      function close() { ov.remove(); document.removeEventListener('keydown', key); document.body.classList.remove('has-player'); if (prev) prev.focus(); }
      document.body.appendChild(ov);
      document.body.classList.add('has-player');
      document.addEventListener('keydown', key);
      S.$(ov, '[data-close]').addEventListener('click', close);
      S.$(ov, '[data-close]').focus();
    }

    $('[data-show]').addEventListener('click', () => {
      if ($('[data-show]').getAttribute('aria-disabled') === 'true') { S.announce($('[data-showmsg]').textContent); return; }
      showFull();
    });
    $('[data-form]').addEventListener('submit', (e) => e.preventDefault());
    S.$$(root, 'input[name="kind"]').forEach((r) => r.addEventListener('change', () => { st.kind = Number(r.value); save(); update(); }));
    $('#ex-from').addEventListener('change', (e) => { st.from = e.target.value; save(); update(); });
    [['#ex-title', 'title'], ['#ex-show', 'show'], ['#ex-invite', 'invite'], ['#ex-link', 'link']].forEach(([sel, k]) =>
      $(sel).addEventListener('input', (e) => { st[k] = e.target.value; save(); update(); }));
    $('[data-printcard]').addEventListener('click', () => {
      document.body.classList.add('print-card');
      window.print();
      setTimeout(() => document.body.classList.remove('print-card'), 500);
    });
    S.bindClear(root, store, () => render(root));
    update();
  };
})(window.Sandbox);
