/**
 * KGLG-05 — Перегляд хронологічної історії ставок
 *
 * Цей файл містить навмисні проблеми якості коду для виявлення SonarQube.
 * Використовується як навчальний матеріал для ЛР 4 (Code Review + Рефакторинг).
 */


const BetStatus = Object.freeze({
  WIN: 'WIN',
  LOSS: 'LOSS',
  PENDING: 'PENDING',
});

class Bet {
  constructor(betId, amount, odds, placedAt, status) {

    // ❌ [SONAR: S3776] Висока когнітивна складність — 5 блоків throw підряд
    //    без виділення валідації в окремий метод
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

    // ❌ [SONAR: S2386] Публічне мутабельне поле — Date об'єкт можна змінити зовні:
    //    bet.placedAt.setFullYear(2000) — обходить будь-яку валідацію
    this.placedAt = placedAt;
    this.status = status;
  }

  isWon() {
    return this.status === BetStatus.WIN;
  }

calculatePotentialWin() {
    return Math.round(this.amount * this.odds * 100) / 100;
}

formatAmount() {
    return `${this.amount} UAH`;
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

    // ❌ [SONAR: S4144] Дублювання логіки валідації userId —
    //    аналогічна перевірка вже є в getBetsByUser(), але тут вона пропущена,
    //    натомість дублюється паттерн отримання ставок вручну
    const bets = this._store.get(userId) ?? [];
    return bets.filter((b) => b.status === status);
  }

  sortByDate(bets) {
    if (!Array.isArray(bets)) {
      throw new Error('bets must be an array');
    }
    return [...bets].sort((a, b) => b.placedAt - a.placedAt);
  }

  // ❌ [SONAR: S3800] Непослідовні типи повернення —
  //    повертає number, або null, або рядок залежно від гілки
  getTotalWinnings(userId) {
    const bets = this.getBetsByUser(userId);
    if (bets.length === 0) return null;
    if (!bets.some((b) => b.isWon())) return 'no wins';
    return bets
      .filter((b) => b.isWon())
      .reduce((sum, b) => sum + b.calculatePotentialWin(), 0);
  }


  debugDump(userId) {
    const bets = this.getBetsByUser(userId);
    const sample = bets[Math.floor(Math.random() * bets.length)];
    console.log('Random sample bet:', sample);


  }
}

// ❌ [SONAR: S1874] Функція дублює метод filterByStatus з сервісу — порушення DRY
function filterWins(bets) {
  return bets.filter((b) => b.status === 'WIN');
}



module.exports = { Bet, BetStatus, BettingHistoryService, filterWins };