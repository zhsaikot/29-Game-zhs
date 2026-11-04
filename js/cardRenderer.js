/**
 * Bespoke SVG Card Renderer for 29 (Twenty-Nine)
 * Pure Inline High-Contrast Vector SVG Cards (Zero Raster Images)
 */

import { SUITS, RANKS } from './constants.js';

// Crisp high-contrast vector suit paths (viewBox: 0 0 100 100)
const SUIT_PATHS = {
  SPADES: 'M50 10 C35 32 15 50 15 68 C15 82 27 90 42 86 C40 92 36 96 28 98 L72 98 C64 96 60 92 58 86 C73 90 85 82 85 68 C85 50 65 32 50 10 Z',
  HEARTS: 'M50 88 C40 76 12 55 12 32 C12 16 26 8 40 14 C46 17 48 22 50 26 C52 22 54 17 60 14 C74 8 88 16 88 32 C88 55 60 76 50 88 Z',
  DIAMONDS: 'M50 8 L88 50 L50 92 L12 50 Z',
  CLUBS: 'M50 42 C40 42 36 34 36 26 C36 14 44 8 50 8 C56 8 64 14 64 26 C64 34 60 42 50 42 C42 42 36 40 30 46 C20 56 22 72 35 74 C42 75 48 70 50 64 C49 76 44 86 36 96 L64 96 C56 86 51 76 50 64 C52 70 58 75 65 74 C78 72 80 56 70 46 C64 40 58 42 50 42 Z'
};

// High-contrast, bold central vector emblems
const EMBLEMS = {
  J: (color) => `
    <g class="emblem emblem-jack" fill="none" stroke="${color}" stroke-width="2.6" opacity="0.92">
      <!-- Shield Base -->
      <path d="M50 18 L72 32 L66 60 L50 80 L34 60 L28 32 Z" fill="${color}" fill-opacity="0.12"/>
      <!-- Inner Knight Crest -->
      <path d="M38 34 L50 24 L62 34 L58 54 L50 62 L42 54 Z" stroke-width="2.2" fill="${color}" fill-opacity="0.2"/>
      <circle cx="50" cy="40" r="4" fill="${color}"/>
      <!-- Crown points -->
      <path d="M32 24 L50 12 L68 24" stroke-linecap="round" stroke-width="2.4"/>
      <circle cx="32" cy="22" r="3" fill="${color}"/>
      <circle cx="50" cy="10" r="3.5" fill="${color}"/>
      <circle cx="68" cy="22" r="3" fill="${color}"/>
      <!-- Crossguard -->
      <line x1="38" y1="70" x2="62" y2="70" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="64" x2="50" y2="76" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `,
  9: (color) => `
    <g class="emblem emblem-nine" fill="none" stroke="${color}" stroke-width="2.4" opacity="0.9">
      <!-- 9-Point Starburst Geometric Compass -->
      <polygon points="50,16 60,34 80,38 64,52 69,72 50,61 31,72 36,52 20,38 40,34" fill="${color}" fill-opacity="0.12"/>
      <circle cx="50" cy="46" r="12" stroke-width="2" fill="${color}" fill-opacity="0.16"/>
      <circle cx="50" cy="46" r="5" fill="${color}"/>
      <circle cx="50" cy="46" r="22" stroke-dasharray="3 3" stroke-width="1.4"/>
    </g>
  `,
  A: (color, suitPath) => `
    <g class="emblem emblem-ace" opacity="0.95">
      <!-- Grand Radiant Halo -->
      <circle cx="50" cy="48" r="36" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 3" opacity="0.5"/>
      <circle cx="50" cy="48" r="28" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="1.5"/>
      <g transform="translate(24, 22) scale(0.52)">
        <path d="${suitPath}" fill="${color}" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.25))"/>
      </g>
    </g>
  `,
  10: (color) => `
    <g class="emblem emblem-ten" fill="none" stroke="${color}" stroke-width="2.4" opacity="0.92">
      <rect x="26" y="20" width="48" height="56" rx="8" fill="${color}" fill-opacity="0.1" stroke-width="2"/>
      <rect x="30" y="24" width="40" height="48" rx="6" stroke-dasharray="2 3" stroke-width="1.2"/>
      <text x="50" y="56" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="${color}" text-anchor="middle" letter-spacing="1">10</text>
    </g>
  `,
  K: (color) => `
    <g class="emblem emblem-king" fill="none" stroke="${color}" stroke-width="2.6" opacity="0.92">
      <!-- King Coronation Crown -->
      <path d="M26 66 L74 66 L70 32 L58 44 L50 22 L42 44 L30 32 Z" fill="${color}" fill-opacity="0.14"/>
      <circle cx="30" cy="30" r="3" fill="${color}"/>
      <circle cx="50" cy="20" r="4" fill="${color}"/>
      <circle cx="70" cy="30" r="3" fill="${color}"/>
      <line x1="28" y1="58" x2="72" y2="58" stroke-width="2"/>
      <rect x="34" y="68" width="32" height="7" rx="2" fill="${color}" fill-opacity="0.25"/>
    </g>
  `,
  Q: (color) => `
    <g class="emblem emblem-queen" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.92">
      <!-- Queen Jewel Tiara -->
      <path d="M28 64 L72 64 L68 36 L57 46 L50 30 L43 46 L32 36 Z" fill="${color}" fill-opacity="0.12"/>
      <circle cx="50" cy="28" r="3.5" fill="${color}"/>
      <circle cx="32" cy="34" r="2.8" fill="${color}"/>
      <circle cx="68" cy="34" r="2.8" fill="${color}"/>
      <ellipse cx="50" cy="54" rx="12" ry="7" stroke-width="1.8" fill="${color}" fill-opacity="0.2"/>
      <circle cx="50" cy="54" r="3.5" fill="${color}"/>
    </g>
  `,
  DEFAULT: (color, suitPath) => `
    <g class="emblem emblem-default" opacity="0.9">
      <g transform="translate(30, 28) scale(0.4)">
        <path d="${suitPath}" fill="${color}"/>
      </g>
    </g>
  `
};

export class CardRenderer {
  /**
   * Generates the high-contrast SVG string for the face of a card
   */
  static renderFaceSVG(card) {
    const suitObj = SUITS[card.suit] || { color: 'black' };
    const rankObj = RANKS[card.rank] || { id: card.rank || '?', points: card.points || 0 };
    const colorHex = suitObj.color === 'red' ? '#E11D48' : '#0F172A';
    const suitPath = SUIT_PATHS[card.suit] || SUIT_PATHS.SPADES;
    
    const emblemFn = EMBLEMS[card.rank] || EMBLEMS.DEFAULT;
    const emblemSVG = (card.rank === 'A' || !EMBLEMS[card.rank]) 
      ? emblemFn(colorHex, suitPath) 
      : emblemFn(colorHex);

    return `
      <svg class="card-svg card-front" viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg">
        <!-- Crisp Card Base Surface -->
        <rect x="1" y="1" width="98" height="142" rx="12" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.4"/>
        
        <!-- Elegant Inner Border -->
        <rect x="4.5" y="4.5" width="91" height="135" rx="9" fill="none" stroke="${colorHex}" stroke-width="1" stroke-opacity="0.25"/>

        <!-- Top-Left Corner Index (Bold Rank + Crisp Suit Pip) -->
        <g class="corner-index corner-top" transform="translate(7.5, 9)">
          <text x="0" y="15" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16.5" font-weight="900" fill="${colorHex}">${rankObj.id}</text>
          <g transform="translate(-0.5, 18) scale(0.145)">
            <path d="${suitPath}" fill="${colorHex}"/>
          </g>
        </g>

        <!-- Centered Artwork & Emblem -->
        <g class="card-center-art" transform="translate(0, 18)">
          ${emblemSVG}
        </g>

        <!-- Points Badge if non-zero -->
        ${rankObj.points > 0 ? `
          <g class="card-points-tag" transform="translate(50, 114)">
            <rect x="-16" y="-7.5" width="32" height="15" rx="7.5" fill="${colorHex}" fill-opacity="0.12" stroke="${colorHex}" stroke-width="1.1" stroke-opacity="0.45"/>
            <text x="0" y="3.5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" fill="${colorHex}" text-anchor="middle">${rankObj.points} pt</text>
          </g>
        ` : ''}

        <!-- Bottom-Right Corner Index (Inverted 180deg) -->
        <g class="corner-index corner-bottom" transform="translate(92.5, 135) rotate(180)">
          <text x="0" y="15" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16.5" font-weight="900" fill="${colorHex}">${rankObj.id}</text>
          <g transform="translate(-0.5, 18) scale(0.145)">
            <path d="${suitPath}" fill="${colorHex}"/>
          </g>
        </g>
      </svg>
    `;
  }

  /**
   * Generates the SVG string for the back of a card (Geometric Pattern)
   */
  static renderBackSVG(isTrumpMystery = false) {
    const accentColor = isTrumpMystery ? '#FDE293' : '#60A5FA';
    const primaryBg = isTrumpMystery ? '#281E0F' : '#0B132B';
    const patternStroke = isTrumpMystery ? 'rgba(253, 226, 147, 0.45)' : 'rgba(96, 165, 250, 0.45)';

    return `
      <svg class="card-svg card-back ${isTrumpMystery ? 'trump-mystery-back' : ''}" viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="card-pattern-${isTrumpMystery ? 'trump' : 'deck'}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="${primaryBg}"/>
            <path d="M 0 0 L 12 12 M 12 0 L 0 12" stroke="${patternStroke}" stroke-width="1.1"/>
            <circle cx="6" cy="6" r="1.8" fill="${accentColor}" opacity="0.7"/>
          </pattern>
          <radialGradient id="card-back-vignette-${isTrumpMystery ? 'trump' : 'deck'}" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="rgba(30, 58, 138, 0.45)"/>
            <stop offset="100%" stop-color="rgba(11, 15, 23, 0.98)"/>
          </radialGradient>
        </defs>

        <!-- Card Frame -->
        <rect x="1" y="1" width="98" height="142" rx="12" fill="${primaryBg}" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.4"/>
        
        <!-- Pattern Fill with Margin -->
        <rect x="5" y="5" width="90" height="134" rx="8" fill="url(#card-pattern-${isTrumpMystery ? 'trump' : 'deck'})"/>
        <rect x="5" y="5" width="90" height="134" rx="8" fill="url(#card-back-vignette-${isTrumpMystery ? 'trump' : 'deck'})" opacity="0.85"/>
        
        <!-- Inner Border Line -->
        <rect x="8" y="8" width="84" height="128" rx="6" fill="none" stroke="${accentColor}" stroke-width="1.4" stroke-opacity="0.8" stroke-dasharray="4 2"/>

        <!-- Center Emblem / Seal -->
        <g class="back-center-seal" transform="translate(50, 72)">
          <circle cx="0" cy="0" r="22" fill="#131B26" stroke="${accentColor}" stroke-width="1.8" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.7))"/>
          <circle cx="0" cy="0" r="18" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.6"/>
          
          ${isTrumpMystery ? `
            <path d="M-6 -2 L-6 -8 C-6 -12 6 -12 6 -8 L6 -2 Z" fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round"/>
            <rect x="-8" y="-2" width="16" height="13" rx="3" fill="${accentColor}"/>
            <circle cx="0" cy="4" r="2" fill="#131B26"/>
            <line x1="0" y1="5" x2="0" y2="8" stroke="#131B26" stroke-width="1.6"/>
          ` : `
            <text x="0" y="6" font-family="'JetBrains Mono', monospace" font-size="14.5" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="-0.5">29</text>
          `}
        </g>
      </svg>
    `;
  }

  /**
   * Creates a full interactive Card DOM element with 3D flip structure
   */
  static createCardElement(card, options = {}) {
    const { isDimmed = false, isFaceUp = true, isTrumpLocked = false } = options;
    const cardEl = document.createElement('div');
    cardEl.className = 'playing-card';
    cardEl.dataset.id = card.id;
    cardEl.dataset.suit = card.suit;
    cardEl.dataset.rank = card.rank;
    cardEl.dataset.power = card.power;
    cardEl.dataset.points = card.points;

    if (isDimmed) {
      cardEl.classList.add('dimmed');
    }
    if (!isFaceUp) {
      cardEl.classList.add('face-down');
    }
    if (isTrumpLocked) {
      cardEl.classList.add('trump-locked');
    }

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front-wrapper">
          ${this.renderFaceSVG(card)}
        </div>
        <div class="card-face card-back-wrapper">
          ${this.renderBackSVG(isTrumpLocked)}
        </div>
      </div>
    `;

    return cardEl;
  }
}
