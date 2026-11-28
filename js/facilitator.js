/* Facilitator view — kept separate from the participant experience.
   Not linked from inside any challenge, so objectives aren't revealed before play. */
(function (S) {
  'use strict';
  /* Each challenge's briefing card: key questions, description, time, step by step, why this matters.
     Key questions, steps and "why" come from the spec; descriptions are facilitator summaries. */
  const BRIEF = {
    '01': {
      keyq: ['What did AI assume about you?', 'Which assumptions were reasonable?', 'Where did it make an unsupported leap?', 'Did anything about your own choices surprise you?', 'What does it mean for AI to appear to understand someone?'],
      desc: 'Participants have Claude build a small impossible, interactive thing around something ordinary they are curious about, play with it, then ask Claude to predict the next five changes they will make. An optional second round runs the original five quick choices in a new conversation, so they can compare which version of them was easier to predict. The make-first path is not in the spec: it was added after the organizer found the prediction far more engaging when it was about something they had made. Untested with a group, and likely to run past 15 minutes.',
      steps: ['Make something impossible (in Claude) · naming your own curiosity is recommended', 'Play with it', 'Let AI predict you (same conversation)', 'Five quick choices (optional, new conversation; can be skipped)', 'Catch AI making assumptions', 'Optional adventures']
    },
    '02': {
      keyq: ['Can different interpretations be equally valid?', 'What is the relationship between intention and perception?', 'Which visual decisions influence meaning?', "What does AI infer when it lacks the creator's context?"],
      desc: 'Participants choose a hard-to-express feeling, describe it only as a picture, make the image in Canva AI, and find out what someone else (or another AI) reads into it without being told.',
      steps: ['Choose something difficult to express', 'Make the image (in Canva AI)', "See through someone else's eyes", 'Change one thing', 'Capture your discovery']
    },
    '03': {
      keyq: null,
      desc: 'Participants make a recommendation from two opposing briefings, then learn both were built from the same data. They go on to use Copilot to build, and then catch, persuasive framing on a question they care about.',
      steps: ['You have the power to decide', 'Become the manipulator (in Copilot)', 'Make AI argue against you', 'Catch AI in the act', 'The social experiment', 'What did you discover? (optional)']
    },
    '04': {
      keyq: ['Can you predict how another person will behave?', 'How does the design of an environment influence human choices?', 'When does influence become manipulation?', 'What happens when your prediction fails?', 'How might you design a system that supports greater human agency?'],
      desc: 'Participants play a three-door game that was quietly rigged, see how it was rigged (and can rig one for someone else), then invent and build their own behavior experiment in Lovable.',
      steps: ['Play the choice experiment', 'Go behind the curtain (optional worked example)', 'Invent your own human experiment', 'Build it (in Lovable)', 'Optional adventure · Reverse the manipulation']
    },
    '05': {
      desc: 'A screen-free story in three movements: invent an ordinary object with an impossible ability, then find out what people actually do with it. Ends in a show-and-tell.',
      steps: ['01 · The invitation', '02 · The invention', '03 · The plot twist', 'Show-and-tell']
    },
    '06': {
      desc: 'A screen-free story in three movements: suspend one familiar rule, imagine life without it, then meet someone who needed it. Ends in a show-and-tell.',
      steps: ['01 · The invitation', '02 · The rebellion', '03 · The plot twist', 'Show-and-tell']
    }
  };
  const TIME = 'Aim: something presentable in about 15 minutes, with optional deeper exploration. Unverified — time a novice before the day.';
  const NOTES = {
    '01': {
      notes:'AI can construct plausible interpretations from limited information. Plausibility is not the same as understanding.',
      show: 'Personalized prediction experiment and surprising discoveries.',
      aha: 'I caught AI making an assumption about me.', role: 'Investigator of human and machine intelligence.',
      access: 'Claude account (claude.ai/new).'
    },
    '02': {
      notes: 'Communicating meaning requires understanding visual choices, human experience, context and interpretation.',
      show: 'Two images, one intentional modification and a surprising discovery.',
      aha: 'Someone saw something in my creation that I never intended.', role: 'Visual storyteller and investigator of perception.',
      access: 'Canva account with AI image generation (plan and quota dependent). Solo path needs any image-capable AI the participant can use.'
    },
    '03': {
      notes: 'Distinguish persuasive communication from warranted conclusions, recognize omissions, verify sources and exercise independent judgment.',
      show: 'Two contradictory narratives, one dossier and experiment results.',
      aha: 'My judgment could be influenced by how evidence is presented.', role: 'Critical analyst.',
      access: 'Organizational Microsoft 365 account with Copilot Chat. Ordinary Copilot Chat suffices; Premium-specific value is not verified.'
    },
    '04': {
      notes: '',
      show: 'Original playable experiment, prediction and observation.',
      aha: 'I could invent and conduct my own experiment.', role: 'Behavioral scientist and experimental designer.',
      access: 'Lovable account. One tester had sufficient free credits; do not assume universal access.'
    },
    '05': {
      keyq: ['What could exist that doesn\'t?', 'What happens when an invention enters the world?', 'What unexpected possibilities or consequences emerge?', 'Can you reinvent what you have invented?'],
      why: 'Reinvention requires imagining alternatives to what already exists. Invention involves imagination, anticipation, judgment and revision—not simply generating ideas.',
      show: 'An original impossible invention and its possibilities.',
      aha: 'I imagined something I hadn\'t previously considered possible.', role: 'Inventor.',
      access: 'None. Printable version available.'
    },
    '06': {
      keyq: ['What exists that doesn\'t have to?', 'Who benefits from existing rules?', 'What might a rule protect?', 'Which rules are worth preserving, modifying, abolishing, or inventing?', 'What becomes possible when we organize the world differently?'],
      why: 'Reinvention isn\'t indiscriminate disruption. It requires understanding what deserves to survive, what needs to change, and what has yet to be invented.',
      show: 'Reimagined institution, experience, ritual or social convention and a rule worth having.',
      aha: 'Something I accepted as necessary was actually a design choice.', role: 'Rulemaker and systems thinker.',
      access: 'None. Printable version available.'
    }
  };
  const CHECKLIST = [
    'Host the Sandbox on an https:// address (or localhost). Copy buttons fall back to manual copy elsewhere.',
    'Open every challenge on a participant-type laptop and on a phone; press each copy button once.',
    'Sign in to claude.ai/new with a participant-type account and run the 01 prompt end to end.',
    'Confirm Canva AI image generation is available on participants\' Canva plans and note any generation limits.',
    'Confirm Copilot Chat is enabled at m365.cloud.microsoft for participants\' organizational accounts.',
    'Confirm Lovable sign-up works on the network and estimate whether free credits cover one build plus one revision.',
    'Check whether the organization\'s network or device policies block any of: claude.ai, canva.com, m365.cloud.microsoft, lovable.dev.',
    'Print copies of 05 and 06 (print both: #/print) for participants who want to go screen-free.',
    'Choose when the sharing moment happens (see the plan above) and give people a heads-up about 15 minutes before it.',
    'From a phone, scan an Exchange QR code that opens a published Lovable app and a Canva view link, while signed out.',
    'On shared devices, use "Clear everything saved here" on the home page between participants.',
    'Time a novice walking through one AI challenge; the 15-minute target is unverified.',
    'Print the table-top kit (#/kit) from the live site, scan two or three of the printed codes with a phone, and put one card on each table.'
  ];

  S.views.facilitator = function (root) {
    root.innerHTML = `
      <article class="facilitator" aria-labelledby="f-h">
        <header class="ch-head">
          <p class="ch-meta"><span class="ch-num">F</span><span class="ch-medium">For facilitators · please don't show participants before they play</span></p>
          <h1 id="f-h" tabindex="-1"><span class="ch-title">Facilitator notes</span>
          <span class="ch-question">What to watch for, and what to check before the room fills.</span></h1>
        </header>
        <div class="ch-body">
          <section aria-labelledby="f-stance"><h2 id="f-stance">Stance</h2>
            <p>Use AI to expand what people can do, not to remove the thinking and judgment we want them to develop. The measure of success is not how much AI participants use. It is what they become more capable of imagining, investigating, creating, understanding, and deciding.</p>
            <p>About 90 minutes of sandbox time. No required sequence; nobody needs to finish everything. Each challenge aims for something presentable within 15 minutes — that target is <strong>unverified</strong>.</p>
          </section>

          <section aria-labelledby="f-day"><h2 id="f-day">The day, start to finish</h2>
            <p class="hint">A suggested shape for about 90 minutes of sandbox time. Move the times to suit your room; only the order matters.</p>
            <ol class="f-plan">
              <li><strong>Before people arrive · 30 minutes.</strong> Put a table-top card on each table and the “Start here” card by the door. Put printed copies of 05 and 06 on their tables. Open the Sandbox on the event Wi-Fi and press one copy button. Keep this page off any shared screen.</li>
              <li><strong>Opening · 5 minutes.</strong> Point people to the “Start here” card or the home page. Say only what the home page says: some challenges use an AI tool, others use nothing but imagination; any order, alone or with someone, leave whenever you like. Don't explain what any challenge is “really” about.</li>
              <li><strong>Play · about 65 minutes.</strong> Circulate and observe, don't score (see the evaluation criteria below). Notice where people stall, what they abandon, and who is leaning on you or on AI to do the thinking.</li>
              <li><strong>Heads-up · about 15 minutes before sharing.</strong> Give the Discovery Exchange heads-up from the sharing plan below.</li>
              <li><strong>The sharing moment · about 15 minutes.</strong> Follow the sharing plan below: find two people, take turns, try before explaining.</li>
              <li><strong>Close · 2 minutes.</strong> On shared devices, press “Clear everything saved here” on the home page before the next person sits down.</li>
            </ol>
            <dl class="f-eval">
              <dt>An AI tool is blocked or won't sign in</dt><dd>Point the person to 05 or 06, which need no technology, or pair them with someone whose access works. 04's door game and designer mode run inside the Sandbox, so Steps 1 and 2 still work without Lovable.</dd>
              <dt>Out of Lovable credits</dt><dd>The same: 04's Steps 1 and 2, or a partner's account.</dd>
              <dt>The copy button doesn't copy</dt><dd>The Sandbox selects the text in a box underneath; press Ctrl+C (or ⌘C on a Mac).</dd>
              <dt>Someone finishes early</dt><dd>01–04 end with optional questions worth chasing, and any challenge can be tried a second time with someone else. The Discovery Exchange is open any time.</dd>
              <dt>Someone doesn't want to share</dt><dd>That's fine. Note it as an observation; don't press.</dd>
            </dl>
          </section>

          <section aria-labelledby="f-each"><h2 id="f-each">Challenge by challenge</h2>
            <p class="hint">One briefing card per challenge. Everything here is for facilitators: the key questions and “why this matters” give away what participants are meant to discover.</p>
            ${S.CHALLENGES.map((c) => { const n = NOTES[c.id]; const b = BRIEF[c.id]; const keyq = b.keyq || n.keyq; const why = n.why || n.notes; return `
              <div class="f-card">
                <h3><span class="o-num">${c.id}</span> ${S.esc(c.title)} <span class="f-medium">${S.esc(c.medium)}</span></h3>
                <dl>
                  <dt>Key questions</dt><dd>${keyq ? S.listTpl(keyq.map(S.esc)) : 'The spec gives none for this challenge. Its optional “What did you discover?” statements play that role.'}</dd>
                  <dt>Description</dt><dd><strong>${S.esc(c.question)}</strong> ${S.esc(c.medium)} · ${S.esc(c.verb)}. ${S.esc(b.desc)}</dd>
                  <dt>Time</dt><dd>${S.esc(TIME)}</dd>
                  <dt>Step by step</dt><dd><ol class="f-steps">${b.steps.map((s) => `<li>${S.esc(s)}</li>`).join('')}</ol></dd>
                  <dt>Why this matters</dt><dd>${why ? S.esc(why) : 'The spec doesn\'t state one for this challenge; see its key questions and candidate aha.'}</dd>
                </dl>
                <dl class="f-also">
                  <dt>Something to show</dt><dd>${S.esc(n.show)}</dd>
                  <dt>Candidate aha</dt><dd>${S.esc(n.aha)}</dd>
                  <dt>Role</dt><dd>${S.esc(n.role)}</dd>
                  <dt>Platform access</dt><dd>${S.esc(n.access)}</dd>
                </dl>
              </div>`; }).join('')}
          </section>

          <section aria-labelledby="f-eval"><h2 id="f-eval">Evaluation — design and research criteria, not participant assignments</h2>
            <dl class="f-eval">
              <dt>Activation</dt><dd>Time to first meaningful discovery.</dd>
              <dt>Delight</dt><dd>Genuine enthusiasm or voluntary continuation.</dd>
              <dt>Agency</dt><dd>Consequential independent decisions.</dd>
              <dt>Originality</dt><dd>Creative divergence between participants.</dd>
              <dt>Transfer</dt><dd>Independently identifying or demonstrating applications beyond the original experience.</dd>
            </dl>
            <p>Also observe: unnecessary technical friction, abandonment, cognitive fatigue, excessive dependence on AI or facilitator support, and whether participants have sufficient mental spaciousness.</p>
            <p class="warn-block">Do not claim that these experiences have demonstrated learning gains merely because participants enjoy them. All six received positive feedback from one prototype tester; broader usability, access and timing are unverified.</p>
          </section>

          <section aria-labelledby="f-share"><h2 id="f-share">The sharing moment</h2>
            <p>About 15 minutes near the end. Not presentations — invitations. Everyone shows whatever they have, finished or not, to two people, using the Discovery Exchange's full-screen view.</p>
            <ol class="f-plan">
              <li><strong>Heads-up · about 15 minutes before.</strong> “In a little while we'll swap discoveries. If you made something people can open, put it in the Discovery Exchange and scan its QR code with your phone to check it works. If it lives in your head or on paper, that counts. So does a question you're still chasing.”</li>
              <li><strong>Get ready · 2 minutes.</strong> “Open the Discovery Exchange and press <em>Show full screen</em>. Now find two people you haven't worked with today.” Thirty people make about ten trios; pairs or fours are fine.</li>
              <li><strong>Take turns · about 3 minutes each, 10 minutes in all.</strong> One person at a time turns their screen around and says only their title and their question. The others try it first — scan, play, guess — before hearing any explanation. Then the maker says what they intended and what surprised them. Call time every three minutes: “Next person.”</li>
              <li><strong>Optional second round · 3–5 minutes.</strong> If the room has energy: “One person from each group, move to another group and show yours once more.”</li>
              <li><strong>Optional close · 2 minutes.</strong> “Did anyone see something in someone else's work they didn't expect?” Take two or three voices. Nobody has to speak.</li>
            </ol>
            <dl class="f-eval">
              <dt>No link?</dt><dd>The full-screen view still shows a title and a question. 05 and 06 inventions are told, not scanned.</dd>
              <dt>Doesn't work on phones?</dt><dd>People lean in and try it on the maker's laptop.</dd>
              <dt>Nothing to show?</dt><dd>“What did you try, and where did it go sideways?” is a fine thing to share.</dd>
              <dt>Worth watching</dt><dd>How different trios' things are from each other (originality), anyone connecting their discovery to their own work (transfer), and who chose not to share and why.</dd>
            </dl>
          </section>

          <section aria-labelledby="f-kit"><h2 id="f-kit">Table-top kit</h2>
            <p>Fold-in-half tent cards, one per table: a “Start here” card, one for each challenge, and one for the Discovery Exchange. Each shows the challenge's question and a QR code that opens it, so the room itself becomes the index. <a href="#/kit">Open the table-top kit</a> to print it.</p>
          </section>

          <section aria-labelledby="f-ready"><h2 id="f-ready">Readiness checklist</h2>
            <p class="hint">Ticks are saved on this device only, for your own convenience.</p>
            <ul class="f-check" data-checklist>
              ${CHECKLIST.map((t, i) => `<li><label class="check"><input type="checkbox" data-ci="${i}"><span class="check-mark" aria-hidden="true"></span><span class="check-text">${S.esc(t)}</span></label></li>`).join('')}
            </ul>
          </section>
        </div>
      </article>`;
    const store = S.store('facilitator', { checks: {} });
    S.$$(root, '[data-ci]').forEach((c) => {
      c.checked = !!store.data.checks[c.dataset.ci];
      c.addEventListener('change', () => { store.data.checks[c.dataset.ci] = c.checked; store.save(); });
    });
  };
})(window.Sandbox);
