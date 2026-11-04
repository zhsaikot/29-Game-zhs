/**
 * Core 29 (Twenty-Nine) Game State Machine & Rules Engine
 * 100% Authentic South Asian / Bangladeshi Rules - Perfect Edition
 */

import { SUITS, RANKS, RANK_ORDER, PLAYERS, TEAMS, GAME_PHASES, BID_RULES, SETTINGS_DEFAULTS } from './constants.js';

export class GameState {
  constructor(customSettings = {}) {
    this.settings = { ...SETTINGS_DEFAULTS, ...customSettings };
    
    // Overall Match Scores (Red vs Black Points)
    this.matchScores = {
      team1: 0, // South & North (You & Kabir)
      team2: 0  // East & West (Rahim & Karim)
    };

    // Current Round State
    this.roundNumber = 1;
    this.dealerIndex = 3; // West deals first -> South starts bidding in anti-clockwise
    this.currentPhase = GAME_PHASES.IDLE;

    // Deck & Hands
    this.deck = [];
    this.hands = [[], [], [], []]; // 4 players
    
    // Bidding
    this.highestBid = 0;
    this.highestBidder = null;
    this.currentBidder = null;
    this.activeBidders = new Set([0, 1, 2, 3]);
    this.biddingHistory = [];

    // Trump & Marriage
    this.trumpSuit = null;
    this.lockedTrumpCard = null; // Card placed face-down on table
    this.isTrumpRevealed = false;
    this.trumpRevealedBy = null;
    this.trumpRevealedInTrick = null;
    this.trumpRevealedAtPlayCount = null; // Number of cards in trick when revealed
    this.isSeventhCardTrump = false;
    this.marriageClaimed = {
      team1: false,
      team2: false
    };

    // Challenge Multipliers
    this.challengeMultiplier = 1;
    this.doubledByTeam = null;
    this.redoubledByTeam = null;

    // Tricks
    this.trickNumber = 1; // 1 to 8
    this.currentTurn = 0;
    this.leadSuit = null;
    this.currentTrick = []; // [{ playerId, card, isTrumpPlay }]
    this.tricksHistory = [];
    
    // Points in Current Round
    this.teamPoints = {
      team1: 0,
      team2: 0
    };

    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  createDeck() {
    const deck = [];
    let idCounter = 1;
    for (const suitKey of Object.keys(SUITS)) {
      for (const rankKey of RANK_ORDER) {
        deck.push({
          id: `card_${idCounter++}`,
          suit: suitKey,
          rank: RANKS[rankKey].id,
          power: RANKS[rankKey].power,
          points: RANKS[rankKey].points
        });
      }
    }
    return deck;
  }

  shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  getNextPlayer(currentIndex) {
    if (this.settings.turnDirection === 'clockwise') {
      return (currentIndex + 3) % 4;
    } else {
      // Bangladeshi Standard: Anti-clockwise: South(0) -> East(1) -> North(2) -> West(3)
      return (currentIndex + 1) % 4;
    }
  }

  startNewRound() {
    this.deck = this.shuffle(this.createDeck());
    this.hands = [[], [], [], []];
    
    this.highestBid = 0;
    this.highestBidder = null;
    this.activeBidders = new Set([0, 1, 2, 3]);
    this.biddingHistory = [];

    this.trumpSuit = null;
    this.lockedTrumpCard = null;
    this.isTrumpRevealed = false;
    this.trumpRevealedBy = null;
    this.trumpRevealedInTrick = null;
    this.trumpRevealedAtPlayCount = null;
    this.isSeventhCardTrump = false;
    this.marriageClaimed = { team1: false, team2: false };

    this.challengeMultiplier = 1;
    this.doubledByTeam = null;
    this.redoubledByTeam = null;

    this.trickNumber = 1;
    this.currentTrick = [];
    this.tricksHistory = [];
    this.teamPoints = { team1: 0, team2: 0 };

    this.dealPhase1();
  }

  /**
   * Phase 1: Deal 4 cards each
   */
  dealPhase1() {
    this.currentPhase = GAME_PHASES.DEALING_PHASE_1;
    for (let p = 0; p < 4; p++) {
      this.hands[p] = this.deck.splice(0, 4);
      this.sortHand(this.hands[p]);
    }

    this.emit('phaseChange', { phase: this.currentPhase, hands: this.hands });

    this.currentPhase = GAME_PHASES.BIDDING;
    this.currentBidder = this.getNextPlayer(this.dealerIndex);
    this.emit('biddingStarted', { 
      currentBidder: this.currentBidder,
      minBid: BID_RULES.MIN_BID 
    });
  }

  submitBid(playerId, bidAmount) {
    if (this.currentPhase !== GAME_PHASES.BIDDING || playerId !== this.currentBidder) {
      return false;
    }

    const isPass = bidAmount === BID_RULES.PASS_VALUE || bidAmount === 0;

    if (isPass) {
      this.activeBidders.delete(playerId);
      this.biddingHistory.push({ playerId, bidAmount: 0, isPass: true });
      this.emit('bidPlaced', { 
        playerId, 
        bidAmount: 0, 
        isPass: true, 
        highestBid: this.highestBid, 
        highestBidder: this.highestBidder 
      });
    } else {
      if (bidAmount <= this.highestBid || bidAmount < BID_RULES.MIN_BID || bidAmount > BID_RULES.MAX_BID) {
        return false;
      }
      this.highestBid = bidAmount;
      this.highestBidder = playerId;
      this.biddingHistory.push({ playerId, bidAmount, isPass: false });
      this.emit('bidPlaced', { 
        playerId, 
        bidAmount, 
        isPass: false, 
        highestBid: this.highestBid, 
        highestBidder: this.highestBidder 
      });
    }

    // Win condition 1: 1 active bidder remains after at least 1 bid was made
    if (this.highestBidder !== null && this.activeBidders.size === 1) {
      this.concludeBidding();
      return true;
    }

    // Win condition 2: Max bid (28) reached
    if (this.highestBid === BID_RULES.MAX_BID) {
      this.concludeBidding();
      return true;
    }

    // Win condition 3: All 4 players passed from 16
    if (this.highestBidder === null && this.activeBidders.size === 0) {
      const forcedBidder = this.getNextPlayer(this.dealerIndex);
      this.highestBidder = forcedBidder;
      this.highestBid = BID_RULES.MIN_BID;
      this.biddingHistory.push({ playerId: forcedBidder, bidAmount: 16, isForced: true });
      this.concludeBidding();
      return true;
    }

    // Next active bidder
    let nextBidder = this.getNextPlayer(this.currentBidder);
    while (!this.activeBidders.has(nextBidder)) {
      nextBidder = this.getNextPlayer(nextBidder);
    }

    this.currentBidder = nextBidder;
    this.emit('biddingTurn', { 
      currentBidder: this.currentBidder, 
      highestBid: this.highestBid,
      highestBidder: this.highestBidder 
    });
    return true;
  }

  concludeBidding() {
    this.currentPhase = GAME_PHASES.TRUMP_SELECTION;
    this.emit('biddingConcluded', {
      winner: this.highestBidder,
      winningBid: this.highestBid
    });
  }

  selectTrump(suit, isSeventhCard = false) {
    if (this.currentPhase !== GAME_PHASES.TRUMP_SELECTION) return false;

    this.isSeventhCardTrump = isSeventhCard;
    const bidderHand = this.hands[this.highestBidder];

    if (isSeventhCard) {
      this.trumpSuit = null;
      this.lockedTrumpCard = null;
    } else {
      this.trumpSuit = suit;
      // Record trump card without removing it from bidder's hand - player preserves all 4 cards!
      const matchedCard = bidderHand.find(c => c.suit === suit);
      if (matchedCard) {
        this.lockedTrumpCard = { ...matchedCard };
      } else {
        this.lockedTrumpCard = { id: 'trump_locked', suit, rank: '?', power: 0, points: 0 };
      }
    }

    this.emit('trumpSelected', {
      bidder: this.highestBidder,
      isSeventhCard,
      trumpSuit: this.trumpSuit,
      lockedCard: this.lockedTrumpCard
    });

    this.dealPhase2();
    return true;
  }

  dealPhase2() {
    this.currentPhase = GAME_PHASES.DEALING_PHASE_2;
    for (let p = 0; p < 4; p++) {
      const secondBatch = this.deck.splice(0, 4);

      if (p === this.highestBidder && this.isSeventhCardTrump) {
        const seventh = secondBatch[2];
        this.trumpSuit = seventh.suit;
        this.lockedTrumpCard = { ...seventh };
      }
      
      // All 4 new cards are appended to player's hand (4 initial + 4 new = exactly 8 cards)
      this.hands[p].push(...secondBatch);
      this.sortHand(this.hands[p]);
    }

    this.emit('phaseChange', { phase: this.currentPhase, hands: this.hands });

    this.currentPhase = GAME_PHASES.CHALLENGE;
    this.emit('challengePhaseStarted', {
      bidder: this.highestBidder,
      bidderTeam: PLAYERS[this.highestBidder].team,
      highestBid: this.highestBid
    });
  }

  applyChallenge(teamId, action) {
    if (this.currentPhase !== GAME_PHASES.CHALLENGE) return;

    if (action === 'double' && this.challengeMultiplier === 1) {
      this.challengeMultiplier = 2;
      this.doubledByTeam = teamId;
      this.emit('challengeAnnounced', { type: 'DOUBLE', team: teamId });
    } else if (action === 'redouble' && this.challengeMultiplier === 2) {
      this.challengeMultiplier = 4;
      this.redoubledByTeam = teamId;
      this.emit('challengeAnnounced', { type: 'REDOUBLE', team: teamId });
    }
  }

  startPlayingTricks() {
    this.currentPhase = GAME_PHASES.PLAYING;
    this.trickNumber = 1;
    this.currentTurn = this.getNextPlayer(this.dealerIndex);
    this.leadSuit = null;
    this.currentTrick = [];
    this.trumpRevealedAtPlayCount = null;

    this.emit('trickStarted', {
      trickNumber: this.trickNumber,
      leader: this.currentTurn
    });
  }

  /**
   * Authentic card legality rules
   */
  isCardPlayable(playerId, card) {
    if (this.currentPhase !== GAME_PHASES.PLAYING || playerId !== this.currentTurn) {
      return false;
    }

    const hand = this.hands[playerId];
    const hasCard = hand.some(c => c.id === card.id);
    if (!hasCard) return false;

    // RULE 1: Leading the trick
    if (!this.leadSuit || this.currentTrick.length === 0) {
      // Cannot lead trump if trump is NOT yet revealed, unless holding only trumps!
      if (!this.isTrumpRevealed && card.suit === this.trumpSuit) {
        const hasNonTrump = hand.some(c => c.suit !== this.trumpSuit);
        if (hasNonTrump) return false;
      }
      return true;
    }

    // RULE 2: Must follow lead suit if holding any
    const hasLeadSuit = hand.some(c => c.suit === this.leadSuit);
    if (hasLeadSuit) {
      return card.suit === this.leadSuit;
    }

    // RULE 3: Void in lead suit
    // If trump was just revealed by THIS player in THIS trick, they MUST play trump if holding one
    if (this.isTrumpRevealed && this.trumpRevealedBy === playerId && this.trumpRevealedInTrick === this.trickNumber) {
      const hasTrump = hand.some(c => c.suit === this.trumpSuit);
      if (hasTrump) {
        return card.suit === this.trumpSuit;
      }
    }

    // Otherwise can play any off-suit card
    return true;
  }

  revealTrump(playerId) {
    if (this.isTrumpRevealed) return false;
    if (this.currentPhase !== GAME_PHASES.PLAYING || playerId !== this.currentTurn) return false;

    if (this.leadSuit) {
      const hasLeadSuit = this.hands[playerId].some(c => c.suit === this.leadSuit);
      if (hasLeadSuit) return false; // Must follow suit if able
    }

    this.isTrumpRevealed = true;
    this.trumpRevealedBy = playerId;
    this.trumpRevealedInTrick = this.trickNumber;
    this.trumpRevealedAtPlayCount = this.currentTrick.length;

    this.emit('trumpRevealed', {
      playerId,
      trumpSuit: this.trumpSuit,
      trumpCard: this.lockedTrumpCard,
      trickNumber: this.trickNumber,
      bidder: this.highestBidder
    });

    this.checkMarriage();
    return true;
  }

  checkMarriage() {
    if (!this.isTrumpRevealed) return;

    for (const teamKey of ['team1', 'team2']) {
      if (this.marriageClaimed[teamKey]) continue;

      const teamMembers = teamKey === 'team1' ? [0, 2] : [1, 3];
      let hasK = false;
      let hasQ = false;
      let holderPlayerId = null;

      for (const pId of teamMembers) {
        const hand = this.hands[pId];
        if (hand.some(c => c.suit === this.trumpSuit && c.rank === 'K')) hasK = true;
        if (hand.some(c => c.suit === this.trumpSuit && c.rank === 'Q')) hasQ = true;
        if (hasK && hasQ && holderPlayerId === null) {
          holderPlayerId = pId;
        }
      }

      if (hasK && hasQ) {
        this.marriageClaimed[teamKey] = true;
        const isBiddingTeam = PLAYERS[this.highestBidder].team === (teamKey === 'team1' ? 1 : 2);
        
        const originalBid = this.highestBid;
        if (isBiddingTeam) {
          this.highestBid = Math.max(BID_RULES.MIN_BID, this.highestBid - 4);
        } else {
          this.highestBid = Math.min(28, this.highestBid + 4);
        }

        this.emit('marriageAnnounced', {
          teamKey,
          teamId: teamKey === 'team1' ? 1 : 2,
          isBiddingTeam,
          holderPlayerId,
          originalBid,
          newBid: this.highestBid
        });
      }
    }
  }

  playCard(playerId, cardId) {
    const hand = this.hands[playerId];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = hand[cardIndex];
    if (!this.isCardPlayable(playerId, card)) return false;

    hand.splice(cardIndex, 1);

    if (this.currentTrick.length === 0) {
      this.leadSuit = card.suit;
    }

    // Determine if this play counts as a Trump play
    // A card counts as Trump IF trump is revealed AND (either trump was revealed in a prior trick OR it was revealed on or before this card was played)
    const isTrumpPlay = this.isTrumpRevealed && 
      (card.suit === this.trumpSuit) && 
      (this.trumpRevealedInTrick < this.trickNumber || (this.trumpRevealedInTrick === this.trickNumber && this.currentTrick.length >= this.trumpRevealedAtPlayCount));

    this.currentTrick.push({ playerId, card, isTrumpPlay });
    this.emit('cardPlayed', { playerId, card, trick: this.currentTrick });

    if (this.currentTrick.length === 4) {
      this.currentPhase = GAME_PHASES.TRICK_RESOLVING;
      // Allow 1.2s pause so player sees all 4 cards before resolving
      setTimeout(() => this.resolveTrick(), 1200);
    } else {
      this.currentTurn = this.getNextPlayer(playerId);
      this.emit('turnChanged', { currentTurn: this.currentTurn });
    }

    return true;
  }

  resolveTrick() {
    let winningPlay = this.currentTrick[0];
    let isTrumpWinning = winningPlay.isTrumpPlay;

    for (let i = 1; i < 4; i++) {
      const play = this.currentTrick[i];
      const card = play.card;

      if (play.isTrumpPlay) {
        if (!isTrumpWinning) {
          winningPlay = play;
          isTrumpWinning = true;
        } else if (card.power > winningPlay.card.power) {
          winningPlay = play;
        }
      } else if (!isTrumpWinning && card.suit === this.leadSuit) {
        if (card.power > winningPlay.card.power) {
          winningPlay = play;
        }
      }
    }

    let points = this.currentTrick.reduce((acc, p) => acc + p.card.points, 0);

    if (this.trickNumber === 8 && this.settings.lastTrickPoint) {
      points += 1;
    }

    const winnerId = winningPlay.playerId;
    const winnerTeam = PLAYERS[winnerId].team;
    const teamKey = winnerTeam === 1 ? 'team1' : 'team2';
    this.teamPoints[teamKey] += points;

    this.tricksHistory.push({
      trickNumber: this.trickNumber,
      cards: [...this.currentTrick],
      winnerId,
      points
    });

    // Emit trickResolved - main.js triggers sweep animation
    this.emit('trickResolved', {
      trickNumber: this.trickNumber,
      winnerId,
      winningCard: winningPlay.card,
      points,
      teamPoints: this.teamPoints
    });

    // Wait 850ms for card flight animation to winner before advancing
    setTimeout(() => {
      this.currentTrick = [];
      this.leadSuit = null;

      if (this.trickNumber === 8) {
        this.concludeRound();
      } else {
        this.trickNumber++;
        this.currentTurn = winnerId;
        this.currentPhase = GAME_PHASES.PLAYING;
        this.emit('trickStarted', {
          trickNumber: this.trickNumber,
          leader: this.currentTurn
        });
      }
    }, 850);
  }

  concludeRound() {
    this.currentPhase = GAME_PHASES.ROUND_OVER;
    
    const bidderTeam = PLAYERS[this.highestBidder].team;
    const bidderTeamKey = bidderTeam === 1 ? 'team1' : 'team2';
    const defenderTeamKey = bidderTeam === 1 ? 'team2' : 'team1';

    const pointsMade = this.teamPoints[bidderTeamKey];
    const isBidAchieved = pointsMade >= this.highestBid;

    let baseGamePoints = (this.settings.highBidDoublePoints && this.highestBid >= 21) ? 2 : 1;
    const gamePointsDelta = baseGamePoints * this.challengeMultiplier;

    if (isBidAchieved) {
      this.matchScores[bidderTeamKey] += gamePointsDelta;
    } else {
      this.matchScores[defenderTeamKey] += gamePointsDelta;
    }

    const isMatchWon = this.matchScores.team1 >= this.settings.matchPointsToWin || 
                       this.matchScores.team2 >= this.settings.matchPointsToWin;

    this.emit('roundEnded', {
      roundNumber: this.roundNumber,
      bidder: this.highestBidder,
      targetBid: this.highestBid,
      pointsMade,
      isBidAchieved,
      gamePointsDelta,
      matchScores: this.matchScores,
      isMatchWon,
      winnerTeam: isMatchWon ? (this.matchScores.team1 >= this.settings.matchPointsToWin ? 1 : 2) : null
    });

    if (isMatchWon) {
      this.currentPhase = GAME_PHASES.MATCH_OVER;
    } else {
      this.dealerIndex = this.getNextPlayer(this.dealerIndex);
      this.roundNumber++;
    }
  }

  sortHand(hand) {
    const suitOrderMap = { 'SPADES': 0, 'HEARTS': 1, 'CLUBS': 2, 'DIAMONDS': 3 };
    hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        return suitOrderMap[a.suit] - suitOrderMap[b.suit];
      }
      return b.power - a.power;
    });
  }
}
