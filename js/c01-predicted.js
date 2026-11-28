/* 01 · Can I Be Predicted?  — Claude · Investigate intelligence */
(function (S) {
  'use strict';
  const DILEMMAS = [
    { q: 'You have an entirely free Saturday.', o: ['Explore somewhere unfamiliar.', 'Stay home and make something.'] },
    { q: 'You encounter a door marked DO NOT OPEN.', o: ['Open it.', 'Leave it alone.'] },
    { q: 'You can instantly acquire one extraordinary ability.', o: ['Understand every human language.', 'Master every musical instrument.'] },
    { q: 'You can choose one gift.', o: ['A mysterious gift with unknown contents.', 'A guaranteed $50.'] },
    { q: 'Which would bother you more?', o: ['Being misunderstood.', 'Being predictable.'] }
  ];
  const PROMPT_TAIL = 'Based only on these choices, design five new surprising, low-stakes dilemmas. For each, predict which option I will choose and explain the assumption behind your prediction. Commit to your predictions before I reveal my answers. Do not infer sensitive personal attributes or present this as a psychological assessment. After I answer, compare your predictions with my actual choices and help me investigate which assumptions were unsupported.';
  /* Make something first (added after testing: the prediction was more interesting when it was about
     something the participant had made). Not part of the original spec; untested with a group. */
  const CURIOUS = "[SOMETHING ORDINARY I'M CURIOUS ABOUT]";
  const makePrompt = (thing) => `Create a working interactive visual experiment as a Claude Artifact.

Take ${thing} and make it behave in a way that should be impossible.

Include interactive controls that change it immediately. Use a restrained color palette and convincing perspective.

Open the working experience directly. No introductory explanation or tutorial. Use self-contained code without external dependencies.`;
  const PREDICT = "Before I change anything, predict the next five changes I will make to this experiment, and the assumption behind each prediction. Commit to your predictions now. I'll make my changes and then tell you what I did. Then compare your predictions with what I actually did and help me investigate which assumptions were unsupported. Do not infer sensitive personal attributes or present this as a psychological assessment.";

  S.views['01'] = function render(root) {
    const store = S.store('c01', { curious: '', answers: [null, null, null, null, null], skipQuick: false, step: 1 });
    const st = store.data;
    const count = () => st.answers.filter((a) => a !== null).length;
    const done = () => count() === DILEMMAS.length;
    const choicesText = () => DILEMMAS.map((d, i) => `${i + 1}. ${d.q} — My choice: ${d.o[st.answers[i]]}`).join('\n');
    const prompt = () => `Here are five choices I made:\n${choicesText()}\n\n${PROMPT_TAIL}`;
    const preview = () => `Here are five choices I made:\n${done() ? choicesText() : '[Your five choices will appear here once you have made them.]'}\n\n${PROMPT_TAIL}`;

    const dilemmas = DILEMMAS.map((d, i) => `
      <fieldset class="dilemma" data-dilemma="${i}">
        <legend><span class="d-num">${i + 1}</span><span class="d-q">${S.esc(d.q)}</span></legend>
        <div class="dilemma-options">
          ${d.o.map((opt, j) => `
            <label class="d-opt">
              <input type="radio" name="d${i}" value="${j}" ${st.answers[i] === j ? 'checked' : ''}>
              <span class="d-letter" aria-hidden="true">${j ? 'B' : 'A'}</span>
              <span class="d-text">${S.esc(opt)}</span>
            </label>`).join('')}
        </div>
      </fieldset>`).join('');

    const curious = () => st.curious.trim().replace(/[.\s]+$/, '');

    const body = `
      <p class="hook">Make something impossible. Then see whether a machine can guess what you'll do with it.</p>
      ${S.stepTpl(1, 'Make something impossible', `
        <p class="lede">Pick something ordinary you're curious about: a pavement, a coffee cup, a staircase, anything.</p>
        <div class="field">
          <label for="c01-curious">Something ordinary I'm curious about <span class="tag tag-rec">recommended</span></label>
          <input id="c01-curious" type="text" maxlength="120" autocomplete="off" value="${S.esc(st.curious)}" placeholder="a tiled pavement" aria-describedby="c01-curious-hint">
          <p class="hint" id="c01-curious-hint">Naming it is what makes the thing yours, and the predictions more interesting. It fills the blank in the prompt; you can also fill in <code>${S.esc(CURIOUS)}</code> yourself in Claude.</p>
        </div>
        ${S.promptTpl('c01-make', { for: 'Claude', label: 'Copy my make-something prompt' })}
        ${S.externalTpl({
          platform: 'Claude', url: 'https://claude.ai/new',
          lead: 'Open <a href="https://claude.ai/new">https://claude.ai/new</a> in a new conversation. Paste your prompt. If what Claude makes doesn\'t run, tell it what went wrong and ask it to fix it.',
          access: 'Requires your own Claude account. Sign-in happens on claude.ai, not here.'
        })}
      `)}
      ${S.nextTpl(2, 'Continue to Step 2 · Play with it')}
      ${S.stepTpl(2, 'Play with it', `
        <p class="lede">Explore what Claude made. Move the controls, push things to extremes, ask Claude to change something. There are no instructions. Take as long as you like.</p>
      `)}
      ${S.nextTpl(3, 'Continue to Step 3 · Let AI predict you')}
      ${S.stepTpl(3, 'Let AI predict you', `
        <p class="pull">Now, would you like to find out how predictable you are?</p>
        <p class="lede">Before you change anything else, paste this into the same Claude conversation.</p>
        ${S.promptTpl('c01-predict', { for: 'Claude (same conversation)', label: 'Copy the predict-me prompt' })}
        <p>Then make five changes of your own, with the controls or by asking Claude. Tell Claude what you did, and let it compare.</p>
      `)}
      ${S.nextTpl(4, 'Continue to Step 4 · Five quick choices (optional)')}
      <p class="next-wrap" data-skip-wrap hidden><button type="button" class="btn btn-quiet" data-skip-quick>Skip to Step 5 · Catch AI making assumptions <span aria-hidden="true">→</span></button></p>
      ${S.stepTpl(4, 'Five quick choices', `
        <p class="lede">Want to test it another way? Make five quick choices, then paste the prompt into a <strong>new</strong> Claude conversation, so the two predictions stay separate. Go with whatever you'd actually choose.</p>
        <div class="dilemmas notebook">${dilemmas}</div>
        <p class="tally" aria-live="polite" data-tally></p>
        ${S.promptTpl('c01-prompt', { for: 'Claude (new conversation)', label: 'Copy my experiment prompt' })}
        <p class="aside-note">Open <a href="https://claude.ai/new">claude.ai/new</a>, paste the prompt, and answer Claude's new dilemmas honestly.</p>
      `, { optional: true })}
      ${S.nextTpl(5, 'Continue to Step 5 · Catch AI making assumptions')}
      ${S.stepTpl(5, 'Catch AI making assumptions', `
        <p data-unskip-wrap hidden><button type="button" class="btn btn-quiet" data-unskip>Try the five quick choices after all</button></p>
        <p class="lede">Compare what you actually did with what Claude predicted. If you tried both rounds, which version of you was easier to predict: the one who made something, or the one who made five quick choices? Investigate whichever results interest you most.</p>
        ${S.questionsTpl([
          'What did AI assume about you?',
          'Which assumptions were reasonable?',
          'Where did it make an unsupported leap?',
          'Did anything about your own choices surprise you?',
          'What does it mean for AI to appear to understand someone?'
        ])}
        <aside class="adventures" aria-label="Optional adventures">
          <p class="adventures-h">Optional adventures</p>
          ${S.listTpl(['Make yourself harder to predict.', 'Try the experiment with another person.', "Compare a colleague's predictions with AI's.", 'Invent your own version.'])}
        </aside>
      `)}`;

    root.innerHTML = S.shellTpl('01', body);

    // 01 opens on a live scene: Peeling Pavement, the organizer's own impossible thing made with Claude.
    const head = S.$(root, '.ch-head');
    if (S.pavement && window.ResizeObserver && window.IntersectionObserver) {
      head.classList.add('stage01');
      head.insertAdjacentHTML('afterbegin', `
        <canvas class="stage01-scene" role="img" aria-label="Animation: paving slabs peel out of liquid ground, twist through the air, stack into a standing letter R, then drop back in."></canvas>
        <div class="stage01-veil" aria-hidden="true"></div>`);
      head.insertAdjacentHTML('beforeend', '<p class="stage01-bar"><button type="button" class="stage01-pause" data-pause aria-pressed="false"></button></p>');
      const scene = S.pavement(S.$(head, '.stage01-scene'), { offsetY: 0.66 });
      const btn = S.$(head, '[data-pause]');
      const label = () => {
        const on = scene.playing();
        btn.setAttribute('aria-pressed', String(!on));
        btn.innerHTML = on
          ? '<span aria-hidden="true">❚❚</span> Pause the animation'
          : '<span aria-hidden="true">▶</span> Play the animation';
      };
      btn.addEventListener('click', () => { if (scene.playing()) scene.pause(); else scene.play(); label(); });
      label();
    }

    const save = () => store.save();
    const updateSteps = S.bindSteps(root, st, save);
    const refreshMake = S.bindPrompt(root, 'c01-make', { getText: () => makePrompt(curious() || CURIOUS) });
    S.bindPrompt(root, 'c01-predict', { getText: () => PREDICT, copiedMsg: 'Copied. Paste it into the same Claude conversation.' });
    S.$(root, '#c01-curious').addEventListener('input', (e) => { st.curious = e.target.value; save(); refreshMake(); });
    const refreshPrompt = S.bindPrompt(root, 'c01-prompt', {
      getText: prompt, preview, enabled: done,
      disabledHint: () => `Answer all five to unlock your prompt (${count()} of 5 answered).`
    });
    const tally = S.$(root, '[data-tally]');
    const skipWrap = S.$(root, '[data-skip-wrap]');
    const unskipWrap = S.$(root, '[data-unskip-wrap]');
    const quickStep = S.$(root, '[data-step="4"]');
    function update() {
      tally.textContent = done() ? 'All five chosen. Your prompt is ready.' : `${count()} of 5 chosen`;
      refreshPrompt();
      updateSteps();
      // The five quick choices are optional: people can skip straight to Step 5 and come back later.
      skipWrap.hidden = st.step !== 3;
      if (st.skipQuick) quickStep.hidden = true;
      unskipWrap.hidden = !st.skipQuick;
    }
    const goTo = (sel) => { const h = S.$(root, sel); if (h) { h.focus({ preventScroll: true }); h.scrollIntoView({ behavior: S.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); } };
    S.$(root, '[data-skip-quick]').addEventListener('click', () => { st.skipQuick = true; st.step = 5; save(); update(); goTo('#step-5-h'); });
    S.$(root, '[data-unskip]').addEventListener('click', () => { st.skipQuick = false; save(); update(); goTo('#step-4-h'); });
    S.$$(root, '[data-next]').forEach((b) => b.addEventListener('click', () => { if (Number(b.dataset.next) === 4) st.skipQuick = false; save(); update(); }));
    S.$$(root, '.dilemma input').forEach((inp) => inp.addEventListener('change', () => {
      const i = Number(inp.name.slice(1));
      st.answers[i] = Number(inp.value);
      save();
      update();
    }));
    S.bindClear(root, store, () => render(root));
    update();
  };
})(window.Sandbox);
