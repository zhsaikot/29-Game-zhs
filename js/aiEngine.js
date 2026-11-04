/**
 * Heuristic AI Engine for 29 Card Game
 * 100% Fair Rules (Zero Cheating / Hidden Information Respected)
 */

import { SUITS, RANKS, PLAYERS } from './constants.js';

export class AIEngine {
  constructor() {
    this.playedCards = new Set();
  }

  resetMemory() {
    this.playedCards.clear();
  }

  recordPlayedCard(card) {
    this.playedCards.add(`${card.suit}_${card.rank}`);
  }

  isCardPlayed(suit, rank) {
    return this.playedCards.has(`${suit}_${rank}`);
  }

  evaluateBid(playerId, hand, currentHighestBid, highestBidder) {
    let suitCounts = { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 };
    let points = 0;
    let highCardsBySuit = { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 };

    hand.forEach(card => {
      suitCounts[card.suit]++;
      points += card.points;
      if (card.rank === 'J') highCardsBySuit[card.suit] += 4;
      if (card.rank === '9') highCardsBySuit[card.suit] += 3;
      if (card.rank === 'A') highCardsBySuit[card.suit] += 2;
      if (card.rank === '10') highCardsBySuit[card.suit] += 1;
    });

    let bestSuit = 'SPADES';
    let maxSuitPower = -1;
    for (const suit of Object.keys(suitCounts)) {
      const power = highCardsBySuit[suit] * 1.5 + suitCounts[suit] * 2;
      if (power > maxSuitPower) {
        maxSuitPower = power;
        bestSuit = suit;
      }
    }

    const myTeam = PLAYERS[playerId].team;
    const isPartnerHighestBidder = highestBidder !== null && PLAYERS[highestBidder].team === myTeam;
    if (isPartnerHighestBidder && currentHighestBid >= 16) {
      if (points < 6) return 0; // Respect partner's bid
    }

    let maxSafeBid = 0;
    if (points >= 6 || (highCardsBySuit[bestSuit] >= 7 && points >= 5)) {
      maxSafeBid = 21;
    } else if (points >= 5 || highCardsBySuit[bestSuit] >= 6) {
      maxSafeBid = 19;
    } else if (points >= 4 || highCardsBySuit[bestSuit] >= 5) {
      maxSafeBid = 18;
    } else if (points >= 3 || (points >= 2 && suitCounts[bestSuit] >= 3)) {
      maxSafeBid = 17;
    } else if (points >= 2 || suitCounts[bestSuit] >= 3) {
      maxSafeBid = 16;
    }

    if (maxSafeBid > currentHighestBid) {
      return Math.max(currentHighestBid + 1, 16);
    }

    return 0; // Pass
  }

  pickTrumpSuit(hand) {
    const scores = { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 };
    hand.forEach(card => {
      scores[card.suit] += (card.power * 2) + 3;
    });

    let bestSuit = 'SPADES';
    let highest = -1;
    for (const [suit, score] of Object.entries(scores)) {
      if (score > highest) {
        highest = score;
        bestSuit = suit;
      }
    }
    return bestSuit;
  }

  isBossCard(card) {
    const rankHierarchy = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];
    const myRankIdx = rankHierarchy.indexOf(card.rank);
    for (let i = 0; i < myRankIdx; i++) {
      const higherRank = rankHierarchy[i];
      if (!this.isCardPlayed(card.suit, higherRank)) {
        return false;
      }
    }
    return true;
  }

  decidePlay(playerId, gameState) {
    const hand = gameState.hands[playerId];
    const playableCards = hand.filter(c => gameState.isCardPlayable(playerId, c));
    const trick = gameState.currentTrick;
    const isLeading = trick.length === 0;

    // SCENARIO 1: AI Leads
    if (isLeading) {
      return this.chooseLeadCard(playableCards, gameState);
    }

    // SCENARIO 2: AI Follows
    const leadSuit = gameState.leadSuit;
    const cardsOfLeadSuit = playableCards.filter(c => c.suit === leadSuit);
    const hasLeadSuit = cardsOfLeadSuit.length > 0;

    const currentWinningPlay = this.getCurrentTrickWinner(trick, gameState);
    const partnerId = PLAYERS[playerId].team === 1 ? (playerId === 0 ? 2 : 0) : (playerId === 1 ? 3 : 1);
    const isPartnerWinning = currentWinningPlay.playerId === partnerId;
    const currentTrickPoints = trick.reduce((acc, p) => acc + p.card.points, 0);

    // CASE 2A: Must follow lead suit
    if (hasLeadSuit) {
      if (isPartnerWinning) {
        if (currentWinningPlay.card.rank === 'J' || this.isBossCard(currentWinningPlay.card)) {
          const highPointsCard = cardsOfLeadSuit.find(c => c.points > 0);
          if (highPointsCard && trick.length === 3) {
            return { action: 'play', card: highPointsCard, speech: 'পাঞ্জা দিলাম!' };
          }
        }
        const lowestCard = cardsOfLeadSuit.reduce((min, c) => c.power < min.power ? c : min, cardsOfLeadSuit[0]);
        return { action: 'play', card: lowestCard };
      } else {
        const winningCards = cardsOfLeadSuit.filter(c => c.power > currentWinningPlay.card.power);
        if (winningCards.length > 0) {
          const bestWinningCard = winningCards.reduce((min, c) => c.power < min.power ? c : min, winningCards[0]);
          return { action: 'play', card: bestWinningCard };
        } else {
          const lowestTrash = cardsOfLeadSuit.reduce((min, c) => c.power < min.power ? c : min, cardsOfLeadSuit[0]);
          return { action: 'play', card: lowestTrash };
        }
      }
    }

    // CASE 2B: Void in lead suit
    // FAIR AI RULE: Non-bidding AI does not secretly know what trump is!
    const isBidder = gameState.highestBidder === playerId;

    if (!gameState.isTrumpRevealed) {
      // High-value trick (opponent is winning and points >= 2 or Jack/9 was played)
      const isValuable = currentTrickPoints >= 2 || currentWinningPlay.card.points >= 2;
      
      // If bidder: knows trump and checks if holding trump
      if (isBidder) {
        const holdsTrump = hand.some(c => c.suit === gameState.trumpSuit);
        if (!isPartnerWinning && isValuable && holdsTrump) {
          return { action: 'reveal_trump', speech: 'রং তুললাম!' };
        }
      } else {
        // If non-bidder: asks to reveal trump on high value trick to attempt a cut
        if (!isPartnerWinning && isValuable) {
          return { action: 'reveal_trump', speech: 'রং দেখান!' };
        }
      }
    } else {
      // Trump is revealed
      const trumpCards = playableCards.filter(c => c.suit === gameState.trumpSuit);
      const isTrumpWinning = currentWinningPlay.isTrumpPlay;

      if (!isPartnerWinning && trumpCards.length > 0) {
        let winningTrumps = trumpCards;
        if (isTrumpWinning) {
          winningTrumps = trumpCards.filter(c => c.power > currentWinningPlay.card.power);
        }

        if (winningTrumps.length > 0) {
          const lowestWinningTrump = winningTrumps.reduce((min, c) => c.power < min.power ? c : min, winningTrumps[0]);
          return { action: 'play', card: lowestWinningTrump, speech: 'কাটলাম!' };
        }
      }
    }

    // Discard trash or load point
    if (isPartnerWinning && trick.length === 3) {
      const highPointTrash = playableCards.find(c => c.points > 0 && c.rank !== 'J');
      if (highPointTrash) {
        return { action: 'play', card: highPointTrash, speech: 'পয়েন্ট দিলাম' };
      }
    }

    const zeroPointCards = playableCards.filter(c => c.points === 0);
    if (zeroPointCards.length > 0) {
      const lowestZero = zeroPointCards.reduce((min, c) => c.power < min.power ? c : min, zeroPointCards[0]);
      return { action: 'play', card: lowestZero };
    }

    const lowestAny = playableCards.reduce((min, c) => c.power < min.power ? c : min, playableCards[0]);
    return { action: 'play', card: lowestAny };
  }

  chooseLeadCard(playableCards, gameState) {
    for (const card of playableCards) {
      if (this.isBossCard(card) && card.points >= 2 && (!gameState.isTrumpRevealed || card.suit !== gameState.trumpSuit)) {
        return { action: 'play', card, speech: `${card.rank} খেললাম` };
      }
    }

    const safeLow = playableCards.filter(c => c.points === 0 && (!gameState.isTrumpRevealed || c.suit !== gameState.trumpSuit));
    if (safeLow.length > 0) {
      return { action: 'play', card: safeLow[0] };
    }

    return { action: 'play', card: playableCards[0] };
  }

  getCurrentTrickWinner(trick, gameState) {
    let winningPlay = trick[0];
    let isTrumpWinning = winningPlay.isTrumpPlay;

    for (let i = 1; i < trick.length; i++) {
      const play = trick[i];
      if (play.isTrumpPlay) {
        if (!isTrumpWinning) {
          winningPlay = play;
          isTrumpWinning = true;
        } else if (play.card.power > winningPlay.card.power) {
          winningPlay = play;
        }
      } else if (!isTrumpWinning && play.card.suit === gameState.leadSuit) {
        if (play.card.power > winningPlay.card.power) {
          winningPlay = play;
        }
      }
    }
    return winningPlay;
  }
}
