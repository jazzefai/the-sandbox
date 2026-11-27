/* Home: an index of six invitations. Each entry opens in its own new tab. */
(function (S) {
  'use strict';
  const TIP = { '01': 'Claude↗', '02': 'Canva AI↗', '03': 'Copilot↗', '04': 'Lovable↗', '05': 'No screen needed', '06': 'No screen needed' };

  S.views.home = function (root) {
    root.innerHTML = `
      <section class="home">
        <header class="masthead">
          <h1 tabindex="-1">The Sandbox</h1>
          <p class="mast-sub">Arcade AI Challenges</p>
        </header>
        <div class="home-intro">
          <p>What is. What could be. What should be. What doesn't exist yet.</p>
          <p>Some challenges use an AI tool. Others use nothing but your imagination. Enter any of them, in any order, alone or with someone. Leave whenever you like.</p>
        </div>
        <ol class="index" aria-label="The six invitations">
          ${S.CHALLENGES.map((c) => `
            <li class="index-row" data-inv="${c.id}">
              <a href="#/${c.id}" class="index-link" data-tip="${S.esc(TIP[c.id])}">
                <span class="idx" aria-hidden="true"><span>#</span><span>${c.id}</span></span>
                <span class="index-title">${S.esc(c.title)}<span class="index-arrow" aria-hidden="true">↗</span></span>
                <span class="index-sub">
                  <span class="index-q">${S.esc(c.question)}</span>
                  <span class="index-medium">${S.esc(c.medium)} · ${S.esc(c.verb)}</span>
                  ${S.hasSaved('c' + c.id) ? '<span class="index-saved">Your notes are waiting</span>' : ''}
                </span>
              </a>
            </li>`).join('')}
        </ol>
        <ul class="slashes" aria-label="Elsewhere in the Sandbox">
          <li class="slash slash-a">
            <p class="slash-h"><span class="slash-mark" aria-hidden="true">///</span> Found something worth showing?</p>
            <p class="slash-p">The <a href="#/exchange" data-tip="Exchange↗">Discovery Exchange</a> is an optional place to prepare an invitation into what you discovered — an experiment, an odd observation, a question you're still chasing.</p>
          </li>
          <li class="slash slash-b">
            <p class="slash-h"><span class="slash-mark" aria-hidden="true">///</span> Rather not look at a screen?</p>
            <p class="slash-p">Invitations 05 and 06 work entirely on paper: <a href="#/05/print" data-tip="Print↗">print 05</a>, <a href="#/06/print" data-tip="Print↗">print 06</a>, or <a href="#/print" data-tip="Print↗">print both</a>.</p>
          </li>
        </ul>
        <footer class="home-foot">
          <p>Nothing you write here leaves this browser. No account needed. Some invitations send you to an outside AI tool, which has its own sign-in.</p>
          <p><button type="button" class="btn btn-quiet" data-clearall>Using a shared device? Clear everything saved here</button>
          · <a href="#/facilitator" class="facil-link">For facilitators</a></p>
        </footer>
      </section>`;
    S.$(root, '[data-clearall]').addEventListener('click', () => {
      if (!window.confirm('Clear everything the Sandbox saved on this device, for all six invitations and the Discovery Exchange? This cannot be undone.')) return;
      S.clearAll();
      S.views.home(root);
      S.announce('Everything saved by the Sandbox on this device was cleared.');
    });
  };
})(window.Sandbox);
