/**
 * Bespoke SVG Card Renderer for 29 (Twenty-Nine)
 * Luxury Physical Deck (Bicycle / Theory11 / Material 3 Hybrid)
 * 100% Pure Vector Inline SVG (Zero Raster Images)
 */

import { SUITS, RANKS } from './constants.js';

// High-precision vector suit paths (viewBox: 0 0 100 100, centered at 50, 50)
const SUIT_PATHS = {
  SPADES: 'M50 10 C35 32 15 50 15 68 C15 82 27 90 42 86 C40 92 36 96 28 98 L72 98 C64 96 60 92 58 86 C73 90 85 82 85 68 C85 50 65 32 50 10 Z',
  HEARTS: 'M50 88 C40 76 12 55 12 32 C12 16 26 8 40 14 C46 17 48 22 50 26 C52 22 54 17 60 14 C74 8 88 16 88 32 C88 55 60 76 50 88 Z',
  DIAMONDS: 'M50 8 L88 50 L50 92 L12 50 Z',
  CLUBS: 'M50 42 C40 42 36 34 36 26 C36 14 44 8 50 8 C56 8 64 14 64 26 C64 34 60 42 50 42 C42 42 36 40 30 46 C20 56 22 72 35 74 C42 75 48 70 50 64 C49 76 44 86 36 96 L64 96 C56 86 51 76 50 64 C52 70 58 75 65 74 C78 72 80 56 70 46 C64 40 58 42 50 42 Z'
};

export class CardRenderer {
  /**
   * Helper to render a single suit pip centered at (x, y) with rotation and scale
   */
  static renderPip(suitPath, colorHex, x, y, scale = 0.17, rot = 0) {
    return `
      <g transform="translate(${x}, ${y}) rotate(${rot}) scale(${scale}) translate(-50, -50)">
        <path d="${suitPath}" fill="${colorHex}"/>
      </g>
    `;
  }

  /**
   * Traditional Playing Card Pip Layouts for Number Cards (7, 8, 9, 10)
   */
  static renderNumberCardPips(rank, suitPath, colorHex, cardId) {
    const isNine = rank === '9';
    let pipsHTML = '';

    // Subtle inner frame border for pip grid
    const frameStroke = isNine ? '#F59E0B' : colorHex;
    const frameStrokeOpacity = isNine ? 0.75 : 0.22;
    const frameGlow = isNine ? 'filter="drop-shadow(0 0 5px rgba(245, 158, 11, 0.45))"' : '';

    const innerGridFrame = `
      <rect class="real-card-frame" x="26" y="22" width="48" height="100" rx="6" fill="none" stroke="${frameStroke}" stroke-width="${isNine ? '1.4' : '0.9'}" stroke-opacity="${frameStrokeOpacity}" ${frameGlow}/>
      <rect x="28" y="24" width="44" height="96" rx="4.5" fill="none" stroke="${frameStroke}" stroke-width="0.6" stroke-opacity="${isNine ? 0.45 : 0.12}" stroke-dasharray="3 2"/>
    `;

    // Exact traditional playing card pip coordinates (viewBox 0 0 100 144)
    // Left column: x = 32 | Right column: x = 68 | Center column: x = 50
    if (rank === '7') {
      // 7 pips: 3 left, 3 right, 1 upper-center
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 28, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 28, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 50, 48, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 72, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 72, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 116, 0.165, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 116, 0.165, 180);
    } else if (rank === '8') {
      // 8 pips: 3 left, 3 right, 2 center
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 28, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 28, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 50, 50, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 72, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 72, 0.165, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 50, 94, 0.165, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 116, 0.165, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 116, 0.165, 180);
    } else if (rank === '9') {
      // 9 pips: 4 left, 4 right, 1 prominent center pip (2 pts honor card in 29!)
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 28, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 28, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 50, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 50, 0.16, 0);
      // Large center pip with gold accent ring
      pipsHTML += `
        <circle cx="50" cy="72" r="14" fill="none" stroke="#F59E0B" stroke-width="0.9" stroke-opacity="0.45" stroke-dasharray="2 2"/>
        ${CardRenderer.renderPip(suitPath, colorHex, 50, 72, 0.22, 0)}
      `;
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 94, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 94, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 116, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 116, 0.16, 180);
    } else if (rank === '10') {
      // 10 pips: 4 left, 4 right, 2 center
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 28, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 28, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 50, 39, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 52, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 52, 0.16, 0);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 92, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 92, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 50, 105, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 32, 116, 0.16, 180);
      pipsHTML += CardRenderer.renderPip(suitPath, colorHex, 68, 116, 0.16, 180);
    }

    return `
      <g class="card-pips-field">
        ${innerGridFrame}
        ${pipsHTML}
      </g>
    `;
  }

  /**
   * Double-Headed Mirrored Royal Court Cards (Jack, Queen, King)
   */
  static renderCourtCard(rank, suitPath, colorHex, cardId) {
    const isJack = rank === 'J';
    const isQueen = rank === 'Q';
    const isKing = rank === 'K';

    // Luxury Court Frame colors
    const frameBorderColor = isJack ? '#D97706' : (isKing ? '#B45309' : '#9333EA');
    const accentGold = '#F59E0B';

    // Figure-specific top-half illustration (centered in x: 20..80, y: 19..72)
    let figureHalfSVG = '';

    if (isJack) {
      // Jack: Royal Halberd/Spear + Gold Prince Crown + Shield with Suit Emblem
      figureHalfSVG = `
        <!-- Halberd/Spear (Left) -->
        <line x1="28" y1="21" x2="28" y2="72" stroke="#92400E" stroke-width="1.6"/>
        <path d="M28 20 L23 26 L28 24 L33 26 Z" fill="${accentGold}" stroke="#78350F" stroke-width="0.7"/>
        <path d="M28 24 C34 24 36 29 36 34 L28 32 Z" fill="${colorHex}" fill-opacity="0.3" stroke="${colorHex}" stroke-width="0.8"/>

        <!-- Gold Prince Crown -->
        <path d="M42 27 L44 22 L50 24 L56 22 L58 27 Z" fill="${accentGold}" stroke="#B45309" stroke-width="0.9"/>
        <circle cx="50" cy="23" r="1.3" fill="#D97706"/>
        <circle cx="44" cy="21.5" r="1" fill="#EF4444"/>
        <circle cx="56" cy="21.5" r="1" fill="#EF4444"/>

        <!-- Prince Bust & Hair -->
        <path d="M42 30 C39 36 40 43 43 47 L57 47 C60 43 61 36 58 30 Z" fill="#F8FAFC" stroke="${colorHex}" stroke-width="1.1"/>
        <circle cx="50" cy="34" r="5.5" fill="#FFFFFF" stroke="${colorHex}" stroke-width="0.9"/>
        <path d="M47 37 Q50 40 53 37" fill="none" stroke="${colorHex}" stroke-width="0.9" stroke-linecap="round"/>

        <!-- Royal Armor / Tunic -->
        <path d="M38 47 L50 54 L62 47 L66 72 L34 72 Z" fill="${colorHex}" fill-opacity="0.18" stroke="${colorHex}" stroke-width="1.2"/>
        <path d="M44 47 L50 60 L56 47" stroke="${accentGold}" stroke-width="1.2" fill="none"/>

        <!-- Shield with Suit Emblem (Right) -->
        <path d="M62 45 L74 45 L74 58 C74 65 68 69 68 69 C68 69 62 65 62 58 Z" fill="#FFFFFF" stroke="${accentGold}" stroke-width="1.3" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.15))"/>
        <g transform="translate(68, 55) scale(0.12) translate(-50, -50)">
          <path d="${suitPath}" fill="${colorHex}"/>
        </g>
      `;
    } else if (isQueen) {
      // Queen: Detailed Sovereign Tiara + Tudor Rose/Scepter + Mirrored Geometric Portrait
      figureHalfSVG = `
        <!-- Sovereign Tiara -->
        <path d="M40 25 L42 19 L47 23 L50 17 L53 23 L58 19 L60 25 Z" fill="${accentGold}" stroke="#B45309" stroke-width="0.9"/>
        <circle cx="42" cy="18.5" r="1.1" fill="${colorHex}"/>
        <circle cx="50" cy="16.5" r="1.4" fill="#EF4444"/>
        <circle cx="58" cy="18.5" r="1.1" fill="${colorHex}"/>

        <!-- Queen Veil & Face -->
        <path d="M37 28 C35 38 37 50 41 58 L59 58 C63 50 65 38 63 28 Z" fill="#F8FAFC" stroke="${colorHex}" stroke-width="1.1"/>
        <circle cx="50" cy="34" r="5.2" fill="#FFFFFF" stroke="${colorHex}" stroke-width="0.9"/>
        <path d="M47 37 Q50 39.5 53 37" fill="none" stroke="${colorHex}" stroke-width="0.8" stroke-linecap="round"/>

        <!-- Tudor Rose / Scepter (Left) -->
        <line x1="31" y1="36" x2="31" y2="72" stroke="${accentGold}" stroke-width="1.5"/>
        <circle cx="31" cy="34" r="4.5" fill="#EF4444" stroke="#991B1B" stroke-width="0.8"/>
        <circle cx="31" cy="34" r="2.2" fill="#FDE293"/>

        <!-- Ermine Robe & Suit Medallion (Right) -->
        <path d="M40 46 L50 53 L60 46 L67 72 L33 72 Z" fill="${colorHex}" fill-opacity="0.15" stroke="${colorHex}" stroke-width="1.2"/>
        <path d="M45 50 L50 58 L55 50" stroke="${accentGold}" stroke-width="1" fill="none"/>
        <circle cx="67" cy="52" r="6" fill="#FFFFFF" stroke="${accentGold}" stroke-width="1"/>
        <g transform="translate(67, 52) scale(0.11) translate(-50, -50)">
          <path d="${suitPath}" fill="${colorHex}"/>
        </g>
      `;
    } else if (isKing) {
      // King: Imperial Cross Crown + Broadsword + Mirrored Royal Crest
      figureHalfSVG = `
        <!-- Imperial Cross Crown -->
        <path d="M37 26 L39 18 L45 22 L50 15 L55 22 L61 18 L63 26 Z" fill="${accentGold}" stroke="#B45309" stroke-width="1"/>
        <line x1="50" y1="11" x2="50" y2="15" stroke="#B45309" stroke-width="1.3"/>
        <line x1="47.5" y1="13" x2="52.5" y2="13" stroke="#B45309" stroke-width="1.3"/>
        <circle cx="39" cy="17.5" r="1.1" fill="#EF4444"/>
        <circle cx="61" cy="17.5" r="1.1" fill="#EF4444"/>

        <!-- King Regal Face & Beard -->
        <circle cx="50" cy="33" r="5.8" fill="#FFFFFF" stroke="${colorHex}" stroke-width="1"/>
        <path d="M43 33 L50 44 L57 33 Z" fill="${colorHex}" fill-opacity="0.25" stroke="${colorHex}" stroke-width="1"/>
        <path d="M46 32 Q50 35 54 32" stroke="${colorHex}" stroke-width="0.9" fill="none"/>

        <!-- Broadsword (Left) -->
        <line x1="29" y1="22" x2="29" y2="70" stroke="#64748B" stroke-width="2"/>
        <path d="M29 20 L26 24 L32 24 Z" fill="#94A3B8" stroke="#475569" stroke-width="0.8"/>
        <line x1="24" y1="28" x2="34" y2="28" stroke="${accentGold}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="29" cy="32" r="1.6" fill="#B45309"/>

        <!-- Ermine Mantle & Royal Crest (Right) -->
        <path d="M36 45 L50 53 L64 45 L70 72 L30 72 Z" fill="${colorHex}" fill-opacity="0.2" stroke="${colorHex}" stroke-width="1.3"/>
        <circle cx="65" cy="53" r="6.5" fill="#FFFFFF" stroke="${accentGold}" stroke-width="1.2"/>
        <g transform="translate(65, 53) scale(0.12) translate(-50, -50)">
          <path d="${suitPath}" fill="${colorHex}"/>
        </g>
      `;
    }

    return `
      <g class="court-card-container">
        <defs>
          <!-- Ornate Guilloche Hatch Background Pattern -->
          <pattern id="guilloche-${cardId}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="${colorHex}" stroke-width="0.5" stroke-opacity="0.08"/>
            <line x1="3" y1="0" x2="3" y2="6" stroke="${accentGold}" stroke-width="0.4" stroke-opacity="0.06"/>
          </pattern>
        </defs>

        <!-- Ornate Outer Court Border -->
        <rect class="real-card-frame" x="26" y="22" width="48" height="100" rx="5" fill="none" stroke="${frameBorderColor}" stroke-width="${isJack ? '1.5' : '1.2'}" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.1))"/>
        <rect x="27.5" y="23.5" width="45" height="97" rx="4" fill="url(#guilloche-${cardId})"/>
        <rect x="28.5" y="24.5" width="43" height="95" rx="3.5" fill="none" stroke="${accentGold}" stroke-width="0.8" stroke-opacity="0.5" stroke-dasharray="3 2"/>

        <!-- Top Half (Direct) -->
        <g id="court-top-${cardId}">
          ${figureHalfSVG}
        </g>

        <!-- Bottom Half (100% Mathematically Mirrored 180deg about center 50, 72) -->
        <use href="#court-top-${cardId}" transform="rotate(180, 50, 72)"/>

        <!-- Center Mirrored Dividing Line -->
        <line x1="19.5" y1="72" x2="80.5" y2="72" stroke="${accentGold}" stroke-width="1.2" stroke-dasharray="2 2"/>
        <circle cx="50" cy="72" r="3" fill="#FFFFFF" stroke="${accentGold}" stroke-width="1.2"/>
        <circle cx="50" cy="72" r="1.2" fill="${colorHex}"/>
      </g>
    `;
  }

  /**
   * Master Ace: Oversized Ornate Central Suit Pip with Filigree Inner Pattern
   */
  static renderAceMaster(suitPath, colorHex, cardId) {
    return `
      <g class="ace-master-container">
        <!-- Ornate Ace Inner Border -->
        <rect class="real-card-frame" x="26" y="22" width="48" height="100" rx="6" fill="none" stroke="${colorHex}" stroke-width="1.1" stroke-opacity="0.35"/>
        <rect x="28" y="24" width="44" height="96" rx="4" fill="none" stroke="${colorHex}" stroke-width="0.6" stroke-opacity="0.18" stroke-dasharray="3 3"/>

        <!-- Corner Flourishes -->
        <path d="M21 27 C25 27 27 25 27 21" fill="none" stroke="${colorHex}" stroke-width="0.9" opacity="0.4"/>
        <path d="M79 27 C75 27 73 25 73 21" fill="none" stroke="${colorHex}" stroke-width="0.9" opacity="0.4"/>
        <path d="M21 117 C25 117 27 119 27 123" fill="none" stroke="${colorHex}" stroke-width="0.9" opacity="0.4"/>
        <path d="M79 117 C75 117 73 119 73 123" fill="none" stroke="${colorHex}" stroke-width="0.9" opacity="0.4"/>

        <!-- Concentric Filigree Sunburst Rings -->
        <circle cx="50" cy="72" r="38" fill="none" stroke="${colorHex}" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.25"/>
        <circle cx="50" cy="72" r="30" fill="none" stroke="${colorHex}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.35"/>
        <circle cx="50" cy="72" r="22" fill="${colorHex}" fill-opacity="0.05" stroke="${colorHex}" stroke-width="0.8" opacity="0.3"/>

        <!-- Grand Oversized Central Suit Pip (scale: 0.54) -->
        <g transform="translate(50, 72) scale(0.54) translate(-50, -50)">
          <!-- Drop shadow on grand pip -->
          <path d="${suitPath}" fill="${colorHex}" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.3))"/>
          
          <!-- Ornate Filigree Inner Engraving Lines inside the Ace -->
          <g fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.75">
            <circle cx="50" cy="50" r="12" stroke-dasharray="2 2" stroke-width="1.2"/>
            <circle cx="50" cy="50" r="5" fill="#FFFFFF" fill-opacity="0.85"/>
            <path d="M50 24 L50 36 M50 64 L50 76 M32 50 L42 50 M58 50 L68 50" stroke-width="1.4"/>
          </g>
        </g>
      </g>
    `;
  }

  /**
   * Generates the high-contrast luxury SVG string for the face of a card
   */
  static renderFaceSVG(card) {
    const suitObj = SUITS[card.suit] || { color: 'black' };
    const rankObj = RANKS[card.rank] || { id: card.rank || '?', points: card.points || 0 };
    const colorHex = suitObj.color === 'red' ? '#E11D48' : '#0F172A';
    const suitPath = SUIT_PATHS[card.suit] || SUIT_PATHS.SPADES;
    const cardId = card.id || `card_${Math.random()}`;

    // Select specific rendering engine based on traditional rank category
    let centerArtworkSVG = '';
    const rank = card.rank;

    if (rank === 'A') {
      centerArtworkSVG = CardRenderer.renderAceMaster(suitPath, colorHex, cardId);
    } else if (rank === 'J' || rank === 'Q' || rank === 'K') {
      centerArtworkSVG = CardRenderer.renderCourtCard(rank, suitPath, colorHex, cardId);
    } else {
      // Traditional Number Cards (7, 8, 9, 10)
      centerArtworkSVG = CardRenderer.renderNumberCardPips(rank, suitPath, colorHex, cardId);
    }

    // Point badge moved to top-right corner pill in DOM & CSS (.card-point-badge)
    const pointsBadgeSVG = '';

    return `
      <svg class="card-svg card-front" viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg">
        <!-- Crisp Card Base Surface -->
        <rect x="1" y="1" width="98" height="142" rx="12" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.4"/>
        
        <!-- Elegant Outer Tint Margin Border -->
        <rect x="4.5" y="4.5" width="91" height="135" rx="9" fill="none" stroke="${colorHex}" stroke-width="0.8" stroke-opacity="0.3"/>

        <!-- Top-Left Corner Index (Bold Rank + Crisp Suit Pip) -->
        <g class="corner-index corner-top card-corner top-left" transform="translate(8, 6)">
          <text x="0" y="14" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="900" fill="${colorHex}" text-anchor="middle">${rankObj.id}</text>
          <g transform="translate(0, 22) scale(0.12) translate(-50, -50)">
            <path d="${suitPath}" fill="${colorHex}"/>
          </g>
        </g>

        <!-- Center Artwork Canvas (Pip Layouts / Mirrored Courts / Ace Master) -->
        <g class="card-center-art">
          ${centerArtworkSVG}
        </g>

        <!-- Sleek Non-Intrusive Bottom Micro-Pill -->
        ${pointsBadgeSVG}

        <!-- Bottom-Right Corner Index (Inverted 180deg) -->
        <g class="corner-index corner-bottom" transform="translate(89.5, 136) rotate(180)">
          <text x="0" y="14" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="900" fill="${colorHex}" text-anchor="middle">${rankObj.id}</text>
          <g transform="translate(0, 22) scale(0.12) translate(-50, -50)">
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

    const pointBadgeHTML = card.points > 0 ? `<div class="card-point-badge">${card.points} pt</div>` : '';

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front-wrapper">
          ${this.renderFaceSVG(card)}
          ${pointBadgeHTML}
        </div>
        <div class="card-face card-back-wrapper">
          ${this.renderBackSVG(isTrumpLocked)}
        </div>
      </div>
    `;

    return cardEl;
  }
}
