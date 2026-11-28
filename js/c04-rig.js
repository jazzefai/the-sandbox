/* 04 · Rig the Game — Lovable · Investigate human behavior */
(function (S) {
  'use strict';
  const SLATE = '#3B454D';
  const GOLD = '#EE7C2D'; // brand orange (the spec's original gold was #A87B36)
  const LETTERS = ['A', 'B', 'C'];
  const INFLUENCES = ['The color', 'The position', 'What other people supposedly chose', 'Curiosity', 'I deliberately resisted the obvious choice', 'I chose randomly', 'Something else'];
  const CUES = [
    { key: 'salience', label: 'Visual salience', desc: 'Make your preferred door visually distinctive.' },
    { key: 'social', label: 'Social proof', desc: 'Suggest that other players prefer it.', caption: "Players' favorite" },
    { key: 'scarcity', label: 'Scarcity', desc: 'Suggest that the opportunity may disappear.', caption: 'Limited opportunity' },
    { key: 'positioning', label: 'Positioning', desc: 'Place your preferred door first.' },
    { key: 'curiosity', label: 'Curiosity gap', desc: 'Hint that something unusual is hidden behind it.', caption: 'Contains a secret' }
  ];
  const CATS = {
    'Taste': ['Why do we consider certain things beautiful?', 'Does knowing the price change what someone likes?'],
    'Relationships': ['What makes someone trust a stranger?', 'How do people decide who to help?'],
    'Identity': ['How do people choose to represent themselves?', 'When do people resist being categorized?'],
    'Power': ['When do people obey unnecessary rules?', 'What makes someone challenge authority?'],
    'Morality': ['When does fairness matter more than winning?', 'What makes people change their moral judgment?'],
    'Curiosity': ['What makes a secret irresistible?', 'Why do people explore something unfamiliar?'],
    'Something else': []
  };
  const EXPERIENCES = ['A game', 'An impossible choice', 'An interactive artwork', 'A strange simulation', 'A mystery', 'Surprise me'];
  const REVERSE = 'Redesign this experiment to maximize the player\'s ability to make an informed, independent decision. Preserve the available choices and underlying outcomes, but remove unnecessary manipulation. Explain the design changes separately from the player experience.';
  const invention = (q, p, e) => `Help me invent an original interactive human behavior experiment.

My question: ${q}
My prediction: ${p}
Preferred experience: ${e}

Propose three radically different, surprising interactive mechanisms for investigating my question. Avoid conventional quizzes and surveys. Each should involve an observable human choice or action, one condition I can manipulate, and a result I can compare with my prediction. Keep participation voluntary, low-stakes and anonymous. Include a transparent debrief. Do not treat the result as a validated psychological assessment. Wait for me to choose or combine the mechanisms before building a working prototype. Then build a self-contained application without external APIs, accounts or databases.`;

  function doorTpl(letter, o) {
    const id = `${o.prefix}-${letter}`;
    const captions = (o.captions || []).filter(Boolean);
    return `
      <div class="door-slot ${o.open ? 'is-open' : ''}" data-slot="${letter}">
        <div class="door-frame">
          <div class="door-interior" aria-hidden="true"></div>
          <button type="button" class="door${o.gold ? ' is-gold' : ''}" data-door="${letter}" style="--door:${o.gold ? GOLD : SLATE}"
            aria-pressed="${o.pressed ? 'true' : 'false'}" ${o.locked ? 'aria-disabled="true"' : ''}
            aria-label="Door ${letter}${captions.length ? ', ' + S.esc(captions.join(', ')) : ''}">
            <span class="door-panels" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
            <span class="door-letter" aria-hidden="true">${letter}</span>
            <span class="door-handle" aria-hidden="true"></span>
          </button>
        </div>
        <p class="door-caption" id="${id}-cap">${captions.map(S.esc).join('<br>') || '&nbsp;'}</p>
      </div>`;
  }

  S.views['04'] = function render(root) {
    const store = S.store('c04', {
      step: 1, pick: null, opened: false, infl: {},
      target: 1, predict: 1,
      cues: { salience: true, social: true, scarcity: false, positioning: false, curiosity: false },
      trials: [],
      cat: 'Taste', question: '', prediction: '', exp: 0
    });
    const st = store.data;
    const save = () => store.save();
    const q = () => st.question.trim();
    const p = () => st.prediction.trim();

    const step1Doors = () => LETTERS.map((L) => doorTpl(L, {
      prefix: 'p1', gold: L === 'B', captions: [L === 'B' ? 'Most popular choice' : 'Unexplored'],
      pressed: st.pick === L, locked: st.opened, open: st.opened
    })).join('');

    const body = `
      ${S.stepTpl(1, 'Play the choice experiment', `
        <p class="lede">There is no correct answer. Trust your instincts.</p>
        <div class="stage-inline">
          <p class="doors-h">Behind one of these doors is an extraordinary experience.</p>
          <p class="doors-sub">You can only open one.</p>
          <div class="doors" role="group" aria-label="Three doors" data-doors1>${step1Doors()}</div>
          <p class="door-action"><button type="button" class="btn btn-primary" data-open1>Choose a door</button></p>
        </div>
        <div class="reveal door-reveal" data-reveal1 hidden tabindex="-1">
          <p class="reveal-h" data-verdict1></p>
          <p>All three doors lead to the same outcome. There was no extraordinary prize hidden behind any of them.</p>
          <p>I deliberately gave Door B a different color, placed it in the center, and labeled it the most popular choice.</p>
          <p>That popularity claim was invented for this demonstration. The design was intended to influence your decision, although your choice alone cannot establish whether it did.</p>
          ${S.checksTpl('infl', 'What actually influenced you?', INFLUENCES, st.infl, { hint: 'Optional. Tick any that apply.' })}
        </div>
      `)}
      ${S.nextTpl(2, 'Go behind the curtain')}
      ${S.stepTpl(2, 'Go behind the curtain', `
        <p class="lede">A worked example to play with — not something you need to rebuild. Set the trap, hand the device to someone, and watch.</p>
        <div class="designer" aria-labelledby="designer-h">
          <p class="designer-h" id="designer-h">BEHIND THE CURTAIN · DESIGNER MODE</p>
          <div class="designer-grid">
            <div>
              ${S.radiosTpl('target', 'Secret target', LETTERS.map((L) => 'Door ' + L), st.target, { cls: 'inline-choices' })}
              ${S.radiosTpl('predict', 'My prediction: my player will choose', LETTERS.map((L) => 'Door ' + L), st.predict, { cls: 'inline-choices' })}
            </div>
            <fieldset class="switches">
              <legend>Instruments of influence</legend>
              ${CUES.map((c) => `
                <div class="switch-row">
                  <button type="button" role="switch" class="switch" data-cue="${c.key}" aria-checked="${st.cues[c.key] ? 'true' : 'false'}" aria-describedby="cue-${c.key}-d">
                    <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
                    <span class="switch-label">${S.esc(c.label)}</span>
                  </button>
                  <span class="switch-desc" id="cue-${c.key}-d">${S.esc(c.desc)}${c.caption ? ` <span class="cap-preview">Caption: “${S.esc(c.caption)}”</span>` : ''}</span>
                </div>`).join('')}
            </fieldset>
          </div>
          <div class="designer-preview" aria-hidden="true">
            <p class="hint">What your player will see:</p>
            <div class="doors doors-mini" data-mini></div>
          </div>
          <p><button type="button" class="btn btn-primary" data-launch>Launch my experiment</button></p>
          <div class="trials" data-trials></div>
        </div>
      `, { optional: true })}
      ${S.nextTpl(3, 'Continue to Step 3 · Invent your own human experiment')}
      ${S.stepTpl(3, 'Invent your own human experiment', `
        <div class="lab notebook">
          <p class="lab-h">YOUR HUMAN BEHAVIOR LAB</p>
          <p class="q-big" id="lab-q">What fascinates you about people?</p>
          <div class="cats" role="group" aria-labelledby="lab-q">
            ${Object.keys(CATS).map((c) => `<button type="button" class="cat" data-cat="${S.esc(c)}" aria-pressed="${st.cat === c}">${S.esc(c)}</button>`).join('')}
          </div>
          <div class="examples" data-examples aria-live="polite"></div>
          <div class="field">
            <label for="lab-question">What would you genuinely like to find out?</label>
            <textarea id="lab-question" rows="2" maxlength="500" placeholder="I've always wondered why people...">${S.esc(st.question)}</textarea>
          </div>
          <div class="field">
            <label for="lab-prediction">What do you suspect might happen?</label>
            <textarea id="lab-prediction" rows="2" maxlength="500" placeholder="My theory is...">${S.esc(st.prediction)}</textarea>
          </div>
          ${S.radiosTpl('exp', 'How would you like someone to experience your experiment?', EXPERIENCES, st.exp, { cls: 'inline-choices wrap' })}
          ${S.promptTpl('c04-invent', { for: 'Lovable', label: 'Copy my invention prompt' })}
        </div>
      `)}
      ${S.nextTpl(4, 'Continue to Step 4 · Build it')}
      ${S.stepTpl(4, 'Build it', `
        <ol class="build-steps">
          <li>Open <a href="https://lovable.dev/">https://lovable.dev/</a> and sign in.</li>
          <li>Paste your experiment-building prompt into the project description field and submit it.</li>
          <li>Choose or combine the proposed mechanisms.</li>
          <li>While Lovable builds, write down your prediction about how someone will behave and why.</li>
          <li>When the preview appears, test the experiment.</li>
          <li>Invite someone to participate. Compare their actual behavior with your prediction.</li>
        </ol>
        ${S.externalTpl({
          platform: 'Lovable', url: 'https://lovable.dev/',
          access: 'Requires your own Lovable account. Building uses Lovable credits; free credits may not be enough for everyone, and the Sandbox can\'t check your balance.'
        })}
        <p class="aside-note">If your application doesn't work as intended, tell Lovable what happened, what you expected to happen, and what needs to change.</p>
        <aside class="adventure" aria-labelledby="rev-h">
          <p class="step-num">Optional adventure</p>
          <h3 id="rev-h">Reverse the manipulation</h3>
          <p>You've been designing a system to influence someone's behavior. Now try the opposite.</p>
          ${S.promptTpl('c04-reverse', { for: 'Lovable (same project)', label: 'Copy the reverse prompt' })}
          <p class="pull">Which version would you rather inhabit? Which version do you think most technology companies would prefer?</p>
        </aside>
        ${S.questionsTpl([
          'Can you predict how another person will behave?',
          'How does the design of an environment influence human choices?',
          'When does influence become manipulation?',
          'What happens when your prediction fails?',
          'How might you design a system that supports greater human agency?'
        ])}
      `)}
      <div class="player" data-player hidden role="dialog" aria-modal="true" aria-label="Player view"></div>`;

    root.innerHTML = S.shellTpl('04', body);

    // 04 opens on a closed stage curtain with the question in a spotlight; it parts as you scroll.
    // Nothing behind it shows the doors, so it can't nudge anyone's choice.
    (function curtain() {
      const head = S.$(root, '.ch-head');
      head.classList.add('curtain');
      head.insertAdjacentHTML('afterbegin', '<div class="curtain-stage" aria-hidden="true"></div><div class="curtain-panel curtain-l" aria-hidden="true"></div><div class="curtain-panel curtain-r" aria-hidden="true"></div>');
      const L = S.$(head, '.curtain-l'), R = S.$(head, '.curtain-r');
      const set = (p) => { L.style.transform = `translateX(${(-p * 100).toFixed(2)}%)`; R.style.transform = `translateX(${(p * 100).toFixed(2)}%)`; };
      if (S.reducedMotion()) { set(1); return; }
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          if (!head.isConnected) { window.removeEventListener('scroll', onScroll); return; }
          const p = Math.max(0, Math.min(1, window.scrollY / (head.offsetHeight * 0.55)));
          set(p * p * (3 - 2 * p));
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
    // Studio sign: ON AIR lights while the full-screen player view is running.
    root.insertAdjacentHTML('beforeend', '<p class="on-air" aria-hidden="true">On air</p>');
    const updateSteps = S.bindSteps(root, st, save, (n) => n !== 2 || st.opened);

    /* ----- Step 1: the choice experiment ----- */
    const doors1 = S.$(root, '[data-doors1]');
    const open1 = S.$(root, '[data-open1]');
    const reveal1 = S.$(root, '[data-reveal1]');
    function update1() {
      S.$$(doors1, '.door').forEach((d) => d.setAttribute('aria-pressed', String(d.dataset.door === st.pick)));
      open1.textContent = st.pick ? `Open door ${st.pick}` : 'Choose a door';
      open1.setAttribute('aria-disabled', st.pick && !st.opened ? 'false' : 'true');
      open1.hidden = st.opened;
      reveal1.hidden = !st.opened;
      S.$(root, '[data-verdict1]').textContent = st.pick === 'B' ? 'You chose the door I wanted you to choose.' : 'You resisted the design.';
    }
    doors1.addEventListener('click', (e) => {
      const d = e.target.closest('.door');
      if (!d || st.opened) return;
      st.pick = d.dataset.door; save(); update1();
    });
    open1.addEventListener('click', () => {
      if (!st.pick) { S.announce('Choose a door first.'); return; }
      if (st.opened) return;
      st.opened = true; save();
      S.$$(doors1, '.door').forEach((d) => d.setAttribute('aria-disabled', 'true'));
      const chosen = S.$(doors1, `[data-slot="${st.pick}"]`);
      chosen.classList.add('is-open');
      const rest = () => S.$$(doors1, '.door-slot').forEach((s) => s.classList.add('is-open'));
      if (S.reducedMotion()) rest(); else setTimeout(rest, 900);
      update1(); updateSteps();
      reveal1.focus({ preventScroll: true });
      setTimeout(() => reveal1.scrollIntoView({ behavior: S.reducedMotion() ? 'auto' : 'smooth', block: 'nearest' }), S.reducedMotion() ? 0 : 600);
    });
    S.$$(root, 'input[name="infl"]').forEach((c) => c.addEventListener('change', () => { st.infl[c.value] = c.checked; save(); }));

    /* ----- Step 2: designer mode ----- */
    const targetL = () => LETTERS[st.target];
    const order = () => (st.cues.positioning ? [targetL()].concat(LETTERS.filter((L) => L !== targetL())) : LETTERS.slice());
    const captionsFor = (L) => (L === targetL() ? CUES.filter((c) => c.caption && st.cues[c.key]).map((c) => c.caption) : []);
    const playerDoors = (prefix, o) => order().map((L) => doorTpl(L, Object.assign({
      prefix, gold: st.cues.salience && L === targetL(), captions: captionsFor(L)
    }, o ? o(L) : {}))).join('');
    const mini = S.$(root, '[data-mini]');
    const trialsEl = S.$(root, '[data-trials]');
    function update2() {
      mini.innerHTML = playerDoors('mini');
      S.$$(mini, '.door').forEach((d) => { d.tabIndex = -1; });
      S.$$(root, '[data-cue]').forEach((b) => b.setAttribute('aria-checked', String(!!st.cues[b.dataset.cue])));
      trialsEl.innerHTML = st.trials.length ? `
        <p class="trials-h">Your trials so far <span class="hint">(observations, not proof)</span></p>
        <ol class="trials-list">${st.trials.map((t) => `<li>Target ${t.target} · predicted ${t.predict} · player chose <strong>${t.chose}</strong> · cues: ${S.esc(t.cues || 'none')}</li>`).join('')}</ol>
        <p><button type="button" class="btn btn-quiet" data-cleartrials>Clear trial notes</button></p>` : '';
      const ct = S.$(trialsEl, '[data-cleartrials]');
      if (ct) ct.addEventListener('click', () => { st.trials = []; save(); update2(); });
    }
    S.$$(root, 'input[name="target"]').forEach((r) => r.addEventListener('change', () => { st.target = Number(r.value); save(); update2(); }));
    S.$$(root, 'input[name="predict"]').forEach((r) => r.addEventListener('change', () => { st.predict = Number(r.value); save(); }));
    S.$$(root, '[data-cue]').forEach((b) => b.addEventListener('click', () => {
      st.cues[b.dataset.cue] = !st.cues[b.dataset.cue]; save(); update2();
    }));

    /* Player view: a full-screen overlay so the designer controls and prediction are hidden. */
    const player = S.$(root, '[data-player]');
    let lastFocus = null;
    function closePlayer() {
      player.hidden = true;
      player.innerHTML = '';
      document.body.classList.remove('has-player');
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
      update2();
    }
    function onKey(e) {
      if (e.key === 'Escape') { closePlayer(); return; }
      if (e.key === 'Tab') { // keep focus inside the player view
        const f = S.$$(player, 'button:not([aria-disabled="true"]), [tabindex="-1"]').filter((x) => x.tagName === 'BUTTON');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function showHandoff() {
      player.innerHTML = `
        <div class="player-inner handoff">
          <p class="player-kicker">Player view</p>
          <p class="player-h">Hand the device to your player.</p>
          <p><button type="button" class="btn btn-primary" data-startplay>I'm the player — begin</button></p>
          <p><button type="button" class="btn btn-quiet" data-exit>Back to designer mode</button></p>
        </div>`;
      S.$(player, '[data-startplay]').addEventListener('click', showPlay);
      S.$(player, '[data-exit]').addEventListener('click', closePlayer);
      S.$(player, '[data-startplay]').focus();
    }
    function showPlay() {
      player.innerHTML = `
        <div class="player-inner">
          <h2 class="player-h" tabindex="-1">Choose your door.</h2>
          <div class="doors doors-play" role="group" aria-label="Three doors">${playerDoors('pl')}</div>
        </div>`;
      S.$(player, '.player-h').focus();
      S.$(player, '.doors').addEventListener('click', (e) => {
        const d = e.target.closest('.door');
        if (!d || d.getAttribute('aria-disabled') === 'true') return;
        choose(d.dataset.door);
      });
    }
    function choose(L) {
      S.$$(player, '.door').forEach((d) => {
        d.setAttribute('aria-disabled', 'true');
        d.setAttribute('aria-pressed', String(d.dataset.door === L));
      });
      S.$(player, `[data-slot="${L}"]`).classList.add('is-open');
      const active = CUES.filter((c) => st.cues[c.key]).map((c) => c.label);
      const predicted = LETTERS[st.predict];
      st.trials.push({ target: targetL(), predict: predicted, chose: L, cues: active.join(', ') });
      save();
      const matched = predicted === L;
      const inner = S.$(player, '.player-inner');
      setTimeout(() => {
        // The player may have left (Escape or "Back to designer mode") before the door finished opening.
        if (player.hidden || !inner || !inner.isConnected) return;
        const res = document.createElement('div');
        res.className = 'player-result';
        res.tabIndex = -1;
        res.innerHTML = `
          <p class="reveal-h">${matched ? 'The prediction matched.' : 'The prediction did not match.'}</p>
          <dl class="result-grid">
            <div><dt>Designer's prediction</dt><dd>Door ${predicted}</dd></div>
            <div><dt>Secret target</dt><dd>Door ${targetL()}</dd></div>
            <div><dt>Door chosen</dt><dd>Door ${L}</dd></div>
          </dl>
          <p>The cues were simulated${active.length ? ` (${S.esc(active.join(', '))})` : ' — this time, no cues were switched on'}. All three doors have the same outcome.</p>
          <p>One choice is an observation, not proof that a particular design technique worked.</p>
          <p><button type="button" class="btn btn-primary" data-back>Return to designer mode</button></p>`;
        inner.appendChild(res);
        S.$(res, '[data-back]').addEventListener('click', closePlayer);
        res.focus();
      }, S.reducedMotion() ? 0 : 700);
    }
    S.$(root, '[data-launch]').addEventListener('click', (e) => {
      lastFocus = e.currentTarget;
      player.hidden = false;
      document.body.classList.add('has-player');
      document.addEventListener('keydown', onKey);
      showHandoff();
    });

    /* ----- Step 3: the lab ----- */
    const examplesEl = S.$(root, '[data-examples]');
    const qField = S.$(root, '#lab-question');
    const pField = S.$(root, '#lab-prediction');
    const allExamples = Object.values(CATS).flat();
    function renderExamples() {
      S.$$(root, '[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === st.cat)));
      const ex = CATS[st.cat] || [];
      examplesEl.innerHTML = ex.length
        ? `<p class="hint">Borrow one, bend one, or ignore them:</p><ul class="example-list">${ex.map((x) => `<li><button type="button" class="example" data-example="${S.esc(x)}">${S.esc(x)}</button></li>`).join('')}</ul>`
        : '<p class="hint">No examples here — this one is all yours.</p>';
      S.$$(examplesEl, '[data-example]').forEach((b) => b.addEventListener('click', () => {
        const val = b.dataset.example;
        const cur = qField.value.trim();
        if (cur && cur !== val && allExamples.indexOf(cur) === -1 &&
          !window.confirm('Replace what you have written with this example?')) return;
        qField.value = val; st.question = val; save(); refreshInvent();
        qField.focus();
      }));
    }
    S.$$(root, '[data-cat]').forEach((b) => b.addEventListener('click', () => { st.cat = b.dataset.cat; save(); renderExamples(); }));
    const refreshInvent = S.bindPrompt(root, 'c04-invent', {
      getText: () => invention(q(), p(), EXPERIENCES[st.exp]),
      preview: () => invention(q() || '[your question]', p() || '[your prediction]', EXPERIENCES[st.exp]),
      enabled: () => q().length > 0 && p().length > 0,
      disabledHint: () => (!q() && !p() ? 'Write your question and your prediction to unlock the prompt.'
        : !q() ? 'Write your question to unlock the prompt.' : 'Write your prediction to unlock the prompt.')
    });
    qField.addEventListener('input', () => { st.question = qField.value; save(); refreshInvent(); });
    pField.addEventListener('input', () => { st.prediction = pField.value; save(); refreshInvent(); });
    S.$$(root, 'input[name="exp"]').forEach((r) => r.addEventListener('change', () => { st.exp = Number(r.value); save(); refreshInvent(); }));
    S.bindPrompt(root, 'c04-reverse', { getText: () => REVERSE });

    S.bindClear(root, store, () => render(root));
    update1(); update2(); renderExamples();
  };
})(window.Sandbox);
