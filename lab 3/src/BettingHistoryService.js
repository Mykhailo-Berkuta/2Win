/**
 * KGLG-05 — Перегляд хронологічної історії ставок
 */

const BetStatus = Object.freeze({
  WIN: 'WIN',
  LOSS: 'LOSS',
  PENDING: 'PENDING',
});

class Bet {
  constructor(betId, amount, odds, placedAt, status) {
    if (typeof betId !== 'number' || !Number.isInteger(betId) || betId <= 0) {
      throw new Error('betId must be a positive integer');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('amount must be a positive number');
    }
    if (typeof odds !== 'number' || odds < 1.0) {
      throw new Error('odds must be >= 1.0');
    }
    if (!(placedAt instanceof Date) || isNaN(placedAt.getTime())) {
      throw new Error('placedAt must be a valid Date');
    }
    if (!Object.values(BetStatus).includes(status)) {
      throw new Error(`status must be one of: ${Object.values(BetStatus).join(', ')}`);
    }
    this.betId = betId;
    this.amount = amount;
    this.odds = odds;
    this.placedAt = placedAt;
    this.status = status;
  }

  isWon() {
    return this.status === BetStatus.WIN;
  }

  calculatePotentialWin() {
    return Math.round(this.amount * this.odds * 100) / 100;
  }
}

class BettingHistoryService {
  constructor(store = new Map()) {
    this._store = store;
  }

  getBetsByUser(userId) {
    if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
      throw new Error('userId must be a positive integer');
    }
    return this._store.get(userId) ?? [];
  }

  filterByStatus(userId, status) {
    if (!Object.values(BetStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    const bets = this.getBetsByUser(userId);
    return bets.filter((b) => b.status === status);
  }

  sortByDate(bets) {
    if (!Array.isArray(bets)) {
      throw new Error('bets must be an array');
    }
    return [...bets].sort((a, b) => b.placedAt - a.placedAt);
  }
}

module.exports = { Bet, BetStatus, BettingHistoryService };