/* 01 · Can I Be Predicted?  — Claude · Investigate intelligence
   Flow (a change from the spec, made by the organizer after testing it themselves): make something
   impossible in Claude, keep changing it, then make the spec's five quick choices in the SAME
   conversation so Claude reads them alongside what it watched you make, then ask it to predict your
   next five changes, then compare. The spec's own five-dilemma prompt is kept as an optional
   adventure ("try the original version"). Untested with a group. */
(function (S) {
  'use strict';
  const DILEMMAS = [
    { q: 'You have an entirely free Saturday.', o: ['Explore somewhere unfamiliar.', 'Stay home and make something.'] },
    { q: 'You encounter a door marked DO NOT OPEN.', o: ['Open it.', 'Leave it alone.'] },
    { q: 'You can instantly acquire one extraordinary ability.', o: ['Understand every human language.', 'Master every musical instrument.'] },
    { q: 'You can choose one gift.', o: ['A mysterious gift with unknown contents.', 'A guaranteed $50.'] },
    { q: 'Which would bother you more?', o: ['Being misunderstood.', 'Being predictable.'] }
  ];
  // The spec's prompt, word for word: used by the "try the original version" adventure.
  const PROMPT_TAIL = 'Based only on these choices, design five new surprising, low-stakes dilemmas. For each, predict which option I will choose and explain the assumption behind your prediction. Commit to your predictions before I reveal my answers. Do not infer sensitive personal attributes or present this as a psychological assessment. After I answer, compare your predictions with my actual choices and help me investigate which assumptions were unsupported.';
  const READ_TAIL = "Using these choices and what you've seen me make and change in this conversation, tell me what you think they suggest about how I approach things, then make a few specific predictions about me. Do not infer sensitive personal attributes or present this as a psychological assessment.";
  const CURIOUS = "[SOMETHING ORDINARY I'M CURIOUS ABOUT]";
  const makePrompt = (thing) => `Create a working interactive visual experiment as a Claude Artifact.

Take ${thing} and make it behave in a way that should be impossible.

Include interactive controls that change it immediately. Use a restrained color palette and convincing perspective.

Open the working experience directly. No introductory explanation or tutorial. Use self-contained code without external dependencies.`;
  const PREDICT = "Before I change anything, predict the next five changes I will make to this experiment, and the assumption behind each prediction. Commit to your predictions now. I'll make my changes and then tell you what I did. Then compare your predictions with what I actually did and help me investigate which assumptions were unsupported. Do not infer sensitive personal attributes or present this as a psychological assessment.";

  S.views['01'] = function render(root) {
    const store = S.store('c01', { curious: '', answers: [null, null, null, null, null], step: 1 });
    const st = store.data;
    const count = () => st.answers.filter((a) => a !== null).length;
    const done = () => count() === DILEMMAS.length;
    const choicesText = () => DILEMMAS.map((d, i) => `${i + 1}. ${d.q} — My choice: ${d.o[st.answers[i]]}`).join('\n');
    const pending = '[Your five choices will appear here once you have made them.]';
    const readPrompt = (list) => `Can you predict me? Here are five choices I made:\n${list}\n\n${READ_TAIL}`;
    const origPrompt = (list) => `Here are five choices I made:\n${list}\n\n${PROMPT_TAIL}`;
    const curious = () => st.curious.trim().replace(/[.\s]+$/, '');

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
        <p class="lede">Ask Claude to change it. Make it behave like something else, give it a new shape, ask why it looks the way it does. Move the controls too. There are no instructions. Take as long as you like.</p>
        <p class="aside-note">Stay in the same Claude conversation from here on: the next two steps work because Claude has watched what you made.</p>
      `)}
      ${S.nextTpl(3, 'Continue to Step 3 · Can you predict me?')}
      ${S.stepTpl(3, 'Can you predict me?', `
        <p class="lede">Make five quick choices. Go with whatever you'd actually choose. Then paste the prompt into the same Claude conversation.</p>
        <div class="dilemmas notebook">${dilemmas}</div>
        <p class="tally" aria-live="polite" data-tally></p>
        ${S.promptTpl('c01-read', { for: 'Claude (same conversation)', label: 'Copy my predict-me prompt' })}
      `)}
      ${S.nextTpl(4, 'Continue to Step 4 · Let AI predict your next move')}
      ${S.stepTpl(4, 'Let AI predict your next move', `
        <p class="pull">Now, would you like to find out how predictable you are?</p>
        <p class="lede">Before you change anything else, paste this into the same Claude conversation.</p>
        ${S.promptTpl('c01-predict', { for: 'Claude (same conversation)', label: 'Copy the next-move prompt' })}
        <p>Then make five changes of your own, with the controls or by asking Claude. Tell Claude what you did, and let it compare.</p>
      `)}
      ${S.nextTpl(5, 'Continue to Step 5 · Catch AI making assumptions')}
      ${S.stepTpl(5, 'Catch AI making assumptions', `
        <p class="lede">Compare what you actually did with what Claude predicted. Investigate whichever results interest you most. Did knowing its predictions change what you did?</p>
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
          <p class="adventures-h">Try the original version</p>
          <p>Paste your five choices into a <strong>new</strong> Claude conversation, where it knows nothing about what you made. Does it predict you as well?</p>
          ${S.promptTpl('c01-prompt', { for: 'Claude (new conversation)', label: 'Copy the original prompt' })}
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
    const lockHint = () => `Answer all five to unlock your prompt (${count()} of 5 answered).`;
    const refreshRead = S.bindPrompt(root, 'c01-read', {
      getText: () => readPrompt(choicesText()), preview: () => readPrompt(done() ? choicesText() : pending),
      enabled: done, disabledHint: lockHint, copiedMsg: 'Copied. Paste it into the same Claude conversation.'
    });
    const refreshOrig = S.bindPrompt(root, 'c01-prompt', {
      getText: () => origPrompt(choicesText()), preview: () => origPrompt(done() ? choicesText() : pending),
      enabled: done, disabledHint: lockHint
    });
    const tally = S.$(root, '[data-tally]');
    function update() {
      tally.textContent = done() ? 'All five chosen. Your prompt is ready.' : `${count()} of 5 chosen`;
      refreshRead(); refreshOrig();
      updateSteps();
    }
    S.$$(root, '[data-next]').forEach((b) => b.addEventListener('click', update));
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
