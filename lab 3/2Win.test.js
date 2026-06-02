'use strict';

const {
  createTeam,
  createMatch,
  createUser,
  StatsService,
  RecommendationEngine,
} = require('./2Win');

// ═════════════════════════════════════════════════════════════════════════════
// ДОПОМІЖНІ ФАБРИКИ (спрощують створення тестових даних)
// ═════════════════════════════════════════════════════════════════════════════

/** Створює команду з рейтингом без зайвих параметрів */
function makeTeam(id, name, rating = 50, extra = {}) {
  return createTeam(id, name, { rating, ...extra });
}

/** Створює матч із двома командами */
function makeMatch(id, home, away, opts = {}) {
  return createMatch(id, '2024-05-01', home, away, opts);
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. createTeam
// ═════════════════════════════════════════════════════════════════════════════

describe('createTeam', () => {
  // CT-01 — позитивний / EP: допустимий клас вхідних даних
  test('CT-01 [EP+] повертає команду з коректними teamId та name', () => {
    // Arrange
    const teamId = 1;
    const name   = 'Dynamo';

    // Act
    const team = createTeam(teamId, name);

    // Assert
    expect(team.teamId).toBe(1);
    expect(team.name).toBe('Dynamo');
  });

  // CT-02 — позитивний / BVA: мінімально допустиме значення teamId = 1
  test('CT-02 [BVA+] teamId=1 (мінімальна межа) — успішне створення', () => {
    // Arrange / Act
    const team = createTeam(1, 'Shakhtar');

    // Assert
    expect(team.teamId).toBe(1);
  });

  // CT-03 — негативний / BVA: teamId=0 (межа — нуль, нижче мінімуму)
  test('CT-03 [BVA-] teamId=0 кидає помилку "positive integer"', () => {
    // Arrange
    const invalidId = 0;

    // Act & Assert
    expect(() => createTeam(invalidId, 'Test')).toThrow('positive integer');
  });

  // CT-04 — негативний / EP: від'ємний teamId
  test('CT-04 [EP-] teamId=-1 кидає помилку "positive integer"', () => {
    // Arrange
    const invalidId = -1;

    // Act & Assert
    expect(() => createTeam(invalidId, 'Test')).toThrow('positive integer');
  });

  // CT-05 — негативний / EP: не ціле число
  test('CT-05 [EP-] teamId=1.5 (дробове) кидає помилку "positive integer"', () => {
    // Arrange
    const invalidId = 1.5;

    // Act & Assert
    expect(() => createTeam(invalidId, 'Test')).toThrow('positive integer');
  });

  // CT-06 — негативний / BVA: name = '' (порожній рядок — межа)
  test('CT-06 [BVA-] name="" (порожній рядок) кидає помилку "non-empty string"', () => {
    // Arrange
    const emptyName = '';

    // Act & Assert
    expect(() => createTeam(1, emptyName)).toThrow('non-empty string');
  });

  // CT-07 — позитивний / EP: name з пробілами → trim()
  test('CT-07 [EP+] name=" Kyiv " обрізається до "Kyiv"', () => {
    // Arrange
    const paddedName = ' Kyiv ';

    // Act
    const team = createTeam(1, paddedName);

    // Assert
    expect(team.name).toBe('Kyiv');
  });

  // CT-08 — позитивний / EP: stats не передається → усі значення = 0
  test('CT-08 [EP+] без stats всі числові поля = 0', () => {
    // Arrange / Act
    const team = createTeam(1, 'Default');

    // Assert
    expect(team.wins).toBe(0);
    expect(team.losses).toBe(0);
    expect(team.rating).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. StatsService.getMatchStats
// ═════════════════════════════════════════════════════════════════════════════

describe('StatsService.getMatchStats', () => {
  // GS-01 — позитивний / EP: матч зі stats → повертає об'єкт MatchStats
  test('GS-01 [EP+] matchId існує і stats завантажені → повертає stats', () => {
    // Arrange
    const statsData = { possessionHome: 55, possessionAway: 45, shotsHome: 10, shotsAway: 7, foulsHome: 3, foulsAway: 4 };
    const home  = makeTeam(1, 'Home');
    const away  = makeTeam(2, 'Away');
    const match = makeMatch(1, home, away, { stats: statsData });
    const svc   = new StatsService([match]);

    // Act
    const result = svc.getMatchStats(1);

    // Assert
    expect(result).toEqual(statsData);
  });

  // GS-02 — негативний / EP: stats=null → виняток 'not loaded yet'
  test('GS-02 [EP-] stats=null кидає помилку "not loaded yet"', () => {
    // Arrange
    const home  = makeTeam(1, 'Home');
    const away  = makeTeam(2, 'Away');
    const match = makeMatch(1, home, away); // stats: null за замовчуванням
    const svc   = new StatsService([match]);

    // Act & Assert
    expect(() => svc.getMatchStats(1)).toThrow('not loaded yet');
  });

  // GS-03 — негативний / EP: matchId не існує → виняток 'not found'
  test('GS-03 [EP-] matchId=999 не існує → кидає помилку "not found"', () => {
    // Arrange
    const svc = new StatsService([]);

    // Act & Assert
    expect(() => svc.getMatchStats(999)).toThrow('not found');
  });

  // GS-04 — негативний / EP: matchId не число → виняток 'must be integer'
  test('GS-04 [EP-] matchId="abc" кидає помилку "must be integer"', () => {
    // Arrange
    const svc = new StatsService([]);

    // Act & Assert
    expect(() => svc.getMatchStats('abc')).toThrow('must be an integer');
  });

  // GS-05 — негативний / BVA: порожній список матчів + будь-який matchId → 'not found'
  test('GS-05 [BVA-] matches=[] (порожній список) → кидає помилку "not found"', () => {
    // Arrange
    const svc = new StatsService([]);

    // Act & Assert
    expect(() => svc.getMatchStats(1)).toThrow('not found');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. StatsService.getTeamRating
// ═════════════════════════════════════════════════════════════════════════════

describe('StatsService.getTeamRating', () => {
  let svc;

  beforeEach(() => {
    const home  = makeTeam(1, 'HomeTeam', 80);
    const away  = makeTeam(2, 'AwayTeam', 65);
    const match = makeMatch(1, home, away);
    svc = new StatsService([match]);
  });

  // GTR-01 — позитивний / EP: teamId є в teamHome → повертає rating господарів
  test('GTR-01 [EP+] teamId=1 (teamHome) → повертає рейтинг 80', () => {
    // Arrange — виконано в beforeEach
    // Act
    const rating = svc.getTeamRating(1);

    // Assert
    expect(rating).toBe(80);
  });

  // GTR-02 — позитивний / EP: teamId є в teamAway → повертає rating гостей
  test('GTR-02 [EP+] teamId=2 (teamAway) → повертає рейтинг 65', () => {
    // Arrange — виконано в beforeEach
    // Act
    const rating = svc.getTeamRating(2);

    // Assert
    expect(rating).toBe(65);
  });

  // GTR-03 — негативний / EP: teamId не існує → виняток 'not found'
  test('GTR-03 [EP-] teamId=999 → кидає помилку "not found"', () => {
    // Act & Assert
    expect(() => svc.getTeamRating(999)).toThrow('not found');
  });

  // GTR-04 — негативний / EP: teamId не ціле → виняток 'must be integer'
  test('GTR-04 [EP-] teamId=1.5 → кидає помилку "must be integer"', () => {
    // Act & Assert
    expect(() => svc.getTeamRating(1.5)).toThrow('must be an integer');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. StatsService.calculateTeamRating
// ═════════════════════════════════════════════════════════════════════════════

describe('StatsService.calculateTeamRating', () => {
  let svc;

  beforeEach(() => {
    svc = new StatsService([]);
  });

  // CTR-01 — позитивний / BVA: totalMatches=0 (межа нуль) → rating=0
  test('CTR-01 [BVA+] totalMatches=0 → повертає 0', () => {
    // Arrange
    const team = { wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0, last5Matches: [] };

    // Act
    const result = svc.calculateTeamRating(team);

    // Assert
    expect(result).toBe(0);
  });

  // CTR-02 — позитивний / BVA: totalMatches=1 (межа+1), 1 перемога → winRate=100
  test('CTR-02 [BVA+] wins=1, totalMatches=1 → winRate=100 (але clamp може знизити)', () => {
    // Arrange
    const team = { wins: 1, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0, last5Matches: [] };

    // Act
    const result = svc.calculateTeamRating(team);

    // Assert — без голів та форми: winRate=100, обмежено до 100
    expect(result).toBe(100);
  });

  // CTR-03 — позитивний / EP: типовий розрахунок → результат в [0..100]
  test('CTR-03 [EP+] wins=10, losses=5, draws=5, goals+5 → рейтинг у [0..100]', () => {
    // Arrange
    const team = { wins: 10, losses: 5, draws: 5, goalsScored: 25, goalsConceded: 20, last5Matches: ['W','D','L','W','D'] };

    // Act
    const result = svc.calculateTeamRating(team);

    // Assert
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  // CTR-04 — позитивний / BVA: дуже висока сума → clamp до 100
  test('CTR-04 [BVA+] wins=30, goals+100 → clamp до 100', () => {
    // Arrange
    const team = { wins: 30, losses: 0, draws: 0, goalsScored: 100, goalsConceded: 0, last5Matches: ['W','W','W','W','W'] };

    // Act
    const result = svc.calculateTeamRating(team);

    // Assert
    expect(result).toBe(100);
  });

  // CTR-05 — позитивний / BVA: від'ємний goalFactor → clamp до 0
  test('CTR-05 [BVA+] wins=0, goals-200 → clamp до 0', () => {
    // Arrange
    const team = { wins: 0, losses: 10, draws: 0, goalsScored: 0, goalsConceded: 200, last5Matches: [] };

    // Act
    const result = svc.calculateTeamRating(team);

    // Assert
    expect(result).toBe(0);
  });

  // CTR-06 — позитивний / EP: 5 перемог в last5 → formFactor = 7.5
  test('CTR-06 [EP+] last5=["W","W","W","W","W"] → formFactor=7.5', () => {
    // Arrange — команда без перемог, щоб ізолювати formFactor
    const team = {
      wins: 0, losses: 10, draws: 0,
      goalsScored: 0, goalsConceded: 0,
      last5Matches: ['W', 'W', 'W', 'W', 'W'],
    };

    // Act
    const result = svc.calculateTeamRating(team);
    // winRate=0, goalFactor=0, formFactor=7.5 → rating=7.5

    // Assert
    expect(result).toBeCloseTo(7.5, 5);
  });

  // CTR-07 — негативний / EP: team=null → виняток 'non-null object'
  test('CTR-07 [EP-] team=null → кидає помилку "non-null object"', () => {
    // Act & Assert
    expect(() => svc.calculateTeamRating(null)).toThrow('non-null object');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. StatsService.filterStats
// ═════════════════════════════════════════════════════════════════════════════

describe('StatsService.filterStats', () => {
  let svc;
  let matchHomeWin, matchAwayWin, matchDraw, matchHighRated, matchFootball, matchBasketball;

  beforeEach(() => {
    const t1 = makeTeam(1, 'Alpha', 80);
    const t2 = makeTeam(2, 'Beta',  75);
    const t3 = makeTeam(3, 'Gamma', 69);
    const t4 = makeTeam(4, 'Delta', 70);

    matchHomeWin    = makeMatch(1, t1, t2, { scoreHome: 2, scoreAway: 1, sport: 'football' });
    matchAwayWin    = makeMatch(2, t1, t2, { scoreHome: 0, scoreAway: 3, sport: 'football' });
    matchDraw       = makeMatch(3, t1, t2, { scoreHome: 1, scoreAway: 1, sport: 'football' });
    matchHighRated  = makeMatch(4, t1, t2, { sport: 'football' });          // rating 80+75 ≥ 70
    matchFootball   = makeMatch(5, t1, t2, { sport: 'football' });
    matchBasketball = makeMatch(6, t1, t2, { sport: 'basketball' });

    // Матч із командою нижче 70 для BVA
    const t5 = makeTeam(5, 'Low1', 69);
    const t6 = makeTeam(6, 'High1', 80);
    const matchBelowThreshold = makeMatch(7, t5, t6, { sport: 'football' });

    svc = new StatsService([
      matchHomeWin, matchAwayWin, matchDraw,
      matchHighRated, matchBasketball, matchBelowThreshold,
    ]);
  });

  // FS-01 — позитивний / EP: home_win → лише матчі, де scoreHome > scoreAway
  test('FS-01 [EP+] "home_win" повертає матч із рахунком 2:1', () => {
    // Act
    const result = svc.filterStats('home_win');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].matchId).toBe(1);
  });

  // FS-02 — позитивний / EP: away_win → лише матчі, де scoreAway > scoreHome
  test('FS-02 [EP+] "away_win" повертає матч із рахунком 0:3', () => {
    // Act
    const result = svc.filterStats('away_win');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].matchId).toBe(2);
  });

  // FS-03 — позитивний / EP: draw → лише нічиї
  test('FS-03 [EP+] "draw" повертає матч із рахунком 1:1', () => {
    // Act
    const result = svc.filterStats('draw');

    // Assert — матч matchId=3 (1:1) присутній у результаті; усі результати — нічиї
    expect(result.find(m => m.matchId === 3)).toBeDefined();
    result.forEach(m => expect(m.scoreHome).toBe(m.scoreAway));
  });

  // FS-04 — позитивний / EP: sport:football → тільки матчі football
  test('FS-04 [EP+] "sport:football" повертає тільки футбольні матчі', () => {
    // Act
    const result = svc.filterStats('sport:football');

    // Assert — усі матчі football (тобто всі, крім basketball)
    result.forEach(m => expect(m.sport).toBe('football'));
    const basketballCount = result.filter(m => m.sport === 'basketball').length;
    expect(basketballCount).toBe(0);
  });

  // FS-05 — позитивний / EP: high_rated → обидві команди ≥ 70
  test('FS-05 [EP+] "high_rated" повертає матчі з обома командами рейтингу ≥ 70', () => {
    // Act
    const result = svc.filterStats('high_rated');

    // Assert — у кожному матчі обидві команди ≥ 70
    result.forEach(m => {
      expect(m.teamHome.rating).toBeGreaterThanOrEqual(70);
      expect(m.teamAway.rating).toBeGreaterThanOrEqual(70);
    });
  });

  // FS-06 — позитивний / BVA: high_rated з rating=70 та 70 (рівно межа) → включено
  test('FS-06 [BVA+] high_rated: rating=70 та 70 (рівно межа) → включено до результату', () => {
    // Arrange
    const t70a = makeTeam(10, 'T70A', 70);
    const t70b = makeTeam(11, 'T70B', 70);
    const matchBoundary = makeMatch(10, t70a, t70b);
    const svcBVA = new StatsService([matchBoundary]);

    // Act
    const result = svcBVA.filterStats('high_rated');

    // Assert
    expect(result).toHaveLength(1);
  });

  // FS-07 — позитивний / BVA: high_rated з rating=69 та 80 (межа-1) → виключено
  test('FS-07 [BVA+] high_rated: rating=69 та 80 (нижче межі) → порожній масив', () => {
    // Arrange
    const tLow  = makeTeam(20, 'LowTeam',  69);
    const tHigh = makeTeam(21, 'HighTeam', 80);
    const matchBelow = makeMatch(20, tLow, tHigh);
    const svcBVA = new StatsService([matchBelow]);

    // Act
    const result = svcBVA.filterStats('high_rated');

    // Assert
    expect(result).toHaveLength(0);
  });

  // FS-08 — негативний / BVA: criteria='' (порожній рядок — межа) → виняток
  test('FS-08 [BVA-] criteria="" (порожній рядок) → кидає помилку "non-empty string"', () => {
    // Act & Assert
    expect(() => svc.filterStats('')).toThrow('non-empty string');
  });

  // FS-09 — негативний / EP: невідомий критерій → виняток 'Unknown'
  test('FS-09 [EP-] criteria="unknown_filter" → кидає помилку "Unknown"', () => {
    // Act & Assert
    expect(() => svc.filterStats('unknown_filter')).toThrow('Unknown');
  });

  // FS-10 — негативний / BVA: 'sport:' без назви → виняток 'cannot be empty'
  test('FS-10 [BVA-] criteria="sport:" (без назви спорту) → кидає помилку "cannot be empty"', () => {
    // Act & Assert
    expect(() => svc.filterStats('sport:')).toThrow('cannot be empty');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. RecommendationEngine.calculateConfidence
// ═════════════════════════════════════════════════════════════════════════════

describe('RecommendationEngine.calculateConfidence', () => {
  let engine;

  beforeEach(() => {
    engine = new RecommendationEngine([]);
  });

  // CC-01 — позитивний / BVA: diff=0 (межа нуль) → confidence=0.0
  test('CC-01 [BVA+] rating=80 та 80 (diff=0) → confidence=0.0', () => {
    // Arrange
    const match = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 80));

    // Act
    const result = engine.calculateConfidence(match);

    // Assert
    expect(result).toBe(0.0);
  });

  // CC-02 — позитивний / BVA: diff=10 (поріг) → confidence=0.1
  test('CC-02 [BVA+] rating=80 та 70 (diff=10, поріг CONFIDENCE_THRESHOLD) → 0.1', () => {
    // Arrange
    const match = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 70));

    // Act
    const result = engine.calculateConfidence(match);

    // Assert
    expect(result).toBeCloseTo(0.1, 4);
  });

  // CC-03 — позитивний / EP: типова різниця → пропорційне значення
  test('CC-03 [EP+] rating=80 та 65 (diff=15) → confidence=0.15', () => {
    // Arrange
    const match = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 65));

    // Act
    const result = engine.calculateConfidence(match);

    // Assert
    expect(result).toBeCloseTo(0.15, 4);
  });

  // CC-04 — позитивний / BVA: diff=100 (максимум) → clamp до 1.0
  test('CC-04 [BVA+] rating=100 та 0 (diff=100, максимум) → clamp до 1.0', () => {
    // Arrange
    const match = makeMatch(1, makeTeam(1, 'H', 100), makeTeam(2, 'A', 0));

    // Act
    const result = engine.calculateConfidence(match);

    // Assert
    expect(result).toBe(1.0);
  });

  // CC-05 — негативний / EP: match=null → виняток 'non-null object'
  test('CC-05 [EP-] match=null → кидає помилку "non-null object"', () => {
    // Act & Assert
    expect(() => engine.calculateConfidence(null)).toThrow('non-null object');
  });

  // CC-06 — негативний / EP: match без полів команд → виняток 'teamHome and teamAway'
  test('CC-06 [EP-] match без teamHome/teamAway → кидає помилку', () => {
    // Arrange
    const brokenMatch = { matchId: 1, sport: 'football' };

    // Act & Assert
    expect(() => engine.calculateConfidence(brokenMatch)).toThrow('teamHome and teamAway');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. RecommendationEngine.analyzePreferences
// ═════════════════════════════════════════════════════════════════════════════

describe('RecommendationEngine.analyzePreferences', () => {
  let engine;

  beforeEach(() => {
    engine = new RecommendationEngine([]);
  });

  // AP-01 — позитивний / EP: звичайний список → нормалізований lowercase
  test('AP-01 [EP+] ["Football","Basketball"] → ["football","basketball"]', () => {
    // Arrange
    const user = createUser(1, 'user@test.com', ['Football', 'Basketball']);

    // Act
    const result = engine.analyzePreferences(user);

    // Assert
    expect(result).toEqual(['football', 'basketball']);
  });

  // AP-02 — позитивний / EP: рядок з пробілами → trim + lowercase
  test('AP-02 [EP+] [" Tennis "] → ["tennis"] (trim)', () => {
    // Arrange
    const user = createUser(1, 'user@test.com', [' Tennis ']);

    // Act
    const result = engine.analyzePreferences(user);

    // Assert
    expect(result).toEqual(['tennis']);
  });

  // AP-03 — позитивний / BVA: порожній масив (межа 0 елементів) → []
  test('AP-03 [BVA+] preferredSports=[] → повертає порожній масив', () => {
    // Arrange
    const user = createUser(1, 'user@test.com', []);

    // Act
    const result = engine.analyzePreferences(user);

    // Assert
    expect(result).toEqual([]);
  });

  // AP-04 — негативний / EP: user=null → виняток 'non-null object'
  test('AP-04 [EP-] user=null → кидає помилку "non-null object"', () => {
    // Act & Assert
    expect(() => engine.analyzePreferences(null)).toThrow('non-null object');
  });

  // AP-05 — негативний / EP: preferredSports — рядок, а не масив → виняток
  test('AP-05 [EP-] preferredSports="football" (рядок замість масиву) → кидає помилку "must be an array"', () => {
    // Arrange
    const user = { userId: 1, email: 'u@test.com', preferredSports: 'football' };

    // Act & Assert
    expect(() => engine.analyzePreferences(user)).toThrow('must be an array');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. RecommendationEngine.generateRecommendations
// ═════════════════════════════════════════════════════════════════════════════

describe('RecommendationEngine.generateRecommendations', () => {

  // GRec-01 — позитивний / EP: спорт збігається + confidence вище порогу → 1 рекомендація
  test('GRec-01 [EP+] football + diff=15 (0.15 ≥ 0.1) → 1 рекомендація', () => {
    // Arrange
    const match   = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 65), { sport: 'football' });
    const engine  = new RecommendationEngine([match]);
    const user    = createUser(1, 'u@test.com', ['football']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(1);
    expect(recs[0].matchId).toBe(1);
  });

  // GRec-02 — позитивний / EP: уподобання не збігаються зі спортом матчу → []
  test('GRec-02 [EP+] user=[basketball], match.sport=football → порожній масив', () => {
    // Arrange
    const match  = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 65), { sport: 'football' });
    const engine = new RecommendationEngine([match]);
    const user   = createUser(1, 'u@test.com', ['basketball']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(0);
  });

  // GRec-03 — позитивний / BVA: confidence=0.1 (рівно поріг) → рекомендацію включено
  test('GRec-03 [BVA+] diff=10 (confidence=0.1, рівно поріг) → рекомендацію включено', () => {
    // Arrange
    const match  = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 70), { sport: 'football' });
    const engine = new RecommendationEngine([match]);
    const user   = createUser(1, 'u@test.com', ['football']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(1);
    expect(recs[0].confidence).toBeCloseTo(0.1, 4);
  });

  // GRec-04 — позитивний / BVA: confidence=0.09 (нижче порогу) → рекомендацію виключено
  test('GRec-04 [BVA+] diff=9 (confidence=0.09, нижче порогу) → порожній масив', () => {
    // Arrange
    const match  = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 71), { sport: 'football' });
    const engine = new RecommendationEngine([match]);
    const user   = createUser(1, 'u@test.com', ['football']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(0);
  });

  // GRec-05 — позитивний / EP: 3 матчі → відсортовано за confidence (спадання)
  test('GRec-05 [EP+] 3 матчі з diff 30,15,20 → відсортовано: 0.3, 0.2, 0.15', () => {
    // Arrange
    const m1 = makeMatch(1, makeTeam(1,  'H1', 80), makeTeam(2,  'A1', 50), { sport: 'football' }); // diff=30
    const m2 = makeMatch(2, makeTeam(3,  'H2', 80), makeTeam(4,  'A2', 65), { sport: 'football' }); // diff=15
    const m3 = makeMatch(3, makeTeam(5,  'H3', 80), makeTeam(6,  'A3', 60), { sport: 'football' }); // diff=20
    const engine = new RecommendationEngine([m1, m2, m3]);
    const user   = createUser(1, 'u@test.com', ['football']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert — перевіряємо порядок спадання
    expect(recs[0].confidence).toBeGreaterThanOrEqual(recs[1].confidence);
    expect(recs[1].confidence).toBeGreaterThanOrEqual(recs[2].confidence);
    expect(recs[0].confidence).toBeCloseTo(0.3, 4);
    expect(recs[1].confidence).toBeCloseTo(0.2, 4);
    expect(recs[2].confidence).toBeCloseTo(0.15, 4);
  });

  // GRec-06 — негативний / BVA: preferredSports=[] (межа 0) → виняток 'no preferred sports'
  test('GRec-06 [BVA-] preferredSports=[] (порожній) → кидає помилку "no preferred sports"', () => {
    // Arrange
    const engine = new RecommendationEngine([]);
    const user   = createUser(1, 'u@test.com', []);

    // Act & Assert
    expect(() => engine.generateRecommendations(user)).toThrow('no preferred sports');
  });

  // GRec-07 — негативний / EP: user=null → виняток 'non-null object'
  test('GRec-07 [EP-] user=null → кидає помилку "non-null object"', () => {
    // Arrange
    const engine = new RecommendationEngine([]);

    // Act & Assert
    expect(() => engine.generateRecommendations(null)).toThrow('non-null object');
  });

  // GRec-08 — позитивний / BVA: matches=[] (порожній список) → []
  test('GRec-08 [BVA+] matches=[], user з уподобаннями → порожній масив', () => {
    // Arrange
    const engine = new RecommendationEngine([]);
    const user   = createUser(1, 'u@test.com', ['football']);

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(0);
  });

  // GRec-09 — позитивний / EP: case-insensitive зіставлення спорту
  test('GRec-09 [EP+] user=["Football"], match.sport="football" → 1 рекомендація (case-insensitive)', () => {
    // Arrange
    const match  = makeMatch(1, makeTeam(1, 'H', 80), makeTeam(2, 'A', 65), { sport: 'football' });
    const engine = new RecommendationEngine([match]);
    const user   = createUser(1, 'u@test.com', ['Football']); // велика F

    // Act
    const recs = engine.generateRecommendations(user);

    // Assert
    expect(recs).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. createMatch — непокриті негативні гілки (рядки 30, 33, 36)
// ═════════════════════════════════════════════════════════════════════════════

describe('createMatch', () => {
  // CM-01 — негативний / BVA: matchId=0 (межа нуль) → виняток
  test('CM-01 [BVA-] matchId=0 → кидає помилку "positive integer"', () => {
    // Arrange
    const home = makeTeam(1, 'H');
    const away = makeTeam(2, 'A');
    // Act & Assert
    expect(() => createMatch(0, '2024-01-01', home, away)).toThrow('positive integer');
  });

  // CM-02 — негативний / EP: date="" (порожній рядок) → виняток
  test('CM-02 [EP-] date="" → кидає помилку "non-empty string"', () => {
    // Arrange
    const home = makeTeam(1, 'H');
    const away = makeTeam(2, 'A');
    // Act & Assert
    expect(() => createMatch(1, '', home, away)).toThrow('non-empty string');
  });

  // CM-03 — негативний / EP: teamAway=null → виняток
  test('CM-03 [EP-] teamAway=null → кидає помилку "required"', () => {
    // Arrange
    const home = makeTeam(1, 'H');
    // Act & Assert
    expect(() => createMatch(1, '2024-01-01', home, null)).toThrow('required');
  });

  // CM-04 — позитивний / EP: getMatchList повертає копію масиву
  test('CM-04 [EP+] getMatchList повертає всі матчі', () => {
    // Arrange
    const match = makeMatch(1, makeTeam(1, 'H'), makeTeam(2, 'A'));
    const svc   = new StatsService([match]);
    // Act
    const list = svc.getMatchList();
    // Assert
    expect(list).toHaveLength(1);
    expect(list[0].matchId).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. createUser — непокриті негативні гілки (рядки 53, 56)
// ═════════════════════════════════════════════════════════════════════════════

describe('createUser', () => {
  // CU-01 — негативний / BVA: userId=0 (межа нуль) → виняток
  test('CU-01 [BVA-] userId=0 → кидає помилку "positive integer"', () => {
    // Act & Assert
    expect(() => createUser(0, 'u@test.com')).toThrow('positive integer');
  });

  // CU-02 — негативний / EP: email без @ → виняток
  test('CU-02 [EP-] email="notanemail" → кидає помилку "valid email"', () => {
    // Act & Assert
    expect(() => createUser(1, 'notanemail')).toThrow('valid email');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11. RecommendationEngine — непокриті гілки (рядки 176, 187)
// ═════════════════════════════════════════════════════════════════════════════

describe('RecommendationEngine — конструктор та edge cases', () => {
  // RE-01 — негативний / EP: конструктор отримує не масив → виняток
  test('RE-01 [EP-] new RecommendationEngine("string") → кидає помилку "must be an array"', () => {
    // Act & Assert
    expect(() => new RecommendationEngine('not-array')).toThrow('must be an array');
  });

  // RE-02 — негативний / EP: generateRecommendations — preferredSports не масив → виняток
  test('RE-02 [EP-] preferredSports=123 (не масив) → кидає помилку "must be an array"', () => {
    // Arrange
    const engine = new RecommendationEngine([]);
    const user   = { userId: 1, preferredSports: 123 };
    // Act & Assert
    expect(() => engine.generateRecommendations(user)).toThrow('must be an array');
  });

  // RE-03 — позитивний / BVA: confidence=0 (diff=0) → нижче порогу, рекомендацій немає
  test('RE-03 [BVA+] confidence=0 (diff=0) < поріг 0.1 → порожній масив', () => {
    // Arrange
    const match  = makeMatch(1, makeTeam(1, 'H', 50), makeTeam(2, 'A', 50), { sport: 'football' });
    const engine = new RecommendationEngine([match]);
    const user   = createUser(1, 'u@test.com', ['football']);
    // Act
    const recs = engine.generateRecommendations(user);
    // Assert
    expect(recs).toHaveLength(0);
  });
});