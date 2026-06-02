const { Bet, BetStatus, BettingHistoryService } = require('../src/BettingHistoryService');

// ─── Bet constructor ───────────────────────────────────────────────────────────
describe('Bet — constructor', () => {

  test('TC-01: створює Bet з коректними параметрами (EP: позитивний)', () => {
    // Arrange
    const placedAt = new Date('2025-01-15T10:00:00Z');
    // Act
    const bet = new Bet(1, 100, 1.85, placedAt, BetStatus.WIN);
    // Assert
    expect(bet.betId).toBe(1);
    expect(bet.amount).toBe(100);
    expect(bet.odds).toBe(1.85);
    expect(bet.status).toBe(BetStatus.WIN);
  });

  test('TC-02: кидає помилку при від\'ємному amount (EP: негативний)', () => {
    // Arrange
    const placedAt = new Date();
    // Act & Assert
    expect(() => new Bet(1, -1, 1.5, placedAt, BetStatus.WIN))
      .toThrow('amount must be a positive number');
  });

  test('TC-03: кидає помилку при odds < 1.0 (BVA: межа 1.0)', () => {
    // Arrange
    const placedAt = new Date();
    // Act & Assert
    expect(() => new Bet(1, 50, 0.99, placedAt, BetStatus.WIN))
      .toThrow('odds must be >= 1.0');
  });

  test('TC-04: приймає odds рівно 1.0 (BVA: мінімальна межа)', () => {
    // Arrange / Act
    const bet = new Bet(2, 50, 1.0, new Date(), BetStatus.PENDING);
    // Assert
    expect(bet.odds).toBe(1.0);
  });

  test('TC-05: кидає помилку при недопустимому статусі (EP: негативний)', () => {
    // Arrange / Act & Assert
    expect(() => new Bet(1, 50, 1.5, new Date(), 'INVALID'))
      .toThrow(/status must be one of/);
  });

});

// ─── Bet.isWon ─────────────────────────────────────────────────────────────────
describe('Bet.isWon()', () => {

  test('TC-06: повертає true для WIN (EP: позитивний)', () => {
    // Arrange
    const bet = new Bet(1, 100, 2.0, new Date(), BetStatus.WIN);
    // Act & Assert
    expect(bet.isWon()).toBe(true);
  });

  test('TC-07: повертає false для LOSS (EP: негативний)', () => {
    // Arrange
    const bet = new Bet(2, 100, 2.0, new Date(), BetStatus.LOSS);
    // Act & Assert
    expect(bet.isWon()).toBe(false);
  });

  test('TC-08: повертає false для PENDING (EP: негативний)', () => {
    // Arrange
    const bet = new Bet(3, 100, 2.0, new Date(), BetStatus.PENDING);
    // Act & Assert
    expect(bet.isWon()).toBe(false);
  });

});

// ─── Bet.calculatePotentialWin ─────────────────────────────────────────────────
describe('Bet.calculatePotentialWin()', () => {

  test('TC-09: обчислює виграш 200 при amount=100, odds=2.0 (EP: позитивний)', () => {
    // Arrange
    const bet = new Bet(1, 100, 2.0, new Date(), BetStatus.PENDING);
    // Act
    const result = bet.calculatePotentialWin();
    // Assert
    expect(result).toBe(200);
  });

  test('TC-10: округлює до 2 знаків при дробовому результаті (BVA)', () => {
    // Arrange
    const bet = new Bet(1, 10, 1.333, new Date(), BetStatus.PENDING);
    // Act
    const result = bet.calculatePotentialWin();
    // Assert
    expect(result).toBe(13.33);
  });

  test('TC-11: мінімальна ставка amount=0.01, odds=1.0 (BVA: нижня межа)', () => {
    // Arrange
    const bet = new Bet(1, 0.01, 1.0, new Date(), BetStatus.PENDING);
    // Act
    const result = bet.calculatePotentialWin();
    // Assert
    expect(result).toBe(0.01);
  });

});

// ─── BettingHistoryService.getBetsByUser ───────────────────────────────────────
describe('BettingHistoryService.getBetsByUser()', () => {

  const makeBet = (id, status) =>
    new Bet(id, 100, 1.5, new Date('2025-06-01'), status);

  test('TC-12: повертає список ставок для існуючого userId (EP: позитивний)', () => {
    // Arrange
    const bets = [makeBet(1, BetStatus.WIN), makeBet(2, BetStatus.LOSS)];
    const store = new Map([[1, bets]]);
    const service = new BettingHistoryService(store);
    // Act
    const result = service.getBetsByUser(1);
    // Assert
    expect(result).toHaveLength(2);
  });

  test('TC-13: повертає [] для відсутнього userId (EP: порожній клас)', () => {
    // Arrange
    const service = new BettingHistoryService(new Map());
    // Act
    const result = service.getBetsByUser(999);
    // Assert
    expect(result).toEqual([]);
  });

  test('TC-14: кидає помилку при userId = 0 (BVA: межа 0)', () => {
    // Arrange
    const service = new BettingHistoryService();
    // Act & Assert
    expect(() => service.getBetsByUser(0))
      .toThrow('userId must be a positive integer');
  });

  test('TC-15: кидає помилку при нецілому userId (EP: негативний)', () => {
    // Arrange
    const service = new BettingHistoryService();
    // Act & Assert
    expect(() => service.getBetsByUser(1.5))
      .toThrow('userId must be a positive integer');
  });

});

// ─── BettingHistoryService.filterByStatus ─────────────────────────────────────
describe('BettingHistoryService.filterByStatus()', () => {

  const makeService = () => {
    const bets = [
      new Bet(1, 100, 2.0, new Date('2025-01-01'), BetStatus.WIN),
      new Bet(2, 50,  1.5, new Date('2025-02-01'), BetStatus.LOSS),
      new Bet(3, 75,  1.8, new Date('2025-03-01'), BetStatus.PENDING),
    ];
    return new BettingHistoryService(new Map([[1, bets]]));
  };

  test('TC-16: фільтрує тільки WIN ставки (EP: позитивний)', () => {
    // Arrange
    const service = makeService();
    // Act
    const result = service.filterByStatus(1, BetStatus.WIN);
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(BetStatus.WIN);
  });

  test('TC-17: повертає [] якщо немає ставок зі статусом (EP: порожній результат)', () => {
    // Arrange
    const service = new BettingHistoryService(
      new Map([[1, [new Bet(1, 100, 1.5, new Date(), BetStatus.WIN)]]])
    );
    // Act
    const result = service.filterByStatus(1, BetStatus.PENDING);
    // Assert
    expect(result).toEqual([]);
  });

  test('TC-18: кидає помилку при недопустимому статусі (EP: негативний)', () => {
    // Arrange
    const service = makeService();
    // Act & Assert
    expect(() => service.filterByStatus(1, 'UNKNOWN'))
      .toThrow(/Invalid status/);
  });

});

// ─── BettingHistoryService.sortByDate ─────────────────────────────────────────
describe('BettingHistoryService.sortByDate()', () => {

  test('TC-19: сортує від нових до старих (EP: позитивний)', () => {
    // Arrange
    const service = new BettingHistoryService();
    const bets = [
      new Bet(1, 100, 1.5, new Date('2025-01-01'), BetStatus.WIN),
      new Bet(2, 100, 1.5, new Date('2025-06-01'), BetStatus.LOSS),
      new Bet(3, 100, 1.5, new Date('2025-03-01'), BetStatus.PENDING),
    ];
    // Act
    const sorted = service.sortByDate(bets);
    // Assert
    expect(sorted[0].betId).toBe(2); // 2025-06-01 найновіша
    expect(sorted[2].betId).toBe(1); // 2025-01-01 найстаріша
  });

  test('TC-20: не мутує оригінальний масив (EP: позитивний)', () => {
    // Arrange
    const service = new BettingHistoryService();
    const bets = [
      new Bet(1, 100, 1.5, new Date('2025-01-01'), BetStatus.WIN),
      new Bet(2, 100, 1.5, new Date('2025-06-01'), BetStatus.LOSS),
    ];
    const originalFirstId = bets[0].betId;
    // Act
    service.sortByDate(bets);
    // Assert
    expect(bets[0].betId).toBe(originalFirstId);
  });

  test('TC-21: кидає помилку якщо передано не масив (EP: негативний)', () => {
    // Arrange
    const service = new BettingHistoryService();
    // Act & Assert
    expect(() => service.sortByDate(null))
      .toThrow('bets must be an array');
  });

  test('TC-22: повертає [] для порожнього масиву (BVA: 0 елементів)', () => {
    // Arrange
    const service = new BettingHistoryService();
    // Act
    const result = service.sortByDate([]);
    // Assert
    expect(result).toEqual([]);
  });

});