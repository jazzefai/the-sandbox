/* Table-top kit (facilitator-facing): one fold-in-half tent card per table.
   Each card shows a room's driving question and a QR code that opens that room.
   Print landscape, one card per page, fold along the dashed line. The top half
   prints upside down so the card reads the right way up from both sides. */
(function (S) {
  'use strict';
  const SETTING = {
    home: 'Start here', '01': 'A sealed prediction', '02': 'A gallery wall', '03': 'A case file',
    '04': 'A game show', '05': 'A patent drawing', '06': 'Public notices', exchange: 'A pinboard'
  };

  function cards() {
    return [
      { key: 'home', num: 'SB', big: 'What are you curious about?', title: 'The Sandbox', sub: 'Arcade AI Challenges', hash: '#/' },
      ...S.CHALLENGES.map((c) => ({ key: c.id, num: '#' + c.id, big: c.question, title: c.title, sub: `${c.medium} · ${c.verb}`, hash: '#/' + c.id })),
      { key: 'exchange', num: '///', big: "Don't present a product. Invite someone into a discovery.", title: 'Discovery Exchange', sub: "Optional · whenever you're ready", hash: '#/exchange' }
    ];
  }

  const defaultBase = () => location.origin + location.pathname;
  const validBase = (u) => /^https?:\/\/[^\s/]+(\/[^\s#?]*)?$/i.test(u);
  const isLocal = (u) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(u) || /^file:/i.test(u);
  const withSlash = (u) => (u.endsWith('/') ? u : u + '/');
  const shortUrl = (u) => u.replace(/^https?:\/\//i, '');

  function half(card, url, flipped) {
    return `
      <div class="kit-half${flipped ? ' is-flipped' : ''}" ${flipped ? 'aria-hidden="true"' : ''}>
        <p class="kit-band"><span class="kit-num">${S.esc(card.num)}</span><span class="kit-setting">${S.esc(SETTING[card.key])}</span></p>
        <div class="kit-text">
          <p class="kit-big${card.key === 'exchange' ? ' is-long' : ''}">${S.esc(card.big)}</p>
          <p class="kit-title"><strong>${S.esc(card.title)}</strong> <span>${S.esc(card.sub)}</span></p>
        </div>
        <div class="kit-qr">
          ${S.qrSvg(url, 'QR code that opens ' + card.title)}
          <p class="kit-scan">Scan to open</p>
          <p class="kit-url">${S.esc(shortUrl(url))}</p>
        </div>
      </div>`;
  }

  S.views.kit = function render(root) {
    const store = S.store('kit', { base: '' });
    const base = () => withSlash((store.data.base || '').trim() || defaultBase());

    root.innerHTML = `
      <div class="print-controls kit-controls">
        <p><a href="#/facilitator">Facilitator notes</a></p>
        <h1 tabindex="-1" class="kit-h">Table-top kit</h1>
        <p class="kit-intro">One tent card per table: each room's question and a QR code that opens it. Print landscape, one card per page, then fold along the dashed line so it stands up. The top half prints upside down so the card reads from both sides.</p>
        <div class="field kit-base">
          <label for="kit-base">The codes open this address</label>
          <input id="kit-base" type="url" inputmode="url" autocomplete="off" value="${S.esc(store.data.base)}" placeholder="${S.esc(defaultBase())}" aria-describedby="kit-base-hint kit-base-warn">
          <p class="hint" id="kit-base-hint">Leave it blank to use the address of this page. Change it only if the Sandbox is hosted somewhere else.</p>
          <p class="warn" id="kit-base-warn" aria-live="polite" data-warn></p>
        </div>
        <p><button type="button" class="btn btn-primary" data-print>Print the kit</button></p>
        <p class="hint">Before the day, scan two or three printed codes with a phone to check they open the right room. If your printer skips colors, turn on “Background graphics” in the print dialog.</p>
      </div>
      <div class="kit-sheets" data-sheets></div>`;

    const sheets = S.$(root, '[data-sheets]');
    const warn = S.$(root, '[data-warn]');
    const input = S.$(root, '#kit-base');

    function draw() {
      const typed = (store.data.base || '').trim();
      const ok = !typed || validBase(typed);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      const b = ok ? base() : withSlash(defaultBase());
      warn.textContent = !ok
        ? "That doesn't look like a web address. It should start with https:// — the cards below use this page's address instead."
        : isLocal(b)
          ? `These codes open ${shortUrl(b)}, which only works on this computer. Print from the live site (https://…) or type its address above.`
          : '';
      sheets.innerHTML = cards().map((c) => {
        const url = b + c.hash;
        return `
        <section class="kit-sheet" data-kit="${S.esc(c.key)}" aria-label="${S.esc(c.title)} card">
          ${half(c, url, true)}
          <p class="kit-fold" aria-hidden="true"><span>Fold</span></p>
          ${half(c, url, false)}
        </section>`;
      }).join('');
    }
    input.addEventListener('input', () => { store.data.base = input.value; store.save(); draw(); });
    S.$(root, '[data-print]').addEventListener('click', () => window.print());
    draw();
  };
})(window.Sandbox);
