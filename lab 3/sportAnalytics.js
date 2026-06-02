'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Моделі даних (відповідають UML class diagram)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Команда з рейтингом.
 * @typedef {Object} Team
 * @property {number} teamId
 * @property {string} name
 * @property {number} rating   – поточний рейтинг [0..100]
 * @property {number} wins
 * @property {number} losses
 * @property {number} draws
 * @property {number} goalsScored
 * @property {number} goalsConceded
 * @property {string[]} last5Matches  – масив результатів: 'W' | 'D' | 'L'
 */

/**
 * Статистика одного матчу.
 * @typedef {Object} MatchStats
 * @property {number} possessionHome
 * @property {number} possessionAway
 * @property {number} shotsHome
 * @property {number} shotsAway
 * @property {number} foulsHome
 * @property {number} foulsAway
 */

/**
 * Матч між двома командами.
 * @typedef {Object} Match
 * @property {number}      matchId
 * @property {string}      date        – ISO-рядок дати, напр. '2024-05-01'
 * @property {Team}        teamHome
 * @property {Team}        teamAway
 * @property {number}      scoreHome
 * @property {number}      scoreAway
 * @property {string}      sport       – вид спорту, напр. 'football'
 * @property {MatchStats|null} stats
 */

/**
 * Персоналізована рекомендація.
 * @typedef {Object} Recommendation
 * @property {number} recId
 * @property {number} matchId
 * @property {number} odds
 * @property {number} confidence  – [0..1]
 * @property {string} description
 */

/**
 * Користувач системи.
 * @typedef {Object} User
 * @property {number}   userId
 * @property {string}   email
 * @property {string[]} preferredSports
 */

// ─────────────────────────────────────────────────────────────────────────────
// Фабричні функції (замість конструкторів)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Створює об'єкт Team.
 * @param {number} teamId
 * @param {string} name
 * @param {Object} [stats={}]
 * @returns {Team}
 */
function createTeam(teamId, name, stats = {}) {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error('teamId must be a positive integer');
  }
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('name must be a non-empty string');
  }

  return {
    teamId,
    name: name.trim(),
    wins:            stats.wins            ?? 0,
    losses:          stats.losses          ?? 0,
    draws:           stats.draws           ?? 0,
    goalsScored:     stats.goalsScored     ?? 0,
    goalsConceded:   stats.goalsConceded   ?? 0,
    last5Matches:    stats.last5Matches    ?? [],
    rating:          stats.rating          ?? 0,
  };
}

/**
 * Створює об'єкт Match.
 * @param {number}       matchId
 * @param {string}       date
 * @param {Team}         teamHome
 * @param {Team}         teamAway
 * @param {Object}       [opts={}]
 * @returns {Match}
 */
function createMatch(matchId, date, teamHome, teamAway, opts = {}) {
  if (!Number.isInteger(matchId) || matchId <= 0) {
    throw new Error('matchId must be a positive integer');
  }
  if (typeof date !== 'string' || date.trim() === '') {
    throw new Error('date must be a non-empty string');
  }
  if (!teamHome || !teamAway) {
    throw new Error('teamHome and teamAway are required');
  }

  return {
    matchId,
    date: date.trim(),
    teamHome,
    teamAway,
    scoreHome: opts.scoreHome ?? 0,
    scoreAway: opts.scoreAway ?? 0,
    sport:     opts.sport     ?? 'football',
    stats:     opts.stats     ?? null,
  };
}

/**
 * Створює об'єкт User.
 * @param {number}   userId
 * @param {string}   email
 * @param {string[]} [preferredSports=[]]
 * @returns {User}
 */
function createUser(userId, email, preferredSports = []) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('userId must be a positive integer');
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('email must be a valid email address');
  }

  return {
    userId,
    email: email.trim(),
    preferredSports: Array.isArray(preferredSports) ? [...preferredSports] : [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KGLG-03 — StatsService
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Сервіс статистики матчів та рейтингів команд.
 *
 * Зберігає список матчів у пам'яті (імітація бази даних / API-кешу).
 * Відповідає вимозі KGLG-03.
 */
class StatsService {
  /**
   * @param {Match[]} [matches=[]]
   */
  constructor(matches = []) {
    if (!Array.isArray(matches)) {
      throw new Error('matches must be an array');
    }
    this._matches = [...matches];
  }

  // ── публічний API ──────────────────────────────────────────────────────────

  /**
   * Повертає копію повного списку матчів.
   * @returns {Match[]}
   */
  getMatchList() {
    return [...this._matches];
  }

  /**
   * Повертає статистику для матчу з вказаним matchId.
   *
   * @param {number} matchId
   * @returns {MatchStats}
   * @throws {Error} якщо matchId не ціле число, матч не знайдено
   *                 або статистика ще не завантажена.
   */
  getMatchStats(matchId) {
    if (!Number.isInteger(matchId)) {
      throw new Error('matchId must be an integer');
    }

    const match = this._findMatch(matchId);

    if (!match.stats) {
      throw new Error(`Stats for match ${matchId} are not loaded yet`);
    }

    return match.stats;
  }

  /**
   * Знаходить і повертає рейтинг команди за teamId серед усіх матчів.
   *
   * @param {number} teamId
   * @returns {number}
   * @throws {Error} якщо teamId не ціле число або команду не знайдено.
   */
  getTeamRating(teamId) {
    if (!Number.isInteger(teamId)) {
      throw new Error('teamId must be an integer');
    }

    for (const match of this._matches) {
      if (match.teamHome.teamId === teamId) return match.teamHome.rating;
      if (match.teamAway.teamId === teamId) return match.teamAway.rating;
    }

    throw new Error(`Team with id=${teamId} not found`);
  }

  /**
   * Обчислює рейтинг команди за формулою з LogicComand.js (ЛР 01).
   *
   * Формула:
   *   winRate    = (wins / totalMatches) * 100
   *   goalFactor = (goalsScored - goalsConceded) * 0.2
   *   formFactor = last5Score * 0.5   (W=3, D=1, L=0)
   *   rating     = clamp(winRate + goalFactor + formFactor, 0, 100)
   *
   * @param {Team} team
   * @returns {number}  – рейтинг у [0..100]
   * @throws {Error} якщо team не є об'єктом або містить некоректні дані.
   */
  calculateTeamRating(team) {
    if (!team || typeof team !== 'object') {
      throw new Error('team must be a non-null object');
    }

    const totalMatches = (team.wins ?? 0) + (team.losses ?? 0) + (team.draws ?? 0);

    if (totalMatches === 0) return 0;

    const winRate    = (team.wins / totalMatches) * 100;
    const goalFactor = ((team.goalsScored ?? 0) - (team.goalsConceded ?? 0)) * 0.2;
    const formFactor = this._calcFormFactor(team.last5Matches ?? []);

    const rating = winRate + goalFactor + formFactor;
    return Math.round(Math.max(0, Math.min(100, rating)) * 100) / 100;
  }

  /**
   * Фільтрує матчі за рядковим критерієм.
   *
   * Підтримувані критерії:
   *   'sport:<назва>'  — матчі вказаного виду спорту
   *   'home_win'       — перемога господарів
   *   'away_win'       — перемога гостей
   *   'draw'           — нічия
   *   'high_rated'     — обидві команди мають рейтинг ≥ 70
   *
   * @param {string} criteria
   * @returns {Match[]}
   * @throws {Error} якщо criteria порожній або невідомий.
   */
  filterStats(criteria) {
    if (typeof criteria !== 'string' || criteria.trim() === '') {
      throw new Error('criteria must be a non-empty string');
    }

    const c = criteria.trim().toLowerCase();

    if (c.startsWith('sport:')) {
      const sportName = c.slice('sport:'.length).trim();
      if (!sportName) {
        throw new Error("sport name cannot be empty in 'sport:' criteria");
      }
      return this._matches.filter(m => m.sport.toLowerCase() === sportName);
    }

    if (c === 'home_win') {
      return this._matches.filter(m => m.scoreHome > m.scoreAway);
    }

    if (c === 'away_win') {
      return this._matches.filter(m => m.scoreAway > m.scoreHome);
    }

    if (c === 'draw') {
      return this._matches.filter(m => m.scoreHome === m.scoreAway);
    }

    if (c === 'high_rated') {
      return this._matches.filter(
        m => m.teamHome.rating >= 70 && m.teamAway.rating >= 70
      );
    }

    throw new Error(`Unknown filter criteria: '${criteria}'`);
  }

  // ── внутрішні методи ───────────────────────────────────────────────────────

  /**
   * @param {number} matchId
   * @returns {Match}
   * @private
   */
  _findMatch(matchId) {
    const match = this._matches.find(m => m.matchId === matchId);
    if (!match) {
      throw new Error(`Match with id=${matchId} not found`);
    }
    return match;
  }

  /**
   * Обчислює formFactor з масиву результатів останніх 5 матчів.
   * W → 3 бали, D → 1, L → 0.
   *
   * @param {string[]} last5
   * @returns {number}
   * @private
   */
  _calcFormFactor(last5) {
    const scoreMap = { W: 3, D: 1, L: 0 };
    const rawScore = last5.reduce((sum, r) => sum + (scoreMap[r] ?? 0), 0);
    return rawScore * 0.5;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KGLG-04 — RecommendationEngine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Рушій персоналізованих рекомендацій матчів.
 *
 * Рекомендує матчі, вид спорту яких збігається з уподобаннями
 * користувача; впевненість обчислюється на основі різниці рейтингів.
 * Відповідає вимозі KGLG-04.
 */
class RecommendationEngine {
  /** Поріг впевненості — рекомендації нижче порогу відкидаються. */
  static CONFIDENCE_THRESHOLD = 0.1;

  /**
   * @param {Match[]} [matches=[]]
   */
  constructor(matches = []) {
    if (!Array.isArray(matches)) {
      throw new Error('matches must be an array');
    }
    this._matches    = [...matches];
    this._recCounter = 0;
  }

  // ── публічний API ──────────────────────────────────────────────────────────

  /**
   * Генерує відсортований за впевненістю список рекомендацій для user.
   *
   * Алгоритм (з sequence diagram fr-04-sd):
   *   1. Визначити уподобання користувача (preferredSports).
   *   2. Для кожного матчу, вид спорту якого є в уподобаннях:
   *        a. Обчислити впевненість.
   *        b. Якщо confidence ≥ CONFIDENCE_THRESHOLD → додати рекомендацію.
   *   3. Повернути список, відсортований від вищої впевненості до нижчої.
   *
   * @param {User} user
   * @returns {Recommendation[]}
   * @throws {Error} якщо user не містить поле preferredSports
   *                 або список уподобань порожній.
   */
  generateRecommendations(user) {
    if (!user || typeof user !== 'object') {
      throw new Error('user must be a non-null object');
    }
    if (!Array.isArray(user.preferredSports)) {
      throw new Error('user.preferredSports must be an array');
    }
    if (user.preferredSports.length === 0) {
      throw new Error(`User ${user.userId} has no preferred sports set`);
    }

    const sportsSet = new Set(
      user.preferredSports.map(s => s.toLowerCase().trim())
    );

    const recommendations = [];

    for (const match of this._matches) {
      if (!sportsSet.has(match.sport.toLowerCase())) continue;

      const confidence = this.calculateConfidence(match);
      if (confidence < RecommendationEngine.CONFIDENCE_THRESHOLD) continue;

      const odds        = this._estimateOdds(confidence);
      const description = this._buildDescription(match, confidence);

      this._recCounter += 1;
      recommendations.push({
        recId:       this._recCounter,
        matchId:     match.matchId,
        odds,
        confidence,
        description,
      });
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations;
  }

  /**
   * Повертає нормалізований (lower-case) список уподобань користувача.
   *
   * @param {User} user
   * @returns {string[]}
   * @throws {Error} якщо user не містить коректного поля preferredSports.
   */
  analyzePreferences(user) {
    if (!user || typeof user !== 'object') {
      throw new Error('user must be a non-null object');
    }
    if (!Array.isArray(user.preferredSports)) {
      throw new Error('user.preferredSports must be an array');
    }

    return user.preferredSports.map(s => s.toLowerCase().trim());
  }

  /**
   * Обчислює впевненість прогнозу для матчу на основі різниці рейтингів.
   *
   * Формула:
   *   confidence = |ratingHome − ratingAway| / 100
   *
   * Результат обмежений діапазоном [0..1].
   *
   * @param {Match} match
   * @returns {number}
   * @throws {Error} якщо match не є об'єктом або не має команд.
   */
  calculateConfidence(match) {
    if (!match || typeof match !== 'object') {
      throw new Error('match must be a non-null object');
    }
    if (!match.teamHome || !match.teamAway) {
      throw new Error('match must have teamHome and teamAway');
    }

    const diff = Math.abs(match.teamHome.rating - match.teamAway.rating);
    return Math.round(Math.min(diff / 100, 1) * 10000) / 10000;
  }

  // ── внутрішні методи ───────────────────────────────────────────────────────

  /**
   * Оцінює коефіцієнт: чим вища впевненість, тим нижчий коефіцієнт.
   * @param {number} confidence
   * @returns {number}
   * @private
   */
  _estimateOdds(confidence) {
    if (confidence <= 0) return 3.0;
    const odds = 1 + (1 - confidence) * 2;
    return Math.round(Math.max(1.01, odds) * 100) / 100;
  }

  /**
   * Формує текстовий опис рекомендації.
   * @param {Match}  match
   * @param {number} confidence
   * @returns {string}
   * @private
   */
  _buildDescription(match, confidence) {
    const favourite =
      match.teamHome.rating >= match.teamAway.rating
        ? match.teamHome.name
        : match.teamAway.name;

    const pct = (confidence * 100).toFixed(1);
    return (
      `${match.teamHome.name} vs ${match.teamAway.name} ` +
      `(${match.sport}): прогноз на перемогу ${favourite}, ` +
      `впевненість ${pct}%`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Експорт
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  createTeam,
  createMatch,
  createUser,
  StatsService,
  RecommendationEngine,
};