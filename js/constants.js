/**
 * Constants & Rules for 29 (Twenty-Nine) Card Game
 * Full Bilingual Support (English & বাংলা)
 */

export const SUITS = {
  SPADES: { 
    id: 'SPADES', 
    symbol: '♠', 
    nameEn: 'Spades', 
    nameBn: 'ইসকাপণ', 
    color: 'black' 
  },
  HEARTS: { 
    id: 'HEARTS', 
    symbol: '♥', 
    nameEn: 'Hearts', 
    nameBn: 'হরতন', 
    color: 'red' 
  },
  CLUBS: { 
    id: 'CLUBS', 
    symbol: '♣', 
    nameEn: 'Clubs', 
    nameBn: 'চিড়িতন', 
    color: 'black' 
  },
  DIAMONDS: { 
    id: 'DIAMONDS', 
    symbol: '♦', 
    nameEn: 'Diamonds', 
    nameBn: 'রুইতন', 
    color: 'red' 
  }
};

export const SUIT_ORDER = ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'];

const RANK_DEFINITIONS = {
  'J':  { id: 'J',  nameEn: 'Jack',  nameBn: 'গোলাম (J)', power: 8, points: 3 },
  '9':  { id: '9',  nameEn: '9',     nameBn: 'নহলা (9)',   power: 7, points: 2 },
  'A':  { id: 'A',  nameEn: 'Ace',   nameBn: 'টেক্কা (A)', power: 6, points: 1 },
  '10': { id: '10', nameEn: '10',    nameBn: 'দহলা (10)',  power: 5, points: 1 },
  'K':  { id: 'K',  nameEn: 'King',  nameBn: 'সাহেব (K)', power: 4, points: 0 },
  'Q':  { id: 'Q',  nameEn: 'Queen', nameBn: 'বিবি (Q)',   power: 3, points: 0 },
  '8':  { id: '8',  nameEn: '8',     nameBn: 'আট (8)',     power: 2, points: 0 },
  '7':  { id: '7',  nameEn: '7',     nameBn: 'সাত (7)',    power: 1, points: 0 }
};

export const RANKS = {
  ...RANK_DEFINITIONS,
  JACK:  RANK_DEFINITIONS['J'],
  NINE:  RANK_DEFINITIONS['9'],
  ACE:   RANK_DEFINITIONS['A'],
  TEN:   RANK_DEFINITIONS['10'],
  KING:  RANK_DEFINITIONS['K'],
  QUEEN: RANK_DEFINITIONS['Q'],
  EIGHT: RANK_DEFINITIONS['8'],
  SEVEN: RANK_DEFINITIONS['7']
};

export const RANK_ORDER = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];

export const PRESET_AVATARS = [
  { id: 'lion', label: 'Lion King', icon: '🦁' },
  { id: 'crown', label: 'Monarch', icon: '👑' },
  { id: 'wolf', label: 'Dire Wolf', icon: '🐺' },
  { id: 'fox', label: 'Sly Fox', icon: '🦊' },
  { id: 'ninja', label: 'Ninja', icon: '🥷' },
  { id: 'wizard', label: 'Wizard', icon: '🧙' },
  { id: 'bot', label: 'Cyber AI', icon: '🤖' },
  { id: 'tiger', label: 'Tiger', icon: '🐯' }
];

export const DEFAULT_PLAYER_AVATARS = {
  0: '🦁',
  1: '🦊',
  2: '🤖',
  3: '🐺'
};

export const PLAYERS = [
  { id: 0, key: 'SOUTH', nameEn: 'Saikot', nameBn: 'সইকত', isHuman: true, team: 1 },
  { id: 1, key: 'EAST',  nameEn: 'Sophia (East)', nameBn: 'সোফিয়া (পূর্ব)', isHuman: false, team: 2 },
  { id: 2, key: 'NORTH', nameEn: 'Arthur (Partner)', nameBn: 'আর্থার (পার্টনার)', isHuman: false, team: 1 },
  { id: 3, key: 'WEST',  nameEn: 'Marcus (West)', nameBn: 'মার্কাস (পশ্চিম)', isHuman: false, team: 2 }
];

export const TEAMS = {
  TEAM_1: { id: 1, nameEn: 'Saikot & Arthur', nameBn: 'সইকত ও আর্থার', playerIds: [0, 2], color: 'var(--primary-accent)' },
  TEAM_2: { id: 2, nameEn: 'Sophia & Marcus', nameBn: 'সোফিয়া ও মার্কাস', playerIds: [1, 3], color: 'var(--secondary-accent)' }
};

export const GAME_PHASES = {
  IDLE: 'IDLE',
  DEALING_PHASE_1: 'DEALING_PHASE_1',     // 4 cards each
  BIDDING: 'BIDDING',                     // 16 to 28 / Pass
  TRUMP_SELECTION: 'TRUMP_SELECTION',     // Winner chooses trump or 7th card
  DEALING_PHASE_2: 'DEALING_PHASE_2',     // Remaining 4 cards each
  CHALLENGE: 'CHALLENGE',                 // Double / Redouble window
  PLAYING: 'PLAYING',                     // 8 tricks
  TRICK_RESOLVING: 'TRICK_RESOLVING',     // Brief pause showing trick winner
  ROUND_OVER: 'ROUND_OVER',               // Ledger update & game point
  MATCH_OVER: 'MATCH_OVER'                // Target points achieved
};

export const BID_RULES = {
  MIN_BID: 16,
  MAX_BID: 28,
  PASS_VALUE: 0
};

export const SETTINGS_DEFAULTS = {
  language: 'en',                  // 'en' (English) default
  turnDirection: 'anti-clockwise', // South -> East -> North -> West (Bangladeshi standard)
  lastTrickPoint: true,            // 28 + 1 = 29
  highBidDoublePoints: true,       // Bids >= 21 earn 2 game points automatically
  matchPointsToWin: 6,             // First to 6 red game points
  soundEnabled: true,
  aiSpeed: 700                     // ms between AI actions
};
