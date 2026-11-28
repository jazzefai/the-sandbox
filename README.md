# The Sandbox: Arcade AI Challenges

An interactive playground of six intellectual adventures, built from `sandbox-challenge-specifications.md` (the source of truth). Four of them use an outside AI platform and two use only the imagination. There are no accounts, scores, required order, or completion tracking.

## Setup

It's a static site: plain files, with no build step, no dependencies and no server code. To try it locally:

```bash
cd sandbox
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Putting it online for free

Any service that serves plain files over `https://` works. HTTPS matters because browsers only allow one-click copying on `https://` (or `localhost`).

**GitHub Pages** (free, with no payment card):

1. Put everything in this `sandbox` folder into a GitHub repository, with `index.html` at the top level. On a free GitHub account, Pages only works for **public** repositories. The site contains no participant data: what people type stays in their own browsers. It does include the facilitator notes, though, which are also one click away on the live site.
2. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. After a minute or two the site is live at `https://<your-account>.github.io/<repository>/`.

**After any change:** bump the `?v=N` number on the script and stylesheet links in `index.html`. Otherwise browsers that already loaded the site keep the old files.

## Typography

The brand typeface is **Circular** (Lineto), used for everything: headings, labels and body text. Prompt text that people copy is the only exception; it stays in a plain monospace so it reads as "text to paste".

**No font files are included, on purpose.** Circular's license, which is embedded in the font files, forbids "storing on publicly available servers" and "redistributing", and this site is public. So `css/styles.css` refers to Circular only as a font **installed on the viewer's device**, using `local()` with the common names CircularXX, Circular Std and Circular, in the weights Book, Medium, Bold and Black plus their italics.

- **With Circular installed:** the brand font shows. This is the case on brand-team machines, for example.
- **Everywhere else:** the closest font the device already has is used, which is Avenir Next on Apple devices and Segoe UI on Windows.

**To make every device show the same look**, add a free, openly licensed look-alike such as DM Sans or Figtree:

1. Put its `.woff2` files in `fonts/`, together with its license file.
2. Add an `@font-face` rule for it.
3. Put its name right after the Circular entries in `--brand`.

If your organization holds a Lineto **web** license, check its terms before putting Circular web fonts on this public site.

## Notebook moments

Wherever participants choose or write, the controls sit on a sheet of notebook paper, inspired by disc-bound desk notebooks: warm white dot-grid paper, metal discs along the left edge, and a soft shadow, so the page reads like a notebook lying on whatever background the invitation has.

- **Choosing:** like an answer sheet. The chosen bubble fills in with quick Deep Navy pencil strokes (in 01, the A/B bubble fills in and its letter stays readable). Checkboxes get a hand-drawn pencil check, and options sit on ruled lines.
- **Writing:** text boxes become ruled lines.
- **Where:** every radio and checkbox group, 01's dilemmas, 03's decision, 04's behavior lab, and the Discovery Exchange form. Any container marked `class="notebook"` gets the treatment; nested ones collapse into a single sheet.
- **Motion:** the fill and the check draw in with a few quick strokes. With reduced motion they simply appear.
- **Pencil:** over notebook pages, the mouse cursor becomes a small pencil whose point is the click spot. Mouse and trackpad only; elsewhere the cursor is normal.

## Each challenge wears a disguise

Like the drops on mschf.com, each challenge wears its own disguise. The frame stays constant: the corner menu, the SB mark, and the notebook sheets with their pencil. Only the styling changes; participant wording is the same as the spec. The decorative labels (for example "Case file № 03", "Confidential", "Sealed", "Drawing № 05", "Fig. 1", "Specification") are hidden from screen readers.

| Challenge | Disguise |
|---|---|
| 01 | **A sealed prediction.** Security-envelope paper, a wax seal, steps separated by tear-off lines, the prompt as an envelope, and an airmail border on the way to Claude. |
| 02 | **A gallery wall.** White walls, the paired illustrations framed and matted with wall labels, and large quiet wall text. After Step 5, one photograph of an empty chair hangs six times as an edition (1/6 … 6/6), each print titled with one of the challenge's six feelings: the same picture fits every title. **The photograph's source and usage rights must be confirmed before it goes on the public site.** |
| 03 | **A case file.** A manila folder on a dark desk, steps as typed sheets on index tabs, paper-clipped memos, carbon-copy prompts, and evidence that un-redacts row by row. |
| 04 | **A game show.** A curtain valance, spotlights, marquee bulbs around the door stage, and a backstage-striped designer mode. |
| 05 | **A patent drawing.** A Deep Navy blueprint grid, a drawing frame with a title block, figures with dimension lines, and the show-and-tell as a specification. |
| 06 | **Public notices.** Enamel signs with screws on a tiled wall, round sign numbers, and orange notices. |
| Exchange | **A pinboard.** Cork, with the three steps and the preview card pinned up. |

The small labels and stamps use the typewriter-style monospace. Headings and body text stay in Circular. Motion (the redactions in 03 and the marquee bulbs in 04) is switched off for people who turn off motion in their device settings. Printing removes the settings and prints plain black on white.

## Architecture

```
index.html                 shell; loads plain scripts (no modules, so file:// also works)
css/styles.css             base styles, one disguise per challenge, responsive, reduced-motion, print
js/core.js                 storage, clipboard with fallback, shared components (prompt block,
                           external-platform callout, radios/checkboxes, progressive steps, page frame)
js/art.js                  original SVG illustrations for the spec's visual references
js/qr.js                   QR code generator (no dependencies)
js/home.js                 the six challenges
js/c01-predicted.js        01 · Can I Be Predicted?        (Claude)
js/c02-translation.js      02 · Lost in Translation        (Canva AI)
js/c03-evidence.js         03 · The Evidence Is Lying      (Microsoft Copilot)
js/c04-rig.js              04 · Rig the Game               (Lovable) — includes the embedded door game + designer mode
js/c05-06-imagination.js   05 · The Impossible Object, 06 · Who Made the Rules? + printable versions
js/exchange.js             Discovery Exchange: prepare an invitation, show it full screen with a QR code
js/facilitator.js          facilitator notes: the day start to finish, evaluation criteria, sharing plan, readiness checklist
js/kit.js                  table-top kit: printable tent cards with a QR code for each challenge
js/app.js                  hash router and top bar
```

**Routes**

| Route | Page |
|---|---|
| `#/` | Home |
| `#/01` … `#/06` | The six challenges |
| `#/05/print`, `#/06/print`, `#/print` (both) | Printable versions of the imagination challenges |
| `#/exchange` | Discovery Exchange |
| `#/facilitator` | Facilitator notes. Only linked from the home-page footer, never from inside a challenge. |
| `#/kit` | Table-top kit: fold-in-half tent cards, one per table (Start here, 01–06, Exchange), each with the challenge's question and a QR code that opens it. Linked from the facilitator notes. Print landscape, one card per page; the top half prints upside down so the folded card reads from both sides. The codes use the page's own address unless another is typed in, and the page warns if that address is local. |

**Navigation model (modeled on mschf.com).** The home page is a black, numbered, all-caps monospace index. Hovering an entry turns it white and adds a ↗, and on mouse/trackpad a small yellow label follows the cursor (for example "Claude↗" or "No screen needed"). **Links to other websites open in a new tab**; moving between pages of the Sandbox stays in the same tab, so the browser's Back button works.

- A `MutationObserver` in `js/app.js` gives every link that leaves the site (Claude, Canva, Copilot, Lovable, and links people add on the Exchange) `target="_blank"`, `rel="noopener noreferrer"` and a screen-reader "(opens in a new tab)" label. It covers links added later too.
- Those outside links show a ↗ in text. Links within the Sandbox don't.
- A small fixed corner menu (01–06, Exchange, and an SB mark linking to the index) replaces the old top bar. On phones it sits at the top of the page instead.
- Each challenge's "Wander elsewhere" list uses the same index style.
- Colored `///` rows lead to the Discovery Exchange and the printable versions.

Participant-facing content is unchanged, and each challenge keeps its own visual identity inside its tab.

**State.** Each challenge saves to `localStorage` under its own key (`sandbox.v1.c01` and so on), so progress survives moving between challenges, tabs and reloads. When another tab changes saved answers, open tabs refresh to match — unless the person is typing at that moment. Nothing is sent anywhere. There's a "Clear my answers" control on every invitation, plus "Clear everything saved here" on the home page for shared devices. If storage is blocked (for example in private browsing), a notice explains that answers won't persist.

**Fidelity.** Participant-facing copy, choices, examples, prompts and reveals are taken word for word from the spec. Prompt substitutions:

- **01:** each choice is inserted as `1. <question> — My choice: <answer>`.
- **02:** the visual description is inserted, with a trailing full stop trimmed to avoid "..". The chosen feeling is never included.
- **03:** the chosen or custom question is inserted. An optional "My preferred position" field fills `[INSERT YOUR POSITION]`; if it's left blank, the placeholder is kept.
- **04:** question, prediction and experience are inserted verbatim.

**Decisions made where the spec was silent** (agreed before the build):

1. In 04, the designer-mode "prediction" is a door selector (A/B/C), set to B to begin with.
2. In 03, the optional position field described above.
3. In 03 Step 5, there's no copy prompt for the two opposing briefings, because the spec gives none and an untested prompt wasn't added.
4. In 02, the solo path's "image-capable AI" is left unnamed.
5. In 02, the chosen feeling is shown privately on screen and doesn't pre-fill "What I intended".
6. Visual references are original SVG illustrations. The 02 chair pairs are labeled "Illustrations, not controlled experimental comparisons."

Smaller readings:

- 03 Step 2 appears after the evidence is revealed. The recommendation and confidence then lock, so the participant's original call is kept.
- 04 designer mode:
  - Positioning moves the target to first place; the other doors keep their order.
  - Non-target doors have no caption.
  - Several captions stack on the target.
  - The player view is a full-screen overlay, so the designer controls and prediction are hidden. Escape returns to designer mode.
  - Each trial is noted locally as an observation (target, prediction, choice, cues). This is not a score.
- In 04 Step 3, clicking an example replaces the question field without asking only if the field is empty or holds another example.
- "Copy my findings / discoveries / invitation" copies only the entries that are filled in or ticked.
- "Key questions" for 01–04 appear at the end as optional "Questions worth chasing". For 05 and 06 they are facilitator-facing, as the spec places them.

## External dependencies

The site itself has none: no web fonts, CDNs, analytics, APIs or server code. These challenges send participants elsewhere, each clearly marked "Leaves the Sandbox":

| Challenge | Platform | URL |
|---|---|---|
| 01 | Claude | https://claude.ai/new |
| 02 | Canva AI (+ any image-capable AI for the solo path) | https://www.canva.com/ai-image-generator/ |
| 03 | Microsoft Copilot Chat | https://m365.cloud.microsoft/ |
| 04 | Lovable | https://lovable.dev/ |

## Platform access requirements — needs authenticated testing

The Sandbox does **not** check, simulate or assume any of these. Verify each with a participant-type account before the day:

- [ ] **Claude:** participants can sign in at claude.ai and start a new conversation. The 01 prompt runs end to end (predictions committed before answers).
- [ ] **Canva AI:** the AI image generator is available on participants' Canva plans; note any generation quotas.
- [ ] **Image-capable AI (02 solo path):** at least one tool participants can use accepts image uploads.
- [ ] **Microsoft Copilot Chat:** enabled for participants' organizational M365 accounts at m365.cloud.microsoft. The spec notes that ordinary Copilot Chat suffices and Premium-specific value is not verified.
- [ ] **Lovable:** sign-up works, and free credits cover one build plus at least one revision. Only one tester had enough credits.
- [ ] **Network:** device or network policies don't block any of the four domains.

## Known limitations

- **The Discovery Exchange is for sharing in person.** Nothing is sent or pooled. People prepare a title, a question and an optional link, then press **Show full screen**. That screen shows the title, the question and, if there's a link, a large QR code plus a clickable short form of the link. Their private note stays off it, so others try the thing before hearing the explanation. The facilitator view includes a plan for a 15-minute "find two people" sharing moment. QR codes are generated in the browser, and decoding was checked up to a 300-character link.
- **Nothing persists after the session.** There's no record of what the room made unless people print their card or keep their own links.
- **Phone-friendliness isn't guaranteed.** A QR code only helps if what's behind it works on a phone. The page asks people to scan their own code first; otherwise people try it on the maker's laptop.
- **Clipboard** needs `https://` or `localhost`; elsewhere participants copy manually from a pre-selected box. Tested in Chromium. Safari and Firefox clipboard behavior hasn't been tested by hand yet.
- **Not copied from mschf.com:** it opens scrolled to the newest item at the bottom; the Sandbox has no chronology, and that would hide the introduction. Its "???" rows for unreleased drops would have added content.
- **Visual references** are stylized illustrations, not photographs. Swap in real images in `js/art.js` if you have them.
- **The 15-minute target, novice usability and broad appeal are unverified.** All six received positive feedback from one prototype tester. 01 and 02 were reconstructed from earlier conversation details, so their interface labels may differ from the originals.
- **The 04 designer mode is a handoff decision,** not part of the original tested build.
- **Reduced motion:** with `prefers-reduced-motion`, animations and the door swing are effectively removed.

## What was tested (in-browser, Chromium)

- **Copying:** every challenge's copy button locks and unlocks under the right conditions, and every prompt is personalized correctly. A real click copied to the clipboard. The blocked-clipboard fallback was confirmed (append `?copyfail` to the URL to force it).
- **01:** copying unlocks only after all five choices are made.
- **02:** the feeling never appears in the prompt; there's a warning if the description names it; the findings copy correctly.
- **03:**
  - the reveal is gated on a recommendation
  - the recommendation and confidence are shown and locked after the reveal
  - the evidence table has six rows
  - the custom-topic validation works
  - the position placeholder is filled or kept as appropriate
  - the technique counter counts correctly
- **04:**
  - Door B is gold, the captions are correct, and both verdicts work
  - the choice locks after opening
  - designer cue combinations (order, color, stacked captions) render correctly
  - the player overlay hides the controls, and the result and debrief are correct
  - the trial log works
  - Escape and focus return work
  - the lab examples, the "Something else" category and the prompt gating work
- **Navigation and state:** all routes work, including the not-found page. State survives reload and navigation, and clearing works.
- **Layout and keyboard:** no horizontal overflow at 375px on any route. Keyboard-only play of the 04 player view works. No console errors.
- **Exchange:**
  - link validation works, and user text is escaped (no HTML injection)
  - the QR code shown on the page decodes to the exact link
  - the full-screen view traps focus and Escape returns focus
  - no overflow at 375px with a long Canva link
- **New tabs:** every outside link opens a new tab with the screen-reader label, and every link within the Sandbox stays in the same tab. Two tabs on the same challenge stay in sync. The index renders at 1280px and 375px with no overflow.

**Cache:** script and stylesheet links carry a `?v=N` version. Bump it in `index.html` after any edit, so browsers that already loaded the site fetch the new files.

**Not tested:** real phones scanning the codes, deployment to an actual https host, screen readers (VoiceOver/NVDA), Safari/Firefox, printing on physical paper, and any of the external platforms.

## Facilitator readiness checklist

(Also available as a tickable list at `#/facilitator`.)

- [ ] Host on `https://` (see Setup) and open it on a participant-type laptop and a phone.
- [ ] Press every copy button once on that setup.
- [ ] Complete the platform access checks above.
- [ ] Print copies of 05 and 06 (`#/print`) for anyone who wants to go screen-free.
- [ ] Plan the sharing moment (see `#/facilitator`) and give a heads-up about 15 minutes before it.
- [ ] From a phone, scan an Exchange QR code that opens a published Lovable app and a Canva view link, while signed out.
- [ ] On shared devices, clear saved data between participants (home page footer).
- [ ] Print the table-top kit (`#/kit`) from the live site, scan a few printed codes with a phone, and put one card on each table.
- [ ] Time a novice through one AI challenge (the 15-minute target is unverified).
- [ ] Keep `#/facilitator` off the projector before play, so objectives aren't revealed.
- [ ] Observe, don't score: activation, delight, agency, originality, transfer. Also watch for friction, abandonment, fatigue, over-reliance on AI or facilitators, and whether people have mental space. Don't claim learning gains from enjoyment alone.
