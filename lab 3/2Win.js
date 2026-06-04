'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Фабричні функції
// ─────────────────────────────────────────────────────────────────────────────
function validatePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
} 
const GOAL_DIFF_WEIGHT      = 0.2;
const FORM_SCORE_WEIGHT     = 0.5;
const HIGH_RATING_THRESHOLD = 70;

function createTeam(teamId, name, stats = {}) {
  validatePositiveInteger(teamId, 'teamId');
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('name must be a non-empty string');
  }

  return {
    teamId,
    name: name.trim(),
    wins:           stats.wins           ?? 0,
    losses:         stats.losses         ?? 0,
    draws:          stats.draws          ?? 0,
    goalsScored:    stats.goalsScored    ?? 0,
    goalsConceded:  stats.goalsConceded  ?? 0,
    last5Matches:   stats.last5Matches   ?? [],
    rating:         stats.rating         ?? 0,
  };
}

function createMatch(matchId, date, teamHome, teamAway, opts = {}) {
  validatePositiveInteger(matchId, 'matchId');
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

function createUser(userId, email, preferredSports = []) {
  validatePositiveInteger(userId, 'userId');
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
// StatsService
// ─────────────────────────────────────────────────────────────────────────────

class StatsService {
  constructor(matches = []) {
    if (!Array.isArray(matches)) {
      throw new Error('matches must be an array');
    }
    this._matches = [...matches];
  }

  getMatchList() {
    return [...this._matches];
  }

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

  calculateTeamRating(team) {
    if (!team || typeof team !== 'object') {
      throw new Error('team must be a non-null object');
    }

    const totalMatches = (team.wins ?? 0) + (team.losses ?? 0) + (team.draws ?? 0);

    if (totalMatches === 0) return 0;

    const winRate    = (team.wins / totalMatches) * 100;
    const goalFactor = ((team.goalsScored ?? 0) - (team.goalsConceded ?? 0)) * GOAL_DIFF_WEIGHT;
    const formFactor = this._calcFormFactor(team.last5Matches ?? []);

    const rating = winRate + goalFactor + formFactor;
    return Math.round(Math.max(0, Math.min(100, rating)) * 100) / 100;
  }

  filterStats(criteria) {
  if (typeof criteria !== 'string' || criteria.trim() === '') {
    throw new Error('criteria must be a non-empty string');
  }

  const normalizedCriteria = criteria.trim().toLowerCase();

  if (normalizedCriteria.startsWith('sport:')) {
    const sportName = normalizedCriteria.slice('sport:'.length).trim();
    if (!sportName) {
      throw new Error("sport name cannot be empty in 'sport:' criteria");
    }
    return this.filterBySport(sportName);
  }

  if (['home_win', 'away_win', 'draw'].includes(normalizedCriteria)) {
    return this.filterByResult(normalizedCriteria);
  }

  if (normalizedCriteria === 'high_rated') {
    return this.filterByRating(HIGH_RATING_THRESHOLD);
  }

  throw new Error(`Unknown filter criteria: '${criteria}'`);
}

filterBySport(sport) {
  return this._matches.filter(m => m.sport.toLowerCase() === sport.toLowerCase());
}

filterByResult(result) {
  if (result === 'home_win') return this._matches.filter(m => m.scoreHome > m.scoreAway);
  if (result === 'away_win') return this._matches.filter(m => m.scoreAway > m.scoreHome);
  if (result === 'draw')     return this._matches.filter(m => m.scoreHome === m.scoreAway);
  throw new Error(`Unknown result filter: '${result}'`);
}

filterByRating(threshold = HIGH_RATING_THRESHOLD) {
  return this._matches.filter(
    m => m.teamHome.rating >= threshold && m.teamAway.rating >= threshold
  );
}

  _findMatch(matchId) {
    const match = this._matches.find(m => m.matchId === matchId);
    if (!match) throw new Error(`Match with id=${matchId} not found`);
    return match;
  }

  _calcFormFactor(last5) {
    const scoreMap = { W: 3, D: 1, L: 0 };
    const rawScore = last5.reduce((sum, r) => sum + (scoreMap[r] ?? 0), 0);
    return rawScore * FORM_SCORE_WEIGHT;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RecommendationEngine
// ─────────────────────────────────────────────────────────────────────────────

class RecommendationEngine {
  static CONFIDENCE_THRESHOLD = 0.1;

  constructor(matches = []) {
    if (!Array.isArray(matches)) {
      throw new Error('matches must be an array');
    }
    this._matches    = [...matches];
    this._recCounter = 0;
  }

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
        recId:   this._recCounter,
        matchId: match.matchId,
        odds,
        confidence,
        description,
      });
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations;
  }

  analyzePreferences(user) {
    if (!user || typeof user !== 'object') {
      throw new Error('user must be a non-null object');
    }
    if (!Array.isArray(user.preferredSports)) {
      throw new Error('user.preferredSports must be an array');
    }

    return user.preferredSports.map(s => s.toLowerCase().trim());
  }

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

  _estimateOdds(confidence) {
    if (confidence <= 0) return 3.0;
    const odds = 1 + (1 - confidence) * 2;
    return Math.round(Math.max(1.01, odds) * 100) / 100;
  }

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

module.exports = {
  createTeam,
  createMatch,
  createUser,
  StatsService,
  RecommendationEngine,
};