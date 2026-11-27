/* Original SVG illustrations standing in for the spec's visual references.
   Each is labeled for assistive technology with what it depicts. */
(function (S) {
  'use strict';
  let uid = 0;
  const svg = (label, vb, inner, cls) =>
    `<svg class="art ${cls || ''}" viewBox="${vb}" role="img" aria-label="${S.esc(label)}" xmlns="http://www.w3.org/2000/svg" focusable="false">${inner}</svg>`;

  /* A wooden side-view chair facing right; mirror to face left. */
  function chair(x, y, s, faceLeft, wood) {
    const t = `translate(${x} ${y}) scale(${faceLeft ? -s : s} ${s})`;
    return `<g transform="${t}" fill="${wood}">
      <rect x="0" y="0" width="7" height="112" rx="2"/>
      <rect x="0" y="12" width="7" height="6" />
      <rect x="2" y="16" width="3" height="44" opacity=".55"/>
      <rect x="-2" y="0" width="11" height="6" rx="2"/>
      <rect x="0" y="58" width="62" height="8" rx="2"/>
      <rect x="54" y="62" width="7" height="50" rx="2"/>
      <rect x="6" y="88" width="50" height="3" opacity=".6"/>
    </g>`;
  }

  S.art = {
    room(light) {
      const warm = light === 'warm';
      const id = 'r' + (++uid);
      const c = warm
        ? { wall: '#E8D2A6', floor: '#B98F5C', win: '#FFF4D6', beam: '#FFE29A', shade: '#6E4A26' }
        : { wall: '#9FB1C6', floor: '#6C7F96', win: '#EAF4FF', beam: '#D5E6FA', shade: '#2C3A4B' };
      return svg(`Illustration: a solitary empty wooden chair in a minimal room, lit by ${warm ? 'warm golden sunlight' : 'cold blue light'}`,
        '0 0 400 280', `
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.beam}" stop-opacity=".85"/><stop offset="1" stop-color="${c.beam}" stop-opacity="0"/></linearGradient></defs>
        <rect width="400" height="280" fill="${c.wall}"/>
        <rect y="196" width="400" height="84" fill="${c.floor}"/>
        <rect x="56" y="44" width="70" height="98" fill="${c.win}"/>
        <path d="M91 44v98M56 93h70" stroke="${c.wall}" stroke-width="4"/>
        <polygon points="56,142 126,142 300,250 150,262" fill="url(#${id})"/>
        <ellipse cx="236" cy="246" rx="58" ry="7" fill="${c.shade}" opacity=".35"/>
        ${chair(196, 134, 1, false, '#5A3B22')}`);
    },
    chairs(facing) {
      const toward = facing === 'toward';
      return svg(`Illustration: two empty chairs ${toward ? 'facing each other' : 'facing away from each other'}`,
        '0 0 400 280', `
        <rect width="400" height="280" fill="#E9E4DC"/>
        <rect y="198" width="400" height="82" fill="#CFC6B8"/>
        <ellipse cx="200" cy="248" rx="150" ry="8" fill="#000" opacity=".12"/>
        ${toward ? chair(96, 136, 1, false, '#5A3B22') + chair(304, 136, 1, true, '#5A3B22')
                 : chair(160, 136, 1, true, '#5A3B22') + chair(240, 136, 1, false, '#5A3B22')}`);
    },
    key() {
      const id = 'k' + (++uid);
      return svg('Illustration: an antique brass key on black velvet in a museum display', '0 0 320 240', `
        <defs><radialGradient id="${id}" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#2A2426"/><stop offset="1" stop-color="#0B0A0B"/></radialGradient></defs>
        <rect width="320" height="240" fill="url(#${id})"/>
        <g transform="rotate(-14 160 120)" fill="none" stroke="#C9A45C" stroke-width="7" stroke-linecap="round">
          <circle cx="92" cy="120" r="26"/><circle cx="92" cy="120" r="11" stroke-width="4"/>
          <path d="M118 120h116"/>
          <path d="M212 120v22h10v-12h10v18" stroke-width="6" stroke-linejoin="round"/>
          <path d="M130 112h12M130 128h12" stroke-width="4"/>
        </g>
        <rect x="128" y="204" width="64" height="14" fill="#EDE6D6" opacity=".9"/>
        <path d="M136 211h48" stroke="#0B0A0B" stroke-width="2" opacity=".5"/>`);
    },
    bottle() {
      const id = 'b' + (++uid);
      return svg('Illustration: an antique empty glass perfume bottle catching iridescent light', '0 0 320 240', `
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#9FD8E8" stop-opacity=".55"/><stop offset=".5" stop-color="#E7B6E0" stop-opacity=".35"/><stop offset="1" stop-color="#F3E3A2" stop-opacity=".5"/>
          </linearGradient>
        </defs>
        <rect width="320" height="240" fill="#0B0A0B"/>
        <path d="M120 96c-18 10-26 34-26 56 0 34 30 52 66 52s66-18 66-52c0-22-8-46-26-56z" fill="url(#${id})" stroke="#EDE6D6" stroke-opacity=".7" stroke-width="2"/>
        <rect x="142" y="72" width="36" height="26" rx="4" fill="none" stroke="#EDE6D6" stroke-opacity=".7" stroke-width="2"/>
        <path d="M148 72c0-22 24-22 24 0" fill="none" stroke="#C9A45C" stroke-width="5"/>
        <circle cx="160" cy="44" r="16" fill="none" stroke="#C9A45C" stroke-width="5"/>
        <path d="M118 128c4-12 12-20 22-24" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="160" cy="214" rx="74" ry="6" fill="#C9A45C" opacity=".18"/>`);
    },
    telephone() {
      return svg('Illustration: a vintage telephone receiver floating above a museum pedestal', '0 0 320 240', `
        <rect width="320" height="240" fill="#0B0A0B"/>
        <g transform="rotate(172 160 72)">
          <path d="M92 70c0-20 18-30 34-26l8 26c-10 4-12 10-12 14h76c0-4-2-10-12-14l8-26c16-4 34 6 34 26 0 14-10 26-24 26H116c-14 0-24-12-24-26z" fill="#1B1718" stroke="#C9A45C" stroke-width="4" stroke-linejoin="round"/>
          <path d="M104 66h18M198 66h18" stroke="#C9A45C" stroke-width="3" stroke-linecap="round"/>
        </g>
        <ellipse cx="160" cy="146" rx="46" ry="5" fill="#C9A45C" opacity=".25"/>
        <rect x="114" y="156" width="92" height="84" fill="#1E1A1B" stroke="#EDE6D6" stroke-opacity=".35"/>
        <rect x="104" y="150" width="112" height="10" fill="#EDE6D6" opacity=".85"/>`);
    },
    classroom() {
      const person = (x, y, s, body, head) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-34" r="11" fill="${head}"/><rect x="-14" y="-22" width="28" height="34" rx="12" fill="${body}"/></g>`;
      const desk = (x) => `<rect x="${x - 24}" y="214" width="48" height="6" fill="#7A5A3A"/><rect x="${x - 20}" y="220" width="4" height="22" fill="#7A5A3A"/><rect x="${x + 16}" y="220" width="4" height="22" fill="#7A5A3A"/>`;
      return svg('Illustration: adults squeezed into small desks in a colorful elementary classroom while a child stands at the blackboard', '0 0 400 280', `
        <rect width="400" height="280" fill="#F6E7C8"/>
        <rect x="0" y="242" width="400" height="38" fill="#D9B98A"/>
        <rect x="70" y="34" width="260" height="110" fill="#24443A" stroke="#8A5A2B" stroke-width="8"/>
        <text x="96" y="76" font-family="Georgia, serif" font-size="17" fill="#F1EFE6">Question 1:</text>
        <text x="96" y="104" font-family="Georgia, serif" font-size="17" fill="#F1EFE6">Why should I learn from you?</text>
        <rect x="14" y="40" width="40" height="40" fill="#E85D4A"/><rect x="346" y="40" width="40" height="40" fill="#3F7CD9"/><rect x="346" y="90" width="40" height="40" fill="#F2B632"/>
        ${person(300, 196, 0.85, '#E85D4A', '#8C5B3E')}
        ${desk(84)}${desk(200)}${desk(316)}
        ${person(84, 224, 1.25, '#3F7CD9', '#D9A77F')}${person(200, 224, 1.25, '#6B4E8C', '#5C3B2A')}${person(316, 224, 1.25, '#2F8F6B', '#E7C4A0')}`);
    },
    restaurant() {
      const letter = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-18" y="-12" width="36" height="24" fill="#FBF7EE" stroke="#8C7A5E"/><path d="M-12 -4h24M-12 2h18M-12 8h20" stroke="#2B47B8" stroke-width="1.5"/></g>`;
      return svg('Illustration: an elegant restaurant table where diners exchange handwritten letters instead of plates', '0 0 400 280', `
        <rect width="400" height="280" fill="#2A1E1E"/>
        <ellipse cx="200" cy="176" rx="170" ry="56" fill="#F3EEE3"/>
        <ellipse cx="200" cy="170" rx="170" ry="56" fill="#FBF7EE"/>
        <circle cx="70" cy="110" r="22" fill="#C99A72"/><rect x="40" y="132" width="60" height="70" rx="26" fill="#3B5E8C"/>
        <circle cx="330" cy="110" r="22" fill="#6E4A33"/><rect x="300" y="132" width="60" height="70" rx="26" fill="#8C3B4A"/>
        ${letter(150, 160, -10)}${letter(250, 166, 12)}${letter(200, 186, -3)}
        <rect x="194" y="112" width="12" height="40" fill="#F3EEE3"/><path d="M200 98c6 6 6 12 0 14-6-2-6-8 0-14z" fill="#F2B632"/>
        <rect x="168" y="214" width="64" height="40" fill="#1B1414" stroke="#C9A45C"/>
        <text x="200" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#C9A45C">MENU</text>
        <text x="200" y="244" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#F3EEE3">conversations</text>`);
    },
    birthday() {
      const gift = (x, y, col) => `<g transform="translate(${x} ${y})"><rect x="-14" y="-14" width="28" height="28" fill="${col}"/><path d="M0 -14v28M-14 0h28" stroke="#FBF7EE" stroke-width="3"/></g>`;
      return svg('Illustration: a birthday cake with lit candles at a sophisticated dinner party, with presents travelling outward from the person celebrating', '0 0 400 280', `
        <rect width="400" height="280" fill="#1D2433"/>
        <rect x="0" y="200" width="400" height="80" fill="#2B3448"/>
        <rect x="140" y="140" width="120" height="60" rx="4" fill="#F3E6D3"/>
        <rect x="140" y="160" width="120" height="8" fill="#E85D4A"/>
        ${[160, 180, 200, 220, 240].map((x) => `<rect x="${x - 2}" y="118" width="4" height="22" fill="#9FD8E8"/><path d="M${x} 106c5 5 5 10 0 12-5-2-5-7 0-12z" fill="#F2B632"/>`).join('')}
        <circle cx="200" cy="232" r="0"/>
        ${gift(70, 160, '#3F7CD9')}${gift(330, 160, '#2F8F6B')}${gift(110, 228, '#B06AB3')}${gift(290, 228, '#F2B632')}
        <path d="M150 170 L90 162M250 170 L310 162M160 196 L124 220M240 196 L276 220" stroke="#FBF7EE" stroke-width="1.5" stroke-dasharray="3 5" opacity=".7"/>`);
    }
  };
})(window.Sandbox);
