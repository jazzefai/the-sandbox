/* 05 · The Impossible Object and 06 · Who Made the Rules?
   Human imagination. No technology required to play: each has a printable version. */
(function (S) {
  'use strict';

  const OBJECT = {
    id: '05',
    movements: [
      { n: '01', title: 'The invitation', html: () => `
        <p>Tomorrow morning, a mysterious shop opens in your neighborhood.</p>
        <p>It sells ordinary objects with extraordinary abilities.</p>
        <div class="vitrines">
          <figure class="vitrine">${S.art.key()}<figcaption><strong>The Second Chance Key</strong><span>Opens any door you once decided not to walk through.</span></figcaption></figure>
          <figure class="vitrine">${S.art.bottle()}<figcaption><strong>The Memory Bottle</strong><span>Captures the feeling of a moment so you can experience it again.</span></figcaption></figure>
          <figure class="vitrine">${S.art.telephone()}<figcaption><strong>The Unspoken Telephone</strong><span>Lets you hear what someone wanted to say but never did.</span></figcaption></figure>
        </div>
        <p>The shopkeeper has reserved an empty shelf for you.</p>
        <p class="pull">You can put anything on it, provided it doesn't already exist.</p>
        <div class="empty-shelf" aria-hidden="true"><span></span></div>` },
      { n: '02', title: 'The invention', html: () => `
        <p>Look at an ordinary object around you.</p>
        <p>Give it an impossible ability that would make you genuinely want to own it.</p>
        <p>Imagine holding it, using it, and experiencing what it makes possible.</p>
        <p class="pull">Give it a name when you're ready.</p>` },
      { n: '03', title: 'The plot twist', html: () => `
        <p>Your invention has sold a million units.</p>
        <p>But people are using it for something you never intended.</p>
        <p class="pull">What are they doing with it?</p>
        <p>You now have the opportunity to reinvent your invention—or embrace what it has unexpectedly become.</p>` }
    ],
    showTell: '<strong>Your show-and-tell:</strong> Introduce your object as though it actually exists.'
  };

  const RULES = {
    id: '06',
    movements: [
      { n: '01', title: 'The invitation', html: () => `
        <p>Imagine visiting a world almost identical to ours, with a few peculiar differences.</p>
        <div class="decrees">
          <figure class="decree">${S.art.classroom()}<figcaption>In this world, children interview adults before deciding whether to accept them as teachers.</figcaption></figure>
          <figure class="decree">${S.art.restaurant()}<figcaption>Restaurants have menus of conversations instead of meals.</figcaption></figure>
          <figure class="decree">${S.art.birthday()}<figcaption>On your birthday, you give presents to the people who helped you become who you are.</figcaption></figure>
        </div>
        <p>None of these arrangements violates the laws of physics.</p>
        <p class="pull">We simply organized our world differently.</p>` },
      { n: '02', title: 'The rebellion', html: () => `
        <p>You've been granted temporary authority over one aspect of human life.</p>
        <p>It could be something as small as an elevator ride or as consequential as an entire education system.</p>
        <p class="pull">Choose one familiar rule and suspend it.</p>
        <p>Spend a little time imagining how people would live without it.</p>` },
      { n: '03', title: 'The plot twist', html: () => `
        <p>Someone approaches you and says:</p>
        <blockquote class="pull"><p><em>“I actually needed that rule.”</em></p></blockquote>
        <p>Imagine who that person might be and why the rule mattered to them.</p>
        <p>You still have the authority to redesign the experience.</p>
        <p class="pull">What rule, if any, would you establish now?</p>` }
    ],
    showTell: "<strong>Your show-and-tell:</strong> Describe the world you've redesigned and the rule you've decided is worth having."
  };

  function imaginationView(def) {
    return function render(root) {
      const store = S.store('c' + def.id, { step: 1 });
      const st = store.data;
      const body = `
        <aside class="screen-free" aria-label="Screen-free option">
          <p><strong>No technology required.</strong> Read the invitation, then put your device away. Prefer paper?
          <a href="#/${def.id}/print">Open the printable version</a>.</p>
        </aside>
        ${def.movements.map((m, i) => `
          ${i > 0 ? S.nextTpl(i + 1, `Turn to ${m.n} · ${m.title}`) : ''}
          ${S.stepTpl(i + 1, m.title, m.html(), { label: m.n, cls: 'movement' })}`).join('')}
        <p class="show-tell" data-showtell>${def.showTell}</p>`;
      root.innerHTML = S.shellTpl(def.id, body);
      const save = () => store.save();
      const updateSteps = S.bindSteps(root, st, save);
      const showTell = S.$(root, '[data-showtell]');
      const sync = () => { showTell.hidden = st.step < def.movements.length; };
      S.$$(root, '[data-next]').forEach((b) => b.addEventListener('click', sync));
      S.bindClear(root, store, () => render(root));
      updateSteps(); sync();
    };
  }

  function printSection(def) {
    const c = S.byId(def.id);
    return `
      <article class="print-sheet" aria-labelledby="ps-${def.id}">
        <p class="ps-meta">The Sandbox · ${c.id} · ${S.esc(c.medium)} · ${S.esc(c.verb)}</p>
        <h2 id="ps-${def.id}" class="ps-title">${S.esc(c.title)}</h2>
        <p class="ps-tagline">${S.esc(c.tagline)}</p>
        <p class="ps-question">${S.esc(c.question)}</p>
        ${def.movements.map((m) => `
          <section class="ps-movement">
            <h3><span>${m.n}</span> · ${m.title}</h3>
            ${m.html()}
          </section>`).join('')}
        <p class="show-tell">${def.showTell}</p>
        <p class="ps-foot">No technology required. Read the invitation, then put your device away.</p>
      </article>`;
  }

  function printView(defs) {
    return function (root) {
      root.innerHTML = `
        <div class="print-controls">
          <p><a href="#/${defs.length === 1 ? defs[0].id : ''}">${defs.length === 1 ? S.esc(defs[0].id + ' · ' + S.byId(defs[0].id).title) : 'The six challenges'}</a></p>
          <p><button type="button" class="btn btn-primary" data-print>Print this</button></p>
          <p class="hint">Prints in black and white. Each challenge starts on a new page.</p>
        </div>
        <h1 class="sr-only" tabindex="-1">Printable challenges</h1>
        ${defs.map(printSection).join('')}`;
      S.$(root, '[data-print]').addEventListener('click', () => window.print());
    };
  }

  S.views['05'] = imaginationView(OBJECT);
  S.views['06'] = imaginationView(RULES);
  S.views['05/print'] = printView([OBJECT]);
  S.views['06/print'] = printView([RULES]);
  S.views['print'] = printView([OBJECT, RULES]);
})(window.Sandbox);
