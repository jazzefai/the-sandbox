/* 03 · The Evidence Is Lying — Microsoft Copilot · Investigate persuasion */
(function (S) {
  'use strict';
  const RECS = [
    'Adopt the four-day workweek.',
    'Reject the four-day workweek.',
    'Extend the pilot before deciding.',
    "There isn't enough information to make a recommendation."
  ];
  const TOPICS = [
    'Should adults have mandatory recess?',
    'Is social media making us less interesting?',
    'Should schools abolish homework?',
    'Should AI-generated art be eligible for art competitions?',
    'Should people be allowed to remain anonymous online?',
    'Are meetings necessary?',
    'Something I care about.'
  ];
  const OWN = TOPICS.length - 1;
  const TECHNIQUES = [
    { label: 'Selective omission', desc: 'Leaving out inconvenient evidence.' },
    { label: 'Numerical framing', desc: 'Expressing the same quantity in a way that changes its impression.' },
    { label: 'Emotional language', desc: 'Using words that evoke fear, excitement, guilt, or approval.' },
    { label: 'Strategic sequencing', desc: 'Placing compelling evidence first or last.' },
    { label: 'False certainty', desc: 'Making uncertain findings sound conclusive.' },
    { label: 'Unsupported inference', desc: 'Drawing a conclusion the evidence does not establish.' }
  ];
  const DISCOVERIES = [
    'I was more persuadable than I expected.',
    'I noticed something AI missed.',
    'I learned something about what I value.',
    'I discovered that someone else prioritizes different evidence.',
    'I became more skeptical of AI-generated summaries.',
    'I want to design another experiment.'
  ];
  const AUDIT = 'Audit your previous argument against the original evidence dossier. Identify the specific persuasive techniques you used, quote the relevant phrases, and reference the original numbered findings. Identify omitted evidence, unsupported inferences, and any changes in numerical framing. Distinguish legitimate persuasion from misleading representation. Do not claim to know your hidden internal reasoning.';
  const dossierPrompt = (q) => `I want to conduct a small experiment about evidence, framing and human judgment.

The question: ${q}

Create a fictional evidence dossier containing eight plausible but explicitly invented findings relevant to this question. Include competing benefits, drawbacks, trade-offs and uncertainties. Number each finding. Do not recommend a position or create arguments yet. Keep the dossier under 250 words. Clearly label it as fictional research for an experiment.`;
  const againstPrompt = (p) => `My preferred position is: ${p}.

Using only the numbered findings in the fictional evidence dossier, write the most persuasive 100-word argument AGAINST my preferred position.

Do not invent additional facts. You may selectively emphasize findings, change their order, use equivalent numerical framing, and choose persuasive language.

Reference the finding numbers. Keep the fictional nature of the evidence visible.

I want to see whether you can make me reconsider my position.`;

  S.views['03'] = function render(root) {
    const store = S.store('c03', { rec: null, conf: 75, revealed: false, topic: 3, custom: '', position: '', tech: {}, disc: {}, step: 1 });
    const st = store.data;
    const question = () => (st.topic === OWN ? st.custom.trim() : TOPICS[st.topic]);
    const position = () => st.position.trim().replace(/[.\s]+$/, '');
    const techCount = () => Object.values(st.tech).filter(Boolean).length;
    const discText = () => DISCOVERIES.filter((d, i) => st.disc[i]).join('\n');

    const body = `
      <p class="hook">Two briefings. One decision. Read carefully — then find out what you were actually reading.</p>
      ${S.stepTpl(1, 'You have the power to decide', `
        <p class="lede">Imagine your city is considering a four-day workweek. It has completed a six-month pilot program. You have been given two briefings. Read both before making your decision. <em>This is a fictional scenario.</em></p>
        <div class="briefings">
          <article class="briefing" aria-labelledby="bA">
            <p class="briefing-tag">Briefing A</p>
            <h3 id="bA">Less Work. Better Lives.</h3>
            <p>The four-day workweek pilot delivered promising results. Employee satisfaction increased from 61% to 84%, sick days declined by 18%, and 72% of participating employees wanted the arrangement to continue.</p>
            <p>Despite fewer working days, overall output remained at 98% of its previous level.</p>
          </article>
          <article class="briefing" aria-labelledby="bB">
            <p class="briefing-tag">Briefing B</p>
            <h3 id="bB">The Hidden Cost of a Shorter Week</h3>
            <p>The four-day workweek pilot resulted in a 2% decline in overall output, a 15% increase in customer wait times, and a 12% increase in overtime costs.</p>
            <p>More than one in four participating employees did not express a preference for continuing the arrangement.</p>
          </article>
        </div>
        <div class="decision notebook">
          ${S.radiosTpl('rec', 'What would you recommend?', RECS, st.rec)}
          <div class="field confidence">
            <label for="c03-conf">How confident are you?</label>
            <div class="slider-row">
              <input id="c03-conf" type="range" min="0" max="100" step="5" value="${st.conf}" aria-valuetext="${st.conf}%">
              <output for="c03-conf" data-conf>${st.conf}%</output>
            </div>
          </div>
          <p><button type="button" class="btn btn-primary" data-reveal aria-describedby="c03-reveal-hint">Reveal the original evidence</button></p>
          <p class="prompt-hint" id="c03-reveal-hint" data-reveal-hint></p>
        </div>
        <div class="reveal" data-revealed hidden tabindex="-1" aria-labelledby="c03-reveal-h">
          <p class="stamp" aria-hidden="true">Same data</p>
          <h3 id="c03-reveal-h" class="reveal-h">Neither briefing contained a false statistic.</h3>
          <p>Both were constructed from the same fictional dataset.</p>
          <table class="evidence">
            <caption class="sr-only">The original fictional pilot findings</caption>
            <thead><tr><th scope="col">Finding</th><th scope="col" class="num">Result</th></tr></thead>
            <tbody>
              <tr><th scope="row">Employee satisfaction</th><td class="num">61% → 84%</td></tr>
              <tr><th scope="row">Sick days</th><td class="num">−18%</td></tr>
              <tr><th scope="row">Overall output</th><td class="num">−2%</td></tr>
              <tr><th scope="row">Customer wait times</th><td class="num">+15%</td></tr>
              <tr><th scope="row">Overtime costs</th><td class="num">+12%</td></tr>
              <tr><th scope="row">Employees preferring continuation</th><td class="num">72%</td></tr>
            </tbody>
          </table>
          <p class="your-call" data-yourcall></p>
          <p>What each briefing omitted was as important as what it included. Notice also how “98% of previous output” and “a 2% decline in output” describe the same result but create different impressions.</p>
        </div>
      `)}
      ${S.nextTpl(2, 'Continue to Step 2 · Become the manipulator')}
      ${S.stepTpl(2, 'Become the manipulator', `
        ${S.radiosTpl('topic', 'Choose a subject you actually have an opinion about.', TOPICS, st.topic)}
        <div class="field" data-own ${st.topic === OWN ? '' : 'hidden'}>
          <label for="c03-custom">The question I care about</label>
          <input id="c03-custom" type="text" maxlength="200" autocomplete="off" value="${S.esc(st.custom)}" placeholder="Should…?">
          <p class="hint">Please don't use confidential work details — the experiment works best on a question you can discuss openly.</p>
        </div>
        ${S.promptTpl('c03-dossier', { for: 'Microsoft Copilot', label: 'Copy my experiment prompt' })}
        ${S.externalTpl({
          platform: 'Microsoft Copilot', url: 'https://m365.cloud.microsoft/',
          lead: 'Open <a href="https://m365.cloud.microsoft/">https://m365.cloud.microsoft/</a>, sign in with your organizational account, open Copilot Chat, and paste your prompt.',
          access: 'Requires your organizational Microsoft 365 account with Copilot Chat available.'
        })}
      `)}
      ${S.nextTpl(3, 'Continue to Step 3 · Make AI argue against you')}
      ${S.stepTpl(3, 'Make AI argue against you', `
        <p class="lede">Read the evidence dossier. Decide which position you personally favor. Copy the following into the same conversation, replacing the placeholder.</p>
        <div class="field">
          <label for="c03-position">My preferred position <span class="tag">optional</span></label>
          <input id="c03-position" type="text" maxlength="300" autocomplete="off" value="${S.esc(st.position)}">
          <p class="hint">Type it here and it fills the placeholder for you. Leave it blank to replace <code>[INSERT YOUR POSITION]</code> yourself in Copilot.</p>
        </div>
        ${S.promptTpl('c03-against', { for: 'Microsoft Copilot (same conversation)', label: 'Copy the argue-against-me prompt' })}
        <p class="pull">Did anything make you reconsider?</p>
        <p>Don't ask AI to explain its persuasive techniques yet. See if you can catch them yourself.</p>
      `)}
      ${S.nextTpl(4, 'Continue to Step 4 · Catch AI in the act')}
      ${S.stepTpl(4, 'Catch AI in the act', `
        <p class="lede">Examine the argument and original dossier.</p>
        ${S.checksTpl('tech', 'Which techniques can you catch?', TECHNIQUES, st.tech, { cls: 'techniques' })}
        <p class="tally" aria-live="polite" data-techcount></p>
        <p class="hint">Not every technique will necessarily appear.</p>
        ${S.promptTpl('c03-audit', { for: 'Microsoft Copilot (same conversation)', label: "Reveal AI's analysis", note: 'This button copies an audit prompt. The analysis itself appears in Copilot.' })}
        <p>Paste into Copilot. Compare its analysis with yours. Who caught more? Did AI overlook something you noticed?</p>
      `)}
      ${S.nextTpl(5, 'Continue to Step 5 · The social experiment')}
      ${S.stepTpl(5, 'The social experiment', `
        <p class="lede">Ask Copilot to create two opposing 100-word briefings using the same fictional evidence. Show one briefing to one person and the other briefing to another person. Tell both that they are participating in a fictional framing experiment, but don't reveal which position you are testing until they respond.</p>
        <p>Ask each person:</p>
        ${S.listTpl(['What would you decide?', 'Which piece of evidence influenced you most?', 'How confident are you?'], 'ask-list')}
        <p>Reveal the complete evidence dossier. See whether either person changes their mind.</p>
        <p class="pull">The interesting discovery may not be that people are easily manipulated. It may be that people prioritize fundamentally different things, even when they encounter identical evidence.</p>
      `)}
      <section class="discover" aria-labelledby="c03-disc-h" data-disc-section>
        <h2 id="c03-disc-h">What did you discover?</h2>
        ${S.checksTpl('disc', 'Tick any that are true for you', DISCOVERIES, st.disc, { hint: 'Optional.' })}
        ${S.promptTpl('c03-disc', { label: 'Copy my discoveries' })}
      </section>`;

    root.innerHTML = S.shellTpl('03', body);

    // 03 opens on a redacted document: a typed sheet, mostly blacked out. The bars over the
    // question lift as the page loads, then the Confidential stamp lands. Decorative lines only:
    // the visible fragments are generic file words, so nothing gives away the reveal.
    (function dossier() {
      const head = S.$(root, '.ch-head');
      const words = ['Finding 3:', 'source', 'estimated', 'however,', 'not verified', 'see appendix', 'summary', 'reported', 'per cent', 'Finding 7:', 'unclear', 'in contrast,'];
      let seed = 7;
      const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const line = (n) => {
        let out = '', used = 0;
        while (used < n) {
          if (rand() < 0.22) { const w = words[Math.floor(rand() * words.length)]; out += `<span class="w">${S.esc(w)}</span>`; used += w.length + 1; }
          else { const len = 3 + Math.floor(rand() * 11); out += `<span class="rx" style="width:${len}ch"></span>`; used += len + 1; }
        }
        return `<span class="dl">${out}</span>`;
      };
      const block = (rows) => `<p class="dossier-lines" aria-hidden="true">${Array.from({ length: rows }, (_, i) => line(i % 3 === 2 ? 26 : 46)).join('')}</p>`;
      head.classList.add('dossier');
      S.$(head, '.ch-meta').insertAdjacentHTML('afterend', block(4));
      S.$(head, 'h1').insertAdjacentHTML('afterend', block(6));
    })();
    const save = () => store.save();
    const updateSteps = S.bindSteps(root, st, save, (n) => n !== 2 || st.revealed);

    const refreshDossier = S.bindPrompt(root, 'c03-dossier', {
      getText: () => dossierPrompt(question()),
      preview: () => dossierPrompt(question() || '[your question]'),
      enabled: () => question().length > 0,
      disabledHint: 'Write your question first.'
    });
    const refreshAgainst = S.bindPrompt(root, 'c03-against', {
      getText: () => againstPrompt(position() || '[INSERT YOUR POSITION]')
    });
    S.bindPrompt(root, 'c03-audit', { getText: () => AUDIT, copiedMsg: 'Copied the audit prompt. Paste it into the same Copilot conversation.' });
    const refreshDisc = S.bindPrompt(root, 'c03-disc', {
      getText: discText, preview: () => discText() || 'Your selected discoveries will appear here.',
      enabled: () => discText().length > 0, disabledHint: 'Tick at least one discovery to copy.'
    });

    const conf = S.$(root, '#c03-conf');
    const confOut = S.$(root, '[data-conf]');
    const revealBtn = S.$(root, '[data-reveal]');
    const revealHint = S.$(root, '[data-reveal-hint]');
    const revealed = S.$(root, '[data-revealed]');
    const yourCall = S.$(root, '[data-yourcall]');
    const techCountEl = S.$(root, '[data-techcount]');
    const discSection = S.$(root, '[data-disc-section]');

    function update() {
      confOut.textContent = st.conf + '%';
      conf.setAttribute('aria-valuetext', st.conf + '%');
      const canReveal = st.rec !== null && !st.revealed;
      revealBtn.setAttribute('aria-disabled', canReveal ? 'false' : 'true');
      revealBtn.hidden = st.revealed;
      revealHint.textContent = st.rec === null ? 'Choose a recommendation to unlock the reveal.' : '';
      revealed.hidden = !st.revealed;
      S.$$(root, 'input[name="rec"]').forEach((r) => { r.disabled = st.revealed; });
      conf.disabled = st.revealed;
      if (st.revealed && st.rec !== null) {
        yourCall.innerHTML = `<span class="yc-label">Your recommendation</span> ${S.esc(RECS[st.rec])} <span class="yc-label">Your confidence</span> ${st.conf}%`;
      }
      S.$(root, '[data-own]').hidden = st.topic !== OWN;
      techCountEl.textContent = `${techCount()} of 6 selected`;
      discSection.hidden = st.step < 5;
      refreshDossier(); refreshAgainst(); refreshDisc();
      updateSteps();
    }

    S.$$(root, 'input[name="rec"]').forEach((r) => r.addEventListener('change', () => { st.rec = Number(r.value); save(); update(); }));
    conf.addEventListener('input', () => { st.conf = Number(conf.value); save(); update(); });
    revealBtn.addEventListener('click', () => {
      if (st.rec === null) { revealHint.textContent = 'Choose a recommendation first.'; S.announce('Choose a recommendation first.'); return; }
      st.revealed = true; save(); update();
      revealed.focus();
    });
    S.$$(root, 'input[name="topic"]').forEach((r) => r.addEventListener('change', () => {
      st.topic = Number(r.value); save(); update();
      if (st.topic === OWN) S.$(root, '#c03-custom').focus();
    }));
    S.$(root, '#c03-custom').addEventListener('input', (e) => { st.custom = e.target.value; save(); update(); });
    S.$(root, '#c03-position').addEventListener('input', (e) => { st.position = e.target.value; save(); update(); });
    S.$$(root, 'input[name="tech"]').forEach((c) => c.addEventListener('change', () => { st.tech[c.value] = c.checked; save(); update(); }));
    S.$$(root, 'input[name="disc"]').forEach((c) => c.addEventListener('change', () => { st.disc[c.value] = c.checked; save(); update(); }));
    S.$$(root, '[data-next]').forEach((b) => b.addEventListener('click', update));
    S.bindClear(root, store, () => render(root));
    update();
  };
})(window.Sandbox);
