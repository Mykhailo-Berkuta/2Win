/**
 * KGLG-06 — Сповіщення про матчі з категорії «Улюблені»
 */

class NotificationSettings {
  constructor(settingsId, notificationsEnabled = false, favoriteCategories = []) {
    if (typeof settingsId !== 'number' || !Number.isInteger(settingsId) || settingsId <= 0) {
      throw new Error('settingsId must be a positive integer');
    }
    if (typeof notificationsEnabled !== 'boolean') {
      throw new Error('notificationsEnabled must be a boolean');
    }
    if (!Array.isArray(favoriteCategories)) {
      throw new Error('favoriteCategories must be an array');
    }
    this.settingsId = settingsId;
    this.notificationsEnabled = notificationsEnabled;
    this.favoriteCategories = [...favoriteCategories];
  }

  enable() {
    this.notificationsEnabled = true;
  }

  disable() {
    this.notificationsEnabled = false;
  }

  addCategory(category) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new Error('category must be a non-empty string');
    }
    const normalized = category.trim().toLowerCase();
    if (!this.favoriteCategories.map((c) => c.toLowerCase()).includes(normalized)) {
      this.favoriteCategories.push(category.trim());
    }
  }

  removeCategory(category) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new Error('category must be a non-empty string');
    }
    const before = this.favoriteCategories.length;
    this.favoriteCategories = this.favoriteCategories.filter(
      (c) => c.toLowerCase() !== category.trim().toLowerCase()
    );
    return this.favoriteCategories.length < before;
  }

  shouldNotify(category) {
    if (!this.notificationsEnabled) return false;
    if (typeof category !== 'string') return false;
    return this.favoriteCategories
      .map((c) => c.toLowerCase())
      .includes(category.trim().toLowerCase());
  }
}

module.exports = { NotificationSettings };