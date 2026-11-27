/* Router, corner chrome and link behavior.
   Like an index of drops, every link opens in its own new tab; progress is shared
   between tabs through localStorage, so nothing is lost when moving between them. */
(function (S) {
  'use strict';
  const main = document.getElementById('main');
  const topbar = document.getElementById('topbar');

  /* ---------- Every link opens a new tab ---------- */
  function newTabs(root) {
    (root.querySelectorAll ? S.$$(root, 'a[href]') : []).forEach((a) => {
      if (a.hasAttribute('data-skip') || a.dataset.nt) return;
      a.dataset.nt = '1';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      if (!/opens in a new tab/.test(a.textContent)) {
        const s = document.createElement('span');
        s.className = 'sr-only';
        s.textContent = ' (opens in a new tab)';
        a.appendChild(s);
      }
    });
  }
  S.newTabs = newTabs;
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches && n.matches('a[href]')) newTabs(n.parentNode || n); else newTabs(n);
  }))).observe(document.body, { childList: true, subtree: true });

  /* ---------- Corner chrome ---------- */
  function renderTopbar(active) {
    topbar.innerHTML = `
      <nav class="corner corner-top" aria-label="Sandbox">
        <ul>
          ${S.CHALLENGES.map((c) => `<li><a href="#/${c.id}" ${active === c.id ? 'aria-current="page"' : ''}><span class="sr-only">${S.esc(c.title)} — </span>${c.id}</a></li>`).join('')}
          <li><a href="#/exchange" ${active === 'exchange' ? 'aria-current="page"' : ''}>Exchange<span aria-hidden="true">↗</span></a></li>
        </ul>
      </nav>
      <a href="#/" class="corner corner-mark" ${active === 'home' ? 'aria-current="page"' : ''}>
        <span class="mark-word">The Sandbox</span><span class="mark-box" aria-hidden="true">SB</span>
      </a>`;
    newTabs(topbar);
  }

  /* ---------- Cursor label, as on a drops index (fine pointers only, decorative) ---------- */
  const tip = document.createElement('span');
  tip.className = 'cursor-tip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    document.addEventListener('pointermove', (e) => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t) { tip.classList.remove('on'); return; }
      tip.textContent = t.dataset.tip;
      tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`;
      tip.classList.add('on');
    });
    document.addEventListener('pointerleave', () => tip.classList.remove('on'));
    window.addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });
  }

  function resolve() {
    const path = location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    if (!path) return { key: 'home', theme: 'home', title: 'The Sandbox · Six Invitations to Investigate' };
    if (S.views[path]) {
      const id = path.slice(0, 2);
      const c = S.byId(id);
      if (path.indexOf('print') !== -1) return { key: path, theme: 'print', active: c ? id : '', title: 'Printable invitations · The Sandbox' };
      if (c) return { key: path, theme: 'c' + id, active: id, title: `${c.id} · ${c.title} · The Sandbox` };
      return { key: path, theme: path, active: path, title: (path === 'exchange' ? 'Discovery Exchange' : 'Facilitator notes') + ' · The Sandbox' };
    }
    return null;
  }

  let first = true;
  let quiet = false;
  function route() {
    const r = resolve();
    document.body.classList.remove('has-player');
    tip.classList.remove('on');
    if (!r) {
      document.body.dataset.theme = 'home';
      renderTopbar('');
      main.innerHTML = `<section class="notfound"><h1 tabindex="-1">That room doesn't exist (yet).</h1><p><a href="#/">Back to the six invitations</a></p></section>`;
    } else {
      document.body.dataset.theme = r.theme;
      renderTopbar(r.active || r.key);
      document.title = r.title;
      try { S.views[r.key](main); }
      catch (e) {
        console.error(e);
        main.innerHTML = `<section class="notfound"><h1 tabindex="-1">Something went wrong opening this invitation.</h1><p>Try reloading the page. If it keeps happening, your saved answers for it may be damaged — you can clear them from the home page.</p><p><a href="#/">Back to the six invitations</a></p></section>`;
      }
    }
    newTabs(main);
    if (!S.storageOK()) S.showStorageWarning();
    if (!first && !quiet) {
      window.scrollTo(0, 0);
      const h = main.querySelector('h1');
      if (h) h.focus({ preventScroll: true });
    }
    first = false;
    quiet = false;
  }

  /* Another tab changed saved answers: refresh this tab's view so it never shows stale state,
     unless the person is typing here right now. */
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.indexOf('sandbox.v1.') !== 0) return;
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if (document.body.classList.contains('has-player')) return;
    const y = window.scrollY;
    quiet = true;
    route();
    window.scrollTo(0, y);
  });

  document.querySelector('[data-skip]').addEventListener('click', (e) => {
    e.preventDefault();
    main.focus();
  });
  window.addEventListener('hashchange', route);
  route();
})(window.Sandbox);
