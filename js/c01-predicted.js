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

  S.views['01'] = function render(root) {
    const store = S.store('c01', { answers: [null, null, null, null, null], step: 1 });
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

    const body = `
      <p class="hook">Five small choices. Then hand them to a machine and see whether it can guess your next five.</p>
      ${S.stepTpl(1, 'Make five choices', `
        <p class="lede">Go with whatever you'd actually choose.</p>
        <div class="dilemmas">${dilemmas}</div>
        <p class="tally" aria-live="polite" data-tally></p>
        ${S.promptTpl('c01-prompt', { for: 'Claude', label: 'Copy my experiment prompt' })}
      `)}
      ${S.nextTpl(2, 'Continue to Step 2 · Let AI predict you')}
      ${S.stepTpl(2, 'Let AI predict you', `
        ${S.externalTpl({
          platform: 'Claude', url: 'https://claude.ai/new',
          lead: 'Open <a href="https://claude.ai/new">https://claude.ai/new</a> in a new conversation. Paste the personalized prompt.',
          access: 'Requires your own Claude account. Sign-in happens on claude.ai, not here.'
        })}
        <p class="aside-note">Lost your prompt? It's still waiting in Step 1 — scroll up and copy it again.</p>
      `)}
      ${S.nextTpl(3, 'Continue to Step 3 · Catch AI making assumptions')}
      ${S.stepTpl(3, 'Catch AI making assumptions', `
        <p class="lede">Answer the new dilemmas honestly. Compare your actual choices with Claude's predictions. Investigate whichever results interest you most.</p>
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

    const save = () => store.save();
    const updateSteps = S.bindSteps(root, st, save, (n) => n !== 2 || done());
    const refreshPrompt = S.bindPrompt(root, 'c01-prompt', {
      getText: prompt, preview, enabled: done,
      disabledHint: () => `Answer all five to unlock your prompt (${count()} of 5 answered).`
    });
    const tally = S.$(root, '[data-tally]');
    function update() {
      tally.textContent = done() ? 'All five chosen. Your prompt is ready.' : `${count()} of 5 chosen`;
      refreshPrompt();
      updateSteps();
    }
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
