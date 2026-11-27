/* 02 · Lost in Translation — Canva AI · Investigate perception */
(function (S) {
  'use strict';
  const FEELINGS = [
    'The loneliness of being understood by everyone except the person who matters.',
    "The freedom of no longer needing someone's approval.",
    'Missing a version of yourself that no longer exists.',
    "The pleasure of doing something you're not supposed to do.",
    "Being homesick for somewhere you've never been.",
    'The difference between being wanted and being needed.',
    'Something of my own.'
  ];
  const OWN = FEELINGS.length - 1;
  const INTERPRET = 'Interpret this image without assuming you know its creator\'s intention. What emotion, situation, or idea might it communicate? Give me three distinct interpretations, ranked by how strongly the visible details support them. Identify the visual evidence for each. Distinguish what you observe from what you infer.';

  S.views['02'] = function render(root) {
    const store = S.store('c02', { feeling: 3, custom: '', visual: '', intended: '', other: '', ai: '', step: 1 });
    const st = store.data;
    const desc = () => st.visual.trim().replace(/[.\s]+$/, '');
    const imagePrompt = (d) => `Create a conceptual editorial photograph depicting ${d}. Use visual storytelling, intentional composition and atmospheric lighting. No words, lettering, captions or text.`;
    const feelingText = () => (st.feeling === OWN ? st.custom.trim() : FEELINGS[st.feeling]);
    const findings = () => [
      ['What I intended', st.intended], ['What another person saw', st.other], ['What AI saw', st.ai]
    ].filter((p) => p[1].trim()).map((p) => `${p[0]}:\n${p[1].trim()}`).join('\n\n');

    const body = `
      ${S.stepTpl(1, 'Choose something difficult to express', `
        ${S.radiosTpl('feeling', 'Choose a feeling', FEELINGS, st.feeling, {
          cls: 'feelings',
          hint: 'You can use a fictional feeling — it doesn\'t have to be one you\'ve lived.'
        })}
        <div class="field" data-own ${st.feeling === OWN ? '' : 'hidden'}>
          <label for="c02-custom">My own difficult-to-express feeling</label>
          <input id="c02-custom" type="text" maxlength="200" autocomplete="off" value="${S.esc(st.custom)}">
          <p class="hint">This stays on your screen. It never goes into the image prompt.</p>
        </div>
        <div class="field field-big">
          <label for="c02-visual"><span class="q-big">If this feeling were a photograph, what would be in it?</span></label>
          <p class="hint" id="c02-visual-hint">Describe visible objects, a place, a moment, colors, or composition. Don't name the feeling itself.</p>
          <textarea id="c02-visual" rows="5" maxlength="1200" aria-describedby="c02-visual-hint c02-named">${S.esc(st.visual)}</textarea>
          <p class="warn" id="c02-named" aria-live="polite" data-named></p>
        </div>
        <p class="secret" data-secret></p>
        ${S.promptTpl('c02-prompt', { for: 'Canva AI', label: 'Copy my image prompt', note: 'Your feeling is not in this prompt. Only what the picture should look like.' })}
      `)}
      ${S.nextTpl(2, 'Continue to Step 2 · Make the image')}
      ${S.stepTpl(2, 'Make the image', `
        ${S.externalTpl({
          platform: 'Canva AI', url: 'https://www.canva.com/ai-image-generator/',
          lead: 'Open <a href="https://www.canva.com/ai-image-generator/">https://www.canva.com/ai-image-generator/</a>. Sign in, open the image generator, paste the personalized prompt, and generate an image. Choose the image closest to your intention.',
          access: 'Requires your own Canva account. AI image features and how many images you can generate depend on your Canva plan — the Sandbox can\'t check this for you.'
        })}
        <div class="empty-frame" aria-hidden="true"><span class="ef-art"></span><span class="ef-label"></span></div>
        <p class="pull">Notice that AI was not told what the image means. It was only told what it should look like.</p>
        <p class="lede">While the image is generating, predict what another person might see in it.</p>
      `)}
      ${S.nextTpl(3, "Continue to Step 3 · See through someone else's eyes")}
      ${S.stepTpl(3, "See through someone else's eyes", `
        <p class="lede">Show the image to another person without revealing your intended feeling. Ask:</p>
        ${S.listTpl(['What feeling does this image communicate?', 'What do you think is happening?', 'What visual evidence led you to that interpretation?'], 'ask-list')}
        <div class="solo">
          <p class="solo-h">Working alone?</p>
          <p>Upload the image into a fresh conversation with an image-capable AI. Do not provide the original prompt or intended meaning.</p>
          ${S.promptTpl('c02-interpret', { for: 'an image-capable AI', label: 'Copy the interpretation prompt' })}
          <p class="hint">This happens outside the Sandbox, in an AI tool you have access to that accepts images.</p>
        </div>
      `)}
      ${S.nextTpl(4, 'Continue to Step 4 · Change one thing')}
      ${S.stepTpl(4, 'Change one thing', `
        <p class="lede">Change just one visual element and investigate whether the interpretation changes.</p>
        <figure class="pairs">
          <div class="pair">
            <div class="pair-item">${S.art.room('warm')}<p>Warm golden sunlight</p></div>
            <div class="pair-vs" aria-hidden="true">vs</div>
            <div class="pair-item">${S.art.room('cold')}<p>Cold blue light</p></div>
          </div>
          <div class="pair">
            <div class="pair-item">${S.art.chairs('toward')}<p>Two empty chairs facing each other</p></div>
            <div class="pair-vs" aria-hidden="true">vs</div>
            <div class="pair-item">${S.art.chairs('away')}<p>Facing away</p></div>
          </div>
          <figcaption><strong>Illustrations, not controlled experimental comparisons.</strong> A solitary empty wooden chair in a minimal room, lit two ways; two empty chairs, arranged two ways.</figcaption>
        </figure>
        <p class="pull">Show both versions. Can you influence the interpretation?</p>
      `)}
      ${S.nextTpl(5, 'Continue to Step 5 · Capture your discovery')}
      ${S.stepTpl(5, 'Capture your discovery', `
        <p class="hint">All three are optional. Write as much or as little as you like.</p>
        <div class="field"><label for="c02-intended">What I intended</label><textarea id="c02-intended" rows="3" maxlength="2000" data-f="intended">${S.esc(st.intended)}</textarea></div>
        <div class="field"><label for="c02-other">What another person saw</label><textarea id="c02-other" rows="3" maxlength="2000" data-f="other">${S.esc(st.other)}</textarea></div>
        <div class="field"><label for="c02-ai">What AI saw</label><textarea id="c02-ai" rows="3" maxlength="2000" data-f="ai">${S.esc(st.ai)}</textarea></div>
        ${S.promptTpl('c02-findings', { label: 'Copy my findings' })}
        ${S.questionsTpl([
          'Can different interpretations be equally valid?',
          'What is the relationship between intention and perception?',
          'Which visual decisions influence meaning?',
          "What does AI infer when it lacks the creator's context?"
        ])}
      `)}`;

    root.innerHTML = S.shellTpl('02', body);
    const save = () => store.save();
    const updateSteps = S.bindSteps(root, st, save);
    const refreshImage = S.bindPrompt(root, 'c02-prompt', {
      getText: () => imagePrompt(desc()),
      preview: () => imagePrompt(desc() || '[your visual description]'),
      enabled: () => desc().length > 0,
      disabledHint: 'Describe what would be in the photograph to unlock your prompt.'
    });
    S.bindPrompt(root, 'c02-interpret', { getText: () => INTERPRET });
    const refreshFindings = S.bindPrompt(root, 'c02-findings', {
      getText: findings,
      preview: () => findings() || 'Your labeled findings will appear here.',
      enabled: () => findings().length > 0,
      disabledHint: 'Write in at least one box to copy your findings.'
    });

    const own = S.$(root, '[data-own]');
    const named = S.$(root, '[data-named]');
    const secret = S.$(root, '[data-secret]');
    function update() {
      own.hidden = st.feeling !== OWN;
      const f = feelingText();
      secret.innerHTML = f ? `<span class="secret-label">Your secret feeling</span> <span class="secret-text">${S.esc(f)}</span>` : '';
      // Gentle nudge if the description names the feeling itself.
      const v = st.visual.toLowerCase();
      const ft = f.toLowerCase().replace(/[.\s]+$/, '');
      named.textContent = ft.length > 3 && v.indexOf(ft) !== -1
        ? 'Your description seems to name the feeling itself. Try describing only what someone would see.' : '';
      refreshImage();
      refreshFindings();
      updateSteps();
    }
    S.$$(root, 'input[name="feeling"]').forEach((r) => r.addEventListener('change', () => {
      st.feeling = Number(r.value); save(); update();
      if (st.feeling === OWN) S.$(root, '#c02-custom').focus();
    }));
    S.$(root, '#c02-custom').addEventListener('input', (e) => { st.custom = e.target.value; save(); update(); });
    S.$(root, '#c02-visual').addEventListener('input', (e) => { st.visual = e.target.value; save(); update(); });
    S.$$(root, '[data-f]').forEach((t) => t.addEventListener('input', () => { st[t.dataset.f] = t.value; save(); update(); }));
    S.bindClear(root, store, () => render(root));
    update();
  };
})(window.Sandbox);
