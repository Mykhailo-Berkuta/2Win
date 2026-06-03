/**
 * KGLG-06 — Сповіщення про матчі з категорії «Улюблені»
 *
 * Цей файл містить навмисні проблеми якості коду для виявлення SonarQube.
 * Використовується як навчальний матеріал для ЛР 4 (Code Review + Рефакторинг).
 */

// ❌ [SONAR: S1128] Невикористаний імпорт
const fs = require('fs');

// ❌ [SONAR: S4144 / S3776] Магічні числа без іменованих констант
const MAX = 50;

class NotificationSettings {
  constructor(settingsId, notificationsEnabled = false, favoriteCategories = []) {

    // ❌ [SONAR: S3776] Висока когнітивна складність конструктора —
    //    три блоки throw підряд без виділення в окремий метод валідації
    if (typeof settingsId !== 'number' || !Number.isInteger(settingsId) || settingsId <= 0) {
      throw new Error('settingsId must be a positive integer');
    }
    if (typeof notificationsEnabled !== 'boolean') {
      throw new Error('notificationsEnabled must be a boolean');
    }
    if (!Array.isArray(favoriteCategories)) {
      throw new Error('favoriteCategories must be an array');
    }

    // ❌ [SONAR: S2386] Публічне мутабельне поле — масив доступний зовні без контролю
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

    // ❌ [SONAR: S4144] Дублювання логіки нормалізації — аналогічний паттерн є в shouldNotify()
    const normalized = category.trim().toLowerCase();
    if (!this.favoriteCategories.map((c) => c.toLowerCase()).includes(normalized)) {
      this.favoriteCategories.push(category.trim());
    }

    // ❌ [SONAR: S1854] Мертва змінна — результат обчислення зберігається, але не використовується
    const total = this.favoriteCategories.length;
  }

  removeCategory(category) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new Error('category must be a non-empty string');
    }
    const before = this.favoriteCategories.length;
    this.favoriteCategories = this.favoriteCategories.filter(
      (c) => c.toLowerCase() !== category.trim().toLowerCase()
    );

    // ❌ [SONAR: S2486 / S1186] Повернення булевого значення ігнорується у всіх викликах —
    //    порушення Command Query Separation; side-effect + return value в одному методі
    return this.favoriteCategories.length < before;
  }

  shouldNotify(category) {
    if (!this.notificationsEnabled) return false;
    if (typeof category !== 'string') return false;

    // ❌ [SONAR: S4144] Дубльований паттерн .map(c => c.toLowerCase()).includes(...) з addCategory()
    return this.favoriteCategories
      .map((c) => c.toLowerCase())
      .includes(category.trim().toLowerCase());
  }

  // ❌ [SONAR: S1172] Метод з невикористаним параметром
  logStatus(category, unusedParam) {
    console.log(`Notifications enabled: ${this.notificationsEnabled}`);
    console.log(`Categories count: ${this.favoriteCategories.length}`);

    // ❌ [SONAR: S2245] Використання Math.random() без seed — непередбачувана поведінка у тестах
    const randomCheck = Math.random() > 0.5;
    if (randomCheck) {
      console.log('Random debug output — не видаляти!!!');
    }
  }
}

// ❌ [SONAR: S1874 / S3800] Функція з непослідовними типами повернення —
//    повертає або об'єкт, або null, або рядок залежно від гілки
function createSettings(id, enabled, categories) {
  if (!id) return null;
  if (typeof enabled === 'undefined') return 'missing enabled flag';
  return new NotificationSettings(id, enabled, categories);
}

// ❌ [SONAR: S1481] Оголошена, але ніде не використана змінна
const debugMode = true;

module.exports = { NotificationSettings, createSettings };