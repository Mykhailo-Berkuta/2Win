
const MIN_PASSWORD_LENGTH = 6;

class AuthService {
  constructor() {
    this.users = [];
  }

  /**
   * Реєструє нового користувача.
   * EP: валідний email/пароль/isAdult → User; невалідні → Error
   * BVA: мінімальна довжина пароля = 6 символів
   */
  register(email, pwd, isAdult) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (!pwd || typeof pwd !== 'string' || pwd.length < MIN_PASSWORD_LENGTH) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!isAdult) {
      throw new Error('User must be an adult');
    }
    if (this.users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const user = {
      userId: this.users.length + 1,
      email,
      passwordHash: Buffer.from(pwd).toString('base64'),
      isAdult,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  /**
   * Аутентифікує користувача.
   * EP: правильні дані → true; неправильний пароль → false; не існує → false
   */
  authenticate(email, pwd) {
    if (!email || !pwd) return false;
    const user = this.users.find(u => u.email === email);
    if (!user) return false;
    return user.passwordHash === Buffer.from(pwd).toString('base64');
  }

  /**
   * Перевіряє підтвердження повноліття.
   * EP: true → true; false/null/undefined → false
   */
  validateAge(confirmed) {
    if (confirmed === null || confirmed === undefined) return false;
    return confirmed === true;
  }
}

class PredictionResult {
  constructor({ predictedOutcome, confidence, homeWinProb, drawProb, awayWinProb }) {
    this.predictedOutcome = predictedOutcome;
    this.confidence = confidence;
    this.homeWinProb = homeWinProb;
    this.drawProb = drawProb;
    this.awayWinProb = awayWinProb;
  }

  getSummary() {
    return `Outcome: ${this.predictedOutcome} (confidence: ${(this.confidence * 100).toFixed(1)}%)`;
  }
}

class PredictionService {
  constructor(modelVersion = 'v1.0') {
    this.modelVersion = modelVersion;
  }

  /**
   * Розраховує імовірності результатів матчу.
   * EP: match.status === 'upcoming' → PredictionResult
   *     match.status === 'finished'  → Error
   *     match без рейтингів          → рівномірний розподіл
   * BVA: homeRating та awayRating від 0 до 100
   */
  calculateProbability(match) {
    if (!match || typeof match !== 'object') {
      throw new Error('Match object is required');
    }
    if (match.status !== 'upcoming') {
      throw new Error('Prediction unavailable: match is not upcoming');
    }

    const home = match.homeRating ?? 50;
    const away = match.awayRating ?? 50;

    if (home < 0 || home > 100 || away < 0 || away > 100) {
      throw new Error('Ratings must be between 0 and 100');
    }

    const total = home + away + 20; // +20 for draw weight
    const homeWinProb = parseFloat((home / total).toFixed(4));
    const awayWinProb = parseFloat((away / total).toFixed(4));
    const drawProb = parseFloat((1 - homeWinProb - awayWinProb).toFixed(4));

    let predictedOutcome;
    if (homeWinProb > awayWinProb && homeWinProb > drawProb) {
      predictedOutcome = 'home_win';
    } else if (awayWinProb > homeWinProb && awayWinProb > drawProb) {
      predictedOutcome = 'away_win';
    } else {
      predictedOutcome = 'draw';
    }

    return new PredictionResult({
      predictedOutcome,
      confidence: Math.max(homeWinProb, drawProb, awayWinProb),
      homeWinProb,
      drawProb,
      awayWinProb,
    });
  }

  /**
   * Повертає список коефіцієнтів від букмекерів.
   * EP: match з odds → List<OddsEntry>; match без odds → []
   * BVA: odds.length === 0 → порожній масив
   */
  fetchOdds(match) {
    if (!match || typeof match !== 'object') {
      throw new Error('Match object is required');
    }
    if (!Array.isArray(match.odds)) return [];

    return match.odds.map(entry => ({
      bookmaker: entry.bookmaker,
      homeOdds: entry.homeOdds,
      drawOdds: entry.drawOdds,
      awayOdds: entry.awayOdds,
    }));
  }
}

module.exports = { AuthService, PredictionService, PredictionResult };