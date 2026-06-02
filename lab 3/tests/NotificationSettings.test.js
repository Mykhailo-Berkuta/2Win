const { NotificationSettings } = require('../src/NotificationSettings');

// ─── constructor ───────────────────────────────────────────────────────────────
describe('NotificationSettings — constructor', () => {

  test('TC-01: створює об\'єкт з коректними параметрами (EP: позитивний)', () => {
    // Arrange / Act
    const settings = new NotificationSettings(1, false, ['football']);
    // Assert
    expect(settings.settingsId).toBe(1);
    expect(settings.notificationsEnabled).toBe(false);
    expect(settings.favoriteCategories).toEqual(['football']);
  });

  test('TC-02: кидає помилку при settingsId = 0 (BVA: межа 0)', () => {
    // Arrange / Act & Assert
    expect(() => new NotificationSettings(0))
      .toThrow('settingsId must be a positive integer');
  });

  test('TC-03: кидає помилку якщо favoriteCategories не масив (EP: негативний)', () => {
    // Arrange / Act & Assert
    expect(() => new NotificationSettings(1, false, 'football'))
      .toThrow('favoriteCategories must be an array');
  });

});

// ─── enable / disable ──────────────────────────────────────────────────────────
describe('NotificationSettings.enable() / disable()', () => {

  test('TC-04: enable() встановлює notificationsEnabled = true (EP: позитивний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, false);
    // Act
    settings.enable();
    // Assert
    expect(settings.notificationsEnabled).toBe(true);
  });

  test('TC-05: disable() встановлює notificationsEnabled = false (EP: позитивний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true);
    // Act
    settings.disable();
    // Assert
    expect(settings.notificationsEnabled).toBe(false);
  });

});

// ─── addCategory ───────────────────────────────────────────────────────────────
describe('NotificationSettings.addCategory()', () => {

  test('TC-06: додає нову категорію (EP: позитивний)', () => {
    // Arrange
    const settings = new NotificationSettings(1);
    // Act
    settings.addCategory('Basketball');
    // Assert
    expect(settings.favoriteCategories).toContain('Basketball');
  });

  test('TC-07: не додає дублікат регістронезалежно (EP: дублікат)', () => {
    // Arrange
    const settings = new NotificationSettings(1, false, ['football']);
    // Act
    settings.addCategory('Football');
    // Assert
    expect(settings.favoriteCategories).toHaveLength(1);
  });

  test('TC-08: кидає помилку при порожньому рядку (BVA: порожній рядок)', () => {
    // Arrange
    const settings = new NotificationSettings(1);
    // Act & Assert
    expect(() => settings.addCategory(' '))
      .toThrow('category must be a non-empty string');
  });

  test('TC-09: кидає помилку при нерядковому значенні (EP: негативний)', () => {
    // Arrange
    const settings = new NotificationSettings(1);
    // Act & Assert
    expect(() => settings.addCategory(null))
      .toThrow('category must be a non-empty string');
  });

});

// ─── removeCategory ────────────────────────────────────────────────────────────
describe('NotificationSettings.removeCategory()', () => {

  test('TC-10: видаляє існуючу категорію та повертає true (EP: позитивний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true, ['football', 'tennis']);
    // Act
    const removed = settings.removeCategory('football');
    // Assert
    expect(removed).toBe(true);
    expect(settings.favoriteCategories).not.toContain('football');
  });

  test('TC-11: повертає false якщо категорія відсутня (EP: негативний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true, ['tennis']);
    // Act
    const removed = settings.removeCategory('basketball');
    // Assert
    expect(removed).toBe(false);
  });

});

// ─── shouldNotify ──────────────────────────────────────────────────────────────
describe('NotificationSettings.shouldNotify()', () => {

  test('TC-12: повертає true коли увімкнено та категорія збігається (EP: позитивний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true, ['football']);
    // Act & Assert
    expect(settings.shouldNotify('football')).toBe(true);
  });

  test('TC-13: повертає false коли сповіщення вимкнені (EP: негативний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, false, ['football']);
    // Act & Assert
    expect(settings.shouldNotify('football')).toBe(false);
  });

  test('TC-14: повертає false коли категорія не в улюблених (EP: негативний)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true, ['tennis']);
    // Act & Assert
    expect(settings.shouldNotify('football')).toBe(false);
  });

  test('TC-15: порівняння регістронезалежне (BVA: варіація регістру)', () => {
    // Arrange
    const settings = new NotificationSettings(1, true, ['Football']);
    // Act & Assert
    expect(settings.shouldNotify('FOOTBALL')).toBe(true);
  });

});